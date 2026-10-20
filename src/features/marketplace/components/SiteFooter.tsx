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

const columnTitleClass = "text-[18px] leading-4 font-bold text-foreground max-[640px]:text-[12px]";

export function SiteFooter() {
  return (
    <footer className="site-footer page-width mt-24 grid max-[640px]:mt-14">
      <section
        className="grid h-[250px] min-h-[250px] grid-cols-[repeat(3,minmax(0,1fr))_357px] items-stretch bg-surface p-8 max-[900px]:h-auto max-[900px]:grid-cols-2 max-[900px]:gap-6 max-[640px]:grid-cols-[1fr] max-[640px]:gap-[22px] max-[640px]:p-6"
        aria-label="Benefícios Kurio"
      >
        {benefits.map(({ initial, title, description }) => (
          <article
            className="flex flex-col items-start justify-center border-r border-primary px-4 max-[900px]:min-h-[186px] max-[900px]:nth-3:border-r-0 max-[640px]:border-r-0 max-[640px]:border-b max-[640px]:px-0 max-[640px]:pb-5"
            key={title}
          >
            <span
              className="mb-3 grid size-[74px] shrink-0 place-items-center rounded-full bg-primary text-[24px] font-bold text-background max-[640px]:mb-2 max-[640px]:size-14 max-[640px]:text-[20px]"
              aria-hidden="true"
            >
              {initial}
            </span>
            <h2 className="text-[17px] leading-4 font-bold text-foreground max-[640px]:text-[14px]">{title}</h2>
            <p className="mt-3 max-w-[204px] text-[14px] leading-[22px] text-muted-foreground max-[640px]:text-[11px] max-[640px]:leading-[18px]">
              {description}
            </p>
          </article>
        ))}
        <form
          className="flex flex-col gap-4 px-4 pt-2 max-[900px]:col-span-full max-[640px]:gap-3 max-[640px]:p-0"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2 className="text-[18px] leading-4 font-bold text-foreground max-[640px]:text-[14px]">
            Antecipe-se ao próximo lançamento
          </h2>
          <div className="flex h-10 w-full overflow-hidden rounded-[6px] bg-[#38220f] shadow-[0_0_10px_rgba(10,6,4,0.45)]">
            <Input
              className="h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-[14px] text-foreground placeholder:text-[#b39463] md:text-[14px] max-[640px]:text-[12px]"
              type="email"
              placeholder="digite seu e-mail..."
              aria-label="Seu e-mail"
            />
            <Button
              className="h-10 w-[85px] rounded-none border-0 bg-primary text-[18px] font-bold text-background hover:bg-primary max-[640px]:text-[14px]"
              type="submit"
            >
              Enviar
            </Button>
          </div>
          <p className="text-[13px] leading-[22px] text-muted-foreground max-[640px]:text-[11px] max-[640px]:leading-[18px]">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </form>
      </section>

      <section
        className="grid min-h-[88px] grid-cols-[repeat(3,minmax(0,1fr))_228px] items-center gap-8 bg-[#38220f] px-8 py-4 text-[14px] leading-[22px] text-foreground max-[900px]:grid-cols-2 max-[640px]:min-h-0 max-[640px]:grid-cols-[1fr_1fr] max-[640px]:gap-3 max-[640px]:px-6 max-[640px]:py-5 max-[640px]:text-[11px]"
        aria-label="Contato Kurio"
      >
        <a className="font-bold tracking-[1.4px]" href="#inicio">
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

      <section
        className="grid h-[236px] min-h-[236px] grid-cols-[repeat(3,minmax(0,1fr))_228px] gap-8 bg-surface p-8 max-[900px]:h-auto max-[900px]:min-h-0 max-[900px]:grid-cols-2 max-[640px]:gap-x-3 max-[640px]:gap-y-5 max-[640px]:p-6"
        aria-label="Links do site"
      >
        {footerLinks.map(({ title, links }) => (
          <div className="flex min-w-0 flex-col items-start max-[640px]:gap-0.5" key={title}>
            <h2 className={`mb-2 ${columnTitleClass}`}>{title}</h2>
            {links.map((label) => (
              <a
                className="text-[14px] leading-[30px] text-foreground max-[640px]:text-[10px] max-[640px]:leading-6"
                href={title === "Coleções" ? "#catalogo" : "#inicio"}
                key={label}
              >
                {label}
              </a>
            ))}
          </div>
        ))}
        <div className="flex min-w-0 flex-col items-start gap-8 max-[640px]:gap-5">
          <div>
            <h2 className={`mb-1 ${columnTitleClass}`}>Redes sociais</h2>
            <div className="mt-5 flex gap-2.5 max-[640px]:mt-2.5 max-[640px]:flex-wrap max-[640px]:gap-2">
              {socialIcons.map((icon, index) => (
                <a className="block" href="#inicio" aria-label={`Rede social ${index + 1}`} key={icon}>
                  <img src={`/images/${icon}`} alt="" width="32" height="32" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3">
            <h2 className={`mb-1 ${columnTitleClass}`}>Carteiras compatíveis</h2>
            <p className="rounded-[6px] border border-[#55321f] bg-[#38220f] px-2 py-1.5 text-[9px] font-bold whitespace-nowrap text-primary-light max-[640px]:text-[7px] max-[640px]:whitespace-normal">
              METAMASK&nbsp; • &nbsp;WALLETCONNECT&nbsp; • &nbsp;COINBASE
            </p>
          </div>
        </div>
      </section>

      <p className="text-center text-[14px] leading-[30px] text-foreground max-[640px]:text-[9px] max-[640px]:leading-6">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  );
}
