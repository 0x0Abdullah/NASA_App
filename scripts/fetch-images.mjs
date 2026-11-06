/**
 * Downloads public-domain NASA imagery into client/public/images.
 * Uses the NASA Images API (https://images.nasa.gov).
 *
 * Usage: node scripts/fetch-images.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "client", "public", "images");

/** file name → search query (first good result wins) */
const TARGETS = [
  { file: "apollo11-lm.jpg", q: "Apollo 11 lunar module descent stage", pick: 0 },
  { file: "lunar-rover.jpg", q: "lunar roving vehicle Apollo 17 Moon", pick: 0 },
  { file: "apollo17-plaque.jpg", q: "Apollo 17 lunar rover memorial plaque wheel", pick: 0 },
  { file: "bootprints.jpg", q: "bootprint lunar soil Apollo", pick: 0 },
  { file: "opportunity.jpg", q: "Mars Exploration Rover Opportunity", pick: 0 },
  { file: "spirit.jpg", q: "Spirit rover self portrait Mars", pick: 0 },
  { file: "sojourner.jpg", q: "Sojourner rover Mars Pathfinder", pick: 0 },
  { file: "viking.jpg", q: "Viking lander Mars surface", pick: 0 },
  { file: "ingenuity.jpg", q: "Ingenuity Mars helicopter", pick: 0 },
  { file: "phoenix.jpg", q: "Phoenix lander Mars north polar", pick: 0 },
  { file: "insight.jpg", q: "InSight lander Mars", pick: 0 },
  { file: "sample-depot.jpg", q: "Perseverance sample tube depot Mars", pick: 0 },
];

async function search(q) {
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`search failed ${res.status}`);
  const json = await res.json();
  return json.collection.items ?? [];
}

async function bestAsset(item) {
  // prefer the direct image links shipped on the search result
  const direct = (item.links ?? []).map((l) => l.href).filter((h) => h && /\.(jpg|png)/i.test(h));
  const rank = (h) => {
    if (h.includes("~medium")) return 0;
    if (h.includes("~large")) return 1;
    if (h.includes("~orig")) return 2;
    if (h.includes("~small")) return 3;
    return 4;
  };
  if (direct.length) {
    direct.sort((a, b) => rank(a) - rank(b));
    return direct[0].replace(/^http:/, "https:");
  }

  // fallback: read the asset manifest (a plain JSON array of URLs)
  const res = await fetch(item.href);
  if (!res.ok) return null;
  const hrefs = (await res.json()).filter?.((h) => typeof h === "string") ?? [];
  const jpgs = hrefs.filter((h) => /\.(jpg|png)/i.test(h));
  if (!jpgs.length) return null;
  jpgs.sort((a, b) => rank(a) - rank(b));
  return jpgs[0].replace(/^http:/, "https:");
}

async function run() {
  await mkdir(outDir, { recursive: true });
  let ok = 0;
  let fail = 0;

  for (const t of TARGETS) {
    const dest = path.join(outDir, t.file);
    try {
      const items = await search(t.q);
      if (!items.length) throw new Error("no results");

      // try chosen index first, then fall back to others
      const order = [t.pick, ...items.map((_, i) => i).filter((i) => i !== t.pick)];
      let downloaded = false;
      for (const i of order.slice(0, 4)) {
        const asset = await bestAsset(items[i]);
        if (!asset) continue;
        const imgRes = await fetch(asset);
        if (!imgRes.ok) continue;
        const buf = Buffer.from(await imgRes.arrayBuffer());
        if (buf.byteLength < 5000) continue;
        await writeFile(dest, buf);
        console.log(`✓ ${t.file}  (${(buf.byteLength / 1024).toFixed(0)} KB)`);
        downloaded = true;
        break;
      }
      if (!downloaded) throw new Error("no downloadable asset");
      ok++;
    } catch (err) {
      fail++;
      console.log(`✗ ${t.file} — ${err.message}`);
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

run();
