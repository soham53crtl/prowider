import { prisma } from './prisma'

// Mandatory provider rules per service (1-indexed service IDs)
const MANDATORY_PROVIDERS: Record<number, number[]> = {
  1: [1],        // Service 1 → Provider 1 always
  2: [5],        // Service 2 → Provider 5 always
  3: [1, 4],     // Service 3 → Provider 1 AND Provider 4 always
}

// Fair pool providers per service (excluding mandatory ones)
const POOL_PROVIDERS: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8],
}

const TOTAL_ASSIGNMENTS = 3

/**
 * Assigns exactly 3 providers to a lead.
 * Uses database-level locking to handle concurrency safely.
 * Round-robin allocation state persists in DB.
 */
export async function assignProvidersToLead(leadId: number, serviceId: number): Promise<number[]> {
  return await prisma.$transaction(async (tx) => {
    const mandatoryIds = MANDATORY_PROVIDERS[serviceId] ?? []
    const poolIds = POOL_PROVIDERS[serviceId] ?? []

    // Lock and fetch mandatory providers — verify quota
    const mandatoryProviders = await tx.provider.findMany({
      where: { id: { in: mandatoryIds } },
    })

    const assignedIds: number[] = []

    // Assign mandatory providers (only if quota available)
    for (const p of mandatoryProviders) {
      const remaining = p.monthlyQuota - p.leadsReceived
      if (remaining > 0) {
        assignedIds.push(p.id)
      }
    }

    const slotsNeeded = TOTAL_ASSIGNMENTS - assignedIds.length

    if (slotsNeeded > 0 && poolIds.length > 0) {
      // Lock allocation state row for this service (SELECT FOR UPDATE equivalent via raw query)
      const stateResult = await tx.$queryRaw<{ nextIndex: number }[]>`
        SELECT "nextIndex" FROM "AllocationState"
        WHERE "serviceId" = ${serviceId}
        FOR UPDATE
      `

      if (stateResult.length === 0) {
        throw new Error(`AllocationState not found for service ${serviceId}`)
      }

      let currentIndex = stateResult[0].nextIndex

      // Get pool providers with quota remaining, excluding already assigned
      const poolProviders = await tx.provider.findMany({
        where: {
          id: { in: poolIds, notIn: assignedIds },
        },
        orderBy: { id: 'asc' },
      })

      const eligible = poolProviders.filter(
        (p) => p.monthlyQuota - p.leadsReceived > 0
      )

      let filled = 0
      const startIndex = currentIndex
      const tried = new Set<number>()

      while (filled < slotsNeeded && tried.size < eligible.length) {
        const idx = currentIndex % eligible.length
        const provider = eligible[idx]

        if (!tried.has(provider.id)) {
          tried.add(provider.id)
          assignedIds.push(provider.id)
          filled++
        }

        currentIndex++
      }

      // Update allocation index in DB
      const newIndex = startIndex + filled
      await tx.$executeRaw`
        UPDATE "AllocationState"
        SET "nextIndex" = ${newIndex}
        WHERE "serviceId" = ${serviceId}
      `
    }

    // Insert lead assignments and update provider counters
    for (const providerId of assignedIds) {
      await tx.leadAssignment.create({
        data: { leadId, providerId },
      })
      await tx.provider.update({
        where: { id: providerId },
        data: { leadsReceived: { increment: 1 } },
      })
    }

    return assignedIds
  }, {
    isolationLevel: 'Serializable',
    timeout: 10000,
  })
}
