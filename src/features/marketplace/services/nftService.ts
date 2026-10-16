import { apiClient } from "@/core/api/client";
import type { CartQuote, NftDetail, NftResults } from "../types/nft";
import type { Order, OrderRequest, QuoteChanged } from "../types/payment";
import type { HomeTab, SortOption } from "../types/search";

export class QuoteChangedError extends Error {
  constructor(readonly total: string) {
    super("quote-changed");
  }
}

export async function createOrder(request: OrderRequest) {
  try {
    const { data } = await apiClient.post<Order>("/orders", request);
    return data;
  } catch (error) {
    const response = (error as { response?: { status?: number; data?: QuoteChanged } }).response;
    if (response?.status === 409 && response.data) throw new QuoteChangedError(response.data.total);
    throw error;
  }
}

export async function getCartQuote(items: { id: string; quantity: number }[], coupon?: string) {
  const { data } = await apiClient.post<CartQuote>("/cart/quote", { items, coupon });
  return data;
}

export async function getNft(id: string) {
  const { data } = await apiClient.get<NftDetail>(`/nfts/${encodeURIComponent(id)}`);
  return data;
}

export async function getNfts(params: {
  tab?: HomeTab;
  search?: string;
  category?: string;
  collection?: string;
  network?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
  limit?: number;
}) {
  const { data } = await apiClient.post<NftResults>("/nfts", params);
  return data;
}
