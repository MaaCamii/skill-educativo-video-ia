#!/usr/bin/env bash
# Crea un proyecto de reel a partir de la plantilla Remotion de la skill.
# Uso: bash new_project.sh <slug-del-video> [directorio-destino-base]
#   - <slug>: nombre corto en kebab-case, ej. "separacion-de-poderes"
#   - base (opcional): dónde crear ./reels/<slug>/ (default: directorio actual)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$SKILL_DIR/assets/remotion-template"

slug="${1:-}"
base="${2:-$(pwd)}"

if [ -z "$slug" ]; then
  echo "Falta el slug. Uso: bash new_project.sh <slug-del-video>" >&2
  exit 1
fi

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "No encuentro la plantilla en $TEMPLATE_DIR" >&2
  exit 1
fi

dest="$base/reels/$slug"
if [ -e "$dest" ]; then
  echo "Ya existe $dest — elige otro slug o bórralo primero." >&2
  exit 1
fi

mkdir -p "$dest"
# Copiar la plantilla (sin node_modules si por algo existiera)
cp -R "$TEMPLATE_DIR/." "$dest/"
rm -rf "$dest/node_modules" 2>/dev/null || true

mkdir -p "$dest/public/audio" "$dest/public/assets" "$dest/out"

echo "Proyecto creado en: $dest"
echo "Siguientes pasos:"
echo "  1. Escribe el storyboard en: $dest/public/storyboard.json"
echo "  2. Genera la voz:  cd \"$dest\" && python3 \"$SKILL_DIR/scripts/generate_voice.py\" public/storyboard.json"
echo "  3. Instala y renderiza:  npm install && npm run render"
