import { describe, expect, it } from "vitest";
import { nfts } from "../mocks/data";
import type { NftUpdatedEvent } from "../types/realtime";
import { isNewerVersion, noticeFor, patchNft } from "../utils/realtime";

const nft = nfts[0];

function event(change: Partial<NftUpdatedEvent> = {}): NftUpdatedEvent {
  return {
    id: "evt-1",
    version: 2,
    occurredAt: "2026-01-01T00:00:00.000Z",
    resource: { type: "nft", id: nft.id },
    price: nft.price,
    previousPrice: nft.price,
    available: true,
    ...change,
  };
}

describe("eventos em tempo real", () => {
  it("descarta versões iguais ou antigas", () => {
    expect(isNewerVersion(undefined, 1)).toBe(true);
    expect(isNewerVersion(2, 3)).toBe(true);
    expect(isNewerVersion(3, 3)).toBe(false);
    expect(isNewerVersion(3, 2)).toBe(false);
  });

  it("aplica preço, disponibilidade e versão preservando o preço anterior", () => {
    const patched = patchNft(nft, event({ price: "9.99", available: false, version: 4 }));
    expect(patched).toMatchObject({ price: "9.99", previousPrice: nft.price, available: false, version: 4 });
  });

  it("avisa sobre mudança de preço e indisponibilidade", () => {
    expect(noticeFor(nft, event({ price: "9.99" }))?.message).toContain("mudou de");
    expect(noticeFor(nft, event({ available: false }))?.message).toContain("indisponível");
  });

  it("não avisa quando nada relevante mudou", () => {
    expect(noticeFor(nft, event())).toBeUndefined();
    expect(noticeFor({ ...nft, available: false }, event({ available: false }))).toBeUndefined();
  });
});
