// Simula personajes del usuario y sus campañas asociadas para las notas.

const currentUserId = 1;

const characters = [
  {
    id: 1,
    name: "Thorn Ironwood",
    imageUrl: "/images/characters/thorn.png",
    classes: ["Ranger", "Rogue"],
    level: 5,
    stats: { str: 14, dex: 18, con: 13, int: 10, wis: 15, cha: 8 },
    campaigns: [
      { id: 1, name: "Las Minas Perdidas" },
      { id: 3, name: "La Tumba de la Aniquilación" }
    ]
  },
  {
    id: 2,
    name: "Lirael Moonshadow",
    imageUrl: "/images/characters/lirael.png",
    classes: ["Wizard"],
    level: 7,
    stats: { str: 8, dex: 14, con: 12, int: 19, wis: 10, cha: 11 },
    campaigns: [
      { id: 1, name: "Las Minas Perdidas" }
    ]
  },
  {
    id: 3,
    name: "Borin Battlehammer",
    imageUrl: "/images/characters/borin.png",
    classes: ["Cleric", "Fighter"],
    level: 6,
    stats: { str: 16, dex: 10, con: 16, int: 9, wis: 17, cha: 12 },
    campaigns: [
      { id: 2, name: "La Maldición de Strahd" },
      { id: 4, name: "Dragonlance" }
    ]
  }
];

export async function fetchUserCharacters(userId = currentUserId) {
  await new Promise(resolve => setTimeout(resolve, 200));
  return characters;
}

// Simula creación de personaje (devuelve un nuevo id)
export async function createCharacter() {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newId = Date.now();
  return { id: newId };
}

// Obtiene notas de un personaje en una campaña (placeholder)
export async function fetchCharacterNotesInCampaign(characterId, campaignId) {
  // Solo para indicar que existen notas; la redirección se hará en el front.
  return [];
}