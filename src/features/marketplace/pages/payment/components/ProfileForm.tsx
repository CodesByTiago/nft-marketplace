import type { ReactNode } from "react";
import type { WalletProvider } from "@/features/marketplace/types/payment";
import { providerLabels } from "@/features/marketplace/utils/payment";
import type { Profile, ProfileErrors } from "../profile";
import { cn } from "@/shared/utils/cn";
import { radioClass } from "../radio";

const fieldClass = "flex min-w-0 flex-col gap-3";
const labelClass =
  "flex items-center gap-1 text-[15px] leading-[15px] [&>span]:text-[22px] [&>span]:leading-[29px] [&>span]:text-[#f0805f]";
const controlClass =
  "h-10 w-full rounded-[3px] border border-border bg-transparent px-3 text-[14px] text-foreground placeholder:text-[#b39463] focus-visible:border-primary focus-visible:outline-0 aria-invalid:border-[#ff8a8a]";
const selectClass = cn(
  controlClass,
  "cursor-pointer appearance-none bg-[url(/images/pay-chevron.svg)] bg-position-[right_10px_center] bg-size-[18px] bg-no-repeat pr-9 [&>option]:bg-surface [&>option]:text-foreground",
);
const errorClass = "text-[12px] text-[#ff8a8a] empty:hidden";

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
    <div className={fieldClass}>
      {label ? (
        <label className={labelClass} htmlFor={id}>
          {label}
          <span aria-hidden="true"> *</span>
        </label>
      ) : (
        <span className="h-[15px]" aria-hidden="true" />
      )}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": `${id}-error` })}
      <p id={`${id}-error`} className={errorClass} role={error ? "alert" : undefined}>
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
          className={controlClass}
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
    <section className="flex min-w-0 flex-1 flex-col gap-6" aria-labelledby="pay-profile-title">
      <h2 id="pay-profile-title" className="text-[17px] font-bold">
        Perfil do colecionador
      </h2>
      <div className="grid grid-cols-2 gap-6">
        {text("displayName", "Nome de exibição")}
        {text("username", "Nome de usuário")}
        <Field name="network" label="Rede" error={errors.network}>
          {(aria) => (
            <select
              {...aria}
              className={selectClass}
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
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="pay-walletType">
            Tipo de carteira<span aria-hidden="true"> *</span>
          </label>
          <select
            id="pay-walletType"
            className={selectClass}
            value={provider}
            onChange={(event) => onProvider(event.target.value as WalletProvider)}
          >
            {Object.entries(providerLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className={errorClass} />
        </div>
        {text("referral", "Código de indicação")}
        {text("email", "E-mail", undefined, "email")}
        <div className={fieldClass}>
          <label className={labelClass} htmlFor="pay-ens">
            Nome ENS<span aria-hidden="true"> *</span>
          </label>
          <div className="flex gap-2">
            <input
              id="pay-ens"
              className={controlClass}
              autoComplete="off"
              aria-invalid={Boolean(errors.ens)}
              aria-describedby="pay-ens-error"
              value={profile.ens}
              onChange={(event) => onChange({ ens: event.target.value })}
            />
            <select aria-label="Domínio ENS" className={cn(selectClass, "w-[92px] flex-none")} defaultValue=".eth">
              <option>.eth</option>
            </select>
          </div>
          <p id="pay-ens-error" className={errorClass} role={errors.ens ? "alert" : undefined}>
            {errors.ens}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-[15px]">
        <input
          className={cn(radioClass, "size-[15px] cursor-pointer")}
          type="checkbox"
          checked={profile.useOther}
          onChange={(event) => onChange({ useOther: event.target.checked })}
        />
        Usar outra carteira?
      </label>
      <div className={fieldClass}>
        <label className={labelClass} htmlFor="pay-note">
          Observação do colecionador (opcional)
        </label>
        <textarea
          id="pay-note"
          className={cn(controlClass, "h-[152px] w-[350px] max-w-full resize-none p-3")}
          rows={5}
          maxLength={300}
          value={profile.note}
          onChange={(event) => onChange({ note: event.target.value })}
        />
      </div>
    </section>
  );
}
