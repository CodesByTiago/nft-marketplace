import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useActiveSection } from "../hooks/useActiveSection";
import type { CartEntry } from "../types/nft";
import { CartPreview } from "./CartPreview";

const navItems = [
  { id: "inicio", label: "Início" },
  { id: "catalogo", label: "Mercado" },
  { id: "promocoes", label: "Criadores" },
  { id: "diario", label: "Aprenda" },
];
const navIds = navItems.map((item) => item.id);

type SiteHeaderProps = {
  cart: CartEntry[];
  search: string;
  /** Item de menu fixo; sem ele, o ativo acompanha a seção visível da home. */
  activeId?: string;
  onSearch: (value: string) => void;
  onSearchSubmit?: () => void;
  onFilters?: () => void;
};

export function SiteHeader({ cart, search, activeId, onSearch, onSearchSubmit, onFilters }: SiteHeaderProps) {
  const scrollSection = useActiveSection(navIds);
  const activeSection = activeId ?? scrollSection;
  const offHome = activeId !== undefined;
  return (
    <header className="site-header">
      <div className="header-inner page-width">
        {offHome ? (
          <Link className="brand" to="/" hash="inicio" aria-label="Kurio, início">
            <span>KURIO</span>
          </Link>
        ) : (
          <a className="brand" href="#inicio" aria-label="Kurio, início">
            <span>KURIO</span>
          </a>
        )}
        <nav className="main-nav" aria-label="Navegação principal">
          {navItems.map(({ id, label }) => {
            const content = (
              <>
                <span data-label={label}>{label}</span>
                <span className="active-underline" aria-hidden="true" />
              </>
            );
            const current = activeSection === id ? "page" : undefined;
            return offHome ? (
              <Link key={id} to="/" hash={id} aria-current={current}>
                {content}
              </Link>
            ) : (
              <a key={id} href={`#${id}`} aria-current={current}>
                {content}
              </a>
            );
          })}
        </nav>
        <div className="header-actions">
          <label className="header-search">
            <img src="/images/icon-search.svg" alt="" />
            <Input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onSearchSubmit?.();
              }}
              placeholder="Buscar NFTs"
              aria-label="Buscar NFTs"
            />
          </label>
          <CartPreview items={cart} />
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
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearchSubmit?.();
            }}
            placeholder="Buscar NFTs"
            aria-label="Buscar NFTs"
          />
        </label>
        {onFilters && (
          <Button variant="outline" size="icon-lg" aria-label="Filtros" onClick={onFilters}>
            <SlidersHorizontal aria-hidden="true" />
          </Button>
        )}
      </div>
    </header>
  );
}
