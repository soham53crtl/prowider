import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assignProvidersToLead } from '@/lib/allocator'
import { broadcast } from '@/lib/sse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, city, serviceId, description } = body

    if (!name || !phone || !city || !serviceId || !description) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const sid = parseInt(serviceId)

    // Duplicate check: same phone + same service
    const existing = await prisma.lead.findUnique({
      where: { phone_serviceId: { phone, serviceId: sid } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A lead with this phone number for this service already exists.' },
        { status: 409 }
      )
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: { name, phone, city, serviceId: sid, description },
    })

    // Assign providers (handles concurrency internally)
    const assignedProviderIds = await assignProvidersToLead(lead.id, sid)

    // Broadcast SSE event for real-time dashboard
    broadcast({ type: 'NEW_LEAD', leadId: lead.id, serviceId: sid, assignedProviderIds })

    return NextResponse.json({ success: true, leadId: lead.id, assignedProviderIds })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Duplicate lead: same phone and service already submitted.' },
        { status: 409 }
      )
    }
    console.error('Lead creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
