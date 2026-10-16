import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCart } from "@/features/marketplace/hooks/useCart";
import { useFavorites } from "@/features/marketplace/hooks/useFavorites";
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

describe("useCart", () => {
  it("adiciona itens, limita à edição disponível e persiste no localStorage", () => {
    const { result } = renderHook(() => useCart());

    act(() => result.current.addToCart(nft));
    act(() => result.current.addToCart(nft));
    act(() => result.current.addToCart(nft));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cartCount).toBe(2);
    expect(JSON.parse(localStorage.getItem("kurio-cart") ?? "[]")).toHaveLength(1);
  });

  it("remove o item quando a quantidade chega a zero", () => {
    const { result } = renderHook(() => useCart());

    act(() => result.current.addToCart(nft));
    act(() => result.current.updateQuantity(nft.id, -1));

    expect(result.current.cart).toEqual([]);
    expect(result.current.cartCount).toBe(0);
  });

  it("restaura o carrinho salvo", () => {
    localStorage.setItem("kurio-cart", JSON.stringify([{ nft, quantity: 2 }]));

    const { result } = renderHook(() => useCart());

    expect(result.current.cartCount).toBe(2);
  });
});

describe("useFavorites", () => {
  it("alterna um favorito", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite("nft-1"));
    expect(result.current.favorites).toEqual(["nft-1"]);

    act(() => result.current.toggleFavorite("nft-1"));
    expect(result.current.favorites).toEqual([]);
  });
});
