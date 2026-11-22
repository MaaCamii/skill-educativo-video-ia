#!/usr/bin/env bash
# Preflight para reel-educativo-ia:
# verifica Node.js, FFmpeg y la API key de ElevenLabs; instala lo que falte con brew.
set -u

green() { printf "\033[0;32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[0;33m%s\033[0m\n" "$1"; }
red() { printf "\033[0;31m%s\033[0m\n" "$1"; }

missing_tool=0

echo "== Verificando herramientas =="

# --- Node.js ---
if command -v node >/dev/null 2>&1; then
  green "node OK ($(node --version))"
else
  yellow "node NO encontrado."
  if command -v brew >/dev/null 2>&1; then
    echo "Instalando node con Homebrew..."
    if brew install node; then
      green "node instalado ($(node --version 2>/dev/null))"
    else
      red "Falló 'brew install node'. Instálalo manualmente: https://nodejs.org"
      missing_tool=1
    fi
  else
    red "No hay Homebrew. Instala Node desde https://nodejs.org (versión LTS)."
    missing_tool=1
  fi
fi

# --- FFmpeg ---
if command -v ffmpeg >/dev/null 2>&1; then
  green "ffmpeg OK ($(ffmpeg -version 2>/dev/null | head -1))"
else
  yellow "ffmpeg NO encontrado."
  if command -v brew >/dev/null 2>&1; then
    echo "Instalando ffmpeg con Homebrew..."
    if brew install ffmpeg; then
      green "ffmpeg instalado"
    else
      red "Falló 'brew install ffmpeg'. Instálalo manualmente."
      missing_tool=1
    fi
  else
    red "No hay Homebrew. Instala FFmpeg (https://ffmpeg.org) antes de renderizar."
    missing_tool=1
  fi
fi

# --- Python 3 ---
if command -v python3 >/dev/null 2>&1; then
  green "python3 OK ($(python3 --version 2>&1))"
else
  red "python3 NO encontrado. Es necesario para generar la voz."
  missing_tool=1
fi

# --- ffprobe (viene con FFmpeg; lo usa build_timeline.py) ---
if command -v ffprobe >/dev/null 2>&1; then
  green "ffprobe OK"
else
  yellow "ffprobe NO encontrado (normalmente viene con ffmpeg). Reinstala FFmpeg si falta."
fi

# --- Voz (ElevenLabs) ---
echo "== Verificando la voz =="
echo "La voz se genera con ElevenLabs. Hay dos caminos y NO necesitas exportar"
echo "ninguna clave si usas el MCP:"
if [ -n "${ELEVENLABS_API_KEY:-}" ]; then
  green "  · Camino directo: ELEVENLABS_API_KEY está definida (sincronía exacta con generate_voice.py)."
else
  yellow "  · Camino MCP (recomendado aquí): genera cada mp3 con el MCP de ElevenLabs"
  echo   "    y arma la sincronía con build_timeline.py (usa ffprobe). Sin API key."
  echo   "  · (Opcional) Camino directo con sincronía exacta: export ELEVENLABS_API_KEY=... + generate_voice.py."
fi

echo "============================="
if [ "$missing_tool" -eq 0 ]; then
  green "Preflight OK: listo para producir el reel."
  exit 0
else
  yellow "Preflight incompleto: resuelve lo marcado en rojo antes de continuar."
  exit 1
fi
