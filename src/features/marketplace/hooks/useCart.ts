import type { CartEntry, Nft } from "@/features/marketplace/types/nft";
import { useStoredState } from "./useStoredState";

const CART_KEY = "kurio-cart";
const emptyCart: CartEntry[] = [];

export function useCart() {
  const [cart, setCart] = useStoredState<CartEntry[]>(CART_KEY, emptyCart);
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

  return { cart, cartCount, addToCart, updateQuantity, removeFromCart };
}
