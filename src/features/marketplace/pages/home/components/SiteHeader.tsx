import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useActiveSection } from "../hooks/useActiveSection";

const navItems = [
  { id: "inicio", label: "Início" },
  { id: "catalogo", label: "Mercado" },
  { id: "promocoes", label: "Criadores" },
  { id: "diario", label: "Aprenda" },
];
const navIds = navItems.map((item) => item.id);

type SiteHeaderProps = {
  cartCount: number;
  search: string;
  onCart: () => void;
  onSearch: (value: string) => void;
  onFilters: () => void;
};

export function SiteHeader({ cartCount, search, onCart, onSearch, onFilters }: SiteHeaderProps) {
  const activeSection = useActiveSection(navIds);
  return (
    <header className="site-header">
      <div className="header-inner page-width">
        <a className="brand" href="#inicio" aria-label="Kurio, início">
          <span>KURIO</span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={activeSection === id ? "page" : undefined}>
              <span data-label={label}>{label}</span>
              <span className="active-underline" aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <label className="header-search">
            <img src="/images/icon-search.svg" alt="" />
            <Input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Buscar NFTs"
              aria-label="Buscar NFTs"
            />
          </label>
          <Button
            variant="ghost"
            size="icon-lg"
            className="desktop-cart"
            onClick={onCart}
            aria-label={`Abrir carrinho, ${cartCount} itens`}
          >
            <img src="/images/icon-cart.svg" alt="" />
            {cartCount > 0 && (
              <span className="cart-count" key={cartCount}>
                <img src="/images/icon-badge.svg" alt="" />
                <span>{cartCount}</span>
              </span>
            )}
          </Button>
          <Button
            className="login-button"
            onClick={() => window.alert("A conexão de carteira estará disponível no checkout.")}
          >
            <span className="login-icon" aria-hidden="true">
              <img src="/images/icon-login.svg" alt="" />
            </span>
            Entrar
          </Button>
        </div>
      </div>
      <div className="header-divider page-width" aria-hidden="true" />
      <div className="mobile-search-row page-width">
        <label className="mobile-search">
          <Search aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Buscar NFTs"
            aria-label="Buscar NFTs"
          />
        </label>
        <Button variant="outline" size="icon-lg" aria-label="Filtros" onClick={onFilters}>
          <SlidersHorizontal aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
