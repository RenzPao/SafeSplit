import { supabase } from '../supabaseClient';
import { rpc, Contract, scValToNative, xdr } from '@stellar/stellar-sdk';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface MilestoneMetadataInput {
  title: string;
  description: string;
  amountXlm: number;
}

export interface EscrowMetadataInput {
  contractAddress: string;
  clientAddress: string;
  freelancerAddress: string;
  arbiterAddress: string;
  totalXlm: number;
  milestones: MilestoneMetadataInput[];
}

export async function createEscrowMetadata(input: EscrowMetadataInput) {
  // 1. Process milestones and generate hashes
  const processedMilestones = [];
  for (let i = 0; i < input.milestones.length; i++) {
    const m = input.milestones[i];
    const textToHash = `${m.title.trim()}:${m.description.trim()}:${m.amountXlm}`;
    const descriptionHash = await sha256(textToHash);
    processedMilestones.push({
      milestone_index: i,
      title: m.title.trim(),
      description: m.description.trim(),
      amount_xlm: m.amountXlm,
      status: 'Pending',
      descriptionHash,
    });
  }

  // 2. Insert Escrow to Supabase
  const { data: escrow, error: escrowError } = await supabase
    .from('Escrow')
    .insert({
      contract_address: input.contractAddress,
      client_address: input.clientAddress,
      freelancer_address: input.freelancerAddress,
      arbiter_address: input.arbiterAddress,
      total_xlm: input.totalXlm,
      status: 'Initialized',
    })
    .select()
    .single();

  if (escrowError || !escrow) {
    throw new Error(escrowError?.message || 'Failed to create escrow record');
  }

  // 3. Insert Milestones to Supabase
  const { error: milestoneError } = await supabase
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
    );

  if (milestoneError) {
    throw new Error(milestoneError.message || 'Failed to create milestones');
  }

  // 4. Create initial activity log
  await supabase.from('ActivityLog').insert({
    escrow_id: escrow.id,
    tx_hash: 'off-chain-init',
    event_name: 'EscrowCreated',
    details: `Escrow metadata initialized for client ${input.clientAddress} and freelancer ${input.freelancerAddress}`,
  });

  return {
    escrow,
    descriptionHashes: processedMilestones.map((pm) => ({
      index: pm.milestone_index,
      descriptionHash: pm.descriptionHash,
    })),
  };
}

export async function fetchEscrowMetadata(contractAddress: string) {
  // 1. Get from Supabase
  const { data: escrow, error: escrowError } = await supabase
    .from('Escrow')
    .select(`
      *,
      milestones:Milestone(*),
      activity_logs:ActivityLog(*)
    `)
    .eq('contract_address', contractAddress)
    .single();

  if (escrowError || !escrow) {
    throw new Error(escrowError?.message || 'Escrow not found');
  }

  // Sort milestones & logs
  escrow.milestones = (escrow.milestones || []).sort((a: any, b: any) => a.milestone_index - b.milestone_index);
  escrow.activity_logs = (escrow.activity_logs || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 2. Sync with on-chain status
  let onChainState = null;
  try {
    const server = new rpc.Server('https://soroban-testnet.stellar.org');
    const contract = new Contract(contractAddress);
    const ledgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: contract.address().toScAddress(),
        key: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Config')]),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );

    const response = await server.getLedgerEntries(ledgerKey);

    if (response && response.entries && response.entries.length > 0) {
      const entry = response.entries[0];
      const val = entry.val;
      const nativeConfig: any = scValToNative(val.contractData().val());

      onChainState = {
        client: nativeConfig.client,
        freelancer: nativeConfig.freelancer,
        arbiter: nativeConfig.arbiter,
        totalXlmStroops: nativeConfig.total_xlm_stroops.toString(),
        currentMilestoneIndex: nativeConfig.current_milestone_index,
        arbiterFeeBps: nativeConfig.arbiter_fee_bps,
        state: nativeConfig.state,
      };

      // Sync state if mismatched
      if (escrow.status !== onChainState.state) {
        await supabase
          .from('Escrow')
          .update({ status: onChainState.state })
          .eq('id', escrow.id);
        escrow.status = onChainState.state;
      }
    }
  } catch (rpcErr) {
    console.warn('Stellar RPC Sync failed (offline/testnet down):', rpcErr);
  }

  return {
    escrow,
    onChainState,
  };
}

export async function uploadDeliverableFile(file: File): Promise<{ cid: string; url: string }> {
  // Deterministic CID generation simulation
  const fileArrayBuffer = await file.arrayBuffer();
  const fileHashBuffer = await crypto.subtle.digest('SHA-256', fileArrayBuffer);
  const hashArray = Array.from(new Uint8Array(fileHashBuffer));
  const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const mockCid = `Qm${fileHash.substring(0, 44)}`;

  // Upload to Supabase Storage Bucket 'deliverables'
  const fileExtension = file.name.split('.').pop();
  const fileName = `${mockCid}.${fileExtension}`;
  
  const { error } = await supabase.storage
    .from('deliverables')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(error.message || 'Supabase Storage upload failed');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('deliverables')
    .getPublicUrl(fileName);

  return {
    cid: mockCid,
    url: publicUrl,
  };
}

export async function updateMilestoneStatus(
  escrowId: string,
  milestoneIndex: number,
  params: {
    status: 'Pending' | 'Submitted' | 'Approved' | 'Disputed' | 'Refunded';
    deliverableUrl?: string | null;
    submissionCid?: string | null;
    txHash: string;
    eventName: string;
    details: string;
  }
) {
  // 1. Update Milestone Status
  const { error: milestoneErr } = await supabase
    .from('Milestone')
    .update({
      status: params.status,
      deliverable_url: params.deliverableUrl,
      submission_cid: params.submissionCid,
    })
    .eq('escrow_id', escrowId)
    .eq('milestone_index', milestoneIndex);

  if (milestoneErr) {
    throw new Error(milestoneErr.message);
  }

  // 2. Create Activity Log
  const { error: logErr } = await supabase
    .from('ActivityLog')
    .insert({
      escrow_id: escrowId,
      tx_hash: params.txHash,
      event_name: params.eventName,
      details: params.details,
    });

  if (logErr) {
    throw new Error(logErr.message);
  }
}
