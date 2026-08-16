import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const freelancerAddress = searchParams.get('freelancer');

    if (!freelancerAddress) {
      return NextResponse.json({ error: 'Freelancer address is required' }, { status: 400 });
    }

    const invitations = await prisma.escrow.findMany({
      where: { 
        freelancer_address: freelancerAddress,
        status: 'Initialized'
      },
      include: {
        milestones: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ success: true, invitations });
  } catch (error: unknown) {
    console.error('Error fetching invitations:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
