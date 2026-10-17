import { useEffect, useState } from "react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import { CartToast } from "@/features/marketplace/components/CartToast";
import { RelatedNfts } from "@/features/marketplace/components/RelatedNfts";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
import { CartItems } from "./components/CartItems";
import { CartSummary } from "./components/CartSummary";

export default function CartPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const [search, setSearch] = useState("");
  const { cart, cartLoading, addToCart, updateQuantity, removeFromCart, toast, dismissToast } = useCartPanel();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Carrinho | Kurio";
    return () => {
      document.title = "Kurio";
    };
  }, []);

  function goBack() {
    if (canGoBack) router.history.back();
    else void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page cart-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="catalogo"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />

      <main className="cart-main page-width">
        <nav className="detail-breadcrumb" aria-label="Você está em">
          <Link to="/" hash="inicio">
            Início
          </Link>
          {" / "}
          <Link to="/" hash="catalogo">
            Mercado
          </Link>
          {" / Carrinho"}
        </nav>
        <header className="cart-mobile-header">
          <Button variant="ghost" size="icon" aria-label="Voltar" onClick={goBack}>
            <ArrowLeft aria-hidden="true" />
          </Button>
          <h1>Carrinho de NFTs</h1>
        </header>

        {cartLoading ? (
          <p className="catalog-message" role="status">
            Carregando seu carrinho…
          </p>
        ) : cart.length === 0 ? (
          <div className="catalog-message cart-empty">
            <ShoppingBag aria-hidden="true" />
            <h1>Seu carrinho está vazio</h1>
            <p>Descubra uma peça única para começar sua coleção.</p>
            <Button variant="outline" asChild>
              <Link to="/">Explorar NFTs</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-layout">
              <CartItems items={cart} onQuantity={updateQuantity} onRemove={removeFromCart} />
              <CartSummary items={cart} />
            </div>
            <RelatedNfts
              title="Colecionadores também viram"
              excludeIds={cart.map(({ nft }) => nft.id)}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          </>
        )}
      </main>

      <SiteFooter />
      {toast && <CartToast nft={toast} onView={() => window.scrollTo({ top: 0 })} onClose={dismissToast} />}
    </div>
  );
}
