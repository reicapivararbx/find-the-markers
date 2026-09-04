import { Interactable } from "../entities/interactable.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

const PADS = Object.freeze([
  { id: "C", label: "C", color: 0x39c5bb, x: 480 },
  { id: "A", label: "A", color: 0x56ccf2, x: 640 },
  { id: "P", label: "P", color: 0x8b5cf6, x: 800 },
  { id: "Y", label: "Y", color: 0xf2c94c, x: 960 }
]);

const ROUNDS = Object.freeze([
  ["C", "A", "P"],
  ["C", "A", "P", "Y", "A"],
  ["Y", "P", "A", "C", "P", "Y"]
]);

export class MikuRhythmPuzzle {
  constructor(scene, { saveManager, hud, onSolved = null }) {
    this.scene = scene;
    this.sm = saveManager;
    this.hud = hud;
    this.onSolved = onSolved;
    this.solved = Boolean(saveManager.save.puzzleStates.mikuPuzzleSolved);
    this.roundIndex = 0;
    this.playerInput = [];
    this.playingDemo = false;
    this.padGfx = new Map();
    this.interactables = [];
    this.statusText = null;

    if (this.solved) return;

    const baseY = 620;
    PADS.forEach((pad, i) => {
      const gfx = scene.add.circle(pad.x, baseY, 36, pad.color, 0.92).setDepth(baseY + 4);
      gfx.setStrokeStyle(4, 0x33333d, 0.9);
      scene.add
        .text(pad.x, baseY, pad.label, {
          fontFamily: '"Comic Sans MS", sans-serif',
          fontSize: "22px",
          fontStyle: "bold",
          color: "#1a1a22"
        })
        .setOrigin(0.5)
        .setDepth(baseY + 5);
      this.padGfx.set(pad.id, gfx);

      const interactable = new Interactable(scene, {
        id: `miku_pad_${pad.id}`,
        x: pad.x,
        y: baseY,
        radius: 70,
        prompt: `[E] Pad ${pad.label}`,
        action: () => this.pressPad(pad.id, i)
      });
      this.interactables.push(interactable);
    });

    this.statusText = scene.add
      .text(720, 520, "Assista a sequência…", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "18px",
        fontStyle: "bold",
        color: "#e8f8f6",
        backgroundColor: "#1a1a28cc",
        padding: { x: 10, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(800);

    const startPad = new Interactable(scene, {
      id: "miku_start",
      x: 720,
      y: 460,
      radius: 90,
      prompt: "[E] Ouvir sequência",
      action: () => this.playDemo()
    });
    this.interactables.push(startPad);

    scene.time.delayedCall(400, () => this.playDemo());
  }

  flashPad(id) {
    const gfx = this.padGfx.get(id);
    if (!gfx) return;
    this.scene.tweens.add({
      targets: gfx,
      scale: 1.25,
      alpha: 1,
      duration: 120,
      yoyo: true
    });
  }

  playDemo() {
    if (this.solved || this.playingDemo) return;
    this.playingDemo = true;
    this.playerInput = [];
    const seq = ROUNDS[this.roundIndex];
    this.statusText?.setText(`Rodada ${this.roundIndex + 1}/${ROUNDS.length}`);
    seq.forEach((id, i) => {
      this.scene.time.delayedCall(450 * (i + 1), () => {
        this.flashPad(id);
        Sfx.mikuNote(PADS.findIndex((p) => p.id === id));
        if (i === seq.length - 1) {
          this.playingDemo = false;
          this.statusText?.setText("Sua vez! Repita a sequência.");
        }
      });
    });
  }

  pressPad(id, index) {
    if (this.solved || this.playingDemo) return;
    this.flashPad(id);
    Sfx.mikuNote(index);
    this.playerInput.push(id);
    const expected = ROUNDS[this.roundIndex];
    const step = this.playerInput.length - 1;
    if (this.playerInput[step] !== expected[step]) {
      Sfx.puzzleError();
      this.hud.toast("Errou o ritmo — sequência resetada.", { icon: "♪", duration: 2000 });
      this.playerInput = [];
      this.statusText?.setText("Tente de novo. [E] no centro para ouvir.");
      bus.emit(Events.PUZZLE_RESET, { id: "miku_rhythm" });
      return;
    }
    bus.emit(Events.PUZZLE_STEP, { id: "miku_rhythm", step: step + 1 });
    if (this.playerInput.length === expected.length) {
      if (this.roundIndex >= ROUNDS.length - 1) {
        this.complete();
      } else {
        this.roundIndex += 1;
        this.playerInput = [];
        this.hud.toast(`Rodada ${this.roundIndex + 1}!`, { icon: "♪", duration: 1600 });
        this.scene.time.delayedCall(600, () => this.playDemo());
      }
    }
  }

  complete() {
    if (this.solved) return;
    this.solved = true;
    this.sm.unlockMikuMarker();
    Sfx.puzzleSolved();
    this.hud.toast("Perfeito! Você acertou o ritmo! ♪", { icon: "🎤", duration: 2800 });
    this.statusText?.setText("Agora pode me coletar!");
    if (typeof this.onSolved === "function") this.onSolved();
  }

  update(px, py, interactJustDown, hud) {
    if (this.solved) return;
    this.interactables.forEach((i) => i.update(px, py, interactJustDown, hud));
  }
}
