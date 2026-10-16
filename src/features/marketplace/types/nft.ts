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
};

export type CartEntry = {
  nft: Nft;
  quantity: number;
};

export type NftResults = {
  items: Nft[];
  total: number;
  facets: {
    categories: Record<string, number>;
    networks: Record<string, number>;
  };
};
