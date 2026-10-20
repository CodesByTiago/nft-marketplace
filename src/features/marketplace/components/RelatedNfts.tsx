import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNfts } from "@/features/marketplace/services/nftService";
import type { Nft } from "@/features/marketplace/types/nft";
import { NftCard } from "./NftCard";

const PAGE_SIZE = 5;
const MAX_ITEMS = 15;

type RelatedNftsProps = {
  title: string;
  /** Sem coleção, lista as obras em alta. */
  collection?: string;
  excludeIds: string[];
  favorites: string[];
  onFavorite: (id: string) => void;
  onAdd: (nft: Nft) => void;
};

export function RelatedNfts({ title, collection, excludeIds, favorites, onFavorite, onAdd }: RelatedNftsProps) {
  const [page, setPage] = useState(0);
  const { data } = useQuery({
    queryKey: ["nfts", "related", collection ?? "trending"],
    queryFn: () => getNfts(collection ? { collection, limit: 40 } : { tab: "trending", limit: 40 }),
  });
  const items = (data?.items ?? []).filter((nft) => !excludeIds.includes(nft.id)).slice(0, MAX_ITEMS);
  if (items.length === 0) return null;

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section
      className="related-section mt-14 max-[640px]:mx-6 max-[640px]:mt-8 [&_h2]:border-b-[.3px] [&_h2]:border-primary [&_h2]:pb-2 [&_h2]:text-primary-light"
      aria-labelledby="related-title"
    >
      <h2 id="related-title" className="text-[17px] font-bold">
        {title}
      </h2>
      <ul className="related-grid mt-6 grid list-none grid-cols-5 gap-5 p-0 max-[900px]:grid-cols-3 max-[640px]:grid-cols-2">
        {visible.map((nft) => (
          <li className="min-w-0" key={nft.id}>
            <NftCard
              nft={nft}
              favorite={favorites.includes(nft.id)}
              onFavorite={() => onFavorite(nft.id)}
              onAdd={() => onAdd(nft)}
            />
          </li>
        ))}
      </ul>
      {pageCount > 1 && (
        <div className="mt-6 flex justify-center gap-3" role="group" aria-label={`Páginas de ${title.toLowerCase()}`}>
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              type="button"
              className="size-3 rounded-full border-[1.3px] border-primary bg-transparent p-0 focus-visible:outline-foreground aria-[current=true]:bg-primary"
              key={index}
              aria-label={`Página ${index + 1} de ${pageCount}`}
              aria-current={index === page ? "true" : undefined}
              onClick={() => setPage(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
