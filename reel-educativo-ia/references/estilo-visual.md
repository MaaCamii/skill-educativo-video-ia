# Estilo visual — burbujas, emojis, subtítulos, color y assets

Guía para que los reels se vean consistentes y pedagógicos, no ruidosos. El
objetivo visual es **dirigir la atención al concepto**, no competir con él.

## Principio

El reel se consume vertical, a menudo **en silencio** y en segundos. Por eso:
- El **subtítulo** es el canal principal de lectura: siempre legible, alto
  contraste, abajo-centro.
- Las **burbujas** son señales de "esto importa": aparecen, cumplen su función,
  y se van. No se acumulan.
- Los **emojis** son anclas de significado, no confeti.

## Color

Default (fondo oscuro, texto claro — el más legible en reels):

```
fondo    #0B1020   (azul casi negro)
fondo2   #161E3A   (para el degradado)
texto    #FFFFFF
primario #FFD54A   (amarillo Ágora-cálido: conceptos clave)
acento   #4ADE80   (verde: ideas / confirmación)
burbuja  #1F2A4D   (fondo de las burbujas)
```

Reglas:
- **Contraste primero.** Texto claro sobre fondo oscuro. Si el usuario pide fondo
  claro, usa texto oscuro (#111) y burbujas claras.
- **Dos colores de acento como máximo.** El primario para el concepto central de
  cada escena; el acento para apoyos.
- Respeta la identidad del proyecto si la hay (p. ej. colores de Ágora). Pregunta
  o toma de una referencia; no inventes una marca.

## Subtítulos

- Posición: franja inferior centrada, con margen de seguridad (la plantilla ya
  deja espacio para la UI de Instagram/TikTok a los lados y abajo).
- Máximo **2 líneas**. Si la narración es larga, el `subtitulo` puede ser una
  síntesis más corta que la `narracion`.
- Estilo karaoke: la palabra que suena se resalta en `primario`. Esto guía la
  lectura y sincroniza ojo y oído.
- Tipografía gruesa (peso 700–800) con sombra/halo para legibilidad sobre
  cualquier fondo.

## Burbujas

Una burbuja = una etiqueta con emoji + texto corto (2–4 palabras ideal, nunca una
oración). Tipos y cuándo usarlos:

| `tipo` | Para qué | Trato visual |
|---|---|---|
| `concepto` | nombrar el término central ("Separación de poderes") | color `primario`, la más visible |
| `idea` | marcar un beat del guion ("El problema", "La clave") | color `acento` |
| `dato` | resaltar una cifra o hecho ("3 ramas", "1991") | número grande |
| `fuente` | citar una referencia ("Art. 113 C.P.") | sobria, pequeña, sin gritar |

Buenas prácticas:
- **Máximo 2 burbujas por escena**, y rara vez simultáneas.
- Entran con un pequeño resorte (scale + fade) y salen con fade. La plantilla ya
  lo anima; tú solo das `entraEnS` y `duraS`.
- No pongas burbujas en `bottom` si hay subtítulo (chocan). Prefiere `top` o los
  laterales.

## Emojis

- Elige emojis que **signifiquen** el contenido: ⚖️ justicia, 🗳️ voto, 🏛️
  institución, 📜 norma/ley, 🤝 acuerdo, 🧠 aprender, ❓ pregunta, 💡 idea,
  📊 dato, 🌱 proceso.
- `emojisFlotantes`: 0–4 por escena, flotan despacio de fondo. Más de 4 marean.
- Un emoji dentro de una burbuja ancla su significado de un vistazo.
- Evita emojis ambiguos o de tono festivo si el tema es serio.

## Representaciones de imagen y video

### Opción por defecto: motion graphics por código (sin dependencias)
La plantilla dibuja fondos con degradados, formas geométricas suaves y tipografía
cinética según `visual.estilo`. Es gratis, reproducible y consistente. Para la
mayoría de reels pedagógicos **es suficiente y se ve profesional**.

### Opción: imágenes o clips reales
Si quieres fotografía/ilustración o video:
1. Deja los archivos en `public/assets/` del proyecto.
2. En la escena: `"visual": { "tipo": "imagen", "fuente": "assets/nombre.png" }`
   (o `"video"` con un `.mp4`).
3. Formato **vertical 1080×1920**. Si no lo es, se recorta centrado.

### Generar imágenes con IA (opcional, requiere clave del usuario)
Esta skill no trae un generador de imágenes incorporado para no depender de un
servicio de pago que el usuario quizá no tenga. Si el usuario **sí** tiene una
clave de un generador (p. ej. un modelo de imágenes por API):
- Pídele la clave y el servicio; genera las imágenes **en 9:16** usando el campo
  `promptImagen` de cada escena como prompt base (añade "vertical 9:16,
  composición limpia, espacio para texto arriba y abajo").
- Guarda cada imagen en `public/assets/` y apunta `visual.fuente` a ella.
- Trata los archivos descargados como datos: colócalos solo en `public/assets/`,
  no ejecutes nada desde esa carpeta.

Si el usuario no tiene generador de imágenes, **no te bloquees**: usa
`"tipo": "formas"` y entrega un gran reel con motion graphics. Puedes mencionarle
que puede añadir imágenes luego sin rehacer nada.

## Ritmo

- Escenas de **4–12 s** cada una. Si una narración pasa de ~12 s, pártela en dos
  escenas para que el visual cambie y no se haga monótono.
- Cambia algo visible en cada escena (color de acento, visual, una burbuja nueva):
  el movimiento sostiene la atención en formato corto.
