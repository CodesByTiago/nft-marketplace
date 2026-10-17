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
    <section className={`filter-group ${title === "Coleções" ? "filter-collections" : ""}`}>
      <h2>{title}</h2>
      <div className="filter-list">
        {values.map(({ label, count }) => (
          <button
            className="filter-option"
            key={label}
            type="button"
            aria-pressed={selectedValues.has(label)}
            disabled={count === 0 && !selectedValues.has(label)}
            onClick={() => onToggle(label)}
          >
            <span>{label}</span>
            <strong>({count})</strong>
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
    <aside className="filter-sidebar" aria-label="Filtros do catálogo">
      <div className="mobile-filter-head">
        <h2>Filtros</h2>
        <Button variant="ghost" size="icon-sm" aria-label="Fechar filtros" onClick={onClose}>
          <X aria-hidden="true" />
        </Button>
      </div>
      <div className="filter-panel">
        {hasActiveFilters && (
          <Button className="clear-filters" type="button" variant="outline" onClick={onClear}>
            Limpar filtros
          </Button>
        )}
        <FilterList
          title="Coleções"
          values={categories}
          selected={category}
          onToggle={(value) => onCategory(toggleValue(value, category))}
        />

        <section className="filter-group price-filter">
          <h2>Faixa de preço</h2>
          <div className="price-range-control">
            <div
              className="price-track"
              style={{
                background: `linear-gradient(to right, var(--border-kurio) ${start}%, var(--primary-kurio) ${start}%, var(--primary-kurio) ${end}%, var(--border-kurio) ${end}%)`,
              }}
            />
            <input
              aria-label="Preço mínimo em ETH"
              type="range"
              min="0"
              max={Math.max(0, priceRange.max - 0.01)}
              step="0.01"
              value={priceRange.min}
              onChange={(event) => setPriceRange((current) => ({ ...current, min: Number(event.target.value) }))}
            />
            <input
              aria-label="Preço máximo em ETH"
              type="range"
              min={Math.min(MAX_PRICE, priceRange.min + 0.01)}
              max={MAX_PRICE}
              step="0.01"
              value={priceRange.max}
              onChange={(event) => setPriceRange((current) => ({ ...current, max: Number(event.target.value) }))}
            />
          </div>
          <p className="price-summary">
            Preço: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)} ETH
          </p>
          <Button className="price-apply" type="button" onClick={() => onApplyPrice(priceRange.min, priceRange.max)}>
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

      <article className="featured-nft-banner">
        <h2>NFT EM DESTAQUE</h2>
        <p>OFERTA LIMITADA</p>
        <img src="/images/nft-nomad.webp" alt="Sage Nomad, macaco usando chapéu e moletom roxo" loading="lazy" />
      </article>
    </aside>
  );
}
