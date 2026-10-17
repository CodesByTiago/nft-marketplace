import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { AuthContext } from "@/core/auth/AuthContext";
import { createSession, findUserByEmail, resetDb } from "@/core/msw/db";
import { server } from "@/core/msw/server";
import { useCart } from "@/features/marketplace/hooks/useCart";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
import { cartHandlers } from "@/features/marketplace/mocks/cart";
import { favoritesHandlers } from "@/features/marketplace/mocks/favorites";
import type { Nft } from "@/features/marketplace/types/nft";

const nft: Nft = {
  id: "nft-1",
  name: "Cosmic Bloom #1",
  collection: "Cosmic Bloom",
  artist: "Artista",
  price: "0.5",
  image: "/images/nft.png",
  category: "Fotografia",
  network: "Ethereum",
  edition: 1,
  totalEditions: 2,
};

function guestWrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={{ user: null, openAuth: () => undefined, logout: () => undefined }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe("useCart", () => {
  it("adiciona itens, limita à edição disponível e persiste no localStorage", () => {
    const { result } = renderHook(() => useCart(), { wrapper: guestWrapper });

    act(() => result.current.addToCart(nft));
    act(() => result.current.addToCart(nft));
    act(() => result.current.addToCart(nft));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cartCount).toBe(2);
    expect(JSON.parse(localStorage.getItem("kurio-cart:guest") ?? "[]")).toHaveLength(1);
  });

  it("remove o item quando a quantidade chega a zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper: guestWrapper });

    act(() => result.current.addToCart(nft));
    act(() => result.current.updateQuantity(nft.id, -1));

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
  });

  it("restaura o carrinho salvo", () => {
    localStorage.setItem("kurio-cart:guest", JSON.stringify([{ nft, quantity: 2 }]));

    const { result } = renderHook(() => useCart(), { wrapper: guestWrapper });

    expect(result.current.cartCount).toBe(2);
  });
});

describe("useCart com sessão", () => {
  it("guarda o carrinho no servidor e não no localStorage", async () => {
    await resetDb();
    const user = (await findUserByEmail("contato@email.com"))!;
    const { token } = await createSession(user);
    localStorage.setItem(
      "kurio-session",
      JSON.stringify({ token, user: { id: user.id, username: user.username, email: user.email } }),
    );
    server.use(...cartHandlers);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <AuthContext.Provider
          value={{
            user: { id: user.id, username: user.username, email: user.email },
            openAuth: () => undefined,
            logout: () => undefined,
          }}
        >
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(result.current.cartLoading).toBe(false));

    act(() => result.current.addToCart({ ...nft, id: "emerald-ape-042" }));
    await waitFor(() => expect(result.current.cartCount).toBe(1));
    await waitFor(() => expect(client.isMutating()).toBe(0));

    expect(localStorage.getItem(`kurio-cart:${user.id}`)).toBeNull();
    expect(result.current.cartCount).toBe(1);
  });
});

describe("useFavorites", () => {
  const session = { token: "t", user: { id: "u-demo", username: "colecionador", email: "contato@email.com" } };

  function wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return (
      <QueryClientProvider client={client}>
        <AuthContext.Provider value={{ user: session.user, openAuth: () => undefined, logout: () => undefined }}>
          {children}
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  it("alterna um favorito pela API e atualiza de forma otimista", async () => {
    await resetDb();
    const { token } = await createSession((await findUserByEmail(session.user.email))!);
    localStorage.setItem("kurio-session", JSON.stringify({ ...session, token }));
    server.use(...favoritesHandlers);
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => result.current.toggleFavorite("emerald-ape-042"));
    await waitFor(() => expect(result.current.favorites).toEqual(["emerald-ape-042"]));
  });
});
