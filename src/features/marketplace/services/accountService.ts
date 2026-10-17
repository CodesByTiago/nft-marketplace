import { apiClient } from "@/core/api/client";
import type { PasswordChange } from "../pages/profile/accountProfile";
import type { AccountProfile } from "../pages/profile/accountProfile";
import type { WalletsData } from "../pages/wallets/wallet";

/** Erro de validação devolvido pela API (422) com a mensagem por campo. */
export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super("Revise os campos informados.");
  }
}

async function request<T>(call: () => Promise<{ data: T }>) {
  try {
    return (await call()).data;
  } catch (error) {
    const response = (error as { response?: { status?: number; data?: { errors?: Record<string, string> } } }).response;
    if (response?.status === 422 && response.data?.errors) throw new ValidationError(response.data.errors);
    throw error;
  }
}

export const getProfile = () => request(() => apiClient.get<AccountProfile>("/profile"));

export const saveProfile = (profile: AccountProfile, password: PasswordChange) =>
  request(() => apiClient.put<AccountProfile>("/profile", { profile, password }));

export const getWallets = () => request(() => apiClient.get<WalletsData>("/wallets"));

export const saveWallets = (data: WalletsData) => request(() => apiClient.put<WalletsData>("/wallets", data));
