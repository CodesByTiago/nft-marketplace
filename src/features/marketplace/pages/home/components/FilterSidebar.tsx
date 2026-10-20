import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";

export type FilterOption = {
  label: string;
  count: number;
};

type FilterSidebarProps = {
  categories: FilterOption[];
  networks: FilterOption[];
  category: string;
  network: string;
  minPrice: number;
  maxPrice: number;
  onCategory: (value: string) => void;
  onNetwork: (value: string) => void;
  onApplyPrice: (min: number, max: number) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  onClose: () => void;
};

const MAX_PRICE = 20;

const rangeInput =
  "pointer-events-none absolute inset-0 h-[15px] w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[15px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[url('/images/slider-knob.svg')] [&::-moz-range-thumb]:bg-[length:15px_15px] [&::-moz-range-thumb]:bg-center [&::-moz-range-thumb]:bg-no-repeat [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-[5.5px] [&::-webkit-slider-thumb]:size-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[url('/images/slider-knob.svg')] [&::-webkit-slider-thumb]:bg-[length:15px_15px] [&::-webkit-slider-thumb]:bg-center [&::-webkit-slider-thumb]:bg-no-repeat";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FilterList({
  title,
  values,
  selected,
  onToggle,
}: {
  title: string;
  values: FilterOption[];
  selected: string;
  onToggle: (value: string) => void;
}) {
  const selectedValues = new Set(selected ? selected.split(",") : []);

  return (
    <section className="min-w-0">
      <h2 className="text-[18px] leading-4 font-bold text-foreground">{title}</h2>
      <div className="mt-3 grid px-3">
        {values.map(({ label, count }) => (
          <button
            className="flex min-h-10 w-full items-center justify-between text-left text-[15px] leading-10 text-muted-foreground hover:text-primary-light disabled:opacity-40 disabled:hover:text-muted-foreground aria-pressed:text-primary-light"
            key={label}
            type="button"
            aria-pressed={selectedValues.has(label)}
            disabled={count === 0 && !selectedValues.has(label)}
            onClick={() => onToggle(label)}
          >
            <span>{label}</span>
            <strong className="font-bold">({count})</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

export function FilterSidebar({
  categories,
  networks,
  category,
  network,
  minPrice,
  maxPrice,
  onCategory,
  onNetwork,
  onApplyPrice,
  hasActiveFilters,
  onClear,
  onClose,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  useEffect(() => setPriceRange({ min: minPrice, max: maxPrice }), [minPrice, maxPrice]);

  const start = (priceRange.min / MAX_PRICE) * 100;
  const end = (priceRange.max / MAX_PRICE) * 100;

  function toggleValue(value: string, current: string) {
    const values = current ? current.split(",") : [];
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    return next.join(",");
  }

  return (
    <aside
      className="flex min-w-0 flex-col gap-6 max-[640px]:hidden max-[640px]:[.filters-open_&]:fixed max-[640px]:[.filters-open_&]:inset-y-0 max-[640px]:[.filters-open_&]:right-0 max-[640px]:[.filters-open_&]:z-80 max-[640px]:[.filters-open_&]:block max-[640px]:[.filters-open_&]:w-[min(340px,88vw)] max-[640px]:[.filters-open_&]:overflow-y-auto max-[640px]:[.filters-open_&]:bg-surface max-[640px]:[.filters-open_&]:p-6"
      aria-label="Filtros do catálogo"
    >
      <div className="mb-5 hidden items-center justify-between max-[640px]:flex">
        <h2 className="text-[18px]">Filtros</h2>
        <Button variant="ghost" size="icon-sm" aria-label="Fechar filtros" onClick={onClose}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-col gap-10 bg-surface p-5">
        {hasActiveFilters && (
          <Button
            className="h-9 self-start rounded-[6px] border-primary bg-transparent px-3 py-2 text-base leading-normal font-bold text-primary hover:bg-primary hover:text-background"
            type="button"
            variant="outline"
            onClick={onClear}
          >
            Limpar filtros
          </Button>
        )}
        <FilterList
          title="Coleções"
          values={categories}
          selected={category}
          onToggle={(value) => onCategory(toggleValue(value, category))}
        />

        <section className="flex min-w-0 flex-col gap-3">
          <h2 className="text-[18px] leading-4 font-bold text-foreground">Faixa de preço</h2>
          <div className="relative mx-3 h-[15px]">
            <div
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
              style={{
                background: `linear-gradient(to right, var(--border-kurio) ${start}%, var(--primary-kurio) ${start}%, var(--primary-kurio) ${end}%, var(--border-kurio) ${end}%)`,
              }}
            />
            <input
              className={rangeInput}
              aria-label="Preço mínimo em ETH"
              type="range"
              min="0"
              max={Math.max(0, priceRange.max - 0.01)}
              step="0.01"
              value={priceRange.min}
              onChange={(event) => setPriceRange((current) => ({ ...current, min: Number(event.target.value) }))}
            />
            <input
              className={rangeInput}
              aria-label="Preço máximo em ETH"
              type="range"
              min={Math.min(MAX_PRICE, priceRange.min + 0.01)}
              max={MAX_PRICE}
              step="0.01"
              value={priceRange.max}
              onChange={(event) => setPriceRange((current) => ({ ...current, max: Number(event.target.value) }))}
            />
          </div>
          <p className="text-[15px] leading-5 text-foreground">
            Preço: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)} ETH
          </p>
          <Button
            className="h-9 self-start rounded-[6px] px-3 py-2 text-base leading-[inherit] font-bold hover:bg-primary-light"
            type="button"
            onClick={() => onApplyPrice(priceRange.min, priceRange.max)}
          >
            Aplicar
          </Button>
        </section>

        <FilterList
          title="Rede"
          values={networks}
          selected={network}
          onToggle={(value) => onNetwork(toggleValue(value, network))}
        />
      </div>

      <article className="relative flex h-[470px] flex-col items-center gap-4 overflow-hidden bg-linear-to-b/srgb from-[rgba(210,138,76,.1)] to-[rgba(210,138,76,.03)] pt-6 pb-1 max-[640px]:hidden">
        <h2 className="self-stretch px-5 text-center text-2xl leading-8 font-bold text-primary-light">
          NFT EM DESTAQUE
        </h2>
        <p className="text-center text-[22px] leading-4 font-bold text-foreground">OFERTA LIMITADA</p>
        <img
          className="h-[368px] w-full shrink-0 rounded-[22px] object-cover"
          src="/images/nft-nomad.webp"
          alt="Sage Nomad, macaco usando chapéu e moletom roxo"
          loading="lazy"
        />
      </article>
    </aside>
  );
}
