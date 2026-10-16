export type Nft = {
  id: string;
  name: string;
  collection: string;
  artist: string;
  price: string;
  previousPrice?: string;
  image: string;
  category: string;
  network: string;
  edition: number;
  totalEditions: number;
  isNew?: boolean;
  trending?: boolean;
  /** Ausente significa disponível; `false` marca a edição como esgotada. */
  available?: boolean;
  /** Versão do último `nft.updated` aplicado; usada para descartar eventos antigos. */
  version?: number;
};

export type CartEntry = {
  nft: Nft;
  quantity: number;
};

export type NftReview = {
  author: string;
  rating: number;
  comment: string;
};

export type NftEdition = {
  label: string;
  available: boolean;
};

export type NftDetail = Nft & {
  tokenId: string;
  rating: number;
  reviewCount: number;
  summary: string;
  about: string;
  description: string[];
  attributes: string[];
  editions: NftEdition[];
  networkNote: string;
  contract: string;
  royalties: string;
  reviews: NftReview[];
};

export type CouponStatus = "applied" | "invalid" | "expired";

export type CartQuote = {
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  coupon?: { code: string; status: CouponStatus; percent: number };
  /** Itens do carrinho que deixaram de estar disponíveis; ficam fora dos totais. */
  unavailable?: string[];
};

export type NftResults = {
  items: Nft[];
  total: number;
  facets: {
    categories: Record<string, number>;
    networks: Record<string, number>;
  };
};
