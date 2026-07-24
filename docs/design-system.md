# BFood — Design System

Guía única de identidad de marca para BFood Consultoría Alimentaria. El objetivo de este documento es que, cada vez que le pidas a Claude que arme algo (un presupuesto en Word, una presentación, una landing nueva, un email), tenga una sola referencia de colores, tipografía y voz — así todo lo que sale tiene la misma cara, sin importar el formato.

> **Cómo usarlo**: cuando le pidas a Claude "armame esto siguiendo el design system de BFood", decile que lea este archivo (`docs/design-system.md`). Si el pedido es una presentación .pptx, también existe una versión más detallada en `references/bfood_brand.md` dentro de la skill `propuesta-cliente-bfood` — este documento es el que unifica ambas.

---

## 1. Marca

**Quién es**: Lucía Osinalde, Ingeniera en Alimentos. Directora Técnica matriculada ante DIPA (Provincia de Buenos Aires) y AGC (CABA).

**Posicionamiento**: BFood no es un menú de trámites sueltos (RNE, RNPA, BPM, HACCP). Es un acompañamiento de punta a punta, desde el origen del proyecto hasta que la planta funciona sola.

**Tagline**: *"No soy una tramitadora. Soy la aliada que acompaña el journey completo."*

**Regla de oro de contenido**: si un mensaje podría ser para cualquier empresa del rubro, no es para nadie. Siempre algo específico para ese cliente.

---

## 2. Logo / wordmark

BFood no tiene un isotipo separado — la marca es un **wordmark tipográfico**:

- `BFood` en **Cormorant Garamond** (serif, bold), con el punto final (`.`) en verde primario.
- Debajo o al lado, en mayúsculas pequeñas trackeadas: `CONSULTORÍA ALIMENTARIA` (Outfit, letter-spacing amplio).
- Favicon: círculo/ícono simplificado en `favicon.png` / `favicon.ico` (raíz del repo) — usar como ícono cuando se necesite un símbolo sin texto.

No inventar isotipos, íconos ni variantes de logo nuevas — si un formato necesita un símbolo, usar el favicon existente.

---

## 3. Paleta de colores

BFood usa **dos paletas hermanas**, no una sola, porque las pantallas RGB y el papel/PPT necesitan contraste distinto. No es un error de consistencia — es intencional. La regla simple:

- **¿Es una página web?** → Paleta Web.
- **¿Es un Word, PDF o PowerPoint?** → Paleta Documentos.

### 3.1 Paleta Web (bfood.com.ar)

| Token | Hex | Uso |
|---|---|---|
| Verde primario | `#209D5C` | Botones, links, acentos, CTA |
| Verde hover/dark | `#167A47` | Hover de botones y links |
| Verde deep | `#0D5230` | Fondos fuertes (hero derecho, bandas oscuras) |
| Verde clarito | `#D8F3E5` | Fondos suaves, chips |
| Texto principal | `#272525` | Cuerpo de texto |
| Texto secundario | `#3A3A3A` / `#4A4A4A` | Párrafos largos, subtítulos |
| Fondo off-white | `#F7FAF9` | Secciones alternadas |
| Blanco | `#FFFFFF` | Fondo base |
| Negro | `#000000` | Titulares (`h1`, `h2`) |
| Borde sutil | `rgba(32,157,92,.13)` | Separadores, bordes de cards |

### 3.2 Paleta Documentos y Presentaciones (Word / PDF / PPTX)

| Token | Hex | Uso |
|---|---|---|
| Verde primario | `#1F7A4D` | Headers, títulos, elementos de marca |
| Verde oscuro | `#164B30` | Fondos fuertes, portadas |
| Verde clarito | `#E8F5E9` | Cajas suaves, fondos de sección |
| Verde apagado | `#B8D9C5` | Texto sobre fondo verde oscuro |
| Crema (fondo base) | `#FAF8F3` | Fondo principal de slides/páginas — nunca blanco puro |
| Texto oscuro | `#2C3E2F` | Cuerpo de texto |
| Texto secundario | `#6B7B6E` | Captions, notas al pie |
| **Acento terracota** | `#B85042` | Únicamente para destacar (plan recomendado, CTA) — máximo 1-2 usos por página/slide |
| Borde sutil | `#E0E5E0` | Líneas divisorias |
| Blanco | `#FFFFFF` | Texto sobre fondos oscuros |

**Regla de dominancia**: el verde manda. El terracota es condimento, no protagonista — nunca dos colores con el mismo peso visual en la misma pieza.

---

## 4. Tipografía

| Contexto | Tipografía | Notas |
|---|---|---|
| **Web** — títulos | Cormorant Garamond (serif, 600/700, a veces itálica) | Headlines, slogans, números destacados |
| **Web** — cuerpo/UI | Outfit (sans, 300–600) | Párrafos, botones, nav, formularios |
| **Word / PDF / PPT** | Calibri | Fuente universal, evita problemas de compatibilidad al abrir en cualquier PC. **Nunca usar una serif "elegante" en documentos** — es el error más común a evitar. |

Jerarquía típica en documentos (Word/PPT):

- Títulos: 28–36 pt, bold
- Headers de sección/cards: 15–22 pt, bold
- Cuerpo: 11–13 pt
- Captions / pie de página: 9–10 pt
- Etiquetas tipo "INCLUYE", "FORMA DE PAGO": mayúsculas con tracking amplio

---

## 5. Voz y tono

- **Trato**: siempre **vos** — nunca "usted" ni "tú".
- **Frases cortas**, sin rodeos, sin jerga marketinera vacía ("soluciones integrales de excelencia" está prohibido).
- **Tono**: profesional, cálido, directo. Ni informal de más, ni acartonado.
- **Honestidad primero**: no prometer lo que no se puede cumplir. Si hay un número sin confirmar, dejar `[CONFIRMAR CON LU: dato]` en vez de inventarlo.
- **Precisión regulatoria**: nunca decir "ANMAT" para trámites alimentarios argentinos — es **INAL**, **DIPA** (PBA) o **AGC** (CABA) según el caso. No negociable.

**Ejemplo correcto**: *"El Carnet de Manipulación de Alimentos es obligatorio para toda la cadena agroalimentaria. Pero la diferencia no está en tenerlo — está en que el personal entienda su proceso específico, no solo la ley."*

**Ejemplo a evitar**: *"¡Somos la consultora líder en inocuidad alimentaria! Brindamos soluciones integrales de excelencia..."*

---

## 6. Componentes web (para bfood.com.ar)

Definidos en el `<style>` de cada página del sitio (`--g`, `--gd`, `--gdp`, etc. son las variables CSS de la paleta web):

- **Botones**: `.btn-primary` (verde sólido), `.btn-outline` (borde, transparente), `.btn-outline-white` / `.btn-white` (sobre fondos oscuros). Radio de borde chico (2px) — nada de bordes muy redondeados.
- **Nav**: fijo arriba, fondo gris oscuro `#555`, borde inferior verde de 2px.
- **Cards / secciones**: fondo alterna entre blanco y `--ow` (`#F7FAF9`), separadas por `border` sutil en verde translúcido.
- Todo texto en mayúsculas usa `letter-spacing` amplio (`.06em`–`.22em`) para el look editorial.

Si vas a crear una página nueva del sitio, reusar estas clases en vez de inventar estilos nuevos — todas las páginas del repo comparten exactamente esta misma paleta y estructura hoy.

---

## 7. Checklist rápido antes de generar algo nuevo

1. ¿Es web o documento/presentación? → elegir la paleta correspondiente (sección 3).
2. ¿La tipografía es Calibri (documentos) o Cormorant+Outfit (web)? Nunca mezclar.
3. ¿El terracota aparece más de 1-2 veces en la misma pieza? Si sí, sacar.
4. ¿El texto suena como algo que Lucía diría en vos? Releer en voz alta.
5. ¿Hay algún dato (precio, plazo) sin confirmar? Marcarlo como placeholder, no inventarlo.
6. ¿Se mencionó "ANMAT" en vez de INAL/DIPA/AGC? Corregir.
