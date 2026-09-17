#!/usr/bin/env node
// AUDITORIA RUNTIME DO SISTEMA DE MAPAS — TODAS as áreas reais do jogo.
// Para cada área: carrega, valida spawn/câmera, ESC (pausa global), sem erros.
// Para cada transição: dispara o trigger real (zona de passagem ou porta [E]),
// valida chegada no destino, spawn de chegada, ausência de ping-pong.
// Stress: A→B→A ×10 + tour multihop. Reload: save preservado.
// Saída: linhas [MAP TEST] + artifacts/map-audit.json. Exit 1 se qualquer falha.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { promisify } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const outDir = join(__dirname, "artifacts");
mkdirSync(outDir, { recursive: true });

const require = createRequire(import.meta.url);
let playwright = null;
for (const p of ["/home/matteo.zanona/.npm/_npx/9833c18b2d85bc59/node_modules/playwright", "/home/matteo.zanona/.npm/_npx/e41f203b7505f1fb/node_modules/playwright"]) {
  try { playwright = require(p); break; } catch { /* next */ }
}
if (!playwright) { console.error("Playwright não encontrado"); process.exit(1); }

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = "/home/matteo.zanona/.cache/ms-playwright";
  for (const dir of readdirSync(cache).sort().reverse()) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const candidate = join(cache, dir, sub);
      try { require("node:fs").accessSync(candidate); return candidate; } catch { /* next */ }
    }
  }
  return null;
}

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json",
  ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

function serve(port) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, "http://x");
      let path = decodeURIComponent(url.pathname);
      if (path === "/") path = "/index.html";
      const file = join(ROOT, path);
      const ext = file.split(".").pop().toLowerCase();
      res.setHeader("Content-Type", MIME[`.${ext}`] || "application/octet-stream");
      import("node:fs").then((fs) => {
        fs.readFile(file, (err, data) => {
          if (err) { res.statusCode = 404; res.end("not found"); return; }
          res.end(data);
        });
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

const SAVE_KEY = "find-the-markers-reuters-mix-save";

async function buildFullSave() {
  const { MARKERS } = await import("../game/config/marker-registry.js");
  return {
    version: 2, // proposital: valida a migração para a versão atual no load
    currentRoom: "room_09_spawn",
    playerX: null, playerY: null, lastSafePosition: null,
    secretComputerRoomDiscovered: false,
    collectedMarkerIds: MARKERS.map((m) => m.id),
    discoveredEggIds: ["egg_1", "egg_2", "egg_3", "egg_4", "egg_5"],
    puzzleStates: {
      redButtonsSolved: true, difficultySolved: true, creditsBoxesSolved: true,
      valvesSolved: true, batteriesSolved: true, runesSolved: true, fragmentsSolved: true,
      firewallSolved: true, mikuPuzzleSolved: true, poolHallDoorUnlocked: true,
      shadowWatcherStarted: true, shadowWatcherFragments: 3, shadowWatcherSolved: true,
      mysteriousCapybaraSolved: true, capybaraCodeMarkerUnlocked: true, capybaraCodeMarkerCollected: true,
      clockSolved: false, machineSolved: false, grumpyCalmed: false,
      soccerSolved: false, baseballSolved: false, mechSolved: false
    },
    openedBoxes: [],
    unlockedRooms: [],
    areaSeals: ["seal_garden", "seal_harbor", "seal_factory", "seal_mine", "seal_lab", "seal_ruins", "seal_peak", "seal_vault", "seal_citadel_gate"],
    secretAreas: [],
    coins: 0, collectedCoinIds: [],
    discoveredMusicNoteIds: ["note_1", "note_2", "note_3", "note_4", "note_5"],
    mikuMarkerUnlocked: true, playerCharacter: "male",
    menuSecrets: { championClicks: 67, championSolved: true },
    clues: { eggAreaCodeNoteRead: true, poolHallDoorCodeFound: true },
    slot: { spins: 0, pity: 0, jackpotWon: true, highRollerWon: true },
    settings: { sound: false }
  };
}

  const sleep = promisify(setTimeout);

async function main() {
  const server = await serve(0);
  const port = server.address().port;
  const BASE = `http://127.0.0.1:${port}`;

  const chromePath = findChrome();
  if (!chromePath) { console.error("Chrome não encontrado"); process.exit(1); }
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ["--use-gl=swiftshader", "--disable-dev-shm-usage", "--no-sandbox"]
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (text.includes("favicon")) return; // 404 cosmético do navegador
    consoleErrors.push(text);
  });

  const report = { rooms: {}, transitions: [], stress: null, reload: null, pendingGate: null, errors: [] };
  const results = [];
  const log = (ok, label, extra = "") => {
    const line = `[MAP TEST] ${ok ? "✅" : "❌"} ${label}${extra ? ` — ${extra}` : ""}`;
    console.log(line);
    results.push({ ok, label, extra });
    if (!ok) report.errors.push(line);
  };

  // Espera a cena ativa chegar em `roomId` (warp/restart é assíncrono).
  // Tolerante a "execution context destroyed" durante o restart da cena.
  async function waitForRoom(roomId, timeoutMs = 12000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const room = await page.evaluate(() => window.FTM?.rt?.()?.room || null);
        if (room === roomId) return true;
      } catch (e) {
        // contexto recarregando — tenta de novo no próximo tick
      }
      await sleep(100);
    }
    return false;
  }

  try {
    const fullSave = await buildFullSave();
    await context.addInitScript(([key, value]) => {
      // semeia apenas na primeira navegação: um F5 não pode apagar o save vivo
      if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, value);
    }, [SAVE_KEY, JSON.stringify(fullSave)]);

    await page.goto(`${BASE}/?debug=1`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForSelector("#btn-continue", { timeout: 15000 });
    await page.click("#btn-continue");
    await page.waitForFunction(() => window.FTMGame?.scene?.isActive?.("RoomScene") && window.FTM?.rt?.()?.room, { timeout: 20000 });
    await sleep(2500); // settle pós-boot: primeiras texturas/laziness do headless

    // ---- 1. Carregar TODAS as salas + ESC global + sem erros ----
    const roomIds = await page.evaluate(async () => {
      const mod = await import("./game/rooms/index.js");
      return Object.keys(mod.ROOMS);
    });
    console.log(`[MAP TEST] auditando ${roomIds.length} áreas reais…`);

    for (const roomId of roomIds) {
      await page.evaluate((id) => window.FTM.warp(id), roomId);
      const arrived = await waitForRoom(roomId);
      await sleep(700); // cooldown de transição (450ms) + fade in
      const state = await page.evaluate(() => {
        const rt = window.FTM.rt();
        const scene = window.FTMScene;
        const cam = scene?.cameras?.main;
        // RoomScene guarda os bounds aplicados (cam.bounds não é público em
        // todas as versões do Phaser); valida também zoom e follow.
        return {
          rt,
          sceneActive: window.FTMGame?.scene?.isActive?.("RoomScene"),
          playerOk: Boolean(scene?.player),
          cameraBounds: scene?.bounds ? { w: scene.bounds.width, h: scene.bounds.height } : null,
          cameraZoom: cam?.zoom ?? null,
          hudArea: document.querySelector("#hud-area")?.textContent || null,
          solids: scene?.solids?.length ?? 0
        };
      });
      const roomOk =
        arrived &&
        state.rt?.room === roomId &&
        state.sceneActive &&
        state.playerOk &&
        Number.isFinite(state.rt?.x) &&
        state.cameraBounds?.w > 0;
      log(roomOk, `área ${roomId}`, roomOk ? `spawn(${Math.round(state.rt.x)},${Math.round(state.rt.y)}) solids=${state.solids} câmera=${state.cameraBounds.w}x${state.cameraBounds.h}` : JSON.stringify(state));

      // ESC → pausa; ESC → volta (global, em qualquer sala). Stateless: o
      // teste não assume estado inicial do overlay; cada "press" segura a
      // tecla 250ms (headless tem frames esparsos) com retries.
      const escPress = async () => {
        await page.keyboard.down("Escape");
        await sleep(1200); // frames headless podem espaçar segundos sob carga
        await page.keyboard.up("Escape");
        await sleep(400);
      };
      const overlayOpen = () =>
        page.evaluate(() => document.querySelector("#pause-overlay")?.classList.contains("is-open") ?? false);
      let pauseOpened = false;
      let pauseClosed = false;
      for (let attempt = 0; attempt < 3 && !pauseOpened; attempt += 1) {
        if (await overlayOpen()) break; // já aberto de um ciclo anterior
        await escPress();
        pauseOpened = await overlayOpen();
      }
      for (let attempt = 0; attempt < 3 && pauseOpened && !pauseClosed; attempt += 1) {
        await escPress();
        pauseClosed = !(await overlayOpen());
      }
      log(pauseOpened && pauseClosed, `ESC global em ${roomId}`, pauseOpened ? "" : "pause nunca abriu");

      report.rooms[roomId] = { loaded: roomOk, esc: pauseOpened && pauseClosed };
    }

    // ---- 2. Todas as transições do grafo, com trigger real ----
    const transitions = await page.evaluate(async () => {
      const [connMod, roomMod] = await Promise.all([
        import("./game/config/room-connections.js"),
        import("./game/rooms/index.js")
      ]);
      const list = [];
      for (const [roomId, exits] of Object.entries(connMod.ROOM_CONNECTIONS)) {
        for (const [key, conn] of Object.entries(exits)) {
          if (!conn.to) { list.push({ roomId, key, to: null, pending: Boolean(conn.pending) }); continue; }
          const gate = (roomMod.ROOMS[roomId].gates || []).find((g) => g.key === key);
          list.push({
            roomId, key, to: conn.to, arriveAt: conn.arriveAt || "default",
            needsE: conn.interaction === "E" || conn.condition === "E",
            zone: gate?.zone || null, gateX: gate?.x ?? null, gateY: gate?.arrowY ?? null
          });
        }
      }
      return list;
    });

    // posição das portas [E] (interactables de wire) — resolvidas da cena viva
    async function teleportAndExpect(fromRoom, tx, ty, expectedRoom, label) {
      await page.evaluate((id) => window.FTM.warp(id), fromRoom);
      const arrivedInRoom = await waitForRoom(fromRoom);
      await sleep(700); // cooldown de entrada (450ms): sem isto o travel é barrado
      let placed = false;
      try {
        placed = await page.evaluate(([x, y]) => {
          if (!window.FTMScene?.player?.sprite?.body) return false;
          window.FTM.setPos(x, y);
          return true;
        }, [tx, ty]);
      } catch (e) {
        log(false, label, `setPos falhou: ${String(e).slice(0, 120)}`);
        report.transitions.push({ label, expected: expectedRoom, ok: false });
        return false;
      }
      if (!placed) {
        log(false, label, `cena de ${fromRoom} não carregou (player sem body)`);
        report.transitions.push({ label, expected: expectedRoom, ok: false });
        return false;
      }
      await sleep(150); // physics step dispara overlap/interact
      // Espera com retry do posicionamento: um setPos pode cair num frame
      // morto do restart; re-envia uma vez antes de desistir.
      let ok = arrivedInRoom ? await waitForRoom(expectedRoom, 14000) : false; // 7fps headless: fade ~280ms leva segundos
      if (arrivedInRoom && !ok) {
        try {
          await page.evaluate(([x, y]) => {
            if (window.FTMScene?.player?.sprite?.body) window.FTM.setPos(x, y);
          }, [tx, ty]);
        } catch (e) { /* contexto recarregando */ }
        ok = await waitForRoom(expectedRoom, 10000);
      }
      await sleep(900); // ping-pong: o room precisa continuar estável
      const after = await page.evaluate(() => window.FTM.rt());
      const stable = after?.room === expectedRoom;
      log(ok && stable, label, `esperado=${expectedRoom} obtido=${after?.room} pos=(${Math.round(after?.x || 0)},${Math.round(after?.y || 0)})`);
      report.transitions.push({ label, expected: expectedRoom, got: after?.room, ok: ok && stable });
      return ok && stable;
    }

    async function pressE() {
      await page.keyboard.down("e");
      await sleep(800); // headless tem frames esparsos: hold curto perde o justDown
      await page.keyboard.up("e");
      await sleep(200);
    }

    for (const t of transitions) {
      if (!t.to) {
        if (t.pending) {
          // gate pendente: quadro da galeria → toast "Em breve", sem sair da sala
          await page.evaluate((id) => window.FTM.warp(id), t.roomId);
          await waitForRoom(t.roomId);
          await sleep(700);
          const painting = await page.evaluate(() => {
            const scene = window.FTMScene;
            const target = scene?.updatables?.find?.((u) => u.id === "archive_painting");
            if (!target) return null;
            window.FTM.setPos(target.x, target.y + 45);
            return true;
          });
          await sleep(150);
          await pressE();
          await sleep(700);
          const state = await page.evaluate(() => ({
            room: window.FTM.rt()?.room,
            toast: document.querySelector("#toast")?.textContent || ""
          }));
          const ok = painting && state.room === t.roomId && state.toast.includes("Em breve");
          log(ok, `gate pendente ${t.roomId}:${t.key}`, `toast="${state.toast.trim()}" sala=${state.room}`);
          report.pendingGate = { ok, toast: state.toast };
        }
        continue;
      }

      const label = `transição ${t.roomId}:${t.key} → ${t.to}`;
      if (t.needsE) {
        await page.evaluate((id) => window.FTM.warp(id), t.roomId);
        await waitForRoom(t.roomId);
        await sleep(700);
        const doorPos = await page.evaluate(({ roomId, key }) => {
          const scene = window.FTMScene;
          const idsByRoom = {
            room_04_city_casino: { casino: "casino_door", digitalStage: "digital_stage_door" },
            room_03_casino_pool: { secretPool: "pool_hall_white_door" },
            room_02_casino_gallery: { archive: "archive_painting", exitCasino: "casino_exit" }
          };
          const wanted = idsByRoom[roomId]?.[key];
          const target = scene?.updatables?.find?.((u) => u.id === wanted);
          if (!target) return null;
          window.FTM.setPos(target.x, target.y + 40);
          return { x: target.x, y: target.y };
        }, { roomId: t.roomId, key: t.key });
        if (!doorPos) {
          log(false, label, "porta [E] não encontrada na cena");
          report.transitions.push({ label, ok: false });
          continue;
        }
        await sleep(150);
        await pressE();
        const arrived = await waitForRoom(t.to, 5000);
        await sleep(900);
        const after = await page.evaluate(() => window.FTM.rt());
        log(arrived && after?.room === t.to, label, `obtido=${after?.room}`);
        report.transitions.push({ label, expected: t.to, got: after?.room, ok: arrived });
      } else if (t.zone) {
        const cx = t.zone.x + t.zone.width / 2;
        const cy = t.zone.y + t.zone.height / 2;
        await teleportAndExpect(t.roomId, cx, cy, t.to, label);
      } else {
        // gate sem zona custom: zona padrão em (gateX, arrowY)
        const cx = t.gateX ?? 40;
        const cy = t.gateY ?? 470;
        await teleportAndExpect(t.roomId, cx, cy, t.to, label);
      }
    }

    // ---- 3. Stress: feira↔cidade ×10 + tour multihop ----
    let stressOk = true;
    const errBefore = pageErrors.length + consoleErrors.length;
    for (let i = 0; i < 10; i += 1) {
      // feira.right → cidade (x≈1405) · cidade.left → feira (x≈35)
      const a = await teleportAndExpect("room_01_market", 1405, 620, "room_04_city_casino", `stress A→B #${i + 1}`);
      const b = await teleportAndExpect("room_04_city_casino", 35, 620, "room_01_market", `stress B→A #${i + 1}`);
      if (!a || !b) { stressOk = false; break; }
    }
    for (const hop of [
      ["room_09_spawn", 35, 520, "room_08_orchard_difficulty"],
      ["room_08_orchard_difficulty", 1405, 520, "room_07_forest"],
      ["room_07_forest", 35, 520, "room_04_city_casino"],
      ["room_04_city_casino", 35, 620, "room_01_market"],
      ["room_01_market", 35, 520, "room_11_garden"],
      ["room_11_garden", 35, 560, "room_01_market"]
    ]) {
      const [from, x, y, to] = hop;
      const ok = await teleportAndExpect(from, x, y, to, `tour ${from} → ${to}`);
      if (!ok) stressOk = false;
    }
    const noLeak = pageErrors.length + consoleErrors.length === errBefore;
    log(stressOk && noLeak, "stress sem degradação/erros", `pageErrors=${pageErrors.length} consoleErrors=${consoleErrors.length}`);
    report.stress = { ok: stressOk && noLeak, pageErrors: pageErrors.length, consoleErrors: consoleErrors.length };

    // ---- 4. Reload: save preservado, retorna à sala correta ----
    const savedRoom = await page.evaluate(() => window.FTM.state().currentRoom);
    const savedCount = await page.evaluate(() => window.FTM.markerCount());
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("#btn-continue", { timeout: 15000 });
    await page.click("#btn-continue");
    await page.waitForFunction(() => window.FTMGame?.scene?.isActive?.("RoomScene") && window.FTM?.rt?.()?.room, { timeout: 20000 });
    await sleep(700);
    const reloaded = await page.evaluate(() => ({ room: window.FTM.rt()?.room, count: window.FTM.markerCount() }));
    const reloadOk = reloaded.room === savedRoom && reloaded.count === savedCount;
    log(reloadOk, "reload F5 preserva sala + progresso", `sala=${reloaded.room} markers=${reloaded.count}`);
    report.reload = { ok: reloadOk, room: reloaded.room, count: reloaded.count };
  } catch (error) {
    report.errors.push(`EXCEÇÃO: ${error.message}`);
    console.error("[AUDIT] exceção:", error);
  } finally {
    report.errors.push(...pageErrors.map((e) => `PAGEERROR: ${e}`));
    report.errors.push(...consoleErrors.slice(0, 20).map((e) => `CONSOLE: ${e}`));
    const passed = results.filter((r) => r.ok).length;
    console.log(`\n[MAP TEST] resumo: ${passed}/${results.length} verificações OK · ${report.errors.length} erros`);
    writeFileSync(join(outDir, "map-audit.json"), JSON.stringify(report, null, 2));
    await browser.close();
    server.close();
    process.exit(report.errors.length ? 1 : 0);
  }
}

main();
