import { useState, type FormEvent } from "react";
import type { SessionUser } from "@/core/auth/AuthContext";
import {
  emptyPasswordChange,
  loadProfile,
  saveProfile,
  validateAccount,
  type AccountProfile,
  type PasswordChange,
  type ProfileErrors,
} from "./accountProfile";
import { AccountShell } from "./components/AccountShell";
import { ProfileFields } from "./components/ProfileFields";

function ProfileForm({ user }: { user: SessionUser }) {
  const [profile, setProfile] = useState<AccountProfile>(() => loadProfile(user.id, user));
  const [password, setPassword] = useState<PasswordChange>(emptyPasswordChange);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saved, setSaved] = useState(false);

  function patch<T extends object>(set: (update: (current: T) => T) => void, change: Partial<T>) {
    set((current) => ({ ...current, ...change }));
    setSaved(false);
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(change)) delete next[key as keyof ProfileErrors];
      return next;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validateAccount(profile, password);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`account-${first}`)?.focus();
      return;
    }
    saveProfile(user.id, profile);
    setPassword(emptyPasswordChange);
    setSaved(true);
  }

  return (
    <form className="account-form" noValidate onSubmit={submit}>
      <h2>Perfil do colecionador</h2>
      <ProfileFields
        profile={profile}
        password={password}
        errors={errors}
        onProfile={(change) => patch(setProfile, change)}
        onPassword={(change) => patch(setPassword, change)}
      />
      {saved && (
        <p className="account-saved" role="status">
          Alterações salvas.
        </p>
      )}
      <button type="submit" className="account-primary account-save">
        Salvar
      </button>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <AccountShell section="profile" title="Meu perfil">
      {(user) => <ProfileForm key={user.id} user={user} />}
    </AccountShell>
  );
}
