const promotions = [
  {
    id: "genesis",
    image: "/images/nft-hero.webp",
    imageClass: "rounded-[18px]",
    title: "Lançamentos gênesis\nde edição limitada",
    description: "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
  },
  {
    id: "curated",
    image: "/images/nft-noir.webp",
    imageClass: "rounded-[17px]",
    title: "Arte digital selecionada\ne muito mais",
    description: "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
  },
];

export function PromoSection() {
  return (
    <section
      className="page-width mt-24 grid grid-cols-2 gap-7 max-[640px]:mt-14 max-[640px]:grid-cols-1 max-[640px]:gap-4"
      id="promocoes"
      aria-label="Destaques Kurio"
    >
      {promotions.map(({ id, image, imageClass, title, description }) => (
        <article
          className="relative grid min-h-[250px] grid-cols-2 overflow-hidden rounded-lg bg-surface before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent_36%,var(--surface)_52%)] before:content-[''] max-[900px]:grid-cols-[.8fr_1fr] max-[640px]:min-h-[200px] max-[640px]:grid-cols-2"
          key={id}
        >
          <img className={`h-[250px] w-full object-cover ${imageClass}`} src={image} alt="" loading="lazy" />
          <div className="relative z-2 flex flex-col items-end justify-center py-5 pr-[30px] pl-2 text-right max-[640px]:p-3">
            <h2 className="mb-3.5 text-[18px] leading-6 whitespace-pre-line max-[640px]:text-[14px]">{title}</h2>
            <p className="max-w-[263px] text-[14px] leading-6 text-muted-foreground max-[640px]:text-[9px]">
              {description}
            </p>
            <a
              className="mt-5 inline-flex h-10 w-[140px] items-center justify-between rounded-[6px] bg-primary pr-3 pl-[26px] text-left text-[14px] font-medium text-background max-[640px]:mt-3"
              href="#catalogo"
            >
              Explorar <img src="/images/promo-arrow.svg" alt="" width="11" height="13" />
            </a>
          </div>
          <img
            className="pointer-events-none absolute top-0 left-0 z-1 max-[640px]:hidden"
            src="/images/promo-mask.svg"
            alt=""
          />
        </article>
      ))}
    </section>
  );
}
