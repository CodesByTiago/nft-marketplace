import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils/cn";
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

const brandClass = "inline-flex h-[34.3px] w-40 shrink-0 items-center text-[14px] font-bold tracking-[1.4px]";
const navLinkClass =
  "group/nav flex flex-col items-start gap-6 text-[16px] leading-[normal] text-foreground hover:text-primary-light aria-[current=page]:font-bold aria-[current=page]:text-primary-light";
const searchInputClass =
  "border-0 bg-transparent text-[12px] focus-visible:outline-0! focus-visible:ring-0 md:text-[12px]";
const loginButtonClass =
  "login-button h-[35px] w-[100px] gap-1 rounded-[6px] border-0 bg-primary p-0 text-[16px] font-medium text-background hover:bg-primary-light hover:text-background";
const loginIcon = (
  <span className="grid size-5 shrink-0 place-items-center" aria-hidden="true">
    <img src="/images/icon-login.svg" alt="" width="18" height="17" />
  </span>
);

type SiteHeaderProps = {
  cart: CartEntry[];
  search: string;
  /** Item de menu fixo; sem ele, o ativo acompanha a seção visível da home. */
  activeId?: string;
  /** Páginas de conteúdo (blog) não precisam de busca nem filtros. */
  hideSearch?: boolean;
  onSearch: (value: string) => void;
  onSearchSubmit?: () => void;
  onFilters?: () => void;
};

export function SiteHeader({
  cart,
  search,
  activeId,
  hideSearch,
  onSearch,
  onSearchSubmit,
  onFilters,
}: SiteHeaderProps) {
  const scrollSection = useActiveSection(navIds);
  const activeSection = activeId ?? scrollSection;
  const offHome = activeId !== undefined;
  const { user, openAuth } = useAuth();
  return (
    <header className="site-header sticky top-0 z-50 bg-background pt-6 max-[640px]:pt-10">
      <div className="header-inner page-width flex h-12 items-start justify-between max-[640px]:hidden">
        {offHome ? (
          <Link className={brandClass} to="/" hash="inicio" aria-label="Kurio, início">
            <span>KURIO</span>
          </Link>
        ) : (
          <a className={brandClass} href="#inicio" aria-label="Kurio, início">
            <span>KURIO</span>
          </a>
        )}
        <nav className="flex items-start gap-10 max-[900px]:gap-[18px]" aria-label="Navegação principal">
          {navItems.map(({ id, label }) => {
            const content = (
              <>
                <span
                  data-label={label}
                  className="after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-label)]"
                >
                  {label}
                </span>
                <span
                  className="block h-[3px] w-[58px] bg-[url('/images/header-underline.svg')] bg-no-repeat invisible group-aria-[current=page]/nav:visible"
                  aria-hidden="true"
                />
              </>
            );
            const current = activeSection === id ? "page" : undefined;
            return offHome ? (
              <Link key={id} className={navLinkClass} to="/" hash={id} aria-current={current}>
                {content}
              </Link>
            ) : (
              <a key={id} className={navLinkClass} href={`#${id}`} aria-current={current}>
                {content}
              </a>
            );
          })}
        </nav>
        <div className="flex h-[35px] items-center gap-7">
          {!hideSearch && (
            <label className="header-search group/search relative flex w-5 items-center text-muted-foreground">
              <img src="/images/icon-search.svg" alt="" width="20" height="20" />
              <Input
                className={cn(
                  searchInputClass,
                  "pointer-events-none absolute top-[calc(100%_+_12px)] right-0 z-10 h-[38px] w-0 p-0 opacity-0 group-focus-within/search:pointer-events-auto group-focus-within/search:w-[190px] group-focus-within/search:border group-focus-within/search:border-border group-focus-within/search:bg-surface group-focus-within/search:px-3 group-focus-within/search:opacity-100 focus-visible:border-border",
                )}
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearchSubmit?.();
                }}
                placeholder="Buscar NFTs"
                aria-label="Buscar NFTs"
              />
            </label>
          )}
          <CartPreview items={cart} />
          {user ? (
            <Button className={cn(loginButtonClass, "is-user w-auto max-w-[170px] min-w-[100px] px-2.5")} asChild>
              <Link to="/perfil" aria-label={`${user.username}, meu perfil`}>
                {loginIcon}
                <span className="truncate">{user.username}</span>
              </Link>
            </Button>
          ) : (
            <Button className={loginButtonClass} onClick={() => openAuth("login")}>
              {loginIcon}
              Entrar
            </Button>
          )}
        </div>
      </div>
      <div
        className="page-width h-px -translate-y-0.5 bg-[url('/images/header-divider.svg')] bg-[length:100%_1px] bg-center bg-no-repeat max-[640px]:hidden"
        aria-hidden="true"
      />
      {!hideSearch && (
        <div className="page-width hidden h-[45px] gap-2 max-[640px]:flex">
          <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl bg-[#291913] px-3 text-muted-foreground">
            <Search className="w-5 shrink-0" aria-hidden="true" />
            <Input
              className={cn(searchInputClass, "h-[45px] min-w-0 p-0 text-foreground")}
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
            <Button
              className="size-[45px] shrink-0 rounded-xl border-0 bg-primary text-background hover:bg-primary hover:text-background"
              variant="outline"
              size="icon-lg"
              aria-label="Filtros"
              onClick={onFilters}
            >
              <SlidersHorizontal aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
