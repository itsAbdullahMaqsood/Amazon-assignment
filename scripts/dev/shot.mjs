// Screenshot helper used while redesigning. Needs a headless Chrome listening
// on port 9555, started once with:
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --remote-debugging-port=9555 --user-data-dir=/tmp/markaz-chrome --hide-scrollbars about:blank &
// Then: node scripts/dev/shot.mjs <url> <out.png> [width] [--full]
//   [--cookie=authjs.session-token=...] [--click=selector] [--eval=js] [--wait=ms]
import fs from "fs";

const [url, out, widthArg] = process.argv.slice(2);
const width = Number(widthArg) || 1440;
const full = process.argv.includes("--full");
const cookieArg = process.argv.find((a) => a.startsWith("--cookie="));
const clickArg = process.argv.find((a) => a.startsWith("--click="));
const waitArg = process.argv.find((a) => a.startsWith("--wait="));
const evalArg = process.argv.find((a) => a.startsWith("--eval="));
const height = width < 800 ? 844 : 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A persistent headless Chrome listens on 9555; each shot opens its own tab.
const target = await (await fetch("http://127.0.0.1:9555/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    else if (msg.method) events.push(msg);
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
await send("Network.enable");
await send("Network.clearBrowserCookies");
await send("Storage.clearDataForOrigin", { origin: new URL(url).origin, storageTypes: "local_storage,session_storage" });
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 800 });
if (cookieArg) {
    const [name, ...rest] = cookieArg.slice(9).split("=");
    await send("Network.setCookie", { name, value: rest.join("="), url: new URL(url).origin });
}
await send("Page.navigate", { url });
for (let i = 0; i < 100; i++) { if (events.some((e) => e.method === "Page.loadEventFired")) break; await sleep(100); }
await sleep(Number(waitArg?.slice(7)) || 1200);
if (clickArg) {
    await send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(clickArg.slice(8))})?.click()` });
    await sleep(900);
}
if (evalArg) {
    const r = await send("Runtime.evaluate", { expression: evalArg.slice(7), awaitPromise: true, returnByValue: true });
    console.log("eval:", JSON.stringify(r.result?.result?.value));
    await sleep(700);
}
const errors = events.filter((e) => e.method === "Runtime.exceptionThrown").map((e) => e.params.exceptionDetails?.exception?.description?.split("\n")[0]);
if (full) {
    await send("Runtime.evaluate", { expression: "(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}window.scrollTo(0,0)})()", awaitPromise: true });
    await sleep(800);
}
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
fs.writeFileSync(out, Buffer.from(shot.result.data, "base64"));
const overflow = await send("Runtime.evaluate", { expression: "document.documentElement.scrollWidth > window.innerWidth", returnByValue: true });
console.log(`saved ${out}${overflow.result?.result?.value ? "  [HORIZONTAL OVERFLOW]" : ""}${errors.length ? "  errors: " + errors.join(" | ") : ""}`);
ws.close();
await fetch(`http://127.0.0.1:9555/json/close/${target.id}`);
