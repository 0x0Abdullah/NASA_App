/** Isolate why the hero gradient-title paints as a band. */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = await import("node:fs");
const outDir = "C:/Users/HP/AppData/Local/Temp/nasa-shots";

const tabs = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const tab = tabs.find((t) => t.type === "page");
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
const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const shot = async (name, sel = "h1") => {
  const box = await evalJs(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const r = el.getBoundingClientRect(); return JSON.stringify({ x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: Math.min(r.width + 20, 1430), height: Math.min(r.height + 20, 890), scale: 1 }); })()`);
  const clip = JSON.parse(box);
  const r = await send("Page.captureScreenshot", { format: "png", clip });
  fs.writeFileSync(`${outDir}/${name}.png`, Buffer.from(r.data, "base64"));
  console.log("saved", name, JSON.stringify(clip));
};

await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });
await delay(6500);

// 0. baseline
await shot("grad-0-baseline");

// 1. remove glow text-shadows
await evalJs(`document.querySelectorAll('h1 .text-glow-signal, h1 .text-glow-rust').forEach(e => e.classList.remove('text-glow-signal','text-glow-rust')); true`);
await delay(300);
await shot("grad-1-noglow");

// 2. flatten letter spans (kill transforms / inline-block structure)
await evalJs(`(() => { const l1 = document.querySelector('h1 .gradient-title'); l1.textContent = l1.textContent; return true; })()`);
await delay(300);
await shot("grad-2-flattext");

// 3. restore page and test: does stories h2 also band if given a glow?
await send("Page.navigate", { url: "http://localhost:5173/" });
await delay(5500);
await evalJs(`(() => { const h = [...document.querySelectorAll('h2')].find(x => x.className.includes('gradient-title')); h.classList.add('text-glow-signal'); return true; })()`);
await delay(300);
const box = await evalJs(`(() => { const h = [...document.querySelectorAll('h2')].find(x => x.className.includes('gradient-title')); h.scrollIntoView({block:'center'}); return true; })()`);
await delay(500);
await shot("grad-3-stories-with-glow", "h2.gradient-title");

ws.close();
process.exit(0);
