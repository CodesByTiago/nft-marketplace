const promotions = [
  {
    className: "promo-genesis",
    title: "Lançamentos gênesis\nde edição limitada",
    description: "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
  },
  {
    className: "promo-curated",
    title: "Arte digital selecionada\ne muito mais",
    description: "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
  },
];

export function PromoSection() {
  return (
    <section className="promo-section page-width" id="promocoes" aria-label="Destaques Kurio">
      {promotions.map(({ className, title, description }) => (
        <article className={`promo-card ${className}`} key={className}>
          <img
            src={className === "promo-genesis" ? "/images/nft-hero.png" : "/images/nft-noir.png"}
            alt=""
            loading="lazy"
          />
          <div className="promo-copy">
            <h2>{title}</h2>
            <p>{description}</p>
            <a href="#catalogo">
              Explorar <img src="/images/promo-arrow.svg" alt="" width="11" height="13" />
            </a>
          </div>
          <img className="promo-mask" src="/images/promo-mask.svg" alt="" />
        </article>
      ))}
    </section>
  );
}
