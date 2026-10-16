import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { WalletNetwork } from "@/features/marketplace/types/payment";
import { providerLabels } from "@/features/marketplace/utils/payment";
import type { PrimaryWallet, WalletErrors } from "../wallet";

type Aria = { id: string; "aria-invalid": boolean; "aria-describedby": string };

export function WalletField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label?: string;
  error?: string;
  children: (aria: Aria) => ReactNode;
}) {
  return (
    <div className="account-field">
      {label ? (
        <label htmlFor={id}>
          {label}
          <span aria-hidden="true">*</span>
        </label>
      ) : (
        <span className="account-field-spacer" aria-hidden="true" />
      )}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": `${id}-error` })}
      <p id={`${id}-error`} className="account-error" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

export function Select({
  value,
  children,
  ...aria
}: Aria & { value: string; children: ReactNode; onChange: (value: string) => void }) {
  const { onChange, ...rest } = aria;
  return (
    <div className="account-select wide">
      <select
        {...rest}
        value={value}
        data-empty={value === "" || undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" />
    </div>
  );
}

type PrimaryFieldsProps = {
  wallet: PrimaryWallet;
  errors: WalletErrors;
  onChange: (patch: Partial<PrimaryWallet>) => void;
};

export function PrimaryFields({ wallet, errors, onChange }: PrimaryFieldsProps) {
  const text = (name: keyof PrimaryWallet, label?: string, placeholder?: string, type = "text") => (
    <WalletField id={`wallet-${name}`} label={label} error={errors[name]}>
      {(aria) => (
        <input
          {...aria}
          type={type}
          autoComplete="off"
          aria-label={label ? undefined : placeholder}
          placeholder={placeholder}
          value={wallet[name]}
          onChange={(event) => onChange({ [name]: event.target.value })}
        />
      )}
    </WalletField>
  );

  return (
    <div className="account-grid">
      {text("displayName", "Nome de exibição")}
      {text("nickname", "Apelido da carteira")}
      <WalletField id="wallet-network" label="Rede" error={errors.network}>
        {(aria) => (
          <Select
            {...aria}
            value={wallet.network}
            onChange={(value) => onChange({ network: value as WalletNetwork | "" })}
          >
            <option value="">Selecione uma rede</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Polygon">Polygon</option>
          </Select>
        )}
      </WalletField>
      {text("profileName", "Nome do perfil")}
      {text("address", "Endereço da carteira", "Endereço 0x da carteira")}
      {text("secondary", undefined, "ENS ou carteira secundária (opcional)")}
      <WalletField id="wallet-provider" label="Tipo de carteira" error={errors.provider}>
        {(aria) => (
          <Select
            {...aria}
            value={wallet.provider}
            onChange={(value) => onChange({ provider: value as PrimaryWallet["provider"] })}
          >
            <option value="">Selecione uma carteira</option>
            {Object.entries(providerLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        )}
      </WalletField>
      {text("referral", "Código de indicação")}
      {text("email", "E-mail", undefined, "email")}
      <WalletField id="wallet-ens" label="Nome ENS" error={errors.ens}>
        {(aria) => (
          <div className="account-ens">
            <div className="account-select">
              <select aria-label="Domínio ENS" defaultValue=".eth">
                <option value=".eth">.eth</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </div>
            <input
              {...aria}
              autoComplete="off"
              value={wallet.ens}
              onChange={(event) => onChange({ ens: event.target.value })}
            />
          </div>
        )}
      </WalletField>
    </div>
  );
}
