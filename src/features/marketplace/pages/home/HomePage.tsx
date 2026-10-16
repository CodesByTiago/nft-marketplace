import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Heart, Home, ScanLine, Search, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getNfts } from "@/features/marketplace/services/nftService";
import type { Nft } from "@/features/marketplace/types/nft";
import { defaultFilters, type HomeFilters } from "@/features/marketplace/types/search";
import { useCart } from "@/features/marketplace/hooks/useCart";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
import { BlogSection } from "./components/BlogSection";
import { CartDrawer } from "./components/CartDrawer";
import { CartToast } from "./components/CartToast";
import { CatalogToolbar } from "./components/CatalogToolbar";
import { FilterSidebar, type FilterOption } from "./components/FilterSidebar";
import { HeroCarousel } from "./components/HeroCarousel";
import { NftCard } from "./components/NftCard";
import { Pagination } from "./components/Pagination";
import { PromoSection } from "./components/PromoSection";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

const PAGE_SIZE = 9;
const categoryLabels = [
  "Arte digital",
  "Fotografia",
  "Música",
  "Arte 3D",
  "Colecionáveis",
  "Generativa",
  "Jogos",
  "Assinaturas",
  "Utilidade",
];
const networkLabels = ["Ethereum", "Polygon", "Solana"];

export default function HomePage() {
  const navigate = useNavigate({ from: "/" });
  const urlSearch = useSearch({ from: "/" });
  const filters: HomeFilters = {
    tab: urlSearch.tab ?? defaultFilters.tab,
    category: urlSearch.category ?? defaultFilters.category,
    collection: urlSearch.collection ?? defaultFilters.collection,
    network: urlSearch.network ?? defaultFilters.network,
    minPrice: urlSearch.minPrice ?? defaultFilters.minPrice,
    maxPrice: urlSearch.maxPrice ?? defaultFilters.maxPrice,
    sort: urlSearch.sort ?? defaultFilters.sort,
    page: urlSearch.page ?? defaultFilters.page,
  };
  const { tab, category, collection, network, minPrice, maxPrice, sort, page } = filters;
  const [searchTerm, setSearchTerm] = useState("");
  const { cart, cartCount, addToCart: addItem, updateQuantity } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [toast, setToast] = useState<Nft | null>(null);
  const toastTimer = useRef<number>(undefined);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["nfts", searchTerm, tab, category, collection, network, minPrice, maxPrice, sort, page],
    queryFn: () =>
      getNfts({
        search: searchTerm,
        tab,
        category,
        collection,
        network,
        minPrice,
        maxPrice,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
  });
  const nfts = data?.items ?? [];
  const visibleNfts = favoritesOnly ? nfts.filter((nft) => favorites.includes(nft.id)) : nfts;
  const categories: FilterOption[] = categoryLabels.map((label) => ({
    label,
    count: data?.facets.categories[label] ?? 0,
  }));
  const networks: FilterOption[] = networkLabels.map((label) => ({
    label,
    count: data?.facets.networks[label] ?? 0,
  }));
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function updateSearch(updates: Partial<HomeFilters>) {
    const next = { ...filters, ...updates };
    const search = Object.fromEntries(
      Object.entries(next).map(([key, value]) => [
        key,
        value === defaultFilters[key as keyof HomeFilters] ? undefined : value,
      ]),
    );
    void navigate({ search });
  }

  const hasActiveFilters =
    Boolean(category || collection || network) ||
    minPrice !== defaultFilters.minPrice ||
    maxPrice !== defaultFilters.maxPrice;

  function clearFilters() {
    updateSearch({
      category: defaultFilters.category,
      collection: defaultFilters.collection,
      network: defaultFilters.network,
      minPrice: defaultFilters.minPrice,
      maxPrice: defaultFilters.maxPrice,
      page: 1,
    });
  }

  function toggleValue(value: string, current: string) {
    const values = current ? current.split(",") : [];
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    return next.join(",");
  }

  function addToCart(nft: Nft) {
    addItem(nft);
    setToast(nft);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        search={searchTerm}
        onSearch={(value) => setSearchTerm(value)}
        onFilters={() => setFiltersOpen((open) => !open)}
      />

      <main>
        <HeroCarousel />

        <section className="catalog-section page-width" id="catalogo">
          <div className={`catalog-layout ${filtersOpen ? "filters-open" : ""}`}>
            <FilterSidebar
              categories={categories}
              networks={networks}
              category={category}
              network={network}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onCategory={(value) => updateSearch({ category: value, page: 1 })}
              onNetwork={(value) => updateSearch({ network: toggleValue(value, network), page: 1 })}
              onApplyPrice={(min, max) => updateSearch({ minPrice: min, maxPrice: max, page: 1 })}
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
              onClose={() => setFiltersOpen(false)}
            />

            <div className="catalog-results">
              <CatalogToolbar
                tab={tab}
                sort={sort}
                onTab={(value) => updateSearch({ tab: value, page: 1 })}
                onSort={(value) => updateSearch({ sort: value, page: 1 })}
              />
              {isError ? (
                <div className="catalog-message" role="alert">
                  <h3>Não foi possível carregar os NFTs</h3>
                  <p>Verifique sua conexão e tente novamente.</p>
                  <Button variant="outline" onClick={() => void refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : isPending ? (
                <div className="nft-grid" aria-label="Carregando catálogo" aria-busy="true">
                  {Array.from({ length: PAGE_SIZE }, (_, index) => (
                    <div className="nft-skeleton" key={index} />
                  ))}
                </div>
              ) : visibleNfts.length === 0 ? (
                <div className="catalog-message">
                  <Search aria-hidden="true" />
                  <h3>{favoritesOnly ? "Você ainda não favoritou nenhuma obra" : "Nenhuma obra encontrada"}</h3>
                  <p>
                    {favoritesOnly
                      ? "Toque no coração de uma obra para adicioná-la aos favoritos."
                      : "Tente outro termo ou remova alguns filtros."}
                  </p>
                  {favoritesOnly && (
                    <Button variant="outline" onClick={() => setFavoritesOnly(false)}>
                      Ver todos os NFTs
                    </Button>
                  )}
                  {!favoritesOnly && hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="nft-grid">
                  {visibleNfts.map((nft) => (
                    <NftCard
                      key={nft.id}
                      nft={nft}
                      favorite={favorites.includes(nft.id)}
                      onFavorite={() => toggleFavorite(nft.id)}
                      onAdd={() => addToCart(nft)}
                    />
                  ))}
                </div>
              )}

              {!favoritesOnly && pageCount > 1 && (
                <Pagination page={page} pageCount={pageCount} onPage={(next) => updateSearch({ page: next })} />
              )}
            </div>
          </div>
        </section>

        <PromoSection />
        <BlogSection />
      </main>

      <SiteFooter />
      <nav className="mobile-tab-bar" aria-label="Navegação inferior">
        <a href="#inicio" aria-label="Início">
          <Home aria-hidden="true" />
        </a>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={favoritesOnly ? "Mostrar todos os NFTs" : "Mostrar favoritos"}
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((only) => !only)}
        >
          <Heart aria-hidden="true" fill={favoritesOnly ? "currentColor" : "none"} />
        </Button>
        <Button
          className="mobile-scan"
          size="icon-lg"
          aria-label="Ir para o catálogo"
          onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
        >
          <ScanLine aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={`Abrir carrinho, ${cartCount} itens`}
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Perfil"
          onClick={() => window.alert("O perfil será disponibilizado em uma próxima etapa.")}
        >
          <UserRound aria-hidden="true" />
        </Button>
      </nav>
      {toast && (
        <CartToast
          nft={toast}
          onView={() => {
            setToast(null);
            setCartOpen(true);
          }}
          onClose={() => setToast(null)}
        />
      )}
      {cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)} onQuantity={updateQuantity} />}
    </div>
  );
}
