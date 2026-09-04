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

export { buildOrganicGarden };

export function makeSecretRoom({ id, parentKey = "exit", parentRoom }) {
  return makeExpansionRoom({
    id,
    theme: "secret",
    interior: true,
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
