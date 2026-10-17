import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Download, Heart, LogOut, MapPin, ShoppingCart, TriangleAlert, UserRound } from "lucide-react";

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
    <aside className="account-sidebar" aria-label="Meu perfil">
      <h2>Meu perfil</h2>
      <ul ref={list}>
        {accountItems.map(({ label, icon: Icon, section, to }) => (
          <li key={section}>
            <Link to={to} activeOptions={{ exact: true }} aria-current={section === current ? "page" : undefined}>
              <Icon aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" className="account-logout" onClick={onLogout}>
        <LogOut aria-hidden="true" />
        Sair
      </button>
    </aside>
  );
}
