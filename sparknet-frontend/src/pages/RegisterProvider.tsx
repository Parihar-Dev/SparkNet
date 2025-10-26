import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { writeContract } from "@/lib/soroban";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

const RegisterProvider = () => {
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const [gpuModel, setGpuModel] = useState("");
  const [price, setPrice] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => {
      if (!publicKey) throw new Error("Wallet not connected");

      // Convert price from XLM (string) to stroops (bigint)
      const priceInStroops = BigInt(parseFloat(price) * 10_000_000);
      if (priceInStroops <= 0) {
        throw new Error("Price must be greater than 0");
      }

      // Contract args: provider_address, gpu_model, price_per_hour
      return writeContract(
        "register",
        [publicKey, gpuModel, priceInStroops],
        publicKey
      );
    },
    onSuccess: () => {
      toast.success("Provider registered successfully!");
      // Refetch the providers list to update the marketplace
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      setGpuModel("");
      setPrice("");
    },
    onError: (e: Error) => {
      toast.error(`Registration failed: ${e.message}`);
    },
  });

  return (
    <Card className="w-full max-w-md glass-effect border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          <span>Become a Provider</span>
        </CardTitle>
        <CardDescription>
          Register your GPU on the network and start earning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            registerMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="gpuModel">GPU Model</Label>
            <Input
              id="gpuModel"
              placeholder="e.g., NVIDIA RTX 4090"
              value={gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (XLM per hour)</Label>
            <Input
              id="price"
              type="number"
              step="0.1"
              min="0.0000001"
              placeholder="e.g., 2.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={registerMutation.isPending}
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary text-background"
            disabled={!publicKey || !gpuModel || !price || registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Registering..."
              : "Register GPU"}
          </Button>
          {!publicKey && (
            <p className="text-center text-sm text-destructive mt-3">
              Please connect your wallet to register.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterProvider;

