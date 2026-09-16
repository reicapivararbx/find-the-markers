// VALIDAÇÃO ESTÁTICA DO SISTEMA DE MAPAS.
// Erro aqui = o grafo de áreas está quebrado ANTES de abrir o jogo.
// Cada falha imprime [AREA VALIDATION ERROR] com área/transição/problema.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { ROOMS } from "../game/rooms/index.js";
import {
  ROOM_CONNECTIONS,
  ROOM_NAMES,
  canEnter
} from "../game/config/room-connections.js";
import { VIEW, PLAYER_CHARACTERS, SECRET_NPC_SPRITES, AREA_SEAL_IDS } from "../game/config/game-config.js";
import { gateZoneRects } from "../game/entities/gate.js";
import { feetInsideAnyRect, isPositionWalkable } from "../game/physics/walkability.js";
import { METER_ROWS } from "../game/config/difficulty-metadata.js";
import { MARKERS } from "../game/config/marker-registry.js";
import { HAND_DRAWN_MARKERS, HAND_DRAWN_QUESTS, QUEST_BY_ID } from "../game/config/hand-drawn-markers.js";
import { allQuestItemIds } from "../game/progression/quests.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPAWN_ZONE_MARGIN = 4;

function areaError(area, transition, problem) {
  return `[AREA VALIDATION ERROR]\nArea: ${area}\nTransition: ${transition || "-"}\nProblem: ${problem}`;
}

// ---- 1. Registro: toda sala tem módulo, id, nome e spawn base -------------

test("toda sala do registry tem id, spawns default e bounds válidos", () => {
  for (const [roomId, room] of Object.entries(ROOMS)) {
    assert.equal(room.id, roomId, areaError(roomId, "-", "room.id diverge da chave do registry"));
    assert.ok(room.spawns?.default, areaError(roomId, "-", "spawn default ausente"));
    assert.ok(
      Number.isFinite(room.spawns.default.x) && Number.isFinite(room.spawns.default.y),
      areaError(roomId, "-", "spawn default sem coordenadas numéricas")
    );
    if (room.bounds) {
      assert.ok(room.bounds.width > 0 && room.bounds.height > 0, areaError(roomId, "-", "bounds inválidos"));
    }
  }
});

test("toda sala tem nome de exibição (HUD)", () => {
  for (const roomId of Object.keys(ROOMS)) {
    const room = ROOMS[roomId];
    if (room.hidden && room.code) continue; // salas secretas mostram código
    assert.ok(ROOM_NAMES[roomId], areaError(roomId, "-", "sem ROOM_NAMES para o HUD"));
  }
});

// ---- 2. Grafo de transições: destino, chegada e gate existem ---------------

test("cada destino existe e o arriveAt tem spawn na sala de destino", () => {
  for (const [roomId, exits] of Object.entries(ROOM_CONNECTIONS)) {
    assert.ok(ROOMS[roomId], areaError(roomId, "-", "conexão de sala sem módulo"));
    for (const [key, exit] of Object.entries(exits)) {
      if (exit.to) {
        assert.ok(ROOMS[exit.to], areaError(roomId, key, `destino inexistente: ${exit.to}`));
        assert.ok(
          ROOMS[exit.to].spawns?.[exit.arriveAt],
          areaError(roomId, key, `target spawn "${exit.arriveAt}" não existe em ${exit.to}`)
        );
      } else {
        // destino nulo só é aceito como gate pendente/explícito de conteúdo futuro
        assert.equal(
          exit.pending,
          true,
          areaError(roomId, key, "to: null sem pending:true (conteúdo futuro deve ser declarado)")
        );
      }
    }
  }
});

test("todo gate declarado em sala tem conexão correspondente (sem trigger morto)", () => {
  for (const [roomId, room] of Object.entries(ROOMS)) {
    for (const gateDef of room.gates || []) {
      const connection = ROOM_CONNECTIONS[roomId]?.[gateDef.key];
      assert.ok(
        connection,
        areaError(roomId, gateDef.key, "gate sem conexão em ROOM_CONNECTIONS (trigger morto/silencioso)")
      );
    }
  }
});

test("grafo: nenhuma sala alcançável vira armadilha de sentido único", () => {
  const back = new Map(); // to -> Set(de onde se chega)
  for (const [roomId, exits] of Object.entries(ROOM_CONNECTIONS)) {
    for (const [, exit] of Object.entries(exits)) {
      if (!exit.to) continue;
      if (!back.has(exit.to)) back.set(exit.to, new Set());
      back.get(exit.to).add(roomId);
    }
  }
  for (const [target, sources] of back) {
    if (target === "room_09_spawn") continue; // hub: voltar é opcional por design
    const exits = ROOM_CONNECTIONS[target] || {};
    const goesSomewhere = Object.values(exits).some((exit) => exit.to && exit.to !== target);
    assert.ok(
      goesSomewhere,
      areaError(target, "-", `recebe transição de ${[...sources].join(", ")} mas não tem saída alguma`)
    );
  }
});

test("nenhuma transição aponta para si mesma", () => {
  for (const [roomId, exits] of Object.entries(ROOM_CONNECTIONS)) {
    for (const [key, exit] of Object.entries(exits)) {
      assert.notEqual(exit.to, roomId, areaError(roomId, key, "transição aponta para a própria sala"));
    }
  }
});

// ---- 3. Spawn × trigger: proibido nascer dentro de portal (ping-pong) ------

test("nenhum spawn de nenhuma sala nasce dentro de zona de gate (ping-pong)", () => {
  for (const [roomId, room] of Object.entries(ROOMS)) {
    const zones = gateZoneRects(room);
    if (!zones.length) continue;
    for (const [spawnKey, sp] of Object.entries(room.spawns || {})) {
      assert.ok(
        !feetInsideAnyRect(sp.x, sp.y, zones, SPAWN_ZONE_MARGIN),
        areaError(roomId, spawnKey, `spawn (${sp.x}, ${sp.y}) nasce dentro de zona de trigger → ping-pong automático`)
      );
    }
  }
});

test("zonas de gate da mesma sala não se sobrepõem (trigger duplicado/sobreposto)", () => {
  for (const [roomId, room] of Object.entries(ROOMS)) {
    const zones = gateZoneRects(room);
    for (let i = 0; i < zones.length; i += 1) {
      for (let j = i + 1; j < zones.length; j += 1) {
        const a = zones[i];
        const b = zones[j];
        const overlap =
          a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
        assert.ok(!overlap, areaError(roomId, `gate#${i} × gate#${j}`, "zonas de trigger se sobrepõem"));
      }
    }
  }
});

test("zonas de gate cabem dentro dos bounds da sala", () => {
  for (const [roomId, room] of Object.entries(ROOMS)) {
    for (const z of gateZoneRects(room)) {
      assert.ok(z.x >= 0 && z.y >= 0, areaError(roomId, "-", `zona de gate com origem negativa (${z.x}, ${z.y})`));
      assert.ok(
        z.x + z.width <= VIEW.width && z.y + z.height <= VIEW.height,
        areaError(roomId, "-", "zona de gate extrapolia os bounds da sala")
      );
    }
  }
});

// ---- 4. Condições e requisitos de gate são estados reais do save -----------

const PUZZLE_STATE_KEYS = [
  "redButtonsSolved",
  "difficultySolved",
  "creditsBoxesSolved",
  "valvesSolved",
  "batteriesSolved",
  "runesSolved",
  "fragmentsSolved",
  "firewallSolved",
  "mikuPuzzleSolved",
  "poolHallDoorUnlocked",
  "shadowWatcherStarted",
  "shadowWatcherSolved",
  "mysteriousCapybaraSolved",
  "capybaraCodeMarkerUnlocked",
  "capybaraCodeMarkerCollected",
  "clockSolved",
  "machineSolved",
  "grumpyCalmed",
  "soccerSolved",
  "baseballSolved",
  "mechSolved"
];

test("condition de transição é puzzleState real (nunca string perdida)", () => {
  for (const [roomId, exits] of Object.entries(ROOM_CONNECTIONS)) {
    for (const [key, exit] of Object.entries(exits)) {
      if (!exit.condition) continue;
      assert.ok(
        exit.condition === "E" || PUZZLE_STATE_KEYS.includes(exit.condition),
        areaError(roomId, key, `condition "${exit.condition}" não é um puzzleState conhecido`)
      );
    }
  }
});

test("canEnter respeita requiredMarkers/seals/notes com save totalmente aberto", () => {
  const fullSave = {
    collectedMarkerIds: MARKERS.map((m) => m.id),
    puzzleStates: Object.fromEntries(PUZZLE_STATE_KEYS.map((k) => [k, true])),
    areaSeals: [...AREA_SEAL_IDS],
    discoveredMusicNoteIds: ["n1", "n2", "n3", "n4", "n5"]
  };
  for (const exits of Object.values(ROOM_CONNECTIONS)) {
    for (const [, exit] of Object.entries(exits)) {
      if (!exit.to) continue;
      assert.ok(canEnter(exit, fullSave), areaError("-", "-", "save 100% bloqueado em transição alcancável"));
    }
  }
});

// ---- 5. Assets referenciados existem no disco (caminhos relativos) ---------

test("assets de player/NPC declarados existem no disco (sem 404 em produção)", () => {
  const assets = [
    ...Object.values(PLAYER_CHARACTERS).map((d) => d.path),
    ...Object.values(SECRET_NPC_SPRITES).map((d) => d.path)
  ];
  for (const rel of assets) {
    assert.ok(!rel.startsWith("/"), areaError("assets", rel, "caminho absoluto quebra deploy em subpasta"));
    assert.ok(existsSync(join(ROOT, rel)), areaError("assets", rel, "arquivo ausente no repositório"));
  }
});

// ---- 6. Markers/quests apontam para salas e posições válidas ---------------

test("todos os markers (base + conceituais) apontam para salas existentes e dentro dos bounds", () => {
  for (const marker of [...MARKERS, ...HAND_DRAWN_MARKERS]) {
    assert.ok(ROOMS[marker.room], areaError(marker.id, "-", `sala inexistente: ${marker.room}`));
    assert.ok(METER_ROWS.includes(marker.difficulty), areaError(marker.id, "-", `dificuldade inválida: ${marker.difficulty}`));
    assert.ok(
      marker.x > 0 && marker.x < VIEW.width && marker.y > 0 && marker.y < VIEW.height,
      areaError(marker.id, "-", `posição fora dos bounds: (${marker.x}, ${marker.y})`)
    );
    const room = ROOMS[marker.room];
    assert.ok(
      isPositionWalkable(marker.x, marker.y, [], room.bounds || VIEW),
      areaError(marker.id, "-", "posição fora dos bounds da própria sala")
    );
  }
});

test("quests FIND-N: ids únicos, alvos válidos e recompensas existem no registro", () => {
  const markerIds = new Set([...MARKERS, ...HAND_DRAWN_MARKERS].map((m) => m.id));
  const itemIds = allQuestItemIds();
  assert.equal(new Set(itemIds).size, itemIds.length, "ids de itens de quest duplicados");
  for (const quest of HAND_DRAWN_QUESTS) {
    assert.ok(QUEST_BY_ID[quest.id], `quest sem lookup: ${quest.id}`);
    assert.equal(quest.items.length, quest.targetCount, `quest ${quest.id}: targetCount != items.length`);
    for (const item of quest.items) {
      assert.ok(ROOMS[item.room], areaError(quest.id, item.id, `item em sala inexistente: ${item.room}`));
      assert.ok(
        !feetInsideAnyRect(item.x, item.y, gateZoneRects(ROOMS[item.room]), SPAWN_ZONE_MARGIN),
        areaError(quest.id, item.id, "item de quest nasce dentro de zona de trigger")
      );
    }
    if (quest.rewardMarkerId) {
      assert.ok(markerIds.has(quest.rewardMarkerId), `recompensa inexistente: ${quest.rewardMarkerId}`);
    }
  }
});
