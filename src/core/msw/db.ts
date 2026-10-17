import { HttpResponse } from "msw";
import { getConfig } from "./config";

export type DbUser = { id: string; username: string; email: string; passwordHash: string };
type Sessions = Record<string, { userId: string; expiresAt: number }>;
type Db = { users: DbUser[]; sessions: Sessions; data: Record<string, Record<string, unknown>> };

const DB_KEY = "kurio-mock-db";
const DEFAULT_TTL_MS = 30 * 60_000;

export async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(`kurio:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Contas de demonstração; a senha nunca fica em claro, apenas o hash.
const seedUsers = [
  { id: "u-demo", username: "colecionador", email: "contato@email.com" },
  { id: "u-maria", username: "maria", email: "maria@kurio.art" },
];

let cache: Db | null = null;

async function load(): Promise<Db> {
  if (cache) return cache;
  let stored: Partial<Db> = {};
  try {
    stored = JSON.parse(localStorage.getItem(DB_KEY) ?? "{}") as Partial<Db>;
  } catch {
    stored = {};
  }
  const passwordHash = await hashPassword("kurio1234");
  const users = [
    ...seedUsers.map((user) => ({ ...user, passwordHash })),
    ...(stored.users ?? []).filter((user) => !seedUsers.some((seed) => seed.id === user.id)),
  ];
  cache = { users, sessions: stored.sessions ?? {}, data: stored.data ?? {} };
  return cache;
}

function persist(db: Db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export async function resetDb() {
  cache = null;
  localStorage.removeItem(DB_KEY);
}

export async function findUserByEmail(email: string) {
  return (await load()).users.find((user) => user.email === email.trim().toLowerCase());
}

export async function addUser(user: DbUser) {
  const db = await load();
  db.users.push(user);
  persist(db);
}

export async function updatePassword(userId: string, passwordHash: string) {
  const db = await load();
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) return;
  user.passwordHash = passwordHash;
  persist(db);
}

export const publicUser = ({ id, username, email }: DbUser) => ({ id, username, email });

export async function createSession(user: DbUser) {
  const db = await load();
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + (getConfig().sessionTtlMs ?? DEFAULT_TTL_MS);
  db.sessions[token] = { userId: user.id, expiresAt };
  persist(db);
  return { token, expiresAt };
}

export async function revokeToken(token: string) {
  const db = await load();
  delete db.sessions[token];
  persist(db);
}

export async function expireSessions() {
  const db = await load();
  for (const session of Object.values(db.sessions)) session.expiresAt = Date.now() - 1;
  persist(db);
}

/** Resolve o usuário a partir do token; `null` para token ausente, desconhecido ou expirado. */
export async function userForToken(token: string | null) {
  if (!token) return null;
  const db = await load();
  const session = db.sessions[token];
  if (!session || session.expiresAt <= Date.now()) return null;
  return db.users.find((user) => user.id === session.userId) ?? null;
}

const bearer = (request: Request) => request.headers.get("Authorization")?.replace(/^Bearer /, "") ?? null;

/** Autentica a chamada. Sem sessão válida devolve 401; o cliente trata "session-expired" como sessão perdida. */
export async function authenticate(request: Request) {
  const token = bearer(request);
  const user = await userForToken(token);
  if (user) return { user } as const;
  const code = token ? "session-expired" : "unauthorized";
  const message = token ? "Sua sessão expirou. Entre novamente." : "Entre para continuar.";
  return { response: HttpResponse.json({ message, code }, { status: 401 }) } as const;
}

/** Dados privados particionados por coleção e usuário: um usuário nunca enxerga a partição de outro. */
export async function readData<T>(collection: string, userId: string, fallback: T): Promise<T> {
  const db = await load();
  return (db.data[collection]?.[userId] as T | undefined) ?? fallback;
}

export async function writeData(collection: string, userId: string, value: unknown) {
  const db = await load();
  db.data[collection] = { ...db.data[collection], [userId]: value };
  persist(db);
}

export const tokenFromRequest = bearer;
