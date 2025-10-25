import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Keypair } from "@stellar/stellar-sdk";

const ConnectWallet = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateStellarAddress = (address: string): boolean => {
    try {
      // Trim whitespace
      const trimmedAddress = address.trim();
      
      // Check if it starts with 'G' or 'M'
      if (!trimmedAddress.match(/^[GM]/)) {
        return false;
      }
      
      // Check length (Stellar public keys are 56 characters)
      if (trimmedAddress.length !== 56) {
        return false;
      }
      
      // Try to create a Keypair from the public key to validate
      Keypair.fromPublicKey(trimmedAddress);
      return true;
    } catch {
      return false;
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!walletAddress.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    // Validate the Stellar address
    if (!validateStellarAddress(walletAddress)) {
      setError("Invalid Stellar wallet address. Please enter a valid address starting with 'G' or 'M' (56 characters)");
      return;
    }

    setIsValidating(true);
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsValidating(false);
    setIsConnected(true);
    
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 z-10">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-effect border-primary/20 shadow-glow-primary">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Wallet className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold">
                  {isConnected ? "Wallet Connected!" : "Connect Your Wallet"}
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  {isConnected 
                    ? "Your wallet has been successfully connected to SparkNet" 
                    : "Enter your Stellar wallet address to connect to the SparkNet marketplace"
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isConnected ? (
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-20 w-20 text-secondary animate-scale-in" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Connected Address:</p>
                      <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg break-all">
                        {walletAddress}
                      </p>
                    </div>
                    <p className="text-muted-foreground animate-pulse">
                      Redirecting to dashboard...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConnect} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="wallet-address" className="text-base">
                        Wallet Address
                      </Label>
                      <Input
                        id="wallet-address"
                        type="text"
                        placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                        value={walletAddress}
                        onChange={(e) => {
                          setWalletAddress(e.target.value);
                          setError(""); // Clear error when user types
                        }}
                        className={`h-12 text-base bg-muted/30 focus:border-primary ${
                          error ? "border-destructive" : "border-primary/30"
                        }`}
                        required
                      />
                      {error ? (
                        <div className="flex items-center gap-2 text-destructive text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{error}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Enter your Stellar (XLM) wallet address starting with 'G' or 'M'
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Button 
                        type="submit" 
                        disabled={isValidating}
                        className="w-full gradient-primary text-background font-semibold h-12 text-base shadow-glow-primary hover:scale-[1.02] transition-transform disabled:opacity-50"
                      >
                        {isValidating ? "Validating..." : "Connect Wallet"}
                        <Wallet className="ml-2 h-5 w-5" />
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full border-primary/50 text-foreground hover:bg-primary/10 h-12 text-base"
                        onClick={() => navigate("/")}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Home
                      </Button>
                    </div>

                    <div className="glass-effect rounded-lg p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Why connect?</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Earn rewards for renting out compute resources</li>
                        <li>• Access the decentralized marketplace</li>
                        <li>• Track your earnings and transactions</li>
                        <li>• Participate in the SparkNet ecosystem</li>
                      </ul>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ConnectWallet;

