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
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page cart-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="inicio"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />
      <main className="mx-auto w-[min(1200px,calc(100%-48px))] pt-6 pb-16 max-[640px]:m-0 max-[640px]:w-full max-[640px]:px-7 max-[640px]:pt-8 max-[640px]:pb-12">
        <nav
          className="mb-6 text-[15px] font-bold text-muted-foreground max-[640px]:hidden [&>a:hover]:text-primary-light"
          aria-label="Você está em"
        >
          <Link to="/" hash="inicio">
            Início
          </Link>
          {" / "}
          <Link to="/perfil">Meu perfil</Link>
          {section !== "profile" && ` / ${accountItems.find((item) => item.section === section)?.label}`}
        </nav>
        <header className="hidden h-11 items-center gap-6 mb-8 max-[640px]:flex [&>button]:size-[35px] [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-surface-raised">
          <Button variant="ghost" size="icon" aria-label="Voltar" onClick={goBack}>
            <ArrowLeft aria-hidden="true" />
          </Button>
          <h1 className="text-xl font-bold">{title}</h1>
        </header>
        {user ? (
          <div className="flex items-start gap-7 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-6">
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
