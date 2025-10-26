import {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useContext,
  useEffect,
} from "react";

import { isAllowed, setAllowed, getAddress } from "@stellar/freighter-api";

interface IWalletContext {
  publicKey: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Create the context
const WalletContext = createContext<IWalletContext | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState("");

  // Connect to Freighter Wallet
  const connect = useCallback(async () => {
    try {
      // Check if Freighter is allowed to connect
      const allowedRes = await isAllowed();
      if (!allowedRes.isAllowed) {
        await setAllowed();
      }

      // Get the wallet address
      const addressRes = await getAddress();
      if (addressRes.error) {
        throw new Error(addressRes.error);
      }

      setPublicKey(addressRes.address);
      console.log("Connected to Freighter:", addressRes.address);
    } catch (e) {
      console.error("Error connecting to Freighter:", e);
      setPublicKey(""); // Clear on error
    }
  }, []);

  // Disconnect wallet (simple local state clear)
  const disconnect = useCallback(() => {
    setPublicKey("");
  }, []);

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const allowedRes = await isAllowed();
        if (allowedRes.isAllowed) {
          const addressRes = await getAddress();
          if (!addressRes.error) {
            setPublicKey(addressRes.address);
          }
        }
      } catch (e) {
        console.warn("Freighter not available or not connected on load");
      }
    };
    checkConnection();
  }, []);

  return (
    <WalletContext.Provider value={{ publicKey, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for easy wallet access
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
