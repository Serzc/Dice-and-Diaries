// src/mock/playersMock.js

const allUsers = {
  1: { id: 1, username: "GM_Dave", displayName: "David García", avatarUrl: null },
  2: { id: 2, username: "Player_Anna", displayName: "Ana Martínez", avatarUrl: null },
  3: { id: 3, username: "Player_Ben", displayName: "Benjamín Torres", avatarUrl: null },
  4: { id: 4, username: "Player_Cris", displayName: "Cristina López", avatarUrl: null },
  5: { id: 5, username: "Player_Dan", displayName: "Daniel Rojas", avatarUrl: null },
  6: { id: 6, username: "Player_Elena", displayName: "Elena Vega", avatarUrl: null },
  7: { id: 7, username: "Player_Felipe", displayName: "Felipe Mora", avatarUrl: null },
  8: { id: 8, username: "Player_Gabi", displayName: "Gabriela Ruiz", avatarUrl: null },
  9: { id: 9, username: "Player_Hugo", displayName: "Hugo Sánchez", avatarUrl: null },
  10: { id: 10, username: "Player_Iris", displayName: "Iris Delgado", avatarUrl: null },
};

const campaignPlayers = {
  1: { ownerId: 1, playerIds: [1, 2, 3, 4] },
  2: { ownerId: 1, playerIds: [1, 5, 6, 7, 8] },
  3: { ownerId: 2, playerIds: [1, 2, 9, 10] },
};

export async function fetchCampaignPlayers(campaignId) {
  await new Promise((r) => setTimeout(r, 150));
  const cp = campaignPlayers[Number(campaignId)];
  if (!cp) return { ownerId: null, players: [] };
  const players = cp.playerIds.map((id) => allUsers[id]).filter(Boolean);
  return { ownerId: cp.ownerId, players };
}

export async function kickPlayer(campaignId, userId) {
  await new Promise((r) => setTimeout(r, 200));
  const cp = campaignPlayers[Number(campaignId)];
  if (cp) cp.playerIds = cp.playerIds.filter((id) => id !== userId);
  return { success: true };
}

export async function invitePlayer(campaignId, username) {
  await new Promise((r) => setTimeout(r, 200));
  const user = Object.values(allUsers).find((u) => u.username === username);
  if (!user) throw new Error(`Usuario "${username}" no encontrado.`);
  const cp = campaignPlayers[Number(campaignId)];
  if (cp && !cp.playerIds.includes(user.id)) cp.playerIds.push(user.id);
  return { ...user };
}
