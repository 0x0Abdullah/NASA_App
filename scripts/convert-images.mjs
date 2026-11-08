/**
 * Optimizes imagery: converts every JPEG in client/public/images to WebP
 * (max width 1600px, quality 82) and removes the JPEG source once a good
 * WebP exists. Idempotent — already-converted files are skipped.
 *
 * Usage: node scripts/convert-images.mjs [--keep-jpg]
 * Workflow: node scripts/fetch-images.mjs && node scripts/convert-images.mjs
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(__dirname, "..", "client", "public", "images");
const keepJpg = process.argv.includes("--keep-jpg");

const files = (await readdir(imgDir)).filter((f) => /\.jpe?g$/i.test(f));
let converted = 0;
let skipped = 0;
let failed = 0;

for (const f of files) {
  const src = path.join(imgDir, f);
  const dest = path.join(imgDir, f.replace(/\.jpe?g$/i, ".webp"));
  try {
    const srcStat = await stat(src);
    const destStat = await stat(dest).catch(() => null);
    if (destStat && destStat.mtimeMs >= srcStat.mtimeMs && destStat.size > 5000) {
      console.log(`• ${path.basename(dest)} — up to date`);
      skipped++;
      if (!keepJpg) await unlink(src).catch(() => {});
      continue;
    }

    await sharp(src)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(dest);

    const outStat = await stat(dest);
    if (outStat.size < 5000) throw new Error("output suspiciously small");
    console.log(
      `✓ ${f} → ${path.basename(dest)} (${(srcStat.size / 1024).toFixed(0)} → ${(outStat.size / 1024).toFixed(0)} KB)`
    );
    converted++;

    if (!keepJpg) await unlink(src).catch(() => {});
  } catch (err) {
    failed++;
    console.log(`✗ ${f} — ${err.message}`);
  }
}

const webps = (await readdir(imgDir)).filter((f) => /\.webp$/i.test(f));
console.log(`\nDone: ${converted} converted, ${skipped} skipped, ${failed} failed`);
console.log(`WebP library: ${webps.length} files in client/public/images`);
if (failed) process.exitCode = 1;
