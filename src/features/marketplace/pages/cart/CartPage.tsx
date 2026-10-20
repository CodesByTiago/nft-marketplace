import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";
import { CartToast } from "@/features/marketplace/components/CartToast";
import { MobileBackHeader } from "@/features/marketplace/components/MobileBackHeader";
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

  const isEmpty = !cartLoading && cart.length === 0;

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="catalogo"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />

      <main
        className={cn(
          "page-width pt-6 pb-16 max-[640px]:mx-0! max-[640px]:w-full! max-[640px]:px-7 max-[640px]:pt-8",
          isEmpty ? "max-[640px]:pb-16" : "max-[640px]:pb-[520px]",
        )}
      >
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
        <MobileBackHeader title="Carrinho de NFTs" onBack={goBack} />

        {cartLoading ? (
          <p className="catalog-message" role="status">
            Carregando seu carrinho…
          </p>
        ) : isEmpty ? (
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
            <div className="flex items-start justify-between gap-12 max-[900px]:flex-col max-[900px]:items-stretch max-[640px]:gap-0">
              <CartItems items={cart} onQuantity={updateQuantity} onRemove={removeFromCart} />
              <CartSummary items={cart} />
            </div>
            <div className="mt-24 empty:hidden max-[640px]:hidden">
              <RelatedNfts
                title="Colecionadores também viram"
                excludeIds={cart.map(({ nft }) => nft.id)}
                favorites={favorites}
                onFavorite={toggleFavorite}
                onAdd={addToCart}
              />
            </div>
          </>
        )}
      </main>

      <SiteFooter />
      {toast && <CartToast nft={toast} onView={() => window.scrollTo({ top: 0 })} onClose={dismissToast} />}
    </div>
  );
}
