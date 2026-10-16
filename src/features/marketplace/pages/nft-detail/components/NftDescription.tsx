import { useState } from "react";
import type { NftDetail } from "@/features/marketplace/types/nft";

type Tab = "details" | "reviews";

export function NftDescription({ nft }: { nft: NftDetail }) {
  const [tab, setTab] = useState<Tab>("details");

  return (
    <section className="detail-description" aria-label="Descrição do NFT">
      <div className="detail-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          id="tab-details"
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
          aria-selected={tab === "reviews"}
          aria-controls="panel-reviews"
          onClick={() => setTab("reviews")}
        >
          Avaliações de colecionadores ({nft.reviewCount})
        </button>
      </div>

      {tab === "details" ? (
        <div role="tabpanel" id="panel-details" aria-labelledby="tab-details" className="detail-panel">
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
        <ul role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" className="detail-panel detail-reviews">
          {nft.reviews.map((review) => (
            <li key={review.comment}>
              <strong>{review.author}</strong>
              <span aria-label={`Nota ${review.rating} de 5`}>{"★".repeat(review.rating)}</span>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
