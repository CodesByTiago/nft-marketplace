import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useCanGoBack, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Button } from "@/shared/ui/button";
import { getNft } from "@/features/marketplace/services/nftService";
import type { Nft, NftDetail } from "@/features/marketplace/types/nft";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
import { CartToast } from "@/features/marketplace/components/CartToast";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { RelatedNfts } from "@/features/marketplace/components/RelatedNfts";
import { BuyBar } from "./components/BuyBar";
import { NftDescription } from "./components/NftDescription";
import { NftDetailSkeleton } from "./components/NftDetailSkeleton";
import { NftGallery } from "./components/NftGallery";
import { NftSummary } from "./components/NftSummary";

const DEFAULT_EDITION = "1/50";

// O carrinho guarda apenas os campos do catálogo, não o detalhe completo.
function toCartNft(detail: NftDetail): Nft {
  const { id, name, collection, artist, price, previousPrice, image, category, network } = detail;
  const { edition, totalEditions, isNew, trending, available, version } = detail;
  return {
    id,
    name,
    collection,
    artist,
    price,
    previousPrice,
    image,
    category,
    network,
    edition,
    totalEditions,
    isNew,
    trending,
    available,
    version,
  };
}

export default function NftDetailPage() {
  const { nftId } = useParams({ from: "/nft/$nftId" });
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [edition, setEdition] = useState(DEFAULT_EDITION);
  const { cart, addToCart, toast, dismissToast } = useCartPanel();
  const { favorites, toggleFavorite } = useFavorites();

  const {
    data: nft,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["nft", nftId],
    queryFn: () => getNft(nftId),
    retry: (count, err) => !(isAxiosError(err) && err.response?.status === 404) && count < 1,
  });
  const notFound = isError && isAxiosError(error) && error.response?.status === 404;

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setEdition(DEFAULT_EDITION);
  }, [nftId]);

  useEffect(() => {
    document.title = nft ? `${nft.name} | Kurio` : "Kurio";
    return () => {
      document.title = "Kurio";
    };
  }, [nft]);

  const selectedEdition = nft?.editions.find((item) => item.label === edition && item.available)
    ? edition
    : (nft?.editions.find((item) => item.available)?.label ?? "");

  function goBack() {
    if (canGoBack) router.history.back();
    else void navigate({ to: "/" });
  }

  function buy() {
    if (!nft) return;
    addToCart(toCartNft(nft), quantity);
    void navigate({ to: "/carrinho" });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="catalogo"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />

      <main className="detail-main page-width">
        {isError ? (
          <div className="catalog-message" role="alert">
            <h1>{notFound ? "NFT não encontrado" : "Não foi possível carregar este NFT"}</h1>
            <p>{notFound ? "Esta obra não existe ou foi removida." : "Verifique sua conexão e tente novamente."}</p>
            {notFound ? (
              <Button variant="outline" asChild>
                <Link to="/">Voltar ao mercado</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            )}
          </div>
        ) : isPending ? (
          <NftDetailSkeleton />
        ) : (
          <>
            <nav className="detail-breadcrumb" aria-label="Você está em">
              <Link to="/" hash="inicio">
                Início
              </Link>
              {" / "}
              <Link to="/" hash="catalogo">
                Mercado
              </Link>
            </nav>
            <div className="detail-product">
              <NftGallery
                name={nft.name}
                image={nft.image}
                favorite={favorites.includes(nft.id)}
                onFavorite={() => toggleFavorite(nft.id)}
                onBack={goBack}
              />
              <NftSummary
                nft={nft}
                favorite={favorites.includes(nft.id)}
                quantity={quantity}
                edition={selectedEdition}
                onFavorite={() => toggleFavorite(nft.id)}
                onQuantity={setQuantity}
                onEdition={setEdition}
                onBuy={buy}
              />
            </div>
            <NftDescription nft={nft} />
            <RelatedNfts
              title="Mais desta coleção"
              collection={nft.collection}
              excludeIds={[nft.id]}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={(related) => addToCart(related)}
            />
            <BuyBar
              nft={nft}
              quantity={quantity}
              onQuantity={setQuantity}
              onBuy={buy}
              onAdd={() => addToCart(toCartNft(nft), quantity)}
            />
          </>
        )}
      </main>

      <SiteFooter />
      {toast && <CartToast nft={toast} onView={() => void navigate({ to: "/carrinho" })} onClose={dismissToast} />}
    </div>
  );
}
