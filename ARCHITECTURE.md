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

## Dados privados e isolamento

O banco simulado (`localStorage: kurio-mock-db`) particiona dados por coleção e usuário (`readData/writeData`), sempre a
partir do usuário autenticado. Pedidos são filtrados por dono; eventos `order.updated` só vão aos sockets do dono.
Favoritos e pedidos vêm do servidor; carrinho, perfil e carteiras ficam em `localStorage` por usuário
(`kurio-cart:<id>`, `kurio-profile:<id>`, `kurio-wallets:<id>`).

## Carrinho

Chave por usuário; visitantes usam `kurio-cart:guest`. Ao entrar, o carrinho de visitante é mesclado ao da conta (soma
limitada à edição) e descartado. A cotação é sempre recalculada pelo servidor (`/api/cart/quote`).

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
- Perfil, carteiras e carrinho ainda não usam REST.
- Performance no Lighthouse limitada pelo bundle do MSW (ver README).

## Desvios do Figma e decisões de UX

- Telas de perfil sem layout mobile seguem os padrões das demais.
- Páginas do menu lateral sem design são placeholders de "em manutenção".
- Mobile: botão X nos diálogos de login e cadastro.
