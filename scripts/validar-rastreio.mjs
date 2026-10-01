#!/usr/bin/env node
/**
 * Falha o CI quando o PR altera código sem um ficheiro de rastreio em docs/rastreio/.
 * Uso local: BASE_SHA=$(git merge-base HEAD origin/main) HEAD_SHA=HEAD node scripts/validar-rastreio.mjs
 */

import { execFileSync } from "node:child_process";

const README_RASTREIO = "docs/rastreio/README.md";

function ehFicheiroDeCodigo(caminho) {
  return (
    caminho.startsWith("packages/") ||
    caminho.startsWith("apps/") ||
    caminho.startsWith("scripts/") ||
    caminho.startsWith(".github/workflows/") ||
    caminho === "docker-compose.yml" ||
    caminho === "pnpm-workspace.yaml"
  );
}

function ehFicheiroDeRastreio(caminho) {
  return (
    caminho.startsWith("docs/rastreio/") &&
    caminho.endsWith(".md") &&
    caminho !== README_RASTREIO
  );
}

function listarFicheiros(baseSha, headSha) {
  const saida = execFileSync(
    "git",
    ["diff", "--name-only", `${baseSha}...${headSha}`],
    { encoding: "utf8" },
  );
  return saida
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

function resolverShas() {
  const baseSha = process.env.BASE_SHA;
  const headSha = process.env.HEAD_SHA;
  if (baseSha && headSha) {
    return { baseSha, headSha };
  }

  const fallbackBase = execFileSync(
    "git",
    ["merge-base", "HEAD", "origin/main"],
    { encoding: "utf8" },
  ).trim();
  const fallbackHead = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  return { baseSha: fallbackBase, headSha: fallbackHead };
}

const { baseSha, headSha } = resolverShas();
const ficheiros = listarFicheiros(baseSha, headSha);
const codigoAlterado = ficheiros.filter(ehFicheiroDeCodigo);
const rastreioAlterado = ficheiros.filter(ehFicheiroDeRastreio);

if (codigoAlterado.length > 0 && rastreioAlterado.length === 0) {
  console.error(
    "Alterações de código exigem um ficheiro de rastreio em docs/rastreio/.",
  );
  console.error("Código alterado:");
  for (const ficheiro of codigoAlterado) {
    console.error(`  - ${ficheiro}`);
  }
  console.error(
    "Cria um markdown em docs/rastreio/ (não uses só o README) a descrever o que mudou e porquê.",
  );
  process.exit(1);
}

if (codigoAlterado.length === 0) {
  console.log("Sem alterações de código; rastreio não é obrigatório.");
} else {
  console.log("Rastreio presente:");
  for (const ficheiro of rastreioAlterado) {
    console.log(`  - ${ficheiro}`);
  }
}

process.exit(0);
