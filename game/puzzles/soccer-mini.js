// Striker Marker — campinho no Início: chute por contato (bola sai do player),
// 3 alvos e depois o gol. Bola respeita os limites do campinho (sem fuga).
// Marker aparece ao lado do gol e libera a coleta com soccerSolved.
import { Sfx } from "../core/audio-manager.js";
import { GAMEPLAY } from "../config/game-config.js";

const PITCH = { x: 930, y: 596, w: 220, h: 150 };
const TARGETS = [
  { x: 975, y: 700 },
  { x: 1040, y: 706 },
  { x: 1105, y: 700 }
];
const GOAL = { x1: 985, x2: 1095, y: PITCH.y + 14 };
const BALL_START = { x: 1040, y: 655 };

export class SoccerMini {
  constructor(ctx) {
    this.scene = ctx.scene;
    this.sm = ctx.sm;
    this.hud = ctx.hud;
    this.solved = Boolean(this.sm.save.puzzleStates.soccerSolved);
    this.hits = this.solved ? TARGETS.length : 0;
    this.kickCooldown = 0;

    this._drawPitch();
    this._spawnBall();
    this._drawTargets();
    this._drawGoal();
  }

  _drawPitch() {
    const g = this.scene.add.graphics().setDepth(PITCH.y - 1);
    g.fillStyle(0x6fae5a, 0.85);
    g.fillRoundedRect(PITCH.x, PITCH.y, PITCH.w, PITCH.h, 10);
    g.lineStyle(3, 0xffffff, 0.4);
    g.strokeRoundedRect(PITCH.x + 4, PITCH.y + 4, PITCH.w - 8, PITCH.h - 8, 8);
    g.lineBetween(PITCH.x + PITCH.w / 2, PITCH.y + 6, PITCH.x + PITCH.w / 2, PITCH.y + PITCH.h - 6);
  }

  _drawGoal() {
    this.goalGfx = this.scene.add.graphics().setDepth(PITCH.y + 1);
    this.goalGfx.fillStyle(0xffffff, 0.35);
    this.goalGfx.fillRect(GOAL.x1, PITCH.y, GOAL.x2 - GOAL.x1, 12);
    this.goalGfx.lineStyle(3, 0x35405e, 0.9);
    this.goalGfx.strokeRect(GOAL.x1, PITCH.y, GOAL.x2 - GOAL.x1, 12);
  }

  _drawTargets() {
    this.targetGfx = TARGETS.map((t) => {
      const g = this.scene.add.graphics().setDepth(t.y + 2);
      return { g, t, hit: false };
    });
    this._renderTargets();
  }

  _renderTargets() {
    this.targetGfx.forEach(({ g, t, hit }) => {
      g.clear();
      g.fillStyle(hit ? 0x62c462 : 0xff8a3a, 1);
      g.fillRoundedRect(t.x - 13, t.y - 22, 26, 20, 4);
      g.lineStyle(2.5, 0x33333d, 0.85);
      g.strokeRoundedRect(t.x - 13, t.y - 22, 26, 20, 4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(t.x, t.y - 12, 4);
    });
  }

  _spawnBall() {
    this.ball = this.scene.physics.add.image(BALL_START.x, BALL_START.y, "soccer_ball_tex");
    this.ball.setCircle(9).setBounce(0.6).setDamping(true).setDrag(0.86);
    this.ball.setDepth(BALL_START.y + 4);
    if (this.solved) this.ball.disableBody(true, true);
    else {
      this.scene.physics.add.overlap(this.scene.player.sprite, this.ball, () => this._kick());
    }
  }

  _kick() {
    if (this.solved || this.scene.time.now < this.kickCooldown) return;
    this.kickCooldown = this.scene.time.now + 260;
    const player = this.scene.player.sprite;
    let vx = this.ball.x - player.x;
    let vy = this.ball.y - player.y;
    const len = Math.hypot(vx, vy) || 1;
    vx /= len;
    vy /= len;
    // prefere a direção do movimento do player quando ele está se mexendo
    const mvx = player.body.velocity.x;
    const mvy = player.body.velocity.y;
    if (Math.hypot(mvx, mvy) > 24) {
      vx = mvx;
      vy = mvy;
      const l2 = Math.hypot(vx, vy) || 1;
      vx /= l2;
      vy /= l2;
    }
    this.ball.setVelocity(vx * 340, vy * 340);
    Sfx.kick();
    this.scene.time.delayedCall(90, () => this._checkTargets());
  }

  _checkTargets() {
    if (this.solved) return;
    this.targetGfx.forEach((entry) => {
      if (entry.hit) return;
      if (Math.hypot(this.ball.x - entry.t.x, this.ball.y - (entry.t.y - 12)) < 22) {
        entry.hit = true;
        this.hits += 1;
        Sfx.puzzleStep();
        this._renderTargets();
        if (this.hits >= TARGETS.length) {
          this.hud.toast("Alvos completos — agora o gol!", { icon: "⚽", duration: 2200 });
        }
      }
    });
    // gol: só vale depois dos 3 alvos
    if (this.hits >= TARGETS.length && this.ball.y < GOAL.y + 6 && this.ball.x > GOAL.x1 && this.ball.x < GOAL.x2) {
      this._score();
    }
  }

  _score() {
    this.solved = true;
    Sfx.puzzleSolved();
    this.hud.toast("GOOOL! O Striker Marker apareceu!", { icon: "⚽", duration: 3000 });
    this.sm.solvePuzzle("soccerSolved");
    this.ball.disableBody(true, true);
  }

  update() {
    if (this.solved) return;
    // limites do campinho: quica nas bordas, nunca escapa
    const pad = 10;
    if (this.ball.x < PITCH.x + pad) { this.ball.x = PITCH.x + pad; this.ball.velocity.x = Math.abs(this.ball.velocity.x); }
    if (this.ball.x > PITCH.x + PITCH.w - pad) { this.ball.x = PITCH.x + PITCH.w - pad; this.ball.velocity.x = -Math.abs(this.ball.velocity.x); }
    if (this.ball.y < PITCH.y + pad) { this.ball.y = PITCH.y + pad; this.ball.velocity.y = Math.abs(this.ball.velocity.y); }
    if (this.ball.y > PITCH.y + PITCH.h - pad) { this.ball.y = PITCH.y + PITCH.h - pad; this.ball.velocity.y = -Math.abs(this.ball.velocity.y); }
    if (Math.hypot(this.ball.body.velocity.x, this.ball.body.velocity.y) > 24) this._checkTargets();
  }

  destroy() {
    this.ball?.destroy();
  }
}
