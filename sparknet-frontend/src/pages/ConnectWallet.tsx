import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext"; // 1. IMPORT YOUR NEW HOOK

// 2. REMOVE: import { Keypair } from "@stellar/stellar-sdk";

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { publicKey, connect } = useWallet(); // 3. USE YOUR HOOK
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  // 4. REMOVE: The old validateStellarAddress function.

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsConnecting(true);

    try {
      await connect(); // 5. THIS IS THE NEW LOGIC!
      // The effect hook below will handle the redirect.
    } catch (e: any) {
      setError("Failed to connect wallet. Please try again.");
      console.error(e);
      setIsConnecting(false);
    }
  };

  // 6. NEW: Effect hook to redirect on successful connection
  useEffect(() => {
    if (publicKey) {
      setIsConnecting(false);
      // Redirect after 2 seconds
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [publicKey, navigate]);


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background elements are unchanged... */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
        </div>
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
                  {publicKey ? "Wallet Connected!" : "Connect Your Wallet"}
                </CardTitle>
                <CardDescription className="text-base md:text-lg">
                  {publicKey 
                    ? "Your wallet has been successfully connected to SparkNet" 
                    : "Connect your Freighter wallet to access the SparkNet marketplace"
                  }
                </CardDescription>
              </CardHeader>

              <CardContent>
                {publicKey ? ( // 7. CHECK publicKey FROM CONTEXT
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-20 w-20 text-secondary animate-scale-in" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Connected Address:</p>
                      <p className="font-mono text-sm bg-muted/50 p-3 rounded-lg break-all">
                        {publicKey}
                      </p>
                    </div>
                    <p className="text-muted-foreground animate-pulse">
                      Redirecting to home...
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleConnect} className="space-y-6">
                    
                    {/* 8. REMOVE: The entire <Input> and <Label> div. We don't need it. */}
                    
                    {error && ( // Show error if one exists
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button 
                        type="submit" 
                        disabled={isConnecting}
                        className="w-full gradient-primary text-background font-semibold h-12 text-base shadow-glow-primary hover:scale-[1.02] transition-transform disabled:opacity-50"
                      >
                        {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
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