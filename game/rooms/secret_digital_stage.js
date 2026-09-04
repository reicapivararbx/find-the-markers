import { kit } from "../scenes/room-kit.js";
import { MikuRhythmPuzzle } from "../puzzles/miku-rhythm.js";
import { Interactable } from "../entities/interactable.js";

export default {
  id: "secret_digital_stage",
  panelMarkerIds: ["hatsune_miku_marker"],

  spawns: {
    default: { x: 200, y: 620 },
    from_room_04: { x: 200, y: 620 },
    from_city: { x: 200, y: 620 }
  },

  gates: [{ key: "exit", x: 40, arrowY: 520, zone: { x: 0, y: 400, width: 70, height: 240 } }],

  build(ctx) {
    const { scene } = ctx;
    kit.interiorWall(scene, ctx, 0x1a1a28, 0x2a2a38);

    const stageBase = 560;
    kit.shadow(scene, 720, stageBase + 20, 520, 40, 0.4);
    const stage = scene.add.graphics().setDepth(stageBase);
    stage.fillStyle(0x2a2a40, 1);
    stage.fillRoundedRect(400, stageBase - 40, 640, 80, 12);
    stage.fillStyle(0x39c5bb, 0.35);
    stage.fillRoundedRect(420, stageBase - 28, 600, 56, 10);
    stage.lineStyle(3, 0x39c5bb, 0.8);
    stage.strokeRoundedRect(400, stageBase - 40, 640, 80, 12);

    [480, 640, 800, 960].forEach((x, i) => {
      const light = scene.add.circle(x, 180, 28, 0x39c5bb, 0.25).setDepth(50);
      scene.tweens.add({
        targets: light,
        alpha: { from: 0.15, to: 0.45 },
        scale: { from: 0.9, to: 1.2 },
        duration: 900 + i * 120,
        yoyo: true,
        repeat: -1
      });
    });

    scene.add
      .text(720, 100, "DIGITAL STAGE", {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "28px",
        fontStyle: "bold",
        color: "#39c5bb",
        stroke: "#0b0b12",
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setDepth(200);

    const screen = scene.add.graphics().setDepth(120);
    screen.fillStyle(0x0b0b12, 1);
    screen.fillRoundedRect(520, 160, 400, 160, 10);
    screen.lineStyle(3, 0x39c5bb, 0.7);
    screen.strokeRoundedRect(520, 160, 400, 160, 10);
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        screen.fillStyle(0x39c5bb, 0.15 + ((row + col) % 3) * 0.1);
        screen.fillRect(540 + col * 46, 180 + row * 32, 36, 22);
      }
    }

    kit.crate(scene, ctx, 180, 600, 80, 40, 0x3a3a50);
    kit.crate(scene, ctx, 1200, 600, 80, 40, 0x3a3a50);
  },

  wire(ctx) {
    const { scene, sm, hud } = ctx;
    const solved = sm.save.puzzleStates.mikuPuzzleSolved || sm.save.mikuMarkerUnlocked;
    const collected = sm.hasCollected("hatsune_miku_marker");

    if (!solved) {
      const dialogue = new Interactable(scene, {
        id: "miku_pre_dialogue",
        x: 720,
        y: 400,
        radius: 120,
        prompt: "♪ Você consegue ouvir a música?",
        action: () => {
          hud.toast("♪ Você consegue ouvir a música?", { icon: "🎤", duration: 2400 });
        }
      });
      ctx.addUpdatable(dialogue);

      const puzzle = new MikuRhythmPuzzle(scene, {
        saveManager: sm,
        hud,
        onSolved: () => {
          const marker = ctx.getMarker("hatsune_miku_marker");
          marker?.reveal?.();
          hud.toast("Agora pode me coletar!", { icon: "🎤", duration: 2600 });
        }
      });
      ctx.addUpdatable(puzzle);
    } else if (!collected) {
      const marker = ctx.getMarker("hatsune_miku_marker");
      marker?.reveal?.();
      scene.add
        .text(720, 380, "♪ Perfeito! Você acertou o ritmo!", {
          fontFamily: '"Comic Sans MS", sans-serif',
          fontSize: "16px",
          color: "#7ee8df",
          backgroundColor: "#1a1a28aa",
          padding: { x: 8, y: 4 }
        })
        .setOrigin(0.5)
        .setDepth(300);
    } else {
      scene.add
        .circle(720, 400, 40, 0x39c5bb, 0.15)
        .setDepth(200)
        .setStrokeStyle(2, 0x39c5bb, 0.4);
      scene.add
        .text(720, 400, "♪", {
          fontFamily: "sans-serif",
          fontSize: "32px",
          color: "#39c5bb"
        })
        .setOrigin(0.5)
        .setDepth(201);
    }

    scene.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => {
        if (Math.random() > 0.5) return;
        const note = scene.add
          .text(600 + Math.random() * 240, 360, Math.random() > 0.5 ? "♪" : "♫", {
            fontFamily: "sans-serif",
            fontSize: "18px",
            color: "#39c5bb"
          })
          .setAlpha(0.7)
          .setDepth(250);
        scene.tweens.add({
          targets: note,
          y: note.y - 60,
          alpha: 0,
          duration: 1400,
          onComplete: () => note.destroy()
        });
      }
    });
  }
};
