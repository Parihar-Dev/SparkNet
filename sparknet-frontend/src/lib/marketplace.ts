import { readContract } from "./soroban";

export const fetchProviders = async () => {
  const data = await readContract("get_providers");

  if (!Array.isArray(data)) return [];

  return data.map((entry: any) => ({
    gpuModel: entry.gpu_model,
    id: entry.id,
    pricePerHour: BigInt(Math.floor(parseFloat(entry.pricePerHour) / 10_000_000)),
    registeredAt: Number(entry.registered_at),
  }));
};
