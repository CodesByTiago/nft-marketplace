import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionUser } from "@/core/auth/AuthContext";
import { getWallets, saveWallets, ValidationError } from "@/features/marketplace/services/accountService";
import { AccountShell } from "../profile/components/AccountShell";
import { PrimaryFields } from "./components/PrimaryFields";
import { SecondarySection } from "./components/SecondarySection";
import {
  emptyPrimary,
  validatePrimary,
  type PrimaryWallet,
  type SecondaryWallet,
  type WalletErrors,
  type WalletsData,
} from "./wallet";

function WalletsContent({ user, initial }: { user: SessionUser; initial: WalletsData }) {
  const queryClient = useQueryClient();
  const [data, setData] = useState<WalletsData>(initial);
  // Último estado confirmado pelo servidor: salvar a secundária não envia edições pendentes da principal.
  const [stored, setStored] = useState<WalletsData>(initial);
  const [errors, setErrors] = useState<WalletErrors>({});
  const [saved, setSaved] = useState("");
  const [failure, setFailure] = useState("");
  const save = useMutation({
    mutationFn: saveWallets,
    onSuccess: (result) => queryClient.setQueryData(["private", "wallets", user.id], result),
  });

  async function persist(next: WalletsData, message: string) {
    setFailure("");
    try {
      const result = await save.mutateAsync(next);
      setStored(result);
      setSaved(message);
      return result;
    } catch (error) {
      if (error instanceof ValidationError) setErrors(error.errors);
      else setFailure("Não foi possível salvar agora. Tente novamente.");
      return undefined;
    }
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validatePrimary(data.primary);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`wallet-${first}`)?.focus();
      return;
    }
    const result = await persist({ primary: data.primary, secondary: stored.secondary }, "Carteira principal salva.");
    if (result) setData((current) => ({ ...current, secondary: result.secondary }));
  }

  function addNew() {
    setErrors({});
    setSaved("");
    setData((current) => ({ ...current, primary: { ...emptyPrimary, email: user.email } }));
    document.getElementById("wallet-displayName")?.focus();
  }

  return (
    <div className="account-form wallets">
      <form className="account-form" noValidate onSubmit={(event) => void submit(event)}>
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
        {failure && (
          <p role="alert" className="account-error">
            {failure}
          </p>
        )}
        <button type="submit" className="account-primary account-save wallet-save" disabled={save.isPending}>
          {save.isPending ? "Salvando…" : "Salvar carteira"}
        </button>
      </form>
      <SecondarySection
        primary={data.primary}
        secondary={data.secondary}
        onChange={(secondary: SecondaryWallet | null) =>
          void persist(
            { primary: stored.primary, secondary },
            secondary ? "Carteira secundária salva." : "Carteira secundária removida.",
          ).then((result) => result && setData((current) => ({ ...current, secondary: result.secondary })))
        }
      />
    </div>
  );
}

function WalletsLoader({ user }: { user: SessionUser }) {
  const { data, isError, refetch } = useQuery({ queryKey: ["private", "wallets", user.id], queryFn: getWallets });
  if (isError) {
    return (
      <p role="alert" className="account-error">
        Não foi possível carregar suas carteiras.{" "}
        <button type="button" className="account-link" onClick={() => void refetch()}>
          Tentar novamente
        </button>
      </p>
    );
  }
  if (!data) return <p role="status">Carregando suas carteiras…</p>;
  return <WalletsContent user={user} initial={data} />;
}

export default function WalletsPage() {
  return (
    <AccountShell section="wallets" title="Carteiras">
      {(user) => <WalletsLoader key={user.id} user={user} />}
    </AccountShell>
  );
}
