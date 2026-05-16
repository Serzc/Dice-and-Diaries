// src/mock/notesMock.js

const campaigns = {
  1: { name: "Las Minas Perdidas" },
  2: { name: "La Maldición de Strahd" },
  3: { name: "La Tumba de la Aniquilación" },
};

let notes = [
  {
    id: 1, campaignId: 1,
    title: "Sesión 1: El Inicio",
    content: "Los aventureros se reunieron en la Posada del Dragón Rojo en Leilon. El alcalde Harbin Wester los contrató para investigar unas minas al noreste. El grupo estaba formado por Thorn Ironwood (explorador) y Lirael Moonshadow (maga).",
    isPublic: true, authorId: 1, createdAt: "2026-01-10",
  },
  {
    id: 2, campaignId: 1,
    title: "Klarg el Hobgoblin — Notas privadas",
    content: "Klarg sabe la ubicación del campamento de bugbears al norte. No revelarlo hasta que los jugadores lo capturen. Tiene un medallón robado que pertenece a la familia Rockseeker.",
    isPublic: false, authorId: 1, createdAt: "2026-01-10",
  },
  {
    id: 3, campaignId: 1,
    title: "Mapa de las Minas",
    content: "La entrada norte está bloqueada por un derrumbe. La sala central tiene una fuente mágica que restaura un punto de vida al beber (una vez por descanso largo). El nivel inferior contiene el tesoro principal.",
    isPublic: true, authorId: 1, createdAt: "2026-01-17",
  },
  {
    id: 4, campaignId: 1,
    title: "Sesión 3: La Traición",
    content: "Sildar fue capturado por los Puños de Hierro. El grupo negoció su liberación a cambio de escoltar un cargamento. Thorn descubrió que el comerciante local es un informante.",
    isPublic: true, authorId: 1, createdAt: "2026-01-31",
  },
  {
    id: 5, campaignId: 2,
    title: "Llegada a Barovia",
    content: "El grupo despertó envuelto en niebla. Las puertas de Barovia se cerraron detrás de ellos. Los aldeanos los miraron con miedo y suspicacia desde sus ventanas.",
    isPublic: true, authorId: 1, createdAt: "2026-02-07",
  },
  {
    id: 6, campaignId: 2,
    title: "El Castillo Ravenloft — Secretos",
    content: "Strahd tiene tres aliados principales en el castillo. El corazón de la oscuridad se encuentra en la cripta del sótano. La reliquia del sol puede debilitarlo si se combina con agua sagrada.",
    isPublic: false, authorId: 1, createdAt: "2026-02-14",
  },
  {
    id: 7, campaignId: 3,
    title: "La Jungla",
    content: "El calor y la humedad son sofocantes. El grupo encontró rastros de una expedición anterior abandonada hace 3 meses.",
    isPublic: true, authorId: 2, createdAt: "2026-03-01",
  },
];

let nextId = 8;

export async function fetchCampaignNotes(campaignId, isGM) {
  await new Promise((r) => setTimeout(r, 150));
  const all = notes.filter((n) => n.campaignId === Number(campaignId));
  return {
    campaign: campaigns[campaignId] || { name: `Campaña ${campaignId}` },
    notes: isGM ? all : all.filter((n) => n.isPublic),
  };
}

export async function createNote(data) {
  await new Promise((r) => setTimeout(r, 150));
  const note = { ...data, id: nextId++ };
  notes.push(note);
  return { ...note };
}

export async function updateNote(id, data) {
  await new Promise((r) => setTimeout(r, 150));
  const idx = notes.findIndex((n) => n.id === id);
  if (idx !== -1) Object.assign(notes[idx], data);
  return { ...notes[idx] };
}

export async function deleteNote(id) {
  await new Promise((r) => setTimeout(r, 150));
  notes = notes.filter((n) => n.id !== id);
  return { success: true };
}
