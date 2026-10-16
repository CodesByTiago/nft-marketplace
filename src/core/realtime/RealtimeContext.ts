import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

export const RealtimeContext = createContext<Socket | null>(null);

/** Socket.IO da sessão atual; é recriado a cada troca de usuário. */
export function useRealtimeSocket() {
  return useContext(RealtimeContext);
}
