// src/mock/creaturesMock.js

export const currentUser = { id: 1, isGM: true };

// --------------- Carpetas ---------------
const folders = [
  { id: "f1", name: "Humanoides", parentId: null },
  { id: "f2", name: "Bestias", parentId: null },
  { id: "f3", name: "Jefes", parentId: "f1" }, // subcarpeta de Humanoides
];

// --------------- Helper ---------------
function mod(score) {
  return Math.floor((score - 10) / 2);
}

function fmtMod(score) {
  const m = mod(score);
  return m >= 0 ? `+${m}` : `${m}`;
}

// --------------- Criaturas ---------------
const creatures = [
  {
    id: "c1",
    name: "Goblin",
    folderId: "f1",
    imageUrl: null,
    campaignIds: [1],
    cr: "1/4",
    size: "Pequeño",
    creatureType: "Humanoide (goblinoide)",
    alignment: "Neutral Malvado",
    ac: 15,
    acNote: "armadura de cuero tachonada, escudo",
    hp: { current: 7, max: 7, formula: "2d6" },
    speed: "9 m",
    abilityScores: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    savingThrows: [],
    skills: [{ name: "Sigilo", mod: 6 }],
    damageImmunities: [],
    damageResistances: [],
    conditionImmunities: [],
    senses: "Visión en la oscuridad 18 m, Percepción pasiva 9",
    languages: "Común, Goblin",
    specialTraits: [
      {
        name: "Escape Nimble",
        description: "El goblin puede realizar las acciones de Desvincularse o Esconderse como acción adicional en cada uno de sus turnos.",
      },
    ],
    actions: [
      {
        name: "Cimitarra",
        description: "Ataque con arma cuerpo a cuerpo: +4 al ataque, alcance 1,5 m, un objetivo. Impacto: 5 (1d6 + 2) de daño cortante.",
      },
      {
        name: "Arco corto",
        description: "Ataque con arma a distancia: +4 al ataque, alcance 24/96 m, un objetivo. Impacto: 5 (1d6 + 2) de daño perforante.",
      },
    ],
    bonusActions: [],
    reactions: [],
    gmNotes: "Estos goblins patrullan las ruinas del este. Son aliados de Klarg.",
    playerVisibleNotes: "Criaturas pequeñas y furtivas que hablan goblin.",
  },
  {
    id: "c2",
    name: "Hobgoblin Capitán",
    folderId: "f3",
    imageUrl: null,
    campaignIds: [1, 2],
    cr: "3",
    size: "Mediano",
    creatureType: "Humanoide (goblinoide)",
    alignment: "Legal Malvado",
    ac: 17,
    acNote: "cota de malla, escudo",
    hp: { current: 52, max: 52, formula: "8d8+16" },
    speed: "9 m",
    abilityScores: { str: 15, dex: 12, con: 14, int: 12, wis: 10, cha: 13 },
    savingThrows: [
      { ability: "INT", mod: 3 },
      { ability: "SAB", mod: 2 },
    ],
    skills: [{ name: "Historia", mod: 3 }],
    damageImmunities: [],
    damageResistances: [],
    conditionImmunities: [],
    senses: "Visión en la oscuridad 18 m, Percepción pasiva 10",
    languages: "Común, Goblin",
    specialTraits: [
      {
        name: "Disciplina Marcial",
        description: "El hobgoblin puede usar su reacción cuando otro hobgoblin a 9 m o menos de él falla una tirada de ataque para permitirle relanzar el dado.",
      },
    ],
    actions: [
      {
        name: "Ataque múltiple",
        description: "El hobgoblin realiza dos ataques cuerpo a cuerpo.",
      },
      {
        name: "Longsword (espada larga)",
        description: "Ataque con arma cuerpo a cuerpo: +4 al ataque, alcance 1,5 m, un objetivo. Impacto: 6 (1d8 + 2) de daño cortante, o 7 (1d10 + 2) de daño cortante si se usa a dos manos.",
      },
      {
        name: "Escudo de guerrero",
        description: "Hasta el inicio del siguiente turno del hobgoblin, los ataques realizados contra él tienen desventaja si el hobgoblin puede ver al atacante.",
      },
    ],
    bonusActions: [],
    reactions: [],
    gmNotes: "Líder del puesto avanzado. Conoce la ubicación del campamento principal.",
    playerVisibleNotes: "Un hobgoblin imponente con armadura brillante y aspecto de comandante.",
  },
  {
    id: "c3",
    name: "Lobo Gigante",
    folderId: "f2",
    imageUrl: null,
    campaignIds: [1],
    cr: "1",
    size: "Grande",
    creatureType: "Bestia",
    alignment: "No alineado",
    ac: 13,
    acNote: "armadura natural",
    hp: { current: 26, max: 26, formula: "4d10+4" },
    speed: "15 m",
    abilityScores: { str: 17, dex: 15, con: 13, int: 3, wis: 12, cha: 7 },
    savingThrows: [],
    skills: [
      { name: "Percepción", mod: 3 },
      { name: "Sigilo", mod: 4 },
    ],
    damageImmunities: [],
    damageResistances: [],
    conditionImmunities: [],
    senses: "Percepción pasiva 13",
    languages: "Goblin, Lobo gigante (no habla)",
    specialTraits: [
      {
        name: "Olfato agudo",
        description: "El lobo tiene ventaja en las pruebas de Sabiduría (Percepción) que dependan del olfato.",
      },
      {
        name: "Tácticas de jauría",
        description: "El lobo tiene ventaja en las tiradas de ataque contra una criatura si al menos uno de los aliados del lobo está a 1,5 m de la criatura y el aliado no está incapacitado.",
      },
    ],
    actions: [
      {
        name: "Mordisco",
        description: "Ataque con arma cuerpo a cuerpo: +5 al ataque, alcance 1,5 m, un objetivo. Impacto: 10 (2d6 + 3) de daño perforante. Si el objetivo es una criatura, debe superar una tirada de salvación de Fuerza CD 13 o será derribado.",
      },
    ],
    bonusActions: [],
    reactions: [],
    gmNotes: "Montura preferida de los jinetes goblin. Tres de ellos custodian el perimetreo norte.",
    playerVisibleNotes: "Un enorme lobo negro con ojos amarillos.",
  },
  {
    id: "c4",
    name: "Esqueleto",
    folderId: null,
    imageUrl: null,
    campaignIds: [2],
    cr: "1/4",
    size: "Mediano",
    creatureType: "No-muerto",
    alignment: "Legal Malvado",
    ac: 13,
    acNote: "restos de armadura",
    hp: { current: 13, max: 13, formula: "2d8+4" },
    speed: "9 m",
    abilityScores: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 },
    savingThrows: [],
    skills: [],
    damageImmunities: ["veneno"],
    damageResistances: [],
    conditionImmunities: ["agotamiento", "envenenado"],
    senses: "Visión en la oscuridad 18 m, Percepción pasiva 9",
    languages: "Entiende todos los idiomas que conocía en vida pero no puede hablar",
    specialTraits: [],
    actions: [
      {
        name: "Cimitarra",
        description: "Ataque con arma cuerpo a cuerpo: +4 al ataque, alcance 1,5 m, un objetivo. Impacto: 5 (1d6 + 2) de daño cortante.",
      },
      {
        name: "Arco corto",
        description: "Ataque con arma a distancia: +4 al ataque, alcance 24/96 m, un objetivo. Impacto: 5 (1d6 + 2) de daño perforante.",
      },
    ],
    bonusActions: [],
    reactions: [],
    gmNotes: "Animados por el nigromante del castillo. Patrullan la cripta.",
    playerVisibleNotes: "Huesos reanimados que se mueven con una voluntad sobrenatural.",
  },
];

// --------------- ID counters ---------------
let nextCreatureNum = 5;
let nextFolderNum = 4;

// --------------- Funciones de fetch ---------------

function buildBreadcrumb(folderId) {
  const crumbs = [];
  let current = folders.find((f) => f.id === folderId);
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    current = folders.find((f) => f.id === current.parentId);
  }
  return crumbs;
}

export async function fetchCreaturesInFolder(folderId = null) {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const subfolders = folders.filter((f) => f.parentId === folderId);
  const creaturesInFolder = creatures.filter((c) => c.folderId === folderId);
  const currentFolder = folderId ? folders.find((f) => f.id === folderId) || null : null;
  const breadcrumb = folderId ? buildBreadcrumb(folderId) : [];

  return { folders: subfolders, creatures: creaturesInFolder, currentFolder, breadcrumb };
}

export async function fetchCreature(creatureId) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const creature = creatures.find((c) => c.id === creatureId);
  if (!creature) throw new Error(`Criatura con id '${creatureId}' no encontrada.`);
  return JSON.parse(JSON.stringify(creature));
}

export async function saveCreature(id, data) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const idx = creatures.findIndex((c) => c.id === id);
  if (idx !== -1) Object.assign(creatures[idx], JSON.parse(JSON.stringify(data)));
  return { success: true };
}

export async function createCreature(data) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const newCreature = {
    imageUrl: null,
    campaignIds: [],
    savingThrows: [],
    skills: [],
    damageImmunities: [],
    damageResistances: [],
    conditionImmunities: [],
    specialTraits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    gmNotes: "",
    playerVisibleNotes: "",
    ...data,
    id: `c${nextCreatureNum++}`,
  };
  creatures.push(newCreature);
  return JSON.parse(JSON.stringify(newCreature));
}

export async function createFolder(name, parentId = null) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const newFolder = { id: `f${nextFolderNum++}`, name, parentId: parentId || null };
  folders.push(newFolder);
  return { ...newFolder };
}

export { fmtMod };
