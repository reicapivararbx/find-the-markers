// Máquina Conectada — dois corpos ligados por cabo; cada célula de energia
// encontrada acende um segmento do cabo (feedback progressivo). Com 3/3,
// [E] na válvula conecta os corpos e o Linked Machine Marker desperta.
import { Interactable } from "../entities/interactable.js";
import { Sfx } from "../core/audio-manager.js";

export class MachineLink {
  constructor(ctx) {
    this.ctx = ctx;
    this.scene = ctx.scene;
    this.sm = ctx.sm;
    this.hud = ctx.hud;
    this.solved = Boolean(this.sm.save.puzzleStates.machineSolved);

    this._drawStructures();
    this._drawCable();

    this.interactable = new Interactable(this.scene, {
      id: "machine_link_valve",
      x: 580,
      y: 500,
      radius: 120,
      prompt: () => this._prompt(),
      action: () => this._connect()
    });
    ctx.addUpdatable(this.interactable);
  }

  _prompt() {
    if (this.solved) return "Máquina conectada";
    const { found, target } = this.sm.questProgress("quest_energy_cells");
    return found >= target ? "[E] Conectar a máquina" : `Faltam ${target - found} células de energia`;
  }

  _cellsFound() {
    return this.sm.questProgress("quest_energy_cells").found;
  }

  _drawStructures() {
    const body = (x, w, fill) => {
      const g = this.scene.add.graphics().setDepth(470);
      g.fillStyle(fill, 1);
      g.fillRoundedRect(x, 430, w, 52, 6);
      g.lineStyle(3, 0x33333d, 0.85);
      g.strokeRoundedRect(x, 430, w, 52, 6);
      return g;
    };
    body(440, 60, 0xd4b45a); // recipiente amarelado
    body(660, 60, 0x3a8a5a); // estrutura tech verde
    const g2 = this.scene.add.graphics().setDepth(471);
    g2.fillStyle(0xffffff, 0.9); // olhos ovais no corpo tech
    g2.fillEllipse(676, 452, 10, 12);
    g2.fillEllipse(708, 452, 10, 12);
    g2.fillStyle(0x33333d, 1);
    g2.fillEllipse(676, 452, 4, 7);
    g2.fillEllipse(708, 452, 4, 7);
    g2.fillStyle(0xff5d5d, 1);
    g2.fillStar ? g2.fillStar(690, 470, 5, 7, 3) : g2.fillCircle(690, 470, 5);
  }

  _drawCable() {
    this.cablePoints = [
      [500, 462],
      [527, 478],
      [554, 458],
      [581, 478],
      [608, 458],
      [635, 472],
      [660, 462]
    ];
    this.segments = this.cablePoints.slice(0, -1).map(() => this.scene.add.graphics().setDepth(469));
    this.refreshCable();
  }

  refreshCable() {
    const found = this._cellsFound();
    this.segments.forEach((g, i) => {
      const lit = this.solved || i < found;
      const a = this.cablePoints[i];
      const b = this.cablePoints[i + 1];
      g.clear();
      g.lineStyle(5, lit ? 0x62c462 : 0x3a3a48, 1);
      g.lineBetween(a[0], a[1], b[0], b[1]);
      if (lit) {
        g.lineStyle(2, 0xeaffea, 0.7);
        g.lineBetween(a[0], a[1], b[0], b[1]);
      }
    });
  }

  _connect() {
    if (this.solved) return;
    const { found, target } = this.sm.questProgress("quest_energy_cells");
    if (found < target) {
      this.hud.toast(`Faltam ${target - found} células de energia.`, { icon: "🔋", duration: 2200 });
      Sfx.gateBlocked();
      return;
    }
    this.solved = true;
    Sfx.puzzleSolved();
    this.hud.toast("Os dois corpos pulsam juntos.", { icon: "⚡", duration: 2800 });
    this.sm.solvePuzzle("machineSolved");
  }

  update() {
    // células coletadas acendem o cabo na hora (feedback progressivo)
    const f = this._cellsFound();
    if (this._lastFound === undefined) this._lastFound = f;
    if (f !== this._lastFound) {
      this._lastFound = f;
      this.refreshCable();
      Sfx.puzzleStep();
    }
  }

  destroy() {}
}
