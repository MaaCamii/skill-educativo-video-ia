#!/usr/bin/env python3
"""
generate_voice.py — Genera la voz en off (ElevenLabs) y la línea de tiempo
sincronizada para un reel-educativo-ia.

Uso:
    python3 generate_voice.py <ruta/al/storyboard.json>

Lee la narración de cada escena del storyboard, resuelve la voz por nombre
(meta.voiceName, p. ej. "Sarah"), llama a la API text-to-speech *with-timestamps*
de ElevenLabs, escribe:
    <public>/audio/sN.mp3         (una pista por escena)
    <public>/timeline.json        (inicio/duración de cada escena + palabras con tiempos)

donde <public> es la carpeta que contiene el storyboard.

Requisitos: variable de entorno ELEVENLABS_API_KEY. Solo usa la librería estándar.
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

API_BASE = "https://api.elevenlabs.io/v1"
DEFAULT_MODEL = "eleven_multilingual_v2"
DEFAULT_VOICE_NAME = "Sarah"  # voz premade de uso libre; cambia en meta.voiceName
TAIL_SILENCE_S = 0.35  # cola entre escenas para que la voz respire
DEFAULT_VOICE_SETTINGS = {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": True,
}


def die(msg, code=1):
    print("ERROR: " + msg, file=sys.stderr)
    sys.exit(code)


def api_key():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not k:
        die(
            "ELEVENLABS_API_KEY no está definida.\n"
            "  Pide la clave al usuario y que la exporte:\n"
            '    export ELEVENLABS_API_KEY="su_clave"\n'
            "  (No la escribas en ningún archivo del proyecto.)"
        )
    return k


def http_get(url, key):
    req = urllib.request.Request(url, headers={"xi-api-key": key})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def http_post_json(url, key, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return json.loads(resp.read().decode("utf-8"))


def resolve_voice_id(key, voice_name):
    try:
        data = http_get(API_BASE + "/voices", key)
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            die("Clave de ElevenLabs inválida o sin permisos (HTTP %d)." % e.code)
        die("No se pudo listar las voces (HTTP %d)." % e.code)
    except urllib.error.URLError as e:
        die("Sin conexión con ElevenLabs: %s" % e.reason)

    voices = data.get("voices", [])
    for v in voices:
        if v.get("name", "").strip().lower() == voice_name.strip().lower():
            return v["voice_id"]

    names = ", ".join(sorted(v.get("name", "?") for v in voices)) or "(ninguna)"
    die(
        'No encontré una voz llamada "%s" en la cuenta.\n'
        "  Voces disponibles: %s\n"
        "  Corrige meta.voiceName en el storyboard, o crea/renombra la voz en ElevenLabs."
        % (voice_name, names)
    )


def words_from_alignment(alignment):
    """Agrupa los caracteres alineados en palabras con tiempos (relativos al audio)."""
    chars = alignment.get("characters") or []
    starts = alignment.get("character_start_times_seconds") or []
    ends = alignment.get("character_end_times_seconds") or []
    n = min(len(chars), len(starts), len(ends))

    words = []
    cur, cur_start, cur_end = "", None, None
    for i in range(n):
        ch = chars[i]
        if ch is None:
            ch = ""
        if ch.strip() == "":  # espacio o salto: cierra la palabra
            if cur:
                words.append({"text": cur, "startS": round(cur_start, 3), "endS": round(cur_end, 3)})
                cur, cur_start, cur_end = "", None, None
            continue
        if cur_start is None:
            cur_start = starts[i]
        cur_end = ends[i]
        cur += ch
    if cur:
        words.append({"text": cur, "startS": round(cur_start, 3), "endS": round(cur_end, 3)})
    return words


def main():
    if len(sys.argv) < 2:
        die("Uso: python3 generate_voice.py <ruta/al/storyboard.json>")
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
    voice_name = meta.get("voiceName", DEFAULT_VOICE_NAME)
    model_id = meta.get("modelId", DEFAULT_MODEL)
    voice_settings = dict(DEFAULT_VOICE_SETTINGS)
    voice_settings.update(meta.get("voiceSettings", {}) or {})

    public_dir = os.path.dirname(os.path.abspath(sb_path))
    audio_dir = os.path.join(public_dir, "audio")
    os.makedirs(audio_dir, exist_ok=True)

    key = api_key()
    print('Resolviendo la voz "%s"...' % voice_name)
    voice_id = resolve_voice_id(key, voice_name)
    print("  voice_id: %s" % voice_id)

    tts_url = "%s/text-to-speech/%s/with-timestamps" % (API_BASE, voice_id)

    timeline = {"fps": fps, "totalDurationS": 0.0, "escenas": []}
    cursor = 0.0

    for idx, esc in enumerate(escenas, start=1):
        sid = esc.get("id", "s%d" % idx)
        text = (esc.get("narracion") or "").strip()
        if not text:
            die('La escena "%s" no tiene "narracion".' % sid)

        print("[%d/%d] Generando voz de la escena %s..." % (idx, len(escenas), sid))
        payload = {"text": text, "model_id": model_id, "voice_settings": voice_settings}

        for attempt in range(1, 4):
            try:
                resp = http_post_json(tts_url, key, payload)
                break
            except urllib.error.HTTPError as e:
                body = ""
                try:
                    body = e.read().decode("utf-8", "ignore")
                except Exception:
                    pass
                if e.code == 429:
                    die("Cuota/límite de ElevenLabs alcanzado (HTTP 429). %s" % body)
                if e.code in (401, 403):
                    die("Clave inválida o sin permisos (HTTP %d)." % e.code)
                if attempt < 3:
                    print("  reintentando (HTTP %d)..." % e.code)
                    time.sleep(2 * attempt)
                    continue
                die("Fallo al generar la escena %s (HTTP %d): %s" % (sid, e.code, body))
            except urllib.error.URLError as e:
                if attempt < 3:
                    print("  reintentando (%s)..." % e.reason)
                    time.sleep(2 * attempt)
                    continue
                die("Sin conexión con ElevenLabs: %s" % e.reason)

        audio_b64 = resp.get("audio_base64")
        if not audio_b64:
            die("La respuesta de la escena %s no trae audio." % sid)
        mp3_rel = "audio/%s.mp3" % sid
        mp3_path = os.path.join(public_dir, mp3_rel)
        with open(mp3_path, "wb") as af:
            af.write(base64.b64decode(audio_b64))

        alignment = resp.get("alignment") or resp.get("normalized_alignment") or {}
        words = words_from_alignment(alignment)
        if words:
            dur = words[-1]["endS"] + TAIL_SILENCE_S
        else:
            # sin alineación: estima por longitud (fallback muy conservador)
            dur = max(1.5, len(text) / 14.0)
            print("  aviso: sin alineación de tiempos; duración estimada.")

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

    timeline["totalDurationS"] = round(cursor, 3)

    tl_path = os.path.join(public_dir, "timeline.json")
    with open(tl_path, "w", encoding="utf-8") as tf:
        json.dump(timeline, tf, ensure_ascii=False, indent=2)

    print("Listo.")
    print("  Audios:   %s/*.mp3" % audio_dir)
    print("  Timeline: %s" % tl_path)
    print("  Duración total: %.1fs" % timeline["totalDurationS"])
    if timeline["totalDurationS"] > 60:
        print("  AVISO: supera 60s. Acorta narraciones en el storyboard para un reel.")


if __name__ == "__main__":
    main()
