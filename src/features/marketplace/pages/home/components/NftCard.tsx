import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { Nft } from "@/features/marketplace/types/nft";

type NftCardProps = {
  nft: Nft;
  favorite: boolean;
  onFavorite: () => void;
  onAdd: () => void;
};

export function NftCard({ nft, favorite, onFavorite, onAdd }: NftCardProps) {
  return (
    <article className="nft-card">
      <div className="nft-artwork">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="nft-artwork-link"
          aria-label={`Ver detalhes de ${nft.name}`}
        >
          <img src={nft.image} alt={nft.name} loading="lazy" />
        </Link>
        <Button
          className="favorite-button"
          variant="ghost"
          size="icon"
          aria-label={favorite ? `Remover ${nft.name} dos favoritos` : `Adicionar ${nft.name} aos favoritos`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="nft-card-content">
        <span>{nft.collection}</span>
        <h3>
          <Link to="/nft/$nftId" params={{ nftId: nft.id }}>
            {nft.name}
          </Link>
        </h3>
        <div className="nft-card-footer">
          <div className="nft-card-price">
            <strong>{nft.price} ETH</strong>
            {nft.previousPrice && <del>{nft.previousPrice} ETH</del>}
          </div>
          <Button
            className="add-to-cart"
            variant="outline"
            size="icon-sm"
            onClick={onAdd}
            aria-label={`Adicionar ${nft.name} ao carrinho`}
          >
            <ShoppingBag aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
