import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { Heart, Home, ScanLine, Search, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";
import { useAuth } from "@/core/auth/AuthContext";
import { getNfts } from "@/features/marketplace/services/nftService";
import { defaultFilters, type HomeFilters } from "@/features/marketplace/types/search";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
import { CartToast } from "@/features/marketplace/components/CartToast";
import {
  tabBarClass,
  tabCartClass,
  tabHeartClass,
  tabIconClass,
  tabLinkClass,
  tabProfileClass,
  tabScanClass,
  tabScanIconClass,
} from "@/features/marketplace/components/MobileTabBar";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { BlogSection } from "./components/BlogSection";
import { CatalogToolbar } from "./components/CatalogToolbar";
import { FilterSidebar, type FilterOption } from "./components/FilterSidebar";
import { HeroCarousel } from "./components/HeroCarousel";
import { NftCard } from "@/features/marketplace/components/NftCard";
import { Pagination } from "./components/Pagination";
import { PromoSection } from "./components/PromoSection";

const PAGE_SIZE = 9;
const nftGrid =
  "mt-8 grid grid-cols-3 items-start gap-x-[34px] gap-y-22 max-[900px]:grid-cols-2 max-[900px]:gap-x-5 max-[900px]:gap-y-9 max-[640px]:mt-4 max-[640px]:gap-x-4 max-[640px]:gap-y-6";
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
  const { user, openAuth } = useAuth();
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
  const locationState = useLocation({ select: (location) => location.state as { q?: string } });
  const [searchTerm, setSearchTerm] = useState(locationState.q ?? "");
  const { cart, cartCount, addToCart, toast, dismissToast } = useCartPanel();
  const { favorites, toggleFavorite, failed: favoriteFailed } = useFavorites();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    // Falhas transitórias são absorvidas com poucas retentativas rápidas.
    retry: 2,
    retryDelay: 400,
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

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteHeader
        cart={cart}
        search={searchTerm}
        onSearch={(value) => setSearchTerm(value)}
        onFilters={() => setFiltersOpen((open) => !open)}
      />

      <main>
        <HeroCarousel />

        <section className="catalog-section page-width mt-24 max-[640px]:mt-4" id="catalogo">
          <div
            className={cn(
              "catalog-layout grid grid-cols-[310px_minmax(0,1fr)] items-start gap-12 max-[900px]:grid-cols-[250px_minmax(0,1fr)] max-[900px]:gap-6 max-[640px]:block",
              filtersOpen &&
                "filters-open max-[640px]:before:fixed max-[640px]:before:inset-0 max-[640px]:before:z-79 max-[640px]:before:bg-[rgba(10,6,4,.72)] max-[640px]:before:content-['']",
            )}
          >
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

            <div className="min-w-0">
              <CatalogToolbar
                tab={tab}
                sort={sort}
                onTab={(value) => updateSearch({ tab: value, page: 1 })}
                onSort={(value) => updateSearch({ sort: value, page: 1 })}
              />
              {favoriteFailed && (
                <p role="alert" className="mb-3 text-[14px] text-[#ff8a8a]">
                  Não foi possível atualizar seus favoritos. Tente novamente.
                </p>
              )}
              {isError ? (
                <div className="catalog-message" role="alert">
                  <h3>Não foi possível carregar os NFTs</h3>
                  <p>Verifique sua conexão e tente novamente.</p>
                  <Button variant="outline" onClick={() => void refetch()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : isPending ? (
                <div className={nftGrid} aria-label="Carregando catálogo" aria-busy="true">
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
                <div className={nftGrid}>
                  {visibleNfts.map((nft, index) => (
                    <NftCard
                      key={nft.id}
                      nft={nft}
                      priority={index < 2}
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
      <nav className={tabBarClass} aria-label="Navegação inferior">
        <a className={tabLinkClass} href="#inicio" aria-label="Início">
          <Home className={tabIconClass} aria-hidden="true" />
        </a>
        <Button
          className={tabHeartClass}
          variant="ghost"
          size="icon-lg"
          aria-label={favoritesOnly ? "Mostrar todos os NFTs" : "Mostrar favoritos"}
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((only) => !only)}
        >
          <Heart className={tabIconClass} aria-hidden="true" fill={favoritesOnly ? "currentColor" : "none"} />
        </Button>
        <Button
          className={tabScanClass}
          size="icon-lg"
          aria-label="Ir para o catálogo"
          onClick={() => document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" })}
        >
          <ScanLine className={tabScanIconClass} aria-hidden="true" />
        </Button>
        <Button
          className={tabCartClass}
          variant="ghost"
          size="icon-lg"
          aria-label={`Abrir carrinho, ${cartCount} itens`}
          onClick={() => void navigate({ to: "/carrinho" })}
        >
          <ShoppingBag className={tabIconClass} aria-hidden="true" />
        </Button>
        <Button
          className={tabProfileClass}
          variant="ghost"
          size="icon-lg"
          aria-label={user ? `Meu perfil (${user.username})` : "Perfil"}
          onClick={() => (user ? void navigate({ to: "/perfil" }) : openAuth("login"))}
        >
          <UserRound className={tabIconClass} aria-hidden="true" />
        </Button>
      </nav>
      {toast && <CartToast nft={toast} onView={() => void navigate({ to: "/carrinho" })} onClose={dismissToast} />}
    </div>
  );
}
