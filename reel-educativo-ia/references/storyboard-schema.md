# Esquema de `storyboard.json`

Este archivo es el guion técnico que el pipeline convierte en video. Lo escribes
tú (Claude) a partir del guión del usuario y lo guardas en
`public/storyboard.json` del proyecto. La voz y el render lo leen; respeta los
nombres de campo exactamente.

## Estructura de alto nivel

```json
{
  "meta": { ... },
  "paleta": { ... },
  "escenas": [ { ... }, { ... } ]
}
```

## `meta` (obligatorio)

```json
"meta": {
  "titulo": "Separación de poderes en 40 segundos",
  "objetivo": "Que la persona entienda por qué el poder se divide en tres.",
  "contexto": "Reel educativo de Ágora para Instagram, público joven.",
  "plataforma": "reels",
  "idioma": "es",
  "fps": 30,
  "ancho": 1080,
  "alto": 1920,
  "voiceName": "Sarah"
}
```

- `fps`, `ancho`, `alto` tienen esos valores por defecto para 9:16. No los cambies
  salvo que el usuario pida otro formato.
- `voiceName` es el nombre de la voz en ElevenLabs. Usa una **voz premade de uso
  libre** (p. ej. `"Sarah"`, `"Brian"`, `"George"`, `"Liam"`).
- `idioma` guía el modelo de ElevenLabs (usa `eleven_multilingual_v2` para
  español).

## `paleta` (opcional; hay un default bonito si la omites)

```json
"paleta": {
  "fondo": "#0B1020",
  "fondo2": "#161E3A",
  "texto": "#FFFFFF",
  "primario": "#FFD54A",
  "acento": "#4ADE80",
  "burbuja": "#1F2A4D"
}
```

Elige colores con buen contraste (texto claro sobre fondo oscuro rinde mejor en
reels). Guía en `estilo-visual.md`.

## `escenas` (obligatorio) — una idea por escena

Lo típico son **2 a 6 escenas**. La **duración de cada escena la define el audio**
de su narración (se calcula en `generate_voice.py`), así que no pongas duraciones
a mano: escribe narraciones del largo que quieras que dure cada beat.

```json
{
  "id": "s1",
  "narracion": "¿Por qué ningún presidente, en una democracia sana, puede hacer leyes, aplicarlas y juzgarlas a la vez?",
  "subtitulo": "¿Por qué ningún presidente puede hacer, aplicar y juzgar las leyes a la vez?",
  "visual": {
    "tipo": "formas",
    "estilo": "pregunta",
    "fuente": null,
    "promptImagen": null
  },
  "burbujas": [
    { "texto": "El gancho", "emoji": "🤔", "posicion": "top", "entraEnS": 0.3, "duraS": 2.5, "tipo": "idea" }
  ],
  "emojisFlotantes": ["⚖️", "🏛️"],
  "referencias": []
}
```

### Campos de la escena

| Campo | Qué es |
|---|---|
| `id` | identificador único: `"s1"`, `"s2"`… |
| `narracion` | **texto que dirá la voz.** Escríbelo natural, con puntuación real (las comas y puntos marcan las pausas de ElevenLabs). |
| `subtitulo` | texto en pantalla. Suele ser igual o una versión más corta de `narracion`. Si lo dejas igual, se sincroniza palabra por palabra. Si lo acortas, se muestra sin karaoke por palabra pero igual sincronizado a la escena. |
| `visual` | cómo se ve el fondo de la escena (ver abajo). |
| `burbujas` | etiquetas animadas de concepto/idea/fuente (ver abajo). Una por concepto, no más de 2 por escena. |
| `emojisFlotantes` | lista de emojis que flotan suavemente de fondo (0–4). Refuerzan el tema sin texto. |
| `referencias` | fuentes citadas, salen como burbuja tipo `fuente` abajo. Ej: `[{ "texto": "Art. 113 C.P.", "emoji": "📜" }]`. Deja `[]` si no hay. **No inventes fuentes.** |

### `visual.tipo`

- `"formas"` — motion graphics por código (default). Combínalo con `estilo`:
  `"pregunta"`, `"dato"`, `"concepto"`, `"cierre"`, `"neutro"`. Cada estilo cambia
  el tratamiento del fondo.
- `"imagen"` — usa `fuente: "assets/mi-imagen.png"` (archivo en `public/assets/`).
  La imagen debe ser vertical (1080×1920) para llenar; si no, se recorta centrada.
- `"video"` — usa `fuente: "assets/mi-clip.mp4"`. Se reproduce en bucle,
  silenciado, detrás del contenido.
- Si pones `promptImagen`, es solo una nota para generar la imagen después; el
  render no genera imágenes por sí mismo.

### `burbujas[]`

```json
{ "texto": "Separación de poderes", "emoji": "⚖️", "posicion": "top", "entraEnS": 0.5, "duraS": 3.0, "tipo": "concepto" }
```

- `posicion`: `"top"`, `"center-left"`, `"center-right"`, `"bottom"`. Evita
  `"bottom"` si compite con los subtítulos (los subtítulos viven abajo-centro).
- `entraEnS` / `duraS`: segundos **relativos al inicio de la escena**. Si no
  sabes la duración exacta de la escena, usa valores prudentes (`entraEnS` entre
  0 y 1, `duraS` entre 2 y 4); la plantilla recorta si la escena es más corta.
- `tipo`: `"concepto"` (acento primario), `"idea"` (acento secundario),
  `"dato"` (realza un número), `"fuente"` (cita/ referencia, más sobria).

## Ejemplo mínimo completo (2 escenas)

```json
{
  "meta": {
    "titulo": "¿Qué es la separación de poderes?",
    "objetivo": "Entender por qué el poder se divide en tres ramas.",
    "contexto": "Reel de Ágora, público joven, Instagram.",
    "plataforma": "reels", "idioma": "es",
    "fps": 30, "ancho": 1080, "alto": 1920, "voiceName": "Sarah"
  },
  "paleta": { "fondo": "#0B1020", "fondo2": "#161E3A", "texto": "#FFFFFF", "primario": "#FFD54A", "acento": "#4ADE80", "burbuja": "#1F2A4D" },
  "escenas": [
    {
      "id": "s1",
      "narracion": "¿Por qué ninguna persona, en una democracia, debería hacer las leyes, aplicarlas y juzgarlas al mismo tiempo?",
      "subtitulo": "¿Por qué nadie debería hacer, aplicar y juzgar las leyes a la vez?",
      "visual": { "tipo": "formas", "estilo": "pregunta" },
      "burbujas": [ { "texto": "El problema", "emoji": "🤔", "posicion": "top", "entraEnS": 0.3, "duraS": 2.8, "tipo": "idea" } ],
      "emojisFlotantes": ["⚖️"],
      "referencias": []
    },
    {
      "id": "s2",
      "narracion": "Por eso el poder se divide en tres ramas que se vigilan entre sí: la legislativa hace las leyes, la ejecutiva las aplica, y la judicial las interpreta.",
      "subtitulo": "Tres ramas que se vigilan: legislativa, ejecutiva y judicial.",
      "visual": { "tipo": "formas", "estilo": "concepto" },
      "burbujas": [
        { "texto": "Separación de poderes", "emoji": "⚖️", "posicion": "top", "entraEnS": 0.4, "duraS": 3.5, "tipo": "concepto" }
      ],
      "emojisFlotantes": ["🏛️", "👩‍⚖️", "📜"],
      "referencias": [ { "texto": "Art. 113 C.P.", "emoji": "📜" } ]
    }
  ]
}
```

## Reglas de oro al escribir el storyboard

- **Narración con puntuación real.** ElevenLabs respira en comas y puntos. Frases
  cortas = ritmo claro.
- **Subtítulo ≤ 2 líneas** en pantalla. Si la narración es larga, el subtítulo
  puede ser una síntesis.
- **Una burbuja por concepto.** Si todo está resaltado, nada resalta.
- **Emojis que signifiquen algo**, no decoración. ⚖️ para justicia, 🗳️ para voto,
  🏛️ para institución. Máximo 3–4 flotando por escena.
- **No inventes datos ni fuentes.** Si una cifra o artículo no está verificado,
  no lo pongas como referencia.
