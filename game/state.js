// Referências compartilhadas (preenchidas no boot do main.js).
// Evita importação circular entre cenas e UI.
export const state = {
  saveManager: null,
  hud: null,
  menu: null,
  game: null,
  debug: false
};
