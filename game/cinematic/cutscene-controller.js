import { Sfx, createAmbience } from "../core/audio-manager.js";
import { state } from "../state.js";

const CANCELLED = Symbol("cutscene cancelled");

// One controller per RoomScene lifecycle. Phaser's clock/tweens keep rendering;
// only a small arrival descriptor crosses the existing scene.restart boundary.
export class CutsceneController {
  constructor(scene) {
    this.scene = scene;
    this.pending = new Set();
    this.overlays = new Set();
    this.running = false;
    this.done = false;
  }

  lockInput() {
    const s = this.scene;
    this.previous = { locked: Boolean(s.inputController.locked), body: s.player.body.enable, hud: Boolean(state.hud.cinematic) };
    this.running = true;
    s.inCutscene = true;
    s.transitioning = true;
    s.player.stop();
    s.player.body.enable = false;
    s.inputController.setLocked(true);
    s.cameras.main.stopFollow();
    state.hud.setCinematic(true);
  }

  // Every asynchronous step owns exactly one cancellation disposer.
  step(start) {
    if (this.done) return Promise.reject(CANCELLED);
    return new Promise((resolve, reject) => {
      let dispose = () => {};
      const cancel = () => { dispose(); this.pending.delete(cancel); reject(CANCELLED); };
      const complete = () => { this.pending.delete(cancel); resolve(); };
      this.pending.add(cancel);
      dispose = start(complete) || dispose;
    });
  }

  wait(ms) {
    return this.step((complete) => {
      const timer = this.scene.time.delayedCall(ms, complete);
      return () => timer.remove(false);
    });
  }

  tween(targets, props, duration, ease = "Sine.inOut") {
    return this.step((complete) => {
      const tween = this.scene.tweens.add({ targets, ...props, duration, ease, onComplete: complete });
      return () => tween.remove();
    });
  }

  moveCamera(x, y, zoom, duration) {
    const cam = this.scene.cameras.main;
    const pose = { x: cam.scrollX + cam.width / 2, y: cam.scrollY + cam.height / 2, zoom: cam.zoom };
    return this.tween(pose, { x, y, zoom, onUpdate: () => {
      cam.setZoom(pose.zoom);
      cam.centerOn(pose.x, pose.y);
    } }, duration);
  }

  fade(black, duration) {
    const cam = this.scene.cameras.main;
    return this.step((complete) => {
      const event = black ? "camerafadeoutcomplete" : "camerafadeincomplete";
      const handler = () => complete();
      cam.once(event, handler);
      if (black) cam.fadeOut(duration, 0, 0, 0, true);
      else cam.fadeIn(duration, 0, 0, 0, true);
      return () => { cam.off(event, handler); cam.fadeEffect.reset(); };
    });
  }

  overlay() {
    const g = this.scene.add.graphics().setScrollFactor(0).setDepth(1000000);
    this.overlays.add(g);
    return g;
  }

  // Fixed to the viewport using the CURRENT camera, including during zoom.
  screenSpace(g) {
    const cam = this.scene.cameras.main;
    g.setScale(1 / cam.zoom);
    g.setPosition(cam.width * (1 - 1 / cam.zoom) / 2, cam.height * (1 - 1 / cam.zoom) / 2);
  }

  async glitch(from, to, duration) {
    const g = this.overlay();
    const effect = { amount: from };
    await this.tween(effect, { amount: to, onUpdate: () => {
      this.screenSpace(g);
      g.clear();
      const a = effect.amount;
      const tick = Math.floor(this.scene.time.now / 65);
      g.fillStyle(0x060910, a * 0.86).fillRect(0, 0, 1440, 810);
      for (let i = 0; i < 32; i++) {
        const y = (i * 83 + tick * 37) % 810;
        const x = (i * 227 + tick * 113) % 1440;
        g.fillStyle(i % 3 ? 0x9ddac6 : 0xcc889d, a * (i % 3 ? 0.19 : 0.12));
        g.fillRect(x, y, 100 + (i * 53) % 390, 2 + (i % 5) * a * 12);
        g.fillStyle(0x000000, a * 0.5).fillRect(0, y + 3, 1440, 2);
      }
    } }, duration, "Linear");
    g.destroy();
    this.overlays.delete(g);
  }

  async painting(short) {
    const s = this.scene;
    const { frame, opening, shade } = s.secretPainting;
    s.player.sprite.setFlipX(s.player.x > 270);
    s.ambience?.setLevel(0, 0.25);
    if (!short) {
      await this.wait(250);
      await this.moveCamera(610, 345, 1.16, 850);
      Sfx.mechanism();
      await this.tween(frame, { x: 2 }, 110);
      await this.wait(240);
    }
    Sfx.mechanism(true);
    opening.setVisible(true);
    Sfx.slide();
    await Promise.all([
      this.tween(frame, { x: 155 }, short ? 250 : 950),
      this.tween(shade, { alpha: 0.22 }, short ? 250 : 950),
      (async () => {
        await this.wait(short ? 80 : 550);
        this.hintHum = createAmbience("archive");
        this.hintHum?.setLevel(0.5, 0.4);
      })()
    ]);
    // The black aperture grows outward with the push, then the camera fade
    // completes it. No giant zoom or stationary, unrelated black screen.
    await Promise.all([
      this.moveCamera(580, 315, 1.20, short ? 300 : 850),
      this.tween(opening, { scaleX: 14, scaleY: 8 }, short ? 300 : 850, "Cubic.in"),
      (async () => { await this.wait(short ? 40 : 350); await this.fade(true, short ? 260 : 500); })()
    ]);
    Sfx.thunk();
  }

  async digital(connection) {
    const s = this.scene;
    s.archiveTerminal?.setStatus(`LOADING ${connection.code}`);
    await this.wait(250);
    s.archiveTerminal?.setStatus("INITIALIZING...");
    s.archiveTerminal?.setCRT(true);
    Sfx.crt();
    await this.wait(650);
    s.archiveTerminal?.close(true);
    const flash = this.overlay();
    this.screenSpace(flash);
    flash.fillStyle(0xbcebdc, 0.22).fillRect(0, 0, 1440, 810);
    Sfx.glitch();
    await Promise.all([
      this.tween(flash, { alpha: 0 }, 300),
      this.moveCamera(720, 370, 1.12, 400)
    ]);
    flash.destroy(); this.overlays.delete(flash);
    s.ambience?.setLevel(0, 0.4);
    await Promise.all([this.glitch(0.08, 1, 400), (async () => { await this.wait(220); await this.fade(true, 180); })()]);
  }

  async depart(connection) {
    if (this.running || this.done) return false;
    this.lockInput();
    const short = state.saveManager.save.secretComputerRoomDiscovered;
    try {
      if (connection.cinematic === "painting") await this.painting(short);
      else if (connection.cinematic === "digital") await this.digital(connection);
      else if (connection.cinematic === "return") {
        Sfx.glitch();
        this.scene.ambience?.setLevel(0, 0.5);
        await this.glitch(0.02, 0.3, 300);
        await Promise.all([this.glitch(0.3, 1, 400), (async () => { await this.wait(220); await this.fade(true, 180); })()]);
      } else {
        this.scene.ambience?.setLevel(0, 0.3);
        await this.fade(true, 300);
        Sfx.mechanism(true);
      }
      await this.wait(connection.cinematic === "painting" ? 60 : 100);
      this.handoff = true;
      this.scene.loadArea(connection, { kind: connection.cinematic, code: connection.code, short });
      return true;
    } catch (error) {
      if (error !== CANCELLED) console.error("[Cutscene]", error);
      this.finishCutscene();
      return false;
    }
  }

  async arrive(data) {
    this.lockInput();
    this.previous.hud = false;
    const s = this.scene;
    const cam = s.cameras.main;
    cam.fadeOut(1, 0, 0, 0, true);
    cam.fadeEffect.alpha = 1;
    cam.setZoom(data.kind === "painting" ? 1.06 : 1.04);
    cam.centerOn(s.player.x, data.kind === "painting" ? 450 : s.player.y);
    s.player.sprite.setFlipX(false);
    try {
      await this.wait(35);
      s.ambience?.setLevel(1, 0.8);
      if (data.kind === "return") s.archiveTerminal?.setStatus("CONNECTION CLOSED");
      if (data.kind === "painting") {
        await Promise.all([
          this.fade(false, data.short ? 350 : 800),
          s.archiveDarkness ? this.tween(s.archiveDarkness, { alpha: 0 }, data.short ? 350 : 950) : this.wait(1)
        ]);
      } else if (data.kind === "digital" || data.kind === "return") {
        await Promise.all([this.fade(false, 170), this.glitch(0.9, 0, 800)]);
      } else await this.fade(false, 300);
      await this.restoreCamera(data.kind === "exit" ? 300 : 400);
      if (data.kind === "painting") state.saveManager.discoverSecretComputerRoom();
      this.finishCutscene();
    } catch (error) {
      if (error !== CANCELLED) console.error("[Cutscene arrival]", error);
      this.finishCutscene();
    }
  }

  async restoreCamera(duration = 400) {
    const s = this.scene;
    await this.moveCamera(s.player.x, s.player.y, s.room.zoom || 1, duration);
  }

  finishCutscene({ shutdown = false } = {}) {
    if (this.done) return;
    this.done = true;
    this.pending.forEach((cancel) => cancel());
    this.pending.clear();
    this.overlays.forEach((g) => g.destroy());
    this.overlays.clear();
    this.hintHum?.stop(0.15);
    const s = this.scene;
    s.archiveTerminal?.close(true);
    if (s.secretPainting) {
      s.secretPainting.frame.setPosition(0, 0);
      s.secretPainting.opening.setVisible(false).setScale(1);
      s.secretPainting.shade.setAlpha(0);
    }
    if (!shutdown) {
      s.archiveDarkness?.setAlpha(0);
      s.configureCamera();
      s.cameras.main.fadeEffect.reset();
      s.ambience?.setLevel(1, 0.25);
    }
    // Restauração só quando uma cutscene realmente travou o input. No shutdown
    // da cena o player/física já podem estar destruídos — tocar neles aqui
    // lançava exceção e abortava o pipeline de troca de área do Phaser.
    if (this.previous) {
      if (s.player?.body) s.player.body.enable = this.previous.body;
      s.inputController?.setLocked(this.previous.locked ?? false);
      s.inCutscene = false;
      s.transitioning = false;
      this.running = false;
      if (!this.handoff) state.hud.setCinematic(this.previous.hud ?? false);
    } else {
      this.running = false;
    }
    // Scene restarts create a fresh controller. A cancelled scene can also
    // recover in place and accept another interaction.
    if (!shutdown) s.cutscene = new CutsceneController(s);
  }

  destroy() { this.finishCutscene({ shutdown: true }); }
}
