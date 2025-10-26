import { useWallet } from "@/contexts/WalletContext";
// Import all necessary contract functions and the CONTRACT_ID
import { writeContract, writeTokenContract, readContract } from "@/lib/soroban";
import { CONTRACT_ID } from "@/lib/constants";
import { stroopsToXLM } from "@/lib/utils"; // Import the utility function
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchProviders } from "@/lib/marketplace";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Gauge, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// NOTE: If you are using 'react-router-dom' or similar, you should uncomment 
// the following line and use the navigate function inside onSuccess.
// import { useNavigate } from "react-router-dom"; 

// DEFINE: The types from our contract
interface Provider {
  id: string; // Soroban SDK converts Address to string
  gpuModel: string;
  pricePerHour: bigint; // Soroban SDK converts u128 to bigint
  // Assuming a status field might exist, but we will use the contract data as is
}

// HELPER: Separate component for loading state
const MarketplaceSkeleton = () => (
  <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
    <Card className="glass-effect border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <Skeleton className="w-16 h-7 rounded-full" />
        </div>
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2].map((j) => (
            <div
              key={j}
              className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="w-20 h-9" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Marketplace = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  // const navigate = useNavigate(); // UNCOMMENT if using react-router-dom

  // QUERY: Fetch the list of registered providers
  const { data: providers, isLoading, error } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  // MUTATION: For calling the two-step rental process
  const rentMutation = useMutation({
    mutationFn: async ({ provider, duration }: { provider: Provider; duration: number }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const consumer_address = publicKey;
      const provider_address = provider.id;
      const duration_hours = BigInt(duration);
      
      // --- STEP 1: CALCULATE COST AND APPROVE TOKEN SPENDING ---
      
      // Calculate total cost in stroops (price_per_hour is already BigInt)
      const totalCostInStroops = provider.pricePerHour * duration_hours;
      
      // The SparkNet contract is the spender (it pulls tokens from the consumer)
      const approveArgs = [
        consumer_address,
        CONTRACT_ID, // The SparkNet contract is the spender
        totalCostInStroops,
      ];

      toast.info("Step 1 of 2: Approving tokens for rental...");
      
      // Call the `approve` function on the standard asset (token) contract
      await writeTokenContract("approve", approveArgs, publicKey);
      
      // --- STEP 2: CALL THE MAIN CONTRACT'S RENT FUNCTION ---

      toast.info("Step 2 of 2: Initiating GPU rental...");

      // Contract args: consumer_address, provider_address, duration_hours
      const rentArgs = [consumer_address, provider_address, duration_hours];

      // Call the `rent_gpu` function on the main SparkNet contract
      return writeContract("rent_gpu", rentArgs, publicKey);
    },
    onSuccess: () => {
      toast.success("Rental successful! Your job is now active.");
      
      // Invalidate queries to ensure dashboard and marketplace views are updated
      queryClient.invalidateQueries({ queryKey: ["rentals", publicKey] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      navigate('/dashboard');
      console.log("SUCCESS: Rental complete. Navigate the user to the dashboard to see their active job.");

    },
    onError: (e: Error) => {
      // Use e.message for a cleaner error display
      toast.error(`Rental failed: ${e.message}`);
    }
  });


  // RENDER: Header and main content
  return (
    <section id="marketplace" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Active <span className="text-gradient-primary">Marketplace</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse available resources or list your own to start earning
          </p>
        </div>

        {/* HANDLE LOADING STATE */}
        {isLoading && <MarketplaceSkeleton />}

        {/* HANDLE ERROR STATE */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <Card className="glass-effect border-destructive/50">
              <CardHeader className="flex flex-row items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">
                  Error Fetching Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{error.message}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* HANDLE SUCCESS & EMPTY STATE */}
        {providers && (
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all hover:shadow-glow-primary">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
                    <Cpu className="h-7 w-7 text-background" />
                  </div>
                  <span className="px-3 py-1 rounded-full glass-effect text-sm text-primary border border-primary/30">
                    Live ({providers.length})
                  </span>
                </div>
                <CardTitle className="text-2xl">Compute Power</CardTitle>
                <CardDescription>
                  Available resources on the network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* HANDLE EMPTY STATE */}
                {providers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No compute providers have registered yet.
                    </p>
                  </div>
                ) : (
                  /* MAP OVER LIVE `providers` DATA */
                  <div className="space-y-4">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors border border-border/50"
                      >
                        <div className="flex-1 mb-4 sm:mb-0">
                          <div className="font-semibold mb-1">
                            {provider.gpuModel}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {/* Use the imported utility function */}
                              {stroopsToXLM(provider.pricePerHour)} XLM/hour
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono break-all pt-1">
                            Provider: {provider.id}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <div className="text-right flex-1 sm:flex-auto">
                            <div className="flex items-center space-x-1 text-sm justify-end">
                              <Gauge className="h-3 w-3 text-secondary" />
                              <span className="text-secondary font-semibold">
                                100%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Available
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            className="gradient-primary text-background w-24"
                            onClick={() => {
                              // Hardcoding 1 hour for simplicity. 
                              // Pass the full provider object to the mutation for cost calculation
                              rentMutation.mutate({ provider: provider, duration: 1 });
                            }}
                            disabled={rentMutation.isPending || !publicKey}
                          >
                            {rentMutation.isPending ? "Renting..." : "Rent"}
                          </Button>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default Marketplace;