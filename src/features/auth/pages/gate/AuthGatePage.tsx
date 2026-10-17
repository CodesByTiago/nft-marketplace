import { useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";

/** Destino das rotas privadas sem sessão: abre o login e devolve o colecionador ao fluxo de origem. */
export default function AuthGatePage({ redirect }: { redirect: string }) {
  const { user, openAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    document.title = "Entrar | Kurio";
    return () => {
      document.title = "Kurio";
    };
  }, []);

  useEffect(() => {
    if (user) router.history.replace(redirect);
    else openAuth("login", () => router.history.replace(redirect));
  }, [user, openAuth, router, redirect]);

  return (
    <main className="catalog-message cart-empty">
      <h1>Entre para continuar</h1>
      <p>Esta área é exclusiva para colecionadores autenticados. Depois de entrar, você volta de onde parou.</p>
      <Button onClick={() => openAuth("login", () => router.history.replace(redirect))}>Entrar</Button>
      <Link to="/">Voltar ao início</Link>
    </main>
  );
}
