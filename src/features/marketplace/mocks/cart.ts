import { delay, http, HttpResponse } from "msw";
import { authenticate, readData, writeData } from "@/core/msw/db";
import type { CartEntry } from "../types/nft";
import { nfts } from "./data";

const CART = "cart";

type Line = { id: string; quantity: number };

// O servidor guarda só id e quantidade e devolve os NFTs com o estado atual do catálogo.
const hydrate = (lines: Line[]): CartEntry[] =>
  lines.flatMap(({ id, quantity }) => {
    const nft = nfts.find((item) => item.id === id);
    return nft ? [{ nft: { ...nft }, quantity }] : [];
  });

const clamp = (id: string, quantity: number) => {
  const nft = nfts.find((item) => item.id === id);
  return nft ? Math.max(0, Math.min(Math.floor(quantity) || 0, nft.totalEditions)) : 0;
};

// Mantém a ordem de inserção: alterar a quantidade não muda a posição do item.
function setLine(lines: Line[], id: string, quantity: number) {
  if (quantity <= 0) return lines.filter((line) => line.id !== id);
  return lines.some((line) => line.id === id)
    ? lines.map((line) => (line.id === id ? { id, quantity } : line))
    : [...lines, { id, quantity }];
}

export const cartHandlers = [
  http.get("/api/cart", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    await delay(200);
    return HttpResponse.json({ items: hydrate(await readData<Line[]>(CART, auth.user.id, [])) });
  }),
  http.put("/api/cart/items/:id", async ({ request, params }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const id = String(params.id);
    if (!nfts.some((nft) => nft.id === id))
      return HttpResponse.json({ message: "NFT não encontrado." }, { status: 404 });
    const { quantity } = (await request.json()) as { quantity: number };
    const lines = setLine(await readData<Line[]>(CART, auth.user.id, []), id, clamp(id, quantity));
    await writeData(CART, auth.user.id, lines);
    await delay(200);
    return HttpResponse.json({ items: hydrate(lines) });
  }),
  http.delete("/api/cart/items", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const ids = new Set((new URL(request.url).searchParams.get("ids") ?? "").split(",").filter(Boolean));
    const lines = (await readData<Line[]>(CART, auth.user.id, [])).filter((line) => !ids.has(line.id));
    await writeData(CART, auth.user.id, lines);
    await delay(200);
    return HttpResponse.json({ items: hydrate(lines) });
  }),
  // Une o carrinho de visitante ao da conta ao entrar.
  http.post("/api/cart/merge", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const { items = [] } = (await request.json()) as { items?: Line[] };
    let lines = await readData<Line[]>(CART, auth.user.id, []);
    for (const { id, quantity } of items) {
      const current = lines.find((line) => line.id === id)?.quantity ?? 0;
      lines = setLine(lines, id, clamp(id, current + quantity));
    }
    await writeData(CART, auth.user.id, lines);
    return HttpResponse.json({ items: hydrate(lines) });
  }),
];
