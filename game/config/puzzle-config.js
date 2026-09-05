// Configuração central dos puzzles — estes valores NUNCA se duplicam em outros arquivos.

// Ordem EXATA dos 9 botões vermelhos (página 11 do PDF: 5 8 9 / 7 1 4 / 2 6 3).
// Os números são a ordem em que os botões devem ser apertados.
export const RED_BUTTON_SEQUENCE = Object.freeze([
  "center",
  "bottomLeft",
  "bottomRight",
  "middleRight",
  "topLeft",
  "bottomCenter",
  "middleLeft",
  "topCenter",
  "topRight"
]);

// Posições do grid 3x3 (linha superior -> inferior).
export const RED_BUTTON_GRID = Object.freeze([
  ["topLeft", "topCenter", "topRight"],
  ["middleLeft", "center", "middleRight"],
  ["bottomLeft", "bottomCenter", "bottomRight"]
]);

// Sequência EXATA do medidor de dificuldade (dificuldades dos 10 primeiros markers).
export const DIFFICULTY_SEQUENCE = Object.freeze([
  "Effortless",
  "Easy",
  "Medium",
  "Why",
  "Hard",
  "Hard",
  "Easy",
  "Easy",
  "Medium",
  "Hard"
]);

// Missão dos ovos — coordenadas top-down (pés no chão).
export const EGG_QUEST = Object.freeze({
  total: 5,
  eggs: Object.freeze([
    { id: "egg_01", room: "room_07_forest", x: 160, y: 480 },
    { id: "egg_02", room: "room_07_forest", x: 505, y: 660 },
    { id: "egg_03", room: "room_07_forest", x: 820, y: 520 },
    { id: "egg_04", room: "room_05_house", x: 720, y: 560 },
    { id: "egg_05", room: "room_05_house", x: 1180, y: 600 }
  ])
});

// Caixas da área de créditos. As duas precisam ser abertas (sem ordem secreta).
// y = base da caixa (encosta no chão).
export const CREDITS_BOXES = Object.freeze([
  { id: "box_left", x: 1150, y: 640 },
  { id: "box_right", x: 1260, y: 640 }
]);

// Dois códigos DISTINTOS — nunca misturar (porta ≠ capivara).
export const POOL_HALL_DOOR_CODE = "321123";
export const CAPYBARA_CODE = "234567";

export const POOL_HALL_DOOR = Object.freeze({
  code: POOL_HALL_DOOR_CODE,
  codeLength: 6,
  panel: Object.freeze({ x: 1248, y: 520 }),
  door: Object.freeze({ x: 1345, y: 480, w: 110, h: 200 }),
  note: Object.freeze({
    id: "egg_area_code_note",
    room: "room_05_house",
    x: 927,
    y: 620
  })
});

export const SHADOW_WATCHER = Object.freeze({
  positions: Object.freeze([
    Object.freeze({ x: 320, y: 560 }),
    Object.freeze({ x: 980, y: 500 }),
    Object.freeze({ x: 620, y: 640 })
  ]),
  fragments: Object.freeze(["23", "45", "67"]),
  displayMs: 2000
});

export const SECRET_POOL = Object.freeze({
  roomId: "secret_pool_room",
  capybara: Object.freeze({ x: 1080, y: 580 }),
  markerSpawn: Object.freeze({ x: 1180, y: 600 }),
  whiteDoor: Object.freeze({ x: 1345, y: 420 })
});
