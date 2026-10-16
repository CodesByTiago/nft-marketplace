export const homeTabs = ["all", "new", "trending"] as const;
export type HomeTab = (typeof homeTabs)[number];

export const sortOptions = ["recent", "price-asc", "price-desc"] as const;
export type SortOption = (typeof sortOptions)[number];

export type HomeFilters = {
  tab: HomeTab;
  category: string;
  collection: string;
  network: string;
  minPrice: number;
  maxPrice: number;
  sort: SortOption;
  page: number;
};

export type HomeSearch = Partial<HomeFilters>;

export const defaultFilters: HomeFilters = {
  tab: "all",
  category: "",
  collection: "",
  network: "",
  minPrice: 0.02,
  maxPrice: 12.3,
  sort: "recent",
  page: 1,
};
