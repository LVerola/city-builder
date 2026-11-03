export type SuperficieComContexto2d = {
  getContext(contexto: "2d"): CanvasRenderingContext2D | null;
};

export function obterContexto2d(
  superficie: SuperficieComContexto2d | null,
): CanvasRenderingContext2D | null {
  if (superficie === null) {
    return null;
  }

  return superficie.getContext("2d");
}
