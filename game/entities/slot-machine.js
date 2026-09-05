import { SLOT_CONFIG } from "../config/slot-config.js";
import { resolveSpin, applySpinResult } from "../config/slot-engine.js";
import { MARKER_BY_ID } from "../config/marker-registry.js";
import { Interactable } from "./interactable.js";
import { MarkerEntity } from "./marker-entity.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";
import { getSlotMachineUI } from "../ui/slot-machine-ui.js";

export class SlotMachine {
  constructor(scene, { x, y, saveManager, hud }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.busy = false;
    this.uiOpen = false;
    this._appliedSpinIds = new Set();
    this.pos = { x, y };

    const base = y;
    scene.add.ellipse(x, base + 4, 90, 24, 0x1a1a22, 0.3).setDepth(base);
    const body = scene.add.graphics().setDepth(base);
    body.fillStyle(0xb03a3a, 1);
    body.fillRoundedRect(x - 50, base - 120, 100, 120, 10);
    body.lineStyle(4, 0x33333d, 0.85);
    body.strokeRoundedRect(x - 50, base - 120, 100, 120, 10);
    body.fillStyle(0x1a1a22, 1);
    body.fillRoundedRect(x - 36, base - 100, 72, 40, 6);
    body.fillStyle(0xf2c94c, 1);
    body.fillCircle(x + 42, base - 70, 8);
    scene.add
      .text(x, base - 140, "SLOT", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "16px",
        fontStyle: "bold",
        color: "#fff",
        backgroundColor: "#7c3aedcc",
        padding: { x: 8, y: 2 }
      })
      .setOrigin(0.5)
      .setDepth(base + 2);

    this.interactable = new Interactable(scene, {
      id: "slot_machine",
      x,
      y: base,
      radius: 130,
      prompt: `[E] Jogar Slot (${SLOT_CONFIG.cost} coins)`,
      action: () => this.open()
    });

    this.ui = getSlotMachineUI();
    this.ui.bind({
      onSpinRequest: () => this.handleSpinRequest(),
      onClosed: () => this.onUiClosed()
    });

    this.ensureUnlockedMarkersVisible();
  }

  open() {
    if (this.uiOpen || this.busy) return;
    if (this.ui.isOpen()) return;
    this.uiOpen = true;
    this.scene.physics?.pause?.();
    this.ui.show({ coins: this.sm.save.coins });
    Sfx.interact();
  }

  onUiClosed() {
    this.uiOpen = false;
    this.busy = false;
    if (!this.scene.paused) this.scene.physics?.resume?.();
  }

  handleSpinRequest() {
    if (!this.uiOpen || this.busy || this.ui.isSpinning()) return;

    const preview = resolveSpin(this.sm.save, { busy: false });
    if (!preview.ok) {
      if (preview.reason === "insufficient") {
        this.ui.setStatus(preview.message);
        this.ui.refreshSpinButton(this.sm.save.coins);
        this.hud?.toast?.(preview.message, { icon: "🪙", duration: 2200 });
      }
      return;
    }

    if (!this.sm.spendCoins(preview.cost)) {
      this.ui.setStatus(`❌ Você precisa de ${SLOT_CONFIG.cost} Coins`);
      this.ui.refreshSpinButton(this.sm.save.coins);
      return;
    }

    this.busy = true;
    const coinsAfterDebit = this.sm.save.coins;
    this.hud?.updateCoins?.(coinsAfterDebit);

    this.ui.playSpin(preview, {
      coinsAfterDebit,
      onComplete: (result) => this.onSpinAnimationDone(result)
    });
  }

  onSpinAnimationDone(result) {
    if (!result?.ok) {
      this.busy = false;
      return;
    }
    if (this._appliedSpinIds.has(result.spinId)) {
      this.busy = false;
      return;
    }
    this._appliedSpinIds.add(result.spinId);
    if (this._appliedSpinIds.size > 40) {
      const first = this._appliedSpinIds.values().next().value;
      this._appliedSpinIds.delete(first);
    }

    applySpinResult(this.sm, result, { alreadyDebited: true });
    this.hud?.updateCoins?.(this.sm.save.coins);

    if (result.unlockJackpot) {
      this.spawnSlotMarker(SLOT_CONFIG.jackpotMarkerId, "Jackpot Marker");
    }
    if (result.unlockHighRoller) {
      this.spawnSlotMarker(SLOT_CONFIG.highRollerMarkerId, "High Roller 10 Coins");
    }

    bus.emit(Events.SLOT_SPIN, {
      spinId: result.spinId,
      kind: result.kind,
      pity: this.sm.save.slot.pity,
      coinsDelta: result.coinsDelta
    });

    this.busy = false;
  }

  spawnSlotMarker(markerId, fallbackName) {
    const def = MARKER_BY_ID[markerId];
    if (!def) return;
    if (this.sm.hasCollected(markerId)) return;

    let entity = this.scene.markerEntities?.get(markerId);
    if (!entity) {
      entity = new MarkerEntity(this.scene, def, this.sm, this.hud);
      entity.hidden = false;
      entity.sprite?.setVisible(true);
      entity.shadow?.setVisible(true);
      this.scene.markerEntities?.set(markerId, entity);
      this.scene.markers?.push(entity);
      this.scene.time.delayedCall(0, () => {
        if (this.scene.player?.sprite && entity.zone) {
          this.scene.physics.add.overlap(this.scene.player.sprite, entity.zone, () =>
            entity.tryCollect()
          );
        }
      });
    } else {
      entity.reveal?.();
    }

    bus.emit(Events.MARKER_UNLOCKED, markerId);
    Sfx.reveal();
    this.hud?.toast?.(`${fallbackName || def.name} apareceu no chão!`, {
      icon: "🎰",
      duration: 3200
    });
  }

  ensureUnlockedMarkersVisible() {
    const slot = this.sm.save.slot;
    const collected = this.sm.save.collectedMarkerIds || [];
    if (slot.jackpotWon && !collected.includes(SLOT_CONFIG.jackpotMarkerId)) {
      this.spawnSlotMarker(SLOT_CONFIG.jackpotMarkerId, "Jackpot Marker");
    }
    if (slot.highRollerWon && !collected.includes(SLOT_CONFIG.highRollerMarkerId)) {
      this.spawnSlotMarker(SLOT_CONFIG.highRollerMarkerId, "High Roller 10 Coins");
    }
  }

  update(px, py, interactJustDown, hud) {
    if (this.uiOpen) return false;
    return this.interactable.update(px, py, interactJustDown, hud);
  }
}
