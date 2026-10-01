# US-101: Navegar o mapa com a câmara

> **Origem:** Épico E1 — Mundo navegável
> **Status:** Em refinamento
> **Estimativa preliminar:** 5 SP (~26h, incluindo buffer)

## 1. Narrativa

**Como** jogador,
**quero** deslocar e aproximar a vista do mapa,
**para que** consiga explorar o terreno inteiro sem ficar preso a um enquadramento fixo.

## 2. Contexto e justificativa

O primeiro valor visível do city builder é um mundo que se pode percorrer. Sem câmara, o mapa 64×64 não cabe no ecrã e não há como apontar ferramentas no sítio certo.

Esta US estabelece a câmara como objecto independente do mundo (arquitetura, secção 11): pan e zoom alteram a vista, não as tiles. Também é a ponte entre coordenadas de ecrã e coordenadas de mundo, que as US de seleção e construção vão reutilizar.

Métrica de sucesso: o jogador consegue visitar os quatro cantos do mapa e voltar ao centro sem recarregar a página, com a simulação a continuar a correr em timestep fixo.

## 3. Regras de negócio

- RN1: A câmara é independente do mundo — pan/zoom não movem nem reescalam tiles no estado do jogo.
- RN2: Pan altera `x` e `y` da câmara; zoom altera o factor de escala da vista.
- RN3: A transformação ecrã → mundo é contínua e invertível para qualquer zoom permitido (necessário para cliques futuros).
- RN4: 🔶 Zoom mínimo **0,5×** e máximo **4×**. Pedidos além do limite são ignorados; a vista permanece no limite.
- RN5: 🔶 Pan: arrastar com o **botão do meio** do rato (fallback: botão direito). Zoom: **roda do rato**, centrado no cursor.
- RN6: Pan e zoom funcionam com o jogo pausado; a velocidade do relógio não altera a câmara.

## 4. Critérios de aceitação (Gherkin)

### CA1: Percorrer o mapa com pan
```gherkin
Dado que o mapa está visível no canvas
E a câmara está no centro do mapa
Quando arrasto com o botão do meio do rato 200 pixéis para a direita
Então a vista desloca-se na direcção oposta ao arrasto
E tiles que estavam no bordo esquerdo passam a ficar visíveis
E o estado das tiles no mundo permanece inalterado
```

### CA2: Aproximar e afastar com zoom
```gherkin
Dado que o zoom actual é 1×
Quando rolo a roda do rato para a frente sobre um ponto do mapa
Então o zoom aumenta
E o ponto sob o cursor permanece aproximadamente no mesmo sítio do ecrã
Quando rolo a roda no sentido contrário
Então o zoom diminui em direcção a 1×
```

### CA3: Limite de zoom não parte a vista
```gherkin
Dado que o zoom está no máximo permitido (4×)
Quando continuo a rolar a roda no sentido de aproximar
Então o zoom permanece em 4×
E o canvas continua a responder a pan
```

### CA4: Câmara não depende da velocidade do relógio
```gherkin
Dado que o relógio do jogo está em pausa
Quando faço pan e zoom
Então a vista actualiza no mesmo frame de interacção
E o tempo de jogo permanece pausado
```

### CA5: Zoom no limite inferior
```gherkin
Dado que o zoom está no mínimo permitido (0,5×)
Quando continuo a rolar a roda no sentido de afastar
Então o zoom permanece em 0,5×
E os quatro cantos do mapa 64×64 continuam alcançáveis com pan
```

## 5. Fora do escopo

- Selecção de tiles (US-103).
- Renderização de tipos de terreno (US-102); um mapa placeholder (cor única ou grelha) basta para validar a câmara.
- Rotação isométrica / câmara 3D.
- Controlos tácteis de pinch-zoom.
- Mini-mapa.

## 6. Dependências

- **Bloqueia:** US-102, US-103
- **Bloqueada por:** US-001 (canvas hospedado), US-002 (GameLoop / timestep fixo)
- **Relacionada:** US-104 (overlay de debug pode mostrar posição/zoom da câmara)

## 7. Requisitos não-funcionais

- **Performance:** pan/zoom a 60 FPS de render no mapa 64×64, sem o React re-renderizar o mundo.
- **Segurança/Privacidade:** não aplicável (sem dados pessoais).
- **Acessibilidade:** ❓ atalho de teclado para pan (ex.: WASD) não está decidido; o rato é o caminho mínimo. HUD futuro não entra aqui.
- **Observabilidade:** posição e zoom da câmara devem ser consultáveis pelo modo debug (US-104).
- **Internacionalização:** sem copy de UI nesta US.

## 8. Definição de Pronto (DoR — entrada do sprint)

- [ ] Narrativa, critérios e regras revistos com equipa
- [ ] Bindings de rato (RN5) confirmados ou alterados
- [ ] Limites de zoom (RN4) confirmados
- [ ] Dependências mapeadas e desbloqueadas (US-001 e US-002 concluídas)
- [ ] Estimativa consensual da equipa

## 9. Definição de Concluído (DoD — saída da US)

- [ ] Código revisto e *merged* na branch principal
- [ ] Testes automatizados da transformação ecrã ↔ mundo e dos limites de zoom a passar
- [ ] Critérios de aceitação validados no browser (pan, zoom, pausa)
- [ ] Sem o React a possuir o estado da câmara como fonte de verdade do mundo
- [ ] Sem regressões nas suites existentes
- [ ] *Feature flag* não aplicável

## 10. Notas e suposições

- 🔶 Bindings de pan/zoom (RN5) e limites 0,5×–4× (RN4) são proposta para o primeiro jogável; o refinement pode trocar sem mudar a narrativa.
- 🔶 Botão esquerdo fica livre para selecção e ferramentas (US-103+).
- ❓ WASD / setas para pan entram neste sprint ou ficam para polish?
- ❓ Comportamento do zoom em trackpad (pinch) no Windows: ignorar nesta US?
