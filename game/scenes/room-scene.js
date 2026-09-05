// RoomScene — motor genérico que monta qualquer área a partir do módulo dela.
// Responsável por: player, colisões, markers, ovos, gates, puzzles, HUD,
// transições com fade + spawn no ponto de entrada + cooldown anti-ping-pong.
import { VIEW, GAMEPLAY, TRANSITION } from "../config/game-config.js";
import { ROOM_CONNECTIONS, ROOM_NAMES } from "../config/room-connections.js";
import { markersForRoom } from "../config/marker-registry.js";
import { ROOMS } from "../rooms/index.js";
import { Player } from "../entities/player.js";
import { MarkerEntity } from "../entities/marker-entity.js";
import { Gate } from "../entities/gate.js";
import { Npc } from "../entities/npc.js";
import { InputController } from "../core/input.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";
import { state } from "../state.js";
import { EggQuest } from "../puzzles/egg-quest.js";
import { kit } from "./room-kit.js";
import { generateAllTextures } from "../assets/textures.js";

export class RoomScene extends Phaser.Scene {
  constructor() {
    super("RoomScene");
  }

  init(data = {}) {
    this.roomId = data.roomId || (state.saveManager?.save.currentRoom || "room_09_spawn");
    this.arriveAt = data.arriveAt || "default";
    this.transitioning = false;
    this.paused = false;
    this.solids = [];
    this.markers = [];
    this.npcs = [];
    this.gates = [];
    this.updatables = [];
    this.markerEntities = new Map();
    // referências de puzzles/portas da sala ANTERIOR morrem aqui
    this.redButtons = null;
    this.difficultyMeter = null;
    this.eggQuest = null;
    this.casinoDoor = null;
    this.exitDoor = null;
  }

  create() {
    const room = ROOMS[this.roomId];
    if (!room) {
      console.error(`[Room] Sala desconhecida: ${this.roomId}`);
      this.scene.start("RoomScene", { roomId: "room_09_spawn", arriveAt: "default" });
      return;
    }

    this.room = room;
    this.kit = kit;
    // garante texturas base mesmo se o BootScene foi interrompido (idempotente)
    generateAllTextures(this);
    this.physics.world.setBounds(0, 0, VIEW.width, VIEW.height);
    this.cameras.main.setBounds(0, 0, VIEW.width, VIEW.height);

    const save = state.saveManager.save;
    const hud = state.hud;

    // contexto entregue ao módulo da room
    const ctx = {
      scene: this,
      kit: this.kit,
      save,
      sm: state.saveManager,
      hud,
      solid: (x, y, w, h) => this.solids.push({ x, y, w, h }),
      travel: (connectionKey) => {
        const conn = ROOM_CONNECTIONS[this.roomId]?.[connectionKey];
        if (conn) this.travel(conn);
      },
      getMarker: (id) => this.markerEntities.get(id) || null,
      addNpc: (npc) => this.npcs.push(npc),
      addUpdatable: (u) => this.updatables.push(u)
    };
    this.ctx = ctx;

    room.build(ctx);

    // player no ponto de entrada nomeado (nunca dentro da seta de saída)
    const spawn = room.spawns[this.arriveAt] || room.spawns.default;
    this.inputController = new InputController(this);
    this.player = new Player(this, spawn.x, spawn.y, this.inputController);
    globalThis.FTMInput = this.inputController;

    // colisões estáticas
    this.solids.forEach((rect) => {
      const zone = this.add.zone(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h);
      this.physics.add.existing(zone, true);
      this.physics.add.collider(this.player.sprite, zone);
      if (state.debug) {
        this.add.rectangle(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w, rect.h, 0xff3155, 0.18).setDepth(99998);
      }
    });

    markersForRoom(this.roomId)
      .filter((def) => !save.collectedMarkerIds.includes(def.id))
      .filter((def) => {
        if (def.mode === "menu_champion") return Boolean(save.menuSecrets?.championSolved);
        if (def.mode === "slot") return false;
        if (def.mode === "capybara") {
          return Boolean(
            save.puzzleStates?.capybaraCodeMarkerUnlocked || save.puzzleStates?.mysteriousCapybaraSolved
          );
        }
        return true;
      })
      .forEach((def) => {
        const entity = new MarkerEntity(this, def, state.saveManager, hud);
        this.markerEntities.set(def.id, entity);
        this.markers.push(entity);
        this.physics.add.overlap(this.player.sprite, entity.zone, () => entity.tryCollect());
      });

    // ovos (missão da floresta)
    if (this.roomId === "room_07_forest" || this.roomId === "room_05_house") {
      this.eggQuest = new EggQuest(this, { roomId: this.roomId, saveManager: state.saveManager, hud });
    }

    // setas/portais de saída
    (room.gates || []).forEach((gateDef) => {
      const connection = ROOM_CONNECTIONS[this.roomId]?.[gateDef.key];
      if (!connection) return;
      this.gates.push(
        new Gate(this, {
          id: `${this.roomId}:${gateDef.key}`,
          connection,
          x: gateDef.x,
          arrowY: gateDef.arrowY ?? 470,
          zone: gateDef.zone,
          arrow: gateDef.arrow,
          save,
          hud,
          onTravel: (conn) => this.travel(conn)
        })
      );
    });

    // conteúdo específico da área (puzzles, NPCs, portas com E)
    room.wire?.(ctx);

    // painel superior de markers da área (como nos desenhos)
    if (room.panelMarkerIds?.length) {
      const defs = room.panelMarkerIds.map((id) => markersForRoom(this.roomId).find((m) => m.id === id)).filter(Boolean);
      this.kit.panelStrip(this, defs, save.collectedMarkerIds);
    }

    // HUD
    hud.showGameplay();
    hud.setCounter(save.collectedMarkerIds.length);
    hud.setArea(ROOM_NAMES[this.roomId] || this.roomId);
    hud.updateEggs(save.discoveredEggIds.length, 5);
    hud.updateCoins(save.coins ?? 0);
    hud.updateMusicNotes(save.discoveredMusicNoteIds?.length ?? 0, 5);

    // entrada na sala (relógio real: monotônico entre restarts da cena)
    this.enteredAt = performance.now();
    this.cameras.main.fadeIn(TRANSITION.fadeMs, 10, 14, 20);
    save.currentRoom !== this.roomId && state.saveManager.setCurrentRoom(this.roomId);
    bus.emit(Events.ROOM_ENTERED, this.roomId);

    if (state.debug) {
      window.FTMScene = this;
      this.createDebugLayer();
    }
  }

  // viajar = fade curto + spawn no ponto de entrada + cooldown anti-ping-pong
  travel(connection) {
    if (this.transitioning) return;
    if (performance.now() - this.enteredAt < TRANSITION.cooldownMs) return;
    this.transitioning = true;
    this.player.stop();
    state.hud.clearAllInteractions();
    Sfx.transition();
    this.cameras.main.fadeOut(TRANSITION.fadeMs, 10, 14, 20);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      state.saveManager.setCurrentRoom(connection.to);
      this.scene.restart({ roomId: connection.to, arriveAt: connection.arriveAt || "default" });
    });
  }

  togglePause() {
    if (this.paused) {
      this.paused = false;
      this.physics.resume();
      state.hud.hidePause();
    } else {
      this.paused = true;
      this.physics.pause();
      this.player.stop();
      state.hud.showPause();
    }
  }

  createDebugLayer() {
    const save = state.saveManager.save;
    this.debugText = this.add
      .text(12, 118, "", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#7CFC9B",
        backgroundColor: "#000000aa",
        padding: { x: 6, y: 4 }
      })
      .setDepth(99999);

    this.events.on("update", () => {
      if (!this.debugText) return;
      this.debugText.setText(
        [
          `room: ${this.roomId}`,
          `markers: ${state.saveManager.markerCount}/${markersForRoom(this.roomId).length} nesta sala`,
          `total: ${state.saveManager.markerCount}`,
          `eggs: ${save.discoveredEggIds.length}/5`,
          `puzzles: 3x3=${save.puzzleStates.redButtonsSolved ? "OK" : "--"} medidor=${save.puzzleStates.difficultySolved ? "OK" : "--"} caixas=${save.puzzleStates.creditsBoxesSolved ? "OK" : "--"}`,
          `player: ${Math.round(this.player.x)},${Math.round(this.player.y)}`
        ].join("\n")
      );
    });
  }

  update(time, delta) {
    const input = this.inputController;
    if (!input || !this.player) return;
    input.beginFrame();

    if (input.pauseJustDown && !state.hud.isModalOpen()) {
      this.togglePause();
    } else if (this.paused && input.pauseJustDown) {
      this.togglePause();
    }

    if (input.collectionJustDown) {
      state.hud.toggleCollection();
    }

    if (this.paused || this.transitioning) {
      this.player.update(delta, true);
      input.endFrame();
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    this.player.update(delta);
    this.sortDepthByY();

    this.updatables.forEach((u) => u.update?.(px, py, input.interactJustDown, state.hud));
    this.difficultyMeter?.update(px, py);
    this.redButtons?.update(px, py);
    this.gates.forEach((gate) => gate.highlight(Math.hypot(px - gate.zone.x, py - gate.zone.y) < 190));
    this.npcs.forEach((npc) => npc.update(px, py));

    input.endFrame();
  }

  sortDepthByY() {
    const list = this.children?.list;
    if (!list) return;
    for (let i = 0; i < list.length; i += 1) {
      const obj = list[i];
      if (!obj || !obj.active) continue;
      if (obj.getData?.("ySort") !== true) continue;
      const bias = Number(obj.getData("depthBias")) || 0;
      const y = typeof obj.y === "number" ? obj.y : 0;
      obj.setDepth(y + bias);
    }
  }
}
