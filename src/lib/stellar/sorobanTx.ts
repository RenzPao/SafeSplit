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
  signTxHook: (xdr: string, network?: string) => Promise<string>,
  sourceAddress: string,
  operation: any,
  network: 'testnet' | 'mainnet' | string
): Promise<string> {
  const rpcUrl = network === 'testnet' ? TESTNET_RPC_URL : TESTNET_RPC_URL; // Default to testnet rpc
  const networkPassphrase = network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;
  const server = new rpc.Server(rpcUrl);

  // 1. Fetch latest source account sequence number.
  //    getAccount() throws if the account has never been funded — i.e. it has no
  //    ledger entry on testnet. We catch that specific case and surface a friendly
  //    message instead of the raw SDK error.
  let account;
  try {
    account = await server.getAccount(sourceAddress);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isNotFound =
      msg.toLowerCase().includes('account not found') ||
      msg.toLowerCase().includes('not found') ||
      (err as any)?.response?.status === 404;
    if (isNotFound) {
      throw new Error(
        `Your wallet (${sourceAddress.slice(0, 8)}…) has not been funded on Stellar Testnet yet. ` +
        `Please use the Friendbot faucet in the Dev Sandbox section to add 10,000 XLM before attempting any on-chain transactions.`
      );
    }
    throw err;
  }

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
  while ((statusResponse.status as string) === 'NOT_FOUND' && attempts < 15) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    statusResponse = await server.getTransaction(sendResponse.hash);
    attempts++;
  }

  if ((statusResponse.status as string) === 'SUCCESS') {
    return sendResponse.hash;
  } else {
    throw new Error(`Transaction execution status failed: ${statusResponse.status}`);
  }
}
