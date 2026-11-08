/** Diagnose hero gradient-title computed styles. */
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
const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });
await delay(6500);

const out = await evalJs(`(() => {
  const probe = (el, name) => {
    if (!el) return { name, missing: true };
    const cs = getComputedStyle(el);
    const firstLetter = el.querySelector('span');
    const lcs = firstLetter ? getComputedStyle(firstLetter) : null;
    return {
      name,
      clip: cs.backgroundClip || cs.webkitBackgroundClip,
      webkitClip: cs.webkitBackgroundClip,
      bgImage: cs.backgroundImage.slice(0, 90),
      color: cs.color,
      filter: cs.filter,
      textShadow: (cs.textShadow || 'none').slice(0, 80),
      childTransform: lcs ? lcs.transform : null,
      childColor: lcs ? lcs.color : null,
      childFilter: lcs ? lcs.filter : null,
      childShadow: lcs ? (lcs.textShadow || 'none').slice(0, 80) : null,
      childDisplay: lcs ? lcs.display : null,
    };
  };
  const h1a = document.querySelector('h1 .gradient-title');
  const h1b = document.querySelector('h1 .gradient-title-mars');
  const stories = [...document.querySelectorAll('h2')].find(h => h.className.includes('gradient-title'));
  return JSON.stringify({
    htmlClass: document.documentElement.className,
    heroLine1: probe(h1a, 'heroLine1'),
    heroLine2: probe(h1b, 'heroLine2'),
    storiesH2: probe(stories, 'storiesH2'),
    storiesClass: stories ? stories.className : null,
  }, null, 1);
})()`);
console.log(out);
ws.close();
process.exit(0);
