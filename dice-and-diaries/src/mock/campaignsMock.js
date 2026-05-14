// Simula la obtención de campañas del usuario actual.
// Datos extendidos con notas, chat y NPCs para los botones.

const mockCampaigns = [
  {
    id: 1,
    name: "Campaña 1: Las Minas Perdidas",
    ownerId: 1,            // 1 es el GM actual
    active: true,
    notesCount: 5,
    chatId: 101,
    npcsCount: 12,
    playersCount: 4,
    players: [1, 2, 3, 4], // El usuario 1 es GM
  },
  {
    id: 2,
    name: "Campaña 2: La Maldición de Strahd",
    ownerId: 1,
    active: false,
    notesCount: 8,
    chatId: 102,
    npcsCount: 20,
    playersCount: 5,
    players: [1, 5, 6, 7, 8], // El usuario 1 es GM
  },
  {
    id: 3,
    name: "Campaña 3: La Tumba de la Aniquilación",
    ownerId: 2,            // otro GM
    active: true,
    notesCount: 3,
    chatId: 103,
    npcsCount: 15,         // no eres GM, no ves los NPCs
    playersCount: 4,
    players: [1, 2, 9, 10], // El usuario 1 es jugador aquí
  },
];

// Usuario actual (simulado)
const currentUserId = 1;

export async function fetchCampaigns(userId = currentUserId) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  // Retorna todas las campañas donde el usuario es GM (ownerId) o jugador (en el array players)
  return mockCampaigns.filter(
    (camp) => camp.ownerId === userId || camp.players?.includes(userId)
  );
}

// También se puede exportar currentUserId para saber si es GM
export function getCurrentUserId() {
  return currentUserId;
}