import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { Palette } from "../palette";
import type { Word } from "../data";

type Line = { words: Word[]; startS: number; endS: number };

function chunkLines(words: Word[], maxWords = 5, maxChars = 28): Line[] {
  const lines: Line[] = [];
  let cur: Word[] = [];
  let chars = 0;
  for (const w of words) {
    const wlen = w.text.length + 1;
    if (cur.length && (cur.length >= maxWords || chars + wlen > maxChars)) {
      lines.push({ words: cur, startS: cur[0].startS, endS: cur[cur.length - 1].endS });
      cur = [];
      chars = 0;
    }
    cur.push(w);
    chars += wlen;
  }
  if (cur.length) {
    lines.push({ words: cur, startS: cur[0].startS, endS: cur[cur.length - 1].endS });
  }
  return lines;
}

export const Subtitles: React.FC<{ words: Word[]; paleta: Palette }> = ({
  words,
  paleta,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const lines = useMemo(() => chunkLines(words || []), [words]);
  if (!lines.length) return null;

  // Línea activa: la última cuyo inicio ya pasó (con pequeño colchón).
  let active = lines[0];
  for (const ln of lines) {
    if (ln.startS <= t + 0.08) active = ln;
  }

  // Aparición suave de la franja al empezar la escena.
  const bandOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "13%",
        display: "flex",
        justifyContent: "center",
        padding: "0 70px",
        opacity: bandOpacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 18px",
          maxWidth: 940,
          background: "rgba(8,11,24,0.52)",
          borderRadius: 28,
          padding: "22px 30px",
          backdropFilter: "blur(2px)",
        }}
      >
        {active.words.map((w, i) => {
          const spoken = t >= w.endS - 0.02;
          const current = t >= w.startS - 0.02 && t < w.endS - 0.02;
          const color = current
            ? paleta.primario
            : spoken
            ? paleta.texto
            : "rgba(255,255,255,0.55)";
          return (
            <span
              key={i}
              style={{
                color,
                fontSize: 60,
                fontWeight: 800,
                lineHeight: 1.18,
                textShadow: "0 3px 12px rgba(0,0,0,0.6)",
                transform: current ? "translateY(-2px)" : "none",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
