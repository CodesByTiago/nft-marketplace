import { useEffect, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/core/auth/AuthContext";
import { createSocket } from "@/core/realtime/createSocket";
import { RealtimeContext } from "@/core/realtime/RealtimeContext";
import { RealtimeNotices } from "@/features/marketplace/components/RealtimeNotices";
import { useNftUpdates } from "@/features/marketplace/hooks/useNftUpdates";

function RealtimeBridge({ socket }: { socket: Socket | null }) {
  const [connected, setConnected] = useState(false);
  useNftUpdates();

  useEffect(() => {
    if (!socket) return;
    const online = () => setConnected(true);
    const offline = () => setConnected(false);
    socket.on("connect", online);
    socket.on("disconnect", offline);
    setConnected(socket.connected);
    return () => {
      socket.off("connect", online);
      socket.off("disconnect", offline);
      setConnected(false);
    };
  }, [socket]);

  return <RealtimeNotices connected={connected} />;
}

// Um socket por usuário: ao trocar de sessão a conexão (e seus listeners) é encerrada.
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const next = createSocket();
    setSocket(next);
    return () => {
      next.removeAllListeners();
      next.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return (
    <RealtimeContext.Provider value={socket}>
      {children}
      <RealtimeBridge socket={socket} />
    </RealtimeContext.Provider>
  );
}
