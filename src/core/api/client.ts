import axios from "axios";
import { readSession, SESSION_EXPIRED_EVENT } from "@/core/auth/session";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 8_000,
});

// O backend identifica o usuário pelo token da sessão; nunca por um identificador enviado pelo cliente.
apiClient.interceptors.request.use((config) => {
  const token = readSession()?.token;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// Sessão invalidada pelo servidor (expirada ou revogada): a aplicação limpa os dados privados e pede novo acesso.
apiClient.interceptors.response.use(undefined, (error: unknown) => {
  const status = (error as { response?: { status?: number } }).response?.status;
  const sentToken = Boolean(
    (error as { config?: { headers?: { get?: (name: string) => unknown } } }).config?.headers?.get?.("Authorization"),
  );
  if (status === 401 && sentToken) window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  return Promise.reject(error);
});
