"use strict";

(() => {
  const DATA = window.FIND_THE_MARKERS_DATA;

  const GAME_CONFIG = Object.freeze({
    playerSpeed: 235,
    interactionDistance: 140,
    markerCount: 5,
    eggCount: 5,
    markerCollectRadius: 42,
    eggCollectRadius: 38,
    portalRadius: 62,
    cameraLerp: 0.11,
    transitionDuration: 260,
    debugCollisions: false
  });

  const ASSET_MANIFEST = Object.freeze([
    { key: "player", file: "player.png", placeholder: "player" },
    { key: "house", file: "house.png", placeholder: "house" },
    { key: "fruit_stand", file: "fruit_stand.png", placeholder: "fruit_stand" },
    { key: "tree", file: "tree.png", placeholder: "tree" },
    { key: "egg", file: "egg.png", placeholder: "egg" },
    { key: "marker_red", file: "marker_red.png", placeholder: "marker_red" },
    { key: "marker_blue", file: "marker_blue.png", placeholder: "marker_blue" },
    { key: "npc", file: "npc.png", placeholder: "npc" },
    { key: "arrow_down", file: "arrow_down.png", placeholder: "arrow_down" },
    { key: "arrow_up", file: "arrow_up.png", placeholder: "arrow_up" },
    { key: "store", file: "store.png", placeholder: "store" }
  ]);

  const OBJECT_ASSETS = Object.freeze({
    house: "house",
    fruit_stand: "fruit_stand",
    tree: "tree",
    store: "store"
  });

  let game;
  let ui;

  class SessionState {
    constructor() {
      this.playerName = "Explorer";
      this.difficulty = "medium";
      this.reset();
    }

    reset(options = {}) {
      this.playerName = options.playerName || this.playerName || "Explorer";
      this.difficulty = options.difficulty || this.difficulty || "medium";
      this.currentLevel = options.levelId || "street";
      this.collectedMarkers = new Set();
      this.collectedEggs = new Set();
      this.completed = false;
    }

    snapshot() {
      return {
        playerName: this.playerName,
        difficulty: this.difficulty,
        currentLevel: this.currentLevel,
        markers: Array.from(this.collectedMarkers),
        eggs: Array.from(this.collectedEggs),
        completed: this.completed
      };
    }
  }

  class LevelManager {
    static get(levelId) {
      return DATA && DATA.LEVELS ? DATA.LEVELS[levelId] : null;
    }

    static exists(levelId) {
      return Boolean(LevelManager.get(levelId));
    }

    static validateTransition(fromLevel, portal) {
      if (!portal || !LevelManager.exists(portal.target)) return false;
      const expected = {
        street: { down: "house" },
        house: { up: "street", down: "forest" },
        forest: { up: "house" }
      };
      return expected[fromLevel] && expected[fromLevel][portal.direction] === portal.target;
    }
  }

  class DifficultyManager {
    static get(difficultyId) {
      return DATA.DIFFICULTIES[difficultyId] || DATA.DIFFICULTIES.medium;
    }

    static exists(difficultyId) {
      return Boolean(DATA.DIFFICULTIES[difficultyId]);
    }
  }

  // Estrutura pronta para receber arquivos de áudio no futuro.
  class AudioManager {
    static playCollect() {}
    static playPortal() {}
    static playNpc() {}
    static playButton() {}
  }

  class AssetManager {
    static reportedMissing = new Set();

    static preload(scene) {
      scene.load.setPath("assets/");
      scene.load.on("loaderror", (file) => {
        const definition = ASSET_MANIFEST.find((asset) => asset.key === file.key);
        if (definition) AssetManager.reportMissing(definition);
      });

      ASSET_MANIFEST.forEach((asset) => {
        scene.load.image(asset.key, asset.file);
      });
    }

    static ensureFallbacks(scene) {
      ASSET_MANIFEST.forEach((asset) => {
        if (scene.textures.exists(asset.key)) return;
        AssetManager.reportMissing(asset);
        AssetManager.createPlaceholder(scene, asset.key, asset.placeholder);
      });
    }

    static reportMissing(asset) {
      if (AssetManager.reportedMissing.has(asset.key)) return;
      AssetManager.reportedMissing.add(asset.key);
      console.warn(`[FindTheMarkers] Asset não encontrado: ${asset.file}`);
      console.warn("[FindTheMarkers] Usando placeholder.");
    }

    static createPlaceholder(scene, textureKey, type) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      let width = 96;
      let height = 96;

      graphics.clear();

      if (type === "player") {
        width = 64;
        height = 82;
        graphics.fillStyle(0x11212d, 1);
        graphics.fillCircle(32, 28, 22);
        graphics.fillRoundedRect(14, 38, 36, 36, 12);
        graphics.lineStyle(4, 0x54b7ff, 1);
        graphics.strokeCircle(32, 28, 21);
        graphics.fillStyle(0x54b7ff, 1);
        graphics.fillTriangle(32, 8, 24, 22, 40, 22);
        graphics.fillCircle(24, 29, 3);
        graphics.fillCircle(40, 29, 3);
      } else if (type === "house") {
        width = 220;
        height = 155;
        graphics.fillStyle(0xede1c0, 1);
        graphics.fillRoundedRect(20, 58, 180, 88, 8);
        graphics.fillStyle(0xb85d58, 1);
        graphics.fillTriangle(8, 64, 110, 8, 212, 64);
        graphics.fillStyle(0x714936, 1);
        graphics.fillRoundedRect(92, 91, 38, 55, 5);
        graphics.fillStyle(0x54b7ff, 0.72);
        graphics.fillRect(42, 86, 35, 29);
        graphics.fillRect(146, 86, 35, 29);
      } else if (type === "fruit_stand") {
        width = 190;
        height = 130;
        graphics.fillStyle(0x6d4732, 1);
        graphics.fillRect(22, 54, 12, 69);
        graphics.fillRect(156, 54, 12, 69);
        graphics.fillRect(16, 88, 158, 35);
        graphics.fillStyle(0xf4c95d, 1);
        graphics.fillRect(8, 31, 174, 29);
        graphics.fillStyle(0xff5d5d, 1);
        for (let x = 8; x < 182; x += 44) graphics.fillRect(x, 31, 22, 29);
        graphics.fillStyle(0x79d79c, 1);
        graphics.fillCircle(54, 91, 11);
        graphics.fillStyle(0xff8f54, 1);
        graphics.fillCircle(89, 93, 11);
        graphics.fillStyle(0xe5de63, 1);
        graphics.fillCircle(124, 91, 11);
      } else if (type === "tree") {
        width = 126;
        height = 170;
        graphics.fillStyle(0x694931, 1);
        graphics.fillRoundedRect(51, 98, 24, 66, 8);
        graphics.fillStyle(0x315b42, 1);
        graphics.fillCircle(63, 60, 49);
        graphics.fillStyle(0x4e8053, 1);
        graphics.fillCircle(40, 63, 30);
        graphics.fillCircle(84, 55, 33);
        graphics.fillStyle(0xf4c95d, 1);
        graphics.fillCircle(44, 52, 5);
        graphics.fillCircle(78, 67, 5);
      } else if (type === "egg") {
        width = 48;
        height = 62;
        graphics.fillStyle(0x303947, 0.35);
        graphics.fillEllipse(25, 56, 35, 9);
        graphics.fillStyle(0xfff8df, 1);
        graphics.fillEllipse(24, 31, 37, 52);
        graphics.lineStyle(3, 0xf4c95d, 1);
        graphics.strokeEllipse(24, 31, 37, 52);
      } else if (type === "marker_red" || type === "marker_blue") {
        width = 48;
        height = 82;
        const color = type === "marker_red" ? 0xff5d5d : 0x54b7ff;
        graphics.fillStyle(0x101821, 1);
        graphics.fillRoundedRect(5, 12, 38, 64, 11);
        graphics.lineStyle(4, color, 1);
        graphics.strokeRoundedRect(5, 12, 38, 64, 11);
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(16, 2, 16, 15, 4);
        graphics.fillCircle(24, 55, 8);
      } else if (type === "npc") {
        width = 62;
        height = 82;
        graphics.fillStyle(0x182431, 1);
        graphics.fillCircle(31, 25, 20);
        graphics.fillRoundedRect(12, 42, 38, 34, 11);
        graphics.lineStyle(4, 0xa98cff, 1);
        graphics.strokeCircle(31, 25, 19);
        graphics.fillStyle(0xf5f1e8, 1);
        graphics.fillCircle(24, 25, 3);
        graphics.fillCircle(38, 25, 3);
      } else if (type === "arrow_down" || type === "arrow_up") {
        width = 118;
        height = 118;
        const down = type === "arrow_down";
        graphics.fillStyle(down ? 0x54b7ff : 0xf4c95d, 0.94);
        if (down) {
          graphics.fillRoundedRect(47, 8, 24, 61, 8);
          graphics.fillTriangle(15, 58, 103, 58, 59, 108);
        } else {
          graphics.fillRoundedRect(47, 49, 24, 61, 8);
          graphics.fillTriangle(15, 60, 103, 60, 59, 10);
        }
      } else if (type === "store") {
        width = 250;
        height = 175;
        graphics.fillStyle(0x162633, 1);
        graphics.fillRoundedRect(14, 49, 222, 117, 10);
        graphics.fillStyle(0x54b7ff, 1);
        graphics.fillRect(6, 31, 238, 34);
        graphics.fillStyle(0xff5d5d, 1);
        for (let x = 6; x < 244; x += 48) graphics.fillRect(x, 31, 24, 34);
        graphics.fillStyle(0xf5f1e8, 1);
        graphics.fillRoundedRect(94, 92, 62, 74, 5);
        graphics.fillStyle(0x0d151d, 1);
        graphics.fillRect(103, 101, 44, 65);
        graphics.fillStyle(0xf4c95d, 1);
        graphics.fillCircle(138, 134, 4);
      }

      graphics.generateTexture(textureKey, width, height);
      graphics.destroy();
    }

    static fit(gameObject, maxWidth, maxHeight) {
      const sourceWidth = Math.max(1, gameObject.width || maxWidth || 1);
      const sourceHeight = Math.max(1, gameObject.height || maxHeight || 1);
      const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
      gameObject.setScale(scale);
      return gameObject;
    }

    static addImage(scene, textureKey, x, y, maxWidth, maxHeight, depth = y) {
      const image = scene.add.image(x, y, textureKey).setDepth(depth);
      return AssetManager.fit(image, maxWidth, maxHeight);
    }
  }

  class UIManager {
    constructor() {
      this.screens = Array.from(document.querySelectorAll(".screen"));
      this.gameUi = document.querySelector("#game-ui");
      this.feedback = document.querySelector("#feedback-message");
      this.interactionPrompt = document.querySelector("#interaction-prompt");
      this.shopModal = document.querySelector("#shop-modal");
      this.victoryModal = document.querySelector("#victory-modal");
      this.feedbackTimer = null;
      this.interactionAction = null;
      this.selectedDifficulty = "medium";

      this.interactionPrompt.addEventListener("click", () => {
        if (typeof this.interactionAction === "function") this.interactionAction();
      });

      document.querySelectorAll("[data-close-shop]").forEach((button) => {
        button.addEventListener("click", () => this.closeShop());
      });
    }

    showScreen(screenId) {
      this.screens.forEach((screen) => {
        const active = screen.id === screenId;
        screen.classList.toggle("is-active", active);
        screen.setAttribute("aria-hidden", String(!active));
      });
    }

    finishLoading() {
      this.showMenu();
    }

    showMenu() {
      this.gameUi.classList.remove("is-active");
      this.closeShop();
      this.hideVictory();
      this.hideInteraction();
      this.showScreen("menu-screen");
    }

    showSetup() {
      this.showScreen("setup-screen");
      window.setTimeout(() => document.querySelector("#creator-name").focus(), 50);
    }

    showCredits() {
      this.showScreen("credits-screen");
    }

    showGameplay() {
      this.showScreen("");
      this.gameUi.classList.add("is-active");
      this.closeShop();
      this.hideVictory();
    }

    fatal(message) {
      document.querySelector("#fatal-error-message").textContent = message;
      this.showScreen("fatal-error");
    }

    setDifficulty(difficultyId) {
      if (!DifficultyManager.exists(difficultyId)) return;
      this.selectedDifficulty = difficultyId;
      document.querySelectorAll("[data-difficulty]").forEach((button) => {
        const selected = button.dataset.difficulty === difficultyId;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    }

    bindDifficulty(handler) {
      document.querySelectorAll("[data-difficulty]").forEach((button) => {
        button.addEventListener("click", () => {
          this.setDifficulty(button.dataset.difficulty);
          handler(button.dataset.difficulty);
        });
      });
    }

    updateHud(session, levelName) {
      document.querySelector("#markers-count").textContent = `${session.collectedMarkers.size}/${DATA.TOTAL_MARKERS}`;
      document.querySelector("#eggs-count").textContent = `${session.collectedEggs.size}/${DATA.TOTAL_EGGS}`;
      document.querySelector("#player-label").textContent = session.playerName;
      document.querySelector("#level-name").textContent = levelName;
    }

    showFeedback(message, duration = 2100) {
      if (!message) return;
      this.feedback.textContent = message;
      this.feedback.classList.add("is-visible");
      window.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = window.setTimeout(() => {
        this.feedback.classList.remove("is-visible");
      }, duration);
    }

    showInteraction(text, action) {
      this.interactionPrompt.querySelector("span").textContent = text;
      this.interactionAction = action;
      this.interactionPrompt.classList.add("is-visible");
    }

    hideInteraction() {
      this.interactionPrompt.classList.remove("is-visible");
      this.interactionAction = null;
    }

    openShop() {
      this.hideInteraction();
      this.shopModal.classList.add("is-active");
      this.shopModal.setAttribute("aria-hidden", "false");
      this.shopModal.querySelector("[data-close-shop]").focus();
    }

    closeShop() {
      this.shopModal.classList.remove("is-active");
      this.shopModal.setAttribute("aria-hidden", "true");
    }

    showVictory(playerName) {
      document.querySelector("#winner-name").textContent = playerName;
      this.victoryModal.classList.add("is-active");
      this.victoryModal.setAttribute("aria-hidden", "false");
      document.querySelector("#play-again-button").focus();
    }

    hideVictory() {
      this.victoryModal.classList.remove("is-active");
      this.victoryModal.setAttribute("aria-hidden", "true");
    }

    isModalOpen() {
      return this.shopModal.classList.contains("is-active") || this.victoryModal.classList.contains("is-active");
    }
  }

  class InputController {
    constructor(scene) {
      this.scene = scene;
      this.virtual = { up: false, down: false, left: false, right: false };
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keys = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        interact: Phaser.Input.Keyboard.KeyCodes.E
      });
      this.mobileHandlers = [];
      this.releaseAll = () => {
        Object.keys(this.virtual).forEach((direction) => { this.virtual[direction] = false; });
        document.querySelectorAll("#mobile-controls button").forEach((button) => button.classList.remove("is-pressed"));
      };

      document.querySelectorAll("#mobile-controls [data-direction]").forEach((button) => {
        const direction = button.dataset.direction;
        const press = (event) => {
          event.preventDefault();
          this.virtual[direction] = true;
          button.classList.add("is-pressed");
        };
        const release = (event) => {
          event.preventDefault();
          this.virtual[direction] = false;
          button.classList.remove("is-pressed");
        };
        button.addEventListener("pointerdown", press);
        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("pointerleave", release);
        this.mobileHandlers.push({ button, press, release });
      });

      window.addEventListener("pointerup", this.releaseAll);
      window.addEventListener("blur", this.releaseAll);
      scene.events.once("shutdown", () => this.destroy());
    }

    vector() {
      let x = 0;
      let y = 0;
      if (this.cursors.left.isDown || this.keys.left.isDown || this.virtual.left) x -= 1;
      if (this.cursors.right.isDown || this.keys.right.isDown || this.virtual.right) x += 1;
      if (this.cursors.up.isDown || this.keys.up.isDown || this.virtual.up) y -= 1;
      if (this.cursors.down.isDown || this.keys.down.isDown || this.virtual.down) y += 1;
      const vector = new Phaser.Math.Vector2(x, y);
      if (vector.lengthSq() > 1) vector.normalize();
      return vector;
    }

    consumeInteract() {
      return Phaser.Input.Keyboard.JustDown(this.keys.interact);
    }

    destroy() {
      this.mobileHandlers.forEach(({ button, press, release }) => {
        button.removeEventListener("pointerdown", press);
        button.removeEventListener("pointerup", release);
        button.removeEventListener("pointercancel", release);
        button.removeEventListener("pointerleave", release);
      });
      window.removeEventListener("pointerup", this.releaseAll);
      window.removeEventListener("blur", this.releaseAll);
      this.releaseAll();
    }
  }

  class PlayerController {
    constructor(scene, spawn, input, speed) {
      this.scene = scene;
      this.input = input;
      this.speed = speed;
      this.sprite = scene.physics.add.sprite(spawn.x, spawn.y, "player");
      AssetManager.fit(this.sprite, 62, 78);
      this.sprite.setCollideWorldBounds(true).setDepth(spawn.y + 10);
      this.sprite.body.setSize(this.sprite.width * 0.54, this.sprite.height * 0.58);
      this.sprite.body.setOffset(this.sprite.width * 0.23, this.sprite.height * 0.34);
    }

    setSpeed(speed) {
      this.speed = speed;
    }

    stop() {
      this.sprite.body.setVelocity(0, 0);
      this.sprite.setAngle(0);
    }

    update(time, blocked = false) {
      if (blocked) {
        this.stop();
        return;
      }

      const direction = this.input.vector();
      this.sprite.body.setVelocity(direction.x * this.speed, direction.y * this.speed);
      if (direction.x < 0) this.sprite.setFlipX(true);
      if (direction.x > 0) this.sprite.setFlipX(false);
      this.sprite.setAngle(direction.lengthSq() > 0 ? Math.sin(time / 85) * 1.2 : 0);
      this.sprite.setDepth(this.sprite.y + 10);
    }
  }

  class BootScene extends Phaser.Scene {
    constructor() {
      super("BootScene");
    }

    preload() {
      AssetManager.preload(this);
    }

    create() {
      AssetManager.ensureFallbacks(this);
      this.scene.start("MenuScene");
      ui.finishLoading();
      window.dispatchEvent(new CustomEvent("findthemarkers:ready"));
    }
  }

  class MenuScene extends Phaser.Scene {
    constructor() {
      super("MenuScene");
    }

    create() {
      this.backdrop = this.add.graphics();
      this.drawBackdrop();
      this.scale.on("resize", this.drawBackdrop, this);
      this.events.once("shutdown", () => this.scale.off("resize", this.drawBackdrop, this));
    }

    drawBackdrop() {
      const width = this.scale.width;
      const height = this.scale.height;
      this.backdrop.clear();
      this.backdrop.fillStyle(0x0b1118, 1);
      this.backdrop.fillRect(0, 0, width, height);
      this.backdrop.lineStyle(1, 0x253443, 0.34);
      for (let x = 0; x < width; x += 64) this.backdrop.lineBetween(x, 0, x, height);
      for (let y = 0; y < height; y += 64) this.backdrop.lineBetween(0, y, width, y);
      this.backdrop.fillStyle(0x54b7ff, 0.07);
      this.backdrop.fillCircle(width * 0.78, height * 0.28, Math.max(width, height) * 0.28);
    }
  }

  class GameScene extends Phaser.Scene {
    constructor() {
      super("GameScene");
    }

    init(data = {}) {
      this.levelId = LevelManager.exists(data.levelId) ? data.levelId : "street";
      this.spawnOverride = data.spawn || null;
      this.arrivalMessage = data.arrivalMessage || null;
      this.transitioning = false;
      this.collectibles = [];
      this.markers = [];
      this.npcs = [];
      this.portalRecords = [];
      this.solidBodies = [];
      this.storeRecord = null;
      this.nearStore = false;
    }

    create() {
      this.level = LevelManager.get(this.levelId);
      session.currentLevel = this.levelId;
      this.physics.world.setBounds(0, 0, this.level.width, this.level.height);
      this.cameras.main.setBounds(0, 0, this.level.width, this.level.height);
      this.renderLevelBackground();
      this.createWorldObjects();

      this.inputController = new InputController(this);
      const spawn = this.spawnOverride || this.level.spawn;
      this.player = new PlayerController(
        this,
        spawn,
        this.inputController,
        DifficultyManager.get(session.difficulty).playerSpeed
      );

      this.solidBodies.forEach((body) => this.physics.add.collider(this.player.sprite, body));
      this.createCollectibles();
      this.createNpcs();
      this.createPortals();
      this.applyDifficulty(false);

      this.cameras.main.startFollow(
        this.player.sprite,
        true,
        GAME_CONFIG.cameraLerp,
        GAME_CONFIG.cameraLerp
      );
      this.cameras.main.fadeIn(GAME_CONFIG.transitionDuration, 7, 13, 19);

      ui.showGameplay();
      ui.updateHud(session, this.level.name);
      ui.showFeedback(this.arrivalMessage || `Entering: ${this.level.name}`);

      this.events.once("shutdown", () => {
        ui.hideInteraction();
        ui.closeShop();
      });
    }

    renderLevelBackground() {
      const graphics = this.add.graphics().setDepth(-10000);
      const { width, height, theme } = this.level;
      graphics.fillStyle(theme.ground, 1);
      graphics.fillRect(0, 0, width, height);

      if (this.levelId === "street") {
        graphics.fillStyle(0x91a96e, 1);
        graphics.fillRect(0, 0, width, 530);
        graphics.fillRect(0, 1080, width, height - 1080);
        graphics.fillStyle(theme.sidewalk, 1);
        graphics.fillRect(0, 505, width, 90);
        graphics.fillRect(0, 1020, width, 90);
        graphics.fillStyle(theme.road, 1);
        graphics.fillRect(0, 590, width, 430);
        graphics.fillStyle(0xf3dda0, 0.9);
        for (let x = 50; x < width; x += 150) graphics.fillRect(x, 798, 82, 9);
        graphics.lineStyle(4, 0xffffff, 0.22);
        graphics.lineBetween(0, 606, width, 606);
        graphics.lineBetween(0, 1003, width, 1003);
        this.add.text(75, 660, "STREET 03", {
          fontFamily: "ui-monospace, monospace",
          fontSize: "28px",
          fontStyle: "bold",
          color: "#f5f1e8aa"
        }).setDepth(-9000);
      } else if (this.levelId === "house") {
        graphics.fillStyle(0x8e6e53, 1);
        graphics.fillRect(45, 45, width - 90, height - 90);
        graphics.fillStyle(theme.ground, 1);
        graphics.fillRect(80, 80, width - 160, height - 160);
        graphics.lineStyle(2, 0x8e6448, 0.2);
        for (let x = 80; x < width - 80; x += 80) graphics.lineBetween(x, 80, x, height - 80);
        for (let y = 80; y < height - 80; y += 80) graphics.lineBetween(80, y, width - 80, y);
        graphics.fillStyle(0x412f2a, 1);
        graphics.fillRect(80, 80, width - 160, 32);
        graphics.fillRect(80, height - 112, width - 160, 32);
        graphics.fillRect(80, 80, 32, height - 160);
        graphics.fillRect(width - 112, 80, 32, height - 160);
        this.add.text(1100, 245, "INSIDE THE HOUSE", {
          fontFamily: "ui-monospace, monospace",
          fontSize: "24px",
          fontStyle: "bold",
          color: "#4c3b3588"
        }).setOrigin(0.5).setDepth(-9000);
      } else {
        graphics.lineStyle(170, theme.path, 0.9);
        graphics.beginPath();
        graphics.moveTo(120, 1640);
        graphics.lineTo(580, 1320);
        graphics.lineTo(1030, 1010);
        graphics.lineTo(1490, 790);
        graphics.lineTo(1980, 680);
        graphics.lineTo(2460, 420);
        graphics.strokePath();
        graphics.lineStyle(3, 0x315b42, 0.35);
        for (let index = 0; index < 90; index += 1) {
          const x = 35 + ((index * 191) % (width - 70));
          const y = 35 + ((index * 137) % (height - 70));
          graphics.lineBetween(x, y, x + ((index % 3) - 1) * 9, y - 17);
        }
        graphics.fillStyle(0xd4df78, 0.78);
        for (let index = 0; index < 28; index += 1) {
          const x = 55 + ((index * 307) % (width - 110));
          const y = 80 + ((index * 173) % (height - 160));
          graphics.fillCircle(x, y, 4);
        }
        this.add.text(85, 95, "FOREST · LAST AREA", {
          fontFamily: "ui-monospace, monospace",
          fontSize: "25px",
          fontStyle: "bold",
          color: "#173b2aaa"
        }).setDepth(-9000);
      }
    }

    createWorldObjects() {
      this.level.objects.forEach((definition) => {
        const visual = definition.visual || { width: 100, height: 100 };
        let object;

        if (OBJECT_ASSETS[definition.type]) {
          object = AssetManager.addImage(
            this,
            OBJECT_ASSETS[definition.type],
            definition.x,
            definition.y,
            visual.width,
            visual.height,
            definition.y
          );
        } else {
          object = this.createShapeObject(definition);
        }

        if (definition.type === "store") {
          this.storeRecord = { definition, visual: object };
          this.add.text(definition.x, definition.y - (visual.height / 2) - 18, "GATSSINO", {
            fontFamily: "ui-monospace, monospace",
            fontSize: "18px",
            fontStyle: "bold",
            color: "#f5f1e8",
            backgroundColor: "#101821cc",
            padding: { x: 9, y: 5 }
          }).setOrigin(0.5).setDepth(definition.y + 1);
        }

        if (definition.collider && definition.solid !== false) {
          this.createSolidCollider(definition);
        }
      });
    }

    createShapeObject(definition) {
      const visual = definition.visual || { width: 100, height: 100 };
      let object;
      if (definition.type === "wall") {
        object = this.add.rectangle(definition.x, definition.y, visual.width, visual.height, 0x4c3b35, 1);
        object.setStrokeStyle(4, 0x2d2220, 0.65);
      } else if (definition.type === "table") {
        object = this.add.rectangle(definition.x, definition.y, visual.width, visual.height, 0x815d42, 1);
        object.setStrokeStyle(7, 0x4d3728, 0.75).setRounded(16);
      } else if (definition.type === "painting") {
        object = this.add.rectangle(definition.x, definition.y, visual.width, visual.height, 0xd9b45d, 1);
        object.setStrokeStyle(9, 0x5d412d, 1);
        this.add.circle(definition.x, definition.y, Math.min(visual.width, visual.height) * 0.24, 0x54b7ff, 0.72)
          .setDepth(definition.y + 1);
      } else if (definition.type === "rug") {
        object = this.add.rectangle(definition.x, definition.y, visual.width, visual.height, 0xb85d58, 0.66);
        object.setStrokeStyle(6, 0xf4c95d, 0.4).setRounded(34);
      } else {
        object = this.add.rectangle(definition.x, definition.y, visual.width, visual.height, 0x586471, 1);
      }
      return object.setDepth(definition.y);
    }

    createSolidCollider(definition) {
      const collider = definition.collider;
      const x = definition.x + (collider.offsetX || 0);
      const y = definition.y + (collider.offsetY || 0);
      const zone = this.add.zone(x, y, collider.width, collider.height);
      this.physics.add.existing(zone, true);
      this.solidBodies.push(zone);

      if (GAME_CONFIG.debugCollisions) {
        this.add.rectangle(x, y, collider.width, collider.height, 0xff3155, 0.2).setDepth(999999);
      }
    }

    createCollectibles() {
      this.level.eggs.forEach((definition) => {
        if (!session.collectedEggs.has(definition.id)) this.createCollectible("egg", definition);
      });
      this.level.markers.forEach((definition) => {
        if (!session.collectedMarkers.has(definition.id)) this.createCollectible("marker", definition);
      });
    }

    createCollectible(kind, definition) {
      const isMarker = kind === "marker";
      const textureKey = isMarker ? `marker_${definition.type || "red"}` : "egg";
      const sprite = AssetManager.addImage(
        this,
        textureKey,
        definition.x,
        definition.y,
        isMarker ? 48 : 50,
        isMarker ? 82 : 64,
        definition.y + 2
      );
      const radius = isMarker ? GAME_CONFIG.markerCollectRadius : GAME_CONFIG.eggCollectRadius;
      const zone = this.add.zone(definition.x, definition.y, radius * 2, radius * 2);
      this.physics.add.existing(zone, true);

      const record = {
        kind,
        definition,
        sprite,
        zone,
        collected: false,
        baseScaleX: sprite.scaleX,
        baseScaleY: sprite.scaleY
      };
      this.collectibles.push(record);
      if (isMarker) this.markers.push(record);
      this.physics.add.overlap(this.player.sprite, zone, () => this.collect(record));

      this.tweens.add({
        targets: sprite,
        y: definition.y - 6,
        duration: 900 + ((definition.x + definition.y) % 350),
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }

    collect(record) {
      if (record.collected || this.transitioning || session.completed) return;
      record.collected = true;
      record.zone.body.enable = false;

      if (record.kind === "marker") {
        session.collectedMarkers.add(record.definition.id);
        ui.showFeedback("Marker found!");
      } else {
        session.collectedEggs.add(record.definition.id);
        ui.showFeedback("Egg collected!");
      }

      AudioManager.playCollect(record.kind);
      ui.updateHud(session, this.level.name);
      this.tweens.add({
        targets: record.sprite,
        alpha: 0,
        scaleX: record.baseScaleX * 1.65,
        scaleY: record.baseScaleY * 1.65,
        angle: 12,
        duration: 260,
        ease: "Back.in",
        onComplete: () => record.sprite.destroy()
      });
      this.time.delayedCall(0, () => record.zone.destroy());
      this.time.delayedCall(330, () => this.checkVictory());
    }

    createNpcs() {
      this.level.npcs.forEach((definition, index) => {
        const sprite = AssetManager.addImage(this, "npc", definition.x, definition.y, 66, 86, definition.y + 1);
        const bubble = this.createDialogueBubble(definition.dialogue);
        const record = { definition, sprite, bubble };
        this.npcs.push(record);

        this.tweens.add({
          targets: sprite,
          y: definition.y - 5,
          duration: 1100 + (index * 130),
          ease: "Sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });
    }

    createDialogueBubble(dialogue) {
      const text = this.add.text(0, 0, dialogue, {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#101821",
        align: "center",
        wordWrap: { width: 250, useAdvancedWrap: true },
        lineSpacing: 4
      }).setOrigin(0.5);
      const width = 286;
      const height = Math.max(74, text.height + 32);
      const background = this.add.graphics();
      background.fillStyle(0xf8f4e9, 0.98);
      background.fillRoundedRect(-width / 2, -height / 2, width, height, 15);
      background.fillTriangle(-12, height / 2 - 2, 12, height / 2 - 2, 0, height / 2 + 15);
      background.lineStyle(2, 0x101821, 0.18);
      background.strokeRoundedRect(-width / 2, -height / 2, width, height, 15);
      const container = this.add.container(0, 0, [background, text]).setDepth(999999).setVisible(false);
      return { container, width, height };
    }

    createPortals() {
      this.level.portals.forEach((definition) => {
        if (!LevelManager.validateTransition(this.levelId, definition)) {
          console.error(`[FindTheMarkers] Portal inválido ignorado: ${definition.id}`);
          return;
        }

        const textureKey = definition.direction === "down" ? "arrow_down" : "arrow_up";
        const sprite = AssetManager.addImage(this, textureKey, definition.x, definition.y, 122, 122, definition.y - 2);
        sprite.setAlpha(0.84);
        const zone = this.add.zone(
          definition.x,
          definition.y,
          GAME_CONFIG.portalRadius * 2,
          GAME_CONFIG.portalRadius * 2
        );
        this.physics.add.existing(zone, true);
        this.physics.add.overlap(this.player.sprite, zone, () => this.enterPortal(definition));
        this.portalRecords.push({ definition, sprite, zone });

        const baseScaleX = sprite.scaleX;
        const baseScaleY = sprite.scaleY;
        this.tweens.add({
          targets: sprite,
          scaleX: baseScaleX * 1.08,
          scaleY: baseScaleY * 1.08,
          alpha: 1,
          duration: 720,
          ease: "Sine.inOut",
          yoyo: true,
          repeat: -1
        });

        this.add.text(
          definition.x,
          definition.y + 84,
          definition.direction === "down" ? "NEXT AREA" : "PREVIOUS AREA",
          {
            fontFamily: "ui-monospace, monospace",
            fontSize: "13px",
            fontStyle: "bold",
            color: "#101821",
            backgroundColor: "#f5f1e8cc",
            padding: { x: 8, y: 4 }
          }
        ).setOrigin(0.5).setDepth(definition.y + 3);
      });
    }

    enterPortal(portal) {
      if (this.transitioning || session.completed) return;
      this.transitioning = true;
      this.player.stop();
      ui.hideInteraction();
      const targetLevel = LevelManager.get(portal.target);
      ui.showFeedback(`Entering: ${targetLevel.name}`, 1500);
      AudioManager.playPortal();
      this.cameras.main.fadeOut(GAME_CONFIG.transitionDuration, 7, 13, 19);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        session.currentLevel = portal.target;
        this.scene.restart({
          levelId: portal.target,
          spawn: portal.targetSpawn,
          arrivalMessage: `Entering: ${targetLevel.name}`
        });
      });
    }

    applyDifficulty(announce = true) {
      this.difficulty = DifficultyManager.get(session.difficulty);
      if (this.player) this.player.setSpeed(this.difficulty.playerSpeed);
      ui.setDifficulty(session.difficulty);
      if (announce) ui.showFeedback(`Difficulty: ${this.difficulty.label}`);
    }

    updateMarkerVisibility(time) {
      this.markers.forEach((marker) => {
        if (marker.collected || !marker.sprite.active) return;
        const distance = Phaser.Math.Distance.Between(
          this.player.sprite.x,
          this.player.sprite.y,
          marker.sprite.x,
          marker.sprite.y
        );
        const proximity = Phaser.Math.Clamp(
          1 - (distance / this.difficulty.markerRevealDistance),
          0,
          1
        );
        const targetAlpha = Phaser.Math.Linear(this.difficulty.markerBaseAlpha, 1, proximity);
        marker.sprite.alpha = Phaser.Math.Linear(marker.sprite.alpha, targetAlpha, 0.14);
        const pulse = 1 + (Math.sin(time / 150) * 0.035 * proximity);
        marker.sprite.setScale(marker.baseScaleX * pulse, marker.baseScaleY * pulse);
      });
    }

    updateNpcs() {
      const cameraView = this.cameras.main.worldView;
      this.npcs.forEach((npc) => {
        const distance = Phaser.Math.Distance.Between(
          this.player.sprite.x,
          this.player.sprite.y,
          npc.sprite.x,
          npc.sprite.y
        );
        const visible = distance <= this.difficulty.interactionDistance;
        npc.bubble.container.setVisible(visible);
        if (!visible) return;

        const minX = cameraView.left + (npc.bubble.width / 2) + 12;
        const maxX = cameraView.right - (npc.bubble.width / 2) - 12;
        const desiredY = npc.sprite.y - (npc.sprite.displayHeight / 2) - (npc.bubble.height / 2) - 24;
        npc.bubble.container.x = Phaser.Math.Clamp(npc.sprite.x, minX, Math.max(minX, maxX));
        npc.bubble.container.y = Math.max(cameraView.top + (npc.bubble.height / 2) + 12, desiredY);
      });
    }

    updateStoreInteraction() {
      if (!this.storeRecord || session.completed) return;
      const interaction = this.storeRecord.definition.interaction;
      const distance = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        interaction.x,
        interaction.y
      );
      const near = distance <= interaction.radius;

      if (
        near &&
        !ui.isModalOpen() &&
        (!this.nearStore || !ui.interactionPrompt.classList.contains("is-visible"))
      ) {
        ui.showInteraction("Gatssino · Pressione E para entrar", () => ui.openShop());
      } else if (!near && this.nearStore) {
        ui.hideInteraction();
      }
      this.nearStore = near;

      if (near && this.inputController.consumeInteract() && !ui.isModalOpen()) {
        ui.openShop();
      }
    }

    checkVictory() {
      if (session.completed) return;
      if (
        session.collectedMarkers.size === DATA.TOTAL_MARKERS &&
        session.collectedEggs.size === DATA.TOTAL_EGGS
      ) {
        session.completed = true;
        this.player.stop();
        this.physics.pause();
        ui.hideInteraction();
        ui.showVictory(session.playerName);
      }
    }

    update(time) {
      if (!this.player) return;
      const blocked = this.transitioning || session.completed || ui.isModalOpen();
      this.player.update(time, blocked);
      if (blocked) return;
      this.updateMarkerVisibility(time);
      this.updateNpcs();
      this.updateStoreInteraction();
    }
  }

  const session = new SessionState();

  function validateData() {
    if (!DATA) throw new Error("levels.js não foi carregado.");
    const levelIds = Object.keys(DATA.LEVELS);
    if (levelIds.join(",") !== "street,house,forest") {
      throw new Error("As fases obrigatórias street, house e forest não foram encontradas.");
    }
    if (DATA.TOTAL_MARKERS !== GAME_CONFIG.markerCount || DATA.TOTAL_EGGS !== GAME_CONFIG.eggCount) {
      throw new Error("O mapa precisa conter exatamente 5 Markers e 5 ovos.");
    }
  }

  function activeGameScene() {
    if (!game || !game.scene.isActive("GameScene")) return null;
    return game.scene.getScene("GameScene");
  }

  function startGame(options = {}) {
    const playerName = (options.playerName || "Explorer").trim().slice(0, 28) || "Explorer";
    const difficulty = DifficultyManager.exists(options.difficulty) ? options.difficulty : "medium";
    const levelId = LevelManager.exists(options.levelId) ? options.levelId : "street";
    session.reset({ playerName, difficulty, levelId });
    ui.setDifficulty(difficulty);
    ui.showGameplay();
    game.scene.stop("MenuScene");
    game.scene.start("GameScene", { levelId });
  }

  function returnToMenu() {
    const scene = activeGameScene();
    if (scene) scene.scene.stop();
    if (!game.scene.isActive("MenuScene")) game.scene.start("MenuScene");
    ui.showMenu();
  }

  function wireInterface() {
    document.querySelector("#play-button").addEventListener("click", () => {
      AudioManager.playButton();
      ui.showSetup();
    });
    document.querySelector("#credits-button").addEventListener("click", () => ui.showCredits());
    document.querySelectorAll("[data-back-to-menu]").forEach((button) => {
      button.addEventListener("click", () => ui.showMenu());
    });
    document.querySelector("#start-button").addEventListener("click", () => {
      const playerName = document.querySelector("#creator-name").value;
      startGame({ playerName, difficulty: ui.selectedDifficulty, levelId: "street" });
    });
    document.querySelector("#creator-name").addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      document.querySelector("#start-button").click();
    });
    document.querySelector("#menu-button").addEventListener("click", returnToMenu);
    document.querySelector("#victory-menu-button").addEventListener("click", returnToMenu);
    document.querySelector("#play-again-button").addEventListener("click", () => {
      startGame({
        playerName: session.playerName,
        difficulty: session.difficulty,
        levelId: "street"
      });
    });
    ui.bindDifficulty((difficultyId) => {
      session.difficulty = difficultyId;
      const scene = activeGameScene();
      if (scene) scene.applyDifficulty(true);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && ui.shopModal.classList.contains("is-active")) ui.closeShop();
    });
  }

  function initialize() {
    ui = new UIManager();
    wireInterface();

    if (!window.Phaser) {
      ui.fatal("Phaser 3 não foi carregado. Use um servidor HTTP e verifique sua conexão com a CDN.");
      return;
    }

    try {
      validateData();
    } catch (error) {
      console.error("[FindTheMarkers]", error);
      ui.fatal(error.message);
      return;
    }

    window.addEventListener("findthemarkers:ready", () => {
      const params = new URLSearchParams(window.location.search);
      const qaLevel = params.get("qa");
      const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (localHost && LevelManager.exists(qaLevel)) {
        window.setTimeout(() => startGame({ playerName: "QA Player", difficulty: "medium", levelId: qaLevel }), 30);
      }
    }, { once: true });

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-container",
      backgroundColor: "#0b1118",
      transparent: false,
      render: {
        antialias: true,
        roundPixels: false,
        powerPreference: "high-performance"
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: GAME_CONFIG.debugCollisions
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight
      },
      input: {
        activePointers: 4
      },
      scene: [BootScene, MenuScene, GameScene]
    });

    window.FindTheMarkers = Object.freeze({
      version: "1.0.0",
      getState: () => session.snapshot(),
      getLevelIds: () => [...DATA.LEVEL_ORDER],
      getAssetManifest: () => ASSET_MANIFEST.map((asset) => ({ ...asset })),
      getMissingAssets: () => Array.from(AssetManager.reportedMissing),
      getRuntime: () => {
        const scene = activeGameScene();
        if (!scene || !scene.player) return null;
        return {
          levelId: scene.levelId,
          playerX: scene.player.sprite.x,
          playerY: scene.player.sprite.y,
          playerSpeed: scene.player.speed,
          visibleDialogues: scene.npcs
            .filter((npc) => npc.bubble.container.visible)
            .map((npc) => npc.definition.dialogue),
          nearStore: scene.nearStore,
          transitioning: scene.transitioning
        };
      },
      qaTeleport: (x, y) => {
        const localHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
        const scene = activeGameScene();
        if (!localHost || !scene || !scene.player || !Number.isFinite(x) || !Number.isFinite(y)) return false;
        scene.player.sprite.body.reset(x, y);
        return true;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
