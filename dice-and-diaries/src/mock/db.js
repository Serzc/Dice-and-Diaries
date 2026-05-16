// ========================
// src/mock/db.js
// Single source of truth for all mock data.
// Function signatures match what a real API layer would expose.
// To connect a real DB: replace implementations while keeping all exported signatures.
// ========================

const _sim = (ms = 150) => new Promise(r => setTimeout(r, ms));
const _clone = obj => JSON.parse(JSON.stringify(obj));

// ============ CURRENT USER ============
let CURRENT_USER_ID = 1;
export function getCurrentUserId() { return CURRENT_USER_ID; }

// Called by AuthContext after login/logout to keep mock in sync
export function setCurrentUser({ id, isGM }) {
  CURRENT_USER_ID = id ?? 1;
  currentUser.id  = CURRENT_USER_ID;
  // If isGM not stored in session, fall back to user record
  currentUser.isGM = isGM !== undefined ? isGM : (_users[CURRENT_USER_ID]?.isGM ?? false);
}

// ============ USERS ============
const _users = {
  1:  { id: 1,  username: "GM_Dave",       displayName: "David García",     email: "david@example.com",   bio: "Game Master apasionado por la narrativa y los mundos de fantasía. Llevo 5 años dirigiendo campañas.", avatarUrl: null, joinedAt: "2024-08-01",  password: "gm123",   isGM: true },
  2:  { id: 2,  username: "Player_Anna",   displayName: "Ana Martínez",     email: "anna@example.com",    bio: "Jugadora entusiasta de D&D desde hace 3 años.",  avatarUrl: null, joinedAt: "2024-09-15", password: "anna123"  },
  3:  { id: 3,  username: "Player_Ben",    displayName: "Benjamín Torres",  email: "ben@example.com",     bio: "",                                               avatarUrl: null, joinedAt: "2025-01-03", password: "ben123"   },
  4:  { id: 4,  username: "Player_Cris",   displayName: "Cristina López",   email: "cris@example.com",    bio: "",                                               avatarUrl: null, joinedAt: "2025-02-11", password: "cris123"  },
  5:  { id: 5,  username: "Player_Dan",    displayName: "Daniel Rojas",     email: "dan@example.com",     bio: "",                                               avatarUrl: null, joinedAt: "2025-03-20", password: "dan123"   },
  6:  { id: 6,  username: "Player_Elena",  displayName: "Elena Vega",       email: "elena@example.com",   bio: "",                                               avatarUrl: null, joinedAt: "2025-04-05", password: "elena123" },
  7:  { id: 7,  username: "Player_Felipe", displayName: "Felipe Mora",      email: "felipe@example.com",  bio: "",                                               avatarUrl: null, joinedAt: "2025-05-01", password: "felipe123"},
  8:  { id: 8,  username: "Player_Gabi",   displayName: "Gabriela Ruiz",    email: "gabi@example.com",    bio: "",                                               avatarUrl: null, joinedAt: "2025-05-15", password: "gabi123"  },
  9:  { id: 9,  username: "Player_Hugo",   displayName: "Hugo Sánchez",     email: "hugo@example.com",    bio: "",                                               avatarUrl: null, joinedAt: "2025-06-01", password: "hugo123"  },
  10: { id: 10, username: "Player_Iris",   displayName: "Iris Delgado",     email: "iris@example.com",    bio: "",                                               avatarUrl: null, joinedAt: "2025-06-10", password: "iris123"  },
};

// ============ CAMPAIGNS ============
let _campaigns = [
  { id: 1, name: "Campaña 1: Las Minas Perdidas",          ownerId: 1, active: true,  imageUrl: null, inviteCode: "MINE01" },
  { id: 2, name: "Campaña 2: La Maldición de Strahd",      ownerId: 1, active: false, imageUrl: null, inviteCode: "VAMP01" },
  { id: 3, name: "Campaña 3: La Tumba de la Aniquilación", ownerId: 2, active: true,  imageUrl: null, inviteCode: "JNGL01" },
];
let _nextCampaignId = 4;

const _campaignMembers = {
  1: { ownerId: 1, playerIds: [1, 2, 3, 4] },
  2: { ownerId: 1, playerIds: [1, 5, 6, 7, 8] },
  3: { ownerId: 2, playerIds: [1, 2, 9, 10] },
};

// ============ CHARACTERS (DB format — matches characterDataAdapter.fromDatabase input) ============
let _characters = [
  {
    id: 1, userId: 1,
    name: "Thorn Ironwood",
    classes: ["Ranger", "Rogue"],
    species: "Half-Elf",
    background: "Outlander",
    level: 5,
    image_url: "/images/characters/thorn.png",
    ability_scores: { str: 14, dex: 18, con: 13, int: 10, wis: 15, cha: 8 },
    proficiency_bonus: 3,
    save_proficiencies: ["dex", "int"],
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
    proficiency_list: [
      { ability: "str", level: "proficient" },
      { ability: "dex", level: "expert" },
    ],
    speed: 35,
    hp: { max: 38, current: 38, temp: 0 },
    hit_dice: { type: "d10", total: 5, remaining: 5 },
    inventory: [
      { id: 201, name: "Espada larga", weight: 3, quantity: 1, description: "Una hoja bien equilibrada.", equipable: true, equipped: true, effect: { damage: "1d8", type: "cortante", properties: "versátil (1d10)" } },
      { id: 202, name: "Armadura de cuero tachonado", weight: 13, quantity: 1, description: "Tachones de metal cosidos al cuero.", equipable: true, equipped: true, effect: { ac_bonus: 2, stealth_disadvantage: false } },
      { id: 203, name: "Poción de curación", weight: 0.5, quantity: 2, description: "Recuperas 2d4+2 puntos de vida.", equipable: false, equipped: false, effect: { heal: "2d4+2" } },
      { id: 204, name: "Kit de ladrón", weight: 2, quantity: 1, description: "Herramientas para abrir cerraduras.", equipable: false, equipped: false, effect: null },
    ],
    features: [
      { name: "Fighting Style: Defense", effect: { ac_bonus: 1 } },
    ],
    actions: [
      { id: 1, name: "Ataque con arco largo",  description: "Ataque a distancia con arco largo.", recharge: "PerTurn", uses: { current: 1, max: 1 } },
      { id: 2, name: "Golpe en la rodilla",    description: "El enemigo supera CD 14 de CON o cae derribado.", recharge: "SR", uses: { current: 1, max: 1 } },
      { id: 3, name: "Ráfaga de puñales",      description: "Lanzas tres dagas a objetivos cercanos.", recharge: "LR", uses: { current: 1, max: 2 } },
    ],
    bonus_actions: [
      { id: 4, name: "Paso sombrío",  description: "Te teletransportas 15 pies a un lugar visible.", recharge: "PerTurn", uses: { current: 1, max: 1 } },
      { id: 5, name: "Segundo viento", description: "Recuperas 1d10 + nivel puntos de vida.",        recharge: "SR",      uses: { current: 1, max: 1 } },
    ],
    other_proficiencies: ["Herramientas de ladrón", "Juego de cartas", "Monturas (tierra)"],
    stored_features: [
      { id: 1, name: "Ataque Furtivo",     description: "Una vez por turno, +2d6 de daño si tienes ventaja o un aliado está a 5 pies.", effect: { action: { attack: { damage: "2d6", type: "piercing" }, recharge: "PerTurn", uses: { current: 1, max: 1 } } } },
      { id: 2, name: "Furia",              description: "Ventaja en pruebas de FUE. +2 daño en ataques c·a·c.", effect: { modifiers: { ability_proficiencies: [{ ability: "str", level: "advantage" }] }, recharge: "LR", uses: { current: 3, max: 3 } } },
      { id: 3, name: "Defensa Duelista",   description: "Mientras sostienes un arma en una mano y ninguna otra, +1 CA.", effect: { modifiers: { ac_bonus: 1 } } },
      { id: 4, name: "Segundo Viento",     description: "Recuperas 1d10 + nivel puntos de vida.", effect: { action: { heal: "1d10 + @level", recharge: "SR", uses: { current: 1, max: 1 } } } },
    ],
    spellcasting: {
      ability: "wis",
      slots: { 1: { max: 4, current: 3 }, 2: { max: 3, current: 2 }, 3: { max: 2, current: 2 } },
      spells: [
        { id: 101, name: "Curar heridas",    description: "Una criatura recupera 1d8 + mod puntos de golpe.", ritual: false, concentration: false, prepared: true,  level: 1, effect: { damage: "1d8+mod", type: "curación", range: "Toque",            components: "V, S",    duration: "Instantáneo"                   } },
        { id: 102, name: "Detectar magia",   description: "Percibes magia en un radio de 30 pies.",           ritual: true,  concentration: true,  prepared: false, level: 1, effect: { range: "Personal (30 pies)",                                components: "V, S",    duration: "Concentración, hasta 10 min"   } },
        { id: 103, name: "Rayo abrasador",   description: "Tres rayos de fuego a objetivos distintos.",        ritual: false, concentration: false, prepared: true,  level: 2, effect: { damage: "2d6",       type: "fuego",    range: "120 pies",        components: "V, S",    duration: "Instantáneo"                   } },
        { id: 104, name: "Forma gaseosa",    description: "Te transformas en una nube de gas voladora.",       ritual: false, concentration: true,  prepared: false, level: 3, effect: { range: "Toque",                                            components: "V, S, M", duration: "Concentración, hasta 1 hora"   } },
      ],
    },
    character_note: { id: 1, title: "Historia de Thorn Ironwood", content: "Thorn creció en los bosques del norte, entrenado desde niño tanto como guardabosques como ladrón. Una vieja cicatriz en la mejilla izquierda de la que nunca habla." },
    campaign_ids: [1, 3],
  },
  {
    id: 2, userId: 2,
    name: "Lirael Moonshadow",
    classes: ["Wizard"],
    species: "Elfo del Bosque",
    background: "Sage",
    level: 7,
    image_url: "/images/characters/lirael.png",
    ability_scores: { str: 8, dex: 14, con: 12, int: 19, wis: 10, cha: 11 },
    proficiency_bonus: 3,
    save_proficiencies: ["int", "wis"],
    skill_proficiencies: [
      { skill: "arcana",       level: "proficient" },
      { skill: "history",      level: "proficient" },
      { skill: "investigation", level: "expert"    },
      { skill: "insight",      level: "proficient" },
    ],
    proficiency_list: [],
    speed: 35,
    hp: { max: 35, current: 28, temp: 0 },
    hit_dice: { type: "d6", total: 7, remaining: 5 },
    inventory: [
      { id: 301, name: "Bastón arcano",           weight: 4,   quantity: 1, description: "Foco arcano de madera de fresno.", equipable: true,  equipped: true,  effect: { damage: "1d6", type: "contundente" } },
      { id: 302, name: "Libro de hechizos",       weight: 3,   quantity: 1, description: "Contiene todos tus hechizos.",      equipable: false, equipped: false, effect: null },
      { id: 303, name: "Poción de curación mayor",weight: 0.5, quantity: 1, description: "Recuperas 4d4+4 puntos de vida.",   equipable: false, equipped: false, effect: { heal: "4d4+4" } },
    ],
    features: [],
    actions: [
      { id: 11, name: "Ataque con bastón", description: "Ataque cuerpo a cuerpo con el bastón arcano.", recharge: "PerTurn", uses: { current: 1, max: 1 } },
    ],
    bonus_actions: [],
    other_proficiencies: ["Laúd", "Ajedrez de dragón"],
    stored_features: [
      { id: 11, name: "Recuperación Arcana", description: "Una vez al día recuperas espacios de hechizo que no superen la mitad de tu nivel.", effect: { action: { heal: "slots", recharge: "LR", uses: { current: 1, max: 1 } } } },
      { id: 12, name: "Escuela de Evocación", description: "Tus hechizos de evocación son más potentes y no afectan a aliados.", effect: { modifiers: { spell_damage_bonus: 1 } } },
    ],
    spellcasting: {
      ability: "int",
      slots: { 1: { max: 4, current: 4 }, 2: { max: 3, current: 1 }, 3: { max: 3, current: 3 }, 4: { max: 1, current: 0 } },
      spells: [
        { id: 201, name: "Bola de fuego",     description: "Explosión de fuego en un punto elegido.",  ritual: false, concentration: false, prepared: true,  level: 3, effect: { damage: "8d6",     type: "fuego",   range: "150 pies", components: "V, S, M", duration: "Instantáneo"                  } },
        { id: 202, name: "Proyectil mágico",  description: "Tres dardos de energía mágica.",            ritual: false, concentration: false, prepared: true,  level: 1, effect: { damage: "1d4+1",  type: "mágico",  range: "120 pies", components: "V, S",    duration: "Instantáneo"                  } },
        { id: 203, name: "Escudo",            description: "+5 CA hasta el inicio de tu siguiente turno.",ritual: false,concentration: false, prepared: true,  level: 1, effect: { ac_bonus: 5,                        range: "Personal", components: "V, S",    duration: "1 turno"                      } },
        { id: 204, name: "Invisibilidad",     description: "Una criatura que toques se vuelve invisible.",ritual: false,concentration: true,  prepared: false, level: 2, effect: {                                     range: "Toque",    components: "V, S, M", duration: "Concentración, hasta 1 hora"  } },
      ],
    },
    character_note: { id: 2, title: "Historia de Lirael Moonshadow", content: "Lirael abandonó su hogar élfico en búsqueda de un tomo arcano robado por un nigromante. Sus ojos brillan con luz propia al lanzar hechizos." },
    campaign_ids: [1],
  },
  {
    id: 3, userId: 3,
    name: "Borin Battlehammer",
    classes: ["Cleric", "Fighter"],
    species: "Enano de las Montañas",
    background: "Soldier",
    level: 6,
    image_url: "/images/characters/borin.png",
    ability_scores: { str: 16, dex: 10, con: 16, int: 9, wis: 17, cha: 12 },
    proficiency_bonus: 3,
    save_proficiencies: ["wis", "cha"],
    skill_proficiencies: [
      { skill: "athletics",  level: "proficient" },
      { skill: "perception", level: "proficient" },
      { skill: "religion",   level: "proficient" },
      { skill: "medicine",   level: "proficient" },
    ],
    proficiency_list: [],
    speed: 25,
    hp: { max: 52, current: 52, temp: 0 },
    hit_dice: { type: "d8", total: 6, remaining: 6 },
    inventory: [
      { id: 401, name: "Mazo de guerra", weight: 4,  quantity: 1, description: "Símbolo sagrado de Moradin.", equipable: true, equipped: true,  effect: { damage: "1d8", type: "contundente" } },
      { id: 402, name: "Escudo",         weight: 6,  quantity: 1, description: "Escudo de hierro enano.",    equipable: true, equipped: true,  effect: { ac_bonus: 2 } },
      { id: 403, name: "Cota de malla",  weight: 55, quantity: 1, description: "Armadura pesada enana.",     equipable: true, equipped: true,  effect: { ac_bonus: 6 } },
    ],
    features: [],
    actions: [
      { id: 21, name: "Ataque con mazo", description: "Ataque cuerpo a cuerpo con mazo de guerra.", recharge: "PerTurn", uses: { current: 1, max: 1 } },
      { id: 22, name: "Destrozar",       description: "Ataque que puede usar el retroceso de impacto.", recharge: "SR", uses: { current: 1, max: 1 } },
    ],
    bonus_actions: [
      { id: 23, name: "Curación divina", description: "Gastas un espacio para curar 1d8 + SAB a un ser tocado.", recharge: "LR", uses: { current: 3, max: 3 } },
    ],
    other_proficiencies: ["Armaduras pesadas", "Herramientas de herrero", "Juego de dados"],
    stored_features: [
      { id: 21, name: "Repeler No-muertos", description: "Los no-muertos deben superar SAB CD 14 o huyen de ti.",     effect: { action: { recharge: "SR", uses: { current: 1, max: 1 } } } },
      { id: 22, name: "Segundo Aliento",    description: "Recuperas 1d10 + nivel de guerrero puntos de vida.",        effect: { action: { heal: "1d10 + @level", recharge: "SR", uses: { current: 1, max: 1 } } } },
    ],
    spellcasting: {
      ability: "wis",
      slots: { 1: { max: 4, current: 4 }, 2: { max: 3, current: 3 }, 3: { max: 2, current: 2 } },
      spells: [
        { id: 301, name: "Curar heridas",   description: "Una criatura recupera 1d8 + SAB puntos de golpe.", ritual: false, concentration: false, prepared: true, level: 1, effect: { damage: "1d8+mod", type: "curación", range: "Toque",  components: "V, S",    duration: "Instantáneo"                 } },
        { id: 302, name: "Escudo de la fe", description: "+2 CA a una criatura visible.",                    ritual: false, concentration: true,  prepared: true, level: 1, effect: { ac_bonus: 2,                        range: "60 pies", components: "V, S, M", duration: "Concentración, hasta 10 min" } },
        { id: 303, name: "Arma espiritual", description: "Arma espectral que ataca a tus enemigos.",         ritual: false, concentration: false, prepared: true, level: 2, effect: { damage: "1d8+mod", type: "de fuerza", range: "60 pies", components: "V, S",    duration: "1 minuto"                    } },
      ],
    },
    character_note: { id: 3, title: "Historia de Borin Battlehammer", content: "Borin sirvió como capellán en el ejército enano. Perdió a su comandante en el paso de hierro y ahora busca redención en nombre de Moradin." },
    campaign_ids: [2],
  },
];
let _nextCharacterId = 4;
let _nextItemId = 500;
let _nextActionId = 100;
let _nextFeatureId = 50;
let _nextSpellId = 400;

// ============ CREATURES ============
function _mod(score) { return Math.floor((score - 10) / 2); }
export function fmtMod(score) { const m = _mod(score); return m >= 0 ? `+${m}` : `${m}`; }
// Mutable singleton — updated via setCurrentUser() on login/logout
export const currentUser = { id: CURRENT_USER_ID, isGM: true };

let _folders = [
  { id: "f1", name: "Humanoides", parentId: null },
  { id: "f2", name: "Bestias",    parentId: null },
  { id: "f3", name: "Jefes",      parentId: "f1" },
];
let _nextFolderId = 4;

let _creatures = [
  {
    id: "c1", name: "Goblin", folderId: "f1", imageUrl: null, campaignIds: [1],
    cr: "1/4", size: "Pequeño", creatureType: "Humanoide (goblinoide)", alignment: "Neutral Malvado",
    ac: 15, acNote: "armadura de cuero tachonada, escudo",
    hp: { current: 7, max: 7, formula: "2d6" }, speed: "9 m",
    abilityScores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    savingThrows: [], skills: [{ name: "Sigilo", mod: 6 }],
    damageImmunities: [], damageResistances: [], conditionImmunities: [],
    senses: "Visión en la oscuridad 18 m, Percepción pasiva 9", languages: "Común, Goblin",
    specialTraits: [{ name: "Escape Nimble", description: "Puede Desvincularse o Esconderse como acción adicional en cada turno." }],
    actions: [
      { name: "Cimitarra", description: "Ataque cuerpo a cuerpo: +4 al ataque, 1d6+2 de daño cortante." },
      { name: "Arco corto", description: "Ataque a distancia: +4 al ataque, 1d6+2 de daño perforante." },
    ],
    bonusActions: [], reactions: [],
    gmNotes: "Patrullan las ruinas del este. Aliados de Klarg.",
    playerVisibleNotes: "Criaturas pequeñas y furtivas que hablan goblin.",
  },
  {
    id: "c2", name: "Hobgoblin Capitán", folderId: "f3", imageUrl: null, campaignIds: [1, 2],
    cr: "3", size: "Mediano", creatureType: "Humanoide (goblinoide)", alignment: "Legal Malvado",
    ac: 17, acNote: "cota de malla, escudo",
    hp: { current: 52, max: 52, formula: "8d8+16" }, speed: "9 m",
    abilityScores: { str: 15, dex: 12, con: 14, int: 12, wis: 10, cha: 13 },
    savingThrows: [{ ability: "INT", mod: 3 }, { ability: "SAB", mod: 2 }],
    skills: [{ name: "Historia", mod: 3 }],
    damageImmunities: [], damageResistances: [], conditionImmunities: [],
    senses: "Visión en la oscuridad 18 m, Percepción pasiva 10", languages: "Común, Goblin",
    specialTraits: [{ name: "Disciplina Marcial", description: "Puede usar su reacción para que un hobgoblin aliado a 9 m relance una tirada de ataque fallida." }],
    actions: [
      { name: "Ataque múltiple", description: "Realiza dos ataques cuerpo a cuerpo." },
      { name: "Longsword",        description: "Ataque c·a·c: +4 al ataque, 1d8+2 cortante (1d10+2 a dos manos)." },
      { name: "Escudo de guerrero", description: "Hasta el siguiente turno, los ataques contra él tienen desventaja." },
    ],
    bonusActions: [], reactions: [],
    gmNotes: "Líder del puesto avanzado. Conoce el campamento principal.",
    playerVisibleNotes: "Un hobgoblin imponente con armadura brillante.",
  },
  {
    id: "c3", name: "Lobo Gigante", folderId: "f2", imageUrl: null, campaignIds: [1],
    cr: "1", size: "Grande", creatureType: "Bestia", alignment: "No alineado",
    ac: 13, acNote: "armadura natural",
    hp: { current: 26, max: 26, formula: "4d10+4" }, speed: "15 m",
    abilityScores: { str: 17, dex: 15, con: 13, int: 3, wis: 12, cha: 7 },
    savingThrows: [], skills: [{ name: "Percepción", mod: 3 }, { name: "Sigilo", mod: 4 }],
    damageImmunities: [], damageResistances: [], conditionImmunities: [],
    senses: "Percepción pasiva 13", languages: "Goblin, Lobo gigante (no habla)",
    specialTraits: [
      { name: "Olfato agudo",       description: "Ventaja en pruebas de Percepción basadas en el olfato." },
      { name: "Tácticas de jauría", description: "Ventaja en ataques si un aliado no incapacitado está a 1,5 m del objetivo." },
    ],
    actions: [{ name: "Mordisco", description: "Ataque c·a·c: +5, 2d6+3 perforante. Si falla FUE CD 13, el objetivo cae derribado." }],
    bonusActions: [], reactions: [],
    gmNotes: "Montura de los jinetes goblin. Tres en el perímetro norte.",
    playerVisibleNotes: "Un enorme lobo negro con ojos amarillos.",
  },
  {
    id: "c4", name: "Esqueleto", folderId: null, imageUrl: null, campaignIds: [2],
    cr: "1/4", size: "Mediano", creatureType: "No-muerto", alignment: "Legal Malvado",
    ac: 13, acNote: "restos de armadura",
    hp: { current: 13, max: 13, formula: "2d8+4" }, speed: "9 m",
    abilityScores: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    savingThrows: [], skills: [],
    damageImmunities: ["veneno"], damageResistances: [], conditionImmunities: ["agotamiento", "envenenado"],
    senses: "Visión en la oscuridad 18 m, Percepción pasiva 9",
    languages: "Entiende los idiomas que conocía en vida pero no puede hablar",
    specialTraits: [],
    actions: [
      { name: "Cimitarra", description: "Ataque c·a·c: +4, 1d6+2 cortante." },
      { name: "Arco corto", description: "Ataque a distancia: +4, 1d6+2 perforante." },
    ],
    bonusActions: [], reactions: [],
    gmNotes: "Animados por el nigromante del castillo. Patrullan la cripta.",
    playerVisibleNotes: "Huesos reanimados que se mueven con una voluntad sobrenatural.",
  },
];
let _nextCreatureId = 5;

// ============ NOTES ============
let _notes = [
  { id: 1, campaignId: 1, title: "Sesión 1: El Inicio",                content: "Los aventureros se reunieron en la Posada del Dragón Rojo en Leilon. El alcalde Harbin Wester los contrató para investigar unas minas al noreste. El grupo estaba formado por Thorn Ironwood (explorador) y Lirael Moonshadow (maga).",           isPublic: true,  authorId: 1, createdAt: "2026-01-10" },
  { id: 2, campaignId: 1, title: "Klarg el Hobgoblin — Notas privadas", content: "Klarg sabe la ubicación del campamento de bugbears al norte. No revelarlo hasta que los jugadores lo capturen. Tiene un medallón robado que pertenece a la familia Rockseeker.",                                                                    isPublic: false, authorId: 1, createdAt: "2026-01-10" },
  { id: 3, campaignId: 1, title: "Mapa de las Minas",                   content: "La entrada norte está bloqueada por un derrumbe. La sala central tiene una fuente mágica que restaura un PV al beber (una vez por descanso largo). El nivel inferior contiene el tesoro principal.",                                                    isPublic: true,  authorId: 1, createdAt: "2026-01-17" },
  { id: 4, campaignId: 1, title: "Sesión 3: La Traición",               content: "Sildar fue capturado por los Puños de Hierro. El grupo negoció su liberación a cambio de escoltar un cargamento. Thorn descubrió que el comerciante local es un informante.",                                                                        isPublic: true,  authorId: 1, createdAt: "2026-01-31" },
  { id: 5, campaignId: 2, title: "Llegada a Barovia",                   content: "El grupo despertó envuelto en niebla. Las puertas de Barovia se cerraron detrás de ellos. Los aldeanos los miraron con miedo.",                                                                                                                        isPublic: true,  authorId: 1, createdAt: "2026-02-07" },
  { id: 6, campaignId: 2, title: "El Castillo Ravenloft — Secretos",    content: "Strahd tiene tres aliados en el castillo. El corazón de la oscuridad está en la cripta del sótano. La reliquia del sol puede debilitarlo combinada con agua sagrada.",                                                                                  isPublic: false, authorId: 1, createdAt: "2026-02-14" },
  { id: 7, campaignId: 3, title: "La Jungla",                           content: "El calor y la humedad son sofocantes. El grupo encontró rastros de una expedición anterior abandonada hace 3 meses.",                                                                                                                                   isPublic: true,  authorId: 2, createdAt: "2026-03-01" },
];
let _nextNoteId = 8;

// ============ MESSAGES ============
let _messages = {
  1: [
    { id:  1, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "text",         content: "¡Vamos a explorar la cueva!",                                                              timestamp: "2026-05-10T10:00:00Z", isWhisper: false, whisperTo: null },
    { id:  2, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "text",         content: "La entrada está oscura y húmeda.",                                                         timestamp: "2026-05-10T10:01:00Z", isWhisper: false, whisperTo: null },
    { id:  3, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "dice_roll",    content: { dice: "3d6",  results: [3,5,2], total: 10, advantage: false, disadvantage: false },        timestamp: "2026-05-10T10:02:00Z", isWhisper: false, whisperTo: null },
    { id:  4, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "whisper",      content: "Te noto muy callado, ¿todo bien?",                                                         timestamp: "2026-05-10T10:03:00Z", isWhisper: true,  whisperTo: 3   },
    { id:  5, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "ability_append",content: { abilityName: "Furia Salvaje",    description: "Ventaja en ataques c·a·c durante 1 min." }, timestamp: "2026-05-10T10:04:00Z", isWhisper: false, whisperTo: null },
    { id:  6, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "note_append",  content: { noteTitle: "Pistas encontradas", snippet: "Hallisteis un diario con coordenadas y el símbolo de una serpiente alada." }, timestamp: "2026-05-10T10:05:00Z", isWhisper: false, whisperTo: null },
    { id:  7, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "text",         content: "¿Qué hay escrito en el diario?",                                                           timestamp: "2026-05-10T10:06:00Z", isWhisper: false, whisperTo: null },
    { id:  8, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "text",         content: "Las páginas están deterioradas pero distingues coordenadas y el símbolo de una serpiente alada.", timestamp: "2026-05-10T10:07:00Z", isWhisper: false, whisperTo: null },
    { id:  9, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "dice_roll",    content: { dice: "1d20", results: [17],    total: 17, advantage: false, disadvantage: false },        timestamp: "2026-05-10T10:08:00Z", isWhisper: false, whisperTo: null },
    { id: 10, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "text",         content: "Con ese resultado en Arcanos, reconoces el símbolo: es la marca de la Cofradía de la Sombra Escarlata.", timestamp: "2026-05-10T10:08:30Z", isWhisper: false, whisperTo: null },
    { id: 11, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "text",         content: "Thorn aprieta el diario contra su pecho. «Esos bastardos», murmura.",                    timestamp: "2026-05-10T10:09:00Z", isWhisper: false, whisperTo: null },
    { id: 12, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "text",         content: "De repente escucháis pasos al fondo del pasillo. Lentos, pesados... y se acercan.",     timestamp: "2026-05-10T10:10:00Z", isWhisper: false, whisperTo: null },
    { id: 13, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "ability_append",content: { abilityName: "Sigilo Experto", description: "Thorn se funde con las sombras, ventaja en Sigilo." }, timestamp: "2026-05-10T10:10:30Z", isWhisper: false, whisperTo: null },
    { id: 14, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "dice_roll",    content: { dice: "2d20", results: [12,19], total: 19, advantage: true,  disadvantage: false },        timestamp: "2026-05-10T10:10:45Z", isWhisper: false, whisperTo: null },
    { id: 15, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "text",         content: "La guardia pasa de largo sin verte. Espera un turno antes de actuar.",               timestamp: "2026-05-10T10:11:00Z", isWhisper: false, whisperTo: null },
    { id: 16, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "whisper",      content: "El guardia lleva un medallón que reconoces: es de tu antiguo mentor.",               timestamp: "2026-05-10T10:11:30Z", isWhisper: true,  whisperTo: 2   },
    { id: 17, chatId: 1, senderId: 2, senderUsername: "Player_Anna", characterId: 1,    characterName: "Thorn Ironwood",    characterAvatar: "/avatars/thorn.png", type: "text",         content: "Salgo de las sombras y le pongo la hoja en el cuello. «¿Dónde está Gareth?»",        timestamp: "2026-05-10T10:12:00Z", isWhisper: false, whisperTo: null },
    { id: 18, chatId: 1, senderId: 1, senderUsername: "GM_Dave",     characterId: null, characterName: null,                characterAvatar: null,                 type: "text",         content: "El guardia tiembla. «¡No lo sé, juro que no lo sé! Solo... solo seguí órdenes.»",  timestamp: "2026-05-10T10:12:45Z", isWhisper: false, whisperTo: null },
  ],
  2: [
    { id: 19, chatId: 2, senderId: 1, senderUsername: "GM_Dave", characterId: null, characterName: null, characterAvatar: null, type: "text", content: "La niebla os envuelve mientras las puertas de Barovia se cierran de golpe.", timestamp: "2026-02-07T20:00:00Z", isWhisper: false, whisperTo: null },
    { id: 20, chatId: 2, senderId: 5, senderUsername: "Player_Dan", characterId: null, characterName: null, characterAvatar: null, type: "text", content: "¿Podemos volver por donde vinimos?", timestamp: "2026-02-07T20:01:00Z", isWhisper: false, whisperTo: null },
    { id: 21, chatId: 2, senderId: 1, senderUsername: "GM_Dave", characterId: null, characterName: null, characterAvatar: null, type: "text", content: "Las puertas están selladas. Solo hay un camino: hacia delante.", timestamp: "2026-02-07T20:01:30Z", isWhisper: false, whisperTo: null },
  ],
  3: [
    { id: 22, chatId: 3, senderId: 2, senderUsername: "Player_Anna", characterId: null, characterName: null, characterAvatar: null, type: "text", content: "La jungla es sofocante. Hay rastros de una expedición anterior.", timestamp: "2026-03-01T18:00:00Z", isWhisper: false, whisperTo: null },
    { id: 23, chatId: 3, senderId: 9, senderUsername: "Player_Hugo", characterId: null, characterName: null, characterAvatar: null, type: "dice_roll", content: { dice: "1d20", results: [14], total: 14, advantage: false, disadvantage: false }, timestamp: "2026-03-01T18:01:00Z", isWhisper: false, whisperTo: null },
  ],
};
let _nextMessageId = 24;

// ============ PLANNER ============
export const TIME_SLOTS = [
  { id: "amanecer",    label: "Amanecer",    range: "6:00–9:00"   },
  { id: "manana",      label: "Mañana",      range: "9:00–12:00"  },
  { id: "mediodia",    label: "Mediodía",    range: "12:00–15:00" },
  { id: "tarde",       label: "Tarde",       range: "15:00–18:00" },
  { id: "tarde_noche", label: "Tarde-noche", range: "18:00–21:00" },
  { id: "noche",       label: "Noche",       range: "21:00–00:00" },
  { id: "madrugada",   label: "Madrugada",   range: "00:00–3:00"  },
  { id: "alba",        label: "Alba",        range: "3:00–6:00"   },
];

export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function getWeekDays(referenceDate = new Date()) {
  const days = [];
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day.toISOString().split("T")[0]);
  }
  return days;
}

const _baseWeek = getWeekDays(new Date());
const [_mon, _tue, _wed, _thu, _fri, _sat, _sun] = _baseWeek;

let _availability = {
  1:  { [_mon]: ["tarde", "tarde_noche", "noche"],                     [_wed]: ["noche", "madrugada"],              [_fri]: ["tarde", "tarde_noche"],                         [_sat]: ["manana", "mediodia", "tarde", "tarde_noche"] },
  2:  { [_tue]: ["tarde", "tarde_noche"],                              [_wed]: ["tarde", "noche"],                  [_fri]: ["tarde_noche", "noche"],                         [_sat]: ["mediodia", "tarde", "tarde_noche"] },
  3:  { [_mon]: ["noche", "madrugada"],                                [_wed]: ["tarde_noche", "noche"],            [_thu]: ["tarde", "tarde_noche"],                         [_sat]: ["amanecer", "manana", "mediodia"] },
  4:  { [_mon]: ["tarde", "tarde_noche"],                              [_wed]: ["noche"],                           [_fri]: ["tarde"],                                        [_sat]: ["tarde", "tarde_noche", "noche"] },
  5:  { [_tue]: ["amanecer", "manana"],                                [_thu]: ["tarde", "tarde_noche"],            [_sun]: ["mediodia", "tarde"] },
  6:  { [_mon]: ["mediodia", "tarde"],                                 [_wed]: ["tarde", "tarde_noche"],            [_sat]: ["noche", "madrugada"] },
  7:  { [_wed]: ["manana", "mediodia"],                                [_fri]: ["tarde_noche", "noche"],            [_sun]: ["tarde", "noche"] },
  8:  { [_tue]: ["noche", "madrugada"],                                [_thu]: ["tarde_noche"],                     [_sat]: ["tarde", "tarde_noche"] },
  9:  { [_mon]: ["manana"],                                            [_wed]: ["mediodia", "tarde"],               [_fri]: ["noche"] },
  10: { [_tue]: ["tarde", "tarde_noche"],                              [_thu]: ["manana", "mediodia"],              [_sat]: ["amanecer", "manana"] },
};

// ============ AUTH ============
export async function loginUser(username, password) {
  await _sim(300);
  const user = Object.values(_users).find(u => u.username === username && u.password === password);
  if (!user) return null;
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

// ============ CAMPAIGN FUNCTIONS ============
export async function fetchCampaigns(userId = CURRENT_USER_ID) {
  await _sim();
  return _campaigns
    .filter(c => c.ownerId === userId || (_campaignMembers[c.id]?.playerIds || []).includes(userId))
    .map(c => {
      const members = _campaignMembers[c.id] || { ownerId: c.ownerId, playerIds: [] };
      return {
        ...c,
        players: members.playerIds,
        playersCount: members.playerIds.length,
        npcsCount: _creatures.filter(cr => cr.campaignIds.includes(c.id)).length,
        notesCount: _notes.filter(n => n.campaignId === c.id).length,
      };
    });
}

export async function fetchHomeData(userId = CURRENT_USER_ID) {
  await _sim();
  const campaigns = await fetchCampaigns(userId);
  return {
    user: (({ password: _pw, ...u }) => u)(_users[userId]),
    campaigns: campaigns.map(c => {
      const lastMsg = _messages[c.id]?.slice(-1)[0];
      let lastMessage = "";
      if (lastMsg) {
        if (typeof lastMsg.content === "string") lastMessage = lastMsg.content;
        else if (lastMsg.type === "dice_roll") lastMessage = `🎲 ${lastMsg.content.dice} = ${lastMsg.content.total}`;
        else if (lastMsg.type === "ability_append") lastMessage = `⚡ ${lastMsg.content.abilityName}`;
        else if (lastMsg.type === "note_append") lastMessage = `📝 ${lastMsg.content.noteTitle}`;
      }
      return { id: c.id, name: c.name, active: c.active, imageUrl: c.imageUrl, lastMessage, unreadCount: 0 };
    }),
    recentSessions: [],
    myCharactersCount: _characters.filter(ch => ch.userId === userId).length,
    myCreaturesCount: _creatures.length,
  };
}

export async function createCampaign({ name, description = "" }) {
  await _sim(300);
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const newCamp = {
    id: _nextCampaignId++, name, description,
    ownerId: CURRENT_USER_ID, active: false, imageUrl: null, inviteCode: code,
  };
  _campaigns.push(newCamp);
  _campaignMembers[newCamp.id] = { ownerId: CURRENT_USER_ID, playerIds: [CURRENT_USER_ID] };
  return _clone(newCamp);
}

export async function joinCampaignByCode(code) {
  await _sim(300);
  const camp = _campaigns.find(c => c.inviteCode?.toUpperCase() === code.trim().toUpperCase());
  if (!camp) throw new Error(`Código "${code}" no encontrado.`);
  const members = _campaignMembers[camp.id];
  if (members && !members.playerIds.includes(CURRENT_USER_ID)) {
    members.playerIds.push(CURRENT_USER_ID);
  }
  return _clone(camp);
}

export async function toggleCampaignActive(campaignId) {
  await _sim(150);
  const camp = _campaigns.find(c => c.id === Number(campaignId));
  if (!camp) throw new Error("Campaña no encontrada.");
  camp.active = !camp.active;
  return _clone(camp);
}

export async function deleteCampaign(campaignId) {
  await _sim(200);
  const idx = _campaigns.findIndex(c => c.id === Number(campaignId));
  if (idx !== -1) _campaigns.splice(idx, 1);
  return { success: true };
}

// ============ PLAYER FUNCTIONS ============
export async function fetchCampaignPlayers(campaignId) {
  await _sim();
  const members = _campaignMembers[Number(campaignId)];
  if (!members) return { ownerId: null, players: [] };
  const players = members.playerIds.map(id => {
    const { password: _pw, ...u } = _users[id];
    return u;
  }).filter(Boolean);
  return { ownerId: members.ownerId, players };
}

export async function kickPlayer(campaignId, userId) {
  await _sim(200);
  const members = _campaignMembers[Number(campaignId)];
  if (members) members.playerIds = members.playerIds.filter(id => id !== userId);
  return { success: true };
}

export async function invitePlayer(campaignId, username) {
  await _sim(200);
  const user = Object.values(_users).find(u => u.username === username);
  if (!user) throw new Error(`Usuario "${username}" no encontrado.`);
  const members = _campaignMembers[Number(campaignId)];
  if (members && !members.playerIds.includes(user.id)) members.playerIds.push(user.id);
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

// ============ CHARACTER FUNCTIONS ============
export async function fetchUserCharacters(userId = CURRENT_USER_ID) {
  await _sim();
  return _characters
    .filter(c => c.userId === userId)
    .map(c => ({
      id: c.id, userId: c.userId,
      name: c.name, classes: c.classes, level: c.level,
      species: c.species, background: c.background,
      imageUrl: c.image_url,
      stats: c.ability_scores,
      campaigns: c.campaign_ids.map(cid => {
        const camp = _campaigns.find(x => x.id === cid);
        return camp ? { id: camp.id, name: camp.name } : null;
      }).filter(Boolean),
    }));
}

export async function createCharacter() {
  await _sim(300);
  const newChar = {
    id: _nextCharacterId++, userId: CURRENT_USER_ID,
    name: "Nuevo Personaje", classes: [], species: "", background: "", level: 1,
    image_url: null,
    ability_scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    proficiency_bonus: 2, save_proficiencies: [], skill_proficiencies: [], proficiency_list: [],
    speed: 30, hp: { max: 8, current: 8, temp: 0 }, hit_dice: { type: "d8", total: 1, remaining: 1 },
    inventory: [], features: [], actions: [], bonus_actions: [], other_proficiencies: [],
    stored_features: [], spellcasting: { ability: "int", slots: {}, spells: [] },
    character_note: { id: Date.now(), title: "Historia", content: "" },
    campaign_ids: [],
  };
  _characters.push(newChar);
  return { id: newChar.id };
}

export async function fetchCharacterNotesInCampaign(characterId, campaignId) {
  await _sim(100);
  return [];
}

export async function fetchCharacterSheet(characterId) {
  await _sim(200);
  const char = _characters.find(c => c.id === Number(characterId));
  if (!char) throw new Error(`Personaje con id '${characterId}' no encontrado.`);
  return _clone(char);
}

export async function saveCharacterSection(characterId, section, data) {
  await _sim(200);
  const idx = _characters.findIndex(c => c.id === Number(characterId));
  if (idx === -1) return { success: false };

  if (section === "core") {
    // data is DB-format object from toDatabase()
    Object.assign(_characters[idx], _clone(data));
  } else if (Array.isArray(data) || typeof data === "object") {
    _characters[idx][section] = _clone(data);
  }
  return { success: true };
}

// Sub-data fetched independently by CharacterSheet components
export async function fetchFeatures(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.stored_features || []);
}

export async function fetchActions(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.actions || []);
}

export async function fetchBonusActions(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.bonus_actions || []);
}

export async function fetchOtherProficiencies(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.other_proficiencies || []);
}

export async function fetchSpellcastingData(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.spellcasting || { ability: "int", slots: {}, spells: [] });
}

export async function fetchInventory(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.inventory || []);
}

export async function fetchCharacterNote(characterId) {
  await _sim(100);
  return _clone(_characters.find(c => c.id === Number(characterId))?.character_note || { id: Date.now(), title: "Historia", content: "" });
}

export async function fetchCharacterCampaigns(characterId) {
  await _sim(50);
  const char = _characters.find(c => c.id === Number(characterId));
  if (!char) return [];
  return char.campaign_ids.map(cid => {
    const camp = _campaigns.find(x => x.id === cid);
    return camp ? { id: camp.id, name: camp.name } : null;
  }).filter(Boolean);
}

// ============ CREATURE FUNCTIONS ============
function _buildBreadcrumb(folderId) {
  const crumbs = [];
  let current = _folders.find(f => f.id === folderId);
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    current = _folders.find(f => f.id === current.parentId);
  }
  return crumbs;
}

export async function fetchCreaturesInFolder(folderId = null) {
  await _sim();
  return {
    folders: _folders.filter(f => f.parentId === folderId),
    creatures: _creatures.filter(c => c.folderId === folderId),
    currentFolder: folderId ? (_folders.find(f => f.id === folderId) || null) : null,
    breadcrumb: folderId ? _buildBreadcrumb(folderId) : [],
  };
}

export async function fetchCreature(creatureId) {
  await _sim();
  const creature = _creatures.find(c => c.id === creatureId);
  if (!creature) throw new Error(`Criatura '${creatureId}' no encontrada.`);
  return _clone(creature);
}

export async function saveCreature(id, data) {
  await _sim(200);
  const idx = _creatures.findIndex(c => c.id === id);
  if (idx !== -1) Object.assign(_creatures[idx], _clone(data));
  return { success: true };
}

export async function createCreature(data) {
  await _sim(200);
  const newCreature = {
    imageUrl: null, campaignIds: [], savingThrows: [], skills: [],
    damageImmunities: [], damageResistances: [], conditionImmunities: [],
    specialTraits: [], actions: [], bonusActions: [], reactions: [],
    gmNotes: "", playerVisibleNotes: "",
    ...data,
    id: `c${_nextCreatureId++}`,
  };
  _creatures.push(newCreature);
  return _clone(newCreature);
}

export async function createFolder(name, parentId = null) {
  await _sim(150);
  const newFolder = { id: `f${_nextFolderId++}`, name, parentId: parentId || null };
  _folders.push(newFolder);
  return { ...newFolder };
}

// ============ CREATURE NOTE FUNCTIONS ============
let _creatureNotes = [
  { id: "cn1", creatureId: "c1", title: "Tácticas de combate", content: "Usa Escape Nimble para retirarse cuando tiene desventaja. Prefiere atacar en grupo desde la oscuridad.", visibility: "gm", authorId: 1, createdAt: "2024-10-01" },
  { id: "cn2", creatureId: "c1", title: "Descripción para jugadores", content: "Una criatura pequeña y escurridiza con ojos que brillan en la oscuridad y dientes muy afilados.", visibility: "players_view", authorId: 1, createdAt: "2024-10-01" },
  { id: "cn3", creatureId: "c4", title: "Origen del esqueleto", content: "Animado por el nigromante que habita la cripta norte. Obedece su voluntad ciegamente.", visibility: "gm", authorId: 1, createdAt: "2024-11-01" },
  { id: "cn4", creatureId: "c4", title: "Lo que los aventureros saben", content: "Se mueven sin descanso y no sienten dolor. Atacar el cráneo parece la forma más efectiva.", visibility: "players_edit", authorId: 1, createdAt: "2024-11-01" },
];
let _nextCreatureNoteId = 5;

export async function fetchCreatureNotes(creatureId) {
  await _sim();
  return _clone(_creatureNotes.filter(n => n.creatureId === creatureId));
}

export async function createCreatureNote(data) {
  await _sim(200);
  const note = { id: `cn${_nextCreatureNoteId++}`, ...data, createdAt: new Date().toISOString().split("T")[0] };
  _creatureNotes.push(note);
  return _clone(note);
}

export async function updateCreatureNote(id, data) {
  await _sim(200);
  const idx = _creatureNotes.findIndex(n => n.id === id);
  if (idx === -1) throw new Error("Nota no encontrada");
  _creatureNotes[idx] = { ..._creatureNotes[idx], ...data };
  return _clone(_creatureNotes[idx]);
}

export async function deleteCreatureNote(id) {
  await _sim(150);
  _creatureNotes = _creatureNotes.filter(n => n.id !== id);
}

export async function addCreatureToCampaign(creatureId, campaignId) {
  await _sim();
  const idx = _creatures.findIndex(c => c.id === creatureId);
  if (idx === -1) throw new Error("Criatura no encontrada");
  if (!_creatures[idx].campaignIds.includes(campaignId)) {
    _creatures[idx] = { ..._creatures[idx], campaignIds: [..._creatures[idx].campaignIds, campaignId] };
  }
  return _clone(_creatures[idx]);
}

export async function removeCreatureFromCampaign(creatureId, campaignId) {
  await _sim();
  const idx = _creatures.findIndex(c => c.id === creatureId);
  if (idx === -1) throw new Error("Criatura no encontrada");
  _creatures[idx] = { ..._creatures[idx], campaignIds: _creatures[idx].campaignIds.filter(id => id !== campaignId) };
  return _clone(_creatures[idx]);
}

// ============ NOTE FUNCTIONS ============
export async function fetchCampaignNotes(campaignId, isGM) {
  await _sim();
  const all = _notes.filter(n => n.campaignId === Number(campaignId));
  const camp = _campaigns.find(c => c.id === Number(campaignId));
  return {
    campaign: camp ? { name: camp.name } : { name: `Campaña ${campaignId}` },
    notes: isGM ? all : all.filter(n => n.isPublic),
  };
}

export async function createNote(data) {
  await _sim();
  const note = { ...data, id: _nextNoteId++ };
  _notes.push(note);
  return _clone(note);
}

export async function updateNote(id, data) {
  await _sim();
  const idx = _notes.findIndex(n => n.id === id);
  if (idx !== -1) Object.assign(_notes[idx], data);
  return _clone(_notes[idx]);
}

export async function deleteNote(id) {
  await _sim();
  _notes = _notes.filter(n => n.id !== id);
  return { success: true };
}

// ============ CHAT FUNCTIONS ============
export async function fetchChatData(campaignId) {
  await _sim(200);
  const camp = _campaigns.find(c => c.id === Number(campaignId));
  const members = _campaignMembers[Number(campaignId)] || { ownerId: null, playerIds: [] };
  const user = _users[CURRENT_USER_ID];

  // Characters the current user can speak as
  const userCharacters = _characters
    .filter(ch => ch.userId === CURRENT_USER_ID && ch.campaign_ids.includes(Number(campaignId)))
    .map(ch => ({ id: ch.id, name: ch.name, avatar: ch.image_url }));

  // NPCs = creatures associated with this campaign
  const npcs = _creatures
    .filter(c => c.campaignIds.includes(Number(campaignId)))
    .map(c => ({ id: c.id, name: c.name, creatureId: c.id, avatar: c.imageUrl }));

  // Online users = other campaign members (excluding current user)
  const onlineUsers = members.playerIds
    .filter(id => id !== CURRENT_USER_ID)
    .map(id => ({ id, username: _users[id]?.username || `User${id}` }));

  return {
    campaign: camp || { id: campaignId, name: `Campaña ${campaignId}` },
    currentUser: { id: user.id, username: user.username, isGM: members.ownerId === CURRENT_USER_ID },
    messages: _clone(_messages[Number(campaignId)] || []),
    userCharacters,
    npcs,
    onlineUsers,
  };
}

export async function sendMessage(campaignId, messageData) {
  await _sim(100);
  const newMsg = {
    id: _nextMessageId++,
    chatId: Number(campaignId),
    senderId:        messageData.senderId,
    senderUsername:  messageData.senderUsername,
    characterId:     messageData.characterId     || null,
    characterName:   messageData.characterName   || null,
    characterAvatar: messageData.characterAvatar || null,
    type:            messageData.type,
    content:         messageData.content,
    timestamp:       new Date().toISOString(),
    isWhisper:       messageData.isWhisper  || false,
    whisperTo:       messageData.whisperTo  || null,
  };
  if (!_messages[Number(campaignId)]) _messages[Number(campaignId)] = [];
  _messages[Number(campaignId)].push(newMsg);
  return _clone(newMsg);
}

// ============ PROFILE FUNCTIONS ============
export async function fetchProfile(userId = CURRENT_USER_ID) {
  await _sim();
  const user = _users[userId];
  if (!user) throw new Error(`Usuario ${userId} no encontrado.`);
  const { password: _pw, ...safeUser } = user;

  // Compute stats from real data
  const userCampaigns = _campaigns.filter(c =>
    c.ownerId === userId || (_campaignMembers[c.id]?.playerIds || []).includes(userId)
  );
  const userChars = _characters.filter(c => c.userId === userId);
  const userNotes = _notes.filter(n => n.authorId === userId);

  return {
    ...safeUser,
    stats: {
      campaigns:    userCampaigns.length,
      characters:   userChars.length,
      sessions:     userCampaigns.reduce((acc, c) => acc + (_messages[c.id]?.length || 0), 0), // approx
      notesWritten: userNotes.length,
    },
  };
}

export async function saveProfile(data, userId = CURRENT_USER_ID) {
  await _sim(200);
  const { stats: _s, password: _p, ...editable } = data;
  Object.assign(_users[userId], editable);
  return fetchProfile(userId);
}

// ============ PLANNER FUNCTIONS ============
export async function fetchPlanner(campaignId) {
  await _sim();
  const playerIds = _campaignMembers[Number(campaignId)]?.playerIds ?? [];
  const participants = playerIds.map(uid => ({
    userId: uid,
    username: _users[uid]?.username || `User${uid}`,
    availability: _clone(_availability[uid] || {}),
  }));
  return {
    participants,
    currentUserId: CURRENT_USER_ID,
    currentUserAvailability: _clone(_availability[CURRENT_USER_ID] || {}),
  };
}

export async function toggleSlot(date, slotId) {
  await _sim(100);
  const slots = _availability[CURRENT_USER_ID]?.[date] || [];
  if (!_availability[CURRENT_USER_ID]) _availability[CURRENT_USER_ID] = {};
  if (slots.includes(slotId)) {
    _availability[CURRENT_USER_ID][date] = slots.filter(s => s !== slotId);
    if (_availability[CURRENT_USER_ID][date].length === 0) delete _availability[CURRENT_USER_ID][date];
  } else {
    _availability[CURRENT_USER_ID][date] = [...slots, slotId];
  }
  return _clone(_availability[CURRENT_USER_ID]);
}

export function computeOverlap(participants, date, slotId) {
  return participants.filter(p => p.availability[date]?.includes(slotId)).length;
}
