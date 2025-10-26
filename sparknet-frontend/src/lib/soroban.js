import {
  rpc as SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  Networks,
  Operation,
  scValToNative,
  nativeToScVal,
  Keypair,
  Account,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { CONTRACT_ID, TOKEN_ID, RPC_URL, NETWORK_PASSPHRASE } from "./constants";

// Initialize Soroban RPC
const server = new SorobanRpc.Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith("http://"),
});

const toScArgs = (args) => args.map((a) => nativeToScVal(a));

/** Read-only contract call */
export const readContract = async (method, args = []) => {
  const scArgs = toScArgs(args);

  // Dummy account
  const tempAccount = new Account(Keypair.random().publicKey(), "0");

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

  const sim = await server.simulateTransaction(tx);
  if (!sim || !sim.result) throw new Error("Simulation failed");

  return sim.result.retval;
};

/** Write contract (requires wallet) */
export const writeContract = async (
  method,
  args,
  secretKey
) => {
  const keypair = Keypair.fromSecret(secretKey);
  const accountId = keypair.publicKey();
  const scArgs = toScArgs(args);

  // Dummy account for sequence
  const tempAccount = new Account(accountId, "0");

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
    .setTimeout(120)
    .build();

  const xdr = tx.toXDR("base64");
  const signedXdr = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
  const sendResult = await server.sendTransaction(signedXdr);

  if (!sendResult || sendResult.status !== "SUCCESS") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult)}`);
  }

  const txResult = await server.getTransaction(sendResult.hash);
  return txResult.result?.retval || null;
};

/** Helper to parse vec/map from Soroban */
export const parseProviderScVal = (scVal) => {
  const vec = scVal._arm?.vec?._value || scVal._value || [];
  return vec.map((mapObj) => {
    const map = mapObj._arm?.map?._value || [];
    const provider = {};
    map.forEach(({ _attributes }) => {
      const key = scValToNative(_attributes.key);
      const val = scValToNative(_attributes.val);
      provider[key] = val;
    });
    return provider;
  });
};


export const writeTokenContract = async (method, args = [], secretKey) => {
  try {
    const keypair = Keypair.fromSecret(secretKey);
    const account = new Account(keypair.publicKey(), "0");
    const scArgs = toScArgs(args);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: TOKEN_ID,
          function: method,
          args: scArgs,
        })
      )
      .setTimeout(120)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!sim || sim.type !== "success") {
      throw new Error(`simulateTransaction failed: ${JSON.stringify(sim)}`);
    }

    const assembledTx = SorobanRpc.assembleTransaction(tx, sim).build();

    const signedXdr = await signTransaction(assembledTx.toXDR("base64"), {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    const sendResult = await server.sendTransaction(signedXdr);

    if (!sendResult || sendResult.status !== "SUCCESS") {
      throw new Error(`sendTransaction failed: ${JSON.stringify(sendResult)}`);
    }

    let txResult = await server.getTransaction(sendResult.hash);
    const start = Date.now();
    while (txResult.status === "PENDING" && Date.now() - start < 30_000) {
      await new Promise((r) => setTimeout(r, 1000));
      txResult = await server.getTransaction(sendResult.hash);
    }

    if (txResult.status !== "SUCCESS") {
      throw new Error(`Transaction failed or timed out: ${JSON.stringify(txResult)}`);
    }

    return txResult.result?.retval ? scValToNative(txResult.result.retval) : null;
  } catch (err) {
    console.error("writeTokenContract failed:", err);
    throw err;
  }
};
