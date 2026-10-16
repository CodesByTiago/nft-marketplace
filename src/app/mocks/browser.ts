import { setupWorker } from "msw/browser";
import { buildConfig, presets, setConfig } from "@/core/msw/config";
import { scenarioHandlers } from "@/core/msw/scenarios";
import { authHandlers } from "@/features/auth/mocks/handlers";
import { handlers } from "@/features/marketplace/mocks/handlers";
import { resumePendingOrders } from "@/features/marketplace/mocks/realtime";

// Os cenários vêm primeiro para poderem atrasar ou falhar qualquer chamada antes do handler real.
export const worker = setupWorker(...scenarioHandlers, ...handlers, ...authHandlers);

/** `?scenario=nome` ativa um cenário de falha/latência (ver README); o valor persiste até `POST /api/mock/reset`. */
function applyScenarioFromUrl() {
  const scenario = new URLSearchParams(window.location.search).get("scenario");
  if (scenario && presets[scenario]) setConfig(buildConfig(scenario));
}

// Pedidos pendentes sobrevivem ao refresh: reagenda a conclusão deles.
export function resumeMocks() {
  applyScenarioFromUrl();
  resumePendingOrders();
}
