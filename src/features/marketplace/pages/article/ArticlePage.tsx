import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { BookOpen, Home, ScanLine, ShoppingBag, UserRound } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/button";
import { SiteFooter } from "@/features/marketplace/components/SiteFooter";
import { SiteHeader } from "@/features/marketplace/components/SiteHeader";
import { articles, findArticle } from "@/features/marketplace/content/articles";
import { useCartPanel } from "@/features/marketplace/hooks/useCartPanel";

export default function ArticlePage() {
  const { slug } = useParams({ from: "/diario/$slug" });
  const navigate = useNavigate();
  const { user, openAuth } = useAuth();
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
    <div className="min-h-screen overflow-x-clip bg-background text-foreground article-page">
      <SiteHeader
        cart={cart}
        search={search}
        onSearch={setSearch}
        activeId="diario"
        hideSearch
        onSearchSubmit={() => void navigate({ to: "/", state: { q: search } as never })}
      />

      <main className="article-main page-width">
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
          <div className="article-layout">
            <article className="article">
              <header className="article-header">
                <span className="article-tag">{article.category}</span>
                <h1>{article.title}</h1>
                <p className="article-meta">
                  <span>{article.date}</span>
                  <span aria-hidden="true">•</span>
                  <span>Leitura de {article.readTime}</span>
                  <span aria-hidden="true">•</span>
                  <span>Por {article.author}</span>
                </p>
              </header>
              <img className="article-cover" src={article.image} alt="" width="1254" height="1254" />
              <p className="article-lead">{article.intro}</p>
              {article.sections.map((section) => (
                <section key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.list && (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
              <blockquote>{article.quote}</blockquote>
              <footer className="article-footer">
                <Button variant="outline" asChild>
                  <Link to="/" hash="diario">
                    ← Voltar ao Diário
                  </Link>
                </Button>
                <Button asChild className="article-cta">
                  <Link to="/" hash="catalogo">
                    Explorar o mercado
                  </Link>
                </Button>
              </footer>
            </article>

            <aside className="article-aside" aria-labelledby="article-aside-title">
              <h2 id="article-aside-title">Outros artigos</h2>
              <ul>
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link to="/diario/$slug" params={{ slug: item.slug }}>
                      <img src={item.image} alt="" loading="lazy" />
                      <span className="article-aside-copy">
                        <span className="article-tag">{item.category}</span>
                        <strong>{item.title}</strong>
                        <small>
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
      <nav className="mobile-tab-bar" aria-label="Navegação inferior">
        <Link to="/" hash="inicio" aria-label="Início">
          <Home aria-hidden="true" />
        </Link>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Diário da Cunhagem"
          aria-current="page"
          onClick={() => void navigate({ to: "/", hash: "diario" })}
        >
          <BookOpen aria-hidden="true" />
        </Button>
        <Button
          className="mobile-scan"
          size="icon-lg"
          aria-label="Ir para o catálogo"
          onClick={() => void navigate({ to: "/", hash: "catalogo" })}
        >
          <ScanLine aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={`Abrir carrinho, ${cart.length} itens`}
          onClick={() => void navigate({ to: "/carrinho" })}
        >
          <ShoppingBag aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={user ? `Meu perfil (${user.username})` : "Perfil"}
          onClick={() => (user ? void navigate({ to: "/perfil" }) : openAuth("login"))}
        >
          <UserRound aria-hidden="true" />
        </Button>
      </nav>
    </div>
  );
}
