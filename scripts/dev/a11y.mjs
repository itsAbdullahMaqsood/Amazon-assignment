// A structural accessibility sweep over the rendered pages: the checks that can
// be made from the DOM without a full axe run — accessible names, form labels,
// alt attributes, duplicate ids, the main landmark, exactly one h1 and heading
// order.
//
// Needs the same headless Chrome on port 9555 that scripts/dev/shot.mjs uses:
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --remote-debugging-port=9555 --user-data-dir=/tmp/markaz-chrome about:blank &
//
//   node scripts/dev/a11y.mjs "<session-token or empty>" /browse /cart /profile
//
// Colour contrast is a separate question and is checked against the tokens in
// styles/globals.css rather than against pixels.
const base = "http://localhost:3000";
const cookie = process.argv[2] ? `authjs.session-token=${process.argv[2]}` : "";
const pages = process.argv.slice(3);

const target = await (await fetch("http://127.0.0.1:9555/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
if (cookie) {
  const [name, ...rest] = cookie.split("=");
  await send("Network.setCookie", { name, value: rest.join("="), url: base });
}

const audit = `(() => {
  const problems = [];
  const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim();
  // An element hidden from assistive technology is not a control. The product
  // card wraps its image in a duplicate link marked aria-hidden + tabindex=-1
  // on purpose, so the title link beside it is the only one announced.
  const hidden = (el) => el.closest('[aria-hidden="true"]') !== null;

  document.querySelectorAll('button, a[href], [role="button"]').forEach((el) => {
    if (hidden(el)) return;
    if (!name(el) && !el.querySelector('img[alt]:not([alt=""])')) {
      problems.push('control with no accessible name: ' + el.outerHTML.slice(0, 110));
    }
  });

  document.querySelectorAll('input:not([type=hidden]), select, textarea').forEach((el) => {
    if (hidden(el)) return;
    const labelled = el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!labelled) problems.push('form control with no label: ' + el.outerHTML.slice(0, 110));
  });

  document.querySelectorAll('img').forEach((el) => {
    if (!el.hasAttribute('alt')) problems.push('img with no alt attribute: ' + (el.currentSrc || el.src).slice(-60));
  });

  const ids = {};
  document.querySelectorAll('[id]').forEach((el) => { ids[el.id] = (ids[el.id] || 0) + 1; });
  Object.entries(ids).filter(([, n]) => n > 1).forEach(([key, n]) => problems.push('duplicate id "' + key + '" x' + n));

  if (!document.querySelector('main')) problems.push('no <main> landmark');
  if (document.querySelectorAll('h1').length !== 1) problems.push(document.querySelectorAll('h1').length + ' <h1> elements');

  let last = 0;
  document.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
    const level = Number(h.tagName[1]);
    if (last && level > last + 1) problems.push('heading jumps from h' + last + ' to h' + level + ': ' + h.textContent.trim().slice(0, 40));
    last = level;
  });

  return problems;
})()`;

let total = 0;
for (const page of pages) {
  await send("Page.navigate", { url: base + page });
  await new Promise((r) => setTimeout(r, 2200));
  const res = await send("Runtime.evaluate", { expression: audit, returnByValue: true });
  const found = res.result?.result?.value || [];
  total += found.length;
  console.log(`\n${page}  ${found.length ? found.length + " problem(s)" : "clean"}`);
  found.forEach((p) => console.log("   - " + p));
}
console.log(`\ntotal: ${total}`);
ws.close();
