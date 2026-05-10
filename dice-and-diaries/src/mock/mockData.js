// src/mock/mockData.js

// ------------------- MOCK DATA -------------------
const users = [
  { id: 1, username: "GM_Dave", isGM: true },
  { id: 2, username: "Player_Anna", isGM: false },
  { id: 3, username: "Player_Ben", isGM: false },
];

const campaigns = [
  {
    id: 1,
    name: "The Lost Mines",
    owner_id: 1, // GM
    players: [2, 3],
    active: true,
    notes: [], // array of note ids (simplified)
    npcs: [1, 2],
    chat_id: 101,
  },
  {
    id: 2,
    name: "Curse of Strahd",
    owner_id: 1,
    players: [2],
    active: false,
    notes: [],
    npcs: [],
    chat_id: 102,
  },
];

const characters = [
  {
    id: 1,
    name: "Thorn Ironwood",
    class: "Ranger",
    level: 3,
    owner_id: 2,
    stats: { str: 12, dex: 16, con: 14, int: 10, wis: 15, cha: 8 },
  },
  {
    id: 2,
    name: "Lirael Moonshadow",
    class: "Wizard",
    level: 5,
    owner_id: 3,
    stats: { str: 8, dex: 14, con: 13, int: 18, wis: 12, cha: 10 },
  },
];

const creatures = [
  {
    id: 1,
    name: "Goblin Scout",
    type: "Humanoid (Goblinoid)",
    ac: 13,
    hp: 7,
    speed: "30 ft.",
    stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    cr: "1/4",
    tags: ["goblin", "low-level"],
  },
  {
    id: 2,
    name: "Spectral Warrior",
    type: "Undead",
    ac: 16,
    hp: 45,
    speed: "0 ft., fly 40 ft.",
    stats: { str: 16, dex: 14, con: 16, int: 6, wis: 10, cha: 15 },
    cr: "3",
    tags: ["undead", "boss"],
  },
];

const messages = [
  {
    id: 1,
    chat_id: 101,
    user_id: 1,
    character_id: null,
    text: "Welcome, adventurers!",
    timestamp: "2026-05-09T10:00:00Z",
    in_character: false,
  },
  {
    id: 2,
    chat_id: 101,
    user_id: 2,
    character_id: 1,
    text: "Glad to be here.",
    timestamp: "2026-05-09T10:01:00Z",
    in_character: true,
  },
];

const notes = [
  {
    id: 1,
    entity_type: "campaign",
    entity_id: 1,
    title: "Session 1 Recap",
    content: "The party arrived in Phandalin...",
    visibility: "all",
  },
];

const upcomingSessions = [
  {
    id: 1,
    campaign_id: 1,
    title: "Into the Mine",
    date: "2026-05-12T18:00:00Z",
    confirmed: true,
  },
  {
    id: 2,
    campaign_id: 2,
    title: "Strahd's Dinner",
    date: "2026-05-15T20:00:00Z",
    confirmed: false,
  },
];

// ------------------- API FUNCTIONS -------------------
// All functions return promises to simulate async database calls.
// You can later replace the body with actual fetch/Axios calls.

export async function fetchCurrentUser() {
  // Simulate current logged in user (id = 1, GM for now)
  return Promise.resolve(users[0]);
}

export async function fetchCampaigns(userId) {
  // Return campaigns where user is owner or player
  return Promise.resolve(
    campaigns.filter(
      (c) => c.owner_id === userId || c.players.includes(userId)
    )
  );
}

export async function fetchCharacters(userId) {
  return Promise.resolve(
    characters.filter((char) => char.owner_id === userId)
  );
}

export async function fetchCreatures() {
  return Promise.resolve(creatures);
}

export async function fetchMessages(campaignId, chatId) {
  return Promise.resolve(
    messages.filter((msg) => msg.chat_id === chatId)
  );
}

export async function fetchNotes(entityType, entityId) {
  return Promise.resolve(
    notes.filter(
      (note) =>
        note.entity_type === entityType && note.entity_id === entityId
    )
  );
}

export async function fetchUpcomingSessions(userId) {
  // While upcoming sessions are not directly linked to a user,
  // we filter by campaigns the user is part of.
  const userCampaigns = campaigns.filter(
    (c) => c.owner_id === userId || c.players.includes(userId)
  );
  const campaignIds = userCampaigns.map((c) => c.id);
  return Promise.resolve(
    upcomingSessions.filter((s) => campaignIds.includes(s.campaign_id))
  );
}

export async function loginUser(username, password) {
  // Mock login – returns user if found, else null.
  const user = users.find((u) => u.username === username);
  return Promise.resolve(user || null);
}