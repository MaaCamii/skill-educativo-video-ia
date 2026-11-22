import { staticFile } from "remotion";

// Carga el storyboard y la línea de tiempo desde public/.
// Si timeline.json no existe todavía (aún no se generó la voz), construye una
// línea de tiempo estimada para poder previsualizar con subtítulos, sin audio.

export type Word = { text: string; startS: number; endS: number };
export type TimelineScene = {
  id: string;
  audio: string | null;
  startS: number;
  durationS: number;
  words: Word[];
};
export type Timeline = {
  fps: number;
  totalDurationS: number;
  escenas: TimelineScene[];
  fallback?: boolean;
};

async function fetchJson(file: string): Promise<any | null> {
  try {
    const res = await fetch(staticFile(file));
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export function buildFallbackTimeline(sb: any): Timeline {
  const fps = sb?.meta?.fps ?? 30;
  let cursor = 0;
  const escenas: TimelineScene[] = (sb?.escenas || []).map((esc: any, i: number) => {
    const text = (esc?.narracion || "").trim();
    const tokens = text.split(/\s+/).filter(Boolean);
    const dur = Math.max(2, tokens.length / 2.6); // ~2.6 palabras/segundo
    const per = tokens.length ? dur / tokens.length : dur;
    const words: Word[] = tokens.map((t: string, idx: number) => ({
      text: t,
      startS: +(idx * per).toFixed(3),
      endS: +((idx + 1) * per).toFixed(3),
    }));
    const scene: TimelineScene = {
      id: esc?.id || "s" + (i + 1),
      audio: null,
      startS: +cursor.toFixed(3),
      durationS: +dur.toFixed(3),
      words,
    };
    cursor += dur;
    return scene;
  });
  return { fps, totalDurationS: +cursor.toFixed(3), escenas, fallback: true };
}

export async function loadReelData(): Promise<{ sb: any; timeline: Timeline }> {
  const sb = (await fetchJson("storyboard.json")) || {
    meta: {},
    paleta: {},
    escenas: [],
  };
  let timeline = (await fetchJson("timeline.json")) as Timeline | null;
  if (!timeline || !timeline.escenas || timeline.escenas.length === 0) {
    timeline = buildFallbackTimeline(sb);
  }
  return { sb, timeline };
}
