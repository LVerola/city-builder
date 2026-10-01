# Rastreio — CI de PR, rastreio obrigatório e protecção da main

> **Data:** 2026-10-01
> **Branch:** `chore/ci-rastreio-protecao-main`
> **PR:**

## O que mudou

- Workflow de GitHub Actions que corre em todo PR para `main`.
- Script `scripts/validar-rastreio.mjs`: se o diff alterar código, exige um markdown novo ou alterado em `docs/rastreio/` (excepto o README).
- Template de pull request a pedir o resumo da alteração e o link do rastreio.
- Ruleset na `main`: só merge via PR, sem push directo, sem force-push, sem apagar a branch.

## Porquê

Precisamos de um rasto do que cada alteração de código fez, e de impedir commits soltos na `main`. O repositório ainda não tem suite de testes estável; o CI valida o contrato de rastreio, não o comportamento do jogo.

## Ficheiros

- `.github/workflows/validar-pr.yml` — job `validar` nos PRs
- `scripts/validar-rastreio.mjs` — regra código → rastreio
- `docs/rastreio/README.md` — como escrever o rasto
- `.github/PULL_REQUEST_TEMPLATE.md` — o que o autor do PR tem de preencher

## Como validar

1. Abrir um PR que altere só `Backlog/` — o job `validar` deve passar.
2. Abrir um PR que altere `packages/` sem ficheiro em `docs/rastreio/` — o job deve falhar.
3. Tentar `git push origin main` com um commit directo — o GitHub deve recusar.
4. Mergear só através de Pull Request.
