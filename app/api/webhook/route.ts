import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { broadcast } from '@/lib/sse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, action } = body

    if (!eventId || action !== 'reset_quota') {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    // Idempotency: check if this eventId was already processed
    const existing = await prisma.webhookEvent.findUnique({
      where: { id: eventId },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Already processed (idempotent)',
        alreadyProcessed: true,
      })
    }

    // Process: reset all providers' quota back to 10 and clear leadsReceived
    await prisma.$transaction(async (tx) => {
      // Record the webhook event FIRST (idempotency lock)
      await tx.webhookEvent.create({ data: { id: eventId } })

      // Reset all providers
      await tx.provider.updateMany({
        data: { monthlyQuota: 10, leadsReceived: 0 },
      })

      // Reset allocation state indices
      await tx.allocationState.updateMany({
        data: { nextIndex: 0 },
      })
    })

    broadcast({ type: 'QUOTA_RESET' })

    return NextResponse.json({ success: true, message: 'Quota reset for all providers' })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    // Unique constraint on webhookEvent.id = duplicate webhook, idempotent
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: true,
        message: 'Already processed (idempotent)',
        alreadyProcessed: true,
      })
    }
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
