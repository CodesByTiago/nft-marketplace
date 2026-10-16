import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getNfts } from "@/features/marketplace/services/nftService";

const PAGE_SIZE = 5;
const MAX_ITEMS = 15;

export function RelatedNfts({ collection, currentId }: { collection: string; currentId: string }) {
  const [page, setPage] = useState(0);
  const { data } = useQuery({
    queryKey: ["nfts", "related", collection],
    queryFn: () => getNfts({ collection, limit: MAX_ITEMS + 1 }),
  });
  const items = (data?.items ?? []).filter((nft) => nft.id !== currentId).slice(0, MAX_ITEMS);
  if (items.length === 0) return null;

  const pageCount = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section className="related-section" aria-labelledby="related-title">
      <h2 id="related-title">Mais desta coleção</h2>
      <ul className="related-grid">
        {visible.map((nft) => (
          <li key={nft.id}>
            <Link to="/nft/$nftId" params={{ nftId: nft.id }}>
              <span className="related-art">
                <img src={nft.image} alt="" loading="lazy" />
              </span>
              <span className="related-name">{nft.name}</span>
              <strong>{nft.price} ETH</strong>
            </Link>
          </li>
        ))}
      </ul>
      {pageCount > 1 && (
        <div className="related-dots" role="group" aria-label="Páginas de obras da coleção">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              type="button"
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
