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
- **Leads** con el embudo (nuevo → discovery → presupuesto → negociación → aceptado) y notas de seguimiento.
- **Presupuestos** armados desde un catálogo de 16 servicios, con alcance, entregables, plan de trabajo, hitos de pago y vista imprimible que se exporta a PDF con `Ctrl+P`. Cotiza por monto fijo, por horas o por planes, en pesos o dólares.
- **Alta de cliente**: al aceptar un presupuesto se crean el cliente, el proyecto, las tareas de cada fase y el plan de facturación de cada hito.
- **Mi mes**: checklist mensual por cliente. Los servicios recurrentes (Dirección Técnica, auditorías, SGC) regeneran sus tareas y su abono cada mes.
- **Facturación**: se registra el comprobante emitido en ARCA y después el cobro; controla vencimientos y totales por moneda.

> **Respaldo:** los datos viven solo en ese navegador. Desde *Datos → Descargar respaldo* se
> baja un `.json` que después se restaura desde la misma pantalla. Conviene hacerlo seguido.

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
