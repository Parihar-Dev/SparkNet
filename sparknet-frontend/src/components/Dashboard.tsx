import React from "react";
import { useWallet } from "@/contexts/WalletContext";
import { readContract, writeContract } from "@/lib/soroban";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Define the Rental type from lib.rs
interface Rental {
  id: bigint;
  consumer: string;
  provider: string;
  start_time: bigint;
  end_time: bigint;
  duration_hours: bigint;
  total_cost: bigint;
  is_active: boolean;
  job_complete: boolean;
  is_paid: boolean;
}

// Helper to format bigint stroops to XLM string
const formatStroops = (stroops: bigint): string => {
  return (Number(stroops) / 10_000_000).toFixed(7);
};

// Helper to format Unix timestamp
const formatTimestamp = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

const Dashboard = () => {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();

  // 1. Fetch rentals where user is the CONSUMER
  const {
    data: consumerRentals,
    isLoading: isLoadingConsumer,
    error: consumerError,
  } = useQuery<Rental[]>({
    queryKey: ["rentals", "consumer", publicKey],
    queryFn: () => readContract("get_rentals_for_consumer", [publicKey]),
    enabled: !!publicKey,
  });

  // 2. Fetch rentals where user is the PROVIDER
  const {
    data: providerRentals,
    isLoading: isLoadingProvider,
    error: providerError,
  } = useQuery<Rental[]>({
    queryKey: ["rentals", "provider", publicKey],
    queryFn: () => readContract("get_rentals_for_provider", [publicKey]),
    enabled: !!publicKey,
  });

  // 3. Mutation for completing a job
  const completeJobMutation = useMutation({
    mutationFn: (rentalId: bigint) => {
      if (!publicKey) throw new Error("Wallet not connected");
      // Contract args: consumer_address, rental_id
      return writeContract("complete_job", [publicKey, rentalId], publicKey);
    },
    onSuccess: () => {
      toast.success("Job completed and payment released!");
      // Refetch both consumer and provider rentals
      queryClient.invalidateQueries({ queryKey: ["rentals", "consumer", publicKey] });
      queryClient.invalidateQueries({ queryKey: ["rentals", "provider", publicKey] });
    },
    onError: (e: Error) => {
      toast.error(`Completion failed: ${e.message}`);
    },
  });

  if (!publicKey) {
    return (
      <Card className="max-w-4xl mx-auto my-12 text-center glass-effect">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Please connect your wallet to view your rentals.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-6 py-24 max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Consumer Rentals */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>My Rentals (as Consumer)</CardTitle>
          <CardDescription>Jobs you are currently running.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingConsumer && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {consumerError && <p className="text-destructive">{consumerError.message}</p>}
          {consumerRentals && consumerRentals.length === 0 && (
            <p className="text-muted-foreground text-center py-4">You have no active rentals.</p>
          )}
          {consumerRentals && (
            <div className="space-y-4">
              {consumerRentals.map((rental) => (
                <RentalCard
                  key={rental.id.toString()}
                  rental={rental}
                  isConsumer
                  onComplete={() => completeJobMutation.mutate(rental.id)}
                  isCompleting={
                    completeJobMutation.isPending &&
                    completeJobMutation.variables === rental.id
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Rentals */}
      <Card className="glass-effect border-border/50">
        <CardHeader>
          <CardTitle>My Jobs (as Provider)</CardTitle>
          <CardDescription>Jobs running on your hardware.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProvider && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </div>
          )}
          {providerError && <p className="text-destructive">{providerError.message}</p>}
          {providerRentals && providerRentals.length === 0 && (
            <p className="text-muted-foreground text-center py-4">You have no active jobs.</p>
          )}
          {providerRentals && (
            <div className="space-y-4">
              {providerRentals.map((rental) => (
                <RentalCard
                  key={rental.id.toString()}
                  rental={rental}
                  isConsumer={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Sub-component for displaying a single rental
const RentalCard = ({ rental, isConsumer, onComplete, isCompleting }: {
  rental: Rental;
  isConsumer: boolean;
  onComplete?: () => void;
  isCompleting?: boolean;
}) => (
  <div className="p-4 rounded-xl bg-background/50 border border-border/50 space-y-3 transition-all hover:bg-background/80">
    <div className="flex justify-between items-center">
      <span className="font-semibold text-lg">Rental ID: {rental.id.toString()}</span>
      <RentalStatusChip rental={rental} />
    </div>
    <div className="text-sm text-muted-foreground font-mono break-all">
      {isConsumer ? (
        <p><span className="font-semibold text-foreground">Provider:</span> {rental.provider}</p>
      ) : (
        <p><span className="font-semibold text-foreground">Consumer:</span> {rental.consumer}</p>
      )}
    </div>
    <div className="text-sm space-y-1 text-muted-foreground">
      <p><span className="font-semibold text-foreground">Total Cost:</span> {formatStroops(rental.total_cost)} XLM</p>
      <p><span className="font-semibold text-foreground">Duration:</span> {rental.duration_hours.toString()} hours</p>
      <p><span className="font-semibold text-foreground">End Time:</span> {formatTimestamp(rental.end_time)}</p>
    </div>
    {isConsumer && rental.is_active && !rental.job_complete && (
      <Button
        size="sm"
        className="w-full gradient-primary text-background"
        onClick={onComplete}
        disabled={isCompleting}
      >
        {isCompleting ? "Completing..." : "Mark Job as Complete"}
      </Button>
    )}
  </div>
);

// Sub-component for the status badge
const RentalStatusChip = ({ rental }: { rental: Rental }) => {
  if (rental.job_complete && rental.is_paid) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/10 text-xs font-medium text-green-400">
        <CheckCircle className="h-3 w-3" />
        <span>Completed & Paid</span>
      </div>
    );
  }
  if (rental.is_active) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
        <Clock className="h-3 w-3" />
        <span>Active</span>
      </div>
    );
  }
  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-xs font-medium text-amber-400">
      <AlertTriangle className="h-3 w-3" />
      <span>Inactive</span>
    </div>
  );
};

export default Dashboard;
