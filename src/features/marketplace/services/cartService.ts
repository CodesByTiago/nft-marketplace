import { apiClient } from "@/core/api/client";
import type { CartEntry } from "../types/nft";

type CartResponse = { items: CartEntry[] };

export const getCart = async () => (await apiClient.get<CartResponse>("/cart")).data.items;

export const setCartQuantity = async (id: string, quantity: number) =>
  (await apiClient.put<CartResponse>(`/cart/items/${id}`, { quantity })).data.items;

export const removeCartItems = async (ids: string[]) =>
  (await apiClient.delete<CartResponse>("/cart/items", { params: { ids: ids.join(",") } })).data.items;

export const mergeCart = async (items: { id: string; quantity: number }[]) =>
  (await apiClient.post<CartResponse>("/cart/merge", { items })).data.items;
