import { useState } from "react";
import type { WalletNetwork } from "@/features/marketplace/types/payment";
import { shortHash } from "@/features/marketplace/utils/payment";
import { validateSecondary, type PrimaryWallet, type SecondaryErrors, type SecondaryWallet } from "../wallet";
import { Select, WalletField } from "./PrimaryFields";

type SecondarySectionProps = {
  primary: PrimaryWallet;
  secondary: SecondaryWallet | null;
  onChange: (wallet: SecondaryWallet | null) => void;
};

const blank: SecondaryWallet = { nickname: "", network: "Ethereum", address: "" };

export function SecondarySection({ primary, secondary, onChange }: SecondarySectionProps) {
  const [draft, setDraft] = useState<SecondaryWallet | null>(null);
  const [errors, setErrors] = useState<SecondaryErrors>({});

  function copyPrimary() {
    if (!primary.address || !primary.network) {
      setDraft({ ...blank, nickname: primary.nickname });
      return;
    }
    onChange({ nickname: primary.nickname || "Principal", network: primary.network, address: primary.address });
    setDraft(null);
  }

  function save() {
    if (!draft) return;
    const found = validateSecondary(draft);
    setErrors(found);
    if (Object.keys(found).length) return;
    onChange(draft);
    setDraft(null);
  }

  const patch = (change: Partial<SecondaryWallet>) => {
    setDraft((current) => (current ? { ...current, ...change } : current));
    setErrors({});
  };

  return (
    <section className="wallet-secondary" aria-labelledby="wallet-secondary-title">
      <div className="wallet-head">
        <h2 id="wallet-secondary-title">Carteira secundária</h2>
        <div className="wallet-secondary-actions">
          <label className="account-radio">
            <input
              type="checkbox"
              checked={Boolean(secondary && secondary.address === primary.address)}
              onChange={(event) => (event.target.checked ? copyPrimary() : onChange(null))}
            />
            Igual à carteira principal
          </label>
          <button type="button" className="account-link" onClick={() => setDraft(secondary ?? blank)}>
            {secondary ? "Editar" : "Adicionar"}
          </button>
        </div>
      </div>
      {draft ? (
        <div className="wallet-draft">
          <div className="account-grid">
            <WalletField id="wallet2-nickname" label="Apelido da carteira" error={errors.nickname}>
              {(aria) => (
                <input
                  {...aria}
                  autoComplete="off"
                  value={draft.nickname}
                  onChange={(event) => patch({ nickname: event.target.value })}
                />
              )}
            </WalletField>
            <WalletField id="wallet2-network" label="Rede">
              {(aria) => (
                <Select
                  {...aria}
                  value={draft.network}
                  onChange={(value) => patch({ network: value as WalletNetwork })}
                >
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                </Select>
              )}
            </WalletField>
            <WalletField id="wallet2-address" label="Endereço da carteira" error={errors.address}>
              {(aria) => (
                <input
                  {...aria}
                  autoComplete="off"
                  placeholder="Endereço 0x da carteira"
                  value={draft.address}
                  onChange={(event) => patch({ address: event.target.value })}
                />
              )}
            </WalletField>
          </div>
          <div className="wallet-draft-actions">
            <button type="button" className="account-primary" onClick={save}>
              Salvar carteira secundária
            </button>
            <button type="button" className="account-text" onClick={() => setDraft(null)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : secondary ? (
        <p className="wallet-note" data-testid="secondary-summary">
          {secondary.nickname} · {secondary.network} · {shortHash(secondary.address)}
        </p>
      ) : (
        <p className="wallet-note">Você ainda não adicionou uma carteira secundária.</p>
      )}
    </section>
  );
}
