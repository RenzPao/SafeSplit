import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const freelancerAddress = searchParams.get('freelancer');

    if (!freelancerAddress) {
      return NextResponse.json({ error: 'Freelancer address is required' }, { status: 400 });
    }

    const { data: invitations, error } = await supabase
      .from('Escrow')
      .select('*, milestones:Milestone(*)')
      .eq('freelancer_address', freelancerAddress)
      .eq('status', 'Initialized')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, invitations: invitations || [] });
  } catch (error: unknown) {
    console.error('Error fetching invitations:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
