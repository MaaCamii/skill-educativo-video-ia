import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { Palette } from "../palette";

type Pos =
  | "top"
  | "bottom"
  | "center-left"
  | "center-right"
  | "top-left"
  | "top-right";

const POS: Record<Pos, React.CSSProperties> = {
  top: { top: "10%", left: 0, right: 0, alignItems: "center" },
  bottom: { top: "62%", left: 0, right: 0, alignItems: "center" },
  "center-left": { top: "38%", left: "6%", alignItems: "flex-start" },
  "center-right": { top: "38%", right: "6%", alignItems: "flex-end" },
  "top-left": { top: "5%", left: "5%", alignItems: "flex-start" },
  "top-right": { top: "5%", right: "5%", alignItems: "flex-end" },
};

// Color del chip según el tipo de burbuja.
function chipColors(tipo: string, paleta: Palette) {
  switch (tipo) {
    case "concepto":
      return { bg: paleta.primario, fg: "#111318", border: "transparent" };
    case "idea":
      return { bg: paleta.acento, fg: "#0B1A10", border: "transparent" };
    case "dato":
      return { bg: paleta.burbuja, fg: paleta.primario, border: paleta.primario };
    case "fuente":
      return { bg: "rgba(10,14,28,0.72)", fg: paleta.texto, border: "rgba(255,255,255,0.25)" };
    default:
      return { bg: paleta.burbuja, fg: paleta.texto, border: "transparent" };
  }
}

export const Bubble: React.FC<{
  bubble: any;
  paleta: Palette;
  sceneDur: number;
  stackIndex?: number;
}> = ({ bubble, paleta, sceneDur, stackIndex = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tipo = bubble?.tipo || "concepto";
  const posKey: Pos = (bubble?.posicion as Pos) || "top";
  const entra = (bubble?.entraEnS ?? 0.3) * fps;
  const dura = (bubble?.duraS ?? Math.min(3, sceneDur)) * fps;
  const sale = entra + dura;

  // Antes de entrar: no renderiza.
  if (frame < entra - 1) return null;

  const enterP = spring({
    frame: frame - entra,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 140 },
  });
  const scale = interpolate(enterP, [0, 1], [0.6, 1]);
  const exitOpacity = interpolate(frame, [sale - 10, sale], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(enterP, exitOpacity);
  if (opacity <= 0.01 && frame > entra) return null;

  const c = chipColors(tipo, paleta);
  const isSmall = tipo === "fuente";
  const base = POS[posKey] || POS.top;

  const topOffset =
    typeof base.top === "string" && stackIndex > 0
      ? `calc(${base.top} + ${stackIndex * 84}px)`
      : base.top;

  return (
    <div
      style={{
        position: "absolute",
        ...base,
        top: topOffset,
        display: "flex",
        flexDirection: "column",
        padding: "0 44px",
        opacity,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: isSmall ? 10 : 16,
          background: c.bg,
          color: c.fg,
          border: `2px solid ${c.border}`,
          borderRadius: 999,
          padding: isSmall ? "10px 20px" : "16px 30px",
          fontSize: isSmall ? 30 : 42,
          fontWeight: 800,
          lineHeight: 1.1,
          boxShadow: "0 12px 34px rgba(0,0,0,0.35)",
          transform: `scale(${scale})`,
          transformOrigin:
            base.alignItems === "flex-end"
              ? "right center"
              : base.alignItems === "flex-start"
              ? "left center"
              : "center",
          maxWidth: 820,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        }}
      >
        {bubble?.emoji ? (
          <span style={{ fontSize: isSmall ? 34 : 48 }}>{bubble.emoji}</span>
        ) : null}
        <span>{bubble?.texto}</span>
      </div>
    </div>
  );
};
