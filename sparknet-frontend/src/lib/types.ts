export interface Provider {
  gpu_model: string;
  id: string; // wallet/public key
  price_per_hour: bigint;
  registered_at: number;
}
