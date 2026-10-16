import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/core/msw/server";
import { handlers } from "@/features/marketplace/mocks/handlers";
import { getNfts } from "@/features/marketplace/services/nftService";

describe("getNfts", () => {
  beforeEach(() => server.use(...handlers));

  it("filtra por categoria e devolve as contagens do catálogo completo", async () => {
    const result = await getNfts({ category: "Fotografia", limit: 9 });

    expect(result.total).toBe(5);
    expect(result.items.every((nft) => nft.category === "Fotografia")).toBe(true);
    expect(result.facets.categories["Fotografia"]).toBe(5);
  });

  it("combina categorias com ou e pagina os resultados", async () => {
    const result = await getNfts({ category: "Fotografia,Assinaturas", limit: 4, page: 2 });

    expect(result.total).toBe(10);
    expect(result.items).toHaveLength(4);
  });

  it("recorta o catálogo pela aba e calcula as contagens dentro do recorte", async () => {
    const all = await getNfts({ limit: 99 });
    const news = await getNfts({ tab: "new", limit: 99 });
    const trending = await getNfts({ tab: "trending", limit: 99 });

    expect(news.total).toBeGreaterThan(0);
    expect(news.total).toBeLessThan(all.total);
    expect(trending.total).toBeLessThan(all.total);
    expect(news.items.every((nft) => nft.isNew)).toBe(true);
    expect(trending.items.every((nft) => nft.trending)).toBe(true);
    const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum(news.facets.categories)).toBe(news.total);
  });

  it("busca pelo termo enviado no body", async () => {
    const result = await getNfts({ search: "cosmic bloom", limit: 9 });

    expect(result.total).toBeGreaterThan(0);
    expect(
      result.items.every((nft) => `${nft.name} ${nft.collection} ${nft.artist}`.toLowerCase().includes("cosmic bloom")),
    ).toBe(true);
  });
});
