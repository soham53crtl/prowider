import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assignProvidersToLead } from '@/lib/allocator'
import { broadcast } from '@/lib/sse'

export async function POST(_req: NextRequest) {
  const services = await prisma.service.findMany()
  const serviceIds = services.map((s) => s.id)

  const timestamp = Date.now()
  const phones = Array.from({ length: 10 }, (_, i) =>
    `TEST${timestamp}${String(i).padStart(3, '0')}`
  )

  // Fire all 10 simultaneously to test concurrency
  const results = await Promise.allSettled(
    phones.map(async (phone, i) => {
      const serviceId = serviceIds[i % serviceIds.length]
      const lead = await prisma.lead.create({
        data: {
          name: `Test User ${i + 1}`,
          phone,
          city: 'Test City',
          serviceId,
          description: `Bulk test lead #${i + 1}`,
        },
      })
      const assignedProviderIds = await assignProvidersToLead(lead.id, serviceId)
      broadcast({ type: 'NEW_LEAD', leadId: lead.id, serviceId, assignedProviderIds })
      return { leadId: lead.id, assignedProviderIds }
    })
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({ succeeded, failed, total: 10 })
}
