/** Probe: newsletter subscribe states + theme toggle. */
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

const setMail = (v) =>
  evalJs(`(() => {
    const i = document.getElementById('newsletter-email');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(i, ${JSON.stringify(v)});
    i.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);

const readMsg = () =>
  evalJs(`(() => { const p = document.querySelector('form[novalidate] p[aria-live]'); return p ? p.textContent : null; })()`);

const submit = () =>
  evalJs(`(() => { document.querySelector('form[novalidate]').requestSubmit(); return true; })()`);

await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });
await delay(6000);
await evalJs(`(() => { document.querySelector('footer').scrollIntoView(); return true; })()`);
await delay(600);

// 1. invalid email
await setMail("not-an-email");
await submit();
await delay(700);
const invalid = await readMsg();

// 2. valid email
await setMail("test.person@example.com");
await submit();
await delay(900);
const valid = await readMsg();

// 3. duplicate
await setMail("test.person@example.com");
await submit();
await delay(900);
const dup = await readMsg();

// 4. server persisted it?
const subs = await evalJs(`fetch('/api/subscribe', { method: 'GET' }).then(r => r.status).catch(e => 'ERR:' + e.message)`);

// 5. theme toggle
const before = await evalJs(`document.documentElement.className`);
await evalJs(`(() => { document.querySelector('footer button[aria-label*="theme"]').click(); return true; })()`);
await delay(600);
const after = await evalJs(`JSON.stringify({ cls: document.documentElement.className, stored: localStorage.getItem('anf-theme'), colorScheme: document.documentElement.style.colorScheme })`);
const btnLabel = await evalJs(`document.querySelector('footer button[aria-label*="theme"]').textContent.trim()`);

console.log("invalid :", invalid);
console.log("valid   :", valid);
console.log("duplicate:", dup);
console.log("GET /api/subscribe status:", subs, "(404 = route not registered, expected only if server did not reload)");
console.log("theme before:", JSON.stringify(before));
console.log("theme after :", after, "| button now:", btnLabel);

ws.close();
process.exit(0);
