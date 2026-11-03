import type { VelocidadeDoJogo } from "@city-builder/game-core";

export type AtalhoDoRelogio = "alternar-pausa" | VelocidadeDoJogo;

export function interpretarAtalhoDoRelogio(tecla: string): AtalhoDoRelogio | null {
  if (tecla === " " || tecla === "Spacebar") {
    return "alternar-pausa";
  }
  if (tecla === "1") {
    return 1;
  }
  if (tecla === "2") {
    return 2;
  }
  if (tecla === "4") {
    return 4;
  }
  return null;
}
