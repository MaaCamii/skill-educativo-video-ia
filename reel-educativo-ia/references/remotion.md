# La plantilla Remotion por dentro

La plantilla vive en `assets/remotion-template/` y se copia a cada proyecto con
`scripts/new_project.sh`. Es *data-driven*: no se edita código por video; se edita
`public/storyboard.json`. Esta referencia explica cómo se mapea el storyboard a la
pantalla, por si necesitas ajustar el aspecto.

## Cómo fluye la data

1. `src/Root.tsx` declara la composición `Reel` y usa `calculateMetadata` para
   cargar `public/storyboard.json` + `public/timeline.json` (en `src/data.ts`).
   De ahí saca `fps`, tamaño (`ancho`×`alto`) y la **duración total** en frames.
2. Si `timeline.json` no existe (aún no corriste la voz), `data.ts` arma una
   línea de tiempo **estimada** para poder previsualizar sin audio.
3. `src/Reel.tsx` crea una `<Sequence>` por escena, posicionada con `startS` y
   `durationS` del timeline. Dentro de cada Sequence el frame es **relativo a la
   escena**, lo que simplifica los tiempos de burbujas y subtítulos.
4. `components/Scene.tsx` compone: fondo → audio de la escena → emojis → burbujas
   → referencias → subtítulos.

## Mapeo storyboard → pantalla

| En el storyboard | Qué hace en pantalla | Componente |
|---|---|---|
| `escena.visual` | fondo (motion graphics, imagen o video) | `Background.tsx` |
| `timeline.escena.audio` | pista de voz de esa escena | `Audio` en `Scene.tsx` |
| `timeline.escena.words` | subtítulos karaoke sincronizados | `Subtitles.tsx` |
| `escena.burbujas[]` | chips animados de concepto/idea/dato | `Bubble.tsx` |
| `escena.referencias[]` | chips sobrios de fuente (arriba-der., apilados) | `Bubble.tsx` |
| `escena.emojisFlotantes[]` | emojis de apoyo de fondo | `FloatingEmojis.tsx` |
| `paleta` | colores de todo | `palette.ts` |

## Subtítulos

`Subtitles.tsx` agrupa las `words` (con sus tiempos) en líneas de ~5 palabras /
~28 caracteres, muestra la línea activa según el tiempo, y resalta en color
`primario` la palabra que suena (efecto karaoke). Las palabras ya dichas van en
blanco pleno; las que faltan, atenuadas. Esto hace el reel legible en silencio.

> Nota: los subtítulos se construyen desde la narración **realmente hablada**
> (las `words` del timeline), por eso la sincronía es exacta. El campo
> `subtitulo` del storyboard es informativo/opcional; si quieres que el texto en
> pantalla difiera de la narración, la vía recomendada es ajustar la `narracion`
> (que es lo que se oye y lo que se subtitula).

## Burbujas

`Bubble.tsx` entra con un resorte (`spring`) + escala, y sale con fade al cumplir
`duraS`. Posiciones: `top`, `bottom`, `center-left`, `center-right`, `top-left`,
`top-right`. Colores por `tipo` (`concepto`, `idea`, `dato`, `fuente`). Las
referencias se apilan arriba a la derecha.

## Fondos

`Background.tsx`:
- `visual.tipo: "formas"` → degradado `fondo`→`fondo2` + dos “blobs” radiales que
  se mueven, y un glifo gigante tenue (p. ej. “?” en estilo `pregunta`). El
  `estilo` (`pregunta`, `dato`, `concepto`, `cierre`, `neutro`) cambia el acento.
- `visual.tipo: "imagen"` → `<Img>` a pantalla completa (objectFit cover) +
  overlay oscuro para legibilidad del texto. `fuente` apunta a `assets/...`.
- `visual.tipo: "video"` → `<OffthreadVideo>` en bucle, silenciado + overlay.

## Ajustes frecuentes

- **Tamaño/posición de subtítulos:** `Subtitles.tsx` (`bottom`, `fontSize`,
  `maxWidth`).
- **Tipografía:** se usa el stack del sistema. Para una fuente de marca, instala
  `@remotion/google-fonts` o carga una fuente local y aplícala en los
  componentes de texto.
- **Velocidad de lectura / duración estimada en preview:** `data.ts`
  (`buildFallbackTimeline`, ~2.6 palabras/segundo).
- **Códec/salida:** `remotion.config.ts` y el script `render` en `package.json`.

## Comandos

```bash
npm install          # primera vez
npm run preview      # Remotion Studio (revisar)
npm run render       # out/reel.mp4
npm run still        # out/portada.png (un frame, para carátula)
```

## Requisitos de ejecución

- Node.js y FFmpeg (el preflight los instala).
- La primera `npm install` baja Remotion y un Chromium headless; puede tardar
  varios minutos y descargar bastante. Es normal.
