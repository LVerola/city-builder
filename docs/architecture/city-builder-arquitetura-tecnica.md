# City Builder Web — Arquitetura Técnica e Roadmap

## 1. Visão geral

Projeto de um city builder para navegador, inspirado conceitualmente em jogos como Citystate II, usando Canvas para renderização do mundo e uma engine própria em TypeScript para controlar a simulação.

Princípios fundamentais:

- React não controla a simulação.
- Canvas é responsável pela renderização do mundo.
- O Game Core controla o estado e a simulação.
- A simulação não depende do backend.
- O backend é responsável inicialmente por persistência, autenticação e cloud saves.
- A arquitetura deve permitir trocar Canvas 2D por WebGL/WebGPU futuramente sem reescrever a simulação.

Arquitetura de alto nível:

```text
┌─────────────────────────────────────────────────────────────┐
│                         WEB APP                             │
│                       Next.js / React                       │
│                                                             │
│  ┌──────────────────┐                  ┌─────────────────┐  │
│  │       UI         │                  │     Canvas      │  │
│  │                  │                  │                 │  │
│  │ Menus            │                  │ World Renderer  │  │
│  │ HUD              │                  │ Buildings       │  │
│  │ Panels           │                  │ Roads           │  │
│  │ Charts            │                  │ Vehicles        │  │
│  │ Policies         │                  │ Effects         │  │
│  └────────┬─────────┘                  └────────┬────────┘  │
│           │                                     │           │
│           └────────────────┬────────────────────┘           │
│                            ▼                                │
│                    ┌───────────────┐                        │
│                    │   GAME CORE   │                        │
│                    │               │                        │
│                    │ Game Loop     │                        │
│                    │ World         │                        │
│                    │ Simulation    │                        │
│                    │ Commands      │                        │
│                    │ Events        │                        │
│                    └───────┬───────┘                        │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │   .NET API   │
                     ├──────────────┤
                     │ Save / Load  │
                     │ Auth         │
                     │ Cloud Saves  │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ PostgreSQL   │
                     └──────────────┘
```

---

# 2. Stack

| Área | Tecnologia |
|---|---|
| Frontend | Next.js |
| Linguagem | TypeScript |
| UI | React |
| Estado de UI | Zustand |
| Renderização | Canvas 2D inicialmente |
| Game Engine | TypeScript próprio |
| Backend | .NET 10 |
| API | ASP.NET Core |
| Banco | PostgreSQL |
| Comunicação | REST |
| Validação | Zod no frontend / FluentValidation no backend |
| Testes frontend | Vitest |
| Testes E2E | Playwright |
| Testes backend | xUnit |
| Containers | Docker |
| Monorepo | pnpm workspaces |

A engine será desenvolvida sem depender de um framework de jogos como Phaser inicialmente. O objetivo é utilizar o projeto também como laboratório de arquitetura, algoritmos, simulação e performance.

---

# 3. Estrutura do repositório

```text
city-builder/
│
├── apps/
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   └── styles/
│   │   └── package.json
│   │
│   └── api/
│       ├── CityBuilder.Api/
│       ├── CityBuilder.Application/
│       ├── CityBuilder.Domain/
│       ├── CityBuilder.Infrastructure/
│       └── CityBuilder.Tests/
│
├── packages/
│   │
│   ├── game-core/
│   ├── game-renderer/
│   ├── game-simulation/
│   ├── game-world/
│   ├── game-content/
│   ├── game-shared/
│   └── game-test-utils/
│
├── assets/
│   ├── buildings/
│   ├── terrain/
│   ├── roads/
│   ├── vehicles/
│   ├── ui/
│   └── sprites/
│
├── docs/
│   ├── architecture/
│   ├── game-design/
│   ├── simulation/
│   └── decisions/
│
├── scripts/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
└── README.md
```

---

# 4. Game Core

O Game Core é o coração do projeto.

```text
packages/game-core/

src/
├── engine/
│   ├── GameEngine.ts
│   ├── GameLoop.ts
│   ├── GameClock.ts
│   └── GameContext.ts
│
├── commands/
├── events/
├── systems/
└── types/
```

O `GameEngine` deve orquestrar:

```text
GameEngine
     │
     ├── World
     ├── Simulation
     ├── Clock
     ├── Commands
     ├── Events
     └── Systems
```

O Game Engine não deve conhecer React, Next.js ou detalhes do Canvas.

---

# 5. Game Loop

A engine deve possuir seu próprio loop, independente do ciclo de renderização do React.

Conceito:

```text
requestAnimationFrame
        │
        ▼
     GameLoop
        │
        ├── Input
        │
        ├── Simulation
        │
        └── Render
```

A implementação inicial pode utilizar `requestAnimationFrame`, mas a simulação deve ser separada do FPS de renderização.

---

# 6. Fixed Timestep

A simulação deve utilizar timestep fixo.

Exemplo:

```text
Render
60 FPS
  ↓
Simulation
20 ticks/s
```

Isso significa que a simulação não muda de comportamento dependendo da máquina do jogador.

Um segundo do jogo pode representar:

```text
20 simulation ticks
```

Enquanto o Canvas pode renderizar a 60 FPS.

Isso também facilita testes determinísticos.

---

# 7. Game Clock

Criar um relógio próprio para o mundo do jogo.

```ts
interface GameDate {
  year: number;
  month: number;
  day: number;
  hour: number;
}
```

Velocidades possíveis:

```text
⏸ Pausado

▶ 1x

▶ 2x

▶ 4x
```

A velocidade altera a quantidade de tempo simulado, não a lógica dos sistemas.

---

# 8. World

O mundo deve ser separado da simulação.

```text
game-world/

├── World.ts
├── Map.ts
├── Tile.ts
├── Chunk.ts
├── Building.ts
├── Road.ts
├── Zone.ts
└── Infrastructure.ts
```

---

# 9. Tile

Evitar classes pesadas para cada tile. Utilizar estruturas de dados simples.

```ts
interface Tile {
  terrain: TerrainType;
  zone: ZoneType | null;

  buildingId: number | null;
  roadId: number | null;

  water: boolean;
  electricity: boolean;
}
```

Tipos de terreno iniciais:

```text
grass
water
forest
mountain
sand
```

---

# 10. Chunking

O mapa deve ser dividido em chunks.

Exemplo:

```text
Chunk
32 × 32
```

Mapa:

```text
┌────┬────┬────┬────┐
│ C1 │ C2 │ C3 │ C4 │
├────┼────┼────┼────┤
│ C5 │ C6 │ C7 │ C8 │
├────┼────┼────┼────┤
│ C9 │ C10│ C11│ C12│
└────┴────┴────┴────┘
```

Benefícios:

- carregar somente áreas necessárias;
- renderizar somente chunks visíveis;
- salvar somente chunks alterados;
- suportar mapas grandes;
- facilitar streaming futuro.

---

# 11. Camera

A câmera deve ser independente do mundo.

```ts
interface Camera {
  x: number;
  y: number;

  zoom: number;

  viewportWidth: number;
  viewportHeight: number;
}
```

Fluxo:

```text
Screen coordinates
       ↓
Camera transformation
       ↓
World coordinates
```

Funcionalidades:

- Pan
- Zoom
- Scroll
- Conversão mouse → mundo
- Seleção
- Culling

---

# 12. Renderer

Estrutura:

```text
game-renderer/

├── Renderer.ts
├── Camera.ts
├── layers/
│   ├── TerrainLayer.ts
│   ├── RoadLayer.ts
│   ├── BuildingLayer.ts
│   ├── InfrastructureLayer.ts
│   ├── VehicleLayer.ts
│   ├── EffectLayer.ts
│   └── OverlayLayer.ts
│
├── sprites/
├── shaders/
└── culling/
```

Ordem inicial:

```text
Canvas
 │
 ├── Terrain
 ├── Water
 ├── Roads
 ├── Buildings
 ├── Trees
 ├── Vehicles
 ├── Infrastructure
 ├── Effects
 └── UI Overlay
```

---

# 13. React não deve renderizar prédios

Não utilizar React para criar milhares de componentes representando entidades do mundo.

Evitar:

```tsx
{buildings.map(building => (
  <Building />
))}
```

O React deve cuidar de:

```text
HUD
Menus
Panels
Dialogs
Charts
Settings
Notifications
```

O Canvas deve cuidar de:

```text
Cidade
Prédios
Estradas
Terreno
Veículos
Efeitos
Overlays
```

---

# 14. Sistema de entidades

Começar simples, usando IDs.

```ts
type BuildingId = number;

interface Building {
  id: BuildingId;

  type: BuildingType;

  x: number;
  y: number;

  level: number;

  health: number;

  workers: number;
}
```

Não implementar ECS completo no início.

Caso a quantidade de entidades cresça muito, partes específicas podem migrar para uma arquitetura ECS.

---

# 15. Building Definitions

Os prédios devem ser dirigidos por dados.

```ts
interface BuildingDefinition {
  id: string;

  category: BuildingCategory;

  size: {
    width: number;
    height: number;
  };

  constructionCost: number;

  maintenanceCost: number;

  jobs: number;

  electricityDemand: number;

  waterDemand: number;
}
```

Exemplo:

```json
{
  "id": "small_factory",
  "category": "industrial",
  "constructionCost": 5000,
  "maintenanceCost": 150,
  "jobs": 25,
  "electricityDemand": 20,
  "waterDemand": 10
}
```

A lógica do jogo interpreta a definição em vez de possuir regras hardcoded para cada prédio.

---

# 16. Systems

Evitar uma classe monolítica como `CityManager` com milhares de linhas.

A simulação deve ser composta por sistemas independentes:

```text
Simulation
│
├── PopulationSystem
├── EmploymentSystem
├── EconomySystem
├── TaxSystem
├── ConstructionSystem
├── ElectricitySystem
├── WaterSystem
├── TrafficSystem
├── EducationSystem
├── HealthcareSystem
├── CrimeSystem
├── PollutionSystem
└── HappinessSystem
```

Cada sistema deve ter responsabilidade clara e receber somente o contexto necessário.

---

# 17. Population System

Exemplo:

```ts
class PopulationSystem {
  update(context: SimulationContext) {
    const population = context.population;

    const births = this.calculateBirths(population);
    const deaths = this.calculateDeaths(population);
    const migration = this.calculateMigration(context);

    population.total +=
      births -
      deaths +
      migration;
  }
}
```

O sistema pode evoluir posteriormente para grupos populacionais.

---

# 18. Economy System

Fluxo:

```text
Population
    │
    ├── Income
    ├── Consumption
    └── Employment
            │
            ▼
        Businesses
            │
            ▼
           GDP
            │
            ▼
         Taxes
            │
            ▼
       Government
            │
            ▼
      Investments
```

---

# 19. Demand System

Criar uma estrutura:

```ts
interface CityDemand {
  residential: number;
  commercial: number;
  industrial: number;
  office: number;
}
```

A demanda pode considerar:

```text
Residential Demand =
Population Growth
+ Employment
+ Income
- Housing Supply
```

Exemplo de UI:

```text
Residential: +72
Commercial: +34
Industrial: -12
```

---

# 20. Serviços públicos

Cada serviço pode possuir:

```ts
interface ServiceCoverage {
  service: ServiceType;

  capacity: number;

  usage: number;

  coverage: number;
}
```

Exemplo:

```text
Hospital

Capacity: 10,000
Population: 12,000

Coverage: 83%
```

Essa cobertura pode alimentar:

```text
Health
Happiness
Migration
Productivity
```

---

# 21. Electricity

A eletricidade deve evoluir para uma rede.

```text
Power Plant
     │
     ▼
Power Grid
     │
 ┌───┼────┐
 ▼   ▼    ▼
🏠  🏭   🏢
```

Cálculo conceitual:

```text
Generation
+
Transmission
-
Consumption
=
Available Power
```

---

# 22. Water

Estrutura conceitual:

```text
Water Source
      ↓
Treatment
      ↓
Pipes
      ↓
Buildings
```

Futuramente isso pode utilizar algoritmos de grafos.

---

# 23. Roads

Estradas devem ser modeladas como grafo.

```text
A ─── B ─── C
│     │
D ─── E
```

Nós:

```ts
interface RoadNode {
  id: number;
  x: number;
  y: number;
}
```

Conexões:

```ts
interface RoadEdge {
  from: number;
  to: number;

  length: number;
  speedLimit: number;
  capacity: number;
}
```

Isso permite implementar posteriormente:

- pathfinding;
- trânsito;
- transporte público;
- congestionamento.

---

# 24. Traffic

Não simular inicialmente cada carro.

Modelo inicial:

```text
Road capacity
        ↓
Traffic demand
        ↓
Congestion
        ↓
Travel time
        ↓
Happiness
        ↓
Economy
```

A renderização pode mostrar uma quantidade limitada de veículos visuais enquanto a simulação trabalha com agregados.

Exemplo:

```text
SIMULAÇÃO
10.000 viagens

        ↓

RENDERIZAÇÃO
50 veículos visuais
```

---

# 25. Population Model

A população deve ser agrupada por características relevantes.

```ts
interface PopulationGroup {
  size: number;

  income: IncomeLevel;

  education: EducationLevel;

  ageDistribution: AgeDistribution;

  employmentRate: number;

  happiness: number;
}
```

Grupos iniciais:

```text
Low income
Middle income
High income
```

Educação:

```text
None
Basic
Secondary
University
```

---

# 26. Policies

Políticas devem ser dados, não regras hardcoded.

```ts
interface Policy {
  id: string;

  name: string;

  effects: PolicyEffect[];
}
```

Exemplo conceitual:

```text
Política:
"Subsídio para transporte público"

Effects:

PublicTransportUsage +20%
GovernmentExpenses +5000
Traffic -8%
Happiness +3%
```

---

# 27. Modifier System

Um sistema de modificadores permite explicar os efeitos dos sistemas.

```ts
interface Modifier {
  source: string;

  attribute: string;

  value: number;

  duration?: number;
}
```

Exemplo:

```text
Happiness

Base: 70

+5 Hospital
-3 Pollution
+2 Education
-4 Traffic

Final: 70
```

Isso também facilita ferramentas de debug e explicações para o jogador.

---

# 28. Event System

Eventos internos:

```text
BuildingConstructed
BuildingDestroyed
PopulationChanged
TaxChanged
PolicyChanged
PowerShortage
WaterShortage
Bankruptcy
Election
```

Exemplo:

```ts
eventBus.emit({
  type: "POWER_SHORTAGE",
  cityId,
  severity: 0.72
});
```

Outros sistemas podem reagir a eventos sem ficarem fortemente acoplados.

---

# 29. Command System

Toda ação do jogador deve virar um comando.

Fluxo:

```text
Player
  ↓
BuildRoadCommand
  ↓
GameEngine
  ↓
Validation
  ↓
World Mutation
  ↓
Event
```

Exemplo:

```ts
interface BuildRoadCommand {
  type: "BUILD_ROAD";

  start: Position;
  end: Position;
}
```

Outro exemplo:

```ts
interface ZoneAreaCommand {
  type: "ZONE_AREA";

  zone: ZoneType;

  area: Rectangle;
}
```

Benefícios:

- Undo/redo;
- replay;
- logging;
- testes;
- debug;
- futura sincronização.

---

# 30. Input System

Fluxo:

```text
Mouse
Keyboard
Touch
   │
   ▼
Input Manager
   │
   ▼
Commands
```

Exemplo:

```text
Clique no terreno
      ↓
Seleciona tile
      ↓
Tool ativa
      ↓
BuildRoadCommand
      ↓
Game Engine
```

---

# 31. Tools

Ferramentas iniciais:

```text
Select
Road
Bulldoze
Zone
Build
Demolish
Inspect
Paint Terrain
```

Interface:

```ts
interface GameTool {
  onMouseDown(context): void;
  onMouseMove(context): void;
  onMouseUp(context): void;
}
```

Cada ferramenta deve ficar isolada da engine de renderização.

---

# 32. State Management

Separar dois tipos de estado.

## Game State

Pertence à engine:

```text
World
Population
Economy
Buildings
Roads
Simulation
Game Clock
```

## UI State

Pertence ao React:

```text
Selected building
Open panel
Active tool
Modal
Settings
Notification
```

Zustand pode cuidar do estado de UI.

Não criar um único store contendo toda a simulação.

---

# 33. Comunicação Canvas ↔ React

Fluxo:

```text
Canvas
   │
   │ select building #382
   ▼
Game Engine
   │
   ▼
UI Event
   │
   ▼
Zustand
   │
   ▼
React
   │
   ▼
Building Inspector
```

Exemplo de painel:

```text
┌───────────────────────────┐
│ Building                 X│
├───────────────────────────┤
│ 🏭 Factory                │
│                           │
│ Workers       42 / 50     │
│ Production    82%         │
│ Electricity   72%         │
│ Water         91%         │
│                           │
│ Maintenance  $420/month   │
└───────────────────────────┘
```

---

# 34. Save System

Formato inicial:

```ts
interface SaveGame {
  version: number;

  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };

  gameTime: GameDate;

  world: WorldSnapshot;

  population: PopulationSnapshot;

  economy: EconomySnapshot;

  policies: PolicySnapshot;
}
```

Exemplo:

```text
Save Version: 12
```

Quando o modelo mudar:

```text
Version 12
     ↓
Migration
     ↓
Version 13
```

---

# 35. Local Save

Primeiro implementar persistência local.

Preferência:

```text
Game
 │
 ▼
Save Manager
 │
 ▼
IndexedDB
```

Depois:

```text
Save Manager
 │
 ├── IndexedDBProvider
 │
 └── CloudSaveProvider
```

A engine não deve saber onde o save está armazenado.

---

# 36. Backend .NET

Estrutura:

```text
api/
│
├── CityBuilder.Api
├── CityBuilder.Application
├── CityBuilder.Domain
├── CityBuilder.Infrastructure
└── CityBuilder.Tests
```

## Api

Responsabilidades:

```text
HTTP
Controllers
Auth
DTOs
Middleware
```

## Application

Casos de uso:

```text
CreateGame
LoadGame
SaveGame
DeleteGame
ListGames
```

## Domain

Entidades e regras do domínio da persistência:

```text
Game
City
Save
User
```

## Infrastructure

```text
PostgreSQL
Repositories
ORM / SQL
Storage
```

---

# 37. Backend não deve simular a cidade inicialmente

Arquitetura inicial:

```text
Browser
  ↓
Game Simulation
  ↓
Save
  ↓
.NET API
  ↓
PostgreSQL
```

Não:

```text
Browser
  ↓
API
  ↓
Simulate every tick
```

A segunda abordagem só deve ser considerada caso o projeto evolua para multiplayer ou simulação persistente no servidor.

---

# 38. Banco de dados

Modelo inicial:

```text
users

games
├── id
├── user_id
├── name
├── version
├── created_at
└── updated_at

game_saves
├── id
├── game_id
├── version
├── data JSONB
├── created_at
└── updated_at
```

Inicialmente, o save inteiro pode ficar em `JSONB`.

Não transformar cada tile, prédio, árvore e estrada em tabelas relacionais no começo.

---

# 39. Otimização futura de saves

Quando necessário:

```text
game_saves
       │
       ▼
chunks
       │
       ├── chunk 1
       ├── chunk 2
       ├── chunk 3
       └── ...
```

Salvar somente chunks modificados:

```text
Dirty Chunks
```

---

# 40. Game Content

Os valores de conteúdo devem ficar fora do código sempre que possível.

Estrutura:

```text
packages/game-content/

buildings/
├── residential.json
├── commercial.json
├── industrial.json
└── services.json

policies/
├── taxes.json
├── transportation.json
└── immigration.json

terrain/
├── grass.json
├── forest.json
└── water.json
```

---

# 41. Exemplo de prédio

```json
{
  "id": "residential_small_01",
  "type": "residential",

  "size": {
    "width": 2,
    "height": 2
  },

  "cost": 1200,

  "capacity": {
    "population": 12
  },

  "demands": {
    "electricity": 4,
    "water": 3
  },

  "effects": {
    "taxIncome": 30
  }
}
```

O código interpreta a definição.

---

# 42. Modding futuro

A arquitetura baseada em dados permite futuramente:

```text
Game Content
      │
      ├── Official
      ├── Custom
      └── Mods
```

Modding não deve ser prioridade do MVP.

---

# 43. Performance

Estratégia:

```text
                    WORLD
                      │
                ┌─────┴─────┐
                │   CHUNKS  │
                └─────┬─────┘
                      │
                 CULLING
                      │
             ┌────────┴────────┐
             │                 │
          Visible           Hidden
             │
             ▼
          RENDER
```

O renderer deve utilizar:

- viewport culling;
- chunk culling;
- sprite caching;
- asset caching;
- offscreen rendering quando fizer sentido;
- redraw apenas quando necessário;
- estruturas espaciais.

---

# 44. Asset Manager

Carregar assets uma única vez.

```text
AssetManager
     │
     ├── buildings
     ├── roads
     ├── terrain
     └── vehicles
```

Evitar carregar e descartar imagens a cada renderização.

---

# 45. Spatial Indexing

Para encontrar rapidamente entidades próximas:

```text
SpatialGrid

┌───┬───┬───┬───┐
│   │ B │   │   │
├───┼───┼───┼───┤
│ A │   │ C │   │
├───┼───┼───┼───┤
│   │   │   │ D │
└───┴───┴───┴───┘
```

Aplicações:

- seleção;
- colisão;
- prédios próximos;
- cobertura de serviços;
- influência;
- busca espacial.

---

# 46. Simulation Scheduling

Nem todos os sistemas precisam executar no mesmo intervalo.

Exemplo:

```text
60 FPS
Render

20 Hz
Game simulation

1 Hz
Traffic

10 sec
Economy

1 day
Population

1 month
Long-term statistics
```

Isso reduz o processamento e aproxima o modelo de uma simulação em diferentes escalas temporais.

---

# 47. Ciclo econômico

Modelo conceitual:

```text
              MONTH START
                   │
                   ▼
            Population
                   │
                   ▼
             Employment
                   │
                   ▼
               Income
                   │
                   ▼
             Consumption
                   │
                   ▼
              Businesses
                   │
                   ▼
                 GDP
                   │
                   ▼
                Taxes
                   │
                   ▼
            Government
                   │
                   ▼
          Public Services
                   │
                   ▼
              Happiness
                   │
                   ▼
              Migration
                   │
                   └──────► Population
```

Esse loop cria feedbacks que tornam a simulação dinâmica.

---

# 48. Debug Mode

Criar um modo de debug ativável, por exemplo, com `F1`.

Mostrar:

```text
FPS: 59
Simulation: 20 TPS
Entities: 14,382
Visible chunks: 18
Buildings: 4,231
Population: 82,341
```

Overlays:

```text
[ ] Grid
[ ] Chunk boundaries
[ ] Electricity
[ ] Water
[ ] Traffic
[ ] Pollution
[ ] Land value
[ ] Happiness
```

---

# 49. Heatmaps

O renderer deve permitir diferentes visualizações:

```text
Normal
Pollution
Land Value
Crime
Traffic
Happiness
Education
Healthcare
```

Arquitetura:

```text
OverlayRenderer
       │
       ├── PollutionOverlay
       ├── CrimeOverlay
       ├── TrafficOverlay
       ├── LandValueOverlay
       └── HappinessOverlay
```

---

# 50. Simulation Explainability

Um recurso importante é permitir explicar por que uma entidade possui determinado resultado.

Exemplo:

```text
Por que este prédio está abandonado?

Abandonment Score: 72%

+35% Unemployment
+18% Low land value
+12% Pollution
+10% High taxes
-3% Education

Result: 72%
```

Para isso, os sistemas devem registrar os fatores que contribuíram para cada indicador importante.

---

# 51. Testes

## Unit tests

Exemplo:

```ts
describe("EconomySystem", () => {
  it("should calculate tax revenue", () => {
    // ...
  });
});
```

## Simulation tests

Exemplo:

```text
Given:

Population = 1000
Employment = 800
Tax = 10%

When:

One month passes

Then:

Government revenue = expected value
```

## Invariants

Garantir que:

```text
Population >= 0

Money is never NaN

Electricity consumption >= 0

Building capacity >= population assigned

Road capacity >= 0
```

---

# 52. Deterministic Random

Não espalhar `Math.random()` pela engine.

Criar:

```text
RandomGenerator
```

e controlar uma seed:

```text
Seed: 123456
```

Assim:

```text
Seed 123456
    ↓
Simulation
    ↓
Resultado reproduzível
```

Benefícios:

- testes;
- debug;
- reprodução de bugs;
- replay;
- comparação de versões da engine.

---

# 53. Replay

Com Commands + Seed + Simulation determinística:

```text
Save
 │
 ├── Initial State
 ├── Seed
 └── Commands
```

Exemplo:

```text
Game
 ↓
BuildRoad
 ↓
BuildHouse
 ↓
BuildFactory
 ↓
ChangeTax
 ↓
...
```

A cidade pode ser reproduzida a partir do estado inicial e da sequência de comandos.

---

# 54. Roadmap

## Fase 0 — Foundation

```text
Next.js
TypeScript
Canvas
GameLoop
Camera
Input
```

Objetivo:

> mapa vazio navegável.

---

## Fase 1 — World

```text
Grid
Tiles
Chunks
Terrain
Selection
```

Objetivo:

> mapa com terreno.

---

## Fase 2 — Construction

```text
Road
Zone
Building
Bulldoze
```

Objetivo:

> construir uma cidade básica.

---

## Fase 3 — Simulation

```text
Population
Housing
Jobs
Economy
Taxes
```

Objetivo:

> cidade começa a viver.

---

## Fase 4 — Infrastructure

```text
Electricity
Water
Road network
Services
```

Objetivo:

> infraestrutura passa a importar.

---

## Fase 5 — Traffic

```text
Road graph
Pathfinding
Traffic demand
Congestion
```

---

## Fase 6 — Society

```text
Income
Education
Health
Crime
Pollution
Happiness
Migration
```

---

## Fase 7 — Policies

```text
Policies
Taxes
Government
Regulations
Public spending
```

---

## Fase 8 — Save

```text
IndexedDB
Save versioning
Cloud save
.NET API
PostgreSQL
```

---

## Fase 9 — Polish

```text
Animations
Particles
Audio
UI
Tutorial
Notifications
Statistics
Charts
```

---

# 55. Arquitetura final

```text
                           CITY BUILDER
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
             WEB                                API
              │                                   │
       ┌──────┴───────┐                    ┌──────┴──────┐
       │              │                    │             │
     React          Canvas              Application    Auth
       │              │                    │             │
       │         Renderer                 │             │
       │              │                    │             │
       └──────┬───────┘                    │             │
              │                            │             │
              ▼                            ▼             │
          Game Core                   Domain             │
              │                            │             │
      ┌───────┼────────┐                   │             │
      │       │        │                   │             │
    World  Commands  Events                │             │
      │       │        │                   │             │
      └───────┴────────┘                   │             │
              │                            │             │
              ▼                            │             │
        SIMULATION                         │             │
              │                            │             │
      ┌───────┼──────────────┐             │             │
      │       │       │      │             │             │
  Economy Population Traffic Services      │             │
      │       │       │      │             │             │
      └───────┴───────┴──────┘             │             │
              │                            │             │
              └────────── Save ────────────┘             │
                                           │
                                           ▼
                                      PostgreSQL
```

---

# 56. Princípios arquiteturais

## Separação de responsabilidades

```text
Presentation
    ↓
Game Engine
    ↓
Persistence
```

## Independência

O Game Engine:

- não conhece React;
- não conhece Next.js;
- não conhece Canvas;
- não conhece HTTP;
- não conhece PostgreSQL.

## Dados dirigem conteúdo

Prédios, políticas e demais elementos configuráveis devem preferencialmente ser definidos por dados.

## Simulação independente

A simulação deve ser executável sem interface gráfica.

Isso permite:

- testes automatizados;
- benchmarks;
- ferramentas de debug;
- simulação headless;
- futura migração para servidor, se necessário.

---

# 57. Primeiro milestone recomendado

Não começar pelo backend.

O primeiro objetivo técnico deve ser:

```text
Mapa 64 × 64
       +
Camera
       +
Pan
       +
Zoom
       +
Game Loop
       +
Fixed Timestep
       +
Seleção de Tiles
       +
Sistema de Tools
       +
Construção de Estrada
```

Quando isso funcionar:

```text
┌───────────────────────────────────────┐
│                                       │
│       🌳     🌳                       │
│             ═══════                   │
│       🏠    ║                         │
│             ║      🏠                 │
│             ║                         │
│       🌳    ═══════                   │
│                                       │
└───────────────────────────────────────┘

         [Road Tool]
```

A partir desse ponto, a engine possui uma fundação real.

---

# 58. Ordem de implementação sugerida

```text
01. Monorepo
02. Next.js
03. Canvas
04. Game Core
05. Game Loop
06. Fixed Timestep
07. Camera
08. Input System
09. World
10. Tile
11. Chunk
12. Renderer
13. Asset Manager
14. Tools
15. Command System
16. Road
17. Building
18. Zones
19. Population
20. Economy
21. Taxes
22. Electricity
23. Water
24. Services
25. Traffic
26. Society
27. Policies
28. Save Manager
29. IndexedDB
30. .NET API
31. PostgreSQL
32. Cloud Save
33. Debug Tools
34. Heatmaps
35. Polish
```

---

# 59. Visão do projeto

O objetivo não é simplesmente criar um clone de Citystate.

O projeto deve funcionar como:

```text
                CITY BUILDER
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   GAME ENGINE   ALGORITHMS   BACKEND
        │            │            │
        ▼            ▼            ▼
   Simulation    Pathfinding    .NET
   Canvas        Graphs         PostgreSQL
   Systems       Spatial        Docker
   Commands      Optimization   Architecture
```

O resultado será simultaneamente:

- um city builder jogável;
- uma mini game engine;
- um simulador econômico;
- um laboratório de algoritmos;
- um projeto avançado de TypeScript;
- um projeto de arquitetura .NET;
- um exercício de performance web;
- um projeto de portfólio.

---

# 60. Decisão arquitetural central

A regra mais importante do projeto é:

> **O Game Engine não deve saber que React ou Canvas existem.**

E também:

> **A simulação não deve depender do backend.**

Isso permite trocar:

```text
Canvas 2D
   ↓
WebGL
   ↓
WebGPU
```

sem reescrever a simulação.

Também permite trocar:

```text
Next.js
   ↓
Outra interface
```

sem reescrever o jogo.

A arquitetura final deve manter o núcleo do jogo isolado de apresentação e persistência.
