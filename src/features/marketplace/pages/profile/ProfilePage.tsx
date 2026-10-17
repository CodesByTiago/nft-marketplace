import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionUser } from "@/core/auth/AuthContext";
import { getProfile, saveProfile, ValidationError } from "@/features/marketplace/services/accountService";
import {
  emptyPasswordChange,
  validateAccount,
  type AccountProfile,
  type PasswordChange,
  type ProfileErrors,
} from "./accountProfile";
import { AccountShell } from "./components/AccountShell";
import { ProfileFields } from "./components/ProfileFields";

function ProfileForm({ user, initial }: { user: SessionUser; initial: AccountProfile }) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<AccountProfile>(initial);
  const [password, setPassword] = useState<PasswordChange>(emptyPasswordChange);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState("");
  const save = useMutation({
    mutationFn: () => saveProfile(profile, password),
    onSuccess: (data) => queryClient.setQueryData(["private", "profile", user.id], data),
  });

  function patch<T extends object>(set: (update: (current: T) => T) => void, change: Partial<T>) {
    set((current) => ({ ...current, ...change }));
    setSaved(false);
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(change)) delete next[key as keyof ProfileErrors];
      return next;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFailure("");
    const found = validateAccount(profile, password);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`account-${first}`)?.focus();
      return;
    }
    try {
      await save.mutateAsync();
      setPassword(emptyPasswordChange);
      setSaved(true);
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.errors);
        document.getElementById(`account-${Object.keys(error.errors)[0]}`)?.focus();
      } else {
        setFailure("Não foi possível salvar agora. Tente novamente.");
      }
    }
  }

  return (
    <form className="account-form" noValidate onSubmit={(event) => void submit(event)}>
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
      {failure && (
        <p role="alert" className="account-error">
          {failure}
        </p>
      )}
      <button type="submit" className="account-primary account-save" disabled={save.isPending}>
        {save.isPending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}

function ProfileLoader({ user }: { user: SessionUser }) {
  const { data, isError, refetch } = useQuery({ queryKey: ["private", "profile", user.id], queryFn: getProfile });
  if (isError) {
    return (
      <p role="alert" className="account-error">
        Não foi possível carregar seu perfil.{" "}
        <button type="button" className="account-link" onClick={() => void refetch()}>
          Tentar novamente
        </button>
      </p>
    );
  }
  if (!data) return <p role="status">Carregando seu perfil…</p>;
  return <ProfileForm user={user} initial={data} />;
}

export default function ProfilePage() {
  return (
    <AccountShell section="profile" title="Meu perfil">
      {(user) => <ProfileLoader key={user.id} user={user} />}
    </AccountShell>
  );
}
