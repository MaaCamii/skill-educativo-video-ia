# Plantilla Remotion — reel-educativo-ia

Proyecto de video *data-driven*: lee `public/storyboard.json` y
`public/timeline.json` y renderiza un reel vertical 1080×1920.

## Flujo

```bash
# 1) Escribe/edita el storyboard
#    public/storyboard.json   (ver el esquema en la skill)

# 2) Genera la voz y la sincronía (crea public/audio/*.mp3 y public/timeline.json)
python3 /ruta/a/la/skill/scripts/generate_voice.py public/storyboard.json

# 3) Instala dependencias (solo la primera vez)
npm install

# 4) Previsualiza en el navegador (opcional)
npm run preview

# 5) Renderiza el MP4
npm run render      # -> out/reel.mp4
```

## Previsualización sin voz

Si todavía no has corrido `generate_voice.py`, `npm run preview` igual funciona:
la plantilla estima las duraciones a partir del texto y muestra los subtítulos y
las burbujas (sin audio). Útil para ajustar lo visual antes de gastar créditos de
ElevenLabs.

## Estructura

```
src/
  index.ts            registra la composición
  Root.tsx            define "Reel" y calcula duración/tamaño desde los datos
  Reel.tsx            arma las escenas en secuencia
  data.ts             carga storyboard + timeline (con fallback para preview)
  palette.ts          paleta por defecto
  components/
    Scene.tsx         compone una escena (fondo + audio + burbujas + subtítulos)
    Background.tsx     motion graphics / imagen / video de fondo
    Subtitles.tsx      subtítulos karaoke sincronizados
    Bubble.tsx         burbujas de concepto/idea/dato/fuente
    FloatingEmojis.tsx emojis de apoyo flotantes
public/
  storyboard.json     el guion técnico (lo escribes tú)
  timeline.json       lo genera generate_voice.py
  audio/              mp3 por escena (los genera generate_voice.py)
  assets/             imágenes/clips opcionales 1080x1920
```
