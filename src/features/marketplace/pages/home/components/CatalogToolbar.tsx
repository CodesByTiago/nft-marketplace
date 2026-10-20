import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";
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
    <div className="flex min-h-[18px] items-start justify-between gap-3 max-[640px]:min-h-5 max-[640px]:gap-1 max-[640px]:overflow-visible">
      <nav
        className="flex items-start gap-5 max-[640px]:w-full max-[640px]:justify-between max-[640px]:gap-1"
        aria-label="Tipo de coleção"
      >
        {tabs.map((item) => (
          <Button
            key={item.value}
            className={cn(
              "relative h-auto rounded-none border-0 bg-transparent p-0 text-[15px] leading-4 font-medium hover:bg-transparent max-[640px]:flex-initial max-[640px]:pb-1.5 max-[640px]:text-[10px] max-[640px]:tracking-[0]",
              tab === item.value
                ? "text-primary-light hover:text-primary-light"
                : "text-foreground hover:text-foreground",
            )}
            variant={tab === item.value ? "default" : "ghost"}
            aria-pressed={tab === item.value}
            onClick={() => onTab(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="flex w-[330px] flex-none items-center justify-between gap-2 text-[15px] text-muted-foreground max-[640px]:hidden">
        <span>Ordenar por:</span>
        <Select value={sort} onValueChange={(value) => onSort(value as SortOption)}>
          <SelectTrigger
            aria-label="Ordenar NFTs"
            className="w-[220px] border-0 bg-transparent text-[15px] text-foreground hover:bg-transparent data-[size=default]:h-[26px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-border bg-surface text-foreground">
            <SelectItem value="recent">Listados recentemente</SelectItem>
            <SelectItem value="price-asc">Menor preço</SelectItem>
            <SelectItem value="price-desc">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
