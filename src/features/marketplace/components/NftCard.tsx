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
    <article className="nft-card group/card relative min-h-0 min-w-0 max-[640px]:min-h-[244px] max-[640px]:even:translate-y-8">
      <div className="nft-artwork relative grid h-[300px] place-items-center overflow-hidden bg-surface max-[900px]:h-[250px] max-[640px]:h-[200px] max-[640px]:items-start max-[640px]:rounded-[17px]">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="grid size-full [place-items:inherit]"
          aria-label={`Ver detalhes de ${nft.name}`}
        >
          <img
            src={nft.image}
            alt={nft.name}
            className="h-[min(250px,calc(100%_-_8px))] w-[min(250px,calc(100%_-_8px))] rounded-[15px] object-cover max-[640px]:mt-3 max-[640px]:h-[min(168px,calc(100%_-_8px))] max-[640px]:w-[min(168px,calc(100%_-_8px))] max-[640px]:rounded-[13px]"
            loading={priority ? "eager" : "lazy"}
            {...(priority ? { fetchpriority: "high" } : {})}
          />
        </Link>
        <Button
          className="absolute top-2.5 right-2.5 size-[30px] rounded-full bg-[rgba(36,22,18,.88)] text-primary-light opacity-0 group-focus-within/card:opacity-100 group-hover/card:opacity-100 hover:bg-[rgba(36,22,18,.88)] hover:text-primary-light max-[640px]:top-2 max-[640px]:right-2 max-[640px]:size-7 max-[640px]:bg-[#3a2118] max-[640px]:hover:bg-[#3a2118]"
          variant="ghost"
          size="icon"
          aria-label={favorite ? `Remover ${nft.name} dos favoritos` : `Adicionar ${nft.name} aos favoritos`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart aria-hidden="true" fill={favorite ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="pt-3 max-[640px]:px-2 max-[640px]:pt-2">
        <span className="hidden">{nft.collection}</span>
        <h2 className="text-base leading-4 font-normal max-[640px]:truncate max-[640px]:text-xs">
          <Link to="/nft/$nftId" params={{ nftId: nft.id }}>
            {nft.name}
          </Link>
        </h2>
        <div className="relative mt-2 flex items-center justify-between gap-2 max-[640px]:mt-0">
          <div className="flex items-center gap-3">
            <strong className="text-[18px] leading-4 font-bold text-primary-light max-[640px]:text-sm max-[640px]:tracking-[.04em]">
              {nft.available === false ? "Esgotado" : `${nft.price} ETH`}
            </strong>
            {nft.previousPrice && nft.available !== false && (
              <del className="text-[18px] leading-4 text-[#b39463] decoration-1">{nft.previousPrice} ETH</del>
            )}
          </div>
          <Button
            className="absolute right-0 bottom-0 opacity-0 group-focus-within/card:opacity-100! group-hover/card:opacity-100! disabled:opacity-0 max-[640px]:hidden [&_svg]:w-3.5!"
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
