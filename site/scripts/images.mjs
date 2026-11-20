/**
 * Builds AVIF + WebP at 400 / 800 / 1200 wide from the photos already in the repo.
 * Run: npm run images
 * Each file is pushed under 100 KB. Widths the source cannot fill are skipped.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.resolve(root, '../frontend/public/images/lumba');
const outDir = path.join(root, 'src/assets/lumba');

const jobs = [
  ['main.webp', 'hero'],
  ['columns-closeup.webp', 'columns'],
  ['kit.webp', 'kit'],
  ['how.webp', 'how'],
];

const widths = [400, 800, 1200];
const cap = 100 * 1024;

async function underCap(pipeline, format) {
  let quality = format === 'avif' ? 48 : 64;
  let buffer = await encode(pipeline, format, quality);
  while (buffer.length > cap && quality > 24) {
    quality -= 6;
    buffer = await encode(pipeline, format, quality);
  }
  return { buffer, quality };
}

function encode(pipeline, format, quality) {
  const branch = pipeline.clone();
  if (format === 'avif') {
    return branch.avif({ quality, effort: 5, chromaSubsampling: '4:2:0' }).toBuffer();
  }
  return branch.webp({ quality, effort: 4 }).toBuffer();
}

await mkdir(outDir, { recursive: true });

for (const [file, name] of jobs) {
  const input = path.join(srcDir, file);
  const meta = await sharp(input).metadata();
  console.log(`\n${file} source ${meta.width}x${meta.height}`);
  for (const width of widths) {
    if (!meta.width || meta.width < width - 8) {
      console.log(`  skip ${width}w (source is ${meta.width}px)`);
      continue;
    }
    const pipeline = sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true });
    for (const format of ['avif', 'webp']) {
      const { buffer, quality } = await underCap(pipeline, format);
      const dest = path.join(outDir, `${name}-${width}.${format}`);
      await writeFile(dest, buffer);
      const out = await sharp(buffer).metadata();
      console.log(
        `  ${name}-${width}.${format}  ${out.width}x${out.height}  ${(buffer.length / 1024).toFixed(1)} KB  q${quality}`,
      );
    }
  }
}
