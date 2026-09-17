// Wiring central do conteúdo conceitual (desenhos à mão).
// RoomScene chama wireHandDrawnContent(ctx) depois do room.wire(ctx) —
// um único lugar registra quests e puzzles/minigames por sala.
import { QuestManager } from "./quest-manager.js";
import { ClockPuzzle } from "./clock-puzzle.js";
import { MachineLink } from "./machine-link.js";
import { GrumpyNpc } from "./grumpy-npc.js";
import { SoccerMini } from "./soccer-mini.js";
import { BaseballMini } from "./baseball-mini.js";
import { MechTerminal } from "./mech-terminal.js";

export function wireHandDrawnContent(ctx) {
  // quests FIND-N existem em qualquer sala com itens (3 entidades, 5 vestígios,
  // células, moedas, fragmentos, componentes) — o manager filtra por sala.
  ctx.addUpdatable(new QuestManager(ctx.scene, { roomId: ctx.scene.roomId, saveManager: ctx.sm, hud: ctx.hud }));

  switch (ctx.scene.roomId) {
    case "secret_17_observatory":
      ctx.addUpdatable(new ClockPuzzle(ctx));
      break;
    case "room_15_lab":
      ctx.addUpdatable(new MachineLink(ctx));
      break;
    case "room_04_city_casino":
      ctx.addUpdatable(new GrumpyNpc(ctx));
      break;
    case "room_09_spawn":
      ctx.addUpdatable(new SoccerMini(ctx));
      break;
    case "room_01_market":
      ctx.addUpdatable(new BaseballMini(ctx));
      break;
    case "room_13_factory":
      ctx.addUpdatable(new MechTerminal(ctx));
      break;
    default:
      break;
  }
}
