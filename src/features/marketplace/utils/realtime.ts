import type { Nft } from "../types/nft";
import type { NftUpdatedEvent, RealtimeNotice } from "../types/realtime";

/** Eventos duplicados ou antigos (versão menor ou igual à conhecida) são descartados. */
export function isNewerVersion(known: number | undefined, incoming: number) {
  return incoming > (known ?? 0);
}

export function patchNft<T extends Nft>(nft: T, event: NftUpdatedEvent): T {
  return {
    ...nft,
    price: event.price,
    previousPrice: event.price !== nft.price ? nft.price : nft.previousPrice,
    available: event.available,
    version: event.version,
  };
}

export function noticeFor(nft: Nft, event: NftUpdatedEvent): RealtimeNotice | undefined {
  if (!event.available && nft.available !== false) {
    return { id: `${event.id}`, message: `${nft.name} ficou indisponível e saiu do resumo da compra.` };
  }
  if (event.available && event.price !== nft.price) {
    return { id: `${event.id}`, message: `O preço de ${nft.name} mudou de ${nft.price} para ${event.price} ETH.` };
  }
  return undefined;
}
