import type { CartQuote, CouponStatus } from "../types/nft";
import { formatEth, toWei } from "../utils/eth";
import { nfts } from "./data";

export const NETWORK_FEE = "0.016";

const coupons: Record<string, { percent: number; status: CouponStatus }> = {
  KURIO10: { percent: 10, status: "applied" },
  BEMVINDO5: { percent: 5, status: "applied" },
  VERAO20: { percent: 20, status: "expired" },
};

export function buildCartQuote(items: { id: string; quantity: number }[], rawCoupon?: string): CartQuote {
  const unavailable = items
    .filter((item) => nfts.find((candidate) => candidate.id === item.id)?.available === false)
    .map((item) => item.id);
  const subtotal = items.reduce((sum, item) => {
    const nft = nfts.find((candidate) => candidate.id === item.id);
    return nft && nft.available !== false
      ? sum + toWei(nft.price) * BigInt(Math.max(0, Math.floor(item.quantity)))
      : sum;
  }, 0n);

  const code = rawCoupon?.trim().toUpperCase();
  const known = code ? coupons[code] : undefined;
  const status: CouponStatus | undefined = code ? (known?.status ?? "invalid") : undefined;
  const percent = status === "applied" && known ? known.percent : 0;
  const discount = (subtotal * BigInt(percent)) / 100n;
  const fee = toWei(NETWORK_FEE);

  return {
    subtotal: formatEth(subtotal, 3),
    discount: formatEth(discount, 3),
    networkFee: NETWORK_FEE,
    total: formatEth(subtotal - discount + fee, 3),
    coupon: code && status ? { code, status, percent } : undefined,
    unavailable: unavailable.length ? unavailable : undefined,
  };
}
