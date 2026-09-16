// Codes are the only public labels. These rooms never enter the public area list.
//
// ARCHIVE_PENDING: o grafo do Arquivo Secreto só entra em ROOM_CONNECTIONS
// quando TODOS os módulos das salas existirem em game/rooms/index.js. Enquanto
// pendente, o quadro da galeria vira um gate "Em breve" (to: null) — nunca um
// destino inexistente que derruba o player no spawn. Ao construir as salas,
// registre os módulos e troque para false: a validação estática
// (tests/map-graph.test.js) falha enquanto o grafo e os módulos divergirem.
export const ARCHIVE_PENDING = true;
export const ARCHIVE_ROOM = "secret_computer_room";
export const ARCHIVE_MAPS = Object.freeze([
  { code: "MAP_01", id: "experimental_t_room" },
  { code: "MAP_02", id: "experimental_playhouse" },
  { code: "MAP_03", id: "experimental_toy_hall" },
  { code: "MAP_04", id: "experimental_carnival" },
  { code: "MAP_05", id: "experimental_theater" }
].map(Object.freeze));
export const ARCHIVE_CONNECTIONS = Object.fromEntries(ARCHIVE_MAPS.map(({ code, id }) => [code, {
  to: id, arriveAt: "default", cinematic: "digital", code
}]));
export const ARCHIVE_RETURNS = Object.fromEntries(ARCHIVE_MAPS.map(({ id, code }) => [id, {
  return: { to: ARCHIVE_ROOM, arriveAt: "from_map", cinematic: "return", code }
}]));
