import { delay, http, HttpResponse } from "msw";
import { authenticate, hashPassword, readData, updatePassword, writeData } from "@/core/msw/db";
import {
  emptyPasswordChange,
  validateAccount,
  type AccountProfile,
  type PasswordChange,
} from "../pages/profile/accountProfile";
import { emptyPrimary, validatePrimary, validateSecondary, type WalletsData } from "../pages/wallets/wallet";

const PROFILE = "profile";
const WALLETS = "wallets";

const invalid = (errors: Record<string, string>) =>
  HttpResponse.json({ message: "Revise os campos informados.", errors }, { status: 422 });

export const accountHandlers = [
  http.get("/api/profile", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const { id, username, email } = auth.user;
    const base: AccountProfile = { displayName: "", walletNickname: "", ensName: "", avatar: "", username, email };
    await delay(250);
    return HttpResponse.json({ ...base, ...(await readData<Partial<AccountProfile>>(PROFILE, id, {})) });
  }),
  http.put("/api/profile", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const body = (await request.json()) as { profile: AccountProfile; password?: PasswordChange };
    const password = { ...emptyPasswordChange, ...body.password };
    await delay(400);
    const errors: Record<string, string> = { ...validateAccount(body.profile, password) };
    // A senha atual é conferida no servidor, nunca no cliente.
    if (password.current && !errors.current && (await hashPassword(password.current)) !== auth.user.passwordHash) {
      errors.current = "Senha atual incorreta.";
    }
    if (Object.keys(errors).length) return invalid(errors);
    if (password.next) await updatePassword(auth.user.id, await hashPassword(password.next));
    await writeData(PROFILE, auth.user.id, body.profile);
    return HttpResponse.json(body.profile);
  }),
  http.get("/api/wallets", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    await delay(250);
    const stored = await readData<Partial<WalletsData>>(WALLETS, auth.user.id, {});
    const data: WalletsData = {
      primary: { ...emptyPrimary, email: auth.user.email, ...stored.primary },
      secondary: stored.secondary ?? null,
    };
    return HttpResponse.json(data);
  }),
  http.put("/api/wallets", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const body = (await request.json()) as WalletsData;
    await delay(400);
    const stored = await readData<Partial<WalletsData>>(WALLETS, auth.user.id, {});
    const primaryChanged = JSON.stringify(body.primary) !== JSON.stringify({ ...emptyPrimary, ...stored.primary });
    const errors: Record<string, string> = {
      ...(primaryChanged ? validatePrimary(body.primary) : {}),
      ...(body.secondary ? validateSecondary(body.secondary) : {}),
    };
    if (Object.keys(errors).length) return invalid(errors);
    await writeData(WALLETS, auth.user.id, body);
    return HttpResponse.json(body);
  }),
];
