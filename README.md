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

## Assets e escopo

As quatro ilustrações locais em `public/images/` foram obtidas pelo MCP oficial do Figma e não dependem de URLs temporárias. Referência de implementação: [Figma — Início desktop e mobile](https://www.figma.com/design/sPPq6w7GAVqYMT5gT3bWiV/Frontend-Challenge--Copy-?node-id=2-2&m=dev).

Esta etapa implementa a home, o detalhe do NFT e o **carrinho** (`/carrinho`, desktop e mobile): edição de quantidades, remoção, cupom (aplicar/remover; `KURIO10` e `BEMVINDO5` válidos, `VERAO20` expirado, demais inválidos), resumo calculado por `POST /api/cart/quote` (taxa de rede fixa de 0.016 ETH) com skeleton, persistência após recarregar e estado vazio. **Comprar** adiciona a quantidade escolhida e leva ao carrinho; **Conectar e finalizar** leva ao **pagamento** (`/pagamento`, desktop, mobile e modal de confirmação), levando o cupom aplicado. No desktop há o perfil do colecionador (validado) e o resumo; no mobile, as carteiras cadastradas (Reserva/Principal, simuladas) e o botão fixo. `POST /api/orders` (MSW) revalida o total (409 se mudou), é idempotente por chave e confirma o pedido, ou recusa quando a carteira escolhida é WalletConnect (simulação). Em confirmação, o recibo (snapshot imutável, link Etherscan simulado) abre em modal, persiste após refresh e só os itens comprados saem do carrinho; em recusa ou falha os itens são mantidos. Em **Entrar** (header; no mobile, o ícone Perfil) e **Criar conta** abre um dialog (modal no desktop, tela cheia com X no mobile) com validação, mostrar/ocultar senha e `POST /api/auth/login|register` simulados (MSW, contas no `localStorage`; demo: `contato@email.com` / `kurio1234`); a sessão persiste e o header mostra o usuário (clique para sair). Google/Facebook e "Esqueceu a senha?" são apenas simulados e o checkout ainda não exige login. O **perfil do colecionador** (`/perfil`, desktop e mobile adaptado: menu em chips) edita dados, avatar (até 1 MB) e senha com validação, salvando no `localStorage` por usuário; a troca de senha é só validada (simulada). **Carteiras** (`/perfil/carteiras`) tem carteira principal e secundária validadas, salvas no `localStorage` por usuário (ainda não alimentam o pagamento); as demais seções do menu (atividade, lista de interesse, ofertas, arquivos baixados, suporte) são páginas "em manutenção", por não haver layout. Carteiras reais, integração Socket.IO, auditoria Lighthouse e deploy ainda precisam ser concluídos para atender integralmente ao [PLAN.md](./PLAN.md).
