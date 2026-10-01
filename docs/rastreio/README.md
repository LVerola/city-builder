# Rastreio de alterações

Cada PR que mexe em **código** precisa de um ficheiro nesta pasta a dizer o que mudou e porquê. O CI em `.github/workflows/validar-pr.yml` recusa o PR se isso faltar.

## Quando é obrigatório

Alterações em:

- `packages/`
- `apps/`
- `scripts/`
- `.github/workflows/`
- `docker-compose.yml`
- `pnpm-workspace.yaml`

Não é obrigatório para só `Backlog/`, `docs/` (excepto esta regra quando o workflow muda) ou texto de product.

## Como criar

1. Copia o modelo abaixo.
2. Grava como `docs/rastreio/AAAA-MM-DD-<slug-curto>.md`.
3. Inclui o ficheiro no mesmo PR do código.

Não edites só este README — o CI ignora-o.

## Modelo

```markdown
# Rastreio — <título curto>

> **Data:** AAAA-MM-DD
> **Branch:** `<nome>`
> **PR:** <número ou vazio>

## O que mudou

- …

## Porquê

…

## Ficheiros

- `caminho/do/ficheiro` — <responsabilidade da mudança>

## Como validar

1. …
```

Documentação completa de uma User Story (fluxo, critérios, camadas) continua a nascer em `Documentacao/` quando a US fecha, via `@documentacao`. Esta pasta é o rasto curto de cada alteração de código.
