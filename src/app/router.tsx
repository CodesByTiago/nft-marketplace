import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import HomePage from "@/features/marketplace/pages/home/HomePage";
import NftDetailPage from "@/features/marketplace/pages/nft-detail/NftDetailPage";
import { defaultFilters, homeTabs, sortOptions, type HomeSearch } from "@/features/marketplace/types/search";

const rootRoute = createRootRoute({ component: Outlet });
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const minPrice = Number(search.minPrice);
    const maxPrice = Number(search.maxPrice);
    const page = Number(search.page);
    const result: HomeSearch = {
      category: typeof search.category === "string" && search.category ? search.category : undefined,
      collection: typeof search.collection === "string" && search.collection ? search.collection : undefined,
      network: typeof search.network === "string" && search.network ? search.network : undefined,
      minPrice:
        search.minPrice !== undefined && Number.isFinite(minPrice) ? Math.min(20, Math.max(0, minPrice)) : undefined,
      maxPrice:
        search.maxPrice !== undefined && Number.isFinite(maxPrice) ? Math.min(20, Math.max(0.03, maxPrice)) : undefined,
      sort: sortOptions.find((option) => option === search.sort && option !== defaultFilters.sort),
      tab: homeTabs.find((option) => option === search.tab && option !== defaultFilters.tab),
      page: search.page !== undefined && Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined,
    };
    return result;
  },
  component: HomePage,
});

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: NftDetailPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, nftDetailRoute]),
  defaultNotFoundComponent: () => <main className="not-found">Esta página não existe.</main>,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
