import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AccountShell } from "./components/AccountShell";
import { accountItems, type AccountSection } from "./components/AccountSidebar";

/** Seções da conta ainda sem tela: exibem um aviso de manutenção. */
export function MaintenancePage({ section }: { section: AccountSection }) {
  const label = accountItems.find((item) => item.section === section)?.label ?? "Seção";
  return (
    <AccountShell section={section} title={label}>
      {() => (
        <section className="account-form account-maintenance" aria-labelledby="maintenance-title">
          <Wrench aria-hidden="true" />
          <h2 id="maintenance-title">{label} em manutenção</h2>
          <p>Estamos preparando esta área. Volte em breve para conferir as novidades.</p>
          <Button variant="outline" asChild>
            <Link to="/perfil">Voltar ao perfil</Link>
          </Button>
        </section>
      )}
    </AccountShell>
  );
}
