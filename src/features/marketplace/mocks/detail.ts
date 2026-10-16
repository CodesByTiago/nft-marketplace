import type { Nft, NftDetail } from "../types/nft";

const attributesByCategory: Record<string, string[]> = {
  "Arte digital": ["Óculos", "Esmeralda", "Raro"],
  Fotografia: ["Longa exposição", "Noturna", "Edição limitada"],
  Música: ["Faixa inédita", "Stems incluídos", "Raro"],
  "Arte 3D": ["Render 4K", "Animado", "Raro"],
  Colecionáveis: ["Série fundadora", "Metálico", "Raro"],
  Generativa: ["Algoritmo único", "Paleta quente", "Raro"],
  Jogos: ["Item equipável", "Nível 3", "Épico"],
  Assinaturas: ["Acesso anual", "Transferível", "Raro"],
  Utilidade: ["Acesso antecipado", "Voto em comunidade", "Raro"],
};

const reviewers = ["Nova Sato", "Lia Moreau", "Caio Ramos", "Íris Duarte"];
const comments = [
  "Arte finalizada com muito cuidado e entrega rápida da edição.",
  "Procedência clara e metadados bem documentados na rede.",
  "Combina muito com a minha coleção, recomendo.",
];

function hash(value: string) {
  return [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
}

export function buildNftDetail(nft: Nft): NftDetail {
  const seed = hash(nft.id);
  const hex = seed.toString(16).toUpperCase().padStart(8, "0");
  const digits = nft.name.match(/#(\d+)$/)?.[1] ?? String(seed % 1000);
  const rating = 4.5 + (seed % 5) / 10;

  return {
    ...nft,
    tokenId: `#${digits.padStart(4, "0")}`,
    rating,
    reviewCount: 12 + (seed % 15),
    summary: `Um colecionável digital finalizado à mão da coleção ${nft.collection}, verificado na ${nft.network}.`,
    about: `Um colecionável digital finalizado à mão da coleção ${nft.collection}, verificado na ${nft.network}, com arte desbloqueável e acesso para colecionadores.`,
    description: [
      `${nft.name} é uma obra digital finalizada à mão da coleção ${nft.collection}. Cada atributo fica armazenado nos metadados do token e verificado na ${nft.network}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.`,
      `A propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. ${nft.artist} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
    ],
    attributes: attributesByCategory[nft.category] ?? ["Raro"],
    editions: [
      { label: "1/1", available: nft.totalEditions === 1 },
      { label: "1/10", available: true },
      { label: "1/50", available: true },
      { label: "ABERTA", available: true },
    ],
    networkNote: `Cunhado na ${nft.network} com procedência imutável e metadados armazenados no IPFS.`,
    contract: `0x${hex.slice(0, 4)}...${hex.slice(4)} • Contrato inteligente ERC-721 verificado.`,
    royalties:
      "Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.",
    reviews: comments.map((comment, index) => ({
      author: reviewers[(seed + index) % reviewers.length],
      rating: index === 2 ? 4 : 5,
      comment,
    })),
  };
}
