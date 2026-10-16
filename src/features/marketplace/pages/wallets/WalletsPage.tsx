import { useState, type FormEvent } from "react";
import type { SessionUser } from "@/core/auth/AuthContext";
import { AccountShell } from "../profile/components/AccountShell";
import { PrimaryFields } from "./components/PrimaryFields";
import { SecondarySection } from "./components/SecondarySection";
import {
  emptyPrimary,
  loadWallets,
  saveWallets,
  validatePrimary,
  type PrimaryWallet,
  type SecondaryWallet,
  type WalletErrors,
  type WalletsData,
} from "./wallet";

function WalletsContent({ user }: { user: SessionUser }) {
  const [data, setData] = useState<WalletsData>(() => loadWallets(user.id, user.email));
  const [errors, setErrors] = useState<WalletErrors>({});
  const [saved, setSaved] = useState("");

  function persist(next: WalletsData, message: string) {
    setData(next);
    saveWallets(user.id, next);
    setSaved(message);
  }

  function patch(change: Partial<PrimaryWallet>) {
    setData((current) => ({ ...current, primary: { ...current.primary, ...change } }));
    setSaved("");
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(change)) delete next[key as keyof WalletErrors];
      return next;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validatePrimary(data.primary);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`wallet-${first}`)?.focus();
      return;
    }
    persist(data, "Carteira principal salva.");
  }

  function addNew() {
    setErrors({});
    setSaved("");
    setData((current) => ({ ...current, primary: { ...emptyPrimary, email: user.email } }));
    document.getElementById("wallet-displayName")?.focus();
  }

  return (
    <div className="account-form wallets">
      <form className="account-form" noValidate onSubmit={submit}>
        <header className="wallet-head">
          <h2>Carteira principal</h2>
          <button type="button" className="account-link" onClick={addNew}>
            Adicionar
          </button>
        </header>
        <p className="wallet-note wallet-intro">
          Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
        </p>
        <PrimaryFields wallet={data.primary} errors={errors} onChange={patch} />
        {saved && (
          <p className="account-saved" role="status">
            {saved}
          </p>
        )}
        <button type="submit" className="account-primary account-save wallet-save">
          Salvar carteira
        </button>
      </form>
      <SecondarySection
        primary={data.primary}
        secondary={data.secondary}
        onChange={(secondary: SecondaryWallet | null) =>
          persist({ ...data, secondary }, secondary ? "Carteira secundária salva." : "Carteira secundária removida.")
        }
      />
    </div>
  );
}

export default function WalletsPage() {
  return (
    <AccountShell section="wallets" title="Carteiras">
      {(user) => <WalletsContent key={user.id} user={user} />}
    </AccountShell>
  );
}
