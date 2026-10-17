import { beforeEach, describe, expect, it } from "vitest";
import { createSession, findUserByEmail, resetDb } from "@/core/msw/db";
import { server } from "@/core/msw/server";
import { accountHandlers } from "@/features/marketplace/mocks/account";
import { cartHandlers } from "@/features/marketplace/mocks/cart";
import {
  getProfile,
  getWallets,
  saveProfile,
  saveWallets,
  ValidationError,
} from "@/features/marketplace/services/accountService";
import { getCart, mergeCart, removeCartItems, setCartQuantity } from "@/features/marketplace/services/cartService";
import { emptyPasswordChange } from "../pages/profile/accountProfile";

async function signIn(email: string) {
  const user = (await findUserByEmail(email))!;
  const { token } = await createSession(user);
  localStorage.setItem(
    "kurio-session",
    JSON.stringify({ token, user: { id: user.id, username: user.username, email: user.email } }),
  );
}

beforeEach(async () => {
  await resetDb();
  server.use(...accountHandlers, ...cartHandlers);
});

describe("perfil e carteiras na API", () => {
  it("parte dos dados da sessão e persiste por usuário", async () => {
    await signIn("contato@email.com");
    const base = await getProfile();
    expect(base.email).toBe("contato@email.com");

    await saveProfile(
      { ...base, displayName: "Nova", walletNickname: "Principal", ensName: "nova" },
      emptyPasswordChange,
    );
    expect((await getProfile()).displayName).toBe("Nova");

    await signIn("maria@kurio.art");
    expect((await getProfile()).displayName).toBe("");
  });

  it("devolve 422 por campo e confere a senha atual no servidor", async () => {
    await signIn("contato@email.com");
    const base = await getProfile();
    const filled = { ...base, displayName: "Nova", walletNickname: "Principal", ensName: "nova" };

    const error = await saveProfile(filled, { current: "errada123", next: "novasenha1", confirm: "novasenha1" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors.current).toBe("Senha atual incorreta.");

    await expect(
      saveProfile(filled, { current: "kurio1234", next: "novasenha1", confirm: "novasenha1" }),
    ).resolves.toMatchObject({ displayName: "Nova" });
  });

  it("exige autenticação e valida a carteira principal", async () => {
    localStorage.removeItem("kurio-session");
    await expect(getWallets()).rejects.toBeTruthy();

    await signIn("contato@email.com");
    const { primary } = await getWallets();
    expect(primary.email).toBe("contato@email.com");
    const error = await saveWallets({ primary: { ...primary, address: "0x1" }, secondary: null }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors.address).toBeTruthy();
  });
});

describe("carrinho na API", () => {
  it("limita à edição, remove itens e isola por usuário", async () => {
    await signIn("contato@email.com");
    await setCartQuantity("emerald-ape-042", 1);
    await setCartQuantity("emerald-ape-042", 999);
    const items = await getCart();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(items[0].nft.totalEditions);

    await signIn("maria@kurio.art");
    expect(await getCart()).toEqual([]);

    await signIn("contato@email.com");
    expect(await removeCartItems(["emerald-ape-042"])).toEqual([]);
  });

  it("mescla o carrinho de visitante sem duplicar", async () => {
    await signIn("contato@email.com");
    await setCartQuantity("emerald-ape-042", 1);
    const merged = await mergeCart([{ id: "emerald-ape-042", quantity: 1 }]);
    expect(merged.filter((item) => item.nft.id === "emerald-ape-042")).toHaveLength(1);
  });
});
