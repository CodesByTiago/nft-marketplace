import type { Order } from "./payment";

type EventBase = {
  /** Identidade estável: o mesmo evento reenviado mantém o mesmo id. */
  id: string;
  /** Versão monotônica do recurso; versões iguais ou menores são descartadas. */
  version: number;
  occurredAt: string;
};

export type NftUpdatedEvent = EventBase & {
  resource: { type: "nft"; id: string };
  price: string;
  previousPrice?: string;
  available: boolean;
};

export type OrderUpdatedEvent = EventBase & {
  resource: { type: "order"; id: string };
  userId: string;
  order: Order;
};

export type RealtimeNotice = {
  id: string;
  message: string;
};
