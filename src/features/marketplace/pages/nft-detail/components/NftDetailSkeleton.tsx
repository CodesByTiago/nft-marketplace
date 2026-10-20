export function NftDetailSkeleton() {
  return (
    <div className="flex gap-8 max-[900px]:flex-col" aria-label="Carregando detalhes" aria-busy="true">
      <div className="nft-skeleton detail-skeleton-image h-[448px] w-[573px] flex-none basis-[573px]" />
      <div className="grid flex-1 content-start gap-4">
        <div className="nft-skeleton min-h-12!" />
        <div className="nft-skeleton min-h-12!" />
        <div className="nft-skeleton min-h-12!" />
      </div>
    </div>
  );
}
