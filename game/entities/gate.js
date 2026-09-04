// Seta/portal de saída com requisito de markers (top-down).
// Bloqueado: mostra 🔒 + número exigido e "Colete mais N marcador(es)."
// with destination null (gate futuro): "Em breve" quando liberado.
import { GAMEPLAY } from "../config/game-config.js";
import { canEnter, missingMarkerMessage } from "../config/room-connections.js";
import { bus, Events } from "../core/event-bus.js";
import { Sfx } from "../core/audio-manager.js";

export class Gate {
  constructor(scene, { id, connection, x, arrowY = 470, zone, arrow, save, hud, onTravel, showArrow = true }) {
    this.scene = scene;
    this.id = id;
    this.connection = connection;
    this.save = save;
    this.hud = hud;
    this.onTravel = onTravel;
    this.inside = false;
    this.blockedFeedbackAt = 0;
    this.enabled = true;

    const required = connection.requiredMarkers ?? 0;
    const lockedByCount = required > save.collectedMarkerIds.length;
    const lockedByCondition = Boolean(
      connection.condition && !save.puzzleStates[connection.condition]
    );
    this.locked = lockedByCount || lockedByCondition;

    // top-down: zonas de gate nas bordas (mais largas horizontalmente se custom)
    const zoneRect = zone || {
      x: x - GAMEPLAY.gateZoneWidth / 2,
      y: arrowY - GAMEPLAY.gateZoneHeight / 2,
      width: GAMEPLAY.gateZoneWidth,
      height: GAMEPLAY.gateZoneHeight
    };
    this.zone = scene.add.zone(
      zoneRect.x + zoneRect.width / 2,
      zoneRect.y + zoneRect.height / 2,
      zoneRect.width,
      zoneRect.height
    );
    this.zone.setOrigin(0.5);
    scene.physics.add.existing(this.zone, true);

    const shouldShow = showArrow !== false && arrow !== false;

    if (connection.to !== null && shouldShow) {
      this.arrow = scene.add.image(x, arrowY, "arrow").setDepth(arrowY + 5);
      // aponta para fora: esquerda flip, direita normal; cima/baixo por rotação se y extremo
      if (x < 120) this.arrow.setFlipX(true);
      else if (x > 1320) this.arrow.setFlipX(false);
      else if (arrowY < 200) this.arrow.setAngle(-90);
      else if (arrowY > 650) this.arrow.setAngle(90);

      this.tween = scene.tweens.add({
        targets: this.arrow,
        x: x + (x < 720 ? -7 : x > 720 ? 7 : 0),
        y: arrowY + (arrowY < 200 ? -5 : arrowY > 650 ? 5 : 0),
        alpha: 0.92,
        duration: 700,
        ease: "Sine.inOut",
        yoyo: true,
        repeat: -1
      });
      this.baseX = x;

      if (required > 0) {
        this.badge = scene.add
          .text(x, arrowY - 78, `🔒 ${required}`, {
            fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
            fontSize: "24px",
            fontStyle: "bold",
            color: "#ffffff",
            backgroundColor: "#b03a3acc",
            padding: { x: 10, y: 5 }
          })
          .setOrigin(0.5)
          .setDepth(arrowY + 6);
      }
    } else if (connection.to === null && shouldShow) {
      const futureOpen = !this.locked;
      this.arrow = scene.add
        .image(x, arrowY, "arrow")
        .setDepth(arrowY + 5)
        .setAlpha(futureOpen ? 0.55 : 0.35)
        .setTint(futureOpen ? 0xc4b5fd : 0x9aa5b1);
      this.arrow.setFlipX(true);
      this.badge = scene.add
        .text(x, arrowY - 78, futureOpen ? "✨ Em breve" : `🔒 ${required}`, {
          fontFamily: '"Comic Sans MS", "Segoe UI", sans-serif',
          fontSize: "22px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: futureOpen ? "#7c3aedcc" : "#6b7280cc",
          padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setDepth(arrowY + 6);
    }

    scene.physics.add.overlap(scene.player.sprite, this.zone, () => this.onPlayerEnter());
  }

  onPlayerEnter() {
    if (this.inside || !this.enabled || this.scene.transitioning) return;
    this.inside = true;
    this.evaluate();
    this.scene.time.delayedCall(300, () => (this.inside = false));
  }

  evaluate() {
    const open = canEnter(this.connection, this.save);

    // Destino ainda não definido (ex.: gate de 30 da feira).
    if (open && this.connection.to === null) {
      this.hud.toast("Em breve…", { icon: "✨", duration: 2200 });
      Sfx.reveal();
      return;
    }

    if (open) {
      this.onTravel(this.connection);
      return;
    }

    if (this.scene.time.now < this.blockedFeedbackAt) return;
    this.blockedFeedbackAt = this.scene.time.now + 1800;
    const message =
      missingMarkerMessage(this.connection, this.save) ||
      "Volte quando tiver resolvido o puzzle.";
    this.hud.toast(message, { icon: "🔒", duration: 2400 });
    Sfx.gateBlocked();
    bus.emit(Events.GATE_BLOCKED, this.id);
  }

  highlight(near) {
    if (this.arrow) this.arrow.setAlpha(near ? 1 : 0.86);
  }

  destroy() {
    this.arrow?.destroy();
    this.badge?.destroy();
    this.tween?.remove();
    this.zone.destroy();
  }
}
