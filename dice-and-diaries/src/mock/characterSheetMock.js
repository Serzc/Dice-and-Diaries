// Formato en que la "base de datos" devuelve un personaje
const characterDB = {
  id: 1,
  userId: 1,
  name: "Thorn Ironwood",
  classes: "Ranger/Rogue",
  species: "Half-Elf",
  background: "Outlander",
  level: 5,
  imageUrl: "/images/thorn.png",
  abilityScores: { str: 14, dex: 18, con: 13, int: 10, wis: 15, cha: 8 },
  abilityProficiencies: { str: "normal", dex: "expert", con: "proficient", int: "normal", wis: "normal", cha: "normal" },
  combat: {
    ac: 15, // calculado, pero se guarda
    initiative: 4, // calculado
    speed: 30,
    maxHp: 38,
    currentHp: 38,
    tempHp: 0,
    hitDice: { type: "d10", total: 5, remaining: 5 }
  },
  actions: [
    { id: 101, name: "Ataque furtivo", uses: { current: 1, max: 1 }, description: "Añade 3d6 al daño si tienes ventaja.", recharge: "PerTurn" },
  ],
  bonusActions: [
    { id: 201, name: "Cunning Action", uses: { current: 1, max: 1 }, description: "Dash, Disengage o Hide.", recharge: "PerTurn" },
  ],
  otherProficiencies: ["Herramientas de ladrón", "Flauta"],
  features: [
    { id: 301, name: "Favored Enemy", description: "Ventaja en Survival para rastrear enemigos elegidos.", effect: { type: "modifier", target: "skill", skill: "survival", value: "advantage" }, recharge: "SR", uses: { current: 2, max: 2 } },
  ],
  spells: {
    spellcastingAbility: "wis",
    spellcastingMod: 3,
    spellSaveDC: 13,
    slots: {
      1: { total: 3, used: 1 },
      2: { total: 2, used: 0 }
    },
    spells: [
      { id: 401, name: "Hunter's Mark", level: 1, description: "Marca un objetivo, +1d6 daño.", ritual: false, concentration: true, prepared: true, effect: { damage: "1d6", type: "psychic" } },
    ]
  },
  inventory: [
    { id: 501, name: "Espada corta", weight: 2, quantity: 1, description: "Finesse, light", equipable: true, effect: { damage: "1d6", type: "piercing" } },
    { id: 502, name: "Arco corto", weight: 2, quantity: 1, description: "Ammunition, range 80/320", equipable: true, effect: { damage: "1d6", type: "piercing" } },
  ],
  history: "Thorn creció en los bosques...",
};

const rawCharacterData = {
  id: 1,
  name: "Thorn Ironwood",
  classes: ["Ranger", "Rogue"],
  species: "Half-Elf",
  background: "Outlander",
  level: 5,
  image_url: "/images/characters/thorn.png",
  ability_scores: { str: 14, dex: 18, con: 13, int: 10, wis: 15, cha: 8 },
  proficiency_bonus: 3, // nivel 5
  proficiency_list: [
    { ability: "str", level: "proficient" },
    { ability: "dex", level: "expert" },
  ],
  save_proficiencies: ["dex", "int"], // Rogue: DEX e INT
  skill_proficiencies: [
    { skill: "acrobatics", level: "proficient" },
    { skill: "stealth", level: "expert" },
    { skill: "perception", level: "proficient" },
    { skill: "survival", level: "proficient" },
    { skill: "nature", level: "proficient" },
    { skill: "investigation", level: "proficient" },
    { skill: "sleight_of_hand", level: "expert" },
    { skill: "athletics", level: "proficient" },
  ],
  speed: 35,
  hp: { max: 38, current: 38, temp: 0 },
  hit_dice: { type: "d10", total: 5, remaining: 5 },
  inventory: [
    {
      name: "Studded Leather Armor",
      equipped: true,
      effect: { ac_bonus: 2 } // AC = 12 + dex mod (4) + 2 = 18
    }
  ],
  features: [
    {
      name: "Fighting Style: Defense",
      effect: { ac_bonus: 1 } // +1 AC
    }
    // initiative no tiene bonus extra
  ]
};


export async function fetchCharacterSheet(characterId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  // Simulamos obtener los datos de la BD
  return rawCharacterData;
  //return transformDBToUI(characterDB);
}


// Simula guardar cambios de una sección
export async function saveCharacterSection(characterId, section, data) {
  await new Promise(r => setTimeout(r, 200));
  console.log(`Guardando ${section} para ${characterId}`, data);
  return { success: true };
}

// Transformación: en este ejemplo, la DB ya está en formato UI, pero podrías ajustar.
function transformDBToUI(db) {
  // Hacemos una copia profunda y añadimos campos calculados si es necesario
  return { ...db };
}
// Ejemplos de features con distintos tipos de efectos.
// El efecto se guarda como un objeto JSON.
export const mockFeatures = [
  {
    id: 1,
    name: "Ataque Furtivo",
    description: "Una vez por turno, puedes infligir 2d6 de daño adicional a una criatura que golpees si tienes ventaja o un aliado está a 5 pies.",
    effect: {
      action: {
        attack: {
          damage: "2d6",
          type: "piercing",
          range: "melee"
        },
        recharge: "PerTurn",
        uses: { current: 1, max: 1 }
      }
    }
  },
  {
    id: 2,
    name: "Furia",
    description: "Entras en furia. Ventaja en pruebas de Fuerza y tiradas de salvación de Fuerza. +2 al daño de ataques cuerpo a cuerpo.",
    effect: {
      modifiers: {
        ability_scores: { str: 0 }, // no modifica puntuación, solo da ventaja (esto es informativo)
        ability_proficiencies: [{ ability: "str", level: "advantage" }]
      },
      recharge: "LR",
      uses: { current: 3, max: 3 }
    }
  },
  {
    id: 3,
    name: "Defensa Duelista",
    description: "Mientras sostienes un arma en una mano y ninguna otra arma, ganas +1 a la CA.",
    effect: {
      modifiers: {
        ac_bonus: 1
      }
    }
  },
  {
    id: 4,
    name: "Segundo Viento",
    description: "Recuperas 1d10 + nivel de pícaro puntos de vida.",
    effect: {
      action: {
        heal: "1d10 + @level",
        recharge: "SR",
        uses: { current: 1, max: 1 }
      }
    }
  }
];

// Simula obtención de features desde la BD
export async function fetchFeatures(characterId) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockFeatures;
}
export const mockActions = [
  {
    id: 1,
    name: "Ataque con arco largo",
    description: "Ataque a distancia con arco largo.",
    recharge: "PerTurn",
    uses: { current: 1, max: 1 },  // un uso por turno
  },
  {
    id: 2,
    name: "Golpe en la rodilla",
    description: "El enemigo debe superar una salvación de Constitución o caer derribado.",
    recharge: "SR",
    uses: { current: 1, max: 1 },
  },
  {
    id: 3,
    name: "Ráfaga de puñales",
    description: "Lanzas tres dagas a objetivos cercanos.",
    recharge: "LR",
    uses: { current: 1, max: 2 },
  }
];

export const mockBonusActions = [
  {
    id: 4,
    name: "Paso sombrío",
    description: "Te teletransportas 15 pies a un lugar que puedas ver.",
    recharge: "PerTurn",
    uses: { current: 1, max: 1 },
  },
  {
    id: 5,
    name: "Segundo viento (bonus)",
    description: "Recuperas 1d10 + nivel puntos de vida.",
    recharge: "SR",
    uses: { current: 1, max: 1 },
  }
];

export const mockOtherProficiencies = [
  "Herramientas de ladrón",
  "Juego de cartas",
  "Monturas (tierra)",
];

// Funciones para simular fetch (si se necesitan por separado)
export async function fetchActions(characterId) {
  return mockActions;
}
export async function fetchBonusActions(characterId) {
  return mockBonusActions;
}
export async function fetchOtherProficiencies(characterId) {
  return mockOtherProficiencies;
}
// --- Spellcasting y Hechizos ---

export const mockSpellcastingAbility = "wis"; // Sabiduría para un ranger/cleric, por ejemplo

export const mockSpellSlots = {
  1: { max: 4, current: 3 },
  2: { max: 3, current: 2 },
  3: { max: 2, current: 2 },
};

export const mockSpells = [
  {
    id: 101,
    name: "Curar heridas",
    description: "Una criatura que tocas recupera 1d8 + tu modificador de aptitud mágica puntos de golpe.",
    ritual: false,
    concentration: false,
    prepared: true,
    level: 1,
    effect: {
      damage: "1d8 + mod",
      type: "curación",
      range: "Toque",
      components: "V, S",
      duration: "Instantáneo",
    },
  },
  {
    id: 102,
    name: "Detectar magia",
    description: "Percibes la presencia de magia en un radio de 30 pies.",
    ritual: true,
    concentration: true,
    prepared: false,
    level: 1,
    effect: {
      range: "Personal (30 pies)",
      components: "V, S",
      duration: "Concentración, hasta 10 minutos",
    },
  },
  {
    id: 103,
    name: "Rayo abrasador",
    description: "Lanzas tres rayos de fuego a objetivos distintos.",
    ritual: false,
    concentration: false,
    prepared: true,
    level: 2,
    effect: {
      damage: "2d6",
      type: "fuego",
      range: "120 pies",
      components: "V, S",
      duration: "Instantáneo",
    },
  },
  {
    id: 104,
    name: "Forma gaseosa",
    description: "Te transformas en una nube de gas voladora.",
    ritual: false,
    concentration: true,
    prepared: false,
    level: 3,
    effect: {
      range: "Toque",
      components: "V, S, M (un poco de humo)",
      duration: "Concentración, hasta 1 hora",
    },
  },
];

export async function fetchSpellcastingData(characterId) {
  return {
    ability: mockSpellcastingAbility,
    slots: mockSpellSlots,
    spells: mockSpells,
  };
}
// --- Inventario ---
export const mockInventory = [
  {
    id: 201,
    name: "Espada larga",
    weight: 3,
    quantity: 1,
    description: "Una hoja bien equilibrada.",
    equipable: true,
    equipped: true,
    effect: {
      damage: "1d8",
      type: "cortante",
      properties: "versátil (1d10)",
    },
  },
  {
    id: 202,
    name: "Armadura de cuero tachonado",
    weight: 13,
    quantity: 1,
    description: "Tachones de metal cosidos al cuero.",
    equipable: true,
    equipped: true,
    effect: {
      ac_bonus: 2,
      stealth_disadvantage: false,
    },
  },
  {
    id: 203,
    name: "Poción de curación",
    weight: 0.5,
    quantity: 2,
    description: "Recuperas 2d4+2 puntos de vida.",
    equipable: false,
    equipped: false,
    effect: {
      heal: "2d4+2",
    },
  },
  {
    id: 204,
    name: "Kit de ladrón",
    weight: 2,
    quantity: 1,
    description: "",
    equipable: false,
    equipped: false,
    effect: null,
  },
];

export async function fetchInventory(characterId) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockInventory;
}

// --- Historia (nota automática del personaje) ---
export const mockCharacterNote = {
  id: 1,
  entity_type: "character",
  entity_id: 1,
  title: "Historia de Thorn Ironwood",
  content: "Thorn creció en los bosques... (historia del personaje).",
};

export async function fetchCharacterNote(characterId) {
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCharacterNote;
}
// Agregar después de mockCharacterNote

export const mockCharacterCampaigns = [
  { id: 1, name: "Las Minas Perdidas" },
  { id: 3, name: "La Tumba de la Aniquilación" },
];

export async function fetchCharacterCampaigns(characterId) {
  await new Promise(resolve => setTimeout(resolve, 50));
  return mockCharacterCampaigns;
}