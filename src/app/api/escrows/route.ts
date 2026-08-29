import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createHash } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get('user');

    let query = supabase
      .from('Escrow')
      .select(`
        *,
        milestones:Milestone(*),
        activity_logs:ActivityLog(*)
      `)
      .order('created_at', { ascending: false });

    if (userWallet) {
      query = query.or(`client_address.eq.${userWallet},freelancer_address.eq.${userWallet},arbiter_address.eq.${userWallet}`);
    }

    const { data: escrows, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Sort milestones within each escrow
    const sortedEscrows = (escrows || []).map((escrow: any) => {
      if (escrow.milestones) {
        escrow.milestones.sort((a: any, b: any) => a.milestone_index - b.milestone_index);
      }
      return escrow;
    });

    return NextResponse.json({
      success: true,
      escrows: sortedEscrows,
    });
  } catch (error: unknown) {
    console.error('Error fetching escrows:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      contractAddress,
      clientAddress,
      freelancerAddress,
      arbiterAddress,
      totalXlm,
      milestones,
      webhookUrl,
    } = body;

    if (
      !contractAddress ||
      !clientAddress ||
      !freelancerAddress ||
      !totalXlm ||
      !milestones ||
      !Array.isArray(milestones)
    ) {
      return NextResponse.json(
        { error: 'Missing required escrow configuration fields' },
        { status: 400 }
      );
    }

    const resolvedArbiter = arbiterAddress || 'G0000000000000000000000000000000000000000000000000000000';

    // Map and generate SHA-256 description hashes for on-chain parameter parity
    const processedMilestones = milestones.map((m: { title: string; description: string; amountXlm: number | string }, index: number) => {
      const { title: mTitle, description: mDesc, amountXlm: mAmount } = m;
      if (!mTitle || !mDesc || mAmount === undefined) {
        throw new Error(`Milestone at index ${index} is missing details`);
      }

      const textToHash = `${mTitle.trim()}:${mDesc.trim()}:${mAmount}`;
      const descriptionHash = createHash('sha256').update(textToHash).digest('hex');

      return {
        milestone_index: index,
        title: mTitle.trim(),
        description: mDesc.trim(),
        amount_xlm: Number(mAmount),
        descriptionHash,
        status: 'Pending',
      };
    });

    // 1. Insert Escrow into Supabase
    const { data: escrow, error: escrowError } = await supabase
      .from('Escrow')
      .insert({
        title: title ? title.trim() : `Escrow Agreement`,
        contract_address: contractAddress,
        client_address: clientAddress,
        freelancer_address: freelancerAddress,
        arbiter_address: resolvedArbiter,
        total_xlm: Number(totalXlm),
        webhook_url: webhookUrl || null,
        status: 'Initialized',
      })
      .select()
      .single();

    if (escrowError || !escrow) {
      throw new Error(escrowError?.message || 'Failed to create escrow record');
    }

    // 2. Insert Milestones
    const { data: insertedMilestones, error: milestoneError } = await supabase
      .from('Milestone')
      .insert(
        processedMilestones.map((pm) => ({
          escrow_id: escrow.id,
          milestone_index: pm.milestone_index,
          title: pm.title,
          description: pm.description,
          amount_xlm: pm.amount_xlm,
          status: pm.status,
        }))
      )
      .select();

    if (milestoneError) {
      throw new Error(milestoneError.message || 'Failed to create milestones');
    }

    // 3. Create initial activity log
    await supabase.from('ActivityLog').insert({
      escrow_id: escrow.id,
      tx_hash: 'off-chain-init',
      event_name: 'EscrowCreated',
      details: `Escrow metadata initialized for client ${clientAddress} and freelancer ${freelancerAddress}`,
    });

    return NextResponse.json({
      success: true,
      escrow: {
        ...escrow,
        milestones: insertedMilestones,
      },
      descriptionHashes: processedMilestones.map((pm) => ({
        index: pm.milestone_index,
        descriptionHash: pm.descriptionHash,
      })),
    });
  } catch (error: unknown) {
    console.error('Error creating escrow metadata:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
