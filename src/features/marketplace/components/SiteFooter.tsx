import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const benefits = [
  {
    initial: "W",
    title: "Segurança da carteira",
    description: "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    initial: "C",
    title: "Criadores em destaque",
    description: "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    initial: "D",
    title: "Alertas de lançamentos",
    description: "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

const footerLinks = [
  {
    title: "Meu perfil",
    links: ["Meu perfil", "Minha coleção", "Atividade", "Estúdio do criador", "Lista de interesse"],
  },
  {
    title: "Central de ajuda",
    links: ["Central de ajuda", "Como comprar NFTs", "Carteira e segurança", "Política do mercado", "Denunciar item"],
  },
  {
    title: "Coleções",
    links: ["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"],
  },
];

const socialIcons = ["social-1.svg", "social-2.svg", "social-3.svg", "social-4.svg", "social-5.svg"];

export function SiteFooter() {
  return (
    <footer className="site-footer page-width">
      <section className="footer-highlights" aria-label="Benefícios Kurio">
        {benefits.map(({ initial, title, description }) => (
          <article className="footer-benefit" key={title}>
            <span className="footer-medallion" aria-hidden="true">
              {initial}
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
        <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
          <h2>Antecipe-se ao próximo lançamento</h2>
          <div className="newsletter-control">
            <Input type="email" placeholder="digite seu e-mail..." aria-label="Seu e-mail" />
            <Button type="submit">Enviar</Button>
          </div>
          <p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
        </form>
      </section>

      <section className="footer-brand-band" aria-label="Contato Kurio">
        <a className="footer-wordmark" href="#inicio">
          KURIO
        </a>
        <p>
          Feito para colecionadores,
          <br />
          criadores e cultura
        </p>
        <a href="mailto:contato@email.com">contato@email.com</a>
        <a href="tel:+551140028922">+55 11 4002 8922</a>
      </section>

      <section className="footer-directory" aria-label="Links do site">
        {footerLinks.map(({ title, links }) => (
          <div className="footer-link-group" key={title}>
            <h2>{title}</h2>
            {links.map((label) => (
              <a href={title === "Coleções" ? "#catalogo" : "#inicio"} key={label}>
                {label}
              </a>
            ))}
          </div>
        ))}
        <div className="footer-social-wallets">
          <div>
            <h2>Redes sociais</h2>
            <div className="footer-social-icons">
              {socialIcons.map((icon, index) => (
                <a href="#inicio" aria-label={`Rede social ${index + 1}`} key={icon}>
                  <img src={`/images/${icon}`} alt="" width="32" height="32" />
                </a>
              ))}
            </div>
          </div>
          <div className="compatible-wallets">
            <h2>Carteiras compatíveis</h2>
            <p>METAMASK&nbsp; • &nbsp;WALLETCONNECT&nbsp; • &nbsp;COINBASE</p>
          </div>
        </div>
      </section>

      <p className="footer-copyright">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  );
}
