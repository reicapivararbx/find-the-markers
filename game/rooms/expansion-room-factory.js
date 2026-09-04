import { kit } from "../scenes/room-kit.js";
import { Interactable } from "../entities/interactable.js";
import { CoinEntity } from "../entities/coin-entity.js";
import { COIN_DEFS } from "../config/expansion-markers.js";
import { markersForRoom } from "../config/marker-registry.js";

const THEMES = Object.freeze({
  garden: { skyTop: 0xc8f0d8, skyBottom: 0xe8f8c8, ground: 0x7cbc5a, wall: 0xe8f5d8, floor: 0x6fae7c },
  harbor: { skyTop: 0xa8d4f0, skyBottom: 0xd0e8f8, ground: 0x6a8a9a, wall: 0xd0e0f0, floor: 0x5a7a8a },
  factory: { skyTop: 0xb0a898, skyBottom: 0xd0c8b8, ground: 0x6a6058, wall: 0xc8b8a8, floor: 0x5a5048 },
  mine: { skyTop: 0x3a3a48, skyBottom: 0x4a4a58, ground: 0x3a3028, wall: 0x4a4038, floor: 0x2a2018 },
  lab: { skyTop: 0xc0e8f8, skyBottom: 0xe0f4ff, ground: 0x88a8b8, wall: 0xe8f4ff, floor: 0x70a0b8 },
  ruins: { skyTop: 0xe8d8b8, skyBottom: 0xf0e8d0, ground: 0xc4a574, wall: 0xe8d8c0, floor: 0xb89868 },
  peak: { skyTop: 0xd0e8ff, skyBottom: 0xf0f8ff, ground: 0xd8e8f0, wall: 0xe8f0f8, floor: 0xc0d0e0 },
  vault: { skyTop: 0x2a2a38, skyBottom: 0x3a3a48, ground: 0x2a2830, wall: 0x3a3848, floor: 0x1a1820 },
  citadel: { skyTop: 0x8b5cf6, skyBottom: 0xc4b5fd, ground: 0x5a4a78, wall: 0xd8c8f8, floor: 0x4a3a68 },
  secret: { skyTop: 0x1a1a28, skyBottom: 0x2a2a38, ground: 0x2a2838, wall: 0x3a3850, floor: 0x1a1828 }
});

function panelIdsFor(roomId) {
  return markersForRoom(roomId)
    .filter((m) => m.mode === "touch")
    .slice(0, 8)
    .map((m) => m.id);
}

function spawnCoins(ctx, roomId) {
  COIN_DEFS.filter((c) => c.room === roomId).forEach((def) => {
    if (ctx.save.collectedCoinIds?.includes(def.id)) return;
    const coin = new CoinEntity(ctx.scene, def, ctx.sm, ctx.hud);
    ctx.addUpdatable(coin);
    ctx.scene.physics.add.overlap(ctx.scene.player?.sprite || ctx.scene.children, coin.zone, () => {});
    ctx.scene.time.delayedCall(0, () => {
      if (ctx.scene.player?.sprite) {
        ctx.scene.physics.add.overlap(ctx.scene.player.sprite, coin.zone, () => coin.tryCollect());
      }
    });
  });
}

function buildOrganicGarden(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.cloud(scene, 220, 110, 1.05);
  kit.cloud(scene, 680, 80, 0.75);
  kit.cloud(scene, 1180, 130, 0.95);
  kit.ground(scene, ctx, t.ground);

  kit.stonePath(scene, [
    [40, 560],
    [180, 540],
    [320, 500],
    [480, 520],
    [620, 560],
    [760, 540],
    [920, 500],
    [1100, 520],
    [1280, 540],
    [1400, 560]
  ], 64);
  kit.dirtPath(scene, [
    [480, 520],
    [520, 420],
    [580, 340],
    [720, 300],
    [720, 240]
  ], 48);
  kit.dirtPath(scene, [
    [760, 540],
    [820, 620],
    [900, 700],
    [1040, 740]
  ], 44);
  kit.dirtPath(scene, [
    [320, 500],
    [280, 620],
    [240, 700],
    [180, 740]
  ], 40);

  kit.fountain(scene, ctx, 620, 480);
  kit.greenhouse(scene, ctx, 1080, 380, 180, 120);
  kit.hedgeWall(scene, ctx, 400, 300, 140, 52);
  kit.hedgeWall(scene, ctx, 560, 280, 100, 48);
  kit.hedgeWall(scene, ctx, 720, 300, 130, 50);
  kit.ruinPillar(scene, ctx, 200, 380, 100);
  kit.ruinPillar(scene, ctx, 280, 400, 72);
  kit.ruinPillar(scene, ctx, 1320, 420, 88);
  kit.fallenLog(scene, ctx, 860, 680, 130);
  kit.fallenLog(scene, ctx, 140, 680, 90);

  kit.tree(scene, ctx, 120, 360, { scale: 1.05, canopy: 0x5d8f46 });
  kit.tree(scene, ctx, 360, 320, { scale: 0.85, canopy: 0x7cae62 });
  kit.tree(scene, ctx, 980, 300, { scale: 0.95, canopy: 0x6fae5a });
  kit.tree(scene, ctx, 1280, 340, { scale: 1.1, canopy: 0x86b45e });
  kit.tree(scene, ctx, 520, 700, { scale: 0.75, canopy: 0x5d8f46 });
  kit.tree(scene, ctx, 1180, 720, { scale: 0.8, canopy: 0x7cae62 });

  kit.bush(scene, ctx, 90, 620, 1.1);
  kit.bush(scene, ctx, 450, 640, 0.9);
  kit.bush(scene, ctx, 780, 360, 1.0);
  kit.bush(scene, ctx, 1020, 660, 0.85);
  kit.bush(scene, ctx, 1360, 620, 1.05);

  kit.rocks(scene, ctx, 340, 460, 1.1);
  kit.rocks(scene, ctx, 880, 420, 0.9);
  kit.rocks(scene, ctx, 1240, 580, 1.0);

  kit.flowerBed(scene, 240, 560, [0xd1495b, 0xf2c94c, 0xe884b5]);
  kit.flowerBed(scene, 700, 640, [0xb37feb, 0x62c462, 0xf2c94c]);
  kit.flowerBed(scene, 1000, 500, [0xd1495b, 0x56ccf2, 0xe884b5]);
  kit.flowerBed(scene, 400, 740, [0xf2c94c, 0x7cae62, 0xb37feb]);

  kit.bench(scene, ctx, 480, 580, 100);
  kit.bench(scene, ctx, 900, 560, 90);
  kit.lampPost(scene, ctx, 300, 540);
  kit.lampPost(scene, ctx, 1050, 540);
  kit.signBoard(scene, ctx, 160, 500, 120, 48, ["Jardim", "Abandonado"]);

  kit.grassTufts(scene, [
    [100, 720],
    [200, 760],
    [380, 700],
    [560, 740],
    [740, 720],
    [920, 760],
    [1100, 700],
    [1300, 740],
    [150, 440],
    [800, 400],
    [1200, 460]
  ]);

  kit.water(scene, 560, 440, 120, 50);
}

function buildOrganicHarbor(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.cloud(scene, 200, 100, 1.0);
  kit.cloud(scene, 900, 80, 0.8);
  kit.ground(scene, ctx, t.ground);

  kit.waterBody(scene, 720, 720, 900, 160);
  kit.waterBody(scene, 200, 700, 280, 100);
  kit.waterBody(scene, 1280, 700, 260, 110);

  kit.stonePath(scene, [
    [40, 540],
    [200, 520],
    [400, 540],
    [620, 500],
    [860, 520],
    [1100, 500],
    [1400, 540]
  ], 56);
  kit.dirtPath(scene, [
    [400, 540],
    [420, 420],
    [480, 320],
    [720, 280]
  ], 44);
  kit.dirtPath(scene, [
    [860, 520],
    [900, 620],
    [980, 700]
  ], 40);

  kit.dock(scene, ctx, 180, 620, 220);
  kit.dock(scene, ctx, 980, 640, 180);
  kit.crane(scene, ctx, 500, 480, 130);
  kit.crane(scene, ctx, 1100, 460, 110);
  kit.lighthouse(scene, ctx, 1280, 380, 150);
  kit.buoy(scene, 320, 720);
  kit.buoy(scene, 700, 740);
  kit.buoy(scene, 1180, 720);
  kit.cargoCrate(scene, ctx, 240, 540, 0xb85a2a);
  kit.cargoCrate(scene, ctx, 600, 560, 0x3a6a8a);
  kit.cargoCrate(scene, ctx, 1040, 540, 0x8a6238);
  kit.ropeCoil(scene, 360, 580);
  kit.ropeCoil(scene, 880, 560);
  kit.rocks(scene, ctx, 140, 480, 1.0);
  kit.rocks(scene, ctx, 820, 400, 0.9);
  kit.lampPost(scene, ctx, 280, 500);
  kit.lampPost(scene, ctx, 920, 500);
  kit.signBoard(scene, ctx, 160, 480, 120, 48, ["Porto", "Enferrujado"]);
  kit.bench(scene, ctx, 720, 540, 100);
}

function buildOrganicFactory(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.cloud(scene, 300, 90, 0.7);
  kit.cloud(scene, 1000, 110, 0.9);
  kit.ground(scene, ctx, t.ground);

  kit.stonePath(scene, [
    [40, 540],
    [220, 560],
    [480, 520],
    [720, 540],
    [1000, 520],
    [1400, 560]
  ], 60);
  kit.dirtPath(scene, [
    [480, 520],
    [500, 400],
    [560, 300],
    [720, 260]
  ], 48);
  kit.dirtPath(scene, [
    [1000, 520],
    [1040, 620],
    [1100, 720]
  ], 42);

  kit.smokestack(scene, ctx, 200, 420, 140);
  kit.smokestack(scene, ctx, 1240, 400, 120);
  kit.conveyor(scene, ctx, 360, 600, 200);
  kit.conveyor(scene, ctx, 900, 580, 180);
  kit.pipeRun(scene, [
    [160, 360],
    [400, 340],
    [600, 380],
    [800, 320],
    [1100, 360]
  ], 0x8a9088);
  kit.pipeRun(scene, [
    [300, 480],
    [300, 620],
    [500, 640]
  ], 0x6a8070);
  kit.gearDecor(scene, 480, 460, 32);
  kit.gearDecor(scene, 780, 440, 24);
  kit.gearDecor(scene, 1080, 480, 28);
  kit.oilDrum(scene, ctx, 280, 560);
  kit.oilDrum(scene, ctx, 640, 640);
  kit.oilDrum(scene, ctx, 1120, 560);
  kit.factoryWindow(scene, 180, 320, 70, 48);
  kit.factoryWindow(scene, 320, 300, 60, 40);
  kit.factoryWindow(scene, 1160, 310, 70, 48);
  kit.cargoCrate(scene, ctx, 520, 560, 0x6a6058);
  kit.cargoCrate(scene, ctx, 860, 640, 0x8a6238);
  kit.lampPost(scene, ctx, 400, 520);
  kit.lampPost(scene, ctx, 1000, 520);
  kit.signBoard(scene, ctx, 140, 500, 130, 48, ["Fábrica", "Abandonada"]);
  kit.rocks(scene, ctx, 700, 700, 1.1);
  kit.rocks(scene, ctx, 1300, 620, 0.85);
}

function buildOrganicMine(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.ground(scene, ctx, t.ground);

  kit.mineRail(scene, [
    [40, 560],
    [200, 540],
    [400, 560],
    [600, 520],
    [820, 540],
    [1040, 520],
    [1400, 560]
  ]);
  kit.mineRail(scene, [
    [600, 520],
    [620, 400],
    [680, 300],
    [720, 240]
  ]);
  kit.dirtPath(scene, [
    [200, 540],
    [240, 640],
    [300, 720]
  ], 40);
  kit.dirtPath(scene, [
    [1040, 520],
    [1100, 640],
    [1200, 720]
  ], 40);

  kit.tunnelMouth(scene, ctx, 180, 420, 110, 90);
  kit.tunnelMouth(scene, ctx, 1260, 400, 100, 85);
  kit.supportBeam(scene, ctx, 360, 480, 100);
  kit.supportBeam(scene, ctx, 720, 460, 110);
  kit.supportBeam(scene, ctx, 1080, 480, 95);
  kit.mineCart(scene, ctx, 480, 560);
  kit.mineCart(scene, ctx, 900, 540);
  kit.crystalCluster(scene, 300, 400, 0x7eb8e8);
  kit.crystalCluster(scene, 640, 360, 0xb37feb);
  kit.crystalCluster(scene, 1100, 380, 0x56ccf2);
  kit.orePile(scene, 420, 640);
  kit.orePile(scene, 780, 680);
  kit.orePile(scene, 1180, 620);
  kit.rocks(scene, ctx, 240, 500, 1.2);
  kit.rocks(scene, ctx, 560, 600, 0.95);
  kit.rocks(scene, ctx, 1000, 600, 1.05);
  kit.rocks(scene, ctx, 1320, 520, 0.9);
  kit.lampPost(scene, ctx, 520, 520);
  kit.lampPost(scene, ctx, 960, 520);
  kit.signBoard(scene, ctx, 150, 500, 120, 48, ["Minas", "Profundas"]);
  kit.fallenLog(scene, ctx, 200, 700, 80);
}

function buildOrganicLab(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.ground(scene, ctx, t.ground);

  kit.stonePath(scene, [
    [40, 560],
    [200, 540],
    [400, 560],
    [620, 520],
    [840, 540],
    [1080, 520],
    [1400, 560]
  ], 56);
  kit.dirtPath(scene, [
    [400, 560],
    [420, 420],
    [480, 300],
    [720, 260]
  ], 44);
  kit.dirtPath(scene, [
    [840, 540],
    [900, 640],
    [1000, 720]
  ], 40);

  kit.labBench(scene, ctx, 160, 480, 150);
  kit.labBench(scene, ctx, 520, 460, 140);
  kit.labBench(scene, ctx, 980, 480, 150);
  kit.serverRack(scene, ctx, 320, 420, 110);
  kit.serverRack(scene, ctx, 760, 400, 120);
  kit.serverRack(scene, ctx, 1200, 420, 100);
  kit.beakerProp(scene, 200, 440, 0x56ccf2);
  kit.beakerProp(scene, 580, 420, 0x62c462);
  kit.beakerProp(scene, 1040, 440, 0xb37feb);
  kit.laserBeam(scene, 360, 300, 700, 280, 0xff5d5d);
  kit.laserBeam(scene, 700, 280, 1100, 320, 0x56ccf2);
  kit.crate(scene, ctx, 240, 640, 80, 36, 0x8a9aa8);
  kit.crate(scene, ctx, 1100, 660, 90, 40, 0x7a8a98);
  kit.lampPost(scene, ctx, 480, 520);
  kit.lampPost(scene, ctx, 960, 520);
  kit.signBoard(scene, ctx, 140, 500, 120, 48, ["Lab", "Secreto"]);
}

function buildOrganicRuins(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.cloud(scene, 300, 100, 0.9);
  kit.cloud(scene, 1000, 80, 0.7);
  kit.ground(scene, ctx, t.ground);

  kit.sandDune(scene, 200, 700, 140);
  kit.sandDune(scene, 600, 740, 120);
  kit.sandDune(scene, 1100, 720, 150);
  kit.stonePath(scene, [
    [40, 560],
    [220, 540],
    [420, 560],
    [640, 520],
    [860, 540],
    [1100, 520],
    [1400, 560]
  ], 52);
  kit.dirtPath(scene, [
    [420, 560],
    [480, 420],
    [560, 300],
    [720, 240]
  ], 40);

  kit.stoneArch(scene, ctx, 360, 440, 110, 95);
  kit.stoneArch(scene, ctx, 900, 420, 100, 90);
  kit.obelisk(scene, ctx, 200, 480, 100);
  kit.obelisk(scene, ctx, 720, 400, 120);
  kit.obelisk(scene, ctx, 1240, 460, 95);
  kit.ruinPillar(scene, ctx, 500, 500, 80);
  kit.ruinPillar(scene, ctx, 1080, 480, 70);
  kit.mosaicTile(scene, 640, 600, [0xd1495b, 0x56ccf2, 0xf2c94c, 0x62c462]);
  kit.mosaicTile(scene, 800, 640, [0xf2c94c, 0x8b5cf6, 0xd1495b]);
  kit.rocks(scene, ctx, 280, 620, 1.1);
  kit.rocks(scene, ctx, 1000, 640, 0.95);
  kit.fallenLog(scene, ctx, 180, 680, 70);
  kit.signBoard(scene, ctx, 150, 500, 120, 48, ["Ruínas", "Antigas"]);
}

function buildOrganicPeak(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.cloud(scene, 250, 90, 0.85);
  kit.cloud(scene, 900, 70, 0.7);
  kit.ground(scene, ctx, t.ground);

  kit.mountainPeak(scene, 200, 380, 140, 120);
  kit.mountainPeak(scene, 720, 320, 180, 150);
  kit.mountainPeak(scene, 1240, 360, 130, 110);
  kit.snowPatch(scene, 300, 560, 100);
  kit.snowPatch(scene, 600, 600, 90);
  kit.snowPatch(scene, 1000, 540, 110);
  kit.snowPatch(scene, 1280, 620, 80);
  kit.stonePath(scene, [
    [40, 560],
    [200, 540],
    [400, 560],
    [620, 520],
    [840, 540],
    [1080, 520],
    [1400, 560]
  ], 48);
  kit.dirtPath(scene, [
    [400, 560],
    [480, 400],
    [600, 300],
    [720, 240]
  ], 40);

  kit.iceSpike(scene, 260, 480, 45);
  kit.iceSpike(scene, 480, 460, 55);
  kit.iceSpike(scene, 880, 440, 50);
  kit.iceSpike(scene, 1120, 470, 40);
  kit.flagPole(scene, ctx, 720, 360, 90, 0xd1495b);
  kit.flagPole(scene, ctx, 400, 500, 70, 0x56ccf2);
  kit.rocks(scene, ctx, 340, 640, 1.0);
  kit.rocks(scene, ctx, 960, 660, 1.1);
  kit.lampPost(scene, ctx, 520, 520);
  kit.lampPost(scene, ctx, 1000, 520);
  kit.signBoard(scene, ctx, 140, 500, 120, 48, ["Pico", "Gelado"]);
}

function buildOrganicVault(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, t.wall, t.floor);

  kit.vaultDoor(scene, ctx, 720, 360, 55);
  kit.safeBox(scene, ctx, 280, 480);
  kit.safeBox(scene, ctx, 520, 500);
  kit.safeBox(scene, ctx, 960, 480);
  kit.safeBox(scene, ctx, 1200, 500);
  kit.goldBar(scene, 340, 560);
  kit.goldBar(scene, 400, 570);
  kit.goldBar(scene, 1080, 560);
  kit.goldBar(scene, 1140, 570);
  kit.terminal(scene, ctx, 180, 440);
  kit.terminal(scene, ctx, 1260, 440);
  kit.terminal(scene, ctx, 720, 560);
  kit.crate(scene, ctx, 200, 640, 90, 40, 0x4a4a58);
  kit.crate(scene, ctx, 1100, 660, 100, 44, 0x5a5a68);
  kit.lampPost(scene, ctx, 400, 520);
  kit.lampPost(scene, ctx, 1040, 520);
  kit.signBoard(scene, ctx, 150, 400, 120, 48, ["Cofre", "Blindado"]);
}

function buildOrganicCitadelGate(ctx, t) {
  const { scene } = ctx;
  kit.sky(scene, t.skyTop, t.skyBottom);
  kit.cloud(scene, 280, 100, 0.9);
  kit.cloud(scene, 980, 80, 0.75);
  kit.ground(scene, ctx, t.ground);

  kit.moat(scene, 720, 700, 400, 60);
  kit.moat(scene, 300, 720, 180, 40);
  kit.moat(scene, 1140, 720, 180, 40);
  kit.stonePath(scene, [
    [40, 560],
    [200, 540],
    [400, 560],
    [620, 520],
    [840, 540],
    [1080, 520],
    [1400, 560]
  ], 56);
  kit.dirtPath(scene, [
    [620, 520],
    [680, 400],
    [720, 300],
    [720, 240]
  ], 44);

  kit.drawbridge(scene, ctx, 680, 560, 90);
  kit.rampart(scene, ctx, 100, 480, 180, 75);
  kit.rampart(scene, ctx, 1160, 480, 180, 75);
  kit.watchtower(scene, ctx, 200, 420, 130);
  kit.watchtower(scene, ctx, 1240, 420, 130);
  kit.banner(scene, 360, 460, 0x8b5cf6);
  kit.banner(scene, 1080, 460, 0xd1495b);
  kit.banner(scene, 720, 400, 0xf2c94c);
  kit.crate(scene, ctx, 440, 640, 80, 36, 0x6a5a88);
  kit.crate(scene, ctx, 1000, 660, 90, 40, 0x5a4a78);
  kit.lampPost(scene, ctx, 500, 520);
  kit.lampPost(scene, ctx, 940, 520);
  kit.signBoard(scene, ctx, 140, 500, 130, 48, ["Portão", "Cidadela"]);
}

function buildOrganicCitadel(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, t.wall, t.floor);

  kit.throne(scene, ctx, 720, 380);
  kit.banner(scene, 520, 360, 0x8b5cf6);
  kit.banner(scene, 920, 360, 0xd1495b);
  kit.banner(scene, 400, 420, 0xf2c94c);
  kit.banner(scene, 1040, 420, 0x56ccf2);
  kit.watchtower(scene, ctx, 180, 400, 110);
  kit.watchtower(scene, ctx, 1260, 400, 110);
  kit.rampart(scene, ctx, 280, 500, 140, 50);
  kit.rampart(scene, ctx, 1020, 500, 140, 50);
  kit.goldBar(scene, 600, 520);
  kit.goldBar(scene, 840, 520);
  kit.crate(scene, ctx, 240, 640, 90, 40, 0x6a5a88);
  kit.crate(scene, ctx, 1120, 660, 100, 44, 0x5a4a78);
  kit.lampPost(scene, ctx, 480, 540);
  kit.lampPost(scene, ctx, 960, 540);
  kit.signBoard(scene, ctx, 150, 400, 130, 48, ["Trono", "Real"]);
}

export function makeExpansionRoom({
  id,
  theme = "garden",
  interior = false,
  sealId = null,
  gates = [],
  spawns = {},
  wireExtra = null,
  decor = null,
  customBuild = null,
  sealPos = null
}) {
  const t = THEMES[theme] || THEMES.garden;
  const sealX = sealPos?.x ?? 720;
  const sealY = sealPos?.y ?? 400;
  return {
    id,
    panelMarkerIds: panelIdsFor(id),
    spawns: {
      default: { x: 720, y: 600 },
      ...spawns
    },
    gates,
    build(ctx) {
      const { scene } = ctx;
      if (typeof customBuild === "function") {
        customBuild(ctx, t);
      } else if (interior) {
        kit.interiorWall(scene, ctx, t.wall, t.floor);
      } else {
        kit.sky(scene, t.skyTop, t.skyBottom);
        kit.cloud(scene, 280, 120, 1);
        kit.cloud(scene, 900, 90, 0.85);
        kit.ground(scene, ctx, t.ground);
        kit.dirtPath(scene, [
          [80, 520],
          [400, 560],
          [720, 540],
          [1100, 560],
          [1360, 520]
        ]);
        kit.crate(scene, ctx, 200, 580, 100, 40, 0x8a6238);
        kit.crate(scene, ctx, 1100, 600, 120, 44, 0xa9805a);
      }
      if (typeof decor === "function") decor(ctx, t);
      if (sealId && !ctx.save.areaSeals?.includes(sealId)) {
        scene.add
          .text(sealX, 100, "SELO DA ÁREA", {
            fontFamily: '"Comic Sans MS", sans-serif',
            fontSize: "18px",
            fontStyle: "bold",
            color: "#ffffff",
            backgroundColor: "#7c3aedcc",
            padding: { x: 10, y: 4 }
          })
          .setOrigin(0.5)
          .setDepth(200);
      }
    },
    wire(ctx) {
      const { scene } = ctx;
      spawnCoins(ctx, id);
      if (sealId && !ctx.sm.save.areaSeals.includes(sealId)) {
        const sealPad = new Interactable(scene, {
          id: `seal_${id}`,
          x: sealX,
          y: sealY,
          radius: 100,
          prompt: "[E] Coletar selo da área",
          once: true,
          action: () => {
            if (ctx.sm.grantSeal(sealId)) {
              ctx.hud.toast("Selo obtido!", { icon: "🏅", duration: 2600 });
            }
          }
        });
        ctx.addUpdatable(sealPad);
        scene.add
          .circle(sealX, sealY, 28, 0xf2c94c, 0.9)
          .setDepth(400)
          .setStrokeStyle(3, 0x33333d, 0.8);
      }
      if (typeof wireExtra === "function") wireExtra(ctx);
    }
  };
}

function buildSecretGreenhouse(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xd8f0d0, 0x6fae7c);
  kit.greenhouse(scene, ctx, 480, 520, 280, 160);
  kit.flowerBed(scene, 200, 580, 120, 40, 0xd1495b);
  kit.flowerBed(scene, 1000, 600, 140, 36, 0xf2a0c8);
  kit.hedgeWall(scene, ctx, 160, 480, 100, 50);
  kit.hedgeWall(scene, ctx, 1100, 500, 90, 48);
  kit.crate(scene, ctx, 360, 620, 70, 36, 0x8a6238);
}

function buildSecretLighthouse(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xd0e0f0, 0x5a7a8a);
  kit.lighthouse(scene, ctx, 720, 560, 180);
  kit.waterBody(scene, 400, 680, 200, 60);
  kit.waterBody(scene, 1000, 700, 180, 50);
  kit.ropeCoil(scene, 280, 600);
  kit.buoy(scene, 1100, 580);
  kit.crate(scene, ctx, 200, 620, 80, 40, 0x6a7080);
}

function buildSecretBoiler(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xc8b8a8, 0x5a5048);
  kit.smokestack(scene, ctx, 520, 560, 120);
  kit.smokestack(scene, ctx, 900, 580, 100);
  kit.pipeRun(scene, 300, 480, 400, 0);
  kit.pipeRun(scene, 700, 440, 280, 0);
  kit.oilDrum(scene, ctx, 240, 600);
  kit.oilDrum(scene, ctx, 1100, 620);
  kit.gearDecor(scene, 720, 400, 40);
  kit.crate(scene, ctx, 400, 620, 90, 40, 0x6a6058);
}

function buildSecretCrystal(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0x4a4038, 0x2a2018);
  kit.crystalCluster(scene, 400, 520, 0xb48cff);
  kit.crystalCluster(scene, 900, 540, 0x7ee8df);
  kit.crystalCluster(scene, 720, 420, 0xf2a0c8);
  kit.orePile(scene, 280, 600);
  kit.orePile(scene, 1100, 620);
  kit.supportBeam(scene, ctx, 200, 560, 140);
  kit.supportBeam(scene, ctx, 1200, 560, 140);
  kit.tunnelMouth(scene, ctx, 720, 300, 100);
}

function buildSecretServer(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xe8f4ff, 0x70a0b8);
  kit.serverRack(scene, ctx, 320, 560, 100);
  kit.serverRack(scene, ctx, 480, 560, 100);
  kit.serverRack(scene, ctx, 960, 560, 100);
  kit.serverRack(scene, ctx, 1120, 560, 100);
  kit.labBench(scene, ctx, 720, 620, 160);
  kit.terminal(scene, 720, 480);
  kit.laserBeam(scene, 200, 400, 200);
  kit.crate(scene, ctx, 200, 620, 70, 36, 0x3a8a9a);
}

function buildSecretTomb(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xe8d8c0, 0xb89868);
  kit.stoneArch(scene, ctx, 720, 360, 120, 100);
  kit.obelisk(scene, ctx, 320, 560, 110);
  kit.obelisk(scene, ctx, 1120, 560, 110);
  kit.sandDune(scene, 200, 640, 160, 40);
  kit.sandDune(scene, 1100, 660, 140, 36);
  kit.mosaicTile(scene, 720, 580, 80);
  kit.ruinPillar(scene, ctx, 500, 520, 90);
  kit.ruinPillar(scene, ctx, 940, 520, 90);
}

function buildSecretObservatory(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xe8f0f8, 0xc0d0e0);
  kit.mountainPeak(scene, 720, 400, 180, 120);
  kit.flagPole(scene, 720, 280);
  kit.snowPatch(scene, 300, 580, 120, 40);
  kit.snowPatch(scene, 1000, 600, 140, 36);
  kit.iceSpike(scene, 400, 520, 50);
  kit.iceSpike(scene, 1040, 540, 60);
  kit.crate(scene, ctx, 200, 620, 70, 36, 0xd0d8e0);
}

function buildSecretSafeRoom(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0x3a3848, 0x1a1820);
  kit.vaultDoor(scene, ctx, 720, 400, 100);
  kit.safeBox(scene, ctx, 400, 560);
  kit.safeBox(scene, ctx, 1040, 560);
  kit.goldBar(scene, 280, 600);
  kit.goldBar(scene, 320, 610);
  kit.goldBar(scene, 1100, 600);
  kit.terminal(scene, 720, 560);
  kit.crate(scene, ctx, 200, 620, 80, 40, 0x4a4858);
}

function buildSecretArmory(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xd8c8f8, 0x4a3a68);
  kit.rampart(scene, ctx, 200, 500, 200, 80);
  kit.rampart(scene, ctx, 1040, 500, 200, 80);
  kit.watchtower(scene, ctx, 360, 560, 120);
  kit.watchtower(scene, ctx, 1080, 560, 120);
  kit.banner(scene, 500, 480, 0xd1495b);
  kit.banner(scene, 940, 480, 0x8b5cf6);
  kit.crate(scene, ctx, 720, 620, 100, 40, 0x6a5a88);
}

function buildSecretThrone(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xd8c8f8, 0x4a3a68);
  kit.throne(scene, ctx, 720, 480);
  kit.banner(scene, 520, 460, 0xf2c94c);
  kit.banner(scene, 920, 460, 0xd1495b);
  kit.banner(scene, 400, 500, 0x8b5cf6);
  kit.banner(scene, 1040, 500, 0x8b5cf6);
  kit.crate(scene, ctx, 280, 620, 70, 36, 0x6a5a88);
  kit.crate(scene, ctx, 1100, 620, 70, 36, 0x6a5a88);
}

function buildSecretBackrooms(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0xf2c94c, 0xe0b830);
  const gfx = scene.add.graphics().setDepth(50);
  gfx.lineStyle(2, 0xd4a820, 0.6);
  for (let y = 200; y < 700; y += 48) gfx.lineBetween(80, y, 1360, y);
  for (let x = 120; x < 1360; x += 96) gfx.lineBetween(x, 160, x, 720);
  kit.crate(scene, ctx, 400, 580, 90, 40, 0xc4a020);
  kit.crate(scene, ctx, 900, 600, 80, 36, 0xc4a020);
  kit.crate(scene, ctx, 720, 640, 100, 40, 0xb89018);
}

function buildSecretDeveloper(ctx, t) {
  const { scene } = ctx;
  kit.interiorWall(scene, ctx, 0x1a1a22, 0x2a2a32);
  kit.serverRack(scene, ctx, 300, 560, 90);
  kit.serverRack(scene, ctx, 1100, 560, 90);
  kit.terminal(scene, 720, 480);
  kit.labBench(scene, ctx, 720, 620, 200);
  scene.add
    .text(720, 200, "DEBUG ROOM", {
      fontFamily: '"Comic Sans MS", sans-serif',
      fontSize: "22px",
      fontStyle: "bold",
      color: "#62c462",
      stroke: "#0b0b12",
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setDepth(200);
  kit.crate(scene, ctx, 200, 620, 70, 36, 0x3a3a48);
  kit.crate(scene, ctx, 1200, 620, 70, 36, 0x3a3a48);
}

const SECRET_BUILDS = Object.freeze({
  secret_11_greenhouse: buildSecretGreenhouse,
  secret_12_lighthouse: buildSecretLighthouse,
  secret_13_boiler: buildSecretBoiler,
  secret_14_crystal: buildSecretCrystal,
  secret_15_server: buildSecretServer,
  secret_16_tomb: buildSecretTomb,
  secret_17_observatory: buildSecretObservatory,
  secret_18_safe: buildSecretSafeRoom,
  secret_19_armory: buildSecretArmory,
  secret_20_throne: buildSecretThrone,
  secret_backrooms: buildSecretBackrooms,
  secret_developer: buildSecretDeveloper
});

export {
  buildOrganicGarden,
  buildOrganicHarbor,
  buildOrganicFactory,
  buildOrganicMine,
  buildOrganicLab,
  buildOrganicRuins,
  buildOrganicPeak,
  buildOrganicVault,
  buildOrganicCitadelGate,
  buildOrganicCitadel
};

export function makeSecretRoom({ id, parentKey = "exit", parentRoom, customBuild = null }) {
  const build = customBuild || SECRET_BUILDS[id] || null;
  return makeExpansionRoom({
    id,
    theme: "secret",
    interior: true,
    customBuild: build,
    gates: [{ key: parentKey, x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }],
    spawns: {
      default: { x: 720, y: 600 },
      [`from_${parentRoom?.replace("room_", "") || "parent"}`]: { x: 200, y: 600 },
      from_room_11: { x: 200, y: 600 },
      from_room_12: { x: 200, y: 600 },
      from_room_13: { x: 200, y: 600 },
      from_room_14: { x: 200, y: 600 },
      from_room_15: { x: 200, y: 600 },
      from_room_16: { x: 200, y: 600 },
      from_room_17: { x: 200, y: 600 },
      from_room_18: { x: 200, y: 600 },
      from_room_19: { x: 200, y: 600 },
      from_room_20: { x: 200, y: 600 },
      from_citadel: { x: 200, y: 600 }
    }
  });
}
