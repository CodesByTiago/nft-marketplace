import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createOrder, QuoteChangedError } from "@/features/marketplace/services/nftService";
import type { Order, OrderRequest } from "@/features/marketplace/types/payment";

const ORDER_KEY = "kurio-order";
const PENDING_KEY = "kurio-pending-order";

type Fields = Pick<OrderRequest, "items" | "coupon" | "expectedTotal" | "provider" | "network" | "address">;

function read<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

// Controla o envio do pedido: impede duplicidade, recupera pedido pendente após refresh
// e guarda o recibo confirmado até o colecionador fechar a confirmação.
export function useCheckout(onConfirmed: (itemIds: string[]) => void) {
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<Order | null>(() => read<Order>(ORDER_KEY));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const confirmedCallback = useRef(onConfirmed);
  confirmedCallback.current = onConfirmed;

  async function send(request: OrderRequest) {
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError("");
    localStorage.setItem(PENDING_KEY, JSON.stringify(request));
    try {
      const result = await createOrder(request);
      localStorage.removeItem(PENDING_KEY);
      if (result.status === "confirmed") {
        localStorage.setItem(ORDER_KEY, JSON.stringify(result));
        confirmedCallback.current(result.items.map((item) => item.id));
        setOrder(result);
      } else {
        setError(result.reason ?? "A compra foi recusada.");
      }
    } catch (failure) {
      if (failure instanceof QuoteChangedError) {
        localStorage.removeItem(PENDING_KEY);
        setError("Os valores foram atualizados. Revise o total e confirme novamente.");
        await queryClient.invalidateQueries({ queryKey: ["cart-quote"] });
      } else {
        // Mantém o pedido pendente: tentar de novo reutiliza a mesma chave.
        setError("Não foi possível concluir a compra. Seus itens foram mantidos; tente novamente.");
      }
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }

  function submit(fields: Fields) {
    const pending = read<OrderRequest>(PENDING_KEY);
    void send({ ...fields, key: pending?.key ?? crypto.randomUUID() });
  }

  useEffect(() => {
    const pending = read<OrderRequest>(PENDING_KEY);
    if (pending) void send(pending);
    // Executa só na montagem, para recuperar um pedido pendente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeReceipt() {
    localStorage.removeItem(ORDER_KEY);
    setOrder(null);
  }

  return { order, submitting, error, submit, closeReceipt };
}
