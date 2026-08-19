import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet query param is required' }, { status: 400 });
  }

  try {
    // Fetch all escrows where the wallet is a participant (client, freelancer, or arbiter)
    // We join milestones and activity_logs directly via Supabase select
    const { data: escrows, error: escrowsError } = await supabase
      .from('Escrow')
      .select(`
        *,
        milestones:Milestone(*),
        activity_logs:ActivityLog(*)
      `)
      .or(`client_address.eq.${wallet},freelancer_address.eq.${wallet},arbiter_address.eq.${wallet}`)
      .order('created_at', { ascending: false });

    if (escrowsError) {
      throw new Error(escrowsError.message);
    }

    if (!escrows) {
      return NextResponse.json({
        escrows: [],
        summary: {
          totalEscrows: 0,
          totalVolume: 0,
          totalTransactions: 0,
          completedEscrows: 0,
        },
      });
    }

    // Collect all unique participant addresses to batch-resolve display names
    const addressSet = new Set<string>();
    for (const e of escrows) {
      addressSet.add(e.client_address);
      addressSet.add(e.freelancer_address);
      if (e.arbiter_address) addressSet.add(e.arbiter_address);
    }
    const addresses = Array.from(addressSet).filter(Boolean);

    // Fetch user display names in one query
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('wallet_address, name')
      .in('wallet_address', addresses);

    if (usersError) {
      console.warn('Could not resolve display names:', usersError.message);
    }

    const nameMap = new Map((users || []).map((u: any) => [u.wallet_address, u.name]));

    const enrichedEscrows = escrows.map((escrow: any) => {
      // Sort milestones by milestone_index ascending
      const sortedMilestones = (escrow.milestones || []).sort(
        (a: any, b: any) => a.milestone_index - b.milestone_index
      );

      // Sort activity logs by timestamp descending
      const sortedLogs = (escrow.activity_logs || []).sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const milestoneMap = new Map<number, string>(
        sortedMilestones.map((m: any) => [Number(m.milestone_index), String(m.title)])
      );

      // Determine caller's role
      let userRole: 'client' | 'freelancer' | 'arbiter' | 'observer' = 'observer';
      if (escrow.client_address.toLowerCase() === wallet.toLowerCase()) userRole = 'client';
      else if (escrow.freelancer_address.toLowerCase() === wallet.toLowerCase()) userRole = 'freelancer';
      else if (escrow.arbiter_address && escrow.arbiter_address.toLowerCase() === wallet.toLowerCase()) userRole = 'arbiter';

      // Enrich logs
      const transactions = sortedLogs.map((log: any) => {
        let milestoneTitle: string | null = null;
        const milestoneMatch = log.details?.match(/milestone\s+(\d+)/i);
        if (milestoneMatch) {
          const idx = parseInt(milestoneMatch[1], 10) - 1;
          milestoneTitle = milestoneMap.get(idx) ?? null;
        }

        let amountXlm: number | null = null;
        const xlmMatch = log.details?.match(/([\d.]+)\s*XLM/i);
        if (xlmMatch) amountXlm = parseFloat(xlmMatch[1]);

        return {
          id: log.id,
          timestamp: log.timestamp,
          event_name: log.event_name,
          tx_hash: log.tx_hash,
          details: log.details ?? '',
          milestone_title: milestoneTitle,
          amount_xlm: amountXlm,
        };
      });

      const isNullArbiter =
        !escrow.arbiter_address ||
        escrow.arbiter_address === 'G0000000000000000000000000000000000000000000000000000000';

      return {
        id: escrow.id,
        title: escrow.title ?? `Escrow ${escrow.id.slice(0, 8)}`,
        contract_address: escrow.contract_address,
        status: escrow.status,
        total_xlm: Number(escrow.total_xlm),
        created_at: escrow.created_at,
        userRole,
        parties: {
          client: {
            address: escrow.client_address,
            name: nameMap.get(escrow.client_address) ?? 'Unknown',
          },
          freelancer: {
            address: escrow.freelancer_address,
            name: nameMap.get(escrow.freelancer_address) ?? 'Unknown',
          },
          arbiter: isNullArbiter
            ? null
            : {
                address: escrow.arbiter_address!,
                name: nameMap.get(escrow.arbiter_address!) ?? 'Unknown',
              },
        },
        milestones: sortedMilestones.map((m: any) => ({
          index: m.milestone_index,
          title: m.title,
          status: m.status,
          amount_xlm: Number(m.amount_xlm),
        })),
        transactions,
      };
    });

    const totalTransactions = enrichedEscrows.reduce(
      (sum, e) => sum + e.transactions.length,
      0
    );
    const totalVolume = enrichedEscrows.reduce((sum, e) => sum + e.total_xlm, 0);
    const completedEscrows = enrichedEscrows.filter(
      (e: any) => e.status === 'Completed'
    ).length;

    return NextResponse.json({
      escrows: enrichedEscrows,
      summary: {
        totalEscrows: enrichedEscrows.length,
        totalVolume,
        totalTransactions,
        completedEscrows,
      },
    });
  } catch (err) {
    console.error('[API /history] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

