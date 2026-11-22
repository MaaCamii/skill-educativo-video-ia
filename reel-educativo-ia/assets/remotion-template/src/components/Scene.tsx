import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Background } from "./Background";
import { Subtitles } from "./Subtitles";
import { Bubble } from "./Bubble";
import { FloatingEmojis } from "./FloatingEmojis";
import type { Palette } from "../palette";
import type { TimelineScene } from "../data";

export const SceneView: React.FC<{
  esc: any;
  tl: TimelineScene;
  paleta: Palette;
}> = ({ esc, tl, paleta }) => {
  const visual = esc?.visual || { tipo: "formas", estilo: "neutro" };
  const burbujas: any[] = esc?.burbujas || [];
  const referencias: any[] = esc?.referencias || [];
  const emojis: string[] = esc?.emojisFlotantes || [];

  return (
    <AbsoluteFill>
      <Background visual={visual} paleta={paleta} />

      {/* Audio de la escena (solo si ya se generó la voz) */}
      {tl.audio ? <Audio src={staticFile(tl.audio)} /> : null}

      {/* Emojis de apoyo, de fondo */}
      <FloatingEmojis emojis={emojis} />

      {/* Burbujas de concepto/idea/dato */}
      {burbujas.map((b, i) => (
        <Bubble key={"b" + i} bubble={b} paleta={paleta} sceneDur={tl.durationS} />
      ))}

      {/* Referencias/fuentes (se muestran casi toda la escena, sobrias) */}
      {referencias.map((r, i) => (
        <Bubble
          key={"r" + i}
          bubble={{
            texto: r.texto,
            emoji: r.emoji || "📌",
            tipo: "fuente",
            posicion: "top-right",
            entraEnS: 0.5 + i * 0.3,
            duraS: Math.max(1, tl.durationS - 0.5),
          }}
          paleta={paleta}
          sceneDur={tl.durationS}
          stackIndex={i}
        />
      ))}

      {/* Subtítulos sincronizados (karaoke) */}
      <Subtitles words={tl.words} paleta={paleta} />
    </AbsoluteFill>
  );
};
