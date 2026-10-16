import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { HomeTab, SortOption } from "@/features/marketplace/types/search";

const tabs: { value: HomeTab; label: string }[] = [
  { value: "all", label: "Todos os NFTs" },
  { value: "new", label: "Novos lançamentos" },
  { value: "trending", label: "Em alta" },
];

type CatalogToolbarProps = {
  tab: HomeTab;
  sort: SortOption;
  onTab: (tab: HomeTab) => void;
  onSort: (sort: SortOption) => void;
};

export function CatalogToolbar({ tab, sort, onTab, onSort }: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar">
      <nav className="catalog-tabs" aria-label="Tipo de coleção">
        {tabs.map((item) => (
          <Button
            key={item.value}
            variant={tab === item.value ? "default" : "ghost"}
            aria-pressed={tab === item.value}
            onClick={() => onTab(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="sort-control">
        <span>Ordenar por:</span>
        <Select value={sort} onValueChange={(value) => onSort(value as SortOption)}>
          <SelectTrigger aria-label="Ordenar NFTs" className="sort-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Listados recentemente</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
