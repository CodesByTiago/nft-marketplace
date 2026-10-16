import { apiClient } from "@/core/api/client";
import type { AuthResponse, LoginInput, RegisterInput } from "../types";

export class AuthError extends Error {}

type ApiFailure = { response?: { data?: { message?: string } } };

async function post(path: string, body: unknown) {
  try {
    const { data } = await apiClient.post<AuthResponse>(path, body);
    return { token: data.token, user: data.user };
  } catch (error) {
    const message = (error as ApiFailure).response?.data?.message;
    throw new AuthError(message ?? "Não foi possível concluir agora. Tente novamente.");
  }
}

export const login = (input: LoginInput) => post("/auth/login", input);

export const register = ({ username, email, password }: RegisterInput) =>
  post("/auth/register", { username, email, password });
