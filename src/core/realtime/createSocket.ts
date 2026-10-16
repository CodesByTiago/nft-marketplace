import { io } from "socket.io-client";
import { readSession } from "@/core/auth/session";

export function createSocket() {
  return io({
    path: "/socket.io/",
    transports: ["websocket"],
    // Cada sessão abre a própria conexão; o cache do Manager reaproveitaria a query do usuário anterior.
    forceNew: true,
    // O servidor resolve o usuário pelo token; sem token a conexão é de visitante.
    query: { token: readSession()?.token ?? "" },
    reconnectionDelay: 300,
    reconnectionDelayMax: 1_500,
  });
}
