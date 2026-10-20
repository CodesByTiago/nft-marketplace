import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Download, Heart, LogOut, MapPin, ShoppingCart, TriangleAlert, UserRound } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const itemClass =
  "flex w-full cursor-pointer items-center gap-3 px-4 text-left text-[15px] text-primary-light hover:bg-primary-light/8 [&>svg]:size-[18px] [&>svg]:flex-none";
const linkItemClass =
  "border-l-6 border-transparent leading-[45px] aria-[current=page]:gap-4 aria-[current=page]:border-l-primary max-[640px]:h-10 max-[640px]:w-auto max-[640px]:gap-2 max-[640px]:rounded-[20px] max-[640px]:border max-[640px]:border-border max-[640px]:px-3.5 max-[640px]:text-[13px] max-[640px]:leading-none max-[640px]:whitespace-nowrap max-[640px]:aria-[current=page]:gap-4 max-[640px]:aria-[current=page]:border-primary max-[640px]:aria-[current=page]:bg-surface";
const logoutClass =
  "h-10 gap-2 border-t border-border font-bold leading-4 max-[640px]:mt-1 max-[640px]:w-auto max-[640px]:self-start max-[640px]:rounded-[20px] max-[640px]:border max-[640px]:px-3.5";

export type AccountSection = "profile" | "wallets" | "activity" | "wishlist" | "offers" | "downloads" | "support";

export const accountItems = [
  { label: "Dados do perfil", icon: UserRound, section: "profile", to: "/perfil" },
  { label: "Carteiras", icon: MapPin, section: "wallets", to: "/perfil/carteiras" },
  { label: "Atividade", icon: ShoppingCart, section: "activity", to: "/perfil/atividade" },
  { label: "Lista de interesse", icon: Heart, section: "wishlist", to: "/perfil/lista-de-interesse" },
  { label: "Ofertas", icon: Activity, section: "offers", to: "/perfil/ofertas" },
  { label: "Arquivos baixados", icon: Download, section: "downloads", to: "/perfil/arquivos-baixados" },
  { label: "Suporte", icon: TriangleAlert, section: "support", to: "/perfil/suporte" },
] as const;

export function AccountSidebar({ current, onLogout }: { current: AccountSection; onLogout: () => void }) {
  const list = useRef<HTMLUListElement>(null);

  // No mobile o menu rola na horizontal: traz o item ativo para a área visível.
  useEffect(() => {
    const active = list.current?.querySelector<HTMLElement>("[aria-current=page]");
    if (list.current && active) list.current.scrollLeft = Math.max(0, active.offsetLeft - 28);
  }, [current]);

  return (
    <aside
      className="flex w-[310px] flex-none flex-col bg-surface py-2 max-[640px]:w-full max-[640px]:bg-transparent max-[640px]:p-0"
      aria-label="Meu perfil"
    >
      <h2 className="p-2.5 text-center text-lg leading-4 font-bold max-[640px]:hidden">Meu perfil</h2>
      <ul
        ref={list}
        className="m-0 list-none p-0 max-[640px]:flex max-[640px]:gap-2 max-[640px]:overflow-x-auto max-[640px]:pb-2"
      >
        {accountItems.map(({ label, icon: Icon, section, to }) => (
          <li key={section}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              aria-current={section === current ? "page" : undefined}
              className={cn(itemClass, linkItemClass)}
            >
              <Icon aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" className={cn(itemClass, logoutClass)} onClick={onLogout}>
        <LogOut aria-hidden="true" />
        Sair
      </button>
    </aside>
  );
}
