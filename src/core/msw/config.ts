/** Regra de falha/latência aplicada pelo MSW às chamadas `/api/*`. */
export type ScenarioRule = {
  method?: string;
  /** Prefixo do caminho (ex.: `/api/nfts`). */
  path: string;
  status?: number;
  networkError?: boolean;
  delayMs?: number;
  /** Corpo devolvido no lugar da resposta real (ex.: catálogo vazio). */
  body?: unknown;
  /** Quantas vezes a regra vale antes de deixar a chamada passar (falha transitória). */
  times?: number;
  /** Aplica depois de processar a chamada (ex.: pedido criado, resposta perdida). */
  after?: boolean;
};

export type MockConfig = {
  scenario: string;
  rules: ScenarioRule[];
  variableLatency: boolean;
  seed: number;
  orderSettleMs?: number;
  sessionTtlMs?: number;
  declineOrders?: boolean;
};

export const CONFIG_KEY = "kurio-mock-config";

export const emptyResponse = { items: [], total: 0, facets: { categories: {}, networks: {} } };

type Preset = Partial<Omit<MockConfig, "scenario">>;

// Cenários determinísticos e reproduzíveis. `default` é o cenário usado por demo, testes e Lighthouse.
export const presets: Record<string, Preset> = {
  default: {},
  slow: { rules: [{ path: "/api/", delayMs: 2_500 }] },
  "variable-latency": { variableLatency: true },
  offline: { rules: [{ path: "/api/", networkError: true }] },
  "catalog-empty": { rules: [{ method: "POST", path: "/api/nfts", body: emptyResponse }] },
  "catalog-error": { rules: [{ path: "/api/nfts", status: 500 }] },
  "catalog-transient": { rules: [{ path: "/api/nfts", status: 503, times: 2 }] },
  "favorites-error": {
    rules: [
      { method: "PUT", path: "/api/favorites", status: 500 },
      { method: "DELETE", path: "/api/favorites", status: 500 },
    ],
  },
  "order-timeout": { rules: [{ method: "POST", path: "/api/orders", after: true, delayMs: 12_000, times: 1 }] },
  "payment-declined": { declineOrders: true },
  "short-session": { sessionTtlMs: 4_000 },
};

const base: MockConfig = { scenario: "default", rules: [], variableLatency: false, seed: 7 };

export function buildConfig(scenario: string, extra: Preset = {}): MockConfig {
  const preset = presets[scenario];
  if (!preset) throw new Error(`Cenário desconhecido: ${scenario}`);
  return { ...base, ...preset, ...extra, scenario };
}

export function getConfig(): MockConfig {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "null") as Partial<MockConfig> | null;
    return { ...base, ...stored };
  } catch {
    return base;
  }
}

export function setConfig(config: MockConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function resetConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

/** Atualiza opções soltas (ex.: tempo de conclusão do pedido) sem trocar o cenário. */
export function patchConfig(change: Partial<MockConfig>) {
  setConfig({ ...getConfig(), ...change });
}
