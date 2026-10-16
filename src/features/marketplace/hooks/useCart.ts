import { useAuth } from "@/core/auth/AuthContext";
import type { CartEntry, Nft } from "@/features/marketplace/types/nft";
import { useEffect } from "react";
import { readStoredValue, useStoredState, writeStored } from "./useStoredState";

export const cartKey = (userId: string) => `kurio-cart:${userId}`;
const emptyCart: CartEntry[] = [];

function mergeCarts(own: CartEntry[], guest: CartEntry[]) {
  const merged = [...own];
  for (const entry of guest) {
    const index = merged.findIndex((item) => item.nft.id === entry.nft.id);
    if (index < 0) merged.push(entry);
    else {
      const item = merged[index];
      merged[index] = { ...item, quantity: Math.min(item.quantity + entry.quantity, item.nft.totalEditions) };
    }
  }
  return merged;
}

export function useCart() {
  const { user } = useAuth();
  // Cada usuário tem o próprio carrinho; visitantes usam o carrinho "guest", mesclado ao entrar.
  const [cart, setCart] = useStoredState<CartEntry[]>(cartKey(user?.id ?? "guest"), emptyCart);
  const userId = user?.id;

  // Ao entrar, o carrinho de visitante é mesclado ao da conta e descartado.
  useEffect(() => {
    if (!userId) return;
    const guest = readStoredValue(cartKey("guest"), emptyCart);
    if (!guest.length) return;
    writeStored(cartKey("guest"), emptyCart);
    writeStored(cartKey(userId), mergeCarts(readStoredValue(cartKey(userId), emptyCart), guest));
  }, [userId]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(nft: Nft, quantity = 1) {
    setCart((current) => {
      const existing = current.find((item) => item.nft.id === nft.id);
      return existing
        ? current.map((item) =>
            item.nft.id === nft.id
              ? { ...item, quantity: Math.min(item.quantity + quantity, nft.totalEditions) }
              : item,
          )
        : [...current, { nft, quantity: Math.min(quantity, nft.totalEditions) }];
    });
  }

  function updateQuantity(id: string, change: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.nft.id === id ? { ...item, quantity: Math.min(item.nft.totalEditions, item.quantity + change) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(id: string) {
    setCart((current) => current.filter((item) => item.nft.id !== id));
  }

  function removeItems(ids: string[]) {
    setCart((current) => current.filter((item) => !ids.includes(item.nft.id)));
  }

  return { cart, cartCount, addToCart, updateQuantity, removeFromCart, removeItems };
}
