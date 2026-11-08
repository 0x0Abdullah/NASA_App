/** A11y probe: focus trap, dialog roles, skip link, aria-pressed. */
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
};

await send("Page.enable");
await send("Page.navigate", { url: "http://localhost:5173/" });
await delay(6000);

// 1. skip link
const skip = await evalJs(`(() => {
  const a = document.querySelector('a[href="#main-content"]');
  return JSON.stringify({ found: !!a, mainId: !!document.getElementById('main-content') });
})()`);

// 2. open story modal
await evalJs(`(() => { document.querySelector('#stories').scrollIntoView(); return true; })()`);
await delay(800);
await evalJs(`(() => { const btns=[...document.querySelectorAll('#stories button')]; const card=btns.find(b=>b.querySelector('img')); card.click(); return true; })()`);
await delay(1200);

const modal = await evalJs(`(() => {
  const d = document.querySelector('[role="dialog"][aria-modal="true"]');
  if (!d) return JSON.stringify({ dialog: false });
  const focusables = d.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
  return JSON.stringify({
    dialog: true,
    label: d.getAttribute('aria-label'),
    focusIn: d.contains(document.activeElement),
    active: document.activeElement.tagName + (document.activeElement.getAttribute('aria-label') ? ':' + document.activeElement.getAttribute('aria-label') : ''),
    focusables: focusables.length,
  });
})()`);

// 3. Tab through everything — focus must never escape the dialog
const trap = await evalJs(`(async () => {
  const d = document.querySelector('[role="dialog"][aria-modal="true"]');
  const results = [];
  for (let i = 0; i < 15; i++) {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 40));
    results.push(d.contains(document.activeElement) || document.activeElement === d);
  }
  // hostile case: focus parked OUTSIDE the dialog, Tab must pull it back
  const outside = document.querySelector('#stories button');
  outside.focus();
  const wasOutside = !d.contains(document.activeElement);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  await new Promise(r => setTimeout(r, 60));
  const pulledBack = d.contains(document.activeElement) || document.activeElement === d;
  return JSON.stringify({ allInside: results.every(Boolean), escapes: results.filter(x => !x).length, wasOutside, pulledBack });
})()`);

// 4. Escape closes + focus restored
const esc = await evalJs(`(async () => {
  const before = document.activeElement.tagName;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise(r => setTimeout(r, 700));
  const dialogGone = !document.querySelector('[role="dialog"][aria-modal="true"]');
  return JSON.stringify({ dialogGone, focusRestoredTo: document.activeElement.tagName, bodyOverflow: document.body.style.overflow || '(empty)' });
})()`);

// 5. aria-pressed states
const pressed = await evalJs(`(() => {
  const story = [...document.querySelectorAll('#stories button[aria-pressed]')].map(b => b.getAttribute('aria-pressed'));
  const tl = [...document.querySelectorAll('#timeline button[aria-pressed]')].map(b => b.getAttribute('aria-pressed'));
  const gal = [...document.querySelectorAll('#gallery button[aria-pressed]')].map(b => b.getAttribute('aria-pressed'));
  return JSON.stringify({ story, tl, gal });
})()`);

console.log("skip-link:", skip);
console.log("modal:", modal);
console.log("trap:", trap);
console.log("escape:", esc);
console.log("aria-pressed:", pressed);
ws.close();
process.exit(0);
