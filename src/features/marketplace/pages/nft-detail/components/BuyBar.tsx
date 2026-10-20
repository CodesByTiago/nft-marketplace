import { ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { NftDetail } from "@/features/marketplace/types/nft";
import { QuantityStepper } from "@/features/marketplace/components/QuantityStepper";

type BuyBarProps = {
  nft: NftDetail;
  quantity: number;
  onQuantity: (value: number) => void;
  onBuy: () => void;
  onAdd: () => void;
};

export function BuyBar({ nft, quantity, onQuantity, onBuy, onAdd }: BuyBarProps) {
  const soldOut = nft.available === false;
  return (
    <div className="fixed inset-x-0 bottom-0 z-45 hidden h-[164px] content-center gap-4 rounded-t-[40px] bg-surface px-6 shadow-[0_-8px_24px_rgba(10,6,4,0.6)] max-[640px]:grid">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[14px] [&_.quantity-stepper_button]:h-[30px]! [&_.quantity-stepper_button]:w-5! [&_.quantity-stepper_output]:text-[16px]!">
          <span>Qtd.</span>
          <QuantityStepper value={quantity} max={nft.totalEditions} onChange={onQuantity} />
        </div>
        <strong className="text-[20px] text-primary-light">{soldOut ? "Esgotado" : `${nft.price} ETH`}</strong>
      </div>
      <div className="flex gap-3">
        <Button
          className="h-[60px] w-[196px] rounded-[40px] bg-[linear-gradient(135deg,var(--primary-light),var(--primary))] text-[16px]! font-bold! text-background"
          onClick={onBuy}
          disabled={soldOut}
        >
          Comprar NFT
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          className="size-[60px] rounded-[40px] bg-surface-raised hover:bg-surface-raised"
          aria-label={`Adicionar ${nft.name} ao carrinho`}
          disabled={soldOut}
          onClick={onAdd}
        >
          <ShoppingBag aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
