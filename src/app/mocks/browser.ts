import { setupWorker } from "msw/browser";
import { authHandlers } from "@/features/auth/mocks/handlers";
import { handlers } from "@/features/marketplace/mocks/handlers";

export const worker = setupWorker(...handlers, ...authHandlers);
