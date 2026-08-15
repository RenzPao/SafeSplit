import { 
  rpc, 
  Transaction,
  TransactionBuilder, 
  TimeoutInfinite,
  Networks
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';

/**
 * Builds, simulates, requests Freighter signature, and submits a Soroban transaction.
 * @returns The final transaction hash on-chain
 */
export async function buildAndSubmitSorobanTx(
  sourceAddress: string,
  operation: any,
  network: 'testnet' | 'mainnet' | string
): Promise<string> {
  const rpcUrl = network === 'testnet' ? TESTNET_RPC_URL : TESTNET_RPC_URL; // Default to testnet rpc
  const networkPassphrase = network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
  const server = new rpc.Server(rpcUrl);

  // 1. Fetch latest source account sequence number
  const account = await server.getAccount(sourceAddress);

  // 2. Build initial transaction envelope
  let tx = new TransactionBuilder(account, {
    fee: '100000', // Base fee to be simulated
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(TimeoutInfinite)
    .build();

  // 3. Simulate and prepare the transaction (required for Soroban footprint/CPU/memory fees)
  tx = await server.prepareTransaction(tx);

  // 4. Request Freighter signing (returns signed transaction envelope XDR)
  const signedResult = await signTransaction(tx.toXDR(), {
    networkPassphrase
  });

  if (!signedResult || !signedResult.signedTxXdr) {
    throw new Error('Transaction signature rejected by user.');
  }

  // 5. Parse the signed transaction envelope
  const signedTx = new Transaction(signedResult.signedTxXdr, networkPassphrase);

  // 6. Submit the signed transaction envelope to the ledger
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === 'ERROR') {
    throw new Error(`Transaction submission error: ${sendResponse.errorResult || 'Unknown Error'}`);
  }

  // 7. Poll status until final result
  let statusResponse = await server.getTransaction(sendResponse.hash);
  let attempts = 0;
  while ((statusResponse.status as string) === 'PENDING' && attempts < 10) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    statusResponse = await server.getTransaction(sendResponse.hash);
    attempts++;
  }

  if ((statusResponse.status as string) === 'SUCCESS') {
    return sendResponse.hash;
  } else {
    throw new Error(`Transaction execution status failed: ${statusResponse.status}`);
  }
}
