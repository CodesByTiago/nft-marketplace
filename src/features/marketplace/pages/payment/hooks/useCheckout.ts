import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { useRealtimeSocket } from "@/core/realtime/RealtimeContext";
import { createOrder, getOrder, QuoteChangedError } from "@/features/marketplace/services/nftService";
import type { Order, OrderRequest } from "@/features/marketplace/types/payment";
import type { OrderUpdatedEvent } from "@/features/marketplace/types/realtime";

type Fields = Pick<OrderRequest, "items" | "coupon" | "expectedTotal" | "provider" | "network" | "address">;

function read<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

// Recibo e pedido pendente pertencem ao usuário da sessão, nunca a outro.
const orderKey = (userId: string) => `kurio-order:${userId}`;
const pendingKey = (userId: string) => `kurio-pending-order:${userId}`;

// Controla o envio do pedido: impede duplicidade, aguarda o `order.updated` do Socket.IO,
// reconcilia com a API após reconexão/refresh e guarda o recibo até o colecionador fechá-lo.
export function useCheckout(onConfirmed: (itemIds: string[]) => void) {
  const queryClient = useQueryClient();
  const socket = useRealtimeSocket();
  const userId = useAuth().user?.id ?? "guest";
  const [order, setOrder] = useState<Order | null>(() => read<Order>(orderKey(userId)));
  const [submitting, setSubmitting] = useState(false);
  const [awaiting, setAwaiting] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const appliedVersions = useRef(new Map<string, number>());
  const confirmedCallback = useRef(onConfirmed);
  confirmedCallback.current = onConfirmed;

  // Aplica o estado do pedido vindo do POST, do GET ou do evento; versões antigas são ignoradas.
  function apply(next: Order) {
    if (next.version <= (appliedVersions.current.get(next.key) ?? 0)) return;
    appliedVersions.current.set(next.key, next.version);
    if (next.status === "pending") {
      setAwaiting(true);
      return;
    }
    setAwaiting(false);
    localStorage.removeItem(pendingKey(userId));
    if (next.status === "confirmed") {
      localStorage.setItem(orderKey(userId), JSON.stringify(next));
      confirmedCallback.current(next.items.map((item) => item.id));
      setOrder(next);
    } else {
      setError(next.reason ?? "A compra foi recusada.");
    }
  }
  const applyRef = useRef(apply);
  applyRef.current = apply;

  async function send(request: OrderRequest) {
    if (busy.current) return;
    busy.current = true;
    setSubmitting(true);
    setError("");
    localStorage.setItem(pendingKey(userId), JSON.stringify(request));
    try {
      applyRef.current(await createOrder(request));
    } catch (failure) {
      if (failure instanceof QuoteChangedError) {
        localStorage.removeItem(pendingKey(userId));
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
  const sendRef = useRef(send);
  sendRef.current = send;

  function submit(fields: Fields) {
    const pending = read<OrderRequest>(pendingKey(userId));
    void send({ ...fields, key: pending?.key ?? crypto.randomUUID() });
  }

  useEffect(() => {
    appliedVersions.current.clear();
    setOrder(read<Order>(orderKey(userId)));
    setAwaiting(false);
    const pending = read<OrderRequest>(pendingKey(userId));
    if (pending) void sendRef.current(pending);
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    const onOrder = (event: OrderUpdatedEvent) => {
      const pending = read<OrderRequest>(pendingKey(userId));
      if (event.userId !== userId || event.resource.id !== pending?.key) return;
      applyRef.current(event.order);
    };
    // Após reconexão, a API decide o estado: o evento pode ter sido perdido durante a queda.
    const reconcile = async () => {
      const pending = read<OrderRequest>(pendingKey(userId));
      if (!pending || busy.current) return;
      try {
        applyRef.current(await getOrder(pending.key));
      } catch (failure) {
        const status = (failure as { response?: { status?: number } }).response?.status;
        if (status === 404) void sendRef.current(pending);
      }
    };
    socket.on("order.updated", onOrder);
    socket.on("connect", reconcile);
    return () => {
      socket.off("order.updated", onOrder);
      socket.off("connect", reconcile);
    };
  }, [socket, userId]);

  function closeReceipt() {
    localStorage.removeItem(orderKey(userId));
    setOrder(null);
  }

  return { order, submitting: submitting || awaiting, error, submit, closeReceipt };
}
