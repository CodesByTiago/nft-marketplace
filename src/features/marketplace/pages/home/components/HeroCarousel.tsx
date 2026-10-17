import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";

type HeroSlide = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  secondaryImage: string;
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
  },
];

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const paused = isHovered || hasFocus;

  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [paused]);

  return (
    <section
      className="hero-section page-width"
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
          className="hero-slide"
          key={slide.image}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} de ${slides.length}`}
          hidden={index !== activeSlide}
        >
          <div className="hero-copy">
            <span className="eyebrow">{slide.eyebrow}</span>
            <h1>{slide.title}</h1>
            <p>{slide.description}</p>
            <Button asChild className="primary-button">
              <a href="#catalogo">EXPLORAR</a>
            </Button>
            <div className="hero-dots" role="group" aria-label="Selecionar destaque">
              {slides.length > 1 ? (
                slides.map((item, dotIndex) => (
                  <button
                    className={`hero-dot ${dotIndex === activeSlide ? "is-active" : ""}`}
                    key={item.image}
                    type="button"
                    aria-label={`Ir para o destaque ${dotIndex + 1}`}
                    aria-pressed={dotIndex === activeSlide}
                    onClick={() => setActiveSlide(dotIndex)}
                  />
                ))
              ) : (
                <span className="hero-dot is-active" aria-current="true" />
              )}
            </div>
          </div>
          <div className="hero-art">
            <img
              src={slide.image}
              alt={slide.imageAlt}
              width="1254"
              height="1254"
              fetchPriority={index === 0 ? "high" : "auto"}
            />
            <img className="hero-art-secondary" src={slide.secondaryImage} alt="" />
          </div>
        </div>
      ))}
    </section>
  );
}
