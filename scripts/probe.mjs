/** One-off CDP probe: diagnose layout around #hangar. Usage: node scripts/probe.mjs [scrollY] */
const scrollArg = Number(process.argv[2] ?? 7800);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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

await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });
await delay(6000);

await send("Runtime.evaluate", { expression: `window.scrollTo({top:${scrollArg}, behavior:'instant'})` });
await delay(3000);

const expr = `(() => {
  const q = (s) => document.querySelector(s);
  const pos = (s) => { const el = q(s); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; };
  return JSON.stringify({
    scrollY: Math.round(scrollY),
    bodyH: document.body.scrollHeight,
    hangar: pos('#hangar'),
    gallery: pos('#gallery'),
    quote: pos('blockquote'),
    canvasCount: document.querySelectorAll('canvas').length,
    hangarCanvas: !!q('#hangar canvas'),
    lazyBusy: !!q('[aria-busy="true"]'),
    errText: (document.body.innerText.match(/error|failed/i) || [])[0] || null,
  }, null, 1);
})()`;
const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
console.log(r.result.value);
ws.close();
process.exit(0);
