import { useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff, ImageIcon } from "lucide-react";
import type { AccountProfile, PasswordChange, ProfileErrors } from "../accountProfile";
import { cn } from "@/shared/utils/cn";
import {
  accountChevron,
  accountError,
  accountField,
  accountGrid,
  accountHeading,
  accountInput,
  accountLabel,
  accountPrimary,
  accountSelect,
  accountSelectBox,
  accountText,
} from "./accountStyles";

const MAX_AVATAR_BYTES = 1024 * 1024;

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: (aria: { id: string; "aria-invalid": boolean; "aria-describedby": string }) => ReactNode;
};

function Field({ id, label, required, error, className, children }: FieldProps) {
  return (
    <div className={cn(accountField, className)}>
      <label htmlFor={id} className={accountLabel}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": `${id}-error` })}
      <p id={`${id}-error`} className={accountError} role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={cn(accountInput, "pr-11")} />
      <button
        type="button"
        className="absolute top-0 right-2 grid h-10 w-8 cursor-pointer place-items-center text-primary-light max-[640px]:h-[50px] [&>svg]:size-[18px]"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </button>
    </div>
  );
}

type ProfileFieldsProps = {
  profile: AccountProfile;
  password: PasswordChange;
  errors: ProfileErrors;
  onProfile: (patch: Partial<AccountProfile>) => void;
  onPassword: (patch: Partial<PasswordChange>) => void;
};

export function ProfileFields({ profile, password, errors, onProfile, onPassword }: ProfileFieldsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = useState("");

  const text = (name: Exclude<keyof AccountProfile, "avatar">, label: string, type = "text") => (
    <Field id={`account-${name}`} label={label} required error={errors[name]}>
      {(aria) => (
        <input
          {...aria}
          className={accountInput}
          type={type}
          autoComplete="off"
          value={profile[name]}
          onChange={(event) => onProfile({ [name]: event.target.value })}
        />
      )}
    </Field>
  );

  const secret = (name: keyof PasswordChange, label: string) => (
    <Field id={`account-${name}`} label={label} error={errors[name]} className="gap-3">
      {(aria) => (
        <PasswordInput
          {...aria}
          autoComplete={name === "current" ? "current-password" : "new-password"}
          value={password[name]}
          onChange={(event) => onPassword({ [name]: event.target.value })}
        />
      )}
    </Field>
  );

  function pickAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Escolha uma imagem de até 1 MB.");
      return;
    }
    setAvatarError("");
    const reader = new FileReader();
    reader.onload = () => onProfile({ avatar: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <>
      <div className={accountGrid}>
        {text("displayName", "Nome de exibição")}
        {text("username", "Nome de usuário")}
        {text("email", "E-mail", "email")}
        <Field id="account-ensName" label="Nome ENS" required error={errors.ensName}>
          {(aria) => (
            <div className="flex gap-2.5">
              <div className={accountSelectBox}>
                <select aria-label="Domínio ENS" defaultValue=".eth" className={accountSelect}>
                  <option value=".eth">.eth</option>
                </select>
                <ChevronDown aria-hidden="true" className={accountChevron} />
              </div>
              <input
                {...aria}
                className={accountInput}
                autoComplete="off"
                value={profile.ensName}
                onChange={(event) => onProfile({ ensName: event.target.value })}
              />
            </div>
          )}
        </Field>
        {text("walletNickname", "Apelido da carteira")}
        <div className={accountField}>
          <span className={accountLabel}>Avatar</span>
          <div className="flex items-center gap-6">
            <span className="grid size-[50px] flex-none place-items-center overflow-hidden rounded-full border border-border bg-surface-raised [&>img]:size-full [&>img]:object-cover [&>svg]:size-6 [&>svg]:text-primary-light">
              {profile.avatar ? <img src={profile.avatar} alt="Seu avatar" /> : <ImageIcon aria-hidden="true" />}
            </span>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              aria-label="Arquivo do avatar"
              onChange={pickAvatar}
            />
            <button type="button" className={accountPrimary} onClick={() => fileInput.current?.click()}>
              Alterar
            </button>
            <button type="button" className={accountText} onClick={() => onProfile({ avatar: "" })}>
              Remover
            </button>
          </div>
          <p className={accountError} role={avatarError ? "alert" : undefined}>
            {avatarError}
          </p>
        </div>
      </div>
      <section
        className="flex max-w-[417px] flex-col gap-6 max-[640px]:max-w-none"
        aria-labelledby="account-password-title"
      >
        <h2 id="account-password-title" className={cn(accountHeading, "font-medium")}>
          Alterar senha
        </h2>
        {secret("current", "Senha atual")}
        {secret("next", "Nova senha")}
        {secret("confirm", "Confirmar nova senha")}
      </section>
    </>
  );
}
