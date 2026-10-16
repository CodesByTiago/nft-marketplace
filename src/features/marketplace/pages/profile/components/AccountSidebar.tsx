import { Activity, Download, Heart, LogOut, MapPin, ShoppingCart, TriangleAlert, UserRound } from "lucide-react";

const items = [
  { label: "Dados do perfil", icon: UserRound, current: true },
  { label: "Carteiras", icon: MapPin },
  { label: "Atividade", icon: ShoppingCart },
  { label: "Lista de interesse", icon: Heart },
  { label: "Ofertas", icon: Activity },
  { label: "Arquivos baixados", icon: Download },
  { label: "Suporte", icon: TriangleAlert },
];

export function AccountSidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="account-sidebar" aria-label="Meu perfil">
      <h2>Meu perfil</h2>
      <ul>
        {items.map(({ label, icon: Icon, current }) => (
          <li key={label}>
            {/* As demais seções ainda não existem: ficam visíveis, porém indisponíveis. */}
            <button
              type="button"
              disabled={!current}
              aria-current={current ? "page" : undefined}
              title={current ? undefined : "Disponível em breve"}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
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
