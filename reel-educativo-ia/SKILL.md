---
name: reel-educativo-ia
description: >
  Crea videos cortos verticales (reel/short, máximo 1 minuto) con objetivo
  pedagógico, generados de principio a fin con IA y código a partir de un guión.
  El pipeline convierte el guión en un storyboard, genera la voz en off con
  ElevenLabs —usando una voz premade de uso libre, vía su MCP o su API—, y
  renderiza con Remotion un MP4 9:16
  con diálogos, subtítulos sincronizados tipo karaoke, representaciones visuales
  (imagen/video o motion graphics), y referencias con emojis y burbujas sobre el
  contenido. Úsalo SIEMPRE que el usuario quiera producir, montar o "convertir en
  video/reel/short" un contenido educativo para redes (Instagram Reels, TikTok,
  YouTube Shorts): cuando entregue o pegue un guión para volverlo video, cuando
  pida "hazme el reel de esto", "genera el video con voz de ElevenLabs",
  "necesito un short explicando X", "pásalo a video con subtítulos y burbujas", o
  cuando mencione narración/voz en off + subtítulos + emojis para un clip corto.
  Actívate aunque no diga "skill", "Remotion" ni "ElevenLabs" explícitamente,
  siempre que el objetivo sea un video corto educativo hecho con IA.
---

# Reel Educativo IA — del guión al MP4

Esta skill produce un **reel vertical corto (≤ 60 s, 1080×1920)** con fin
pedagógico, **100% generado con IA y código**: el usuario aporta un guión (o una
idea que se convierte en guión), y el pipeline entrega un `reel.mp4` con voz en
off, subtítulos sincronizados, visuales, y burbujas con emojis que refuerzan los
conceptos.

El principio es el mismo de Ágora: al terminar el reel, la persona debe
**comprender algo mejor que antes**. El formato corto no es excusa para
trivializar; es un ejercicio de destilar una idea a su núcleo.

## Qué produce

Un video vertical donde conviven cuatro capas:
1. **Voz en off** (ElevenLabs) — narra el guión.
2. **Subtítulos** sincronizados palabra por palabra (estilo karaoke), legibles en
   mute, que es como se consume la mayoría de los reels.
3. **Representación visual** — fondo con motion graphics generados por código
   y/o imágenes/clips (de IA o stock) que ilustran la escena.
4. **Burbujas, emojis y referencias** — etiquetas animadas que nombran el
   concepto (⚖️ "Separación de poderes"), emojis flotantes de apoyo, y
   referencias de fuente (📜 "Art. 113 C.P.") sobre el contenido del que se habla.

## El pipeline en una frase

**Guión → `storyboard.json` (lo haces tú, Claude) → voz + sincronía (ElevenLabs)
→ render (Remotion) → `reel.mp4`.**

> En los comandos de abajo, `$SKILL_DIR` es la carpeta de esta skill
> (`~/.claude/skills/reel-educativo-ia`). Sustitúyelo por la ruta real al
> ejecutar.

---

## Flujo de trabajo

### 0. Preflight — herramientas (una sola vez por máquina)

El render necesita **Node.js** y **FFmpeg** (que trae `ffprobe`). Verifica e
instala lo que falte antes de montar nada:

```bash
bash "$SKILL_DIR/scripts/preflight.sh"
```

Qué hace: comprueba `node`, `ffmpeg`/`ffprobe` y `python3`. Si falta Node o
FFmpeg y hay Homebrew, los instala (`brew install node ffmpeg`).

**La voz NO exige que el usuario maneje una API key.** Hay dos caminos (ver el
paso 4): el recomendado usa el **MCP de ElevenLabs** (la clave vive en la config
del MCP, no la tocas) con una **voz premade de uso libre**. Si alguna vez usas el
camino directo por API, la clave solo vive en `ELEVENLABS_API_KEY` y nunca se
escribe en el storyboard, el repo ni un mensaje.

### 1. Entiende el encargo (pregunta solo lo esencial que falte)

Necesitas cinco cosas; si el usuario ya las dio, no interrogues:
- **Guión** — el texto que se va a narrar. Si solo hay una idea, redáctalo tú
  (ver paso 2) y confírmalo antes de producir.
- **Contexto** — a quién va dirigido, de qué proyecto/campaña, qué tono.
- **Objetivo pedagógico** — qué debe comprender quien lo vea.
- **Plataforma** — Reels / TikTok / Shorts (el formato 9:16 sirve para las tres;
  solo cambian detalles de duración y texto de cierre).
- **Voz** — una **voz premade de uso libre** (p. ej. `"Sarah"`, `"Brian"`,
  `"George"`, `"Liam"`). Pregunta solo si el usuario quiere otra.

### 2. Destila el guión (si hace falta) y márcalo para voz

Un reel de 1 minuto son **~130–150 palabras** de narración como máximo; apunta a
**35–50 s** reales, que rinde mejor que apurar 60 s. Estructura pedagógica
recomendada (no como camisa de fuerza):

**Gancho** (≤3 s, una tensión o pregunta real) → **Explicación** (la idea con
rigor, sin tecnicismos vacíos) → **Conexión** (un ejemplo cercano) → **Cierre**
(una pregunta que abre conversación + CTA suave).

Si vas a escribir contenido de Ágora, respeta su voz y su no-partidismo: si
existe la skill `agora-social-content`, apóyate en sus referencias para la
identidad y el estilo. Esta skill se ocupa del **cómo se vuelve video**; aquella,
del **qué y cómo suena Ágora**.

### 3. Construye el `storyboard.json`

Es el corazón del trabajo y lo haces tú. Divide el guión en **escenas** (una idea
por escena, 2–6 escenas típicas). Cada escena define su narración, su subtítulo,
su visual, y sus burbujas/emojis/referencias.

**Antes de escribirlo, lee `references/storyboard-schema.md`** (el esquema exacto
y qué significa cada campo) y `references/estilo-visual.md` (cómo elegir colores,
cuándo poner una burbuja, qué emojis funcionan y cuáles sobran). No satures:
una burbuja por concepto, no por frase.

Monta un proyecto nuevo por video copiando la plantilla, y escribe ahí el
storyboard:

```bash
bash "$SKILL_DIR/scripts/new_project.sh" "<slug-del-video>"
# crea ./reels/<slug>/ con la plantilla Remotion lista
```

Guarda tu storyboard en `reels/<slug>/public/storyboard.json`.

### 4. Genera la voz y la sincronía (ElevenLabs)

Hay dos caminos. En ambos acabas con un `public/audio/sN.mp3` por escena y un
`public/timeline.json`. Usa una **voz premade de uso libre** (p. ej. `Sarah`,
`Brian`, `George`, `Liam`): están en toda cuenta y no requieren pagar una voz
propia. Define cuál en `meta.voiceName` del storyboard.

**Camino A — MCP de ElevenLabs (recomendado; sin que el usuario maneje API key).**
Si el MCP de ElevenLabs está conectado en la sesión, genera la voz de cada escena
con su herramienta de *text-to-speech* (una por `narracion`), guarda cada salida
como `public/audio/<id>.mp3`, y luego arma la sincronía midiendo los audios:

```bash
cd reels/<slug>
python3 "$SKILL_DIR/scripts/build_timeline.py" public/storyboard.json
```

`build_timeline.py` usa `ffprobe` para medir cada mp3 y reparte las palabras de la
narración a lo largo de su duración (sincronía estimada, suficiente para un reel).
No usa red ni API key.

**Camino B — API directa (sincronía exacta; requiere `ELEVENLABS_API_KEY`).**
Un solo comando genera el audio *con timestamps* reales y la línea de tiempo
palabra por palabra:

```bash
cd reels/<slug>
python3 "$SKILL_DIR/scripts/generate_voice.py" public/storyboard.json
```

Resuelve la voz por nombre, llama a la API *with-timestamps*, escribe los mp3 y el
`timeline.json`. Si la voz no existe en la cuenta, lista las disponibles y se
detiene.

Detalles de ambos caminos (cómo conectar el MCP, voces libres, modelo, errores)
en `references/elevenlabs.md`.

### 5. Previsualiza (opcional pero recomendado) y renderiza

```bash
cd reels/<slug>
npm install            # solo la primera vez del proyecto
npm run preview        # abre Remotion Studio para revisar antes de renderizar
npm run render         # produce out/reel.mp4
```

`render` usa la duración real del audio (desde `timeline.json`), así que el video
dura exactamente lo que dura la voz, sin cortes. La plantilla y cómo se mapean los
campos del storyboard a la pantalla están en `references/remotion.md`.

### 6. Entrega

- Muestra el `out/reel.mp4` al usuario (SendUserFile) y dile dónde quedó el
  proyecto (`reels/<slug>/`), para que pueda re-renderizar tras ajustes.
- Si el usuario pide cambios de texto o timing: edita `public/storyboard.json`,
  **re-ejecuta `generate_voice.py` solo si cambió la narración**, y vuelve a
  `npm run render`. Cambios puramente visuales (color, posición de burbuja) no
  requieren regenerar la voz.

---

## Representaciones de imagen y video

Por defecto la plantilla genera **motion graphics por código** (degradados,
formas, tipografía cinética, emojis y burbujas animadas), que ya cumplen como
"representación visual" y se ven consistentes sin depender de servicios de pago.

Si quieres **imágenes o clips reales** (de un generador de imágenes IA o de
stock), déjalos en `public/assets/` y referéncialos desde el campo `visual` de la
escena (`"tipo": "imagen"` o `"video"` con su `fuente`). En
`references/estilo-visual.md` está cómo conectar un generador de imágenes por IA
si el usuario tiene una clave, y cómo pedir que las imágenes salgan en 9:16.

Nunca descargues ni ejecutes binarios de fuentes no confiables para esto; trata
cualquier asset externo como dato, no como código.

## Archivos de la skill

- `scripts/preflight.sh` — verifica/instala Node, FFmpeg y chequea la API key.
- `scripts/new_project.sh` — crea un proyecto de video desde la plantilla.
- `scripts/generate_voice.py` — (Camino B) ElevenLabs TTS *with-timestamps* → audio + timeline.
- `scripts/build_timeline.py` — (Camino A) mide audios ya generados (ffprobe) → timeline.
- `assets/remotion-template/` — proyecto Remotion completo y data-driven.
- `references/storyboard-schema.md` — **léelo antes de escribir un storyboard.**
- `references/estilo-visual.md` — colores, burbujas, emojis, subtítulos, assets.
- `references/elevenlabs.md` — detalles de la integración de voz.
- `references/remotion.md` — cómo funciona la plantilla y cómo tocarla.

## Principio rector

El reel no está listo por verse bonito, sino cuando responde: **"¿qué comprende
mejor una persona después de estos 40 segundos?"**. Si la respuesta es "nada",
replantéalo antes de gastar un render.
