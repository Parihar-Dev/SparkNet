import { Button } from "@/components/ui/button";
import { Cpu, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-primary" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-gradient-primary">SparkNet</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors">How It Works</a>
            <a href="#marketplace" className="text-foreground/80 hover:text-primary transition-colors">Marketplace</a>
            <a href="#rewards" className="text-foreground/80 hover:text-primary transition-colors">Rewards</a>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/connect-wallet">
              <Button variant="ghost" className="gradient-primary text-background font-semibold shadow-glow-primary">
                Connect Wallet
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
