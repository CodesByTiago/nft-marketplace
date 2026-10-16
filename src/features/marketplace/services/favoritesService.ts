import { apiClient } from "@/core/api/client";

export async function fetchFavorites() {
  const { data } = await apiClient.get<{ ids: string[] }>("/favorites");
  return data.ids;
}

export const addFavorite = (id: string) => apiClient.put(`/favorites/${id}`);

export const removeFavorite = (id: string) => apiClient.delete(`/favorites/${id}`);
