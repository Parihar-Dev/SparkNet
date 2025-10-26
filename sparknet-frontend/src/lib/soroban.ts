// src/lib/soroban.ts

import Server, { scValToNative, nativeToScVal, Networks } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from './constants';

// Initialize the Soroban RPC server
const server = new Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith('http://'),
});

/**
 * Simulates and reads data from a read-only contract function.
 * @param method The contract function name
 * @param args The array of arguments to pass
 */
export const readContract = async (method: string, args: any[] = []) => {
  try {
    // Convert JS native values to Soroban ScVal
    const scValArgs = args.map((arg) => nativeToScVal(arg));

    // Simulate the transaction
    const simulation = await server.simulateTransaction({
      source: CONTRACT_ID,
      contractId: CONTRACT_ID,
      method,
      args: scValArgs,
    });

    if (simulation.result) {
      return scValToNative(simulation.result.retval);
    } else if (simulation.error) {
      throw new Error(`Simulation error: ${simulation.error}`);
    } else {
      throw new Error('Simulation failed with no result or error');
    }
  } catch (e: any) {
    console.error(`Error reading contract (${method}):`, e);
    throw new Error(e.message || 'Failed to read contract');
  }
};

/**
 * Signs and submits a transaction to a writable contract function.
 * @param method The contract function name
 * @param args Array of arguments
 * @param publicKey The user's public key signing the transaction
 */
export const writeContract = async (
  method: string,
  args: any[],
  publicKey: string
) => {
  try {
    const scValArgs = args.map((arg) => nativeToScVal(arg));

    // Simulate the transaction to get XDR
    const simulation = await server.simulateTransaction({
      source: publicKey,
      contractId: CONTRACT_ID,
      method,
      args: scValArgs,
    });

    if (!simulation.xdr) {
      throw new Error(simulation.error || 'Simulation failed to produce XDR.');
    }

    // Sign the transaction using Freighter
    const signedXdr = await signTransaction(simulation.xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });

    // Submit the signed transaction
    const sendResult = await server.sendTransaction(signedXdr);

    if (sendResult.status === 'ERROR' || sendResult.status === 'REJECTED') {
      throw new Error(sendResult.error || 'Transaction was rejected.');
    }

    // Poll for transaction completion
    let txResult = await server.getTransaction(sendResult.hash);
    const startTime = Date.now();
    while (txResult.status === 'PENDING' && Date.now() - startTime < 15000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      txResult = await server.getTransaction(sendResult.hash);
    }

    if (txResult.status !== 'SUCCESS') {
      throw new Error(txResult.error || 'Transaction failed or timed out.');
    }

    return txResult.result
      ? scValToNative(txResult.result.retval)
      : 'Success (no return value)';
  } catch (e: any) {
    console.error(`Error writing contract (${method}):`, e);
    throw new Error(e.message || 'Failed to write contract');
  }
};
