import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const providerId = parseInt(id)
    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider id' }, { status: 400 })
    }

    const body = await req.json()
    const { monthlyQuota } = body

    if (typeof monthlyQuota !== 'number' || monthlyQuota < 0) {
      return NextResponse.json({ error: 'monthlyQuota must be a non-negative number' }, { status: 400 })
    }

    const updated = await prisma.provider.update({
      where: { id: providerId },
      data: { monthlyQuota },
    })

    return NextResponse.json({ success: true, provider: updated })
  } catch (err) {
    console.error('Admin PATCH provider error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action } = body

    if (action !== 'reset') {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const providerId = parseInt(id)
    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider id' }, { status: 400 })
    }

    const updated = await prisma.provider.update({
      where: { id: providerId },
      data: { leadsReceived: 0 },
    })

    return NextResponse.json({ success: true, provider: updated })
  } catch (err) {
    console.error('Admin POST provider reset error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
