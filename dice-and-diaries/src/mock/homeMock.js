// Simula la obtención de información resumida del usuario y sus campañas.

const currentUser = { id: 1, username: "GM_Dave", isGM: true };

const homeCampaigns = [
  {
    id: 1,
    name: "Campaña 1",
    lastMessage: "Último Mensaje",
    active: true,
  },
  {
    id: 2,
    name: "Campaña 2",
    lastMessage: "Este es un mensaje largo que...",
    active: false,
  },
];

export async function fetchHomeData() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    user: currentUser,
    campaigns: homeCampaigns,
    recentSessions: [],   // para "Sesiones Anteriores"
    myCharactersCount: 3,
    myCreaturesCount: 5,
  };
}