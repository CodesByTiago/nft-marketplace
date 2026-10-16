import { delay, http, HttpResponse } from "msw";
import type { SessionUser } from "@/core/auth/AuthContext";
import { isEmail } from "../types";

type StoredUser = SessionUser & { password: string };

const USERS_KEY = "kurio-mock-users";

// Usuário de demonstração para o login funcionar sem cadastro prévio.
const demo: StoredUser = { id: "u-demo", username: "colecionador", email: "contato@email.com", password: "kurio1234" };

// Contas simuladas ficam no navegador para sobreviver a recarregamentos; não é autenticação real.
function readUsers(): StoredUser[] {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
    return [demo, ...stored];
  } catch {
    return [demo];
  }
}

function saveUser(user: StoredUser) {
  const stored = readUsers().filter((candidate) => candidate.id !== demo.id);
  localStorage.setItem(USERS_KEY, JSON.stringify([...stored, user]));
}

const publicUser = ({ id, username, email }: StoredUser): SessionUser => ({ id, username, email });

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email = "", password = "" } = (await request.json()) as { email?: string; password?: string };
    await delay(600);
    const user = readUsers().find((candidate) => candidate.email === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return HttpResponse.json({ message: "E-mail ou senha incorretos." }, { status: 401 });
    }
    return HttpResponse.json({ user: publicUser(user) });
  }),
  http.post("/api/auth/register", async ({ request }) => {
    const { username = "", email = "", password = "" } = (await request.json()) as Record<string, string>;
    await delay(700);
    const normalized = email.trim().toLowerCase();
    if (username.trim().length < 3 || !isEmail(normalized) || password.length < 8) {
      return HttpResponse.json({ message: "Revise os dados informados." }, { status: 400 });
    }
    if (readUsers().some((candidate) => candidate.email === normalized)) {
      return HttpResponse.json({ message: "Já existe uma conta com este e-mail." }, { status: 409 });
    }
    const user: StoredUser = { id: `u-${Date.now()}`, username: username.trim(), email: normalized, password };
    saveUser(user);
    return HttpResponse.json({ user: publicUser(user) }, { status: 201 });
  }),
];
