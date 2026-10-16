import { delay, http, HttpResponse } from "msw";
import { getConfig, type ScenarioRule } from "./config";

// Contadores só em memória: um reload reinicia as falhas "transitórias", o que mantém o cenário reproduzível.
const hits = new Map<string, number>();
let requests = 0;

export function resetScenarioState() {
  hits.clear();
  requests = 0;
}

// PRNG determinístico (mulberry32): a mesma semente gera a mesma sequência de latências.
function random(seed: number) {
  let state = (seed + requests * 0x6d2b79f5) >>> 0;
  state = Math.imul(state ^ (state >>> 15), state | 1);
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
  return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
}

function matches(rule: ScenarioRule, request: Request, after: boolean) {
  const url = new URL(request.url);
  return (
    Boolean(rule.after) === after &&
    url.pathname.startsWith(rule.path) &&
    !url.pathname.startsWith("/api/mock/") &&
    (!rule.method || rule.method === request.method)
  );
}

async function apply(rule: ScenarioRule, index: number) {
  if (rule.times !== undefined) {
    const key = `${index}:${rule.path}`;
    const used = hits.get(key) ?? 0;
    if (used >= rule.times) return undefined;
    hits.set(key, used + 1);
  }
  if (rule.delayMs) await delay(rule.delayMs);
  if (rule.networkError) return HttpResponse.error();
  if (rule.status) {
    return HttpResponse.json(
      { message: "Falha simulada pelo cenário.", code: "scenario-failure" },
      { status: rule.status },
    );
  }
  if (rule.body !== undefined) return HttpResponse.json(rule.body as object);
  return undefined;
}

async function firstMatch(request: Request, after: boolean) {
  const { rules } = getConfig();
  for (const [index, rule] of rules.entries()) {
    if (!matches(rule, request, after)) continue;
    const response = await apply(rule, index);
    if (response) return response;
  }
  return undefined;
}

/** Roda as regras "pós-processamento" (a resposta é perdida mesmo com a operação concluída). */
export const applyAfterRules = (request: Request) => firstMatch(request, true);

// Primeiro handler: aplica latência e falhas do cenário ativo; sem efeito, a chamada segue para o handler real.
export const scenarioHandlers = [
  http.all("/api/*", async ({ request }) => {
    if (new URL(request.url).pathname.startsWith("/api/mock/")) return undefined;
    requests += 1;
    const { variableLatency, seed } = getConfig();
    if (variableLatency) await delay(50 + Math.round(random(seed) * 1_450));
    return firstMatch(request, false);
  }),
];
