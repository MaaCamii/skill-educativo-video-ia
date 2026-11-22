#!/usr/bin/env python3
"""
build_timeline.py — Arma public/timeline.json a partir de los audios YA generados
(una pista por escena en public/audio/<id>.mp3), sin red ni API key.

Es el camino recomendado cuando la voz se genera con el MCP de ElevenLabs (o por
cualquier otro medio): tú solo dejas los mp3 en public/audio/ y este script mide
cada uno con ffprobe y reparte las palabras de la narración a lo largo de su
duración para sincronizar los subtítulos.

Uso:
    python3 build_timeline.py <ruta/al/storyboard.json>

Requiere ffprobe (viene con FFmpeg). Si prefieres sincronía exacta palabra-por-
palabra, usa en su lugar generate_voice.py (llamada directa a la API con
timestamps), que requiere ELEVENLABS_API_KEY.
"""

import json
import os
import shutil
import subprocess
import sys

TAIL_SILENCE_S = 0.15  # colchón entre escenas


def die(msg, code=1):
    print("ERROR: " + msg, file=sys.stderr)
    sys.exit(code)


def ffprobe_duration(path):
    exe = shutil.which("ffprobe")
    if not exe:
        die("No encuentro 'ffprobe'. Instala FFmpeg (brew install ffmpeg).")
    try:
        out = subprocess.check_output(
            [
                exe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                path,
            ],
            stderr=subprocess.STDOUT,
        )
        return float(out.decode("utf-8").strip())
    except (subprocess.CalledProcessError, ValueError) as e:
        die("No pude medir la duración de %s (%s)." % (path, e))


def main():
    if len(sys.argv) < 2:
        die("Uso: python3 build_timeline.py <ruta/al/storyboard.json>")
    sb_path = sys.argv[1]
    if not os.path.isfile(sb_path):
        die("No existe el storyboard: " + sb_path)

    with open(sb_path, "r", encoding="utf-8") as f:
        sb = json.load(f)

    meta = sb.get("meta", {})
    escenas = sb.get("escenas", [])
    if not escenas:
        die("El storyboard no tiene escenas.")

    fps = int(meta.get("fps", 30))
    public_dir = os.path.dirname(os.path.abspath(sb_path))

    timeline = {"fps": fps, "totalDurationS": 0.0, "escenas": []}
    cursor = 0.0
    faltantes = []

    for idx, esc in enumerate(escenas, start=1):
        sid = esc.get("id", "s%d" % idx)
        mp3_rel = "audio/%s.mp3" % sid
        mp3_path = os.path.join(public_dir, mp3_rel)
        if not os.path.isfile(mp3_path):
            faltantes.append(mp3_rel)
            continue

        dur = ffprobe_duration(mp3_path)
        text = (esc.get("narracion") or "").strip()
        tokens = [t for t in text.split() if t]

        # Reparto uniforme de las palabras a lo largo del audio (sin su cola).
        speak = max(0.1, dur - TAIL_SILENCE_S)
        per = speak / len(tokens) if tokens else speak
        words = [
            {
                "text": t,
                "startS": round(i * per, 3),
                "endS": round((i + 1) * per, 3),
            }
            for i, t in enumerate(tokens)
        ]

        timeline["escenas"].append(
            {
                "id": sid,
                "audio": mp3_rel,
                "startS": round(cursor, 3),
                "durationS": round(dur, 3),
                "words": words,
            }
        )
        cursor += dur

    if faltantes:
        die(
            "Faltan audios de escenas: %s\n"
            "  Genera la voz de cada escena (con el MCP de ElevenLabs u otro medio)\n"
            "  y guárdala en public/audio/<id>.mp3 antes de correr este script."
            % ", ".join(faltantes)
        )

    timeline["totalDurationS"] = round(cursor, 3)
    tl_path = os.path.join(public_dir, "timeline.json")
    with open(tl_path, "w", encoding="utf-8") as tf:
        json.dump(timeline, tf, ensure_ascii=False, indent=2)

    print("timeline.json escrito: %s" % tl_path)
    print("Duración total: %.1fs" % timeline["totalDurationS"])
    if timeline["totalDurationS"] > 60:
        print("AVISO: supera 60s. Acorta narraciones para un reel.")
    print(
        "Nota: la sincronía de subtítulos es estimada (reparto uniforme por escena).\n"
        "Para sincronía exacta, usa generate_voice.py con ELEVENLABS_API_KEY."
    )


if __name__ == "__main__":
    main()
