# SparkNet 🚀 - Decentralized GPU Marketplace on Stellar/Soroban

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built on Stellar](https://img.shields.io/badge/Stellar-Soroban-blue.svg)](https://soroban.stellar.org/)
[![Made with Rust](https://img.shields.io/badge/Rust-built-orange.svg?logo=rust)](https://www.rust-lang.org/)
[![Frontend: React/TS](https://img.shields.io/badge/Frontend-React%20/%20TypeScript-informational)](https://react.dev/)

## Overview

**SparkNet** is a trustless and efficient **decentralized GPU rental marketplace** built entirely on the **Stellar blockchain** using **Soroban smart contracts**. It connects users who need computational power (Consumers) with those who can provide it (Providers) for tasks like AI/ML training, rendering, and scientific simulation.

***

## ✨ Key Features

* **Secure Payment Handling:** Payments managed trustlessly using standard **Stellar tokens**.
* **Automated Escrow:** Funds are held in escrow and released automatically upon job completion verification.
* **Provider Reputation System:** Encourages reliable service through a public reputation mechanism.
* **Flexible Rental Periods:** Comprehensive management of rental agreements and duration.

***

## 💻 Technologies

| Component | Primary Technology | Details |
| :--- | :--- | :--- |
| **Smart Contract** | **Soroban (Rust)** | Highly efficient, secure, and future-proof contract logic. |
| **Blockchain** | **Stellar** | Fast, low-cost, and scalable decentralized infrastructure. |
| **Frontend** | **React & TypeScript** | Robust, modern, and type-safe user interface. |
| **Wallet Integration** | **Freighter** | Seamless connection and transaction signing. |

***

## 📂 Project Structure


```
SparkNet/
├── sparknet-contract/       # Soroban smart contract
│   └── contracts/
│       └── contract/       # Main contract implementation
│           ├── src/
│           │   ├── lib.rs  # Contract logic
│           │   └── test.rs # Contract tests
│           └── Cargo.toml
└── sparknet-frontend/      # React/TypeScript frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── lib/          # Helper functions & utilities
    │   └── pages/        # Application pages
    └── package.json
```
***

## 🛠 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

* **Node.js** (v18+)
* **Rust** (latest stable version)
* **Soroban CLI**
* A **Stellar account** funded with testnet XLM.
* The **Freighter wallet** browser extension.

### Smart Contract Deployment

Follow these steps to build and deploy the core marketplace contract to the Stellar Testnet.

1.  **Build the WASM:** Navigate to the contract directory and compile the Rust code to a WebAssembly binary.

    ```bash
    cd sparknet-contract/contracts/contract
    cargo build --target wasm32-unknown-unknown --release
    ```

2.  **Deploy the Contract:** Deploy the generated `.wasm` file to the Stellar Testnet. Note the resulting `<CONTRACT_ID>`.

    ```bash
    soroban contract deploy \
      --wasm target/wasm32-unknown-unknown/release/contract.wasm \
      --source sparknet \
      --network testnet
    ```

3.  **Initialize the Contract:** Invoke the `initialize` function, passing the administrator and the address of the desired Stellar Token contract ID used for payments.

    ```bash
    soroban contract invoke \
      --id <CONTRACT_ID> \
      --source <ADMIN_ADDRESS> \
      --network testnet \
      -- \
      initialize \
      --admin <ADMIN_ADDRESS> \
      --token-address <TOKEN_CONTRACT_ID>
    ```

### Frontend Setup

1.  **Install Dependencies:** Navigate to the frontend directory and install the necessary packages.

    ```bash
    cd sparknet-frontend
    npm install
    ```

2.  **Configure Environment:** Update the `CONTRACT_ID` and other relevant configuration values in `src/lib/constants.ts` to match your deployed contract.

3.  **Start Development Server:** Launch the application in development mode.

    ```bash
    npm run dev
    ```

***

## 💡 Usage Scenarios

### For GPU Providers (Earn Rewards)

1.  **Connect Wallet:** Link your Stellar account via the **Freighter wallet**.
2.  **Register:** Register as a provider, specifying your GPU hardware details (e.g., GPU model, VRAM).
3.  **Set Rate:** Define your hourly rental rate.
4.  **Monitor:** Track active rentals and automatically receive payment upon job completion.

### For GPU Consumers (Get Compute)

1.  **Connect Wallet:** Link your Stellar account.
2.  **Browse:** View the marketplace to find available GPUs that match your requirements.
3.  **Rent & Pay:** Select a rental duration and authorize the payment, which is held in escrow.
4.  **Submit & Monitor:** Submit your computational job and monitor its real-time status.

***

## 🏗 Architecture & Design

### Smart Contract Design

* **Language:** Written in **Rust** using the **Soroban SDK**.
* **Payments:** Utilizes the native Soroban **Stellar token standard** for robust and interoperable payment logic.
* **Robustness:** Features comprehensive state management and error handling for secure transactions.
* **Testing:** Includes a full suite of integration and unit tests (`src/test.rs`) to ensure reliability.

### Frontend Architecture

* **Stack:** Built with **React** and **TypeScript** for scalability and maintainability.
* **Data Flow:** Direct integration with the Soroban client for **real-time contract interaction** and state updates.
* **UI/UX:** Responsive design with modern components for a superior user experience.

***

## 🤝 Contributing

We welcome contributions! Please follow these steps to get started:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/your-new-feature`).
3.  Commit your changes (`git commit -m 'feat: add my amazing feature'`).
4.  Push to the branch (`git push origin feature/your-new-feature`).
5.  Open a Pull Request.

### Testing

Run tests locally to verify your changes:

* **Smart Contract Tests:**

    ```bash
    cd sparknet-contract/contracts/contract
    cargo test
    ```

***

## 📜 License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.
