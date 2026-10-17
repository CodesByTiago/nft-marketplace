import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { readSession } from "@/core/auth/session";
import AuthGatePage from "@/features/auth/pages/gate/AuthGatePage";
import HomePage from "@/features/marketplace/pages/home/HomePage";
import { MaintenancePage } from "@/features/marketplace/pages/profile/MaintenancePage";
import type { AccountSection } from "@/features/marketplace/pages/profile/components/AccountSidebar";
import { defaultFilters, homeTabs, sortOptions, type HomeSearch } from "@/features/marketplace/types/search";

const rootRoute = createRootRoute({ component: Outlet });

// Fluxos privados exigem sessão: sem ela, o acesso (inclusive direto ou por refresh) vai ao login e retorna à origem.
const requireSession = ({ location }: { location: { href: string } }) => {
  if (!readSession()) throw redirect({ to: "/entrar", search: { redirect: location.href }, replace: true });
};

const authGateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/entrar",
  validateSearch: (search: Record<string, unknown>): { redirect: string } => {
    const target = typeof search.redirect === "string" ? search.redirect : "";
    // Só caminhos internos: evita redirecionamento aberto.
    const safe = target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/entrar");
    return { redirect: safe ? target : "/" };
  },
  component: function AuthGate() {
    return <AuthGatePage redirect={authGateRoute.useSearch().redirect} />;
  },
});
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
  component: lazyRouteComponent(() => import("@/features/marketplace/pages/nft-detail/NftDetailPage")),
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/carrinho",
  component: lazyRouteComponent(() => import("@/features/marketplace/pages/cart/CartPage")),
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pagamento",
  beforeLoad: requireSession,
  validateSearch: (search: Record<string, unknown>): { coupon?: string } => ({
    coupon: typeof search.coupon === "string" && search.coupon ? search.coupon : undefined,
  }),
  component: lazyRouteComponent(() => import("@/features/marketplace/pages/payment/PaymentPage")),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/perfil",
  beforeLoad: requireSession,
  component: lazyRouteComponent(() => import("@/features/marketplace/pages/profile/ProfilePage")),
});

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/perfil/carteiras",
  beforeLoad: requireSession,
  component: lazyRouteComponent(() => import("@/features/marketplace/pages/wallets/WalletsPage")),
});

const maintenanceRoutes = (
  [
    ["/perfil/atividade", "activity"],
    ["/perfil/lista-de-interesse", "wishlist"],
    ["/perfil/ofertas", "offers"],
    ["/perfil/arquivos-baixados", "downloads"],
    ["/perfil/suporte", "support"],
  ] as const satisfies readonly (readonly [string, AccountSection])[]
).map(([path, section]) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: requireSession,
    component: () => <MaintenancePage section={section} />,
  }),
);

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    homeRoute,
    authGateRoute,
    nftDetailRoute,
    cartRoute,
    paymentRoute,
    profileRoute,
    walletsRoute,
    ...maintenanceRoutes,
  ]),
  defaultNotFoundComponent: () => <main className="not-found">Esta página não existe.</main>,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
