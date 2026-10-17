const articles = [
  {
    date: "12 de setembro  |  Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: "/images/nft-noir.webp",
  },
  {
    date: "13 de setembro  |  Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
    image: "/images/nft-hero.webp",
  },
  {
    date: "15 de setembro  |  Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    description: "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: "/images/nft-nomad.webp",
  },
  {
    date: "15 de setembro  |  Leitura de 2 min",
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
    image: "/images/nft-gold.webp",
  },
];

export function BlogSection() {
  return (
    <section className="blog-section page-width" id="diario">
      <header>
        <h2>Diário da Cunhagem</h2>
        <p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </header>
      <div className="blog-grid">
        {articles.map((article) => (
          <article className="blog-card" key={article.title}>
            <img src={article.image} alt="" loading="lazy" />
            <div className="blog-copy">
              <span>{article.date}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <span className="blog-read-more">
                Ler mais <span aria-hidden="true">→</span>
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
