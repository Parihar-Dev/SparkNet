// scripts/initializeContract.js
import 'dotenv/config';
import { 
  Keypair, 
  Networks, 
  TransactionBuilder, 
  BASE_FEE, 
  Server, 
  Address, 
  Contract,
  xdr
} from 'soroban-client';

const initializeContract = async () => {
  try {
    // Load admin wallet
    const adminKeypair = Keypair.fromSecret(process.env.ADMIN_SECRET);
    const contractId = process.env.CONTRACT_ID;
    const tokenContractId = process.env.TOKEN_CONTRACT_ID;

    console.log("🔑 Admin Public Key:", adminKeypair.publicKey());
    console.log("🔗 Contract ID:", contractId);
    console.log("💰 Token Contract ID:", tokenContractId);

    // Connect to Soroban Testnet RPC
    const server = new Server("https://rpc.testnet.soroban.stellar.org");

    // Load admin account info
    const account = await server.getAccount(adminKeypair.publicKey());

    // Encode arguments as ScVal
    const adminScVal = Address.fromString(adminKeypair.publicKey()).toScVal();
    const tokenScVal = Address.fromString(tokenContractId).toScVal();

    // Prepare contract
    const contract = new Contract(contractId);

    // Build transaction
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call("initialize", {
          admin: adminScVal,
          token_address: tokenScVal,
        })
      )
      .setTimeout(60)
      .build();

    // Sign and submit transaction
    tx.sign(adminKeypair);

    console.log("🚀 Sending transaction...");
    const response = await server.submitTransaction(tx);

    console.log("✅ Contract initialized successfully!");
    console.log("📦 Transaction Hash:", response.hash);
  } catch (error) {
    console.error("❌ Initialization failed:", error.response?.data ?? error);
  }
};

initializeContract();
