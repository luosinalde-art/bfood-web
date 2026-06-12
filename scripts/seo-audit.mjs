#!/usr/bin/env node
/**
 * Auditor de SEO y GEO (Generative Engine Optimization) para bfood.com.ar
 *
 * Revisa todas las páginas HTML del sitio y verifica:
 *  - Metadatos: title, description, canonical, Open Graph, lang, viewport
 *  - Datos estructurados (JSON-LD) válidos
 *  - Estructura: un solo <h1>, atributos alt en imágenes
 *  - Sitemap: que incluya todas las páginas y no tenga URLs huérfanas
 *  - Enlaces internos rotos
 *  - Archivos para buscadores y motores de IA: robots.txt, llms.txt
 *
 * Uso:  node scripts/seo-audit.mjs [--report seo-report.md]
 * Sale con código 1 si hay errores (para usar en CI).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const BASE_URL = 'https://www.bfood.com.ar';

const TITLE_MIN = 30, TITLE_MAX = 65;
const DESC_MIN = 70, DESC_MAX = 165;

const errors = [];   // problemas que afectan SEO de forma directa
const warnings = []; // mejoras recomendadas

function err(page, msg)  { errors.push({ page, msg }); }
function warn(page, msg) { warnings.push({ page, msg }); }

// ---------- utilidades ----------

function findHtmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'scripts' || name === 'git') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...findHtmlFiles(full));
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function pageUrl(file) {
  // /foo/index.html -> https://.../foo/   ;  /index.html -> https://.../
  let rel = relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return BASE_URL + '/';
  return BASE_URL + '/' + rel.replace(/index\.html$/, '');
}

function getMeta(html, attr, value) {
  const re = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*>`, 'i');
  const m = html.match(re);
  if (!m) return null;
  const c = m[0].match(/content=["']([^"']*)["']/i);
  return c ? c[1] : '';
}

// ---------- chequeos por página ----------

function auditPage(file) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(ROOT, file).replace(/\\/g, '/');
  const url = pageUrl(file);

  // estructura básica
  if (!/^<!DOCTYPE html>/i.test(html.trim())) err(page, 'Falta <!DOCTYPE html> al inicio');
  const lang = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  if (!lang) err(page, 'Falta atributo lang en <html>');

  const headMatch = html.match(/<head[\s>]/i);
  const htmlTagEnd = html.indexOf('>', html.search(/<html/i));
  if (headMatch) {
    const between = html.slice(htmlTagEnd + 1, headMatch.index).trim();
    if (between.length > 0) err(page, 'Hay contenido entre <html> y <head> (HTML malformado, los buscadores pueden ignorar los metadatos)');
  } else {
    err(page, 'Falta <head>');
  }

  // title
  const title = html.match(/<title>([^<]*)<\/title>/i);
  if (!title) err(page, 'Falta <title>');
  else {
    const len = title[1].trim().length;
    if (len < TITLE_MIN) warn(page, `Title muy corto (${len} caracteres, ideal ${TITLE_MIN}-${TITLE_MAX}): "${title[1].trim()}"`);
    if (len > TITLE_MAX) warn(page, `Title muy largo (${len} caracteres, Google corta en ~${TITLE_MAX}): "${title[1].trim().slice(0, 50)}..."`);
  }

  // meta description
  const desc = getMeta(html, 'name', 'description');
  if (desc === null) err(page, 'Falta meta description');
  else {
    if (desc.length < DESC_MIN) warn(page, `Meta description corta (${desc.length} caracteres, ideal ${DESC_MIN}-${DESC_MAX})`);
    if (desc.length > DESC_MAX) warn(page, `Meta description larga (${desc.length} caracteres, Google corta en ~${DESC_MAX})`);
  }

  // canonical
  const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
                 || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!canonical) err(page, 'Falta <link rel="canonical">');
  else if (canonical[1].replace(/\/$/, '') !== url.replace(/\/$/, '')) {
    err(page, `Canonical no coincide con la URL de la página: "${canonical[1]}" (esperado "${url}")`);
  }

  // viewport
  if (!getMeta(html, 'name', 'viewport')) err(page, 'Falta meta viewport (afecta SEO móvil)');

  // Open Graph
  for (const prop of ['og:title', 'og:description', 'og:type']) {
    if (getMeta(html, 'property', prop) === null) err(page, `Falta ${prop}`);
  }
  if (getMeta(html, 'property', 'og:url') === null) warn(page, 'Falta og:url');
  if (getMeta(html, 'property', 'og:image') === null) warn(page, 'Falta og:image (las redes y WhatsApp no mostrarán imagen al compartir)');

  // noindex accidental
  const robotsMeta = getMeta(html, 'name', 'robots');
  if (robotsMeta && /noindex/i.test(robotsMeta)) err(page, '⚠ La página tiene noindex: NO aparecerá en Google');

  // JSON-LD (clave para GEO: los motores de IA leen los datos estructurados)
  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (ldBlocks.length === 0) {
    warn(page, 'Sin datos estructurados JSON-LD (recomendado para Google y motores de IA)');
  } else {
    for (const [, block] of ldBlocks) {
      try { JSON.parse(block); }
      catch (e) { err(page, `JSON-LD inválido (${e.message.slice(0, 60)}): los buscadores lo ignorarán`); }
    }
  }

  // h1 único
  const h1s = [...html.matchAll(/<h1[\s>]/gi)];
  if (h1s.length === 0) err(page, 'Falta <h1>');
  if (h1s.length > 1) warn(page, `Hay ${h1s.length} <h1> (lo ideal es uno solo por página)`);

  // imágenes sin alt
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  const noAlt = imgs.filter(([tag]) => !/\balt=/.test(tag)).length;
  if (noAlt > 0) warn(page, `${noAlt} imagen(es) sin atributo alt`);

  // enlaces internos rotos
  const links = [...html.matchAll(/href=["'](\/[^"'#?]*)["'#?]/g)].map(m => m[1]);
  for (const link of new Set(links)) {
    if (/\.(css|js|png|jpg|jpeg|svg|ico|pdf|xml|txt|webp)$/i.test(link)) {
      if (!existsSync(join(ROOT, link))) err(page, `Recurso roto: ${link}`);
    } else {
      const dir = link.replace(/\/$/, '');
      const candidates = [join(ROOT, dir, 'index.html'), join(ROOT, dir + '.html'), join(ROOT, dir)];
      if (dir !== '' && !candidates.some(c => existsSync(c) && statSync(c).isFile())) {
        err(page, `Enlace interno roto: ${link} (no existe ${dir}/index.html)`);
      }
    }
  }

  return url;
}

// ---------- chequeos del sitio ----------

function auditSite(pageUrls) {
  // robots.txt
  const robotsPath = join(ROOT, 'robots.txt');
  if (!existsSync(robotsPath)) {
    err('/robots.txt', 'No existe robots.txt (los buscadores y bots de IA no saben qué pueden indexar)');
  } else {
    const robots = readFileSync(robotsPath, 'utf8');
    if (!/sitemap:/i.test(robots)) warn('/robots.txt', 'robots.txt no referencia el sitemap');
  }

  // llms.txt (GEO: descripción del sitio para motores de IA como ChatGPT, Claude, Perplexity)
  if (!existsSync(join(ROOT, 'llms.txt'))) {
    warn('/llms.txt', 'No existe llms.txt (recomendado para que los motores de IA citen correctamente el sitio)');
  }

  // sitemap.xml
  const sitemapPath = join(ROOT, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    err('/sitemap.xml', 'No existe sitemap.xml');
    return;
  }
  const sitemap = readFileSync(sitemapPath, 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1].replace(/\/$/, ''));
  const localUrls = pageUrls.map(u => u.replace(/\/$/, ''));

  for (const u of localUrls) {
    if (!sitemapUrls.includes(u)) err('/sitemap.xml', `Página no incluida en el sitemap: ${u}`);
  }
  for (const u of sitemapUrls) {
    if (!localUrls.includes(u)) err('/sitemap.xml', `URL en el sitemap sin página correspondiente: ${u}`);
  }
  if (!/<lastmod>/.test(sitemap)) warn('/sitemap.xml', 'El sitemap no tiene fechas <lastmod> (ayudan a Google a re-indexar cambios)');
}

// ---------- ejecución ----------

const files = findHtmlFiles(ROOT);
const urls = files.map(auditPage);
auditSite(urls);

// reporte
const lines = [];
lines.push(`# Auditoría SEO/GEO — bfood.com.ar`);
lines.push(`\nFecha: ${new Date().toISOString().slice(0, 10)} · Páginas revisadas: ${files.length}`);
lines.push(`\n**Resultado: ${errors.length} errores · ${warnings.length} advertencias**\n`);

if (errors.length) {
  lines.push(`## ❌ Errores (corregir cuanto antes)\n`);
  for (const { page, msg } of errors) lines.push(`- \`${page}\` — ${msg}`);
}
if (warnings.length) {
  lines.push(`\n## ⚠️ Advertencias (mejoras recomendadas)\n`);
  for (const { page, msg } of warnings) lines.push(`- \`${page}\` — ${msg}`);
}
if (!errors.length && !warnings.length) lines.push(`✅ Sin problemas detectados. El sitio está en buen estado de SEO/GEO.`);

const report = lines.join('\n');
console.log(report);

const reportFlag = process.argv.indexOf('--report');
if (reportFlag !== -1 && process.argv[reportFlag + 1]) {
  writeFileSync(process.argv[reportFlag + 1], report + '\n');
}

process.exit(errors.length > 0 ? 1 : 0);
