import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import type { CartEntry, Nft } from "@/features/marketplace/types/nft";
import { getCart, mergeCart, removeCartItems, setCartQuantity } from "../services/cartService";
import { readStoredValue, useStoredState, writeStored } from "./useStoredState";

export const cartKey = (userId: string) => `kurio-cart:${userId}`;
export const cartQueryKey = (userId: string) => ["private", "cart", userId];

const emptyCart: CartEntry[] = [];

type Change = { type: "set"; nft: Nft; quantity: number } | { type: "remove"; ids: string[] };

function applyChange(cart: CartEntry[], change: Change): CartEntry[] {
  if (change.type === "remove") return cart.filter((item) => !change.ids.includes(item.nft.id));
  const { nft, quantity } = change;
  if (quantity <= 0) return cart.filter((item) => item.nft.id !== nft.id);
  return cart.some((item) => item.nft.id === nft.id)
    ? cart.map((item) => (item.nft.id === nft.id ? { ...item, quantity } : item))
    : [...cart, { nft, quantity }];
}

// Visitantes usam um carrinho local; usuários autenticados usam o carrinho do servidor (`/api/cart`).
export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const queryKey = cartQueryKey(userId ?? "guest");
  const [guestCart, setGuestCart] = useStoredState<CartEntry[]>(cartKey("guest"), emptyCart);

  const { data: serverCart = emptyCart, isPending } = useQuery({
    queryKey,
    queryFn: getCart,
    enabled: Boolean(userId),
  });

  const mutation = useMutation({
    mutationKey: ["cart"],
    mutationFn: (change: Change) =>
      change.type === "set" ? setCartQuantity(change.nft.id, change.quantity) : removeCartItems(change.ids),
    // Atualização otimista; a falha restaura o carrinho anterior e a revalidação final traz o estado do servidor.
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CartEntry[]>(queryKey) ?? emptyCart;
      queryClient.setQueryData<CartEntry[]>(queryKey, applyChange(previous, change));
      return { previous };
    },
    onError: (_error, _change, context) => queryClient.setQueryData(queryKey, context?.previous),
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: ["cart"] }) <= 1) void queryClient.invalidateQueries({ queryKey });
    },
  });

  // Ao entrar, o carrinho de visitante é mesclado ao da conta e descartado; se a mesclagem falha, ele volta.
  useEffect(() => {
    if (!userId) return;
    const guest = readStoredValue(cartKey("guest"), emptyCart);
    if (!guest.length) return;
    writeStored(cartKey("guest"), emptyCart);
    mergeCart(guest.map(({ nft, quantity }) => ({ id: nft.id, quantity })))
      .then(() => queryClient.invalidateQueries({ queryKey: cartQueryKey(userId) }))
      .catch(() => writeStored(cartKey("guest"), guest));
  }, [userId, queryClient]);

  function commit(compute: (current: CartEntry[]) => Change | undefined) {
    if (!userId) {
      setGuestCart((current) => {
        const change = compute(current);
        return change ? applyChange(current, change) : current;
      });
      return;
    }
    const change = compute(queryClient.getQueryData<CartEntry[]>(queryKey) ?? emptyCart);
    if (change) mutation.mutate(change);
  }

  const cart = userId ? serverCart : guestCart;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function addToCart(nft: Nft, quantity = 1) {
    commit((current) => {
      const existing = current.find((item) => item.nft.id === nft.id)?.quantity ?? 0;
      return { type: "set", nft, quantity: Math.min(existing + quantity, nft.totalEditions) };
    });
  }

  function updateQuantity(id: string, change: number) {
    commit((current) => {
      const item = current.find((entry) => entry.nft.id === id);
      if (!item) return undefined;
      return { type: "set", nft: item.nft, quantity: Math.min(item.nft.totalEditions, item.quantity + change) };
    });
  }

  const removeItems = (ids: string[]) => commit(() => ({ type: "remove", ids }));
  const removeFromCart = (id: string) => removeItems([id]);

  return {
    cart,
    cartCount,
    cartLoading: Boolean(userId) && isPending,
    addToCart,
    updateQuantity,
    removeFromCart,
    removeItems,
  };
}
