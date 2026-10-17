import { describe, expect, it } from "vitest";
import { emptyPrimary, validatePrimary, validateSecondary, type PrimaryWallet } from "../pages/wallets/wallet";

const valid: PrimaryWallet = {
  displayName: "Nova",
  nickname: "Principal",
  network: "Ethereum",
  profileName: "Nova Kurio",
  address: "0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C",
  secondary: "",
  provider: "metamask",
  referral: "KURIO-2026",
  email: "nova@kurio.art",
  ens: "nova",
};

describe("carteiras do colecionador", () => {
  it("aceita uma carteira principal completa", () => {
    expect(validatePrimary(valid)).toEqual({});
  });

  it("exige os campos obrigatórios, endereço 0x e e-mail", () => {
    const errors = validatePrimary({ ...emptyPrimary, address: "0x123", email: "x" });
    expect(Object.keys(errors).sort()).toEqual(
      ["address", "displayName", "email", "ens", "network", "nickname", "profileName", "provider", "referral"].sort(),
    );
  });

  it("valida a carteira secundária", () => {
    expect(validateSecondary({ nickname: "", network: "Polygon", address: "x" })).toEqual({
      nickname: "Informe o apelido da carteira.",
      address: "Informe um endereço 0x válido (42 caracteres).",
    });
    expect(validateSecondary({ nickname: "Reserva", network: "Polygon", address: valid.address })).toEqual({});
  });
});
