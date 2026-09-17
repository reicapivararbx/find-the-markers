// Real-browser QA: local server at /find-the-markers/, desktop and touch.
// Run: node tests/audit-digital-circus.mjs (Playwright + Chromium required).
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { createDefaultSave } from "../game/save/save-manager.js";
import { MARKERS } from "../game/config/marker-registry.js";
import { SAVE_STORAGE_KEY } from "../game/config/game-config.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = join(root, "tests/artifacts/digital-circus");
await mkdir(out, { recursive: true });
const report = { status: "NOT_RUN", desktop: [], mobile: [], errors: [] };
const require = createRequire(import.meta.url);
let server, browser;
const prefix = "/find-the-markers/";

function playwright() {
  try { return require("playwright"); } catch { /* use an already installed CLI */ }
  const cache = join(homedir(), ".npm/_npx");
  for (const dir of existsSync(cache) ? readdirSync(cache) : []) {
    try { return require(join(cache, dir, "node_modules/playwright")); } catch { /* next */ }
  }
  throw new Error("Install Playwright before running browser QA.");
}

function executable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = join(homedir(), ".cache/ms-playwright");
  for (const dir of existsSync(cache) ? readdirSync(cache).sort().reverse() : []) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const p = join(cache, dir, sub);
      if (existsSync(p)) return p;
    }
  }
}

async function serve() {
  server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://local").pathname;
    if (!path.startsWith(prefix)) { res.writeHead(404).end(); return; }
    const relative = decodeURIComponent(path.slice(prefix.length)) || "index.html";
    const file = resolve(root, relative);
    if (!file.startsWith(resolve(root) + sep)) { res.writeHead(403).end(); return; }
    try {
      const bytes = await readFile(file);
      const type = { ".js": "text/javascript", ".html": "text/html", ".css": "text/css", ".png": "image/png" }[extname(file)];
      res.writeHead(200, { "Content-Type": type || "application/octet-stream" }).end(bytes);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((ok, fail) => { server.once("error", fail); server.listen(0, "127.0.0.1", ok); });
  return `http://127.0.0.1:${server.address().port}${prefix}`;
}

async function audit(base, mobile) {
  const mode = mobile ? "mobile" : "desktop";
  const context = await browser.newContext({ viewport: mobile ? { width: 915, height: 412 } : { width: 1440, height: 900 },
    hasTouch: mobile, isMobile: mobile, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(`${mode}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("favicon")) report.errors.push(m.text()); });
  const save = { ...createDefaultSave(), playerCharacter: mobile ? "female" : "male",
    currentRoom: "room_04_city_casino", collectedMarkerIds: MARKERS.map((m) => m.id),
    coins: 357, discoveredMusicNoteIds: ["note_test"], settings: { sound: false } };
  await context.addInitScript(([key, value]) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, value);
  }, [SAVE_STORAGE_KEY, JSON.stringify(save)]);
  await page.goto(`${base}?debug=1`, { waitUntil: "networkidle" });
  await page.locator("#btn-continue").click();
  const waitRoom = async (id) => {
    await page.waitForFunction((roomId) => {
      const s = window.FTMScene;
      return s?.roomId === roomId && !s.transitioning && !s.inCutscene && s.player?.body?.enable;
    }, id, { timeout: 15000 });
    await page.waitForTimeout(550);
  };
  const touch = async (action, ms = 100) => {
    const el = page.locator(`#mobile-controls [data-action="${action}"]`);
    await el.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 1 });
    await page.waitForTimeout(ms);
    await el.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 1 });
  };
  const use = async (id, target) => {
    await page.evaluate((id) => {
      const s = window.FTMScene;
      const i = s.updatables.map((u) => u.interactable || u).find((u) => u.id === id);
      if (!i) throw new Error(`Missing interaction ${id}`);
      window.FTM.setPos(i.x, i.y);
    }, id);
    await page.waitForTimeout(120);
    if (mobile) await touch("interact"); else await page.keyboard.press("e");
    if (target) await waitRoom(target);
  };
  const progress = () => page.evaluate(() => {
    const s = window.FTM.state();
    return { markers: s.collectedMarkerIds, coins: s.coins, notes: s.discoveredMusicNoteIds,
      character: s.playerCharacter, settings: s.settings, puzzles: s.puzzleStates };
  });
  const metrics = () => page.evaluate(async () => {
    const s = window.FTMScene;
    const { bus } = await import("./game/core/event-bus.js");
    const { isPositionWalkable } = await import("./game/physics/walkability.js");
    const cam = s.cameras.main;
    const listeners = (emitter) => Object.fromEntries(emitter.eventNames().map((key) => [key, emitter.listenerCount(key)]));
    return { room: s.roomId, solids: s.solids.length, bodies: s.physics.world.bodies.size,
      staticBodies: s.physics.world.staticBodies.size, colliders: s.physics.world.colliders.getActive().length,
      updatables: s.updatables.length, gates: s.gates.length, children: s.children.length,
      players: s.children.list.filter((o) => ["player_male", "player_female", "player"].includes(o.texture?.key)).length,
      sceneListeners: listeners(s.events), keyboardListeners: listeners(s.input.keyboard),
      busListeners: [...bus.listeners].map(([key, values]) => [key, values.size]),
      walkable: isPositionWalkable(s.player.x, s.player.y, s.solids, s.bounds),
      bounds: { width: cam.getBounds().width, height: cam.getBounds().height }, zoom: cam.zoom,
      locked: s.inputController.locked, paused: s.paused,
      fps: Math.round(s.game.loop.actualFps) };
  });
  const stable = ({ fps, ...rest }) => rest;
  await waitRoom("room_04_city_casino");
  await use("casino_door", "room_02_casino_gallery");
  const before = await progress();
  let baselineCircus, baselineGallery;
  for (let round = 0; round < 10; round++) {
    await use("digital_circus_painting", "digital_circus");
    const circus = await metrics();
    assert.equal(circus.players, 1); assert.equal(circus.walkable, true); assert.equal(circus.locked, false);
    assert.deepEqual(circus.bounds, { width: 3200, height: 2400 });
    if (baselineCircus) assert.deepEqual(stable(circus), baselineCircus);
    else baselineCircus = stable(circus);
    if (mobile) await page.locator("#btn-pause").click(); else await page.keyboard.press("Escape");
    await page.waitForFunction(() => window.FTMScene.paused);
    await page.locator("#pause-resume").click();
    await page.waitForFunction(() => !window.FTMScene.paused);
    const x = await page.evaluate(() => window.FTMScene.player.x);
    if (mobile) await touch("right", 200);
    else { await page.keyboard.down("d"); await page.waitForTimeout(200); await page.keyboard.up("d"); }
    assert.ok(await page.evaluate((x) => window.FTMScene.player.x > x + 10, x));
    await use("digital_circus_exit", "room_02_casino_gallery");
    const gallery = await metrics();
    assert.equal(gallery.players, 1); assert.equal(gallery.walkable, true); assert.equal(gallery.locked, false);
    assert.deepEqual(gallery.bounds, { width: 1440, height: 810 });
    if (baselineGallery) assert.deepEqual(stable(gallery), baselineGallery);
    else baselineGallery = stable(gallery);
    assert.deepEqual(await progress(), before);
    report[mode].push({ round: round + 1, circus, gallery });
    console.log(`[${mode}] Gallery → Digital Circus → Gallery ${round + 1}/10 PASS`);
  }
  await use("digital_circus_painting", "digital_circus");
  // Real collision: walk north into the spiral base; the player must stop.
  await page.evaluate(() => window.FTM.setPos(1650, 1190));
  if (mobile) await touch("up", 550);
  else { await page.keyboard.down("w"); await page.waitForTimeout(550); await page.keyboard.up("w"); }
  assert.ok(await page.evaluate(() => window.FTMScene.player.y >= 1137));
  // Walkable base anchors place the player on either side of an object's depth.
  for (const y of [1010, 1170]) {
    await page.evaluate((y) => window.FTM.setPos(1450, y), y);
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => window.FTMScene.player.sprite.depth > window.FTMScene.children.getByName("circus_spiral").depth), y > 1120);
  }
  await page.screenshot({ path: join(out, `${mode}-circus.png`) });
  // Unstuck through the actual pause UI; invalid lastSafe must fall back to spawn.
  await page.evaluate(async () => {
    const { state } = await import("./game/state.js");
    state.saveManager.save.lastSafePosition = { areaId: "digital_circus", x: 1650, y: 1090 };
    window.FTMScene._lastUnstuckAt = 0;
    window.FTM.setPos(1650, 1090);
    window.FTMScene.togglePause();
  });
  await page.locator("#pause-unstuck").click();
  await page.locator("#pause-unstuck-yes").click();
  assert.equal((await metrics()).walkable, true);
  if (await page.locator("#pause-overlay").evaluate((el) => el.classList.contains("is-open"))) await page.locator("#pause-resume").click();
  // Camera at all four playable corners must stay within the painted surface.
  for (const [x, y] of [[90, 400], [3110, 400], [90, 2300], [3110, 2300]]) {
    await page.evaluate(([x, y]) => window.FTM.setPos(x, y), [x, y]);
    await page.waitForTimeout(100);
    assert.ok(await page.evaluate(() => {
      const r = window.FTMScene.cameras.main.worldView;
      return r.x >= -1 && r.y >= -1 && r.right <= 3201 && r.bottom <= 2401;
    }));
  }
  await page.evaluate(() => window.FTMScene.flushPositionToSave());
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#btn-continue").click();
  await waitRoom("digital_circus");
  assert.deepEqual(await progress(), before);
  await use("digital_circus_exit", "room_02_casino_gallery");
  // Preserve the independent archive interaction, slot and pool passage.
  assert.ok(await page.evaluate(() => window.FTMScene.updatables.some((u) => u.id === "archive_painting")));
  await use("slot_machine");
  await page.waitForSelector("#slot-overlay.is-open");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("#slot-overlay.is-open"));
  await page.evaluate(() => window.FTM.setPos(1400, 520));
  await waitRoom("room_03_casino_pool");
  await page.evaluate(() => {
    const g = window.FTMScene.gates.find((g) => g.connection.to === "room_02_casino_gallery");
    window.FTM.setPos(g.zone.x, g.zone.y);
  });
  await waitRoom("room_02_casino_gallery");
  await use("casino_exit", "room_04_city_casino");
  await context.close();
}

try {
  const base = await serve();
  browser = await playwright().chromium.launch({ headless: true, executablePath: executable(),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--use-gl=swiftshader"] });
  await audit(base, false);
  await audit(base, true);
  assert.deepEqual(report.errors, []);
  report.status = "PASS";
} catch (error) {
  report.status = "FAILED_OR_BLOCKED";
  report.errors.push(error.stack || String(error));
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server?.listening) await new Promise((ok) => server.close(ok));
  await writeFile(join(out, "report.json"), JSON.stringify(report, null, 2));
}
