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

export function makeExpansionRoom({
  id,
  theme = "garden",
  interior = false,
  sealId = null,
  gates = [],
  spawns = {},
  wireExtra = null,
  decor = null
}) {
  const t = THEMES[theme] || THEMES.garden;
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
      if (interior) {
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
      }
      kit.crate(scene, ctx, 200, 580, 100, 40, 0x8a6238);
      kit.crate(scene, ctx, 1100, 600, 120, 44, 0xa9805a);
      if (typeof decor === "function") decor(ctx, t);
      if (sealId && !ctx.save.areaSeals?.includes(sealId)) {
        scene.add
          .text(720, 120, "SELO DA ÁREA", {
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
          x: 720,
          y: 400,
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
          .circle(720, 400, 28, 0xf2c94c, 0.9)
          .setDepth(400)
          .setStrokeStyle(3, 0x33333d, 0.8);
      }
      if (typeof wireExtra === "function") wireExtra(ctx);
    }
  };
}

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
