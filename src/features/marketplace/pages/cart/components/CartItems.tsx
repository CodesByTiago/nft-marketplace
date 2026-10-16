import { Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { QuantityStepper } from "@/features/marketplace/components/QuantityStepper";
import type { CartEntry } from "@/features/marketplace/types/nft";
import { formatEth, toWei } from "@/features/marketplace/utils/eth";
import { tokenId } from "@/features/marketplace/utils/tokenId";

type CartItemsProps = {
  items: CartEntry[];
  onQuantity: (id: string, change: number) => void;
  onRemove: (id: string) => void;
};

export function CartItems({ items, onQuantity, onRemove }: CartItemsProps) {
  return (
    <div className="cart-list">
      <div className="cart-list-head" aria-hidden="true">
        <span>NFTs</span>
        <span>Preço</span>
        <span>Edições</span>
        <span>Total</span>
      </div>
      <ul>
        {items.map(({ nft, quantity }) => (
          <li className="cart-row" key={nft.id}>
            <Link className="cart-row-art" to="/nft/$nftId" params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}>
              <img src={nft.image} alt="" />
            </Link>
            <div className="cart-row-info">
              <Link to="/nft/$nftId" params={{ nftId: nft.id }}>
                {nft.name}
              </Link>
              <span className="cart-row-token">ID do token: {tokenId(nft.name)}</span>
              <span className="cart-row-edition">
                Edição: {nft.edition}/{nft.totalEditions}
              </span>
            </div>
            <span className="cart-row-price">{nft.price} ETH</span>
            <QuantityStepper
              value={quantity}
              max={nft.totalEditions}
              onChange={(value) => onQuantity(nft.id, value - quantity)}
            />
            <strong className="cart-row-total">{formatEth(toWei(nft.price) * BigInt(quantity))} ETH</strong>
            <button
              type="button"
              className="cart-row-remove"
              aria-label={`Remover ${nft.name}`}
              onClick={() => onRemove(nft.id)}
            >
              <Trash2 aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
