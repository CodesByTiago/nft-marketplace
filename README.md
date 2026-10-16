# Kurio — NFT Marketplace

Implementação responsiva do marketplace a partir dos frames do Figma. A **home** inclui hero, catálogo, filtros combináveis, abas Todos/Novos/Em alta (recortes reais do catálogo, com contagens por aba), busca, ordenação, paginação pela URL, favoritos locais, carrinho, promoções, conteúdo editorial e rodapé. A **tela de detalhe** (`/nft/:id`, desktop e mobile) tem galeria com zoom, edição e quantidade, compra, compartilhamento, descrição/avaliações e obras da mesma coleção; suporta acesso direto, skeleton, NFT inexistente (404) e erro com nova tentativa.

## Executar localmente

```bash
npm install
npm run dev
```

O catálogo usa Axios e MSW no navegador. O inventário determinístico inclui 99 NFTs distribuídos entre as categorias e redes; as quantidades exibidas nos filtros são calculadas a partir desses dados. Para desativar o mock worker, defina `VITE_ENABLE_MOCKS=false`.

## Comandos

- `npm run dev` — desenvolvimento com MSW
- `npm run build` — verificação TypeScript e build de produção
- `npm run preview` — preview local do build
- `npm run typecheck` — verificação de tipos
- `npm run lint` — ESLint (inclui a direção das dependências entre camadas)
- `npm run format` / `npm run format:write` — verificar / aplicar Prettier
- `npm test` / `npm run test:run` — testes unitários e de componentes com Vitest
- `npm run test:e2e` — testes E2E e regressão visual da home com Playwright
- `npm run test:e2e:update` — atualizar as baselines visuais versionadas
- `npm run lighthouse` — build + preview e auditoria Lighthouse (3 medições por página/perfil, mediana); relatórios em `lighthouse/reports/`

Instale o Chromium do Playwright uma vez antes da primeira execução:

```bash
npx playwright install chromium
```

Os testes iniciam o servidor Vite com MSW e validam o destaque, filtros, carrinho, o fluxo do detalhe e capturas visuais desktop/mobile da home e do detalhe. O relatório HTML é gravado em `playwright-report/`; traces e capturas de falha ficam em `test-results/`. Os fluxos E2E de checkout e conta dependem da implementação dessas telas prevista no PLAN.

## Estrutura

- `src/app/` — composição da aplicação e rotas
- `src/features/marketplace/` — `pages/home`, `pages/nft-detail`, `pages/cart` e `pages/payment` (páginas e componentes exclusivos), `components` (header, footer, carrinho e aviso compartilhados), `hooks` (carrinho, favoritos, menu ativo), `services`, `types`, `utils`, `mocks` (MSW em desenvolvimento) e `tests`
- `src/shared/ui/` — componentes shadcn/ui
- `src/shared/utils/` — utilitários compartilhados
- `src/core/api/` — cliente Axios; `src/core/msw/` e `src/core/utils/setup.ts` — servidor MSW e setup global do Vitest
- `src/styles/` — CSS dividido por responsabilidade, importado por `src/styles.css`

A direção `app → features → shared → core` é verificada pelo `no-restricted-imports` no ESLint. A busca por texto é enviada no body do POST `/api/nfts` e não aparece na URL; categoria, rede, preço, ordenação e página ficam na URL.

Tailwind CSS v4 fornece as utilities e os tokens usados pela aplicação; os componentes shadcn/ui são mantidos em `src/shared/ui`.

## Tempo real (Socket.IO)

O cliente usa `socket.io-client` (`src/core/realtime`, `RealtimeProvider`): um socket por usuário (`userId` na query; trocar de sessão reconecta). O servidor é simulado no navegador com MSW (`ws.link` + `@mswjs/socket.io-binding`, `features/marketplace/mocks/realtime.ts`). Limitações do simulador: um único namespace, sem rooms/acks nativos e sem long-polling (só WebSocket).

Eventos (todos com `id`, `version`, `occurredAt` e `resource`):

- `nft.updated` — preço/disponibilidade de um NFT. O cliente descarta eventos duplicados (mesmo `id`) ou antigos (`version` menor ou igual à conhecida), atualiza catálogo, detalhe, carrinho e resumo, e avisa o colecionador (região `role="status"`). Item esgotado sai do total e bloqueia o checkout.
- `order.updated` — evolução do pedido de um usuário; só é entregue ao dono (`userId`) e o cliente ignora outros pedidos.

Compra: `POST /api/orders` responde `202` com o pedido `pending` (idempotente por chave; `409` se o total mudou ou o item ficou indisponível). A confirmação **só** chega pelo evento `order.updated` ou pela reconciliação `GET /api/orders/:key` (o pedido é de quem o criou; outro usuário recebe `404`). Ao reconectar, ou ao recarregar com pedido pendente, o cliente reconcilia pela API e reutiliza a mesma chave, sem nova compra. Pedidos pendentes persistem no `localStorage` do simulador e são retomados no bootstrap.

Controles de cenário (rede, não UI), usados pelos E2E em `e2e/realtime.spec.ts`: `POST /api/mock/nft-update` (`nftId`, `price`, `available`, `version`, `eventId`), `/api/mock/orders/settle` (`key`), `/api/mock/disconnect`, `/api/mock/config` (`orderSettleMs`) e `/api/mock/reset`. O identificador do usuário viaja no header `X-User-Id`.

## Lighthouse

Auditoria do build otimizado (`vite build` + `preview`, mocks ligados) com Lighthouse 13.5.0, Chrome headless, 3 medições por página e perfil (mediana). Config e script em `lighthouse/run.mjs`; relatórios HTML/JSON em `lighthouse/reports/`. Metas: Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO ≥ 90.

| Página | Perfil | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Início | Mobile | 48 | 100 | 100 | 100 | 7,0 s | 0 | 782 ms |
| Início | Desktop | 75 | 96 | 100 | 100 | 2,9 s | 0 | 78 ms |
| Detalhe | Mobile | 67 | 100 | 100 | 100 | 5,7 s | 0 | 213 ms |
| Detalhe | Desktop | 77 | 100 | 100 | 100 | 2,7 s | 0,085 | 59 ms |

Correções feitas a partir da auditoria: `robots.txt`, `role="group"` nas bolinhas do hero, ordem de headings (cards em `h2`), dimensões das imagens, imagens prioritárias (`fetchpriority`) nos primeiros cards, divisão por rota (`lazyRouteComponent`) e alvos de toque do carrossel.

**Abaixo da meta (Performance):** o build de produção inclui o MSW (exigido para o backend simulado do deploy), cerca de 320 kB de JS avaliado antes do primeiro render sob CPU 4x mais lenta no perfil mobile, além da cascata worker → App → dados → imagem. Resultados variam bastante entre execuções neste ambiente (o Início desktop oscilou entre 69 e 92). Próximos passos possíveis: reduzir o bundle do mock e pré-carregar a imagem do primeiro card.

## Sessão, dados privados e cenários

- Login e cadastro devolvem um token de sessão (30 min). Favoritos e pedidos são privados por usuário e exigem o token; pagamento e perfil pedem login.
- Contas fictícias: `contato@email.com` e `maria@kurio.art` (senha `kurio1234`).
- Cenários de falha/latência: abra `/?scenario=<nome>` (ex.: `catalog-error`, `catalog-transient`, `slow`, `offline`, `favorites-error`, `payment-declined`, `short-session`) ou use `POST /api/mock/scenario`. `POST /api/mock/reset` restaura tudo; `POST /api/mock/session/expire` expira as sessões.
- Contratos, política de sessão, cache, reconciliação REST × Socket.IO e limitações: veja [ARCHITECTURE.md](./ARCHITECTURE.md).
- Deploy: `vercel.json` já reescreve as rotas para a SPA (o deploy em si depende da sua conta).
## Assets e escopo

As quatro ilustrações locais em `public/images/` foram obtidas pelo MCP oficial do Figma e não dependem de URLs temporárias. Referência de implementação: [Figma — Início desktop e mobile](https://www.figma.com/design/sPPq6w7GAVqYMT5gT3bWiV/Frontend-Challenge--Copy-?node-id=2-2&m=dev).

Esta etapa implementa a home, o detalhe do NFT e o **carrinho** (`/carrinho`, desktop e mobile): edição de quantidades, remoção, cupom (aplicar/remover; `KURIO10` e `BEMVINDO5` válidos, `VERAO20` expirado, demais inválidos), resumo calculado por `POST /api/cart/quote` (taxa de rede fixa de 0.016 ETH) com skeleton, persistência após recarregar e estado vazio. **Comprar** adiciona a quantidade escolhida e leva ao carrinho; **Conectar e finalizar** leva ao **pagamento** (`/pagamento`, desktop, mobile e modal de confirmação), levando o cupom aplicado. No desktop há o perfil do colecionador (validado) e o resumo; no mobile, as carteiras cadastradas (Reserva/Principal, simuladas) e o botão fixo. `POST /api/orders` (MSW) revalida o total (409 se mudou), é idempotente por chave e confirma o pedido, ou recusa quando a carteira escolhida é WalletConnect (simulação). Em confirmação, o recibo (snapshot imutável, link Etherscan simulado) abre em modal, persiste após refresh e só os itens comprados saem do carrinho; em recusa ou falha os itens são mantidos. Em **Entrar** (header; no mobile, o ícone Perfil) e **Criar conta** abre um dialog (modal no desktop, tela cheia com X no mobile) com validação, mostrar/ocultar senha e `POST /api/auth/login|register` simulados (MSW, contas no `localStorage`; demo: `contato@email.com` / `kurio1234`); a sessão persiste e o header mostra o usuário (clique para sair). Google/Facebook e "Esqueceu a senha?" são apenas simulados e o checkout ainda não exige login. O **perfil do colecionador** (`/perfil`, desktop e mobile adaptado: menu em chips) edita dados, avatar (até 1 MB) e senha com validação, salvando no `localStorage` por usuário; a troca de senha é só validada (simulada). **Carteiras** (`/perfil/carteiras`) tem carteira principal e secundária validadas, salvas no `localStorage` por usuário (ainda não alimentam o pagamento); as demais seções do menu (atividade, lista de interesse, ofertas, arquivos baixados, suporte) são páginas "em manutenção", por não haver layout. Carteiras reais e deploy ainda precisam ser concluídos para atender integralmente ao [PLAN.md](./PLAN.md); tempo real e Lighthouse estão descritos abaixo.
