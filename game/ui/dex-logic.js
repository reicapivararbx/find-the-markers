// Lógica pura do Marker Dex — filtragem e regras de exibição.
// Sem DOM/Phaser: testável direto no node (tests/dex-logic.test.js).

const SECRET_PLACEHOLDER = "???";

// Regra do documento: nem todo marker revela tudo antes de ser encontrado.
// Marker comum: nome/área/dificuldade/dica. Secreto: tudo vira "???".
// Solução completa (método + lore + data) só depois de coletado.
export function markerView(def, save) {
  const collected = Boolean(save?.collectedMarkerIds?.includes(def.id));
  const secret = Boolean(def.secret);
  const discovered = collected || (secret && false);
  if (collected) {
    return {
      id: def.id,
      name: def.name,
      difficulty: def.difficulty,
      area: def.area || null,
      status: "ENCONTRADO",
      hint: null,
      lore: def.lore || null,
      method: def.method || null,
      foundAt: save?.markerLog?.[def.id] || null,
      secret,
      collected: true
    };
  }
  if (secret) {
    return {
      id: def.id,
      name: SECRET_PLACEHOLDER,
      difficulty: SECRET_PLACEHOLDER,
      area: SECRET_PLACEHOLDER,
      status: "??",
      hint: def.hint && def.hint !== "..." ? def.hint : "…",
      lore: null,
      method: null,
      foundAt: null,
      secret: true,
      collected: false
    };
  }
  return {
    id: def.id,
    name: def.name,
    difficulty: def.difficulty,
    area: def.area || null,
    status: "NÃO ENCONTRADO",
    hint: def.hint || null,
    lore: null,
    method: null,
    foundAt: null,
    secret: false,
    collected: false
  };
}

// Busca por nome/área/dificuldade + filtros de status e dificuldade.
// query também casa com o nome real de markers secretos? NÃO: secreto não
// encontrado só aparece nas listas (sem nome), a busca não vaza o nome dele.
export function filterMarkers(markers, save, { query = "", status = "todos", difficulty = "todas" } = {}) {
  const q = String(query).trim().toLowerCase();
  const collected = save?.collectedMarkerIds || [];
  return markers.filter((def) => {
    const view = markerView(def, save);
    if (status === "encontrados" && !view.collected) return false;
    if (status === "nao_encontrados" && view.collected) return false;
    if (status === "secretos" && !def.secret) return false;
    if (difficulty !== "todas" && def.difficulty !== difficulty) return false;
    if (q) {
      const haystack = [view.name, view.area, view.difficulty]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

// Agrupamento por área para a aba ÁREAS do Dex (dados reais do save).
export function areaSummaries(markers, save, roomNames) {
  const byRoom = new Map();
  for (const def of markers) {
    if (!byRoom.has(def.room)) byRoom.set(def.room, []);
    byRoom.get(def.room).push(def);
  }
  const out = [];
  for (const [roomId, defs] of byRoom) {
    const found = defs.filter((d) => save?.collectedMarkerIds?.includes(d.id)).length;
    const secrets = defs.filter((d) => d.secret);
    out.push({
      roomId,
      name: roomNames?.[roomId] || roomId,
      found,
      total: defs.length,
      percent: defs.length ? Math.round((found / defs.length) * 100) : 0,
      secretTotal: secrets.length,
      secretFound: secrets.filter((d) => save?.collectedMarkerIds?.includes(d.id)).length,
      hasSecrets: secrets.length > 0
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

// Conquistas computadas de dados reais — nada inventado aqui.
export function achievements(save, totalMarkers) {
  const list = [];
  const n = save?.collectedMarkerIds?.length || 0;
  const push = (ok, label) => list.push({ ok: Boolean(ok), label });
  push(n >= 1, "Primeiro marker");
  push(n >= 10, "10 markers");
  push(n >= 25, "25 markers");
  push(n >= 50, "50 markers");
  push(n >= 100, "100 markers");
  push(n >= totalMarkers, "Coleção completa");
  push((save?.discoveredEggIds?.length || 0) >= 5, "Missão dos 5 ovos");
  push((save?.areaSeals?.length || 0) >= 9, "Os 9 selos das áreas");
  push((save?.secretAreas?.length || 0) >= 1, "Primeira área secreta");
  push((save?.secretAreas?.length || 0) >= 5, "5 áreas secretas");
  push(Boolean(save?.slot?.jackpotWon), "Jackpot na CAPY SLOT");
  push(Boolean(save?.menuSecrets?.championSolved), "Champion do menu");
  push(
    Object.entries(save?.puzzleStates || {})
      .filter(([key]) => ["difficultySolved", "redButtonsSolved", "creditsBoxesSolved", "valvesSolved", "batteriesSolved", "runesSolved", "fragmentsSolved", "firewallSolved", "shadowWatcherSolved", "mysteriousCapybaraSolved"].includes(key))
      .filter(([, v]) => v).length >= 10,
    "Mestre dos puzzles clássicos"
  );
  return list;
}

// Desafios FIND-N com progresso real (aba Progresso do Dex).
export function questSummaries(quests, save) {
  return quests.map((quest) => {
    const state = save?.quests?.[quest.id] || { foundIds: [], completed: false };
    const found = Math.min(state.foundIds.length, quest.targetCount);
    return {
      id: quest.id,
      title: quest.discreet ? "???" : quest.title,
      discreet: Boolean(quest.discreet),
      found,
      target: quest.targetCount,
      completed: Boolean(state.completed) || found >= quest.targetCount
    };
  });
}
