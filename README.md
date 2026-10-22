# bfood-web

Sitio web de BFood Consultoría Alimentaria — https://www.bfood.com.ar

Sitio estático (HTML) desplegado en Vercel.

## Plataforma de gestión (`gestion.html`)

Herramienta interna para el circuito comercial: **lead → discovery → presupuesto → seguimiento
→ alta de cliente → tareas del mes → facturación**.

Es un único archivo HTML autocontenido: se abre con doble clic (no necesita servidor, internet
ni instalación) y guarda todo en el `localStorage` del navegador. No se publica en el sitio —
está excluido del deploy (`.vercelignore`) y de la auditoría de SEO.

Qué incluye:

- **Panel** con lo que requiere atención: presupuestos sin respuesta, seguimientos pautados, facturas vencidas y ajustes de honorarios pendientes.
- **Embudo** con los estados reales de la planilla de seguimiento (primer contacto → discovery → presupuesto enviado → verbal → ganado, más no califica, alianza, no contesta y perdido), cada uno con su probabilidad de cierre. Calcula el **ticket anual en dólares** (×12 para los servicios mensuales) y el **ponderado** con las mismas fórmulas de la planilla, y filtra por fuente, servicio y texto.
- **Importación del embudo**: *Datos → Importar embudo (CSV)* lee la planilla exportada tal como está. Muestra una vista previa, no duplica lo ya cargado (clave: cliente + fecha + servicio) y opcionalmente da de alta cliente, proyecto y factura por cada lead ganado.
- **Presupuestos** armados desde un catálogo de 16 servicios, con alcance, entregables, plan de trabajo, hitos de pago y vista imprimible que se exporta a PDF con `Ctrl+P`. Cotiza por monto fijo, por horas o por planes, en pesos o dólares. Un presupuesto puede **combinar varios servicios** del catálogo —se eligen con casillas al crearlo, o se suman después—, y los ítems marcados como **mensuales** se separan del total: los hitos se calculan sobre el trabajo único y el abono se factura aparte cada mes.
- **Alta de cliente**: al aceptar un presupuesto se crean el cliente, el proyecto, las tareas de cada fase y el plan de facturación de cada hito. Marcar un lead como *Ganado* ofrece el mismo alta sin pasar por un presupuesto, y el embudo avisa si quedó algún ganado sin cliente activo.
- **Mi mes**: checklist mensual por cliente. Los servicios recurrentes (Dirección Técnica, auditorías, SGC) regeneran sus tareas y su abono cada mes.
- **Facturación**: se registra el comprobante emitido en ARCA y después el cobro; controla vencimientos y totales por moneda.

> **Respaldo:** los datos viven solo en ese navegador. Desde *Datos → Descargar respaldo* se
> baja un `.json` que después se restaura desde la misma pantalla. Conviene hacerlo seguido.

## Rótulos y fichas técnicas (`rotulos.html`)

Herramienta interna para armar el rotulado de los productos de cada cliente según el Capítulo V
del CAA (Res. GMC 26/03, 46/03 y 47/03) y la Ley 27.642 (Decreto 151/22). Igual que la plataforma
de gestión: un único HTML que se abre con doble clic, guarda todo en el `localStorage` del navegador
y está excluido del deploy y de la auditoría de SEO.

- **Materias primas**: base compartida con valores cada 100 g, alérgenos, "puede contener", aditivos
  (función + INS), ingredientes compuestos y aptitud Sin TACC. Se importa desde la planilla
  "CALCULO TABLAS NUTRICIONALES" (hoja *1-Ingredientes*) pegando la hoja, con el CSV o con el link
  público de Google Sheets. Cada materia prima se controla: energía que no cierra con los
  macronutrientes, azúcares mayores que los carbohidratos, carbohidratos que incluyen la fibra,
  ácidos grasos mayores que las grasas totales, alérgenos que faltan según el nombre, duplicados.
- **Productos**: fórmula en gramos y rendimiento del proceso → tabla nutricional por porción con %VD,
  redondeo y valores no significativos; sellos de advertencia y leyendas de edulcorantes y cafeína;
  lista de ingredientes en orden decreciente (compuestos entre paréntesis, aditivos por función);
  "CONTIENE…" / "PUEDE CONTENER…"; controles de datos obligatorios, Sin TACC y restricciones de
  productos con sellos.
- **Clientes**: datos del titular y su **logo**, que encabeza los documentos. La marca BFood no
  aparece en ninguna salida.
- **Salidas imprimibles** (`Ctrl+P` → PDF): maqueta del rótulo (cara principal y panel de
  información, más los textos para el diseñador) y ficha técnica con especificaciones
  fisicoquímicas y microbiológicas.
- **Criterios**: umbrales de los sellos editables (por defecto, los valores finales del
  Decreto 151/22).

> **Respaldo:** igual que en gestión, desde *Datos → Descargar respaldo*.

## Auditoría automática de SEO/GEO

El repositorio incluye un auditor de SEO y GEO (optimización para motores de IA) que revisa todas las páginas:

```bash
node scripts/seo-audit.mjs                          # mostrar reporte en consola
node scripts/seo-audit.mjs --report seo-report.md   # además guardar el reporte
```

Qué revisa:

- **Metadatos**: title y meta description (presencia y largo), canonical, Open Graph, viewport, idioma
- **Datos estructurados**: que el JSON-LD exista y sea válido (clave para Google y para que ChatGPT/Claude/Perplexity citen el sitio)
- **Estructura**: un solo `<h1>` por página, atributos `alt` en imágenes, HTML bien formado
- **Enlaces internos rotos** y recursos faltantes
- **Sitemap**: que incluya todas las páginas y no tenga URLs huérfanas
- **robots.txt y llms.txt**

### Automatización (GitHub Actions)

- **`.github/workflows/seo-audit.yml`** — corre la auditoría en cada push a `main`, todos los lunes, o manualmente desde la pestaña Actions. Si encuentra errores, abre (o actualiza) un issue con el reporte completo y marca el build en rojo.
- **`.github/workflows/seo-autofix.yml`** — cuando la auditoría falla, Claude corrige los errores automáticamente y abre un pull request con los cambios. Requiere configurar el secret `ANTHROPIC_API_KEY` en *Settings → Secrets and variables → Actions* (si no está configurado, este paso simplemente se omite).

### Archivos SEO/GEO

| Archivo | Para qué sirve |
|---|---|
| `sitemap.xml` | Lista de páginas para Google (mantener al día al agregar páginas) |
| `robots.txt` | Permite la indexación y referencia el sitemap |
| `llms.txt` | Resumen del sitio para motores de IA (actualizar al agregar servicios o recursos) |

**Al agregar una página nueva**: agregala también a `sitemap.xml` y a `llms.txt` — si te olvidás del sitemap, la auditoría te lo va a marcar como error.
