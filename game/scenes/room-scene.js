// RoomScene — motor genérico que monta qualquer área a partir do módulo dela.
// Responsável por: player, colisões, markers, ovos, gates, puzzles, HUD,
// transições com fade + spawn no ponto de entrada + cooldown anti-ping-pong.
import { VIEW, GAMEPLAY, TRANSITION, SOFTLOCK } from "../config/game-config.js";
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
import {
  isPositionWalkable,
  firstBlockingSolid,
  resolveSafePoint,
  buildUnstuckCandidates,
  playerFeetRect
} from "../physics/walkability.js";

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
    this._safeSampleAcc = 0;
    this._stuckAcc = 0;
    this._lastUnstuckAt = 0;
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

    const spawnPoint = this.resolveSpawnPoint(room, save, this.arriveAt);
    this.inputController = new InputController(this);
    this.player = new Player(this, spawnPoint.x, spawnPoint.y, this.inputController);
    globalThis.FTMInput = this.inputController;
    if (spawnPoint.recovered) {
      hud.toast("Posição inválida detectada. Movendo para um local seguro.", {
        icon: "🛟",
        duration: 2800
      });
      this.logSoftlock("load_invalid", spawnPoint.from, spawnPoint);
    }
    state.saveManager.setPlayerPosition(spawnPoint.x, spawnPoint.y);
    state.saveManager.setLastSafePosition({
      areaId: this.roomId,
      x: spawnPoint.x,
      y: spawnPoint.y
    });

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
      this.drawDebugSpawns(room);
      this.drawDebugGates();
    }
  }

  resolveSpawnPoint(room, save, arriveAt) {
    const named = room.spawns?.[arriveAt] || room.spawns?.default || SOFTLOCK.globalStart;
    const sameRoom = save.currentRoom === this.roomId;
    const savedOk =
      sameRoom &&
      arriveAt === "default" &&
      Number.isFinite(save.playerX) &&
      Number.isFinite(save.playerY) &&
      isPositionWalkable(save.playerX, save.playerY, this.solids, VIEW);

    if (savedOk) {
      return { x: save.playerX, y: save.playerY, source: "save", recovered: false, from: null };
    }

    const candidates = buildUnstuckCandidates({
      roomId: this.roomId,
      room,
      lastSafe: save.lastSafePosition,
      arriveAt,
      globalStart: { ...SOFTLOCK.globalStart, source: "global:room_09_spawn" }
    });
    if (named && Number.isFinite(named.x) && Number.isFinite(named.y)) {
      candidates.unshift({ x: named.x, y: named.y, source: `spawn:${arriveAt || "default"}` });
    }
    const picked = resolveSafePoint(candidates, this.solids, VIEW);
    if (picked) {
      const recovered =
        sameRoom &&
        arriveAt === "default" &&
        Number.isFinite(save.playerX) &&
        Number.isFinite(save.playerY) &&
        !savedOk;
      return {
        x: picked.x,
        y: picked.y,
        source: picked.source,
        recovered,
        from: recovered ? { x: save.playerX, y: save.playerY } : null
      };
    }
    return {
      x: named.x ?? SOFTLOCK.globalStart.x,
      y: named.y ?? SOFTLOCK.globalStart.y,
      source: "fallback",
      recovered: false,
      from: null
    };
  }

  travel(connection) {
    if (this.transitioning) return;
    if (performance.now() - this.enteredAt < TRANSITION.cooldownMs) return;
    this.transitioning = true;
    this.player.stop();
    if (this.player) {
      state.saveManager.setPlayerPosition(this.player.x, this.player.y);
    }
    state.hud.clearAllInteractions();
    Sfx.transition();
    this.cameras.main.fadeOut(TRANSITION.fadeMs, 10, 14, 20);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      state.saveManager.setCurrentRoom(connection.to);
      state.saveManager.setPlayerPosition(null, null);
      this.scene.restart({ roomId: connection.to, arriveAt: connection.arriveAt || "default" });
    });
  }

  flushPositionToSave() {
    if (!this.player || this.transitioning) return;
    const px = this.player.x;
    const py = this.player.y;
    state.saveManager.setPlayerPosition(px, py);
    if (isPositionWalkable(px, py, this.solids, VIEW)) {
      state.saveManager.setLastSafePosition({ areaId: this.roomId, x: px, y: py });
    } else {
      state.saveManager.persist();
    }
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
      this.flushPositionToSave();
      state.hud.showPause();
    }
  }

  canUnstuck() {
    const now = performance.now();
    return now - this._lastUnstuckAt >= SOFTLOCK.unstuckCooldownMs;
  }

  unstuckCooldownRemainingMs() {
    const left = SOFTLOCK.unstuckCooldownMs - (performance.now() - this._lastUnstuckAt);
    return Math.max(0, Math.ceil(left));
  }

  unstuck(reason = "manual") {
    if (!this.player || this.transitioning) {
      return { ok: false, reason: "busy" };
    }
    if (reason === "manual" && !this.canUnstuck()) {
      return { ok: false, reason: "cooldown", remainingMs: this.unstuckCooldownRemainingMs() };
    }

    const old = { x: this.player.x, y: this.player.y };
    const save = state.saveManager.save;
    const candidates = buildUnstuckCandidates({
      roomId: this.roomId,
      room: this.room,
      lastSafe: save.lastSafePosition,
      arriveAt: this.arriveAt || "default",
      globalStart: { ...SOFTLOCK.globalStart, source: "global:room_09_spawn" }
    });
    let picked = resolveSafePoint(candidates, this.solids, VIEW);

    if (!picked && this.roomId !== SOFTLOCK.globalStart.roomId) {
      this._lastUnstuckAt = performance.now();
      this.logSoftlock(reason, old, {
        x: SOFTLOCK.globalStart.x,
        y: SOFTLOCK.globalStart.y,
        source: "warp:room_09_spawn"
      });
      state.saveManager.setCurrentRoom(SOFTLOCK.globalStart.roomId);
      state.saveManager.setPlayerPosition(SOFTLOCK.globalStart.x, SOFTLOCK.globalStart.y);
      state.saveManager.setLastSafePosition({
        areaId: SOFTLOCK.globalStart.roomId,
        x: SOFTLOCK.globalStart.x,
        y: SOFTLOCK.globalStart.y
      });
      this.scene.restart({
        roomId: SOFTLOCK.globalStart.roomId,
        arriveAt: "default"
      });
      return {
        ok: true,
        warped: true,
        from: old,
        to: { x: SOFTLOCK.globalStart.x, y: SOFTLOCK.globalStart.y },
        source: "warp:room_09_spawn"
      };
    }

    if (!picked) {
      picked = {
        x: SOFTLOCK.globalStart.x,
        y: SOFTLOCK.globalStart.y,
        source: "global:room_09_spawn"
      };
    }

    this.player.stop();
    this.player.sprite.body.reset(picked.x, picked.y);
    this.player.syncVisuals?.();
    this._stuckAcc = 0;
    this._lastUnstuckAt = performance.now();
    state.saveManager.setPlayerPosition(picked.x, picked.y);
    state.saveManager.setLastSafePosition({
      areaId: this.roomId,
      x: picked.x,
      y: picked.y
    });
    this.logSoftlock(reason, old, picked);
    return { ok: true, from: old, to: { x: picked.x, y: picked.y }, source: picked.source };
  }

  logSoftlock(reason, from, to) {
    if (!state.debug) return;
    const blocker = from ? firstBlockingSolid(from.x, from.y, this.solids) : null;
    console.info("[SOFTLOCK_RECOVERY]", {
      areaId: this.roomId,
      oldPosition: from,
      newPosition: to ? { x: to.x, y: to.y } : null,
      source: to?.source,
      reason,
      collider: blocker
    });
  }

  tickSoftlock(delta) {
    if (!this.player || this.paused || this.transitioning) return;
    const x = this.player.x;
    const y = this.player.y;
    const walkable = isPositionWalkable(x, y, this.solids, VIEW);

    if (walkable) {
      this._stuckAcc = 0;
      this._safeSampleAcc += delta;
      if (this._safeSampleAcc >= SOFTLOCK.safeSampleMs) {
        this._safeSampleAcc = 0;
        state.saveManager.setLastSafePosition({ areaId: this.roomId, x, y }, { persist: false });
        state.saveManager.setPlayerPosition(x, y, { persist: false });
      }
      return;
    }

    this._safeSampleAcc = 0;
    this._stuckAcc += delta;
    if (this._stuckAcc >= SOFTLOCK.stuckMs) {
      this._stuckAcc = 0;
      const result = this.unstuck("auto");
      if (result?.ok) {
        state.hud.toast("✅ Personagem movido para um local seguro.", {
          icon: "🛟",
          duration: 2400
        });
      }
    }
  }

  drawDebugSpawns(room) {
    const spawns = room?.spawns || {};
    for (const [key, sp] of Object.entries(spawns)) {
      if (!sp || !Number.isFinite(sp.x) || !Number.isFinite(sp.y)) continue;
      this.add.circle(sp.x, sp.y, 10, 0x3b82f6, 0.55).setDepth(99997);
      this.add
        .text(sp.x, sp.y - 18, key, {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#93c5fd",
          backgroundColor: "#00000088",
          padding: { x: 3, y: 1 }
        })
        .setOrigin(0.5)
        .setDepth(99997);
    }
  }

  drawDebugGates() {
    this.gates.forEach((gate) => {
      const z = gate.zone;
      if (!z) return;
      this.add
        .rectangle(z.x, z.y, z.width || z.body?.width || 70, z.height || z.body?.height || 220, 0x22c55e, 0.18)
        .setDepth(99996);
    });
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

    this.debugFeet = this.add.rectangle(0, 0, 28, 18, 0xfacc15, 0.45).setDepth(99998).setOrigin(0.5, 1);

    this.events.on("update", () => {
      if (!this.debugText) return;
      const px = this.player?.x ?? 0;
      const py = this.player?.y ?? 0;
      const walkable = isPositionWalkable(px, py, this.solids, VIEW);
      const safe = save.lastSafePosition;
      const safeStr = safe
        ? `${safe.areaId}@${Math.round(safe.x)},${Math.round(safe.y)}`
        : "--";
      const feet = playerFeetRect(px, py);
      if (this.debugFeet) {
        this.debugFeet.setPosition(px, py);
        this.debugFeet.setSize(feet.w, feet.h);
        this.debugFeet.setFillStyle(walkable ? 0xfacc15 : 0xef4444, 0.45);
      }
      this.debugText.setText(
        [
          `room: ${this.roomId}`,
          `markers: ${state.saveManager.markerCount}/${markersForRoom(this.roomId).length} nesta sala`,
          `total: ${state.saveManager.markerCount}`,
          `eggs: ${save.discoveredEggIds.length}/5`,
          `puzzles: 3x3=${save.puzzleStates.redButtonsSolved ? "OK" : "--"} medidor=${save.puzzleStates.difficultySolved ? "OK" : "--"} caixas=${save.puzzleStates.creditsBoxesSolved ? "OK" : "--"}`,
          `player: ${Math.round(px)},${Math.round(py)} walkable=${walkable ? "Y" : "N"} stuckMs=${Math.round(this._stuckAcc || 0)}`,
          `lastSafe: ${safeStr}`
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

    if (this.paused || this.transitioning || state.hud.puzzleModalOpen) {
      this.player.update(delta, true);
      input.endFrame();
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    this.player.update(delta);
    this.sortDepthByY();
    this.tickSoftlock(delta);

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
