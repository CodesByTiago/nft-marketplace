import { X } from "lucide-react";
import { dismissNotice, useNotices } from "../hooks/useNotices";

// Região viva: leitores de tela anunciam mudanças de preço e disponibilidade.
export function RealtimeNotices({ connected }: { connected: boolean }) {
  const notices = useNotices();

  return (
    <div
      className="realtime-notices pointer-events-none fixed top-3 right-3 z-80 grid w-[min(380px,calc(100vw_-_24px))] gap-2"
      role="status"
      aria-live="polite"
      data-connected={connected}
    >
      {notices.map((notice) => (
        <p
          key={notice.id}
          className="realtime-notice pointer-events-auto flex items-start gap-3 border border-primary bg-surface-raised px-3.5 py-3 text-[13px] leading-[1.4] text-foreground"
        >
          <span className="flex-1">{notice.message}</span>
          <button
            className="grid size-5 cursor-pointer place-items-center bg-transparent text-muted-foreground"
            type="button"
            aria-label="Dispensar aviso"
            onClick={() => dismissNotice(notice.id)}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </p>
      ))}
    </div>
  );
}
