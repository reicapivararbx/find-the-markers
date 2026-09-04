import { ECONOMY } from "../config/game-config.js";
import { Interactable } from "./interactable.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

function rollOutcome(slot) {
  if (!slot.jackpotWon && slot.pity >= ECONOMY.pityHard) return "jackpot";
  if (!slot.highRollerWon && slot.pity >= ECONOMY.pitySoft && Math.random() < 0.35) return "highRoller";
  if (!slot.jackpotWon && Math.random() < 0.04) return "jackpot";
  if (!slot.highRollerWon && Math.random() < 0.08) return "highRoller";
  if (Math.random() < 0.35) return "coins";
  return "miss";
}

export class SlotMachine {
  constructor(scene, { x, y, saveManager, hud }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.busy = false;

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
      prompt: `[E] Girar (${ECONOMY.slotCost} coins)`,
      action: () => this.spin()
    });
  }

  spin() {
    if (this.busy) return;
    if (!this.sm.spendCoins(ECONOMY.slotCost)) {
      this.hud.toast(`Precisa de ${ECONOMY.slotCost} coins.`, { icon: "🪙", duration: 2200 });
      return;
    }
    this.busy = true;
    Sfx.interact();
    const outcome = rollOutcome(this.sm.save.slot);
    const jackpot = outcome === "jackpot";
    const highRoller = outcome === "highRoller";
    this.sm.recordSlotSpin({ jackpot, highRoller });

    if (jackpot && this.sm.collectMarker("jackpot_marker")) {
      this.hud.notifyMarker?.({ name: "Jackpot Marker", difficulty: "Insane" });
      this.hud.toast("JACKPOT!", { icon: "🎰", duration: 3200 });
    } else if (highRoller && this.sm.collectMarker("high_roller_marker")) {
      this.hud.notifyMarker?.({ name: "High Roller 10 Coins", difficulty: "Challenging" });
      this.sm.addCoins(10);
      this.hud.toast("High Roller! +10 coins", { icon: "🎰", duration: 2800 });
    } else if (outcome === "coins") {
      const gain = 1 + Math.floor(Math.random() * 4);
      this.sm.addCoins(gain);
      this.hud.toast(`+${gain} coins`, { icon: "🪙", duration: 2000 });
    } else {
      this.hud.toast("Quase… tente de novo.", { icon: "🎰", duration: 1800 });
    }

    bus.emit(Events.SLOT_SPIN, { outcome, pity: this.sm.save.slot.pity });
    this.scene.time.delayedCall(400, () => {
      this.busy = false;
    });
  }

  update(px, py, interactJustDown, hud) {
    return this.interactable.update(px, py, interactJustDown, hud);
  }
}
