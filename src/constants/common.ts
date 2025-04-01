import { NetworkType } from "@omnisat/lasereyes";

export const UTXO_DUST = BigInt(546);
export const ICP_HOST = "https://icp-api.io";
export const EXCHANGE_ID = "ree_cookie";

export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK ??
  "testnet4") as NetworkType;

export const MEMPOOL_URL =
  process.env.NEXT_PUBLIC_MEMPOOL_URL ?? "https://mempool.space";
