import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { currentUserId } from "@/core/auth/session";
import { useRealtimeSocket } from "@/core/realtime/RealtimeContext";
import { getNft } from "../services/nftService";
import type { CartEntry, Nft, NftDetail, NftResults } from "../types/nft";
import type { NftUpdatedEvent } from "../types/realtime";
import { isNewerVersion, noticeFor, patchNft } from "../utils/realtime";
import { pushNotice } from "./useNotices";
import { cartKey } from "./useCart";
import { readStoredValue, writeStored } from "./useStoredState";

// O carrinho é do usuário da sessão atual.
const cartStorageKey = () => cartKey(currentUserId());

function readCart() {
  return readStoredValue<CartEntry[]>(cartStorageKey(), []);
}

// Mantém catálogo, detalhe, carrinho e cotação coerentes com os eventos `nft.updated`
// e reconcilia com a API REST sempre que a conexão é (re)estabelecida.
export function useNftUpdates() {
  const queryClient = useQueryClient();
  const socket = useRealtimeSocket();

  useEffect(() => {
    if (!socket) return;
    const versions = new Map<string, number>();
    const handled = new Set<string>();

    function knownVersion(id: string) {
      const cart = readCart().find((entry) => entry.nft.id === id)?.nft.version;
      const detail = queryClient.getQueryData<NftDetail>(["nft", id])?.version;
      return Math.max(versions.get(id) ?? 0, cart ?? 0, detail ?? 0);
    }

    function onUpdated(event: NftUpdatedEvent) {
      const id = event.resource.id;
      if (handled.has(event.id) || !isNewerVersion(knownVersion(id), event.version)) return;
      handled.add(event.id);
      versions.set(id, event.version);

      const cart = readCart();
      const entry = cart.find((candidate) => candidate.nft.id === id);
      const viewed = queryClient.getQueryData<NftDetail>(["nft", id]);
      const notice = entry ? noticeFor(entry.nft, event) : viewed ? noticeFor(viewed, event) : undefined;
      if (notice) pushNotice(notice);

      if (entry) {
        writeStored(
          cartStorageKey(),
          cart.map((candidate) =>
            candidate.nft.id === id ? { ...candidate, nft: patchNft(candidate.nft, event) } : candidate,
          ),
        );
      }
      const patchItem = (nft: Nft) => (nft.id === id ? patchNft(nft, event) : nft);
      queryClient.setQueryData<NftDetail>(["nft", id], (old) => old && patchNft(old, event));
      queryClient.setQueriesData<NftResults>({ queryKey: ["nfts"] }, (old) =>
        old ? { ...old, items: old.items.map(patchItem) } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["nfts"] });
      void queryClient.invalidateQueries({ queryKey: ["cart-quote"] });
    }

    // A API é a fonte da verdade: depois de uma queda, refaz as consultas e os snapshots do carrinho.
    async function reconcile() {
      void queryClient.invalidateQueries({ queryKey: ["nft"] });
      void queryClient.invalidateQueries({ queryKey: ["nfts"] });
      void queryClient.invalidateQueries({ queryKey: ["cart-quote"] });
      const cart = readCart();
      if (!cart.length) return;
      const fresh = await Promise.allSettled(cart.map(({ nft }) => getNft(nft.id)));
      const current = readCart();
      writeStored(
        cartStorageKey(),
        current.map((entry) => {
          const result = fresh[cart.findIndex(({ nft }) => nft.id === entry.nft.id)];
          if (result?.status !== "fulfilled") return entry;
          const { price, previousPrice, available, version } = result.value;
          versions.set(entry.nft.id, version ?? 0);
          return { ...entry, nft: { ...entry.nft, price, previousPrice, available, version } };
        }),
      );
    }

    socket.on("nft.updated", onUpdated);
    socket.on("connect", reconcile);
    return () => {
      socket.off("nft.updated", onUpdated);
      socket.off("connect", reconcile);
    };
  }, [socket, queryClient]);
}
