import { Link } from "@tanstack/react-router";
import { articles } from "@/features/marketplace/content/articles";

export function BlogSection() {
  return (
    <section className="page-width mt-24 max-[640px]:mt-14" id="diario">
      <header className="mb-10 text-center max-[640px]:mb-[22px]">
        <h2 className="text-[28px] font-bold max-[640px]:text-[20px]">Diário da Cunhagem</h2>
        <p className="mt-3 text-[14px] text-muted-foreground max-[640px]:text-[10px] max-[640px]:leading-[1.6]">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </header>
      <div className="grid grid-cols-[repeat(4,minmax(0,268px))] justify-center gap-6 max-[900px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[640px]:gap-3">
        {articles.map((article) => (
          <article className="min-w-0 overflow-hidden rounded-lg bg-surface" key={article.slug}>
            <img
              className="h-[195px] w-full object-cover max-[640px]:h-[120px]"
              src={article.image}
              alt=""
              loading="lazy"
            />
            <div className="px-4 pt-3 pb-4 max-[640px]:min-h-[180px] max-[640px]:p-2.5">
              <span className="text-[12px] whitespace-pre-wrap text-muted-foreground max-[640px]:text-[8px]">
                {article.date} | Leitura de {article.readTime}
              </span>
              <h3 className="my-2 text-[16px] leading-[1.4] max-[640px]:text-[11px]">{article.title}</h3>
              <p className="min-h-8 text-[12px] leading-4 text-muted-foreground max-[640px]:text-[9px]">
                {article.description}
              </p>
              <Link
                className="mt-2 inline-flex gap-1 text-[12px] font-bold text-primary-light"
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
