/** Prints gzipped JS and a rough above-the-fold weight for the Lumba page. */
import { gzipSync } from 'node:zlib';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = await walk(dist);
let jsGzip = 0;
for (const file of files) {
  if (!file.endsWith('.js')) continue;
  const buf = await readFile(file);
  const gz = gzipSync(buf).length;
  jsGzip += gz;
  console.log(`js  ${(gz / 1024).toFixed(1)} KB gzip  ${path.relative(dist, file)}`);
}
console.log(`js total ${ (jsGzip / 1024).toFixed(1) } KB gzip`);

const htmlPath = path.join(dist, 'lumba', 'index.html');
const html = await readFile(htmlPath, 'utf8');
const htmlGz = gzipSync(html).length;
const style = html.match(/<style[\s\S]*?<\/style>/);
const css = style ? Buffer.byteLength(style[0]) : 0;
console.log(`lumba html ${(html.length / 1024).toFixed(1)} KB raw, ${(htmlGz / 1024).toFixed(1)} KB gzip`);
console.log(`inlined style block ${(css / 1024).toFixed(1)} KB`);

const preload = html.match(/rel="preload"[^>]*href="([^"]+)"/);
const heroUrl = preload?.[1];
if (heroUrl) {
  const heroPath = path.join(dist, heroUrl.replace(/^\//, ''));
  const heroStat = await stat(heroPath);
  const above = htmlGz + heroStat.size;
  console.log(`hero ${heroUrl} ${(heroStat.size / 1024).toFixed(1)} KB`);
  console.log(`above-the-fold estimate (html gzip + hero) ${(above / 1024).toFixed(1)} KB`);
}
