import { X } from "lucide-react";
import type { Nft } from "@/features/marketplace/types/nft";

type CartToastProps = {
  nft: Nft;
  onView: () => void;
  onClose: () => void;
};

export function CartToast({ nft, onView, onClose }: CartToastProps) {
  return (
    <div className="cart-toast" role="status" aria-live="polite">
      <img src={nft.image} alt="" />
      <div>
        <p>
          <strong>{nft.name}</strong> adicionado ao carrinho
        </p>
        <button type="button" onClick={onView}>
          Ver carrinho
        </button>
      </div>
      <button type="button" className="cart-toast-close" aria-label="Fechar aviso" onClick={onClose}>
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
