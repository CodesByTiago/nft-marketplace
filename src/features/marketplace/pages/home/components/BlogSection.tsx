import { Link } from "@tanstack/react-router";
import { articles } from "@/features/marketplace/content/articles";

export function BlogSection() {
  return (
    <section className="blog-section page-width" id="diario">
      <header>
        <h2>Diário da Cunhagem</h2>
        <p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      </header>
      <div className="blog-grid">
        {articles.map((article) => (
          <article className="blog-card" key={article.slug}>
            <img src={article.image} alt="" loading="lazy" />
            <div className="blog-copy">
              <span>
                {article.date} | Leitura de {article.readTime}
              </span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <Link
                className="blog-read-more"
                to="/diario/$slug"
                params={{ slug: article.slug }}
                aria-label={`Ler mais: ${article.title}`}
              >
                Ler mais <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
