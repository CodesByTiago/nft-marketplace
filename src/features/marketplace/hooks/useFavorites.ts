import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { addFavorite, fetchFavorites, removeFavorite } from "../services/favoritesService";

const noFavorites: string[] = [];

// Favoritos são privados: vivem no servidor, por usuário, e o cache é descartado ao trocar de sessão.
export function useFavorites() {
  const { user, openAuth } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["private", "favorites", user?.id ?? "guest"];

  const { data: favorites = noFavorites } = useQuery({ queryKey, queryFn: fetchFavorites, enabled: Boolean(user) });

  const mutation = useMutation({
    mutationFn: ({ id, favorite }: { id: string; favorite: boolean }) =>
      favorite ? addFavorite(id) : removeFavorite(id),
    // Atualização otimista; em caso de falha a lista volta ao estado anterior.
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<string[]>(queryKey) ?? noFavorites;
      queryClient.setQueryData<string[]>(queryKey, [
        ...previous.filter((item) => item !== id),
        ...(favorite ? [id] : []),
      ]);
      return { previous };
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  function toggleFavorite(id: string) {
    if (!user) {
      openAuth("login", () => mutation.mutate({ id, favorite: true }));
      return;
    }
    mutation.mutate({ id, favorite: !favorites.includes(id) });
  }

  return { favorites, toggleFavorite, failed: mutation.isError };
}
