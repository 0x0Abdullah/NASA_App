/**
 * Headless Chrome screenshot helper via CDP.
 *
 * Usage:
 *   1. start chrome: chrome --headless=new --remote-debugging-port=9222 --window-size=1440,900 about:blank
 *   2. node scripts/shot.mjs <url> <outPng> [selector|pixels] [jsBefore]
 */
const [, , url, out, target = "0", jsBefore = ""] = process.argv;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const tabs = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const tab = tabs.find((t) => t.type === "page");
if (!tab) throw new Error("no devtools page target");

const ws = new WebSocket(tab.webSocketDebuggerUrl);
let seq = 0;
const pending = new Map();

ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  }
});

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

await new Promise((res, rej) => {
  ws.addEventListener("open", res);
  ws.addEventListener("error", rej);
});

await send("Page.enable");
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);
await send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: process.env.MOBILE === "1",
});
await send("Page.navigate", { url });
await delay(5500);

if (jsBefore) {
  await send("Runtime.evaluate", { expression: jsBefore });
  await delay(2200);
}

if (target !== "0") {
  const isSelector = target.startsWith("#") || target.startsWith(".");
  const expression = isSelector
    ? `(() => { const el = document.querySelector(${JSON.stringify(target)}); if (!el) return 'missing:' + ${JSON.stringify(target)}; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'instant' }); return window.scrollY; })()`
    : `window.scrollTo({ top: ${Number(target)}, behavior: 'instant' })`;
  const r = await send("Runtime.evaluate", { expression, returnByValue: true });
  console.log("scrolled to:", r.result.value);
  await delay(2600);
}

const shot = await send("Page.captureScreenshot", { format: "png" });
const { writeFile } = await import("node:fs/promises");
await writeFile(out, Buffer.from(shot.data, "base64"));
console.log("saved", out);
ws.close();
process.exit(0);
