# US-001: Abrir o jogo no browser com canvas

> **Origem:** Épico E0 — Fundações
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** abrir o city builder no browser e ver o mundo hospedado num canvas,
**para que** jogue localmente, sem conta e sem servidor, logo na primeira sessão de desenvolvimento.

## 2. Contexto e justificativa

A arquitectura proíbe começar pelo backend e exige que o React não desenhe o mundo. O primeiro valor visível de E0 é uma página que sobe com `pnpm` e mostra um canvas — prova de que a app web é só o anfitrião.

Esta US também nasce o monorepo (`apps/web` + `packages/game-core`) porque, sem fronteira de packages, o passo seguinte (loop na engine) cola a simulação ao Next.js. O canvas pode mostrar um placeholder; terreno e câmara são E1.

Métrica de sucesso: na máquina da equipa, um comando de desenvolvimento abre o jogo no browser, o canvas está visível, e não há chamada a API .NET.

## 3. Regras de negócio

- RN1: O jogo corre no browser a partir de `apps/web`; não exige autenticação.
- RN2: O mundo (mesmo que seja um rectângulo placeholder) é desenhado num **Canvas**, não como árvore de componentes React por entidade.
- RN3: `packages/game-core` não importa React, Next.js, DOM nem HTTP.
- RN4: 🔶 Workspace **pnpm**; TypeScript em modo estrito; App Router no Next.js.
- RN5: Não existe persistência nem API neste lote: fechar o separador perde o placeholder, e isso é aceite.
- RN6: Se o browser não disponibilizar contexto 2D do canvas, a UI mostra uma mensagem em PT-BR a explicar que o jogo não pode arrancar.

## 4. Critérios de aceitação (Gherkin)

### CA1: Abrir o jogo localmente
```gherkin
Dado que as dependências do monorepo estão instaladas
Quando arranco o comando de desenvolvimento da app web
Então o browser abre a página do jogo
E existe um canvas visível na área principal
E o canvas tem área de desenho maior que 0×0
```

### CA2: Placeholder no canvas, não no React
```gherkin
Dado que o jogo está aberto
Quando inspeciono o canvas e a árvore React
Então o canvas mostra um frame visível (cor sólida ou marca de placeholder)
E não existe uma lista React de tiles, prédios ou entidades do mundo
```

### CA3: Engine isolada da UI
```gherkin
Dado o package game-core
Quando analiso as suas dependências de compilação
Então não há dependência de react, next, react-dom nem de bibliotecas HTTP
E a app web é quem cria o elemento canvas e o liga à engine
```

### CA4: Sem backend para arrancar
```gherkin
Dado que não existe API .NET a correr
Quando abro o jogo no browser
Então a página principal renderiza na mesma
E o canvas permanece visível
```

### CA5: Canvas 2D indisponível
```gherkin
Dado um ambiente em que getContext("2d") devolve nulo
Quando a página tenta arrancar o jogo
Então o canvas não fica em branco silencioso
E o jogador vê uma mensagem em PT-BR a indicar que o jogo não pode iniciar
```

## 5. Fora do escopo

- Câmara, pan, zoom, input de ferramentas (US-101, US-103, E2).
- Mapa, tiles, chunks, terreno (US-102).
- `apps/api`, PostgreSQL, Docker, cloud save.
- Packages vazios só para espelhar o diagrama (`game-simulation`, `game-content`, `game-renderer` completo).
- Design visual do HUD, paleta de ferramentas, tutorial.

## 6. Dependências

- **Bloqueia:** US-002, US-003, US-101
- **Bloqueada por:** nenhuma
- **Relacionada:** US-004 (testes no mesmo workspace)

## 7. Requisitos não-funcionais

- **Performance:** a página inicial não descarrega um bundle de simulador económico; só o anfitrião + core mínimo.
- **Segurança/Privacidade:** sem autenticação, sem telemetria de dados pessoais, sem segredos no cliente.
- **Acessibilidade:** o canvas tem texto alternativo ou rótulo visível (`Mapa do jogo` / equivalente em PT-BR); a mensagem de erro (CA5) é texto, não só cor.
- **Observabilidade:** erro de contexto 2D visível ao jogador; sem `catch` vazio.
- **Internacionalização:** copy da página e do erro em PT-BR.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Versão do Next.js e layout mínimo da página acordados (RN4)
- [ ] Comando exacto de desenvolvimento documentado no README da raiz
- [ ] Dependências mapeadas e desbloqueadas
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] `pnpm` workspace com `apps/web` e `packages/game-core` a compilar
- [ ] README da raiz explica como instalar e abrir o jogo
- [ ] Critérios de aceitação validados no browser
- [ ] Teste ou check de fronteira (game-core sem React) a passar
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Stack: pnpm workspaces + Next.js App Router + TypeScript strict, alinhado à tabela da arquitectura e às convenções do repositório. Versão exacta do Next fica no refinement.
- 🔶 `game-world` / `game-renderer` / `game-shared` podem nascer vazios ou só na US que os preencher (E1). Não bloquear E0 a criar packages mortos.
- ❓ Há uma rota única `/` ou um ecrã “Nova cidade” antes do canvas? Nesta US o canvas está na página inicial.
- ❓ Tailwind já nesta US ou CSS mínimo? 🔶 CSS mínimo; design system não é o valor de E0.
