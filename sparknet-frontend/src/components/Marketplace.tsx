import { useWallet } from "@/contexts/WalletContext";
import { writeContract } from "@/lib/soroban";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Gauge, Clock, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@/lib/soroban";
import { Skeleton } from "@/components/ui/skeleton";

// DEFINE: The types from our contract
// (Make sure these match lib.rs)
interface Provider {
  id: string; // Soroban SDK converts Address to string
  gpu_model: string;
  price_per_hour: bigint; // Soroban SDK converts u128 to bigint
  registered_at: bigint;
}

// HELPER: Function to format price
// The contract stores price in stroops (10^7)
const formatPrice = (price: bigint): string => {
  // Use Number for simple division, as bigint doesn't support decimals
  return (Number(price) / 10_000_000).toFixed(7);
};

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
  // FETCH DATA: Use react-query to call our readContract helper
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const {
    data: providers,
    isLoading,
    error,
  } = useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: () => readContract("get_providers"),
  });

  // MUTATION: For calling the 'rent_gpu' contract function
  const rentMutation = useMutation({
    mutationFn: ({ providerId, duration }: { providerId: string; duration: number }) => {
      if (!publicKey) throw new Error("Wallet not connected");
      
      // Get arguments for the contract function
      const consumer_address = publicKey;
      const provider_address = providerId;
      const duration_hours = BigInt(duration); // Contract expects u64

      return writeContract("rent_gpu", [consumer_address, provider_address, duration_hours], publicKey);
    },
    onSuccess: () => {
      toast.success("Rental successful! Check your dashboard.");
      // Invalidate the rentals query to refetch data on other pages
      queryClient.invalidateQueries({ queryKey: ["rentals", publicKey] });
    },
    onError: (e: Error) => {
      toast.error(`Rental failed: ${e.message}`);
    }
  });

  // RENDER: Header and background
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
                    Live
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
                            {provider.gpu_model}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatPrice(provider.price_per_hour)} XLM/hour
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
                              {/* We don't have availability % in contract, so hardcode for now */}
                              <span className="text-secondary font-semibold">
                                100%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Available
                            </div>
                          </div>
                          
                          {/* --- THIS IS THE MODIFIED BUTTON --- */}
                          <Button
                            size="sm"
                            className="gradient-primary text-background w-24"
                            onClick={() => {
                              // Hardcoding 1 hour for simplicity.
                              // In a real app, you'd use a modal to ask for the duration.
                              rentMutation.mutate({ providerId: provider.id, duration: 1 });
                            }}
                            disabled={rentMutation.isPending || !publicKey}
                          >
                            {rentMutation.isPending ? "Renting..." : "Rent"}
                          </Button>
                          {/* --- END OF MODIFICATION --- */}

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