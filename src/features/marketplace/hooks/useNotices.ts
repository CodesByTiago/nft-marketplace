import { useSyncExternalStore } from "react";
import type { RealtimeNotice } from "../types/realtime";

// Avisos de tempo real (mudança de preço/disponibilidade) exibidos globalmente.
let notices: RealtimeNotice[] = [];
const listeners = new Set<() => void>();

function emit(next: RealtimeNotice[]) {
  notices = next;
  listeners.forEach((listener) => listener());
}

export function pushNotice(notice: RealtimeNotice) {
  emit([...notices.filter((item) => item.id !== notice.id), notice]);
}

export function dismissNotice(id: string) {
  emit(notices.filter((item) => item.id !== id));
}

export function useNotices() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => notices,
  );
}
