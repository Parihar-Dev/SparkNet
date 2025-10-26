import {
  SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  Operation,
  scValToNative,
  nativeToScVal,
  Keypair,
  Account,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "./constants";

const server = new SorobanRpc.Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith("http://"),
});

export const readContract = async (method, args = []) => {
  try {
    // Convert native JS args to Soroban ScVals
    const scArgs = args.map((a) => nativeToScVal(a));

    // Create a fake account for simulation
    const tempAccount = new Account(Keypair.random().publicKey(), "0");

    // Build the transaction
    const tx = new TransactionBuilder(tempAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: method,
          args: scArgs,
        })
      )
      .setTimeout(30)
      .build();

    // Simulate the transaction
    const sim = await server.simulateTransaction(tx);

    if (!sim) throw new Error("Simulation failed: no response from server");

    // Extract the return value if available
    if (sim.result && sim.result.retval) {
      return scValToNative(sim.result.retval);
    } else {
      console.warn("Simulation response:", sim);
      throw new Error("No retval found in simulation result");
    }
  } catch (e) {
    console.error("readContract failed:", e);
    throw e;
  }
};

export async function writeContract(method, args = [], publicKey) {
  try {
    const scArgs = toScArgs(args);

    // Fake account for simulation (sequence '0')
    const simAccount = new Account(publicKey, '0');

    const rawTx = new TransactionBuilder(simAccount, { fee: BASE_FEE })
      .setNetworkPassphrase(NETWORK_PASSPHRASE)
      .setTimeout(120)
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT_ID,
          function: method,
          args: scArgs,
        })
      )
      .build();

    const simulation = await server.simulateTransaction(rawTx);

    if (simulation.type === 'error') {
      throw new Error(`simulateTransaction error: ${JSON.stringify(simulation)}`);
    }

    if (simulation.type !== 'success') {
      throw new Error(`simulateTransaction unexpected type: ${simulation.type}`);
    }

    // IMPORTANT: use the SDK helper to assemble the real tx using simulation metadata
    // This will update fee, sorobanData (footprint), and auth entries.
    // The helper lives in the SDK's rpc/transaction module (assembleTransaction).
    // It is exposed on the rpc module, so call rpc.assembleTransaction(rawTx, simulation).
    const assembledBuilder = rpc.assembleTransaction(rawTx, simulation);
    const assembledTx = assembledBuilder.build();
    const unsignedXdr = assembledTx.toXDR('base64');

    // Ask Freighter to sign the XDR (Freighter signs the top-level tx XDR)
    const signedXdr = await signTransaction(unsignedXdr, { networkPassphrase: NETWORK_PASSPHRASE });

    // Send signed XDR to Soroban RPC
    const sendResult = await server.sendTransaction(signedXdr);

    if (!sendResult) {
      throw new Error('sendTransaction returned empty result');
    }

    if (sendResult.status === 'ERROR' || sendResult.status === 'REJECTED') {
      throw new Error(`sendTransaction failed: ${JSON.stringify(sendResult)}`);
    }

    // Poll for final status
    let txResult = await server.getTransaction(sendResult.hash);
    const start = Date.now();
    while (txResult.status === 'PENDING' && Date.now() - start < 30_000) {
      await new Promise((r) => setTimeout(r, 1000));
      txResult = await server.getTransaction(sendResult.hash);
    }

    if (txResult.status !== 'SUCCESS') {
      throw new Error(`Transaction failed or timed out: ${JSON.stringify(txResult)}`);
    }

    return txResult.result && txResult.result.retval ? scValToNative(txResult.result.retval) : null;
  } catch (err) {
    console.error('writeContract failed:', err);
    throw err;
  }
}

/**
 * Same as writeContract but targeting the TOKEN contract (e.g. approve)
 */
export async function writeTokenContract(method, args = [], publicKey) {
  try {
    const scArgs = toScArgs(args);

    const simAccount = new Account(publicKey, '0');

    const rawTx = new TransactionBuilder(simAccount, { fee: BASE_FEE })
      .setNetworkPassphrase(NETWORK_PASSPHRASE)
      .setTimeout(120)
      .addOperation(
        Operation.invokeContractFunction({
          contract: TOKEN_ID,
          function: method,
          args: scArgs,
        })
      )
      .build();

    const simulation = await server.simulateTransaction(rawTx);

    if (simulation.type === 'error') {
      throw new Error(`simulateTransaction error: ${JSON.stringify(simulation)}`);
    }
    if (simulation.type !== 'success') {
      throw new Error(`simulateTransaction unexpected type: ${simulation.type}`);
    }

    const assembledBuilder = rpc.assembleTransaction(rawTx, simulation);
    const assembledTx = assembledBuilder.build();
    const unsignedXdr = assembledTx.toXDR('base64');

    const signedXdr = await signTransaction(unsignedXdr, { networkPassphrase: NETWORK_PASSPHRASE });
    const sendResult = await server.sendTransaction(signedXdr);

    if (sendResult.status === 'ERROR' || sendResult.status === 'REJECTED') {
      throw new Error(`sendTransaction failed: ${JSON.stringify(sendResult)}`);
    }

    let txResult = await server.getTransaction(sendResult.hash);
    const start = Date.now();
    while (txResult.status === 'PENDING' && Date.now() - start < 30_000) {
      await new Promise((r) => setTimeout(r, 1000));
      txResult = await server.getTransaction(sendResult.hash);
    }

    if (txResult.status !== 'SUCCESS') {
      throw new Error(`Transaction failed or timed out: ${JSON.stringify(txResult)}`);
    }

    return txResult.result && txResult.result.retval ? scValToNative(txResult.result.retval) : null;
  } catch (err) {
    console.error('writeTokenContract failed:', err);
    throw err;
  }
}
