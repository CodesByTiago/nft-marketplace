# Kurio — NFT Marketplace

**Demo online:** <https://nft-marketplace-beta-pied.vercel.app/>

Implementação responsiva do marketplace a partir dos frames do Figma. A **home** inclui hero, catálogo, filtros combináveis, abas Todos/Novos/Em alta (recortes reais do catálogo, com contagens por aba), busca, ordenação, paginação pela URL, favoritos locais, carrinho, promoções, conteúdo editorial (o **Diário da Cunhagem** abre artigos em /diario/:slug, com barra lateral de outros artigos) e rodapé. O hero é um carrossel automático com dois destaques (catálogo e seção Aprenda). A **tela de detalhe** (`/nft/:id`, desktop e mobile) tem galeria com zoom, edição e quantidade, compra, compartilhamento, descrição/avaliações e obras da mesma coleção (cards iguais aos da home); suporta acesso direto, skeleton, NFT inexistente (404) e erro com nova tentativa.

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
- `npm run lighthouse` — build servido com gzip e auditoria Lighthouse (3 medições por página/perfil, mediana); relatórios em `lighthouse/reports/`

Instale o Chromium do Playwright uma vez antes da primeira execução:

```bash
npx playwright install chromium
```

Os testes iniciam o servidor Vite com MSW e validam o destaque, filtros, carrinho, o fluxo do detalhe e capturas visuais desktop/mobile da home e do detalhe. O relatório HTML é gravado em `playwright-report/`; traces e capturas de falha ficam em `test-results/`. Os fluxos E2E de checkout e conta dependem da implementação dessas telas prevista no PLAN.

## Estrutura

- `src/app/` — composição da aplicação e rotas
- `src/features/marketplace/` — `pages/home`, `pages/nft-detail`, `pages/cart`, `pages/payment`, `pages/article` e `pages/wishlist` (páginas e componentes exclusivos), `content` (textos dos artigos), `components` (header, footer, carrinho e aviso compartilhados), `hooks` (carrinho, favoritos, menu ativo), `services`, `types`, `utils`, `mocks` (MSW em desenvolvimento) e `tests`
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

### Como testar `nft.updated` e `order.updated` manualmente

O backend simulado (MSW) roda no navegador: execute os comandos no **console do DevTools da própria aba do app** (não funcionam via `curl` nem de outra aba). Se o Chrome bloquear a colagem, digite `allow pasting` e Enter, ou use as versões curtas abaixo.

- **`nft.updated`** (preço/disponibilidade ao vivo no catálogo, detalhe e carrinho). Use um `nftId` existente, por exemplo `emerald-ape-042`:
  ```js
  fetch("/api/mock/nft-update",{method:"POST",body:'{"nftId":"emerald-ape-042","price":"9.99"}'})
  fetch("/api/mock/nft-update",{method:"POST",body:'{"nftId":"emerald-ape-042","available":false}'})
  ```
- **`order.updated`** (confirmação/recusa do pedido):
  1. opcional, para dar tempo de ver o estado pendente: `fetch("/api/mock/config",{method:"POST",body:'{"orderSettleMs":60000}'})`;
  2. finalize a compra logado; a chave de idempotência está no `POST /api/orders` (aba Network);
  3. liquide na hora: `fetch("/api/mock/orders/settle",{method:"POST",body:'{"key":"<chave>"}'})`. Sem o passo 1, o pedido liquida sozinho após o tempo padrão.
- **Reconexão:** `fetch("/api/mock/disconnect",{method:"POST",body:"{}"})` derruba o socket; o cliente reconecta e reconcilia pela API.
- **Resetar tudo:** `fetch("/api/mock/reset",{method:"POST",body:"{}"})`.
- Eventos antigos/duplicados: reenvie `nft-update` com `version` menor ou o mesmo `eventId`; a interface não regride.

## Lighthouse

Auditoria do build otimizado (`vite build` servido com gzip, como a hospedagem de produção; mocks ligados) com Lighthouse 13.5.0, Chrome headless, 3 medições por página e perfil (mediana). Config e script em `lighthouse/run.mjs`; relatórios HTML/JSON em `lighthouse/reports/`. Metas: Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO ≥ 90.

**Ambiente e condições:** Node v24.21.0, Lighthouse 13.5.0, Chrome headless (versão registrada em `lighthouse/reports/summary.json`, campo `ambiente`, junto com SO), Windows x64, execução local. Throttling simulado padrão do Lighthouse: mobile com 4x de CPU e 4G lento (1,6 Mbps, 150 ms RTT); desktop sem CPU slowdown, 10 Mbps e 40 ms RTT. Os resultados variam entre máquinas.

| Página | Perfil | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Início | Mobile | 71 | 100 | 100 | 100 | 5,4 s | 0 | 99 ms |
| Início | Desktop | 92 | 96 | 100 | 100 | 1,6 s | 0 | 4 ms |
| Detalhe | Mobile | 70 | 100 | 100 | 100 | 5,6 s | 0 | 136 ms |
| Detalhe | Desktop | 91 | 100 | 100 | 100 | 1,6 s | 0,085 | 0 ms |

Correções feitas a partir da auditoria: `robots.txt`, `role="group"` nas bolinhas do hero, ordem de headings (cards em `h2`), dimensões das imagens, imagens prioritárias (`fetchpriority`) nos primeiros cards, divisão por rota (`lazyRouteComponent`) alvos de toque do carrossel e, o que mais pesou, a conversão das imagens dos NFTs de PNG (~2 MB cada) para WebP (~100 kB), com fetchpriority na imagem do hero.

**Abaixo da meta (Performance, só no perfil mobile):** o build de produção inclui o MSW (exigido para o backend simulado do deploy), cerca de 320 kB de JS avaliado antes do primeiro render sob CPU 4x mais lenta e rede 4G simulada, além da cascata worker → App → dados → imagem. Os resultados oscilam entre execuções. Com um backend real (sem MSW no bundle) essa cascata deixa de existir; neste projeto, o próximo passo seria reduzir ainda mais o bundle do mock e servir miniaturas menores nos cards.

## Acessibilidade

`e2e/a11y.spec.ts` roda o `@axe-core/playwright` (WCAG 2 A/AA) em home, detalhe, carrinho, pagamento, diálogos de login/cadastro, perfil e carteiras, em desktop e mobile, sem tolerar violações, e cobre o teclado: foco preso no diálogo, `Esc` fecha e devolve o foco a quem abriu, foco visível e login só pelo teclado.

## Sessão, dados privados e cenários

- Login e cadastro devolvem um token de sessão (30 min). Favoritos e pedidos são privados por usuário e exigem o token; pagamento e perfil pedem login.
- Contas fictícias: `contato@email.com` e `maria@kurio.art` (senha `kurio1234`).
- Cenários de falha/latência: abra `/?scenario=<nome>` (ex.: `catalog-error`, `catalog-transient`, `slow`, `offline`, `favorites-error`, `payment-declined`, `short-session`) ou use `POST /api/mock/scenario`. `POST /api/mock/reset` restaura tudo; `POST /api/mock/session/expire` expira as sessões.
- Contratos, política de sessão, cache, reconciliação REST × Socket.IO e limitações: veja [ARCHITECTURE.md](./ARCHITECTURE.md).
- Deploy: publicado na Vercel em <https://nft-marketplace-beta-pied.vercel.app/>; `vercel.json` reescreve as rotas para a SPA e o backend simulado (MSW) roda no navegador.
## Assets e escopo

As quatro ilustrações locais em `public/images/` foram obtidas pelo MCP oficial do Figma e não dependem de URLs temporárias. Referência de implementação: [Figma — Início desktop e mobile](https://www.figma.com/design/sPPq6w7GAVqYMT5gT3bWiV/Frontend-Challenge--Copy-?node-id=2-2&m=dev).

Esta etapa implementa a home, o detalhe do NFT e o **carrinho** (`/carrinho`, desktop e mobile): edição de quantidades, remoção, cupom (aplicar/remover; `KURIO10` e `BEMVINDO5` válidos, `VERAO20` expirado, demais inválidos), resumo calculado por `POST /api/cart/quote` (taxa de rede fixa de 0.016 ETH) com skeleton, carrinho da conta guardado no servidor (`/api/cart`; o de visitante, no navegador, mesclado ao entrar) e estado vazio. **Comprar** adiciona a quantidade escolhida e leva ao carrinho; **Conectar e finalizar** leva ao **pagamento** (`/pagamento`, desktop, mobile e modal de confirmação), levando o cupom aplicado. No desktop há o perfil do colecionador (validado) e o resumo; no mobile, as carteiras cadastradas (Reserva/Principal, simuladas) e o botão fixo. `POST /api/orders` (MSW) revalida o total (409 se mudou), é idempotente por chave e confirma o pedido, ou recusa quando a carteira escolhida é WalletConnect (simulação). Em confirmação, o recibo (snapshot imutável, link Etherscan simulado) abre em modal, persiste após refresh e só os itens comprados saem do carrinho; em recusa ou falha os itens são mantidos. Em **Entrar** (header; no mobile, o ícone Perfil) e **Criar conta** abre um dialog (modal no desktop, tela cheia com X no mobile) com validação, mostrar/ocultar senha e `POST /api/auth/login|register` simulados (MSW, contas no `localStorage`; demo: `contato@email.com` / `kurio1234`); a sessão persiste e o header mostra o usuário (clique para sair). Google/Facebook e "Esqueceu a senha?" são apenas simulados e o checkout exige sessão (rotas protegidas redirecionam para o login). O **perfil do colecionador** (`/perfil`, desktop e mobile adaptado: menu em chips) edita dados, avatar (até 1 MB) e senha com validação, salvando por usuário via `GET/PUT /api/profile` (a senha atual é conferida no servidor). **Carteiras** (`/perfil/carteiras`) tem carteira principal e secundária validadas, salvas por usuário via `GET/PUT /api/wallets`; a **lista de interesse** (`/perfil/lista-de-interesse`) lista os favoritos da conta (com remoção e adição ao carrinho); as demais seções do menu (atividade, ofertas, arquivos baixados, suporte) são páginas "em manutenção", por não haver layout. O deploy está publicado (link no topo); carteiras reais não são integradas (simuladas). Tempo real e Lighthouse estão descritos abaixo.
