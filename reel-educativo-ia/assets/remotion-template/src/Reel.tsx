import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { mergePalette } from "./palette";
import { SceneView } from "./components/Scene";
import type { Timeline } from "./data";

export const Reel: React.FC<{ sb: any; timeline: Timeline }> = ({
  sb,
  timeline,
}) => {
  const { fps } = useVideoConfig();
  const paleta = mergePalette(sb?.paleta);
  const escenasSb: any[] = sb?.escenas || [];

  return (
    <AbsoluteFill style={{ backgroundColor: paleta.fondo }}>
      {timeline.escenas.map((tl, i) => {
        const esc =
          escenasSb.find((e) => (e?.id || "") === tl.id) || escenasSb[i] || {};
        const from = Math.round(tl.startS * fps);
        const dur = Math.max(1, Math.round(tl.durationS * fps));
        return (
          <Sequence key={tl.id} from={from} durationInFrames={dur} name={tl.id}>
            <SceneView esc={esc} tl={tl} paleta={paleta} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
