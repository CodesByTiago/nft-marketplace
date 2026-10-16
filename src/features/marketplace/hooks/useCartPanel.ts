import { useRef, useState } from "react";
import type { Nft } from "@/features/marketplace/types/nft";
import { useCart } from "./useCart";

const TOAST_DURATION = 3500;

// Carrinho com o estado de interface compartilhado pelas páginas: gaveta aberta e aviso de item adicionado.
export function useCartPanel() {
  const { cart, cartCount, addToCart: addItem, updateQuantity } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<Nft | null>(null);
  const toastTimer = useRef<number>(undefined);

  function addToCart(nft: Nft, quantity = 1) {
    addItem(nft, quantity);
    setToast(nft);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_DURATION);
  }

  function openCart() {
    setToast(null);
    setCartOpen(true);
  }

  return {
    cart,
    cartCount,
    updateQuantity,
    addToCart,
    cartOpen,
    openCart,
    closeCart: () => setCartOpen(false),
    toast,
    dismissToast: () => setToast(null),
  };
}
