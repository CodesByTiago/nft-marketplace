import { describe, expect, it } from "vitest";
import { emptyPasswordChange, validateAccount, type AccountProfile } from "../pages/profile/accountProfile";

const valid: AccountProfile = {
  displayName: "Nova",
  username: "nova",
  email: "nova@kurio.art",
  walletNickname: "Principal",
  ensName: "nova",
  avatar: "",
};

describe("perfil do colecionador", () => {
  it("aceita dados válidos sem troca de senha", () => {
    expect(validateAccount(valid, emptyPasswordChange)).toEqual({});
  });

  it("exige os campos obrigatórios", () => {
    const errors = validateAccount(
      { ...valid, displayName: " ", username: "ab", email: "x", walletNickname: "", ensName: "a" },
      emptyPasswordChange,
    );
    expect(Object.keys(errors).sort()).toEqual(["displayName", "email", "ensName", "username", "walletNickname"]);
  });

  it("valida a troca de senha somente quando preenchida", () => {
    expect(validateAccount(valid, { current: "", next: "12345678", confirm: "1" })).toEqual({
      current: "Informe a senha atual.",
      confirm: "As senhas não coincidem.",
    });
    expect(validateAccount(valid, { current: "kurio1234", next: "kurio1234", confirm: "kurio1234" }).next).toMatch(
      /diferente/,
    );
    expect(validateAccount(valid, { current: "kurio1234", next: "novasenha1", confirm: "novasenha1" })).toEqual({});
  });
});
