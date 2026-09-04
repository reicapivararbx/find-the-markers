const DIFFS = Object.freeze([
  "Effortless",
  "Easy",
  "Medium",
  "Hard",
  "Difficult",
  "Challenging",
  "Insane",
  "Why",
  "Astonishing",
  "NOT!",
  "Champion",
  "Finale"
]);

const STYLES = Object.freeze([
  "classic",
  "neon",
  "glitch",
  "bow",
  "headphones",
  "tophat",
  "ears",
  "worried",
  "sleeper",
  "demon",
  "window",
  "8ball",
  "brick",
  "shark",
  "note",
  "moss",
  "vine",
  "bloom",
  "trellis",
  "pond",
  "bee",
  "lantern",
  "root",
  "petal",
  "greenhouse",
  "crystal",
  "sewer",
  "ice",
  "neon_emit",
  "null_void",
  "anchor",
  "buoy",
  "crane",
  "dock",
  "foghorn",
  "net",
  "pier",
  "rope",
  "sail",
  "tide",
  "bolt",
  "cog",
  "conveyor",
  "gear",
  "oil",
  "pipe",
  "press",
  "rust",
  "smokestack",
  "wrench",
  "cart",
  "coal",
  "dynamite",
  "helmet",
  "ore",
  "pickaxe",
  "rail",
  "shaft"
]);

const GARDEN_STYLES = Object.freeze([
  "moss",
  "vine",
  "bloom",
  "trellis",
  "pond",
  "bee",
  "lantern",
  "root",
  "petal",
  "greenhouse"
]);

const GARDEN_LAYOUT = Object.freeze([
  { x: 180, y: 420 },
  { x: 340, y: 620 },
  { x: 520, y: 380 },
  { x: 680, y: 680 },
  { x: 860, y: 500 },
  { x: 1040, y: 360 },
  { x: 1180, y: 640 },
  { x: 420, y: 720 },
  { x: 960, y: 720 },
  { x: 1280, y: 480 }
]);

const HARBOR_STYLES = Object.freeze([
  "anchor",
  "buoy",
  "crane",
  "dock",
  "foghorn",
  "net",
  "pier",
  "rope",
  "sail",
  "tide"
]);

const HARBOR_LAYOUT = Object.freeze([
  { x: 160, y: 480 },
  { x: 320, y: 680 },
  { x: 480, y: 400 },
  { x: 640, y: 620 },
  { x: 800, y: 360 },
  { x: 940, y: 700 },
  { x: 1080, y: 480 },
  { x: 1220, y: 640 },
  { x: 400, y: 540 },
  { x: 1280, y: 400 }
]);

const FACTORY_STYLES = Object.freeze([
  "bolt",
  "cog",
  "conveyor",
  "gear",
  "oil",
  "pipe",
  "press",
  "rust",
  "smokestack",
  "wrench"
]);

const FACTORY_LAYOUT = Object.freeze([
  { x: 180, y: 400 },
  { x: 360, y: 640 },
  { x: 520, y: 360 },
  { x: 680, y: 700 },
  { x: 840, y: 420 },
  { x: 980, y: 620 },
  { x: 1120, y: 380 },
  { x: 1260, y: 560 },
  { x: 300, y: 520 },
  { x: 720, y: 500 }
]);

const MINE_STYLES = Object.freeze([
  "cart",
  "coal",
  "crystal",
  "dynamite",
  "helmet",
  "lantern",
  "ore",
  "pickaxe",
  "rail",
  "shaft"
]);

const MINE_LAYOUT = Object.freeze([
  { x: 200, y: 420 },
  { x: 380, y: 680 },
  { x: 540, y: 360 },
  { x: 700, y: 640 },
  { x: 860, y: 400 },
  { x: 1000, y: 720 },
  { x: 1140, y: 480 },
  { x: 1280, y: 600 },
  { x: 320, y: 540 },
  { x: 920, y: 540 }
]);

const AREA_SPECS = Object.freeze([
  {
    room: "room_11_garden",
    prefix: "garden",
    names: [
      "Moss Marker",
      "Vine Marker",
      "Bloom Marker",
      "Trellis Marker",
      "Pond Marker",
      "Bee Marker",
      "Lantern Marker",
      "Root Marker",
      "Petal Marker",
      "Greenhouse Marker"
    ],
    count: 10,
    styles: GARDEN_STYLES,
    layout: GARDEN_LAYOUT
  },
  {
    room: "room_12_harbor",
    prefix: "harbor",
    names: [
      "Anchor Marker",
      "Buoy Marker",
      "Crane Marker",
      "Dock Marker",
      "Foghorn Marker",
      "Net Marker",
      "Pier Marker",
      "Rope Marker",
      "Sail Marker",
      "Tide Marker"
    ],
    count: 10,
    styles: HARBOR_STYLES,
    layout: HARBOR_LAYOUT
  },
  {
    room: "room_13_factory",
    prefix: "factory",
    names: [
      "Bolt Marker",
      "Cog Marker",
      "Conveyor Marker",
      "Gear Marker",
      "Oil Marker",
      "Pipe Marker",
      "Press Marker",
      "Rust Marker",
      "Smokestack Marker",
      "Wrench Marker"
    ],
    count: 10,
    styles: FACTORY_STYLES,
    layout: FACTORY_LAYOUT
  },
  {
    room: "room_14_mine",
    prefix: "mine",
    names: [
      "Cart Marker",
      "Coal Marker",
      "Crystal Marker",
      "Dynamite Marker",
      "Helmet Marker",
      "Lantern Mine Marker",
      "Ore Marker",
      "Pickaxe Marker",
      "Rail Marker",
      "Shaft Marker"
    ],
    count: 10,
    styles: MINE_STYLES,
    layout: MINE_LAYOUT
  },
  {
    room: "room_15_lab",
    prefix: "lab",
    names: [
      "Beaker Marker",
      "Circuit Marker",
      "Clone Marker",
      "Laser Marker",
      "Microscope Marker",
      "Petri Marker",
      "Plasma Marker",
      "Sample Marker",
      "Scope Marker",
      "Test Tube Marker"
    ],
    count: 10
  },
  {
    room: "room_16_ruins",
    prefix: "ruins",
    names: [
      "Arch Marker",
      "Column Marker",
      "Glyph Marker",
      "Idol Marker",
      "Mosaic Marker",
      "Obelisk Marker",
      "Relic Marker",
      "Sand Marker",
      "Scroll Marker",
      "Statue Marker"
    ],
    count: 10
  },
  {
    room: "room_17_peak",
    prefix: "peak",
    names: [
      "Avalanche Marker",
      "Cliff Marker",
      "Flag Marker",
      "Frost Marker",
      "Glacier Marker",
      "Ice Marker",
      "Summit Marker",
      "Wind Marker",
      "Yeti Marker",
      "Zenith Marker"
    ],
    count: 10
  },
  {
    room: "room_18_vault",
    prefix: "vault",
    names: [
      "Barcode Marker",
      "Cipher Marker",
      "Gold Bar Marker",
      "Keycard Marker",
      "Ledger Marker",
      "Lockbox Marker",
      "Safe Marker",
      "Seal Stamp Marker",
      "Vault Door Marker",
      "Wire Marker"
    ],
    count: 10
  },
  {
    room: "room_19_citadel_gate",
    prefix: "gate",
    names: [
      "Banner Marker",
      "Barricade Marker",
      "Drawbridge Marker",
      "Guard Marker",
      "Herald Marker",
      "Moat Marker",
      "Portcullis Marker",
      "Rampart Marker",
      "Shield Marker",
      "Watchtower Marker"
    ],
    count: 10
  },
  {
    room: "room_20_citadel",
    prefix: "citadel",
    names: [
      "Crown Marker",
      "Throne Marker",
      "Scepter Marker",
      "Banner Royal Marker",
      "Knight Marker",
      "Oracle Marker",
      "Spire Marker",
      "Legacy Marker",
      "Finale Marker",
      "Champion Seal Marker"
    ],
    count: 10
  }
]);

const SECRET_SPECS = Object.freeze([
  { room: "secret_11_greenhouse", id: "secret_greenhouse", name: "Orchid Marker", difficulty: "Challenging" },
  { room: "secret_12_lighthouse", id: "secret_lighthouse", name: "Beacon Marker", difficulty: "Difficult" },
  { room: "secret_13_boiler", id: "secret_boiler", name: "Steam Marker", difficulty: "Hard" },
  { room: "secret_14_crystal", id: "secret_crystal", name: "Prism Marker", difficulty: "Insane" },
  { room: "secret_15_server", id: "secret_server", name: "Packet Marker", difficulty: "Why" },
  { room: "secret_16_tomb", id: "secret_tomb", name: "Mummy Marker", difficulty: "Astonishing" },
  { room: "secret_17_observatory", id: "secret_observatory", name: "Star Chart Marker", difficulty: "Champion" },
  { room: "secret_18_safe", id: "secret_safe", name: "Combination Marker", difficulty: "NOT!" },
  { room: "secret_19_armory", id: "secret_armory", name: "Blade Marker", difficulty: "Challenging" },
  { room: "secret_20_throne", id: "secret_throne", name: "Hidden Crown Marker", difficulty: "Finale" },
  { room: "secret_backrooms", id: "secret_backrooms_m", name: "Yellow Room Marker", difficulty: "Why" },
  { room: "secret_developer", id: "secret_dev_m", name: "Debug Marker", difficulty: "NOT!" }
]);

function layoutPoint(index, total) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  const x = 220 + col * 240 + (row % 2) * 40;
  const y = 480 + row * 120;
  return { x: Math.min(1280, x), y: Math.min(720, y) };
}

function buildAreaMarkers() {
  const out = [];
  for (const spec of AREA_SPECS) {
    for (let i = 0; i < spec.count; i += 1) {
      const pos = spec.layout?.[i] || layoutPoint(i, spec.count);
      const styleList = spec.styles || STYLES;
      out.push({
        id: `${spec.prefix}_${String(i + 1).padStart(2, "0")}`,
        name: spec.names[i] || `${spec.prefix} Marker ${i + 1}`,
        difficulty: DIFFS[i % DIFFS.length],
        room: spec.room,
        x: pos.x,
        y: pos.y,
        mode: "touch",
        style: styleList[i % styleList.length]
      });
    }
  }
  return out;
}

function buildSecretMarkers() {
  return SECRET_SPECS.map((spec, i) => ({
    id: spec.id,
    name: spec.name,
    difficulty: spec.difficulty,
    room: spec.room,
    x: 720 + (i % 3) * 20,
    y: 560,
    mode: "touch",
    style: STYLES[(i + 3) % STYLES.length]
  }));
}

export const EXPANSION_MARKERS = Object.freeze([
  ...buildAreaMarkers(),
  ...buildSecretMarkers(),
  {
    id: "jackpot_marker",
    name: "Jackpot Marker",
    difficulty: "Insane",
    room: "room_02_casino_gallery",
    x: 720,
    y: 640,
    mode: "slot",
    style: "neon"
  },
  {
    id: "high_roller_marker",
    name: "High Roller 10 Coins",
    difficulty: "Challenging",
    room: "room_02_casino_gallery",
    x: 860,
    y: 640,
    mode: "slot",
    style: "8ball"
  },
  {
    id: "hatsune_miku_marker",
    name: "Hatsune Miku Marker",
    difficulty: "Challenging",
    room: "secret_digital_stage",
    x: 720,
    y: 400,
    mode: "miku",
    style: "miku"
  }
]);

export const MUSIC_NOTE_DEFS = Object.freeze([
  { id: "music_note_1", room: "room_04_city_casino", x: 180, y: 520 },
  { id: "music_note_2", room: "room_04_city_casino", x: 520, y: 680 },
  { id: "music_note_3", room: "room_04_city_casino", x: 780, y: 560 },
  { id: "music_note_4", room: "room_04_city_casino", x: 1100, y: 640 },
  { id: "music_note_5", room: "room_04_city_casino", x: 1320, y: 520 }
]);

export const COIN_DEFS = Object.freeze([
  { id: "coin_garden_01", room: "room_11_garden", x: 260, y: 540 },
  { id: "coin_garden_02", room: "room_11_garden", x: 620, y: 460 },
  { id: "coin_garden_03", room: "room_11_garden", x: 980, y: 580 },
  { id: "coin_garden_04", room: "room_11_garden", x: 1120, y: 720 },
  { id: "coin_harbor_01", room: "room_12_harbor", x: 220, y: 560 },
  { id: "coin_harbor_02", room: "room_12_harbor", x: 560, y: 720 },
  { id: "coin_harbor_03", room: "room_12_harbor", x: 900, y: 440 },
  { id: "coin_harbor_04", room: "room_12_harbor", x: 1180, y: 680 },
  { id: "coin_factory_01", room: "room_13_factory", x: 240, y: 480 },
  { id: "coin_factory_02", room: "room_13_factory", x: 580, y: 700 },
  { id: "coin_factory_03", room: "room_13_factory", x: 920, y: 400 },
  { id: "coin_factory_04", room: "room_13_factory", x: 1200, y: 620 },
  { id: "coin_mine_01", room: "room_14_mine", x: 260, y: 500 },
  { id: "coin_mine_02", room: "room_14_mine", x: 600, y: 700 },
  { id: "coin_mine_03", room: "room_14_mine", x: 940, y: 380 },
  { id: "coin_mine_04", room: "room_14_mine", x: 1220, y: 640 },
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `coin_lab_${String(i + 1).padStart(2, "0")}`,
    room: "room_15_lab",
    x: 320 + i * 220,
    y: 700
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `coin_ruins_${String(i + 1).padStart(2, "0")}`,
    room: "room_16_ruins",
    x: 340 + i * 280,
    y: 690
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `coin_peak_${String(i + 1).padStart(2, "0")}`,
    room: "room_17_peak",
    x: 360 + i * 260,
    y: 700
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `coin_vault_${String(i + 1).padStart(2, "0")}`,
    room: "room_18_vault",
    x: 380 + i * 250,
    y: 690
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `coin_gate_${String(i + 1).padStart(2, "0")}`,
    room: "room_19_citadel_gate",
    x: 300 + i * 220,
    y: 700
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `coin_citadel_${String(i + 1).padStart(2, "0")}`,
    room: "room_20_citadel",
    x: 280 + i * 240,
    y: 690
  }))
]);
