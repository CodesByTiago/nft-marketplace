import { delay, http, HttpResponse } from "msw";
import {
  addUser,
  authenticate,
  createSession,
  findUserByEmail,
  hashPassword,
  publicUser,
  revokeToken,
  tokenFromRequest,
} from "@/core/msw/db";
import { isEmail } from "../types";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email = "", password = "" } = (await request.json()) as { email?: string; password?: string };
    await delay(600);
    const user = await findUserByEmail(email);
    if (!user || user.passwordHash !== (await hashPassword(password))) {
      return HttpResponse.json({ message: "E-mail ou senha incorretos." }, { status: 401 });
    }
    return HttpResponse.json({ user: publicUser(user), ...(await createSession(user)) });
  }),
  http.post("/api/auth/register", async ({ request }) => {
    const { username = "", email = "", password = "" } = (await request.json()) as Record<string, string>;
    await delay(700);
    const normalized = email.trim().toLowerCase();
    if (username.trim().length < 3 || !isEmail(normalized) || password.length < 8) {
      return HttpResponse.json({ message: "Revise os dados informados." }, { status: 400 });
    }
    if (await findUserByEmail(normalized)) {
      return HttpResponse.json({ message: "Já existe uma conta com este e-mail." }, { status: 409 });
    }
    const user = {
      id: `u-${crypto.randomUUID().slice(0, 8)}`,
      username: username.trim(),
      email: normalized,
      passwordHash: await hashPassword(password),
    };
    await addUser(user);
    return HttpResponse.json({ user: publicUser(user), ...(await createSession(user)) }, { status: 201 });
  }),
  http.get("/api/session", async ({ request }) => {
    const auth = await authenticate(request);
    return "response" in auth ? auth.response : HttpResponse.json({ user: publicUser(auth.user) });
  }),
  http.post("/api/auth/logout", async ({ request }) => {
    const token = tokenFromRequest(request);
    if (token) await revokeToken(token);
    return new HttpResponse(null, { status: 204 });
  }),
];
