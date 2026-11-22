# Integración con ElevenLabs

La voz en off se genera con ElevenLabs. Hay **dos caminos**; elige según lo que
haya configurado el usuario.

## Dos caminos

- **Camino A — MCP (recomendado, sin que el usuario exporte una API key).** Si el
  MCP de ElevenLabs está conectado en la sesión, genera la voz con su herramienta
  de *text-to-speech* y luego arma la sincronía con `build_timeline.py` (mide los
  mp3 con `ffprobe`). La clave vive en la config del MCP; el usuario no la toca.
- **Camino B — API directa (sincronía exacta).** `generate_voice.py` llama a la
  API *with-timestamps* y produce timing palabra por palabra. Requiere
  `ELEVENLABS_API_KEY` en el entorno. El resto de este documento detalla este
  camino.

### Camino A, paso a paso
1. Verifica que el MCP esté conectado (`/mcp` o el estado de conectores). Debe
   quedar en **user scope** y **autenticado**; si no, ver abajo "Conectar el MCP".
2. Por cada escena, llama a la herramienta TTS del MCP con `narracion` y la voz
   `meta.voiceName`, y guarda la salida como `public/audio/<id>.mp3`.
3. Corre `python3 scripts/build_timeline.py public/storyboard.json` para generar
   `public/timeline.json` (duración real por `ffprobe` + reparto de palabras).

### Conectar el MCP de ElevenLabs (una vez)
Si se agregó con scope local o sin autenticar, reconfigúralo:

```bash
# 1) quita el registro mal ubicado (desde la carpeta donde se agregó)
cd ~ && claude mcp remove elevenlabs
# 2) agrégalo en USER scope (disponible en todos los proyectos)
claude mcp add --transport http --scope user elevenlabs https://api.elevenlabs.io/v1/mcp
```

Luego autentícalo: abre `/mcp` en la sesión y, si ofrece inicio de sesión
(OAuth), entra con la cuenta de ElevenLabs — **sin pegar ninguna clave**. Si el
servidor exige la clave por cabecera, re-agrégalo incluyendo el header (la clave
queda una sola vez en la config, no se vuelve a tocar):

```bash
claude mcp add --transport http --scope user elevenlabs \
  https://api.elevenlabs.io/v1/mcp --header "xi-api-key: TU_API_KEY"
```

Tras conectar/autenticar, reinicia la sesión para que las herramientas del MCP
aparezcan.

## Voces de uso libre (premade)

Usa una **voz premade**: vienen en toda cuenta y no implican pagar una voz
clonada. Opciones comunes (es/multilingüe aceptable): `Sarah`, `Brian`, `George`,
`Liam`, `Charlotte`, `Matilda`. Pon la elegida en `meta.voiceName`. Tanto el MCP
como `generate_voice.py` la resuelven por nombre; si no existe, el script lista
las disponibles.

## Autenticación (Camino B)

- La clave se lee **solo** de la variable de entorno `ELEVENLABS_API_KEY`.
- Header en cada petición: `xi-api-key: <clave>`.
- Nunca escribas la clave en archivos, logs ni mensajes. Si no está definida, el
  script se detiene y pide al usuario que la exporte.

## Resolver la voz por nombre

El storyboard trae `meta.voiceName` (una voz premade, p. ej. `"Sarah"`), no un ID.
El script:

1. `GET https://api.elevenlabs.io/v1/voices` → lista de voces de la cuenta.
2. Busca (sin distinguir mayúsculas) una voz cuyo `name` coincida con `voiceName`.
3. Si la encuentra, usa su `voice_id`. Si no, **imprime las voces disponibles y
   aborta** — así el usuario ve qué nombres tiene realmente y puede corregir el
   storyboard o crear/renombrar la voz.

Esto evita hardcodear un `voice_id` que puede variar entre cuentas.

## Generar audio con timestamps

Por cada escena se llama al endpoint *with-timestamps*, que devuelve el audio y la
alineación carácter por carácter (clave para sincronizar subtítulos):

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps
Content-Type: application/json
xi-api-key: <clave>

{
  "text": "<narracion de la escena>",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": { "stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true }
}
```

Respuesta (JSON):
- `audio_base64` — el MP3 en base64. Se decodifica y se guarda como
  `public/audio/sN.mp3`.
- `alignment` (y/o `normalized_alignment`) con:
  - `characters` — lista de caracteres.
  - `character_start_times_seconds` / `character_end_times_seconds` — tiempos de
    cada carácter, relativos al inicio de ese audio.

El script agrupa los caracteres en **palabras** (cortando en espacios) y guarda,
por palabra, su `startS` y `endS`. La **duración de la escena** es el último
`endS` del audio (más una pequeña cola de silencio para que respire).

## `public/timeline.json` (lo que produce el script)

```json
{
  "fps": 30,
  "totalDurationS": 43.2,
  "escenas": [
    {
      "id": "s1",
      "audio": "audio/s1.mp3",
      "startS": 0.0,
      "durationS": 6.4,
      "words": [
        { "text": "¿Por", "startS": 0.08, "endS": 0.34 },
        { "text": "qué", "startS": 0.34, "endS": 0.55 }
      ]
    }
  ]
}
```

- `startS` de cada escena es acumulativo (la escena N empieza donde terminó N-1).
- Los `words[].startS/endS` son **relativos al inicio de la escena** (así la
  plantilla los usa directo dentro de cada `Sequence`).
- Se añade una cola de ~0.35 s entre escenas para que la voz no se sienta cortada.

## Modelo y ajustes de voz

- **Modelo:** `eleven_multilingual_v2` para español (buena prosodia en es-LA).
  Para solo inglés podría usarse `eleven_turbo_v2`, pero por defecto, multilingüe.
- **voice_settings** por defecto: `stability 0.5`, `similarity_boost 0.75`. Si el
  usuario quiere una voz más "plana"/formal, sube `stability`; para más
  expresividad, bájala y sube `style`. Estos valores pueden exponerse en
  `meta.voiceSettings` del storyboard si hace falta (el script los respeta si
  existen).

## Errores comunes

- **401 / 403** → clave inválida o sin permisos: revisar `ELEVENLABS_API_KEY`.
- **Voz no encontrada** → el nombre en `meta.voiceName` no existe en la cuenta; el
  script lista las disponibles.
- **429 / quota** → se acabaron los créditos del plan; avísale al usuario, no
  reintentes en bucle.
- **Texto muy largo** → cada escena debería ser una o dos frases; si una escena
  da un audio larguísimo, pártela en el storyboard.

## Costo y privacidad

- Cada render de voz consume créditos de ElevenLabs (por caracteres). Reutiliza el
  audio: si solo cambian colores o posiciones (no la narración), **no**
  regeneres la voz.
- El texto de la narración se envía a ElevenLabs. No incluyas datos personales del
  usuario ni secretos en la narración.
