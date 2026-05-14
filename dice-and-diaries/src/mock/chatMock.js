// Simula datos del chat, campaña, personajes, NPCs y funciones de envío.

const campaign = {
  id: 1,
  name: "Las Minas Perdidas",
};

const currentUser = { id: 1, username: "GM_Dave", isGM: true };
const currentCharacter = { id: 101, name: "Thorn Ironwood", avatarUrl: "/avatars/thorn.png" };

const messages = [
  {
    id: 1,
    chatId: 1,
    senderId: 2,
    senderUsername: "Player_Anna",
    characterId: 101,
    characterName: "Thorn Ironwood",
    characterAvatar: "/avatars/thorn.png",
    type: "text",
    content: "¡Vamos a explorar la cueva!",
    timestamp: "2026-05-10T10:00:00Z",
    isWhisper: false,
    whisperTo: null,
  },
  {
    id: 2,
    chatId: 1,
    senderId: 1,
    senderUsername: "GM_Dave",
    characterId: null,
    characterName: null,
    characterAvatar: null,
    type: "text",
    content: "La entrada está oscura y húmeda.",
    timestamp: "2026-05-10T10:01:00Z",
    isWhisper: false,
    whisperTo: null,
  },
  {
    id: 3,
    chatId: 1,
    senderId: 2,
    senderUsername: "Player_Anna",
    characterId: 101,
    characterName: "Thorn Ironwood",
    characterAvatar: "/avatars/thorn.png",
    type: "dice_roll",
    content: {
      dice: "3d6",
      results: [3, 5, 2],
      total: 10,
      advantage: false,
      disadvantage: false,
    },
    timestamp: "2026-05-10T10:02:00Z",
    isWhisper: false,
    whisperTo: null,
  },
  {
    id: 4,
    chatId: 1,
    senderId: 1,
    senderUsername: "GM_Dave",
    characterId: null,
    characterName: null,
    characterAvatar: null,
    type: "whisper",
    content: "Te noto muy callado, ¿todo bien?",
    timestamp: "2026-05-10T10:03:00Z",
    isWhisper: true,
    whisperTo: 3, // userId del destinatario
  },
  {
    id: 5,
    chatId: 1,
    senderId: 2,
    senderUsername: "Player_Anna",
    characterId: 101,
    characterName: "Thorn Ironwood",
    characterAvatar: "/avatars/thorn.png",
    type: "ability_append",
    content: {
      abilityName: "Furia Salvaje",
      description: "Ganas ventaja en ataques cuerpo a cuerpo durante 1 minuto.",
    },
    timestamp: "2026-05-10T10:04:00Z",
    isWhisper: false,
    whisperTo: null,
  },
  {
    id: 6,
    chatId: 1,
    senderId: 1,
    senderUsername: "GM_Dave",
    characterId: null,
    characterName: null,
    characterAvatar: null,
    type: "note_append",
    content: {
      noteTitle: "Pistas encontradas",
      snippet: "Encontrasteis un diario polvoriento que habla de una llave perdida.",
    },
    timestamp: "2026-05-10T10:05:00Z",
    isWhisper: false,
    whisperTo: null,
  },
];

export async function fetchChatData(campaignId) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    campaign,
    currentUser,
    messages,
    // Lista de personajes del usuario (para hablar como personaje)
    userCharacters: [
      { id: 101, name: "Thorn Ironwood", avatar: "/avatars/thorn.png" },
      { id: 102, name: "Lirael Moonshadow", avatar: "/avatars/lirael.png" },
    ],
    // NPCs de la campaña (solo el GM los ve)
    npcs: [
      { id: 201, name: "Espectro del Bosque", avatar: null },
      { id: 202, name: "Goblin Mensajero", avatar: null },
    ],
    // Usuarios conectados (para susurros)
    onlineUsers: [
      { id: 2, username: "Player_Anna" },
      { id: 3, username: "Player_Ben" },
    ],
  };
}

// Simula envío de mensaje (en una app real sería POST y retornaría el mensaje guardado)
export async function sendMessage(campaignId, messageData) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const newMsg = {
    id: Date.now(),
    chatId: campaignId,
    senderId: messageData.senderId,
    senderUsername: messageData.senderUsername,
    characterId: messageData.characterId || null,
    characterName: messageData.characterName || null,
    characterAvatar: messageData.characterAvatar || null,
    type: messageData.type,
    content: messageData.content,
    timestamp: new Date().toISOString(),
    isWhisper: messageData.isWhisper || false,
    whisperTo: messageData.whisperTo || null,
  };
  return newMsg;
}