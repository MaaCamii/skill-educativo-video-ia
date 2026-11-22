import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Posiciones base (en %) para hasta 4 emojis flotantes, repartidas para no
// chocar con las burbujas (arriba) ni con los subtítulos (abajo-centro).
const SPOTS = [
  { left: "12%", top: "26%" },
  { left: "78%", top: "22%" },
  { left: "16%", top: "52%" },
  { left: "80%", top: "50%" },
];

export const FloatingEmojis: React.FC<{ emojis: string[] }> = ({ emojis }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const list = (emojis || []).slice(0, 4);

  return (
    <>
      {list.map((e, i) => {
        const spot = SPOTS[i % SPOTS.length];
        const bob = Math.sin(t * 1.2 + i) * 14;
        const drift = Math.cos(t * 0.7 + i) * 8;
        const rot = Math.sin(t * 0.6 + i) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: spot.left,
              top: spot.top,
              transform: `translate(${drift}px, ${bob}px) rotate(${rot}deg)`,
              fontSize: 96,
              opacity: 0.22,
              filter: "saturate(1.1)",
            }}
          >
            {e}
          </div>
        );
      })}
    </>
  );
};
