import { Heart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { NftDetail } from "@/features/marketplace/types/nft";
import { QuantityStepper } from "./QuantityStepper";

type NftSummaryProps = {
  nft: NftDetail;
  favorite: boolean;
  quantity: number;
  edition: string;
  onFavorite: () => void;
  onQuantity: (value: number) => void;
  onEdition: (label: string) => void;
  onBuy: () => void;
};

const STAR_COUNT = 5;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="detail-stars" role="img" aria-label={`Nota ${rating.toFixed(1)} de ${STAR_COUNT}`}>
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <img
          key={index}
          src={index < Math.floor(rating) ? "/images/detail-star.svg" : "/images/detail-star-empty.svg"}
          alt=""
        />
      ))}
    </span>
  );
}

export function NftSummary({
  nft,
  favorite,
  quantity,
  edition,
  onFavorite,
  onQuantity,
  onEdition,
  onBuy,
}: NftSummaryProps) {
  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`${nft.name} no Kurio`);

  return (
    <div className="detail-summary">
      <div className="detail-heading">
        <h1>{nft.name}</h1>
        <p className="detail-rating-pill">
          <img src="/images/detail-star.svg" alt="" />
          <strong>{nft.rating.toFixed(1)}</strong>
          <span>({nft.reviewCount})</span>
        </p>
        <div className="detail-price-row">
          <strong>{nft.price} ETH</strong>
          <p>
            <Stars rating={nft.rating} />
            {nft.reviewCount} avaliações de colecionadores
          </p>
        </div>
      </div>

      <div className="detail-about">
        <h2>Sobre este NFT:</h2>
        <p className="detail-about-long">{nft.about}</p>
        <p className="detail-about-short">{nft.summary}</p>
      </div>

      <div className="detail-editions">
        <h2>Edição:</h2>
        <div role="group" aria-label="Edição">
          {nft.editions.map(({ label, available }) => (
            <button
              type="button"
              key={label}
              className="edition-chip"
              aria-pressed={edition === label}
              disabled={!available}
              title={available ? undefined : "Edição indisponível"}
              onClick={() => onEdition(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="detail-buy">
        <QuantityStepper value={quantity} max={nft.totalEditions} onChange={onQuantity} />
        <div>
          <Button className="buy-button" onClick={onBuy}>
            COMPRAR
          </Button>
          <Button variant="outline" className="favorite-action" aria-pressed={favorite} onClick={onFavorite}>
            <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Favoritado" : "Favoritar"}
          </Button>
        </div>
      </div>
      {quantity >= nft.totalEditions && (
        <p className="quantity-limit" role="status">
          Limite de {nft.totalEditions} {nft.totalEditions === 1 ? "unidade" : "unidades"} por obra.
        </p>
      )}

      <div className="detail-token">
        <p>ID do token: {nft.tokenId}</p>
        <p>Coleção: {nft.collection}</p>
        <p>Atributos: {nft.attributes.join(", ")}</p>
      </div>

      <div className="detail-share">
        <strong>Compartilhar este NFT:</strong>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartilhar no LinkedIn"
        >
          <img src="/images/detail-linkedin.svg" alt="" />
        </a>
        <a href={`mailto:?subject=${shareText}&body=${shareUrl}`} aria-label="Compartilhar por e-mail">
          <img src="/images/detail-message.svg" alt="" />
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartilhar no X"
        >
          <img src="/images/detail-twitter.svg" alt="" />
        </a>
      </div>
    </div>
  );
}
