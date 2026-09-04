import Phaser from "../phaser-global.js";
import { generateAllTextures, markerTextureKey } from "../assets/textures.js";
import { VIEW, PLAYER_CHARACTERS } from "../config/game-config.js";
import { METER_ROWS } from "../config/difficulty-metadata.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    Object.values(PLAYER_CHARACTERS).forEach((def) => {
      this.load.image(def.textureKey, def.path);
    });
    this.load.on("loaderror", (file) => {
      console.error(`[Boot] Falha ao carregar sprite do player: ${file?.key} → ${file?.url}`);
    });
  }

  create() {
    Object.values(PLAYER_CHARACTERS).forEach((def) => {
      if (!this.textures.exists(def.textureKey)) {
        console.error(`[Boot] Textura ausente após load: ${def.textureKey} (${def.path})`);
      }
    });
    generateAllTextures(this);

    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(0xbfe8f7, 1);
    g.fillRect(0, 0, VIEW.width, VIEW.height);
    g.fillStyle(0xdff3c8, 1);
    g.fillRect(0, 470, VIEW.width, VIEW.height - 470);
    g.fillStyle(0x9ec86f, 1);
    g.fillRect(0, 620, VIEW.width, VIEW.height - 620);
    g.lineStyle(3, 0x6d9948, 0.7);
    g.lineBetween(0, 620, VIEW.width, 620);

    // sol e nuvens
    this.add.circle(1270, 120, 46, 0xffe08a, 0.9);
    this.add.circle(200, 150, 30, 0xffffff, 0.85);
    this.add.circle(240, 140, 38, 0xffffff, 0.85);
    this.add.circle(285, 152, 28, 0xffffff, 0.85);
    this.add.circle(800, 100, 26, 0xffffff, 0.8);
    this.add.circle(835, 92, 34, 0xffffff, 0.8);

    // título desenhado no canvas (a tela DOM de menu é transparente)
    this.add
      .text(720, 190, "Find the Markers", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "72px",
        fontStyle: "bold",
        color: "#e8a13c",
        stroke: "#33333d",
        strokeThickness: 9
      })
      .setOrigin(0.5);
    this.add
      .text(720, 268, "(Reuter's Mix)", {
        fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
        fontSize: "34px",
        fontStyle: "italic",
        color: "#33333d"
      })
      .setOrigin(0.5);

    // markers pulando na grama
    const difficulties = ["Effortless", "Easy", "Medium", "Hard", "Insane"];
    difficulties.forEach((difficulty, index) => {
      const key = markerTextureKey(difficulty, "classic");
      const marker = this.add.image(280 + index * 190, 700, key).setScale(1.2);
      this.tweens.add({
        targets: marker,
        y: 640,
        duration: 620,
        delay: index * 130,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1
      });
      // sombra
      const shadow = this.add.ellipse(280 + index * 190, 726, 54, 12, 0x33333d, 0.22);
      this.tweens.add({
        targets: shadow,
        scaleX: 0.7,
        alpha: 0.12,
        duration: 620,
        delay: index * 130,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1
      });
    });

    // faixa de dificuldades (referência do medidor)
    this.add
      .text(720, 780, METER_ROWS.join("  ·  "), {
        fontFamily: '"Comic Sans MS", sans-serif',
        fontSize: "15px",
        color: "#33333d"
      })
      .setOrigin(0.5)
      .setAlpha(0.65);

    window.dispatchEvent(new CustomEvent("ftm:booted"));
  }
}
