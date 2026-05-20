import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { id: 'asc' },
      include: {
        leadAssignments: {
          include: {
            lead: {
              include: { service: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const data = providers.map((p) => ({
      id: p.id,
      name: p.name,
      monthlyQuota: p.monthlyQuota,
      leadsReceived: p.leadsReceived,
      remainingQuota: p.monthlyQuota - p.leadsReceived,
      leads: p.leadAssignments.map((a) => ({
        id: a.lead.id,
        name: a.lead.name,
        phone: a.lead.phone,
        city: a.lead.city,
        service: a.lead.service.name,
        description: a.lead.description,
        createdAt: a.lead.createdAt,
      })),
    }))

    return NextResponse.json(data)
  } catch (err) {
    console.error('Dashboard error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
