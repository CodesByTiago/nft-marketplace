import { delay, http, HttpResponse } from "msw";
import type { Nft } from "../types/nft";
import type { HomeTab, SortOption } from "../types/search";
import { nfts } from "./data";

function countBy(list: Nft[], key: "category" | "network") {
  return list.reduce<Record<string, number>>((counts, nft) => {
    counts[nft[key]] = (counts[nft[key]] ?? 0) + 1;
    return counts;
  }, {});
}

export const handlers = [
  http.post("/api/nfts", async ({ request }) => {
    const body = (await request.json()) as {
      tab?: HomeTab;
      search?: string;
      category?: string;
      collection?: string;
      network?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: SortOption;
      page?: number;
      limit?: number;
    };
    const tab = body.tab ?? "all";
    const search = body.search?.trim().toLowerCase() ?? "";
    const category = body.category ?? "";
    const collection = body.collection ?? "";
    const network = body.network ?? "";
    const minPrice = Number(body.minPrice ?? 0.02);
    const maxPrice = Number(body.maxPrice ?? 12.3);
    const sort = body.sort ?? "recent";
    const page = Math.max(1, Number(body.page ?? 1));
    const limit = Math.max(1, Number(body.limit ?? 6));

    // As contagens das facetas respeitam apenas o recorte da aba.
    const scope = nfts.filter((nft) => tab === "all" || (tab === "new" ? nft.isNew : nft.trending));
    const categories = new Set(category ? category.split(",") : []);
    const networks = new Set(network ? network.split(",") : []);
    let result = scope.filter((nft) => {
      const matchesSearch = `${nft.name} ${nft.collection} ${nft.artist}`.toLowerCase().includes(search);
      return (
        matchesSearch &&
        (!categories.size || categories.has(nft.category)) &&
        (!collection || nft.collection === collection) &&
        (!networks.size || networks.has(nft.network)) &&
        Number(nft.price) >= minPrice &&
        Number(nft.price) <= maxPrice
      );
    });

    if (sort === "price-asc") {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price-desc") {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }

    const response = {
      items: result.slice((page - 1) * limit, page * limit),
      total: result.length,
      facets: {
        categories: countBy(scope, "category"),
        networks: countBy(scope, "network"),
      },
    };
    return delay(350).then(() => HttpResponse.json(response));
  }),
];
