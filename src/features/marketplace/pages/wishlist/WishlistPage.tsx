import { Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { NftCard } from "@/features/marketplace/components/NftCard";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
import { getNft } from "@/features/marketplace/services/nftService";
import { AccountShell } from "../profile/components/AccountShell";

function WishlistContent() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCartPanel();
  const results = useQueries({
    queries: favorites.map((id) => ({ queryKey: ["nft", id], queryFn: () => getNft(id) })),
  });
  const items = results.flatMap((result) => (result.data ? [result.data] : []));
  const loading = results.some((result) => result.isPending);

  return (
    <section className="account-form wishlist" aria-labelledby="wishlist-title">
      <h2 id="wishlist-title">Lista de interesse</h2>
      {favorites.length === 0 ? (
        <div className="account-maintenance">
          <p>Você ainda não favoritou nenhum NFT. Toque no coração de um card para guardá-lo aqui.</p>
          <Button variant="outline" asChild>
            <Link to="/" hash="catalogo">
              Explorar o mercado
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="wishlist-count" role="status">
            {loading && items.length === 0
              ? "Carregando favoritos…"
              : `${favorites.length} ${favorites.length === 1 ? "favorito" : "favoritos"}`}
          </p>
          <ul className="related-grid wishlist-grid">
            {items.map((nft) => (
              <li key={nft.id}>
                <NftCard nft={nft} favorite onFavorite={() => toggleFavorite(nft.id)} onAdd={() => addToCart(nft)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default function WishlistPage() {
  return (
    <AccountShell section="wishlist" title="Lista de interesse">
      {() => <WishlistContent />}
    </AccountShell>
  );
}
