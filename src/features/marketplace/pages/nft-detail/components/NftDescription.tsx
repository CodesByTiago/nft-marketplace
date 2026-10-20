import { useState } from "react";
import type { NftDetail } from "@/features/marketplace/types/nft";

type Tab = "details" | "reviews";

const TAB =
  "-mb-px border-b-[3px] border-transparent pb-2 text-[17px]! text-foreground aria-selected:border-primary aria-selected:font-bold! aria-selected:text-primary-light max-[640px]:flex-none max-[640px]:text-[15px]!";

const PANEL =
  "mt-5 grid gap-3 text-[14px] leading-6 text-muted-foreground [&_h3]:mt-2 [&_h3]:text-[15px] [&_h3]:font-bold [&_h3]:text-foreground";

export function NftDescription({ nft }: { nft: NftDetail }) {
  const [tab, setTab] = useState<Tab>("details");

  return (
    <section className="mt-14 max-[640px]:mx-6 max-[640px]:mt-8" aria-label="Descrição do NFT">
      <div
        className="flex gap-8 border-b-[.3px] border-primary max-[640px]:gap-4 max-[640px]:overflow-x-auto"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          id="tab-details"
          className={TAB}
          aria-selected={tab === "details"}
          aria-controls="panel-details"
          onClick={() => setTab("details")}
        >
          Detalhes do NFT
        </button>
        <button
          type="button"
          role="tab"
          id="tab-reviews"
          className={TAB}
          aria-selected={tab === "reviews"}
          aria-controls="panel-reviews"
          onClick={() => setTab("reviews")}
        >
          Avaliações de colecionadores ({nft.reviewCount})
        </button>
      </div>

      {tab === "details" ? (
        <div role="tabpanel" id="panel-details" aria-labelledby="tab-details" className={PANEL}>
          {nft.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h3>Rede:</h3>
          <p>{nft.networkNote}</p>
          <h3>Contrato:</h3>
          <p>{nft.contract}</p>
          <h3>Direitos autorais:</h3>
          <p>{nft.royalties}</p>
        </div>
      ) : (
        <ul role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" className={PANEL}>
          {nft.reviews.map((review) => (
            <li key={review.comment} className="grid gap-1">
              <strong>{review.author}</strong>
              <span className="text-primary-light" aria-label={`Nota ${review.rating} de 5`}>
                {"★".repeat(review.rating)}
              </span>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
