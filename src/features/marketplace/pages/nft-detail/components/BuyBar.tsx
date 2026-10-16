import { ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { NftDetail } from "@/features/marketplace/types/nft";
import { QuantityStepper } from "./QuantityStepper";

type BuyBarProps = {
  nft: NftDetail;
  quantity: number;
  onQuantity: (value: number) => void;
  onBuy: () => void;
  onAdd: () => void;
};

export function BuyBar({ nft, quantity, onQuantity, onBuy, onAdd }: BuyBarProps) {
  return (
    <div className="buy-bar">
      <div className="buy-bar-top">
        <div className="buy-bar-quantity">
          <span>Qtd.</span>
          <QuantityStepper value={quantity} max={nft.totalEditions} onChange={onQuantity} />
        </div>
        <strong>{nft.price} ETH</strong>
      </div>
      <div className="buy-bar-actions">
        <Button className="buy-bar-buy" onClick={onBuy}>
          Comprar NFT
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          className="buy-bar-cart"
          aria-label={`Adicionar ${nft.name} ao carrinho`}
          onClick={onAdd}
        >
          <ShoppingBag aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
