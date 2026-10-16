import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useAuth, type SessionUser } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";
import {
  emptyPasswordChange,
  loadProfile,
  saveProfile,
  validateAccount,
  type AccountProfile,
  type PasswordChange,
  type ProfileErrors,
} from "./accountProfile";
import { AccountSidebar } from "./components/AccountSidebar";
import { ProfileFields } from "./components/ProfileFields";

function ProfileForm({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
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
    <div className="account-layout">
      <AccountSidebar onLogout={onLogout} />
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
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const { user, openAuth, logout } = useAuth();
  const { cart } = useCartPanel();
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Meu perfil | Kurio";
    return () => {
      document.title = "Kurio";
    };
  }, []);

  function goBack() {
    if (canGoBack) router.history.back();
    else void navigate({ to: "/" });
  }

  function leave() {
    logout();
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground detail-page cart-page account-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="inicio"
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />
      <main className="cart-main page-width">
        <nav className="detail-breadcrumb" aria-label="Você está em">
          <Link to="/" hash="inicio">
            Início
          </Link>
          {" / Meu perfil"}
        </nav>
        <header className="cart-mobile-header">
          <Button variant="ghost" size="icon" aria-label="Voltar" onClick={goBack}>
            <ArrowLeft aria-hidden="true" />
          </Button>
          <h1>Meu perfil</h1>
        </header>
        {user ? (
          <ProfileForm key={user.id} user={user} onLogout={leave} />
        ) : (
          <div className="catalog-message cart-empty">
            <h1>Entre para ver seu perfil</h1>
            <p>Faça login para editar seus dados de colecionador.</p>
            <Button onClick={() => openAuth("login")}>Entrar</Button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
