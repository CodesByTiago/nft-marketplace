# AGENTS.md — Arquitetura e convenções do ASAP-AI-Frontend

Regras para agentes de IA e desenvolvedores neste repositório.

> **IMPORTANTE:** nomes de pastas e arquivos aqui são exemplos conceituais. **Não crie arquivos ou pastas só porque aparecem neste documento.**

---

# 1. Princípios

O projeto é organizado **primeiro por domínio e depois pela responsabilidade técnica**:

```text
Domínio → Feature → Responsabilidade
```

A regra central:

> **Não crie código para preencher a arquitetura. Crie apenas a estrutura necessária para organizar o código real da aplicação.**

Antes de criar ou modificar código:

1. inspecione a estrutura existente e procure implementações relacionadas;
2. entenda quem usa o código existente;
3. reutilize ou adapte o que já existe;
4. faça a menor alteração necessária.

---

# 2. Não criar estrutura artificial

Não crie:

- arquivos vazios, componentes placeholder ou pastas vazias;
- hooks, services, repositories, contexts, adapters, mappers, factories ou providers sem necessidade concreta;
- types duplicados;
- abstrações prematuras ou "por garantia".

Uma pasta só existe quando há código que a justifique: uma feature sem hooks próprios não tem `hooks/`.

Antes de criar um arquivo, responda:

1. Ele é realmente necessário?
2. Já existe algo semelhante que possa ser reutilizado?
3. Qual é o menor escopo que contém todos os seus consumidores?
4. Estou criando por necessidade ou porque a arquitetura "tem essa pasta"?

Se a resposta for _"porque o AGENTS.md diz que essa pasta existe"_, **não crie o arquivo**.

---

# 3. Camadas e direção das dependências

```text
src/
├── app/        composição global: App, providers, router, layouts
├── features/   domínios: apps, auth, chat, companies, context, integrations, system-config, users
├── shared/     recursos usados por mais de uma feature: ui, components, hooks, services, types, utils
├── core/       infraestrutura: axios, interceptors, guards, token, UserDataContext, páginas globais, infraestrutura de teste (msw, utils)
├── assets/
└── main.tsx
```

A direção é única:

```text
app → features → shared → core
```

- `app` pode importar `features`, `shared` e `core`;
- `features` podem importar `shared` e `core`;
- `shared` pode importar somente `core`;
- `core` não importa `app`, `features` nem `shared` (só bibliotecas externas);
- uma feature **não importa outra feature**;
- não pode haver dependência circular.

Se `core` ou `shared` precisa conhecer uma regra de uma feature, a responsabilidade está no lugar errado: mova o recurso ou inverta a dependência.

**Essa direção é verificada automaticamente:** `no-restricted-imports` no `eslint.config.js` barra os imports proibidos (`@/app`, `@/features`, `@/shared`) em cada camada e entre features. O ESLint roda no pre-commit (husky + lint-staged, instalado pelo `npm install`) e no CI (`npm run lint`). Não contorne a regra com `eslint-disable`, `--no-verify` ou caminhos relativos que atravessem camadas.

---

# 4. Cada coisa na sua camada: regra de escopo

A localização de qualquer recurso (component, hook, service, repository, type, util, context, constante…) é decidida pelos **consumidores reais**, não pela possibilidade de reuso futuro:

> **Qual é o menor escopo que contém todos os consumidores reais deste recurso?**

```text
Usado só por uma page          → pasta da page
Várias pages da mesma feature  → nível da feature
Duas ou mais features          → não duplicar → avaliar shared
Infraestrutura fundamental     → core
Composição global              → app
```

Na dúvida, siga a ordem:

1. Pertence só a uma page? → pasta da page.
2. Pertence só a uma feature? → feature.
3. Mais de uma feature precisa da mesma responsabilidade? → não duplique; avalie `shared`.
4. É infraestrutura fundamental? → avalie `core`.
5. É composição global? → avalie `app`.
6. Precisa mesmo de uma abstração nova? Se não, mantenha simples.

### Regra contra duplicação

Se for copiar uma implementação de uma feature para outra, **pare**. Se as duas precisam da mesma responsabilidade, ela vai para um único lugar em `shared`:

```text
Feature A ──┐
            ├──→ shared
Feature B ──┘
```

Se as implementações só parecem iguais, mas têm responsabilidades de domínio diferentes, mantenha-as separadas. Também não importe a outra feature para "evitar duplicar": isso viola a seção 3.

### Quando NÃO mover para shared

Não mova para `shared` só porque o recurso parece genérico, é pequeno, pode ser reutilizado no futuro ou porque a árvore "fica mais bonita". `shared` não é gaveta global.

---

# 5. Features

```text
features/<feature>/
├── pages/
│   └── <page>/          uma pasta por página
│       ├── <Page>.tsx
│       ├── components/  só o que é exclusivo da página
│       └── hooks/ ...
├── components/
├── hooks/
├── services/
├── types/
└── tests/
```

Todas as pastas são opcionais.

- **Cada página fica em uma pasta própria** em `pages/<page>/`, nunca solta em `pages/`.
- Recursos exclusivos de uma página ficam dentro da pasta dela; os usados por várias páginas sobem para o nível da feature.
- A page monta componentes, usa hooks e coordena a interface; evite lógica de negócio pesada nela.
- Repository só existe com necessidade real (várias fontes de dados, isolamento de persistência). Um service simples basta na maioria dos casos.
- Evite gavetas globais (`src/hooks`, `src/services`, `src/types`, `src/utils`) para código que pertence a uma feature.

---

# 6. Shared

```text
shared/
├── ui/          primitivos shadcn, sem regra de negócio
├── components/  componentes da aplicação usados por várias features
├── hooks/
├── services/
├── types/
└── utils/
```

- A raiz de `shared` só tem categorias; não crie `shared/<recurso>/`.
- **Componente compartilhado com recursos próprios** fica em `shared/components/<componente>/`: os componentes na raiz da pasta, e hooks, services e types exclusivos dele em subpastas ali dentro (não em `shared/hooks` ou `shared/types`).
- `shared/hooks` só recebe hooks genéricos; lógica de domínio fica na feature.
- Novos componentes shadcn são gerados em `shared/ui` (aliases do `components.json`).

---

# 7. App e Core

**`app`**: `App.tsx`, `providers/` (providers globais), `router/` (composição das rotas, sem arquivo gigante) e `layouts/` (layouts globais; layout de uma feature fica na feature).

**`core`**: infraestrutura fundamental. Páginas globais ficam em `core/pages/<page>/` (por exemplo `core/pages/not-found/`), seguindo as regras de `core`.

**Context API:** a tecnologia não define o lugar. Estado global → `app/providers` (ou `core/providers`, se for infraestrutura); estado de uma feature → a feature; contexto genérico → avaliar `shared`.

---

# 8. Testes

Cada camada tem sua pasta `tests/`, espelhando a estrutura interna:

```text
src/
├── app/tests/
├── core/msw/                server e handlers base do MSW, usados pelos testes de todas as camadas
├── core/utils/              setup.ts (setup global do Vitest) e test-utils.tsx (render com providers)
├── core/tests/
├── shared/tests/            ex.: shared/tests/components/<componente>/
└── features/<feature>/tests/
```

- Mocks e servers MSW de uma feature ficam junto dos testes dela.
- Os testes seguem a mesma direção de camadas: testes de `core` e `shared` não importam mocks de features.
- Procure testes existentes antes de criar; não remova testes sem justificativa.

---

# 9. Código

- **Componentização:** componentize por responsabilidade clara ou reuso real; evite componentes minúsculos e fragmentação.
- **Tamanho:** evite arquivos gigantes (o ESLint limita a 300 linhas), mas não divida artificialmente.
- **Estilo:** use Tailwind e os componentes/tokens existentes; não introduza outra solução de estilização.
- **TypeScript:** evite `any`, reutilize types existentes e não crie types duplicados para o mesmo conceito.
- **Performance:** sem otimização prematura (`useMemo`, `useCallback`, lazy, cache) sem necessidade real.

---

# 10. Para agentes de IA

1. Analise o código existente antes de modificar.
2. Busque implementações relacionadas e evite duplicação.
3. Crie somente o necessário, no menor escopo e na camada certa.
4. Não faça refatorações não solicitadas nem crie camadas sem benefício.
5. Mantenha alterações pequenas, rastreáveis e preservando comportamento.
6. Ao migrar código, mova arquivo por arquivo: descubra quem usa, defina domínio e responsabilidade, mova e valide imports e testes.
7. Valide com `lint`, `typecheck`, `format`, `test:run` e `build`.

Este documento não é uma checklist de arquivos a criar.
