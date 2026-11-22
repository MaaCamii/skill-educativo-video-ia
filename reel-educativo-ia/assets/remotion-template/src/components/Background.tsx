import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import type { Palette } from "../palette";

// Tratamiento por estilo: color y posición del "blob" de acento.
const ESTILOS: Record<string, { hue: string; glyph?: string }> = {
  pregunta: { hue: "acento", glyph: "?" },
  dato: { hue: "primario", glyph: "" },
  concepto: { hue: "primario", glyph: "" },
  cierre: { hue: "acento", glyph: "" },
  neutro: { hue: "primario", glyph: "" },
};

const cover: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export const Background: React.FC<{ visual: any; paleta: Palette }> = ({
  visual,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const tipo = visual?.tipo || "formas";

  // Imagen o video de fondo con overlay para legibilidad.
  if (tipo === "imagen" && visual?.fuente) {
    return (
      <AbsoluteFill style={{ backgroundColor: paleta.fondo }}>
        <Img src={staticFile(visual.fuente)} style={cover} />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </AbsoluteFill>
    );
  }
  if (tipo === "video" && visual?.fuente) {
    return (
      <AbsoluteFill style={{ backgroundColor: paleta.fondo }}>
        <OffthreadVideo src={staticFile(visual.fuente)} muted style={cover} />
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </AbsoluteFill>
    );
  }

  // Motion graphics por código ("formas").
  const estilo = ESTILOS[visual?.estilo] || ESTILOS.neutro;
  const acc = (paleta as any)[estilo.hue] || paleta.primario;

  // Dos blobs que se desplazan suavemente.
  const bx1 = interpolate(Math.sin(t * 0.4), [-1, 1], [width * 0.15, width * 0.35]);
  const by1 = interpolate(Math.cos(t * 0.33), [-1, 1], [height * 0.2, height * 0.32]);
  const bx2 = interpolate(Math.cos(t * 0.25), [-1, 1], [width * 0.6, width * 0.8]);
  const by2 = interpolate(Math.sin(t * 0.3), [-1, 1], [height * 0.62, height * 0.78]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${paleta.fondo} 0%, ${paleta.fondo2} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(420px 420px at ${bx1}px ${by1}px, ${acc}22, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(520px 520px at ${bx2}px ${by2}px, ${paleta.acento}18, transparent 70%)`,
        }}
      />
      {estilo.glyph ? (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: 0.06,
          }}
        >
          <span style={{ fontSize: 900, fontWeight: 900, color: paleta.texto }}>
            {estilo.glyph}
          </span>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
