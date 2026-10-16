import { useStoredState } from "./useStoredState";

const FAVORITES_KEY = "kurio-favorites";
const noFavorites: string[] = [];

export function useFavorites() {
  const [favorites, setFavorites] = useStoredState<string[]>(FAVORITES_KEY, noFavorites);

  function toggleFavorite(id: string) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((favorite) => favorite !== id) : [...current, id],
    );
  }

  return { favorites, toggleFavorite };
}
