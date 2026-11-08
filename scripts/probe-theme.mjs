/** Verify light-theme rendering across all sections via computed styles. */
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

const report = await evalJs(`(() => {
  const rgb = (el, prop) => getComputedStyle(el)[prop];
  const out = { theme: document.documentElement.className };

  // global
  out.bodyBg = rgb(document.body, 'backgroundColor');
  out.bodyColor = rgb(document.body, 'color');

  // timeline card panel
  const tl = document.querySelector('#timeline .panel');
  if (tl) {
    out.timeline = {
      panelBg: rgb(tl, 'backgroundImage').slice(0, 70),
      panelBgColor: rgb(tl, 'backgroundColor'),
      yearColor: rgb(tl.querySelector('span'), 'color'),
      titleColor: rgb(tl.querySelector('h3'), 'color'),
      summaryColor: rgb(tl.querySelector('p'), 'color'),
    };
    out.timelineHeading = rgb(document.querySelector('#timeline h2'), 'backgroundImage').slice(0, 70);
    const active = document.querySelector('#timeline button[aria-pressed="true"]');
    out.timelineActiveFilter = { color: rgb(active, 'color'), border: rgb(active, 'borderColor') };
  }

  // stories card
  const card = [...document.querySelectorAll('#stories article, #stories a, #stories button')].find(e => e.className && String(e.className).includes('panel'));
  const storyTitle = [...document.querySelectorAll('#stories h3')][0];
  if (storyTitle) out.storyTitle = rgb(storyTitle, 'color');
  const storySearch = document.querySelector('#stories input[type=search]');
  if (storySearch) out.storySearch = { color: rgb(storySearch, 'color'), bg: rgb(storySearch, 'backgroundColor') };
  const storyH2 = document.querySelector('#stories h2');
  if (storyH2) out.storiesHeading = rgb(storyH2, 'backgroundImage').slice(0, 70);

  // gallery
  const galImg = document.querySelector('#gallery img');
  if (galImg) {
    const caption = galImg.parentElement.querySelector('p');
    out.galleryCaption = caption ? rgb(caption, 'color') : null;
  }
  const galH2 = document.querySelector('#gallery h2');
  if (galH2) out.galleryHeading = rgb(galH2, 'backgroundImage').slice(0, 70);

  // footer / newsletter
  const nl = document.querySelector('#newsletter-email');
  if (nl) out.newsletter = { color: rgb(nl, 'color'), bg: rgb(nl, 'backgroundColor'), placeholderVisible: !!nl.placeholder };
  const footerBtn = document.querySelector('footer button[aria-label*="theme"]');
  if (footerBtn) out.themeBtn = { text: footerBtn.textContent.trim(), color: rgb(footerBtn, 'color') };
  const footerH2 = document.querySelector('footer h2');
  if (footerH2) out.footerHeading = rgb(footerH2, 'backgroundImage').slice(0, 70);
  const cta = document.querySelector('footer .cta-gradient');
  if (cta) out.footerCta = { bg: rgb(cta, 'backgroundImage').slice(0, 70), color: rgb(cta, 'color') };

  // hangar
  const hangarDd = document.querySelector('#hangar dd');
  if (hangarDd) out.hangarSpecValue = rgb(hangarDd, 'color');
  const hangarBlurb = document.querySelector('#hangar p');
  if (hangarBlurb) out.hangarBlurb = rgb(hangarBlurb, 'color');

  // quote
  const quote = document.querySelector('blockquote p');
  if (quote) out.quote = rgb(quote, 'color');

  // stats
  const statLabel = [...document.querySelectorAll('main p')].find(p => p.className.includes('text-[13px]'));
  if (statLabel) out.statLabel = rgb(statLabel, 'color');

  // navbar
  const navLink = document.querySelector('nav a, header a');
  if (navLink) out.navLink = rgb(navLink, 'color');

  // no leftover white-on-light text (heuristic: white text NOT over an image)
  const whites = [...document.querySelectorAll('main *, footer *')]
    .filter(el => el.children.length === 0 && (rgb(el, 'color') === 'rgb(255, 255, 255)'))
    .filter(el => {
      let p = el, overImage = false;
      while (p && p !== document.body) {
        if (p.tagName === 'IMG' || (p.className && String(p.className).includes('gradient-to-t'))) { overImage = true; break; }
        p = p.parentElement;
      }
      return !overImage;
    })
    .map(el => (el.tagName + ':' + (el.textContent || '').trim().slice(0, 30)));
  out.whiteTextSuspects = whites;

  return JSON.stringify(out, null, 1);
})()`);
console.log(report);
ws.close();
process.exit(0);
