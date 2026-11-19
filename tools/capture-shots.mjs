// Takes the entry's screenshots: starts headless Microsoft Edge with a throwaway profile, drives it over the Chrome
// DevTools Protocol (Node's built-in WebSocket), opens each scene of shots.json on the running app server, waits for
// window.__shotReady and saves the page as a JPEG, lowering the quality until it fits the 256 KiB cap.
//   node tools/capture-shots.mjs <base url> <profile dir outside the repo> [out dir]
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [base = 'http://localhost:8080', profile, outDir = 'screenshots'] = process.argv.slice(2);
if (!profile) throw new Error('usage: node tools/capture-shots.mjs <base url> <profile dir> [out dir]');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9347;
const MAX_BYTES = 256 * 1024;
const shots = JSON.parse(readFileSync('shots.json', 'utf8'));

const edge = spawn(EDGE, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars',
  '--force-color-profile=srgb', '--window-size=1280,1280', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSocket() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('Edge did not open a debugging page');
}

const ws = new WebSocket(await pageSocket());
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let nextId = 1;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

await send('Runtime.enable');
await send('Page.enable');
mkdirSync(outDir, { recursive: true });
try {
  for (const shot of shots) {
    await send('Emulation.setDeviceMetricsOverride', { width: shot.w, height: shot.h, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${base}/${shot.query}` });
    let ready = false;
    for (let i = 0; i < 120 && !ready; i++) {
      await sleep(250);
      ready = (await send('Runtime.evaluate', { expression: 'window.__shotReady === true', returnByValue: true })).result.value;
    }
    if (!ready) throw new Error(`${shot.name}: the page never set __shotReady`);
    let quality = 92;
    let bytes;
    do {
      const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality, clip: { x: 0, y: 0, width: shot.w, height: shot.h, scale: 1 } });
      bytes = Buffer.from(data, 'base64');
      quality -= 4;
    } while (bytes.length > MAX_BYTES && quality > 30);
    writeFileSync(join(outDir, shot.name), bytes);
    console.log(`${shot.name} ${shot.w}x${shot.h} q${quality + 4} ${Math.round(bytes.length / 1024)} KiB`);
  }
} finally {
  await send('Browser.close').catch(() => {});
  ws.close();
  edge.kill();
}
console.log(consoleErrors.length ? `console errors:\n${consoleErrors.join('\n')}` : 'console errors: none');
