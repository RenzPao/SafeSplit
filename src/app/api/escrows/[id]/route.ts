import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rpc, Contract, scValToNative, xdr } from '@stellar/stellar-sdk';

const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Escrow ID is required' }, { status: 400 });
    }

    // Query database for off-chain metadata (title, description, activity logs)
    const escrow = await prisma.escrow.findUnique({
      where: { id: id },
      include: {
        milestones: {
          orderBy: { milestone_index: 'asc' },
        },
        activity_logs: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found in database' }, { status: 404 });
    }

    // Attempt to query on-chain Soroban state to cross-reference/sync
    let onChainState = null;
    try {
      const server = new rpc.Server(TESTNET_RPC_URL);
      
      const contract = new Contract(escrow.contract_address);
      const ledgerKey = xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: contract.address().toScAddress(),
          key: xdr.ScVal.scvVec([
            xdr.ScVal.scvSymbol('Escrow'),
            xdr.ScVal.scvString(escrow.id)
          ]),
          durability: xdr.ContractDataDurability.persistent()
        })
      );

      const response = await server.getLedgerEntries(ledgerKey);

      if (response && response.entries && response.entries.length > 0) {
        const entry = response.entries[0];
        const val = entry.val;
        
        // Decode the EscrowConfig struct
        interface NativeEscrowConfig {
          client: string;
          freelancer: string;
          total_xlm_stroops: { toString: () => string };
          current_milestone_index: number;
          state: string;
        }
        const nativeConfig = scValToNative(val.contractData().val()) as NativeEscrowConfig;

        
        onChainState = {
          client: nativeConfig.client,
          freelancer: nativeConfig.freelancer,
          totalXlmStroops: nativeConfig.total_xlm_stroops.toString(),
          currentMilestoneIndex: nativeConfig.current_milestone_index,
          state: nativeConfig.state, // e.g. "Initialized" | "Funded" | "InProgress" | "Disputed" | "Completed" | "Cancelled"
        };

        // If the off-chain status doesn't match the on-chain status, update the database!
        if (escrow.status !== onChainState.state) {
          await prisma.escrow.update({
            where: { id: escrow.id },
            data: { status: onChainState.state },
          });
          escrow.status = onChainState.state;
        }
      }
    } catch (rpcErr) {
      console.warn(`Could not sync on-chain state for contract ${address}:`, rpcErr);
    }

    return NextResponse.json({
      success: true,
      escrow,
      onChainState,
    });
  } catch (error: unknown) {
    console.error('Error fetching escrow details:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
