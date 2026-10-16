import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/core/msw/server";
import { authHandlers } from "../mocks/handlers";
import { AuthError, login, register } from "../services/authService";
import { validateLogin, validateRegister } from "../types";

describe("validação de acesso", () => {
  it("exige e-mail válido e senha no login", () => {
    expect(validateLogin({ email: "x", password: "" })).toEqual({
      email: "Informe um e-mail válido.",
      password: "Informe sua senha.",
    });
    expect(validateLogin({ email: "a@b.co", password: "1" })).toEqual({});
  });

  it("valida cadastro e confirmação de senha", () => {
    const errors = validateRegister({ username: "ab", email: "a@b", password: "123", confirmPassword: "1234" });
    expect(Object.keys(errors).sort()).toEqual(["confirmPassword", "email", "password", "username"]);
    expect(
      validateRegister({ username: "tiago", email: "t@kurio.io", password: "12345678", confirmPassword: "12345678" }),
    ).toEqual({});
  });
});

describe("authService", () => {
  beforeEach(() => server.use(...authHandlers));

  it("entra com o usuário de demonstração", async () => {
    const { user, token } = await login({ email: "contato@email.com", password: "kurio1234" });
    expect(user.username).toBe("colecionador");
    expect(token).toBeTruthy();
  });

  it("recusa credenciais incorretas", async () => {
    await expect(login({ email: "contato@email.com", password: "errada" })).rejects.toThrow(
      "E-mail ou senha incorretos.",
    );
  });

  it("cria a conta, permite entrar e bloqueia e-mail repetido", async () => {
    const input = { username: "tiago", email: "Novo@Kurio.io", password: "12345678", confirmPassword: "12345678" };
    const { user: created } = await register(input);
    expect(created.email).toBe("novo@kurio.io");
    expect((await login({ email: "novo@kurio.io", password: "12345678" })).user.id).toBe(created.id);
    await expect(register(input)).rejects.toBeInstanceOf(AuthError);
  });
});
