# US-001: Abrir o jogo no browser com canvas

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** um menu inicial e uma página de jogo com o mundo no canvas,
**para que** entre no city builder no browser, sem conta e sem servidor, e só carregue o canvas quando for jogar.

## 2. Contexto e justificativa

A arquitetura proíbe começar pelo backend e exige que o React não desenhe o mundo. O primeiro valor visível de E0 é a app web a subir com `pnpm`: a `/` apresenta o menu; `/jogo` hospeda o canvas. Assim o anfitrião Next.js fica separado da engine, e a página inicial não precisa de um simulador.

Esta US nasce só o que usa: monorepo pnpm com `apps/web`. `packages/game-core` fica para a US-002, quando o loop existir. O canvas em `/jogo` mostra um placeholder; terreno e câmera são E1.

Métrica de sucesso: na máquina da equipe, o comando de desenvolvimento abre o menu em `/`; “Jogar” leva a `/jogo` com canvas visível; não há chamada a API .NET.

## 3. Regras de negócio

- RN1: O jogo corre no browser a partir de `apps/web`; não exige autenticação.
- RN2: A rota `/` é o **menu**. Não desenha o mundo nem cria o canvas.
- RN3: A rota `/jogo` é a **página do jogo**. O mundo (mesmo que seja um retângulo placeholder) é desenhado num **Canvas**, não como árvore de componentes React por entidade.
- RN4: O menu tem pelo menos a ação **Jogar**, em PT-BR, que navega para `/jogo`.
- RN5: Stack: workspace **pnpm**, TypeScript em modo estrito, **Next.js 16.3.8** (Active LTS mais recente à data do refinement; patch 16.3.x mais novo se existir no momento da implementação), App Router, **Tailwind CSS** na versão estável mais recente compatível com esse Next.
- RN6: Nesta US só existem os packages que a própria história preenche: `apps/web`. Não se criam `game-core`, `game-world`, `game-renderer`, `game-shared`, `game-simulation` nem `game-content`.
- RN7: Não existe persistência nem API neste lote: fechar o separador perde o placeholder, e isso é aceito.
- RN8: Se o browser não disponibilizar contexto 2D do canvas em `/jogo`, a UI mostra uma mensagem em PT-BR a explicar que o jogo não pode arrancar.

## 4. Critérios de aceitação (Gherkin)

### CA1: Menu na raiz
```gherkin
Dado que as dependências do monorepo estão instaladas
Quando arranco o comando de desenvolvimento da app web
E abro a origem do site (/)
Então vejo um menu em PT-BR
E vejo a ação "Jogar"
E não existe elemento canvas nessa página
```

### CA2: Página do jogo com canvas
```gherkin
Dado que estou no menu em /
Quando ativo "Jogar"
Então o browser navega para /jogo
E existe um canvas visível na área principal
E o canvas tem área de desenho maior que 0×0
```

### CA3: Placeholder no canvas, não no React
```gherkin
Dado que estou em /jogo
Quando inspeciono o canvas e a árvore React
Então o canvas mostra um frame visível (cor sólida ou marca de placeholder)
E não existe uma lista React de tiles, prédios ou entidades do mundo
```

### CA4: Sem backend para arrancar
```gherkin
Dado que não existe API .NET a correr
Quando abro / e depois /jogo
Então ambas as páginas renderizam
E o canvas em /jogo permanece visível
```

### CA5: Canvas 2D indisponível
```gherkin
Dado um ambiente em que getContext("2d") devolve nulo
Quando a página /jogo tenta arrancar o canvas
Então o canvas não fica em branco silencioso
E o jogador vê uma mensagem em PT-BR a indicar que o jogo não pode iniciar
```

### CA6: Estilo com Tailwind
```gherkin
Dado que a app web está a correr
Quando inspeciono o menu em / e a página /jogo
Então o layout usa classes utilitárias Tailwind
E não depende de uma folha CSS global escrita à mão como único sistema de estilo
```

## 5. Fora do escopo

- Câmera, pan, zoom, input de ferramentas (US-101, US-103, E2).
- Mapa, tiles, chunks, terreno (US-102).
- Ligar o canvas a `game-core` / GameLoop (US-002).
- Continuar cidade, carregar save, definições, créditos.
- `apps/api`, PostgreSQL, Docker, cloud save.
- Qualquer package `packages/game-*` (nascem na US que os preencher).
- HUD completo, paleta de ferramentas, tutorial.

## 6. Dependências

- **Bloqueia:** US-002, US-003, US-101
- **Bloqueada por:** nenhuma
- **Relacionada:** US-004 (Vitest entra quando houver `game-core`, na US-002/004)

## 7. Requisitos não-funcionais

- **Performance:** `/` não descarrega o bundle do canvas/`jogo` se o App Router o permitir (página do jogo é a que monta o canvas). Sem simulador econômico.
- **Segurança/Privacidade:** sem autenticação, sem telemetria de dados pessoais, sem segredos no cliente. Next 16.3.8 inclui o patch de segurança de setembro 2026; não usar 16.3.7.
- **Acessibilidade:** “Jogar” é um controle de teclado (link ou botão). O canvas em `/jogo` tem texto alternativo ou rótulo visível (`Mapa do jogo`). A mensagem de erro (CA5) é texto, não só cor. Contraste do menu segundo WCAG 2.2 AA.
- **Observabilidade:** erro de contexto 2D visível ao jogador; sem `catch` vazio.
- **Internacionalização:** copy do menu, da página do jogo e do erro em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-10-01)
- [x] Versão do Next.js e layout das rotas acordados (RN5, `/` + `/jogo`)
- [x] Tailwind acordado para esta US
- [ ] Comando exacto de desenvolvimento documentado no README da raiz (sai no DoD)
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] `pnpm` workspace com `apps/web` a compilar; **sem** packages `game-*` vazios
- [ ] README da raiz explica como instalar e abrir o menu (`/` → Jogar → `/jogo`)
- [ ] Critérios de aceitação validados no browser
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Stack fechada: pnpm + Next.js **16.3.8** (ou patch 16.3.x posterior) + App Router + TypeScript strict + Tailwind. A regra genérica `frontend.mdc` ainda cita Next 15; **neste projeto prevalece esta US**.
- Packages: só se criam quando uma US os preenche. `game-core` nasce na US-002.
- Rotas fechadas: `/` = menu; `/jogo` = canvas. Slug em PT-BR, alinhado a `AGENTS.md`.
- Tailwind fechado nesta US (não CSS mínimo).
- ❓ Conteúdo extra do menu (Continuar, Definições) fica para USs futuras; aqui só **Jogar**.
