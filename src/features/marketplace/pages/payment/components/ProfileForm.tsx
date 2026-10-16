import type { ReactNode } from "react";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { providerLabels } from "@/features/marketplace/utils/payment";
import type { Profile, ProfileErrors } from "../profile";

type ProfileFormProps = {
  profile: Profile;
  errors: ProfileErrors;
  provider: WalletProvider;
  onChange: (patch: Partial<Profile>) => void;
  onProvider: (provider: WalletProvider) => void;
};

type FieldProps = {
  name: keyof Profile;
  label?: string;
  error?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby": string }) => ReactNode;
};

function Field({ name, label, error, children }: FieldProps) {
  const id = `pay-${name}`;
  return (
    <div className="pay-field">
      {label ? (
        <label htmlFor={id}>
          {label}
          <span aria-hidden="true"> *</span>
        </label>
      ) : (
        <span className="pay-field-spacer" aria-hidden="true" />
      )}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": `${id}-error` })}
      <p id={`${id}-error`} className="pay-error" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

export function ProfileForm({ profile, errors, provider, onChange, onProvider }: ProfileFormProps) {
  const text = (name: keyof Profile, label: string | undefined, placeholder?: string, type = "text") => (
    <Field name={name} label={label} error={errors[name]}>
      {(aria) => (
        <input
          {...aria}
          type={type}
          autoComplete="off"
          aria-label={label ? undefined : placeholder}
          placeholder={placeholder}
          value={String(profile[name])}
          onChange={(event) => onChange({ [name]: event.target.value })}
        />
      )}
    </Field>
  );

  return (
    <section className="pay-profile" aria-labelledby="pay-profile-title">
      <h2 id="pay-profile-title">Perfil do colecionador</h2>
      <div className="pay-grid">
        {text("displayName", "Nome de exibição")}
        {text("username", "Nome de usuário")}
        <Field name="network" label="Rede" error={errors.network}>
          {(aria) => (
            <select
              {...aria}
              value={profile.network}
              onChange={(event) => onChange({ network: event.target.value as Profile["network"] })}
            >
              <option value="">Selecione uma rede</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Polygon">Polygon</option>
            </select>
          )}
        </Field>
        {text("profileName", "Nome do perfil")}
        {text("address", "Endereço da carteira", "Endereço 0x da carteira")}
        {text("secondary", undefined, "ENS ou carteira secundária (opcional)")}
        <div className="pay-field">
          <label htmlFor="pay-walletType">
            Tipo de carteira<span aria-hidden="true"> *</span>
          </label>
          <select
            id="pay-walletType"
            value={provider}
            onChange={(event) => onProvider(event.target.value as WalletProvider)}
          >
            {Object.entries(providerLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="pay-error" />
        </div>
        {text("referral", "Código de indicação")}
        {text("email", "E-mail", undefined, "email")}
        <div className="pay-field">
          <label htmlFor="pay-ens">
            Nome ENS<span aria-hidden="true"> *</span>
          </label>
          <div className="pay-ens">
            <input
              id="pay-ens"
              autoComplete="off"
              aria-invalid={Boolean(errors.ens)}
              aria-describedby="pay-ens-error"
              value={profile.ens}
              onChange={(event) => onChange({ ens: event.target.value })}
            />
            <select aria-label="Domínio ENS" defaultValue=".eth">
              <option>.eth</option>
            </select>
          </div>
          <p id="pay-ens-error" className="pay-error" role={errors.ens ? "alert" : undefined}>
            {errors.ens}
          </p>
        </div>
      </div>

      <label className="pay-check">
        <input
          type="checkbox"
          checked={profile.useOther}
          onChange={(event) => onChange({ useOther: event.target.checked })}
        />
        Usar outra carteira?
      </label>
      <div className="pay-field pay-note">
        <label htmlFor="pay-note">Observação do colecionador (opcional)</label>
        <textarea
          id="pay-note"
          rows={5}
          maxLength={300}
          value={profile.note}
          onChange={(event) => onChange({ note: event.target.value })}
        />
      </div>
    </section>
  );
}
