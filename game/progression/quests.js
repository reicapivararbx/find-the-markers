// Sistema reutilizável de quests FIND-N.
// Progresso persistido no save (save.quests) — nunca por frame, só ao encontrar.
// Usado pelas missões sombrias (3 entidades / 5 vestígios), células de energia,
// moedas escondidas, fragmentos de glitch e componentes da máquina.
import { QUEST_BY_ID } from "../config/hand-drawn-markers.js";

export function emptyQuestState() {
  return { foundIds: [], completed: false };
}

// Estado normalizado de uma quest no save (defensivo com saves antigos).
export function questState(save, questId) {
  const raw = save?.quests?.[questId];
  const state = emptyQuestState();
  if (!raw || typeof raw !== "object") return state;
  if (Array.isArray(raw.foundIds)) state.foundIds = [...new Set(raw.foundIds)];
  state.completed = Boolean(raw.completed);
  return state;
}

export function questProgress(save, questId) {
  const def = QUEST_BY_ID[questId];
  const target = def?.targetCount ?? 0;
  const state = questState(save, questId);
  const found = Math.min(state.foundIds.length, target);
  return { found, target, completed: state.completed || (target > 0 && found >= target) };
}

// Registra um item encontrado. Idempotente: reencontrar não duplica nem
// re-dispara a conclusão. Retorna flags para feedback na cena.
export function recordQuestFind(save, questId, itemId) {
  const def = QUEST_BY_ID[questId];
  if (!def) return { ok: false, found: 0, target: 0, justCompleted: false, isNew: false };

  if (!save.quests || typeof save.quests !== "object") save.quests = {};
  const state = questState(save, questId);
  const isNew = !state.foundIds.includes(itemId);
  if (isNew) state.foundIds.push(itemId);

  const target = def.targetCount ?? state.foundIds.length;
  const wasCompleted = state.completed;
  const completed = state.foundIds.length >= target;
  state.completed = completed || wasCompleted;
  save.quests[questId] = state;

  return {
    ok: true,
    isNew,
    found: Math.min(state.foundIds.length, target),
    target,
    justCompleted: completed && !wasCompleted
  };
}

// Uma quest conta como completa se o save marca completed OU o alvo já foi atingido.
export function isQuestCompleted(save, questId) {
  const def = QUEST_BY_ID[questId];
  if (!def) return true; // quest desconhecida não deve bloquear conteúdo
  const { completed } = questProgress(save, questId);
  return completed;
}

// Todos os ids de itens de todas as quests (para validação de colisão de ids).
export function allQuestItemIds() {
  return Object.values(QUEST_BY_ID).flatMap((quest) => quest.items.map((item) => item.id));
}
