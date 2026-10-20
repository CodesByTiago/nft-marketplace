import { X } from "lucide-react";
import type { Nft } from "@/features/marketplace/types/nft";

type CartToastProps = {
  nft: Nft;
  onView: () => void;
  onClose: () => void;
};

export function CartToast({ nft, onView, onClose }: CartToastProps) {
  return (
    <div
      className="cart-toast fixed top-[84px] right-[max(24px,calc((100%_-_1200px)/2))] z-60 flex w-[min(340px,calc(100%_-_32px))] animate-[toast-in_.25s_ease-out] items-center gap-3 rounded-lg border border-primary bg-surface p-3 shadow-[0_8px_24px_rgba(10,6,4,0.6)] max-[640px]:top-auto! max-[640px]:right-4 max-[640px]:bottom-28"
      role="status"
      aria-live="polite"
    >
      <img className="size-12 shrink-0 rounded-[6px] object-cover" src={nft.image} alt="" />
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[14px]">
          <strong>{nft.name}</strong> adicionado ao carrinho
        </p>
        <button
          type="button"
          className="bg-transparent p-0 text-[14px] font-bold text-primary underline"
          onClick={onView}
        >
          Ver carrinho
        </button>
      </div>
      <button
        type="button"
        className="self-start bg-transparent p-0 text-muted-foreground"
        aria-label="Fechar aviso"
        onClick={onClose}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
