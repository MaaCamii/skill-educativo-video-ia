// Paleta por defecto. El storyboard puede sobrescribir cualquier color en `paleta`.
export const DEFAULT_PALETTE = {
  fondo: "#0B1020",
  fondo2: "#161E3A",
  texto: "#FFFFFF",
  primario: "#FFD54A",
  acento: "#4ADE80",
  burbuja: "#1F2A4D",
};

export type Palette = typeof DEFAULT_PALETTE;

export const mergePalette = (p?: Partial<Palette>): Palette => ({
  ...DEFAULT_PALETTE,
  ...(p || {}),
});
