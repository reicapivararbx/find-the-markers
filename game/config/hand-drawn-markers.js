// Markers conceituais dos desenhos à mão — segunda leva de criaturas.
// Cada conceito vira PERSONAGEM + IDENTIDADE + LOCAL + MECÂNICA + DESCOBERTA.
//
// Campos novos além do registro base:
//   behavior      -> animação/comportamento especial (marker-entity)
//   unlockKey     -> puzzleState que precisa estar true para coletar
//   questId       -> quest FIND-N associada (game/progression/quests.js)
//   secret        -> no Marker Dex, tudo vira "???" até ser encontrado
//   lockedMessage -> motivo exibido ao tentar coletar bloqueado
//   method        -> como foi encontrado (revelado no Dex após a coleta)
//   lore          -> pequena história (Dex, detalhe do marker)
//   textureSize   -> tamanho custom do canvas procedural (w x h)
//
// Raridade = dificuldade oficial existente (nenhum sistema paralelo criado).

export const HAND_DRAWN_MARKERS = Object.freeze([
  // ---- variante calma de começo de jogo: ensina que pequenas diferenças visuais importam ----
  {
    id: "lilac_marker",
    name: "Lilac Marker",
    difficulty: "Easy",
    room: "room_09_spawn",
    x: 300,
    y: 700,
    mode: "touch",
    style: "lilac",
    area: "Início",
    hint: "Do lado do Marker tímido, quase igual — mas não é.",
    hintPt: "Do lado do Marker Tímido, quase igual — mas não é.",
    lore: "Dizem que nasceu gêmeo de outro marker e nunca gostou de repetir figurino.",
    method: "Coleta direta por proximidade."
  },

  // ---- mina: superfície porosa com manchas claras (mineral/esporos) ----
  {
    id: "spotted_marker",
    name: "Speckled Marker",
    difficulty: "Medium",
    room: "room_14_mine",
    x: 620,
    y: 560,
    mode: "touch",
    style: "spotted",
    area: "Mina das Baterias",
    hint: "Cresce junto ao mineral poroso das minas.",
    hintPt: "Cresce junto ao mineral poroso das minas.",
    lore: "As manchas claras pulsam devagar quando ninguém está olhando.",
    method: "Coleta direta por proximidade, no meio dos minerais."
  },

  // ---- jardim: coberto de vegetação, camuflado ----
  {
    id: "overgrown_marker",
    name: "Overgrown Marker",
    difficulty: "Medium",
    room: "room_11_garden",
    x: 240,
    y: 560,
    mode: "touch",
    style: "overgrown",
    behavior: "camo",
    area: "Jardim Suspenso",
    hint: "Onde a floresta toma conta, ele deixou.",
    hintPt: "Onde a floresta toma conta, ele deixou.",
    lore: "Ficou tão tempo parado que a grama o adotou. Ele não reclama.",
    method: "Observação: folhas discretas denunciam a silhueta."
  },

  // ---- ruínas: esquelético, catacumba ----
  {
    id: "skeleton_marker",
    name: "Skeleton Marker",
    difficulty: "Hard",
    room: "room_16_ruins",
    x: 620,
    y: 500,
    mode: "touch",
    style: "skeleton",
    behavior: "rattle",
    area: "Ruínas Antigas",
    hint: "Guarda as ruínas com ossos que não se encaixam direito.",
    hintPt: "Guarda as ruínas com ossos que não se encaixam direito.",
    lore: "Perdeu algumas peças por aí. Se encontrar, ele agradece com a mandíbula.",
    method: "Coleta direta por proximidade nas ruínas."
  },

  // ---- cidadela: realeza ----
  {
    id: "king_marker",
    name: "King Marker",
    difficulty: "Challenging",
    room: "room_20_citadel",
    x: 640,
    y: 460,
    mode: "touch",
    style: "king",
    behavior: "glint",
    area: "Cidadela Final",
    hint: "Só um salão real merece a coroa.",
    hintPt: "Só um salão real merece a coroa.",
    lore: "Governante honorário de todos os markers. Cetro é de mentira, autoridade não.",
    method: "Coleta direta por proximidade, no salão final."
  },

  // ---- laboratório: criatura alienígena com tentáculos ----
  {
    id: "tentacle_marker",
    name: "Tentacle Marker",
    difficulty: "Insane",
    room: "room_15_lab",
    x: 620,
    y: 660,
    mode: "touch",
    style: "tentacle",
    behavior: "tentacles",
    area: "Laboratório de Runas",
    hint: "Um experimento escapou da estufa e aprendeu a observar.",
    hintPt: "Um experimento escapou da estufa e aprendeu a observar.",
    lore: "Os tentáculos anotam tudo que veem. Os olhos também.",
    method: "Coleta direta — mas ele acompanha você com o olhar."
  },

  // ---- observatório: relógio vivo, puzzle das quartas ----
  {
    id: "clock_marker",
    name: "Clock Marker",
    difficulty: "Hard",
    room: "secret_17_observatory",
    x: 620,
    y: 580,
    mode: "touch",
    unlockKey: "clockSolved",
    behavior: "clock",
    style: "clock",
    area: "Observatório",
    hint: "O mostrador dele não marca horas — marca a certa.",
    hintPt: "O mostrador dele não marca horas — marca a certa.",
    lockedMessage: "O ponteiro parou na hora errada.",
    lore: "Cada hora errada dá um tique a mais de tristeza.",
    method: "Puzzle: acerte a hora que falta no círculo dos mostradores."
  },

  // ---- laboratório: experimento de dois corpos conectados ----
  {
    id: "machine_marker",
    name: "Linked Machine Marker",
    difficulty: "Difficult",
    room: "room_15_lab",
    x: 580,
    y: 480,
    mode: "hidden",
    unlockKey: "machineSolved",
    style: "machine_link",
    textureSize: { width: 96, height: 84 },
    area: "Laboratório de Runas",
    hint: "Dois corpos, um pulso. Falta energia para acordar.",
    hintPt: "Dois corpos, um pulso. Falta energia para acordar.",
    lockedMessage: "A máquina precisa de energia.",
    lore: "Ninguém sabe qual dos dois corpos sonha pelos dois.",
    method: "Puzzle: encontre as células de energia, conecte a máquina e reacenda o pulso."
  },

  // ---- cidade: nervoso, reage à aproximação ----
  {
    id: "grumpy_marker",
    name: "Grumpy Marker",
    difficulty: "Medium",
    room: "room_04_city_casino",
    x: 820,
    y: 640,
    mode: "touch",
    unlockKey: "grumpyCalmed",
    behavior: "grumpy",
    style: "grumpy",
    area: "Cidade & Casino",
    hint: "Ele não odeia você. Só o dia inteiro.",
    hintPt: "Ele não odeia você. Só o dia inteiro.",
    lockedMessage: "Ele está irritado demais para ser colecionado.",
    lore: "Três conversas curtas foram suficientes para o melhor dos sorrisos.",
    method: "Interação: converse com ele até acalmá-lo."
  },

  // ---- mina escura: primeiro só os dentes ----
  {
    id: "toothy_marker",
    name: "Toothy Marker",
    difficulty: "Challenging",
    room: "room_14_mine",
    x: 180,
    y: 660,
    mode: "touch",
    style: "toothy",
    behavior: "disguise",
    area: "Mina das Baterias",
    hint: "No escuro da mina, só o sorriso aparece.",
    hintPt: "No escuro da mina, só o sorriso aparece.",
    lore: "O sorriso é enorme porque no escuro é a única parte que os amigos reconhecem.",
    method: "Observação: aproxime-se do sorriso no escuro."
  },

  // ---- casino: mágico/apresentador ----
  {
    id: "magician_marker",
    name: "Magician Marker",
    difficulty: "Easy",
    room: "room_02_casino_gallery",
    x: 450,
    y: 640,
    mode: "touch",
    style: "magician",
    behavior: "hat_trick",
    area: "Galeria do Casino",
    hint: "A galeria tem um apresentador de cartola.",
    hintPt: "A galeria tem um apresentador de cartola.",
    lore: "O truque favorito dele é sumir com fichas alheias e devolver em elogios.",
    method: "Coleta direta por proximidade, na galeria."
  },

  // ---- fábrica: trabalhador com martelo ----
  {
    id: "hammer_marker",
    name: "Builder Marker",
    difficulty: "Medium",
    room: "room_13_factory",
    x: 560,
    y: 560,
    mode: "touch",
    style: "hammer",
    behavior: "work",
    area: "Fábrica Enferrujada",
    hint: "Alguém precisa manter a fábrica de pé.",
    hintPt: "Alguém precisa manter a fábrica de pé.",
    lore: "Bate no turno, no metal e no ponto. Nunca para.",
    method: "Coleta direta por proximidade, no meio do expediente."
  },

  // ---- pomar: caótico com símbolos ----
  {
    id: "chaos_marker",
    name: "Chaotic Marker",
    difficulty: "Difficult",
    room: "room_08_orchard_difficulty",
    x: 760,
    y: 640,
    mode: "touch",
    style: "chaos",
    behavior: "chaos",
    area: "Pomar do Medidor",
    hint: "Símbolos girando ao redor denunciam o caos.",
    hintPt: "Símbolos girando ao redor denunciam o caos.",
    lore: "Organizou uma fila uma vez. Os símbolos nunca perdoaram.",
    method: "Coleta direta por proximidade, seguindo os símbolos."
  },

  // ---- minigame de futebol: 3 alvos + gol ----
  {
    id: "soccer_marker",
    name: "Striker Marker",
    difficulty: "Medium",
    room: "room_09_spawn",
    x: 1040,
    y: 600,
    mode: "touch",
    unlockKey: "soccerSolved",
    style: "soccer",
    area: "Início",
    hint: "Um campinho improvisado perto da borda leste.",
    hintPt: "Um campinho improvisado perto da borda leste.",
    lockedMessage: "Vença o desafio de futebol primeiro.",
    lore: "Só aparece para quem acerta os três alvos e ainda faz o gol.",
    method: "Minigame: acerte 3 alvos com a bola e marque o gol."
  },

  // ---- minigame de baseball: rebater por tempo ----
  {
    id: "baseball_marker",
    name: "Batter Marker",
    difficulty: "Hard",
    room: "room_01_market",
    x: 650,
    y: 690,
    mode: "touch",
    unlockKey: "baseballSolved",
    style: "baseball",
    area: "Feira",
    hint: "Na feira, uma rebatida vale mais que mil regateias.",
    hintPt: "Na feira, uma rebatida vale mais que mil regateias.",
    lockedMessage: "Acerte 3 rebatidas primeiro.",
    lore: "Concentração de campeão, timing de feira.",
    method: "Minigame: rebata 3 arremessos no tempo certo."
  },

  // ---- digital stage: boné vermelho/azul com microfone ----
  {
    id: "cap_mic_marker",
    name: "Champion Cap Marker",
    difficulty: "Challenging",
    room: "secret_digital_stage",
    x: 560,
    y: 560,
    mode: "touch",
    style: "cap_mic",
    area: "Digital Stage",
    hint: "No palco, todo grande show precisa de um apresentador.",
    hintPt: "No palco, todo grande show precisa de um apresentador.",
    lore: "Canta desafinado, mas apresenta como ninguém.",
    method: "Coleta direta por proximidade, no palco."
  },

  // ---- casino: marker do dinheiro (economia interna, apenas Coins) ----
  {
    id: "money_marker",
    name: "Money Marker",
    difficulty: "Hard",
    room: "room_02_casino_gallery",
    x: 560,
    y: 560,
    mode: "touch",
    questId: "quest_hidden_coins",
    style: "money",
    area: "Galeria do Casino",
    hint: "Guarda as moedas de quem guarda as moedas.",
    hintPt: "Guarda as moedas de quem guarda as moedas.",
    lockedMessage: "Encontre as 3 moedas escondidas do casino.",
    lore: "Aceita apenas Coins do Find the Markers. Nada de moeda de outro mundo.",
    method: "Coleta: encontre as 3 moedas escondidas da galeria."
  },

  // ---- casa: fantasma/bruxo flutuante ----
  {
    id: "phantom_marker",
    name: "Phantom Marker",
    difficulty: "Difficult",
    room: "room_05_house",
    x: 1050,
    y: 580,
    mode: "touch",
    style: "phantom",
    behavior: "float",
    area: "Casa na Mata",
    hint: "A casa velha tem uma inquilina sem peso.",
    hintPt: "A casa velha tem uma inquilina sem peso.",
    lore: "Atravessa paredes por diversão, nunca por vingança.",
    method: "Coleta direta por proximidade, na casa assombrada."
  },

  // ---- sala das sombras: recompensa da quest sombria (3 entidades) ----
  {
    id: "shadow_marker",
    name: "Shade Marker",
    difficulty: "Insane",
    room: "secret_pool_room",
    x: 420,
    y: 620,
    mode: "hidden",
    questId: "quest_umbra_shards",
    style: "shadow_creature",
    behavior: "shifty",
    secret: true,
    area: "Sala das Sombras",
    hint: "...",
    hintPt: "...",
    lockedMessage: "…",
    lore: "Primeiro você vê os olhos. Depois, entende que ele viu você primeiro.",
    method: "Segredo: reúna as três manifestações sombrias espalhadas pelo mundo."
  },

  // ---- tumba: boca predadora ----
  {
    id: "maw_marker",
    name: "Maw Marker",
    difficulty: "Insane",
    room: "secret_16_tomb",
    x: 560,
    y: 640,
    mode: "touch",
    style: "maw",
    behavior: "maw",
    area: "Tumba Esquecida",
    hint: "Na tumba, algo mastiga devagar.",
    hintPt: "Na tumba, algo mastiga devagar.",
    lore: "Mastiga segredos antigos. Nunca engole — só saboreia.",
    method: "Coleta direta por proximidade, sem fazer barulho."
  },

  // ---- cidade: parece um prédio até você chegar perto ----
  {
    id: "building_marker",
    name: "Tower Block Marker",
    difficulty: "Medium",
    room: "room_04_city_casino",
    x: 1150,
    y: 640,
    mode: "touch",
    style: "building",
    behavior: "disguise",
    textureSize: { width: 64, height: 110 },
    area: "Cidade & Casino",
    hint: "Um dos prédios da cidade tem janelas acesas demais.",
    hintPt: "Um dos prédios da cidade tem janelas acesas demais.",
    lore: "Moradores juram que ele apareceu depois das placas de obra.",
    method: "Observação: o prédio errado revela olhos quando você chega perto."
  },

  // ---- ruínas: pirâmide ----
  {
    id: "pyramid_marker",
    name: "Pyramid Marker",
    difficulty: "Medium",
    room: "room_16_ruins",
    x: 840,
    y: 660,
    mode: "touch",
    style: "pyramid",
    area: "Ruínas Antigas",
    hint: "Triângulo entre ruínas quadradas.",
    hintPt: "Triângulo entre ruínas quadradas.",
    lore: "Insiste que pirâmides são só markers que aprenderam a meditar.",
    method: "Coleta direta por proximidade, nas ruínas."
  },

  // ---- porto: dentes monstruosos (predador, diferente do cômico roxo) ----
  {
    id: "fang_marker",
    name: "Fang Marker",
    difficulty: "Difficult",
    room: "room_12_harbor",
    x: 560,
    y: 700,
    mode: "touch",
    style: "fang",
    behavior: "maw",
    area: "Porto das Válvulas",
    hint: "Entre as ondas do porto, algo range os dentes.",
    hintPt: "Entre as ondas do porto, algo range os dentes.",
    lore: "O sorriso é predatório; a personalidade é de quem pede desculpa demais.",
    method: "Coleta direta por proximidade, entre as ondas."
  },

  // ---- cofre: disfarçado de caixa/prop ----
  {
    id: "crate_marker",
    name: "Crate Marker",
    difficulty: "Medium",
    room: "room_18_vault",
    x: 460,
    y: 520,
    mode: "touch",
    style: "crate",
    behavior: "disguise",
    area: "Cofre Firewall",
    hint: "Uma das caixas do cofre não pertence ao inventário.",
    hintPt: "Uma das caixas do cofre não pertence ao inventário.",
    lore: "Símbolo roxo na frente: garantia de fábrica de que é alguém, não algo.",
    method: "Observação: a caixa fora do lugar revela olhos."
  },

  // ---- servidor: torre corrompida, guardiã recompensa de fragmentos ----
  {
    id: "corrupted_tower_marker",
    name: "Corrupted Tower Marker",
    difficulty: "Insane",
    room: "secret_15_server",
    x: 520,
    y: 580,
    mode: "hidden",
    questId: "quest_glitch_fragments",
    style: "corrupted_tower",
    behavior: "corrupt",
    textureSize: { width: 60, height: 150 },
    secret: true,
    area: "Sala de Servidores",
    hint: "...",
    hintPt: "...",
    lockedMessage: "…",
    lore: "Cresceu um andar por fragmento perdido. Não pergunte o que há no topo.",
    method: "Segredo: reúna os fragmentos de glitch no laboratório."
  },

  // ---- fábrica: experimento mecânico com sequência de ativação ----
  {
    id: "mech_marker",
    name: "Mech Marker",
    difficulty: "Hard",
    room: "room_13_factory",
    x: 760,
    y: 620,
    mode: "touch",
    unlockKey: "mechSolved",
    style: "mech_yellow",
    textureSize: { width: 60, height: 112 },
    area: "Fábrica Enferrujada",
    hint: "Uma máquina adormecida espera componentes e coragem.",
    hintPt: "Uma máquina adormecida espera componentes e coragem.",
    lockedMessage: "A máquina adormecida precisa ser ativada.",
    lore: "Depois de ligado, só desliga para dormir. Direito trabalhista de markers.",
    method: "Puzzle: encontre os componentes, ative o terminal e acorde a máquina."
  },

  // ---- floresta: praticamente invisível, pistas ambientais ----
  {
    id: "invisible_marker",
    name: "Invisible Marker",
    difficulty: "Insane",
    room: "room_07_forest",
    x: 200,
    y: 460,
    mode: "touch",
    style: "invisible",
    behavior: "invisible",
    secret: true,
    area: "Floresta",
    hint: "...",
    hintPt: "...",
    lockedMessage: "…",
    lore: "Não é invisível. Só muito educado: não gosta de atrapalhar a paisagem.",
    method: "Segredo: pegadas, distorção e som denunciam onde ele caminha."
  },

  // ---- recompensa da quest dos 5 vestígios (tom cartunesco, sem gore) ----
  {
    id: "red_blade_marker",
    name: "Crimson Blade Marker",
    difficulty: "Astonishing",
    room: "room_05_house",
    x: 1200,
    y: 700,
    mode: "hidden",
    questId: "quest_broken_remains",
    style: "crimson_blade",
    secret: true,
    area: "Casa na Mata",
    hint: "...",
    hintPt: "...",
    lockedMessage: "…",
    lore: "Coleciona manequins quebrados porque odeia ver marker falsificado largado.",
    method: "Segredo: encontre os 5 vestígios de markers falsos espalhados pelo mundo."
  }
]);

// ---------------------------------------------------------------------------
// QUESTS reutilizáveis (FIND N OBJECTS) — um único sistema para todas.
// discreet: UI discreta "??? 0/3" (não revela a recompensa).
// ---------------------------------------------------------------------------
export const HAND_DRAWN_QUESTS = Object.freeze([
  {
    id: "quest_umbra_shards",
    title: "Manifestações Sombrias",
    type: "find",
    discreet: true,
    targetCount: 3,
    lockedMessage: "Algo sombrio ainda está espalhado pelo mundo.",
    items: [
      { id: "umbra_shard_1", room: "room_07_forest", x: 200, y: 700, variant: "shard" },
      { id: "umbra_shard_2", room: "room_05_house", x: 300, y: 700, variant: "shard" },
      { id: "umbra_shard_3", room: "room_04_city_casino", x: 1240, y: 700, variant: "shard" }
    ],
    rewardMarkerId: "shadow_marker"
  },
  {
    id: "quest_broken_remains",
    title: "Vestígios de Markers Falsos",
    type: "find",
    discreet: true,
    targetCount: 5,
    lockedMessage: "Restos cartunescos de markers falsos ainda estão por aí.",
    items: [
      { id: "broken_remains_1", room: "room_01_market", x: 900, y: 700, variant: "remains" },
      { id: "broken_remains_2", room: "room_08_orchard_difficulty", x: 300, y: 580, variant: "remains" },
      { id: "broken_remains_3", room: "room_04_city_casino", x: 700, y: 560, variant: "remains" },
      { id: "broken_remains_4", room: "room_07_forest", x: 640, y: 740, variant: "remains" },
      { id: "broken_remains_5", room: "room_11_garden", x: 1140, y: 440, variant: "remains" }
    ],
    rewardMarkerId: "red_blade_marker"
  },
  {
    id: "quest_energy_cells",
    title: "Células de Energia",
    type: "find",
    discreet: false,
    targetCount: 3,
    lockedMessage: "Faltam células de energia para a máquina.",
    items: [
      { id: "energy_cell_1", room: "room_15_lab", x: 200, y: 700, variant: "cell" },
      { id: "energy_cell_2", room: "room_15_lab", x: 620, y: 740, variant: "cell" },
      { id: "energy_cell_3", room: "room_15_lab", x: 1240, y: 700, variant: "cell" }
    ],
    rewardMarkerId: null // a máquina é ativada por interação após as células
  },
  {
    id: "quest_hidden_coins",
    title: "Moedas Escondidas do Casino",
    type: "find",
    discreet: false,
    targetCount: 3,
    lockedMessage: "Encontre as 3 moedas escondidas do casino.",
    items: [
      { id: "hidden_coin_1", room: "room_02_casino_gallery", x: 180, y: 700, variant: "coin" },
      { id: "hidden_coin_2", room: "room_02_casino_gallery", x: 760, y: 720, variant: "coin" },
      { id: "hidden_coin_3", room: "room_02_casino_gallery", x: 1120, y: 660, variant: "coin" }
    ],
    rewardMarkerId: "money_marker"
  },
  {
    id: "quest_glitch_fragments",
    title: "Fragmentos de Glitch",
    type: "find",
    discreet: true,
    targetCount: 3,
    lockedMessage: "Fragmentos de glitch ainda flutuam pelo laboratório.",
    items: [
      { id: "glitch_fragment_1", room: "room_15_lab", x: 460, y: 640, variant: "shard" },
      { id: "glitch_fragment_2", room: "room_15_lab", x: 860, y: 660, variant: "shard" },
      { id: "glitch_fragment_3", room: "room_15_lab", x: 1240, y: 430, variant: "shard" }
    ],
    rewardMarkerId: "corrupted_tower_marker"
  },
  {
    id: "quest_mech_components",
    title: "Componentes da Máquina",
    type: "find",
    discreet: false,
    targetCount: 2,
    lockedMessage: "Encontre os componentes da máquina adormecida.",
    items: [
      { id: "mech_component_1", room: "room_13_factory", x: 140, y: 660, variant: "cell" },
      { id: "mech_component_2", room: "room_13_factory", x: 1100, y: 660, variant: "cell" }
    ],
    rewardMarkerId: null // terminal ativa o mech após os componentes
  }
]);

export const QUEST_BY_ID = Object.freeze(
  HAND_DRAWN_QUESTS.reduce((map, quest) => {
    map[quest.id] = quest;
    return map;
  }, {})
);

export function questRewardMarkerIds() {
  return HAND_DRAWN_QUESTS.map((q) => q.rewardMarkerId).filter(Boolean);
}

// Pequena lore por área (Dex — página de área). Apenas áreas com conteúdo novo.
export const AREA_LORE = Object.freeze({
  room_09_spawn: "O começo de tudo — e, dizem, um campinho onde tudo começou a rolar.",
  room_14_mine: "As baterias dormem no escuro; algumas coisas sorriem no escuro também.",
  room_11_garden: "Suspenso entre nuvens, o jardim adota quem fica parado tempo demais.",
  room_16_ruins: "Colunas antigos guardam segredos de mandíbula frouxa.",
  room_20_citadel: "O salão final tem trono, coroa e um rei de plástico claro.",
  room_15_lab: "Experimentos aqui aprendem rápido demais.",
  secret_17_observatory: "O telescópio aponta para o tempo, não para as estrelas.",
  room_04_city_casino: "Nem todo prédio da cidade é um prédio.",
  room_02_casino_gallery: "Retratos, cartolas e moedas escondidas.",
  room_13_factory: "A fábrica nunca dorme — e agora tem um vigia mecânico.",
  room_08_orchard_difficulty: "O pomar mede sua paciência em símbolos girando.",
  room_01_market: "Entre barracas, alguém pratica rebatidas.",
  secret_digital_stage: "Todo palco precisa de um apresentador de boné.",
  room_05_house: "A casa velha tem inquilinos sem peso e colecionador de manequins.",
  secret_pool_room: "Na sala das sombras, os olhos chegam antes do corpo.",
  secret_16_tomb: "Algo mastiga segredos aqui, devagarinho.",
  room_12_harbor: "As ondas do porto às vezes range dentes.",
  room_18_vault: "Cuidado: nem toda caixa do cofre está no inventário.",
  secret_15_server: "Os servidores cresceram — um andar por fragmento perdido.",
  room_07_forest: "A floresta esconde até o que não se vê."
});
