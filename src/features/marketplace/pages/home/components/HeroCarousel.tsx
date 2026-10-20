import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";

type HeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  secondaryImage: string;
  cta: { label: string; href: string };
};

const slides: HeroSlide[] = [
  {
    eyebrow: "Bem-vindo à Kurio",
    title: "SEJA DONO DO FUTURO DA ARTE DIGITAL",
    description:
      "Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.",
    image: "/images/nft-hero.webp",
    imageAlt: "Emerald Ape #042, obra de arte digital da Kurio",
    secondaryImage: "/images/nft-nomad.webp",
    cta: { label: "EXPLORAR", href: "#catalogo" },
  },
  {
    eyebrow: "Aprenda na Kurio",
    title: "COMECE SUA JORNADA NO UNIVERSO DOS NFTS",
    description:
      "Guias, histórias e dicas para entender raridade, propriedade e segurança. Aprenda a colecionar arte digital com confiança.",
    image: "/images/nft-noir.webp",
    imageAlt: "Obra de arte digital em tons escuros da coleção Noir",
    secondaryImage: "/images/nft-gold.webp",
    cta: { label: "APRENDA", href: "#diario" },
  },
];

const dotClass =
  "hero-dot size-2 flex-none cursor-pointer rounded-full border-0 bg-primary p-0 focus-visible:outline-foreground!";

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const paused = isHovered || hasFocus;

  useEffect(() => {
    if (slides.length < 2 || paused) return;

    // Com movimento reduzido a troca continua, mas sem animação de transição (regra global em responsive.css).
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <section
      className="page-width relative mt-8 min-h-[450px] overflow-hidden max-[900px]:px-6 max-[640px]:mt-4 max-[640px]:h-[190px] max-[640px]:min-h-[190px] max-[640px]:rounded-[28px] max-[640px]:px-0 max-[640px]:bg-[radial-gradient(circle_at_7%_30%,#75462a_0,#3d281c_45%,#231610_100%)] max-[380px]:h-[240px] max-[380px]:min-h-[240px]"
      id="inicio"
      role="region"
      aria-label="Destaques"
      aria-roledescription="carrossel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) setHasFocus(false);
      }}
    >
      {slides.map((slide, index) => (
        <div
          className="hero-slide grid min-h-[450px] grid-cols-[600px_450px] items-center justify-between pl-10 [&:not([hidden])]:animate-[hero-slide-in_.7s_ease_both] max-[640px]:block max-[640px]:h-[190px] max-[640px]:min-h-[190px] max-[640px]:px-4 max-[640px]:py-1.5 max-[380px]:h-[240px] max-[380px]:min-h-[240px]"
          key={slide.image}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} de ${slides.length}`}
          hidden={index !== activeSlide}
        >
          <div className="relative z-2 flex max-w-[600px] flex-col items-start max-[640px]:w-[60%] max-[640px]:max-w-[195px] max-[380px]:w-[54%]">
            <span className="block text-[14px] font-medium tracking-[1.4px] text-foreground max-[640px]:text-[11px]">
              {slide.eyebrow}
            </span>
            <h1 className="mt-2 mb-1 max-w-[600px] text-[43px] leading-[70px] font-bold tracking-[0] max-[640px]:mt-[7px] max-[640px]:mb-2 max-[640px]:text-[15px] max-[640px]:leading-[1.45] max-[640px]:tracking-[-.04em] max-[380px]:text-[12px] max-[380px]:leading-[1.35]">
              {slide.title}
            </h1>
            <p className="max-w-[557px] text-[14px] leading-[24px] text-muted-foreground max-[640px]:max-w-[190px] max-[640px]:text-[10px] max-[640px]:leading-[1.4] max-[380px]:text-[8.5px]">
              {slide.description}
            </p>
            <Button
              asChild
              className="mt-8 min-h-10 w-[140px] rounded-[6px] border-0 bg-primary px-7 py-2.5 text-[16px] leading-[1.4286] font-bold tracking-[0] text-background hover:bg-primary-light max-[640px]:mt-0 max-[640px]:h-[18px] max-[640px]:min-h-[18px] max-[640px]:bg-transparent max-[640px]:p-0 max-[640px]:text-[10px] max-[640px]:text-primary-light max-[640px]:hover:bg-transparent max-[640px]:hover:text-[#f0b77f] max-[640px]:[&_svg]:w-3.5"
            >
              <a href={slide.cta.href}>{slide.cta.label}</a>
            </Button>
            <div
              className="mt-[44px] flex h-2 w-10 -translate-x-5 items-center justify-center gap-2 self-end max-[640px]:absolute max-[640px]:right-0 max-[640px]:bottom-[-42px] max-[640px]:left-0 max-[640px]:w-auto max-[640px]:translate-x-0 max-[380px]:bottom-[-112px]"
              role="group"
              aria-label="Selecionar destaque"
            >
              {slides.length > 1 ? (
                slides.map((item, dotIndex) => (
                  <button
                    className={dotClass}
                    key={item.image}
                    type="button"
                    aria-label={`Ir para o destaque ${dotIndex + 1}`}
                    aria-pressed={dotIndex === activeSlide}
                    onClick={() => setActiveSlide(dotIndex)}
                  />
                ))
              ) : (
                <span className={dotClass} aria-current="true" />
              )}
            </div>
          </div>
          <div className="relative size-[450px] max-[640px]:absolute max-[640px]:top-[10px] max-[640px]:right-4 max-[640px]:size-[138px] max-[380px]:top-3 max-[380px]:right-3 max-[380px]:size-[100px]">
            <img
              src={slide.image}
              alt={slide.imageAlt}
              width="1254"
              height="1254"
              className="size-full rounded-[24px] object-cover max-[640px]:rounded-[16px]"
              {...(index === 0 ? { fetchpriority: "high" } : {})}
            />
            <img
              className="hidden rounded-[14px] border-4 border-[#f3e7d5] object-cover max-[640px]:absolute max-[640px]:right-[66px] max-[640px]:bottom-[-9px] max-[640px]:block max-[640px]:size-[58px] max-[380px]:right-[50px] max-[380px]:bottom-[-7px] max-[380px]:size-11 max-[380px]:border-[3px]"
              src={slide.secondaryImage}
              alt=""
            />
          </div>
        </div>
      ))}
    </section>
  );
}
