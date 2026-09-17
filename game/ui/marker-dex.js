// MARKER DEX — coleção com busca, filtros, páginas de área e progresso.
// Substitui o painel de coleção simples (#collection-panel), mantendo o
// mesmo toggle (tecla C / botão 🎒 / ESC fecha).
import { MARKERS, TOTAL_MARKERS } from "../config/marker-registry.js";
import { ROOM_NAMES } from "../config/room-connections.js";
import { ROOMS } from "../rooms/index.js";
import { DIFFICULTY_COLORS } from "../config/difficulty-metadata.js";
import { HAND_DRAWN_QUESTS, AREA_LORE } from "../config/hand-drawn-markers.js";
import { PLAYER_CHARACTERS } from "../config/game-config.js";
import {
  markerView,
  filterMarkers,
  areaSummaries,
  achievements,
  questSummaries
} from "./dex-logic.js";
import { state } from "../state.js";

function hex(difficulty) {
  const c = DIFFICULTY_COLORS[difficulty];
  if (!c) return "#9aa5b1";
  return `#${c.toString(16).padStart(6, "0")}`;
}

export class MarkerDex {
  constructor() {
    this.root = document.querySelector("#collection-panel");
    this.grid = document.querySelector("#collection-grid");
    this.countEl = document.querySelector("#collection-count");
    this.searchEl = document.querySelector("#dex-search");
    this.statusEl = document.querySelector("#dex-status-filters");
    this.diffEl = document.querySelector("#dex-difficulty");
    this.tabsEl = document.querySelector("#dex-tabs");
    this.detailEl = document.querySelector("#dex-detail");
    this.summaryEl = document.querySelector("#dex-summary-text");
    this.summaryBar = document.querySelector("#dex-summary-bar");

    this.tab = "markers";
    this.areaRoom = null;

    this.searchEl?.addEventListener("input", () => this.render());
    this.diffEl?.addEventListener("change", () => this.render());
    this.statusEl?.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-status]");
      if (!chip) return;
      this.statusEl.querySelectorAll("[data-status]").forEach((el) => el.classList.remove("is-active"));
      chip.classList.add("is-active");
      this.render();
    });
    this.tabsEl?.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]");
      if (!tab) return;
      this.tab = tab.dataset.tab;
      this.areaRoom = null;
      this.tabsEl.querySelectorAll("[data-tab]").forEach((el) => el.classList.toggle("is-active", el.dataset.tab === this.tab));
      this.render();
    });
    this.grid?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-marker-id]");
      if (card) return this.showDetail(card.dataset.markerId);
      const areaCard = e.target.closest("[data-area-room]");
      if (areaCard) {
        this.areaRoom = areaCard.dataset.areaRoom;
        this.render();
      }
    });
    document.querySelector("#dex-detail-back")?.addEventListener("click", () => this.showDetail(null));
  }

  isOpen() {
    return this.root.classList.contains("is-open");
  }

  toggle(force) {
    const open = force ?? !this.isOpen();
    this.root.classList.toggle("is-open", open);
    if (open) this.render();
  }

  open(tab = "markers") {
    this.tab = tab;
    this.areaRoom = null;
    this.tabsEl?.querySelectorAll("[data-tab]").forEach((el) => el.classList.toggle("is-active", el.dataset.tab === tab));
    this.toggle(true);
  }

  save() {
    return state.saveManager?.save || { collectedMarkerIds: [] };
  }

  render() {
    if (!this.isOpen()) return;
    const save = this.save();
    const found = save.collectedMarkerIds?.length || 0;
    if (this.countEl) this.countEl.textContent = `${found}/${TOTAL_MARKERS}`;
    if (this.summaryEl) {
      this.summaryEl.textContent = `MARKERS ENCONTRADOS ${found}/${TOTAL_MARKERS}`;
    }
    if (this.summaryBar) {
      this.summaryBar.style.setProperty("--dex-percent", `${TOTAL_MARKERS ? Math.round((found / TOTAL_MARKERS) * 100) : 0}%`);
    }
    this.searchEl?.closest(".dex-toolbar")?.classList.toggle("is-hidden", this.tab !== "markers");
    this.detailEl.hidden = true;
    if (this.tab === "areas") return this.renderAreas(save);
    if (this.tab === "progresso") return this.renderProgress(save);
    this.renderMarkers(save);
  }

  // ---- aba MARKERS ----
  renderMarkers(save) {
    const filters = {
      query: this.searchEl?.value || "",
      status: this.statusEl?.querySelector("[data-status].is-active")?.dataset.status || "todos",
      difficulty: this.diffEl?.value || "todas"
    };
    const defs = filterMarkers(MARKERS, save, filters);
    this.grid.innerHTML = "";
    defs.forEach((def) => {
      const view = markerView(def, save);
      const card = document.createElement("button");
      card.type = "button";
      card.className = `marker-chip ${view.collected ? "is-collected" : "is-locked"}${def.secret ? " is-secret" : ""}`;
      card.dataset.markerId = def.id;
      const diffColor = view.secret && !view.collected ? "#6b7280" : hex(def.difficulty);
      card.innerHTML = `
        <span class="chip-body" style="--diff-color:${diffColor}">
          <span class="chip-cap"></span>
          <span class="chip-face">${view.collected ? "·‿·" : "·_·"}</span>
        </span>
        <span class="chip-name">${view.name}</span>
        <span class="chip-diff" style="color:${diffColor}">${view.difficulty}</span>
        ${view.area ? `<span class="chip-area">${view.area}</span>` : ""}
        <span class="chip-status">${view.status}</span>
        <span class="chip-check">${view.collected ? "✓" : ""}</span>
      `;
      this.grid.appendChild(card);
    });
    if (!defs.length) {
      this.grid.innerHTML = `<p class="dex-empty">Nenhum marker corresponde à busca.</p>`;
    }
  }

  // ---- aba ÁREAS ----
  renderAreas(save) {
    if (this.areaRoom) return this.renderAreaDetail(save, this.areaRoom);
    const areas = areaSummaries(MARKERS, save, ROOM_NAMES);
    this.grid.innerHTML = "";
    areas.forEach((area) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "dex-area-card";
      card.dataset.areaRoom = area.roomId;
      const known = Boolean(ROOMS[area.roomId]);
      card.innerHTML = `
        <span class="dex-area-name">${area.name}</span>
        <span class="dex-area-progress"><i style="--dex-percent:${area.percent}%"></i></span>
        <span class="dex-area-meta">${area.found}/${area.total} markers · ${area.percent}%</span>
        <span class="dex-area-meta">${area.hasSecrets ? `Segredos: ${area.secretFound}/${area.secretTotal}` : "—"}</span>
      `;
      this.grid.appendChild(card);
    });
  }

  renderAreaDetail(save, roomId) {
    const defs = MARKERS.filter((m) => m.room === roomId);
    const found = defs.filter((d) => save.collectedMarkerIds?.includes(d.id)).length;
    this.grid.innerHTML = `
      <button type="button" class="dex-back" data-area-room="">← Voltar para áreas</button>
      <div class="dex-area-head">
        <h3>${ROOM_NAMES[roomId] || roomId}</h3>
        <p>${found}/${defs.length} MARKERS · ${AREA_LORE[roomId] || ""}</p>
      </div>
    `;
    this.grid.querySelector("[data-area-room]").addEventListener("click", () => {
      this.areaRoom = null;
      this.render();
    });
    defs.forEach((def) => {
      const view = markerView(def, save);
      const row = document.createElement("div");
      row.className = `dex-area-marker ${view.collected ? "is-collected" : ""}`;
      row.innerHTML = `
        <span class="dex-area-marker-name">${view.name}</span>
        <span class="dex-area-marker-diff" style="color:${view.secret && !view.collected ? "#6b7280" : hex(def.difficulty)}">${view.difficulty}</span>
        <span class="dex-area-marker-hint">${view.collected ? "" : view.hint || ""}</span>
      `;
      this.grid.appendChild(row);
    });
  }

  // ---- aba PROGRESSO ----
  renderProgress(save) {
    const found = save.collectedMarkerIds?.length || 0;
    const percent = TOTAL_MARKERS ? Math.round((found / TOTAL_MARKERS) * 100) : 0;
    const char = PLAYER_CHARACTERS[save.playerCharacter];
    const quests = questSummaries(HAND_DRAWN_QUESTS, save);
    const achieved = achievements(save, TOTAL_MARKERS);
    const discovered = save.lastCollectedMarkerId
      ? MARKERS.find((m) => m.id === save.lastCollectedMarkerId)?.name
      : null;

    this.grid.innerHTML = `
      <div class="dex-profile">
        <h3>Perfil</h3>
        <p><strong>Personagem:</strong> ${char?.label || "—"} <em>(só visual)</em></p>
        <p><strong>Markers:</strong> ${found}/${TOTAL_MARKERS} (${percent}%)</p>
        <p><strong>Último marker:</strong> ${discovered || "—"}</p>
        <p><strong>Áreas com progresso:</strong> ${areaSummaries(MARKERS, save, ROOM_NAMES).filter((a) => a.found > 0).length}</p>
      </div>
      <div class="dex-quests">
        <h3>Desafios</h3>
        ${quests.map((q) => `
          <p class="dex-quest ${q.completed ? "is-done" : ""}">
            <span>${q.title}</span><strong>${q.discreet && !q.completed ? `${q.found}/${q.target}` : q.completed ? "✓" : `${q.found}/${q.target}`}</strong>
          </p>`).join("")}
      </div>
      <div class="dex-achievements">
        <h3>Conquistas</h3>
        ${achieved.map((a) => `<p class="${a.ok ? "is-done" : ""}">${a.ok ? "🏆" : "🔒"} ${a.label}</p>`).join("")}
      </div>
      <div class="dex-multiplayer">
        <h3>Amigos & Multiplayer</h3>
        <p><em>Em desenvolvimento</em> — entrará no ar apenas com dados reais do servidor.</p>
      </div>
    `;
  }

  // ---- detalhe de um marker ----
  showDetail(markerId) {
    const def = MARKERS.find((m) => m.id === markerId);
    if (!def) return;
    const view = markerView(def, this.save());
    this.grid.hidden = true;
    this.detailEl.hidden = false;
    const date = view.foundAt
      ? new Date(view.foundAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      : null;
    this.detailEl.innerHTML = `
      <button type="button" class="dex-back" id="dex-detail-back-2">← Voltar</button>
      <div class="dex-detail-card ${view.collected ? "is-collected" : "is-locked"}">
        <span class="chip-body chip-body-large" style="--diff-color:${view.secret && !view.collected ? "#6b7280" : hex(def.difficulty)}">
          <span class="chip-cap"></span>
          <span class="chip-face">${view.collected ? "·‿·" : "·_·"}</span>
        </span>
        <h3>${view.name}</h3>
        <p class="dex-detail-diff" style="color:${view.secret && !view.collected ? "#6b7280" : hex(def.difficulty)}">
          ${view.status === "ENCONTRADO" ? "Raridade/Dificuldade" : ""} ${view.difficulty} · ${view.status}
        </p>
        <p class="dex-detail-area">Área: ${view.area || "???"}</p>
        ${view.hint && !view.collected ? `<p class="dex-detail-hint">💡 ${view.hint}</p>` : ""}
        ${view.lore ? `<p class="dex-detail-lore">${view.lore}</p>` : ""}
        ${view.method ? `<p class="dex-detail-method">🔎 ${view.method}</p>` : ""}
        ${date ? `<p class="dex-detail-date">Encontrado em ${date}</p>` : ""}
      </div>
    `;
    this.detailEl.querySelector("#dex-detail-back-2").addEventListener("click", () => this.showDetail(null));
  }
}
