// Event bus minimalista para desacoplar HUD/puzzles/save.
export const Events = {
  MARKER_COLLECTED: "marker:collected",
  MARKER_COUNT_CHANGED: "markerCount:changed",
  EGG_FOUND: "egg:found",
  PUZZLE_SOLVED: "puzzle:solved",
  PUZZLE_STEP: "puzzle:step",
  PUZZLE_RESET: "puzzle:reset",
  ROOM_UNLOCKED: "room:unlocked",
  ROOM_ENTERED: "room:entered",
  GATE_BLOCKED: "gate:blocked",
  INTERACTION_COMPLETED: "interaction:completed",
  SAVE_CHANGED: "save:changed",
  BOX_OPENED: "box:opened"
};

export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler, context) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add({ handler, context: context || null });
    return () => this.off(event, handler, context);
  }

  once(event, handler, context) {
    const off = this.on(event, (...args) => {
      off();
      handler(...args);
    }, context);
    return off;
  }

  off(event, handler, context) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const entry of set) {
      if (entry.handler === handler && entry.context === (context || null)) {
        set.delete(entry);
        break;
      }
    }
  }

  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const { handler, context } of Array.from(set)) {
      try {
        handler.call(context, payload);
      } catch (error) {
        console.error(`[EventBus] Erro no handler de "${event}"`, error);
      }
    }
  }
}

export const bus = new EventBus();
