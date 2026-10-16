import { expect, type Page } from "@playwright/test";

export const demo = { id: "u-demo", email: "contato@email.com", password: "kurio1234" };
export const maria = { id: "u-maria", email: "maria@kurio.art", password: "kurio1234" };

type Account = { id: string; email: string; password: string };

/** Abre a aplicação e espera o MSW e o App prontos (o App só carrega depois do worker). */
export async function openApp(page: Page, path = "/") {
  await page.goto(path);
  await page.locator(".realtime-notices").waitFor({ state: "attached" });
}

/** Autentica pela API simulada (como o formulário faz) e guarda a sessão; vale para as próximas navegações. */
export async function loginAs(page: Page, account: Account = demo) {
  await openApp(page);
  const session = await page.evaluate(async ({ email, password }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return (await response.json()) as { token: string; user: unknown };
  }, account);
  expect(session.token).toBeTruthy();
  await page.evaluate((value) => localStorage.setItem("kurio-session", JSON.stringify(value)), {
    token: session.token,
    user: session.user,
  });
  return session;
}

/** Carrinho inicial, gravado na chave do usuário (ou do visitante). */
export async function seedCartFor(page: Page, entries: unknown[], userId = "guest") {
  await page.addInitScript(
    ([key, value]) => {
      if (!localStorage.getItem(key as string)) localStorage.setItem(key as string, JSON.stringify(value));
    },
    [`kurio-cart:${userId}`, entries] as const,
  );
}

/** Controles do cenário: falam com o backend simulado (MSW) pela rede, como um operador faria. */
export async function control(page: Page, path: string, body: object = {}) {
  return page.evaluate(
    async ([url, payload]) => {
      const response = await fetch(url as string, { method: "POST", body: JSON.stringify(payload) });
      return (await response.json()) as Record<string, unknown>;
    },
    [`/api/mock/${path}`, body] as const,
  );
}
