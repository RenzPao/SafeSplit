import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'wallet query param is required' }, { status: 400 });
  }

  try {
    // Fetch all escrows where the wallet is a participant in any role
    const escrows = await prisma.escrow.findMany({
      where: {
        OR: [
          { client_address: wallet },
          { freelancer_address: wallet },
          { arbiter_address: wallet },
        ],
      },
      include: {
        milestones: { orderBy: { milestone_index: 'asc' } },
        activity_logs: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { created_at: 'desc' },
    });

    // Collect all unique participant addresses to batch-resolve names
    const addressSet = new Set<string>();
    for (const e of escrows) {
      addressSet.add(e.client_address);
      addressSet.add(e.freelancer_address);
      if (e.arbiter_address) addressSet.add(e.arbiter_address);
    }
    const addresses = Array.from(addressSet).filter(Boolean);

    const users = await prisma.user.findMany({
      where: { wallet_address: { in: addresses } },
      select: { wallet_address: true, name: true },
    });
    const nameMap = new Map(users.map((u) => [u.wallet_address, u.name]));

    const enrichedEscrows = escrows.map((escrow) => {
      const milestoneMap = new Map(
        escrow.milestones.map((m) => [m.milestone_index, m.title])
      );

      // Determine the caller's role in this escrow
      let userRole: 'client' | 'freelancer' | 'arbiter' | 'observer' = 'observer';
      if (escrow.client_address === wallet) userRole = 'client';
      else if (escrow.freelancer_address === wallet) userRole = 'freelancer';
      else if (escrow.arbiter_address === wallet) userRole = 'arbiter';

      // Enrich each activity log entry
      const transactions = escrow.activity_logs.map((log) => {
        // Extract milestone index from details string (1-based in logs)
        let milestoneTitle: string | null = null;
        const milestoneMatch = log.details?.match(/milestone\s+(\d+)/i);
        if (milestoneMatch) {
          const idx = parseInt(milestoneMatch[1], 10) - 1;
          milestoneTitle = milestoneMap.get(idx) ?? null;
        }

        // Extract XLM amount from details string
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
        milestones: escrow.milestones.map((m) => ({
          index: m.milestone_index,
          title: m.title,
          status: m.status,
          amount_xlm: Number(m.amount_xlm),
        })),
        transactions,
      };
    });

    // Compute summary
    const totalTransactions = enrichedEscrows.reduce(
      (sum, e) => sum + e.transactions.length,
      0
    );
    const totalVolume = enrichedEscrows.reduce((sum, e) => sum + e.total_xlm, 0);
    const completedEscrows = enrichedEscrows.filter(
      (e) => e.status === 'Completed'
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
