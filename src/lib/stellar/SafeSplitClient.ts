import { 
  Contract, 
  Address, 
  xdr, 
  Operation, 
  Networks,
  nativeToScVal,
  StrKey
} from '@stellar/stellar-sdk';

export interface MilestoneInput {
  id: number;
  descriptionHash: string; // 32-byte hex string
  amountStroops: bigint;
}

export class SafeSplitClient {
  public contractId: string;
  public contract: Contract | null = null;
  public networkPassphrase: string;
  public isValid: boolean = false;

  constructor(contractId: string, network: 'testnet' | 'mainnet' | string) {
    let resolvedId = contractId ? contractId.trim() : '';
    if (resolvedId && !StrKey.isValidContract(resolvedId)) {
      const cleanHex = resolvedId.replace(/^0x/i, '');
      if (/^[0-9a-fA-F]+$/.test(cleanHex)) {
        const paddedHex = cleanHex.padEnd(64, '0');
        try {
          resolvedId = StrKey.encodeContract(Buffer.from(paddedHex, 'hex'));
        } catch (e) {
          console.error('Failed to encode hex contract ID:', e);
        }
      }
    }
    this.contractId = resolvedId;
    try {
      if (StrKey.isValidContract(resolvedId)) {
        this.contract = new Contract(resolvedId);
        this.isValid = true;
      }
    } catch (err) {
      console.warn('Invalid contract address:', err);
    }
    if (network === 'testnet') {
      this.networkPassphrase = Networks.TESTNET;
    } else if (network === 'mainnet') {
      this.networkPassphrase = Networks.PUBLIC;
    } else {
      this.networkPassphrase = network;
    }
  }

  /**
   * Helper to resolve the Native XLM SAC Contract ID
   */
  public static getNativeXlmContractId(network: 'testnet' | 'mainnet'): string {
    if (network === 'testnet') {
      return 'CDLZFC3SYJYDZT7K67VZ75HPJGWK3S2CB4QPEXOWCH2W7Z26637QD4AO';
    }
    return 'CAS3J7CYN3QR457QCSH3CYMI7ZCE743IMX7SLTGD2CTWJSER733W3GKS';
  }

  /**
   * Converts XLM amount to Stroops
   */
  public static xlmToStroops(xlm: number): bigint {
    return BigInt(Math.round(xlm * 10000000));
  }

  /**
   * Converts Stroops to XLM
   */
  public static stroopsToXlm(stroops: bigint | string): number {
    return Number(stroops) / 10000000;
  }

  /**
   * Builds transaction invocation helper
   */
  private buildInvokeOp(
    sourceAddress: string,
    functionName: string,
    args: xdr.ScVal[]
  ): Operation {
    return Operation.invokeContractFunction({
      contract: this.contractId,
      function: functionName,
      args: args,
      source: sourceAddress
    });
  }

  public createEscrowTx(
    sourceAddress: string,
    escrowId: string,
    params: {
      client: string;
      freelancer: string;
      nativeToken: string;
      milestones: MilestoneInput[];
    }
  ): Operation {
    const scMilestones = params.milestones.map((m) => {
      const hashBuffer = Buffer.from(m.descriptionHash, 'hex');
      if (hashBuffer.length !== 32) {
        throw new Error('Description hash must be exactly 32 bytes (64 hex characters)');
      }
      return nativeToScVal({
        id: m.id,
        description_hash: xdr.ScVal.scvBytes(hashBuffer),
        amount_stroops: m.amountStroops
      });
    });

    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(params.client).toScVal(),
      new Address(params.freelancer).toScVal(),
      new Address(params.nativeToken).toScVal(),
      xdr.ScVal.scvVec(scMilestones)
    ];

    return this.buildInvokeOp(sourceAddress, 'initialize', args);
  }

  /**
   * 2. deposit_xlm
   */
  public depositXlmTx(sourceAddress: string, escrowId: string, clientAddress: string): Operation {
    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(clientAddress).toScVal()
    ];
    return this.buildInvokeOp(sourceAddress, 'deposit_xlm', args);
  }

  /**
   * 3. submit_milestone
   */
  public submitWorkTx(
    sourceAddress: string,
    escrowId: string,
    params: {
      freelancer: string;
      milestoneId: number;
      submissionRef: string; // IPFS CID
    }
  ): Operation {
    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(params.freelancer).toScVal(),
      nativeToScVal(params.milestoneId, { type: 'u32' }),
      nativeToScVal(params.submissionRef, { type: 'string' })
    ];
    return this.buildInvokeOp(sourceAddress, 'submit_milestone', args);
  }

  /**
   * 4. approve_milestone
   */
  public approveMilestoneTx(
    sourceAddress: string,
    escrowId: string,
    params: {
      client: string;
      milestoneId: number;
    }
  ): Operation {
    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(params.client).toScVal(),
      nativeToScVal(params.milestoneId, { type: 'u32' })
    ];
    return this.buildInvokeOp(sourceAddress, 'approve_milestone', args);
  }

  /**
   * 5. raise_dispute
   */
  public raiseDisputeTx(
    sourceAddress: string,
    escrowId: string,
    params: {
      caller: string;
      milestoneId: number;
      reasonHash: string; // 32-byte hex string
    }
  ): Operation {
    const hashBuffer = Buffer.from(params.reasonHash, 'hex');
    if (hashBuffer.length !== 32) {
      throw new Error('Reason hash must be exactly 32 bytes (64 hex characters)');
    }

    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(params.caller).toScVal(),
      nativeToScVal(params.milestoneId, { type: 'u32' }),
      xdr.ScVal.scvBytes(hashBuffer)
    ];
    return this.buildInvokeOp(sourceAddress, 'raise_dispute', args);
  }

  /**
   * 6. propose_settlement & accept_settlement
   */
  public proposeSettlementTx(
    sourceAddress: string,
    escrowId: string,
    params: {
      proposer: string;
      milestoneId: number;
      clientSplitBps: number; // 0 to 10000
    }
  ): Operation {
    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(params.proposer).toScVal(),
      nativeToScVal(params.milestoneId, { type: 'u32' }),
      nativeToScVal(params.clientSplitBps, { type: 'u32' })
    ];
    return this.buildInvokeOp(sourceAddress, 'propose_settlement', args);
  }

  public acceptSettlementTx(
    sourceAddress: string,
    escrowId: string,
    params: {
      accepter: string;
      milestoneId: number;
    }
  ): Operation {
    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(params.accepter).toScVal(),
      nativeToScVal(params.milestoneId, { type: 'u32' })
    ];
    return this.buildInvokeOp(sourceAddress, 'accept_settlement', args);
  }

  /**
   * 7. cancel_and_refund
   */
  public cancelAndRefundTx(sourceAddress: string, escrowId: string, clientAddress: string): Operation {
    const args = [
      xdr.ScVal.scvString(escrowId),
      new Address(clientAddress).toScVal()
    ];
    return this.buildInvokeOp(sourceAddress, 'cancel_and_refund', args);
  }

  /**
   * 8. upgrade contract WASM
   */
  public upgradeTx(
    sourceAddress: string,
    params: {
      newWasmHash: string; // 32-byte hex string
    }
  ): Operation {
    const hashBuffer = Buffer.from(params.newWasmHash.replace(/^0x/i, ''), 'hex');
    if (hashBuffer.length !== 32) {
      throw new Error('WASM hash must be exactly 32 bytes (64 hex characters)');
    }

    const args = [
      xdr.ScVal.scvBytes(hashBuffer)
    ];
    return this.buildInvokeOp(sourceAddress, 'upgrade', args);
  }
}
