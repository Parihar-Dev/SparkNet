import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext"; // 1. IMPORT YOUR HOOK

// Helper to truncate the public key
const truncateKey = (key: string) => `${key.slice(0, 4)}...${key.slice(-4)}`;

const Navbar = () => {
  const { publicKey, disconnect } = useWallet(); // 2. USE YOUR HOOK
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate("/connect-wallet");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 glass-effect border-b border-primary/10 backdrop-blur-lg">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-gradient-primary">
          SparkNet
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
           <Link to="/#howitworks" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {/* 3. DYNAMIC CONNECT/DISCONNECT BUTTON */}
          {publicKey ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/dashboard")} // We'll create this page next
                className="border-primary/30 hover:bg-primary/10"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center space-x-3 bg-muted/40 p-1 pr-2 rounded-full">
                <span className="font-mono text-sm bg-background px-3 py-1 rounded-full">
                  {truncateKey(publicKey)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={disconnect}
                  className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button 
              onClick={handleConnect}
              className="gradient-primary text-background font-semibold shadow-glow-primary"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;