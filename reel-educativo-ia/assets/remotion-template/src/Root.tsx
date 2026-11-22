import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { loadReelData } from "./data";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel as any}
      // Valores por defecto; calculateMetadata los ajusta con los datos reales.
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ sb: null, timeline: null } as any}
      calculateMetadata={async ({ props }) => {
        const { sb, timeline } = await loadReelData();
        const fps = sb?.meta?.fps ?? 30;
        const width = sb?.meta?.ancho ?? 1080;
        const height = sb?.meta?.alto ?? 1920;
        const durationInFrames = Math.max(
          1,
          Math.round((timeline.totalDurationS || 1) * fps)
        );
        return {
          durationInFrames,
          fps,
          width,
          height,
          props: { ...props, sb, timeline },
        };
      }}
    />
  );
};
