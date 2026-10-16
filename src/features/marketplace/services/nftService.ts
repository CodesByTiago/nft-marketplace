import { apiClient } from "@/core/api/client";
import type { NftResults } from "../types/nft";
import type { HomeTab, SortOption } from "../types/search";

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
