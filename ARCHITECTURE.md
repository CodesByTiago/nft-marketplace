# Arquitetura e decisões

## Visão geral

SPA React 18 + TypeScript (Vite). Não há backend real: o MSW intercepta `fetch/XHR` (REST) e `WebSocket` (Socket.IO) no navegador
e responde como uma API. O código da aplicação só conhece URLs `/api/*` e o socket; trocar o MSW por um backend real
não exige alterar telas ou hooks.

Camadas (`app → features → shared → core`, ver `AGENTS.md`):

- `core/api`: Axios (`baseURL /api`, timeout 8 s, `Authorization: Bearer`, evento de sessão expirada).
- `core/auth`: sessão `{ token, user }` em `localStorage` (`kurio-session`).
- `core/realtime`: cliente Socket.IO e contexto.
- `core/msw`: infraestrutura do backend simulado (banco, autenticação, cenários, config).
- `features/*/mocks`: handlers do domínio (catálogo, favoritos, pedidos, autenticação, tempo real).

## Contratos REST

| Método | Rota                       | Auth | Descrição                                                    |
| ------ | -------------------------- | ---- | ------------------------------------------------------------ |
| POST   | `/api/nfts`                | não  | Catálogo paginado, filtros, busca, facetas.                  |
| GET    | `/api/nfts/:id`            | não  | Detalhe.                                                     |
| POST   | `/api/cart/quote`          | não  | Cotação do carrinho (cupom, taxa, indisponíveis).            |
| POST   | `/api/auth/login`          | não  | `{ token, user, expiresAt }`.                                |
| POST   | `/api/auth/register`       | não  | Cria conta e sessão. Senha guardada como hash SHA-256.       |
| GET    | `/api/session`             | sim  | Valida a sessão.                                             |
| POST   | `/api/auth/logout`         | sim  | Revoga o token.                                              |
| GET    | `/api/favorites`           | sim  | `{ ids }` do usuário.                                        |
| PUT    | `/api/favorites/:id`       | sim  | Favorita (idempotente).                                      |
| DELETE | `/api/favorites/:id`       | sim  | Remove.                                                      |
| GET    | `/api/profile`           | sim  | Perfil do usuário (parte dos dados da conta).                |
| PUT    | `/api/profile`           | sim  | Salva; valida e confere a senha atual no servidor (422).     |
| GET    | `/api/wallets`           | sim  | Carteira principal e secundária do usuário.                  |
| PUT    | `/api/wallets`           | sim  | Salva; valida os campos (422 por campo).                     |
| GET    | `/api/cart`              | sim  | Carrinho do usuário, hidratado com o catálogo.               |
| PUT    | `/api/cart/items/:id`    | sim  | Define a quantidade (limitada à edição).                     |
| DELETE | `/api/cart/items?ids=`   | sim  | Remove itens.                                                |
| POST   | `/api/cart/merge`        | sim  | Mescla o carrinho de visitante ao da conta.                  |
| POST   | `/api/orders`              | sim  | Cria pedido `pending` (202), idempotente por `key`.          |
| GET    | `/api/orders/:key`         | sim  | Estado do pedido; pedido de outro usuário responde 404.     |

Erros de sessão: `401` com `code: "session-expired"` (token existente e vencido/revogado) ou `"unauthorized"` (sem token).

## Sessão

- Token opaco (UUID) com validade de 30 min (`sessionTtlMs` configurável). O cliente nunca informa o identificador do usuário;
  o servidor resolve o usuário pelo token (REST e handshake do Socket.IO).
- 401 com token enviado ⇒ evento `kurio:session-expired` ⇒ `AuthProvider` limpa a sessão, descarta o cache privado do
  TanStack Query (chaves `["private", …]`), abre o login com o aviso "Sua sessão expirou" e, após entrar, retoma a ação.
- Ao abrir a aplicação com sessão guardada, `GET /api/session` valida o token.
- Logout chama o servidor, limpa a sessão e o cache privado e o socket reconecta como visitante.

## Guarda de rotas

`/pagamento`, `/perfil`, `/perfil/carteiras` e as páginas em manutenção usam `beforeLoad` no TanStack Router: sem sessão, redirecionam para `/entrar?redirect=<origem>` (só caminhos internos são aceitos; o resto cai em `/`). A página `/entrar` abre o diálogo de login e, ao autenticar, volta à origem preservando a query (ex.: cupom). Fechar o diálogo mantém a página, com opção de tentar de novo. As gates dentro de `AccountShell` e `PaymentPage` continuam para o caso de a sessão expirar com a página aberta.

## Carregamento e movimento reduzido

Catálogo, detalhe e resumo do carrinho/pagamento têm skeletons (`aria-busy`/`role="status"`) com shimmer, desligado em `prefers-reduced-motion`. Os E2E (`loading-states`, `route-guard`) cobrem skeletons em rede lenta, falha com retry, ausência de overflow horizontal em 390/768/1440 e a idempotência de `POST /api/orders`.

## Dados privados e isolamento

O banco simulado (`localStorage: kurio-mock-db`) particiona dados por coleção e usuário (`readData/writeData`), sempre a
partir do usuário autenticado. Pedidos são filtrados por dono; eventos `order.updated` só vão aos sockets do dono.
Favoritos, carrinho, perfil, carteiras e pedidos vêm do servidor, sempre do usuário autenticado; só o carrinho de visitante
fica no navegador.

## Carrinho

Com sessão, o carrinho vive no servidor (`GET/PUT/DELETE /api/cart`, chave de cache `["private","cart",id]`, update otimista com
rollback). Visitantes usam `kurio-cart:guest`. Ao entrar, o carrinho de visitante é mesclado ao da conta (soma
limitada à edição, `POST /api/cart/merge`) e descartado. A cotação é sempre recalculada pelo servidor (`/api/cart/quote`).

## Cache, retries e latência

- TanStack Query: `retry: 1` por padrão; catálogo com `retry: 2` e atraso de 400 ms (absorve 503 transitório).
- Favoritos: atualização otimista com rollback (`onMutate/onError`) e revalidação em `onSettled`.
- Pedido: timeout do Axios (8 s) + mesma `key` de idempotência; o retry devolve o pedido existente em vez de duplicar.

## REST × Socket.IO

REST é a fonte da verdade; o socket só notifica. Eventos têm `id` e `version`: duplicados e antigos são descartados.
Ao (re)conectar, a aplicação invalida as consultas e refaz o snapshot do carrinho. O pedido só é confirmado pelo evento
`order.updated` (ou pelo GET na recuperação); a UI nunca simula eventos — os controles `/api/mock/*` falam com o backend
simulado pela rede.

## Cenários de falha (mock)

`?scenario=<nome>` ou `POST /api/mock/scenario {"scenario":"nome"}`; `POST /api/mock/reset` restaura tudo.

| Cenário             | Efeito                                                           |
| ------------------- | ---------------------------------------------------------------- |
| `default`           | Sem falhas.                                                      |
| `slow`              | +2,5 s em toda chamada.                                          |
| `variable-latency`  | Latência pseudoaleatória (semente fixa), respostas fora de ordem. |
| `offline`           | Erro de rede em todas as chamadas.                               |
| `catalog-empty`     | Catálogo vazio.                                                  |
| `catalog-error`     | 500 no catálogo.                                                 |
| `catalog-transient` | 503 nas 2 primeiras chamadas ao catálogo.                        |
| `favorites-error`   | 500 ao favoritar/desfavoritar (rollback).                        |
| `order-timeout`     | Pedido criado, resposta atrasada 12 s (retry idempotente).       |
| `payment-declined`  | Pedidos são recusados ao concluir.                               |
| `short-session`     | Sessão de 4 s.                                                   |

Sessão expirada sob demanda: `POST /api/mock/session/expire`.

## Credenciais fictícias

`contato@email.com` e `maria@kurio.art`, ambas com a senha `kurio1234`.

## Limitações conhecidas

- Mock em memória/`localStorage`: não há concorrência real nem persistência entre navegadores.
- Hash SHA-256 sem sal por usuário é suficiente só para a simulação; um backend real deve usar Argon2/bcrypt.
- Um namespace Socket.IO, sem rooms nem long-polling no mock.
- O 409 `idempotency-conflict` está coberto no nível da API (E2E), e a UI o trata como erro genérico.
- Performance no Lighthouse limitada pelo bundle do MSW (ver README).

## Desvios do Figma e decisões de UX

- Telas de perfil sem layout mobile seguem os padrões das demais.
- A lista de interesse reutiliza o `NftCard` e os favoritos do servidor; as demais páginas do menu lateral sem design são placeholders. No mobile, perfil, conta e artigos usam a barra inferior compartilhada (`MobileTabBar`); a home mantém a sua, com o filtro de favoritos de "em manutenção".
- Mobile: botão X nos diálogos de login e cadastro.
- Diário da Cunhagem: os 4 cards da home abrem `/diario/:slug` (rota lazy, textos em `features/marketplace/content/articles.ts`, artigo inexistente mostra aviso). O artigo tem barra lateral fixa com os outros três, sem busca/filtros no header, rodapé do site só no desktop e barra inferior no mobile. Os artistas do artigo 2 são fictícios.
- Hero: carrossel automático (5 s) com dois destaques; com `prefers-reduced-motion` a troca continua, sem animação.
- Cards de NFT são um único componente (`NftCard`), reutilizado na home, no detalhe e no carrinho; sem zoom no hover. A prévia do carrinho não aparece em `/carrinho`. Favicon em `public/favicon.svg`.
