import { http, HttpResponse } from "msw";
import { authenticate, readData, writeData } from "@/core/msw/db";
import { nfts } from "./data";

const COLLECTION = "favorites";

export const favoritesHandlers = [
  http.get("/api/favorites", async ({ request }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    return HttpResponse.json({ ids: await readData<string[]>(COLLECTION, auth.user.id, []) });
  }),
  http.put("/api/favorites/:id", async ({ request, params }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const id = String(params.id);
    if (!nfts.some((nft) => nft.id === id))
      return HttpResponse.json({ message: "NFT não encontrado." }, { status: 404 });
    const current = await readData<string[]>(COLLECTION, auth.user.id, []);
    await writeData(COLLECTION, auth.user.id, [...new Set([...current, id])]);
    return new HttpResponse(null, { status: 204 });
  }),
  http.delete("/api/favorites/:id", async ({ request, params }) => {
    const auth = await authenticate(request);
    if ("response" in auth) return auth.response;
    const current = await readData<string[]>(COLLECTION, auth.user.id, []);
    await writeData(
      COLLECTION,
      auth.user.id,
      current.filter((id) => id !== params.id),
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
