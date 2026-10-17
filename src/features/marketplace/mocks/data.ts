import type { Nft } from "../types/nft";

const featuredNfts: Nft[] = [
  {
    id: "emerald-ape-042",
    name: "Emerald Ape #042",
    collection: "Kurio Genesis",
    artist: "Kurio Originals",
    price: "1.19",
    image: "/images/nft-hero.webp",
    category: "Arte digital",
    network: "Ethereum",
    edition: 1,
    totalEditions: 12,
  },
  {
    id: "sage-nomad-009",
    name: "Sage Nomad #009",
    collection: "Kurio Genesis",
    artist: "Kurio Originals",
    price: "1.69",
    image: "/images/nft-nomad.webp",
    category: "Colecionáveis",
    network: "Ethereum",
    edition: 2,
    totalEditions: 8,
  },
  {
    id: "neon-vessel-552",
    name: "Neon Vessel #552",
    collection: "Kurio Originals",
    artist: "Kurio Originals",
    price: "1.99",
    previousPrice: "2.29",
    image: "/images/nft-noir.webp",
    category: "Arte 3D",
    network: "Polygon",
    edition: 1,
    totalEditions: 20,
  },
  {
    id: "cosmic-bloom-118",
    name: "Cosmic Bloom #118",
    collection: "Kurio Genesis",
    artist: "Kurio Originals",
    price: "1.29",
    image: "/images/nft-nomad.webp",
    category: "Fotografia",
    network: "Ethereum",
    edition: 3,
    totalEditions: 16,
  },
  {
    id: "violet-nomad-314",
    name: "Violet Nomad #314",
    collection: "Kurio Genesis",
    artist: "Kurio Originals",
    price: "1.39",
    image: "/images/nft-nomad.webp",
    category: "Generativa",
    network: "Solana",
    edition: 2,
    totalEditions: 14,
  },
  {
    id: "ivory-baron-088",
    name: "Ivory Baron #088",
    collection: "Kurio Originals",
    artist: "Kurio Originals",
    price: "1.79",
    image: "/images/nft-noir.webp",
    category: "Jogos",
    network: "Polygon",
    edition: 1,
    totalEditions: 11,
  },
  {
    id: "golden-beat-207",
    name: "Golden Beat #207",
    collection: "Kurio Genesis",
    artist: "Kurio Originals",
    price: "0.99",
    image: "/images/nft-gold.webp",
    category: "Música",
    network: "Ethereum",
    edition: 4,
    totalEditions: 10,
  },
  {
    id: "golden-drift-103",
    name: "Golden Drift #103",
    collection: "Kurio Genesis",
    artist: "Kurio Originals",
    price: "0.89",
    image: "/images/nft-gold.webp",
    category: "Assinaturas",
    network: "Solana",
    edition: 1,
    totalEditions: 9,
  },
  {
    id: "golden-signal-160",
    name: "Golden Signal #160",
    collection: "Kurio Originals",
    artist: "Kurio Originals",
    price: "0.39",
    image: "/images/nft-gold.webp",
    category: "Utilidade",
    network: "Ethereum",
    edition: 1,
    totalEditions: 6,
  },
];

const additionalInventory = [
  { category: "Arte digital", quantity: 13 },
  { category: "Fotografia", quantity: 4 },
  { category: "Música", quantity: 26 },
  { category: "Arte 3D", quantity: 15 },
  { category: "Colecionáveis", quantity: 9 },
  { category: "Generativa", quantity: 6 },
  { category: "Jogos", quantity: 7 },
  { category: "Assinaturas", quantity: 4 },
  { category: "Utilidade", quantity: 6 },
];

const networkCycle = [
  "Ethereum",
  "Ethereum",
  "Ethereum",
  "Ethereum",
  "Polygon",
  "Polygon",
  "Polygon",
  "Solana",
  "Solana",
  "Solana",
];

const additionalNfts = additionalInventory.flatMap(({ category, quantity }) => {
  const template = featuredNfts.find((nft) => nft.category === category);
  if (!template) throw new Error(`Missing NFT template for category "${category}".`);

  return Array.from({ length: quantity }, (_, index) => {
    const inventoryIndex = featuredNfts.length + additionalNftsLength(category) + index;
    const tokenNumber = Number(template.name.match(/#(\d+)$/)?.[1] ?? 0) + (index + 1) * 9;
    const price = Number((Number(template.price) * (1 + (index % 5) * 0.07)).toFixed(2));

    return {
      ...template,
      id: `${template.id}-edition-${index + 2}`,
      name: template.name.replace(/#\d+$/, `#${String(tokenNumber).padStart(3, "0")}`),
      price: price.toFixed(2),
      ...(template.previousPrice ? { previousPrice: (price * 1.15).toFixed(2) } : {}),
      network: networkCycle[inventoryIndex % networkCycle.length],
    };
  });
});

function additionalNftsLength(category: string) {
  return additionalInventory
    .slice(
      0,
      additionalInventory.findIndex((item) => item.category === category),
    )
    .reduce((total, item) => total + item.quantity, 0);
}

// Marcações determinísticas para os recortes "Novos lançamentos" e "Em alta".
export const nfts: Nft[] = [...featuredNfts, ...additionalNfts].map((nft, index) => ({
  ...nft,
  isNew: index % 3 === 0,
  trending: index % 4 === 1,
}));
