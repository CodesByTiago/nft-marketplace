import { X } from "lucide-react";
import { dismissNotice, useNotices } from "../hooks/useNotices";

// Região viva: leitores de tela anunciam mudanças de preço e disponibilidade.
export function RealtimeNotices({ connected }: { connected: boolean }) {
  const notices = useNotices();

  return (
    <div className="realtime-notices" role="status" aria-live="polite" data-connected={connected}>
      {notices.map((notice) => (
        <p key={notice.id} className="realtime-notice">
          <span>{notice.message}</span>
          <button type="button" aria-label="Dispensar aviso" onClick={() => dismissNotice(notice.id)}>
            <X aria-hidden="true" />
          </button>
        </p>
      ))}
    </div>
  );
}
