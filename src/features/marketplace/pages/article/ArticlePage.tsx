import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/ui/button";
import { MobileTabBar } from "@/features/marketplace/components/MobileTabBar";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { articles, findArticle } from "@/features/marketplace/content/articles";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";

const TAG =
  "inline-block w-fit rounded-full border border-primary px-2.5 py-1 text-[11px] font-bold tracking-[.08em] text-primary-light uppercase";
const FOOTER_BUTTON = "h-11 px-[22px] text-[14px] font-bold";
const BODY_TEXT = "text-[16px] leading-[1.7] text-[#e6d5c0] max-[767px]:text-[15px]";

export default function ArticlePage() {
  const { slug } = useParams({ from: "/diario/$slug" });
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { cart } = useCartPanel();
  const article = findArticle(slug);
  const others = articles.filter((item) => item.slug !== slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = article ? `${article.title} | Diário da Cunhagem` : "Artigo não encontrado | Kurio";
    return () => {
      document.title = "Kurio";
    };
  }, [article]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground max-[640px]:[&_.site-footer]:hidden!">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="diario"
        hideSearch
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />

      <main className="page-width pt-6 pb-20 max-[767px]:pt-2 max-[767px]:pb-12">
        <nav className="detail-breadcrumb" aria-label="Você está em">
          <Link to="/" hash="inicio">
            Início
          </Link>
          {" / "}
          <Link to="/" hash="diario">
            Diário da Cunhagem
          </Link>
          {article && ` / ${article.title}`}
        </nav>

        {!article ? (
          <div className="catalog-message">
            <h1>Artigo não encontrado</h1>
            <p>O texto que você procura não existe ou foi movido.</p>
            <Button variant="outline" asChild>
              <Link to="/" hash="diario">
                Ver todos os artigos
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-12 max-[1023px]:grid-cols-[minmax(0,1fr)] max-[1023px]:gap-10">
            <article className="article min-w-0">
              <header className="grid gap-3.5">
                <span className={TAG}>{article.category}</span>
                <h1 className="text-[38px] leading-[1.2] font-bold max-[767px]:text-[26px]">{article.title}</h1>
                <p className="flex flex-wrap gap-2 text-[13px] text-muted-foreground">
                  <span>{article.date}</span>
                  <span aria-hidden="true">•</span>
                  <span>Leitura de {article.readTime}</span>
                  <span aria-hidden="true">•</span>
                  <span>Por {article.author}</span>
                </p>
              </header>
              <img
                className="mt-7 block h-[380px] w-full rounded-2xl bg-surface object-cover object-[center_25%] max-[767px]:mt-5 max-[767px]:h-[220px]"
                src={article.image}
                alt=""
                width="1254"
                height="1254"
              />
              <p className="mt-8 border-l-[3px] border-primary pl-[18px] text-[19px] leading-[1.7] text-primary-light max-[767px]:text-[16px]">
                {article.intro}
              </p>
              {article.sections.map((section) => (
                <section className="mt-9" key={section.heading}>
                  <h2 className="mb-3.5 text-[24px] leading-[1.3] font-bold text-foreground max-[767px]:text-[20px]">
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p className={cn(BODY_TEXT, "mb-4 leading-[1.85]")} key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                  {section.list && (
                    <ul className={cn(BODY_TEXT, "mb-2 grid list-[square] gap-2.5 pl-[22px]")}>
                      {section.list.map((item) => (
                        <li className="marker:text-primary" key={item}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              <blockquote className="mt-11 rounded-2xl bg-surface px-8 py-7 text-[21px] leading-normal font-bold text-primary-light before:block before:h-7 before:text-[56px] before:leading-none before:text-primary before:content-['“'] max-[767px]:p-5 max-[767px]:text-[17px]">
                {article.quote}
              </blockquote>
              <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t-[.3px] border-primary pt-6 max-[767px]:[&>*]:w-full">
                <Button variant="outline" className={FOOTER_BUTTON} asChild>
                  <Link to="/" hash="diario">
                    ← Voltar ao Diário
                  </Link>
                </Button>
                <Button
                  asChild
                  className={cn(FOOTER_BUTTON, "border-0 bg-primary text-background! hover:bg-primary-light")}
                >
                  <Link to="/" hash="catalogo">
                    Explorar o mercado
                  </Link>
                </Button>
              </footer>
            </article>

            <aside
              className="sticky top-24 grid gap-4 rounded-2xl bg-surface p-6 max-[1023px]:static"
              aria-labelledby="article-aside-title"
            >
              <h2
                id="article-aside-title"
                className="border-b-[.3px] border-primary pb-2.5 text-[17px] font-bold text-primary-light"
              >
                Outros artigos
              </h2>
              <ul className="grid gap-[18px]">
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link
                      className="group grid grid-cols-[84px_minmax(0,1fr)] items-center gap-3.5"
                      to="/diario/$slug"
                      params={{ slug: item.slug }}
                    >
                      <img className="size-[84px] rounded-xl object-cover" src={item.image} alt="" loading="lazy" />
                      <span className="grid min-w-0 gap-1.5">
                        <span className={cn(TAG, "px-2 py-0.5 text-[9px]")}>{item.category}</span>
                        <strong className="text-[14px] leading-[1.4] group-hover:text-primary-light">
                          {item.title}
                        </strong>
                        <small className="text-[11px] text-muted-foreground">
                          {item.date} • {item.readTime}
                        </small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />
      <MobileTabBar cartCount={cart.length} />
    </div>
  );
}
