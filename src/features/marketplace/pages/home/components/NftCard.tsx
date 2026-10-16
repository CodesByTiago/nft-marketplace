import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { Nft } from "@/features/marketplace/types/nft";

type NftCardProps = {
  nft: Nft;
  priority?: boolean;
  favorite: boolean;
  onFavorite: () => void;
  onAdd: () => void;
};

export function NftCard({ nft, priority = false, favorite, onFavorite, onAdd }: NftCardProps) {
  return (
    <article className="nft-card">
      <div className="nft-artwork">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="nft-artwork-link"
          aria-label={`Ver detalhes de ${nft.name}`}
        >
          <img
            src={nft.image}
            alt={nft.name}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
          />
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
        <h2>
          <Link to="/nft/$nftId" params={{ nftId: nft.id }}>
            {nft.name}
          </Link>
        </h2>
        <div className="nft-card-footer">
          <div className="nft-card-price">
            <strong>{nft.available === false ? "Esgotado" : `${nft.price} ETH`}</strong>
            {nft.previousPrice && nft.available !== false && <del>{nft.previousPrice} ETH</del>}
          </div>
          <Button
            className="add-to-cart"
            variant="outline"
            size="icon-sm"
            onClick={onAdd}
            disabled={nft.available === false}
            aria-label={`Adicionar ${nft.name} ao carrinho`}
          >
            <ShoppingBag aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
