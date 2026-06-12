# bfood-web

Sitio web de BFood Consultoría Alimentaria — https://www.bfood.com.ar

Sitio estático (HTML) desplegado en Vercel.

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
