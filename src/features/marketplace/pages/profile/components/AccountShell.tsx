import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth, type SessionUser } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { MobileTabBar } from "@/features/marketplace/components/MobileTabBar";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import { AccountSidebar, accountItems, type AccountSection } from "./AccountSidebar";

type AccountShellProps = {
  section: AccountSection;
  title: string;
  children: (user: SessionUser) => ReactNode;
};

/** Cabeçalho, breadcrumb, menu lateral e bloqueio de acesso comuns às telas da conta. */
export function AccountShell({ section, title, children }: AccountShellProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { user, openAuth, logout } = useAuth();
  const { cart } = useCartPanel();
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | Kurio`;
    return () => {
      document.title = "Kurio";
    };
  }, [title]);

  function goBack() {
    if (canGoBack) router.history.back();
    else void navigate({ to: "/" });
  }

  function leave() {
    logout();
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page cart-page account-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="inicio"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />
      <main className="cart-main page-width">
        <nav className="detail-breadcrumb" aria-label="Você está em">
          <Link to="/" hash="inicio">
            Início
          </Link>
          {" / "}
          <Link to="/perfil">Meu perfil</Link>
          {section !== "profile" && ` / ${accountItems.find((item) => item.section === section)?.label}`}
        </nav>
        <header className="cart-mobile-header">
          <Button variant="ghost" size="icon" aria-label="Voltar" onClick={goBack}>
            <ArrowLeft aria-hidden="true" />
          </Button>
          <h1>{title}</h1>
        </header>
        {user ? (
          <div className="account-layout">
            <AccountSidebar current={section} onLogout={leave} />
            {children(user)}
          </div>
        ) : (
          <div className="catalog-message cart-empty">
            <h1>Entre para ver seu perfil</h1>
            <p>Faça login para editar seus dados de colecionador.</p>
            <Button onClick={() => openAuth("login")}>Entrar</Button>
          </div>
        )}
      </main>
      <SiteFooter />
      <MobileTabBar cartCount={cart.length} current={section === "wishlist" ? "wishlist" : "profile"} />
    </div>
  );
}
