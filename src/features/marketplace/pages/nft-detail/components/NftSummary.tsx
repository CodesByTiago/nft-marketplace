import { Heart } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { NftDetail } from "@/features/marketplace/types/nft";
import { cn } from "@/shared/utils/cn";
import { QuantityStepper } from "@/features/marketplace/components/QuantityStepper";

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
const SECTION_TITLE = "mb-1.5 text-[15px] font-bold";
const ABOUT = "text-[14px] leading-6 text-muted-foreground";
const ACTION = "h-10 w-[130px] rounded-[6px] text-[14px]! font-bold!";
const SHARE_LINK =
  "grid size-8 place-items-center rounded-full border border-border transition-[border-color,background-color] duration-200 ease-[ease] hover:border-primary hover:bg-surface focus-visible:border-primary focus-visible:bg-surface";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`Nota ${rating.toFixed(1)} de ${STAR_COUNT}`}>
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <img
          className="size-[15px]"
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
    <div className="flex min-h-[448px] flex-1 flex-col justify-between gap-3 max-[640px]:relative max-[640px]:z-1 max-[640px]:-mt-[114px] max-[640px]:min-h-0 max-[640px]:justify-start max-[640px]:rounded-t-[31px] max-[640px]:bg-surface max-[640px]:px-6 max-[640px]:pt-8 max-[640px]:pb-6">
      <div className="max-[640px]:flex max-[640px]:items-center max-[640px]:justify-between max-[640px]:gap-3">
        <h1 className="text-[28px] leading-[1.2] font-bold max-[640px]:text-[20px]">{nft.name}</h1>
        <p className="hidden h-[27px] items-center gap-1 rounded-full border border-primary px-2.5 text-[13px] max-[640px]:flex">
          <img className="size-3.5" src="/images/detail-star.svg" alt="" />
          <strong>{nft.rating.toFixed(1)}</strong>
          <span>({nft.reviewCount})</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-3 border-b-[.3px] border-primary pb-3 max-[640px]:hidden">
          <strong className="text-[22px] text-primary-light">
            {nft.available === false ? "Esgotado" : `${nft.price} ETH`}
          </strong>
          <p className="flex items-center gap-2 text-[15px]">
            <Stars rating={nft.rating} />
            {nft.reviewCount} avaliações de colecionadores
          </p>
        </div>
      </div>

      <div>
        <h2 className={SECTION_TITLE}>Sobre este NFT:</h2>
        <p className={cn(ABOUT, "max-[640px]:hidden")}>{nft.about}</p>
        <p className={cn(ABOUT, "hidden max-[640px]:block")}>{nft.summary}</p>
      </div>

      <div>
        <h2 className={SECTION_TITLE}>Edição:</h2>
        <div className="flex flex-wrap gap-2 max-[640px]:gap-3" role="group" aria-label="Edição">
          {nft.editions.map(({ label, available }) => (
            <button
              type="button"
              key={label}
              className="h-7 rounded-full border border-border px-3 text-[13px]! text-foreground aria-pressed:border-primary aria-pressed:font-medium! aria-pressed:text-primary-light disabled:cursor-not-allowed disabled:opacity-45"
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

      <div className="flex items-center gap-4 max-[640px]:hidden">
        <QuantityStepper value={quantity} max={nft.totalEditions} onChange={onQuantity} />
        <div className="flex gap-3">
          <Button
            className={cn(ACTION, "bg-primary text-background hover:bg-primary-light")}
            onClick={onBuy}
            disabled={nft.available === false}
          >
            COMPRAR
          </Button>
          <Button
            variant="outline"
            className={cn(ACTION, "border-primary text-primary hover:text-primary")}
            aria-pressed={favorite}
            onClick={onFavorite}
          >
            <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
            {favorite ? "Favoritado" : "Favoritar"}
          </Button>
        </div>
      </div>
      {quantity >= nft.totalEditions && (
        <p className="text-[13px] text-primary-light" role="status">
          Limite de {nft.totalEditions} {nft.totalEditions === 1 ? "unidade" : "unidades"} por obra.
        </p>
      )}

      <div className="[&_p]:text-[15px] [&_p]:leading-6 [&_p]:text-[#b39463]">
        <p>ID do token: {nft.tokenId}</p>
        <p>Coleção: {nft.collection}</p>
        <p>Atributos: {nft.attributes.join(", ")}</p>
      </div>

      <div className="detail-share flex items-center gap-3 text-[15px] max-[640px]:hidden">
        <strong>Compartilhar este NFT:</strong>
        <a
          className={SHARE_LINK}
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartilhar no LinkedIn"
        >
          <img className="size-3.5 object-contain" src="/images/detail-linkedin.svg" alt="" />
        </a>
        <a
          className={SHARE_LINK}
          href={`mailto:?subject=${shareText}&body=${shareUrl}`}
          aria-label="Compartilhar por e-mail"
        >
          <img className="size-3.5 object-contain" src="/images/detail-message.svg" alt="" />
        </a>
        <a
          className={SHARE_LINK}
          href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Compartilhar no X"
        >
          <img className="size-3.5 object-contain" src="/images/detail-twitter.svg" alt="" />
        </a>
      </div>
    </div>
  );
}
