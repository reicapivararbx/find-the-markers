#!/usr/bin/env node
// Captura screenshot de cada sala + Gate 30 "Em breve" + backtracking feira↔cidade.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "artifacts", "rooms");
mkdirSync(outDir, { recursive: true });

const require = createRequire(import.meta.url);
const candidates = [
  "/home/matteo.zanona/.npm/_npx/9833c18b2d85bc59/node_modules/playwright",
  "/home/matteo.zanona/.npm/_npx/e41f203b7505f1fb/node_modules/playwright"
];
let playwright;
for (const p of candidates) {
  try {
    playwright = require(p);
    break;
  } catch {
    /* try next */
  }
}
if (!playwright) {
  console.error("Playwright não encontrado");
  process.exit(1);
}

const BASE = process.env.FTM_URL || "http://127.0.0.1:8765";
const ROOMS = [
  ["room_09_spawn", "01-inicio"],
  ["room_10_credits", "02-creditos"],
  ["room_08_orchard_difficulty", "03-pomar"],
  ["room_07_forest", "04-floresta"],
  ["room_05_house", "05-casa"],
  ["room_06_secret_computer", "06-area-secreta"],
  ["room_04_city_casino", "07-cidade"],
  ["room_02_casino_gallery", "08-galeria-casino"],
  ["room_03_casino_pool", "09-sinuca"],
  ["room_01_market", "10-feira"]
];

async function waitForFTM(page, timeoutMs = 20000) {
  await page.waitForFunction(() => typeof window.FTM === "object" && window.FTM, {
    timeout: timeoutMs
  });
}

async function startNewGame(page) {
  await page.goto(`${BASE}/?debug=1`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector("#btn-new", { timeout: 15000 });
  // Novo jogo (pode pedir confirmação se já houver save)
  await page.click("#btn-new");
  const yesVisible = await page
    .locator("#new-yes")
    .isVisible()
    .catch(() => false);
  if (yesVisible) await page.click("#new-yes");
  await waitForFTM(page);
  // Aguarda RoomScene ativa
  await page.waitForFunction(
    () => {
      const g = window.FTMGame;
      return g?.scene?.isActive?.("RoomScene") && window.FTM?.rt?.()?.room;
    },
    { timeout: 20000 }
  );
}

async function warp(page, roomId) {
  await page.evaluate(async (id) => {
    window.FTM.warp(id);
  }, roomId);
  await page.waitForFunction(
    (id) => window.FTM?.rt?.()?.room === id && !window.FTM.rt()?.transitioning,
    roomId,
    { timeout: 15000 }
  );
  // deixa fade-in e 1 frame
  await page.waitForTimeout(500);
}

async function shot(page, name) {
  const path = join(outDir, `${name}.png`);
  const canvas = page.locator("#game-container canvas").first();
  if (await canvas.count()) {
    await canvas.screenshot({ path });
  } else {
    await page.screenshot({ path, fullPage: false });
  }
  console.log("ok", name);
  return path;
}

async function main() {
  const chromePath =
    process.env.CHROME_PATH ||
    "/home/matteo.zanona/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome";
  const browser = await playwright.chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ["--use-gl=swiftshader", "--disable-dev-shm-usage", "--no-sandbox"]
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("CONSOLE", msg.text());
  });

  const report = { rooms: [], gate30: null, backtrack: null, errors: [] };

  try {
    await startNewGame(page);

    // Resolve puzzle para área secreta ser visitável visualmente
    await page.evaluate(() => {
      window.FTM.solve("redButtonsSolved");
      window.FTM.addMarkers(30);
    });

    for (const [roomId, file] of ROOMS) {
      await warp(page, roomId);
      const rt = await page.evaluate(() => window.FTM.rt());
      const path = await shot(page, file);
      report.rooms.push({ roomId, file: `${file}.png`, rt, path });
    }

    // Gate 30 na feira: com 30 markers, badge "Em breve" + toast ao tocar
    await warp(page, "room_01_market");
    await page.evaluate(() => {
      // força contagem já ok; posiciona na zona do gate future30 (x≈46)
      window.FTM.setPos(46, 700);
    });
    await page.waitForTimeout(400);
    // simula overlap: chama evaluate do gate se exposto, senão move player
    const toastBefore = await page.locator("#toast").innerText().catch(() => "");
    await page.evaluate(() => {
      const scene = window.FTMScene;
      const gate = scene?.gates?.find((g) => g.id?.includes("future30"));
      if (gate) {
        gate.inside = false;
        gate.evaluate();
      }
    });
    await page.waitForTimeout(300);
    const toast = await page.locator("#toast").innerText().catch(() => "");
    const badgeText = await page.evaluate(() => {
      const scene = window.FTMScene;
      const gate = scene?.gates?.find((g) => g.id?.includes("future30"));
      return gate?.badge?.text || null;
    });
    await shot(page, "11-feira-gate30-embreve");
    report.gate30 = {
      toast,
      toastBefore,
      badgeText,
      ok: /em breve/i.test(toast) || /em breve/i.test(badgeText || "")
    };
    console.log("gate30", report.gate30);

    // Backtracking feira → cidade (livre)
    await page.evaluate(() => {
      const scene = window.FTMScene;
      const gate = scene?.gates?.find((g) => g.id?.includes(":right"));
      if (gate) {
        gate.inside = false;
        scene.enteredAt = performance.now() - 1000;
        gate.evaluate();
      }
    });
    await page.waitForFunction(() => window.FTM?.rt?.()?.room === "room_04_city_casino", {
      timeout: 10000
    });
    await page.waitForTimeout(600);
    await shot(page, "12-backtrack-feira-para-cidade");
    const cityRt = await page.evaluate(() => window.FTM.rt());

    // Cidade → feira (com 24+)
    await page.evaluate(() => {
      const scene = window.FTMScene;
      scene.enteredAt = performance.now() - 1000;
      const gate = scene?.gates?.find((g) => g.id?.includes(":left"));
      if (gate) {
        gate.inside = false;
        gate.evaluate();
      }
    });
    await page.waitForFunction(() => window.FTM?.rt?.()?.room === "room_01_market", {
      timeout: 10000
    });
    await page.waitForTimeout(600);
    await shot(page, "13-backtrack-cidade-para-feira");
    const marketRt = await page.evaluate(() => window.FTM.rt());

    report.backtrack = {
      cityAfterFeiraExit: cityRt,
      marketAfterCityExit: marketRt,
      ok: cityRt?.room === "room_04_city_casino" && marketRt?.room === "room_01_market"
    };
    console.log("backtrack", report.backtrack);
  } catch (err) {
    report.errors.push(String(err?.stack || err));
    console.error(err);
  }

  writeFileSync(join(outDir, "capture-report.json"), JSON.stringify(report, null, 2));
  await browser.close();

  const failed =
    report.errors.length ||
    report.rooms.length < ROOMS.length ||
    !report.gate30?.ok ||
    !report.backtrack?.ok;
  process.exit(failed ? 1 : 0);
}

main();
