export type ArticleSection = { heading: string; paragraphs: string[]; list?: string[] };

export type Article = {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  intro: string;
  sections: ArticleSection[];
  quote: string;
};

export const articles: Article[] = [
  {
    slug: "como-funciona-a-propriedade-de-nfts",
    category: "Fundamentos",
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    date: "12 de setembro",
    readTime: "6 min",
    image: "/images/nft-noir.webp",
    author: "Equipe Kurio",
    intro:
      "Comprar um NFT não é comprar um arquivo: é registrar, em uma blockchain, que você é a pessoa que controla um token único. Entender essa diferença é o primeiro passo para colecionar com segurança.",
    sections: [
      {
        heading: "O token é o certificado, não a imagem",
        paragraphs: [
          "Um NFT (token não fungível) é um registro público que liga um identificador único a uma carteira. A obra em si — imagem, vídeo ou áudio — costuma ficar em um sistema de armazenamento como o IPFS, e o token guarda o endereço desse arquivo nos metadados.",
          "Por isso duas pessoas podem ter a mesma imagem no computador, mas só uma delas possui o token. A posse é verificável por qualquer um, a qualquer momento, consultando a blockchain.",
        ],
      },
      {
        heading: "O que você passa a ter ao comprar",
        paragraphs: [
          "Ao concluir uma compra, o contrato inteligente transfere o token para a sua carteira. A transação fica registrada com data, valor e endereços envolvidos, formando um histórico de procedência que acompanha a peça para sempre.",
          "Os direitos autorais, porém, nem sempre acompanham o token. Cada coleção define o que o colecionador pode fazer com a obra, e essas regras devem estar descritas na página do item.",
        ],
        list: [
          "Posse verificável do token na sua carteira;",
          "Direito de revender, presentear ou manter a peça em coleção;",
          "Acesso a benefícios definidos pelo criador, quando existirem;",
          "Royalties automáticos para o artista em vendas secundárias, quando previstos no contrato.",
        ],
      },
      {
        heading: "Como verificar antes de comprar",
        paragraphs: [
          "Confira o endereço do contrato, o número do token e a coleção. Na Kurio, essas informações aparecem na seção de detalhes de cada obra, junto com a rede em que ela foi cunhada.",
          "Desconfie de ofertas urgentes, perfis recém-criados e links recebidos por mensagem. Procedência clara e criador reconhecido são os melhores sinais de autenticidade.",
        ],
      },
    ],
    quote: "Possuir um NFT é possuir a prova pública de que a peça é sua, e não apenas uma cópia dela.",
  },
  {
    slug: "10-artistas-digitais-para-acompanhar",
    category: "Criadores",
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
    date: "13 de setembro",
    readTime: "2 min",
    image: "/images/nft-hero.webp",
    author: "Equipe Kurio",
    intro:
      "A cena de arte digital cresce pelas mãos de criadores que misturam código, ilustração e narrativa. Reunimos dez perfis fictícios de destaque nas coleções da Kurio para você acompanhar de perto.",
    sections: [
      {
        heading: "Quem está moldando a cultura digital",
        paragraphs: [
          "Os nomes abaixo são curadoria da casa e representam estilos diferentes. Seguir criadores desde o início é uma das formas mais divertidas de montar uma coleção com identidade.",
        ],
        list: [
          "Aurora Vale — retratos em luz e cor, com foco em personagens expressivos;",
          "Theo Marrone — arte generativa que transforma algoritmos em paisagens;",
          "Luna Quartz — texturas minerais e composições abstratas;",
          "Caio Brandão — ilustração narrativa inspirada em quadrinhos autorais;",
          "Mira Soleil — fotografia tratada digitalmente e colagens oníricas;",
          "Davi Ferro — esculturas 3D com metais e superfícies reflexivas;",
          "Noa Ibarra — animações curtas em loop com paleta quente;",
          "Sofia Arruda — pixel art contemporânea e personagens colecionáveis;",
          "Iris Montalvo — moda digital e vestíveis para mundos virtuais;",
          "Bento Salles — arte sonora e visual em obras sincronizadas.",
        ],
      },
      {
        heading: "Como acompanhar",
        paragraphs: [
          "Favorite as obras de que mais gostou para encontrá-las depois e volte à home para ver os lançamentos. Quando um criador lança uma nova coleção, o primeiro lote costuma ser o mais disputado.",
        ],
      },
    ],
    quote:
      "Um bom acervo começa com curiosidade: acompanhe quem está criando agora e colecione o que fizer sentido para você.",
  },
  {
    slug: "raridade-atributos-e-procedencia",
    category: "Colecionismo",
    title: "Raridade, atributos e procedência",
    description: "Entenda raridade, procedência, direitos autorais e utilidade.",
    date: "15 de setembro",
    readTime: "3 min",
    image: "/images/nft-nomad.webp",
    author: "Equipe Kurio",
    intro:
      "Duas obras parecidas podem ter valores muito diferentes. A explicação está em quatro pilares: raridade, atributos, procedência e direitos. Aprender a lê-los muda a forma de escolher uma peça.",
    sections: [
      {
        heading: "Raridade e atributos",
        paragraphs: [
          "Em coleções com muitas peças, cada obra combina atributos como óculos, roupas, fundos ou expressões. Quanto menos peças compartilham um atributo, mais rara ela é e, em geral, mais disputada.",
          "A edição também conta: uma peça 1/1 é única, enquanto uma 1/50 existe em cinquenta cópias numeradas. Na Kurio, os atributos e a edição aparecem logo abaixo da descrição do item.",
        ],
      },
      {
        heading: "Procedência e direitos",
        paragraphs: [
          "A procedência é o histórico de quem criou, vendeu e comprou a obra. Um histórico limpo, com o criador original na primeira venda, é um dos melhores indícios de autenticidade.",
          "Já os direitos autorais dizem o que você pode fazer com a imagem. Alguns criadores permitem uso pessoal, outros liberam uso comercial; leia sempre a licença da coleção.",
        ],
      },
      {
        heading: "Utilidade além da imagem",
        paragraphs: [
          "Algumas coleções oferecem acesso a eventos, comunidades fechadas ou lançamentos antecipados. Essa utilidade é parte do valor da peça, mas depende da promessa do criador, então avalie o histórico dele antes de decidir.",
        ],
      },
    ],
    quote: "Raridade chama atenção, mas é a procedência que dá confiança.",
  },
  {
    slug: "como-proteger-sua-carteira",
    category: "Segurança",
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
    date: "15 de setembro",
    readTime: "2 min",
    image: "/images/nft-gold.webp",
    author: "Equipe Kurio",
    intro:
      "Na blockchain, quem controla as chaves controla os ativos. Não há central de atendimento capaz de desfazer uma transação, por isso a prevenção é a sua melhor defesa.",
    sections: [
      {
        heading: "Frase de recuperação: só sua",
        paragraphs: [
          "A frase de recuperação é a chave mestra da carteira. Nenhuma plataforma séria, incluindo a Kurio, pede esse conteúdo por e-mail, mensagem ou formulário.",
          "Anote-a em papel, guarde em local seguro e nunca a fotografe nem a salve em nuvem.",
        ],
      },
      {
        heading: "Boas práticas do dia a dia",
        paragraphs: ["Pequenos hábitos evitam a maioria dos golpes:"],
        list: [
          "Confira o endereço do site antes de conectar a carteira;",
          "Desconfie de ofertas urgentes e de prêmios inesperados;",
          "Use uma carteira secundária para testar novos serviços;",
          "Ative a autenticação em duas etapas nas contas associadas;",
          "Revise e revogue permissões de contratos que você não usa mais.",
        ],
      },
      {
        heading: "Se algo parecer estranho",
        paragraphs: [
          "Interrompa a operação, não assine nada e mova os ativos para uma carteira nova se suspeitar de vazamento. Em caso de dúvida, procure a Central de ajuda.",
        ],
      },
    ],
    quote: "Segurança digital é hábito: quanto menos pressa, menos risco.",
  },
];

export function findArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
