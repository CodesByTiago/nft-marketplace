import { useNavigate, Link } from "@tanstack/react-router";
import { Heart, Home, ScanLine, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";

/** Navegação inferior do mobile para as páginas fora da home (a home tem a sua, com o filtro de favoritos). */
export function MobileTabBar({ cartCount, current }: { cartCount: number; current?: "wishlist" | "profile" }) {
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
  return (
    <nav className="mobile-tab-bar" aria-label="Navegação inferior">
      <Link to="/" hash="inicio" aria-label="Início">
        <Home aria-hidden="true" />
      </Link>
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label="Lista de interesse"
        aria-current={current === "wishlist" ? "page" : undefined}
        onClick={() => void navigate({ to: "/perfil/lista-de-interesse" })}
      >
        <Heart aria-hidden="true" />
      </Button>
      <Button
        className="mobile-scan"
        size="icon-lg"
        aria-label="Ir para o catálogo"
        onClick={() => void navigate({ to: "/", hash: "catalogo" })}
      >
        <ScanLine aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label={`Abrir carrinho, ${cartCount} itens`}
        onClick={() => void navigate({ to: "/carrinho" })}
      >
        <ShoppingBag aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        aria-label={user ? `Meu perfil (${user.username})` : "Perfil"}
        aria-current={current === "profile" ? "page" : undefined}
        onClick={() => (user ? void navigate({ to: "/perfil" }) : openAuth("login"))}
      >
        <UserRound aria-hidden="true" />
      </Button>
    </nav>
  );
}
