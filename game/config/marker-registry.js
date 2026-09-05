// Registro central de TODOS os markers do jogo.
// A ordem deste array é a ordem canônica da coleção (HUD / painéis).
// As dificuldades dos 10 primeiros formam a sequência do puzzle do medidor:
// Effortless, Easy, Medium, Why, Hard, Hard, Easy, Easy, Medium, Hard.
//
// mode:
//   touch   -> coleta por contato (padrão)
//   hidden  -> não aparece até ser revelado por um puzzle/interação
//   quest   -> só coleta quando a missão associada estiver completa
//   puzzle  -> só coleta quando o puzzle associado estiver resolvido
//   slot    -> só via slot machine (não no chão)
//
// style: variação visual do sprite (desenho à mão do PDF).
// Coordenadas: top-down — (x, y) = pés no chão walkable.
import { EXPANSION_MARKERS } from "./expansion-markers.js";

export const MARKERS = Object.freeze([
  // ---- room_09_spawn (7 + menu champion) ----
  { id: "spawn_effortless", name: "Pendulum Marker", difficulty: "Effortless", room: "room_09_spawn", x: 720, y: 500, mode: "touch", style: "pendulum" },
  { id: "spawn_easy", name: "Shy Marker", difficulty: "Easy", room: "room_09_spawn", x: 240, y: 640, mode: "touch", style: "classic" },
  { id: "spawn_medium", name: "Signpost Marker", difficulty: "Medium", room: "room_09_spawn", x: 1150, y: 580, mode: "touch", style: "classic" },
  { id: "spawn_why", name: "Why Marker", difficulty: "Why", room: "room_09_spawn", x: 140, y: 540, mode: "touch", style: "classic" },
  { id: "spawn_hard_1", name: "Roof Marker", difficulty: "Hard", room: "room_09_spawn", x: 860, y: 500, mode: "touch", style: "classic" },
  { id: "spawn_hard_2", name: "Edge Marker", difficulty: "Hard", room: "room_09_spawn", x: 1280, y: 680, mode: "touch", style: "classic" },

  // ---- room_10_credits (4) ----
  { id: "credits_easy_1", name: "Bow Marker", difficulty: "Easy", room: "room_10_credits", x: 480, y: 640, mode: "touch", style: "bow" },
  { id: "credits_easy_2", name: "Headphones Marker", difficulty: "Easy", room: "room_10_credits", x: 220, y: 600, mode: "touch", style: "headphones" },
  { id: "credits_medium", name: "Frame Marker", difficulty: "Medium", room: "room_10_credits", x: 900, y: 560, mode: "touch", style: "classic" },
  { id: "credits_box_marker", name: "This is not a marker", difficulty: "Hard", room: "room_10_credits", x: 1205, y: 620, mode: "hidden", style: "classic" },

  // Spawn Insane + Menu Champion ficam FORA dos 10 primeiros de propósito:
  // a ordem canônica 1..10 deve ser exatamente a sequência do medidor.
  { id: "spawn_insane", name: "Rooftop Marker", difficulty: "Insane", room: "room_09_spawn", x: 540, y: 480, mode: "touch", style: "classic" },
  {
    id: "menu_champion_marker",
    name: "Menu Champion Marker",
    difficulty: "Champion",
    room: "room_09_spawn",
    x: 200,
    y: 360,
    mode: "menu_champion",
    style: "menu_champion",
    hint: "Some secrets exist before the game even begins.",
    area: "Start"
  },

  // ---- room_08_orchard_difficulty (6) ----
  { id: "orchard_easy_1", name: "Picnic Marker", difficulty: "Easy", room: "room_08_orchard_difficulty", x: 180, y: 640, mode: "touch", style: "classic" },
  { id: "orchard_easy_2", name: "Neon Marker", difficulty: "Easy", room: "room_08_orchard_difficulty", x: 400, y: 520, mode: "touch", style: "neon" },
  { id: "orchard_hard_1", name: "Canopy Marker", difficulty: "Hard", room: "room_08_orchard_difficulty", x: 920, y: 500, mode: "touch", style: "classic" },
  { id: "orchard_glitch", name: "Glitch Marker", difficulty: "Difficult", room: "room_08_orchard_difficulty", x: 560, y: 480, mode: "touch", style: "glitch" },
  { id: "orchard_difficult_marker", name: "Hiding Marker", difficulty: "Challenging", room: "room_08_orchard_difficulty", x: 1050, y: 640, mode: "touch", style: "classic" },
  { id: "orchard_difficulty_final", name: "Difficulty Meter Marker", difficulty: "Hard", room: "room_08_orchard_difficulty", x: 1180, y: 680, mode: "puzzle", style: "note" },

  // ---- room_07_forest (5) ----
  { id: "forest_easy_1", name: "Slingshot Marker", difficulty: "Easy", room: "room_07_forest", x: 360, y: 620, mode: "touch", style: "classic" },
  { id: "forest_easy_2", name: "Turtle Friend Marker", difficulty: "Easy", room: "room_07_forest", x: 780, y: 600, mode: "touch", style: "classic" },
  { id: "forest_easy_3", name: "Welcome Marker", difficulty: "Easy", room: "room_07_forest", x: 560, y: 640, mode: "touch", style: "classic" },
  { id: "forest_tree_sleeper", name: "Sleepy Marker", difficulty: "Challenging", room: "room_07_forest", x: 930, y: 500, mode: "touch", style: "sleeper" },
  { id: "forest_egg_demon", name: "Egg Marker", difficulty: "Challenging", room: "room_07_forest", x: 430, y: 480, mode: "quest", style: "demon" },

  // ---- room_06_secret_computer (2) ----
  { id: "secret_insane", name: "Windows Marker", difficulty: "Insane", room: "room_06_secret_computer", x: 420, y: 540, mode: "touch", style: "window" },
  { id: "secret_why", name: "Blue Screen Marker", difficulty: "Why", room: "room_06_secret_computer", x: 980, y: 560, mode: "touch", style: "window" },

  // ---- room_04_city_casino (3) ----
  { id: "city_easy_1", name: "Worried Marker", difficulty: "Easy", room: "room_04_city_casino", x: 480, y: 640, mode: "touch", style: "worried" },
  { id: "city_easy_2", name: "Climber Marker", difficulty: "Easy", room: "room_04_city_casino", x: 220, y: 540, mode: "touch", style: "classic" },
  { id: "city_difficult", name: "High Roller Marker", difficulty: "Difficult", room: "room_04_city_casino", x: 1000, y: 500, mode: "touch", style: "classic" },

  // ---- room_02_casino_gallery (3) ----
  { id: "casino_hard_frame_1", name: "Portrait Marker", difficulty: "Hard", room: "room_02_casino_gallery", x: 270, y: 520, mode: "touch", style: "classic" },
  { id: "casino_hard_frame_2", name: "Cursed Portrait Marker", difficulty: "Hard", room: "room_02_casino_gallery", x: 640, y: 520, mode: "touch", style: "8ball" },
  { id: "casino_hard_frame_3", name: "Fancy Portrait Marker", difficulty: "Hard", room: "room_02_casino_gallery", x: 1010, y: 520, mode: "touch", style: "brick" },

  // ---- room_03_casino_pool (2) ----
  { id: "casino_8ball", name: "8-Ball Marker", difficulty: "Difficult", room: "room_03_casino_pool", x: 740, y: 500, mode: "touch", style: "8ball" },
  { id: "casino_brick", name: "Bouncer Marker", difficulty: "Challenging", room: "room_03_casino_pool", x: 1150, y: 580, mode: "touch", style: "brick" },

  // ---- room_01_market (7) ----
  { id: "market_easy_1", name: "Counter Marker", difficulty: "Easy", room: "room_01_market", x: 280, y: 580, mode: "touch", style: "classic" },
  { id: "market_easy_2", name: "Fruit Marker", difficulty: "Easy", room: "room_01_market", x: 760, y: 580, mode: "touch", style: "classic" },
  { id: "market_easy_3", name: "Fancy Hat Marker", difficulty: "Easy", room: "room_01_market", x: 480, y: 660, mode: "touch", style: "tophat" },
  { id: "market_easy_4", name: "Mouse Ears Marker", difficulty: "Easy", room: "room_01_market", x: 1020, y: 620, mode: "touch", style: "ears" },
  { id: "market_easy_5", name: "Sneaky Marker", difficulty: "Easy", room: "room_01_market", x: 1160, y: 660, mode: "touch", style: "classic" },
  { id: "market_medium", name: "Umbrella Marker", difficulty: "Medium", room: "room_01_market", x: 770, y: 500, mode: "touch", style: "classic" },
  { id: "market_insane", name: "Behind You Marker", difficulty: "Insane", room: "room_01_market", x: 120, y: 680, mode: "touch", style: "classic" },

  // ---- room_03_casino_pool (desenho: marker segurando o taco) ----
  { id: "casino_cue", name: "Pool Shark Marker", difficulty: "Challenging", room: "room_03_casino_pool", x: 380, y: 580, mode: "touch", style: "shark" },

  {
    id: "capybara_code_marker",
    name: "Capybara Code Marker",
    difficulty: "Challenging",
    room: "secret_pool_room",
    x: 1180,
    y: 600,
    mode: "capybara",
    style: "tophat",
    hint: "Two doors. Two codes. One strange capybara.",
    hintPt: "Duas portas. Dois códigos. Uma capivara estranha.",
    area: "Salão Secreto"
  },

  ...EXPANSION_MARKERS
]);

export const MARKER_BY_ID = Object.freeze(
  MARKERS.reduce((map, marker) => {
    map[marker.id] = marker;
    return map;
  }, {})
);

export const TOTAL_MARKERS = MARKERS.length;

export function markersForRoom(roomId) {
  return MARKERS.filter((marker) => marker.room === roomId);
}

export function isCollectible(marker, save) {
  if (!marker || !save) return false;
  if (save.collectedMarkerIds.includes(marker.id)) return false;
  switch (marker.mode) {
    case "hidden":
      return save.puzzleStates.creditsBoxesSolved;
    case "puzzle":
      return save.puzzleStates.difficultySolved;
    case "quest":
      return (save.discoveredEggIds || []).length >= 5;
    case "slot":
      return false;
    case "miku":
      return Boolean(save.mikuMarkerUnlocked || save.puzzleStates?.mikuPuzzleSolved);
    case "menu_champion":
      return Boolean(save.menuSecrets?.championSolved);
    case "capybara":
      return Boolean(
        save.puzzleStates?.capybaraCodeMarkerUnlocked || save.puzzleStates?.mysteriousCapybaraSolved
      );
    default:
      return true;
  }
}

export function lockedReason(marker, save) {
  switch (marker.mode) {
    case "hidden":
      return "Algo está escondido aqui…";
    case "puzzle":
      return "Resolva o medidor de dificuldade primeiro.";
    case "quest":
      return "Encontre os 5 ovos primeiro.";
    case "slot":
      return "Ganhe na slot machine do casino.";
    case "miku":
      return "Acerte o ritmo no Digital Stage primeiro.";
    case "menu_champion":
      return "Algo ainda não despertou…";
    case "capybara":
      return "Pergunte à Capivara Misteriosa.";
    default:
      return null;
  }
}
