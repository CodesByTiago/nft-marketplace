import { useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, Eye, EyeOff, ImageIcon } from "lucide-react";
import type { AccountProfile, PasswordChange, ProfileErrors } from "../accountProfile";

const MAX_AVATAR_BYTES = 1024 * 1024;

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (aria: { id: string; "aria-invalid": boolean; "aria-describedby": string }) => ReactNode;
};

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div className="account-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": `${id}-error` })}
      <p id={`${id}-error`} className="account-error" role={error ? "alert" : undefined}>
        {error}
      </p>
    </div>
  );
}

function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="account-password">
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
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
          type={type}
          autoComplete="off"
          value={profile[name]}
          onChange={(event) => onProfile({ [name]: event.target.value })}
        />
      )}
    </Field>
  );

  const secret = (name: keyof PasswordChange, label: string) => (
    <Field id={`account-${name}`} label={label} error={errors[name]}>
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
      <div className="account-grid">
        {text("displayName", "Nome de exibição")}
        {text("username", "Nome de usuário")}
        {text("email", "E-mail", "email")}
        <Field id="account-ensName" label="Nome ENS" required error={errors.ensName}>
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
                value={profile.ensName}
                onChange={(event) => onProfile({ ensName: event.target.value })}
              />
            </div>
          )}
        </Field>
        {text("walletNickname", "Apelido da carteira")}
        <div className="account-field">
          <span className="account-label">Avatar</span>
          <div className="account-avatar">
            <span className="account-avatar-preview">
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
            <button type="button" className="account-primary" onClick={() => fileInput.current?.click()}>
              Alterar
            </button>
            <button type="button" className="account-text" onClick={() => onProfile({ avatar: "" })}>
              Remover
            </button>
          </div>
          <p className="account-error" role={avatarError ? "alert" : undefined}>
            {avatarError}
          </p>
        </div>
      </div>
      <section className="account-password-section" aria-labelledby="account-password-title">
        <h2 id="account-password-title">Alterar senha</h2>
        {secret("current", "Senha atual")}
        {secret("next", "Nova senha")}
        {secret("confirm", "Confirmar nova senha")}
      </section>
    </>
  );
}
