export function NftDetailSkeleton() {
  return (
    <div className="detail-skeleton" aria-label="Carregando detalhes" aria-busy="true">
      <div className="nft-skeleton detail-skeleton-image" />
      <div className="detail-skeleton-lines">
        <div className="nft-skeleton" />
        <div className="nft-skeleton" />
        <div className="nft-skeleton" />
      </div>
    </div>
  );
}
