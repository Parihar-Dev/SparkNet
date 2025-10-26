import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ConnectWallet from "./pages/ConnectWallet";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";
import { WalletProvider } from "./contexts/WalletContext"; // 1. IMPORT YOUR CONTEXT

const queryClient = new QueryClient();

const App = () => (
  // 2. WRAP YOUR APP WITH THE PROVIDER
  <WalletProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/connect-wallet" element={<ConnectWallet />} />
            <Route path="/register-provider" element={<RegisterPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WalletProvider>
);

export default App;