import { useNavigate, Link } from "@tanstack/react-router";
import { Heart, Home, ScanLine, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";

// Classes compartilhadas com a barra da home (HomePage), que tem o filtro de favoritos.
export const tabBarClass =
  "fixed inset-x-0 bottom-0 z-45 hidden h-24 items-start rounded-t-[32px] bg-surface pt-[25px] max-[640px]:flex";
export const tabLinkClass =
  "absolute top-[25px] left-[6.5%] grid size-[38px] place-items-center rounded-full text-primary-light";
export const tabScanClass =
  "absolute top-[-31px] left-[calc(50%_-_32px)] size-[65px] rounded-full border-[5px] border-[#140d0a] bg-primary text-background hover:bg-primary";
const tabButtonClass =
  "absolute top-[25px] grid size-[38px] place-items-center rounded-full border-0 text-muted-foreground hover:text-muted-foreground";
export const tabHeartClass = cn(tabButtonClass, "left-[24%]");
export const tabCartClass = cn(tabButtonClass, "left-[68.4%]");
export const tabProfileClass = cn(tabButtonClass, "left-[83.3%]");
export const tabIconClass = "size-[19px]";
export const tabScanIconClass = "size-[23px]";

/** Navegação inferior do mobile para as páginas fora da home (a home tem a sua, com o filtro de favoritos). */
export function MobileTabBar({ cartCount, current }: { cartCount: number; current?: "wishlist" | "profile" }) {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  return (
    <nav className={tabBarClass} aria-label="Navegação inferior">
      <Link className={tabLinkClass} to="/" hash="inicio" aria-label="Início">
        <Home className={tabIconClass} aria-hidden="true" />
      </Link>
      <Button
        className={tabHeartClass}
        variant="ghost"
        size="icon-lg"
        aria-label="Lista de interesse"
        aria-current={current === "wishlist" ? "page" : undefined}
        onClick={() => void navigate({ to: "/perfil/lista-de-interesse" })}
      >
        <Heart className={tabIconClass} aria-hidden="true" />
      </Button>
      <Button
        className={tabScanClass}
        size="icon-lg"
        aria-label="Ir para o catálogo"
        onClick={() => void navigate({ to: "/", hash: "catalogo" })}
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
        aria-current={current === "profile" ? "page" : undefined}
        onClick={() => (user ? void navigate({ to: "/perfil" }) : openAuth("login"))}
      >
        <UserRound className={tabIconClass} aria-hidden="true" />
      </Button>
    </nav>
  );
}
