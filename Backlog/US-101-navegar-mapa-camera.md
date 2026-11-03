# US-101: Navegar o mapa com a câmera

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** deslocar e aproximar a vista do mapa,
**para que** consiga explorar o terreno inteiro sem ficar preso a um enquadramento fixo.

## 2. Contexto e justificativa

O primeiro valor visível do city builder é um mundo que se pode percorrer. Sem câmera, o mapa 64×64 não cabe na tela e não há como apontar ferramentas no lugar certo.

Esta US estabelece a câmera como objeto independente do mundo (arquitetura, seção 11): pan e zoom alteram a vista, não as tiles. Também é a ponte entre coordenadas de tela e coordenadas de mundo, que as US de seleção e construção vão reutilizar.

Métrica de sucesso: o jogador consegue visitar os quatro cantos do mapa e voltar ao centro sem recarregar a página, com a simulação continuando a rodar em timestep fixo.

## 3. Regras de negócio

- RN1: A câmera é independente do mundo — pan/zoom não movem nem reescalam tiles no estado do jogo.
- RN2: Pan altera `x` e `y` da câmera; zoom altera o fator de escala da vista.
- RN3: A transformação tela → mundo é contínua e invertível para qualquer zoom permitido (necessário para cliques futuros).
- RN4: Zoom mínimo **0,5×** e máximo **4×**. Pedidos além do limite são ignorados; a vista permanece no limite.
- RN5: Pan com mouse: arrastar com o **botão do meio** (fallback: botão direito). Zoom: **roda do mouse**, centrado no cursor.
- RN6: Pan e zoom funcionam com o jogo pausado; a velocidade do relógio não altera a câmera.
- RN7: O **botão esquerdo** não faz pan — fica livre para seleção e ferramentas (US-103+).
- RN8: Com o **canvas focado**, **WASD** faz pan. **Setas** fazem pan **só se não houver tile selecionada**; com seleção, as setas pertencem à US-103.
- RN9: **Pinch** no trackpad (Windows) faz zoom, centrado no cursor, com os mesmos limites de RN4. Não se ignora o gesto nesta US.

## 4. Critérios de aceitação (Gherkin)

### CA1: Percorrer o mapa com pan
```gherkin
Dado que o mapa está visível no canvas
E a câmera está no centro do mapa
Quando arrasto com o botão do meio do mouse 200 pixels para a direita
Então a vista se desloca na direção oposta ao arrasto
E tiles que estavam na borda esquerda passam a ficar visíveis
E o estado das tiles no mundo permanece inalterado
```

### CA2: Aproximar e afastar com zoom
```gherkin
Dado que o zoom atual é 1×
Quando rolo a roda do mouse para a frente sobre um ponto do mapa
Então o zoom aumenta
E o ponto sob o cursor permanece aproximadamente no mesmo lugar da tela
Quando rolo a roda no sentido contrário
Então o zoom diminui em direção a 1×
```

### CA3: Limite de zoom não parte a vista
```gherkin
Dado que o zoom está no máximo permitido (4×)
Quando continuo a rolar a roda no sentido de aproximar
Então o zoom permanece em 4×
E o canvas continua a responder a pan
```

### CA4: Câmera não depende da velocidade do relógio
```gherkin
Dado que o relógio do jogo está em pausa
Quando faço pan e zoom
Então a vista atualiza no mesmo frame de interação
E o tempo de jogo permanece pausado
```

### CA5: Zoom no limite inferior
```gherkin
Dado que o zoom está no mínimo permitido (0,5×)
Quando continuo a rolar a roda no sentido de afastar
Então o zoom permanece em 0,5×
E os quatro cantos do mapa 64×64 continuam alcançáveis com pan
```

### CA6: Pan por teclado
```gherkin
Dado que o canvas tem foco
E nenhuma tile está selecionada
Quando pressiono D ou Seta direita
Então a vista faz pan (o mundo se desloca)
Quando uma tile está selecionada
E pressiono W ou A ou S ou D
Então a vista faz pan
E a tile selecionada não muda (WASD nunca move a seleção)
```

### CA7: Pinch no trackpad
```gherkin
Dado que o zoom atual é 1×
E o canvas tem foco
Quando faço pinch de aproximar no trackpad
Então o zoom aumenta dentro de 0,5×–4×
E o ponto sob o cursor permanece aproximadamente no mesmo lugar da tela
Quando faço pinch de afastar já no mínimo
Então o zoom permanece em 0,5×
```

## 5. Fora do escopo

- Seleção de tiles e movimento da seleção com setas quando há tile selecionada (US-103).
- Renderização de tipos de terreno (US-102); um mapa placeholder (cor única ou grade) basta para validar a câmera.
- Rotação isométrica / câmera 3D.
- Mini-mapa.
- Touch em tela tátil de celular (pinch de trackpad Windows entra; touch-screen não).

## 6. Dependências

- **Bloqueia:** US-102, US-103
- **Bloqueada por:** US-001 (canvas hospedado), US-002 (GameLoop / timestep fixo)
- **Relacionada:** US-104 (overlay mostra posição/zoom da câmera)

## 7. Requisitos não-funcionais

- **Performance:** pan/zoom a 60 FPS de render no mapa 64×64, sem o React re-renderizar o mundo.
- **Segurança/Privacidade:** não aplicável (sem dados pessoais).
- **Acessibilidade:** pan por teclado (WASD; setas sem seleção) com o canvas focado, além do mouse.
- **Observabilidade:** posição e zoom da câmera consultáveis pelo modo debug (US-104).
- **Internacionalização:** sem copy de UI nesta US.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [x] Narrativa, critérios e regras revistos (refinement 2026-11-03)
- [x] Bindings: meio/direito = pan; roda = zoom; esquerdo livre
- [x] Zoom 0,5×–4×
- [x] WASD pan; setas pan só sem seleção; pinch de trackpad nesta US
- [ ] Estimativa consensual da equipe

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes automatizados da transformação tela ↔ mundo e dos limites de zoom a passar
- [ ] Critérios de aceitação validados no browser (mouse, WASD, pinch, pausa)
- [ ] Sem o React a possuir o estado da câmera como fonte de verdade do mundo
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- Zoom **0,5×–4×**, pan com botão do meio (fallback direito), zoom na roda: proposta **aceito**.
- Botão esquerdo livre para a US-103: **aceito**.
- Teclado neste sprint: **WASD** = pan. **Setas** = pan se não houver seleção; com seleção, US-103.
- Pinch no trackpad **entra nesta US** (não se ignora). Touch-screen de celular continua fora.
