// src/mock/plannerMock.js

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

export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const weekDays = getWeekDays(new Date("2026-05-12"));

// mirrors campaignsMock.js — which userIds are in each campaign
const campaignPlayerIds = {
  1: [1, 2, 3, 4],
  2: [1, 5, 6, 7, 8],
  3: [1, 2, 9, 10],
};

const mockAvailability = [
  {
    userId: 1, username: "GM_Dave",
    availability: {
      [weekDays[0]]: ["tarde", "tarde_noche", "noche"],
      [weekDays[2]]: ["noche", "madrugada"],
      [weekDays[4]]: ["tarde", "tarde_noche"],
      [weekDays[5]]: ["manana", "mediodia", "tarde", "tarde_noche"],
    },
  },
  {
    userId: 2, username: "Player_Anna",
    availability: {
      [weekDays[1]]: ["tarde", "tarde_noche"],
      [weekDays[2]]: ["tarde", "noche"],
      [weekDays[4]]: ["tarde_noche", "noche"],
      [weekDays[5]]: ["mediodia", "tarde", "tarde_noche"],
    },
  },
  {
    userId: 3, username: "Player_Ben",
    availability: {
      [weekDays[0]]: ["noche", "madrugada"],
      [weekDays[2]]: ["tarde_noche", "noche"],
      [weekDays[3]]: ["tarde", "tarde_noche"],
      [weekDays[5]]: ["amanecer", "manana", "mediodia"],
    },
  },
  {
    userId: 4, username: "Player_Cris",
    availability: {
      [weekDays[0]]: ["tarde", "tarde_noche"],
      [weekDays[2]]: ["noche"],
      [weekDays[4]]: ["tarde"],
      [weekDays[5]]: ["tarde", "tarde_noche", "noche"],
    },
  },
  {
    userId: 5, username: "Player_Dan",
    availability: {
      [weekDays[1]]: ["amanecer", "manana"],
      [weekDays[3]]: ["tarde", "tarde_noche"],
      [weekDays[6]]: ["mediodia", "tarde"],
    },
  },
  {
    userId: 6, username: "Player_Elena",
    availability: {
      [weekDays[0]]: ["mediodia", "tarde"],
      [weekDays[2]]: ["tarde", "tarde_noche"],
      [weekDays[5]]: ["noche", "madrugada"],
    },
  },
  {
    userId: 7, username: "Player_Felipe",
    availability: {
      [weekDays[2]]: ["manana", "mediodia"],
      [weekDays[4]]: ["tarde_noche", "noche"],
      [weekDays[6]]: ["tarde", "noche"],
    },
  },
  {
    userId: 8, username: "Player_Gabi",
    availability: {
      [weekDays[1]]: ["noche", "madrugada"],
      [weekDays[3]]: ["tarde_noche"],
      [weekDays[5]]: ["tarde", "tarde_noche"],
    },
  },
  {
    userId: 9, username: "Player_Hugo",
    availability: {
      [weekDays[0]]: ["manana"],
      [weekDays[2]]: ["mediodia", "tarde"],
      [weekDays[4]]: ["noche"],
    },
  },
  {
    userId: 10, username: "Player_Iris",
    availability: {
      [weekDays[1]]: ["tarde", "tarde_noche"],
      [weekDays[3]]: ["manana", "mediodia"],
      [weekDays[5]]: ["amanecer", "manana"],
    },
  },
];

const CURRENT_USER_ID = 1;
let userAvailability = { ...mockAvailability[0].availability };

export async function fetchPlanner(campaignId) {
  await new Promise((r) => setTimeout(r, 150));
  const playerIds = campaignPlayerIds[Number(campaignId)] ?? [];
  const participants = mockAvailability.filter((p) => playerIds.includes(p.userId));
  return {
    participants,
    currentUserId: CURRENT_USER_ID,
    currentUserAvailability: { ...userAvailability },
  };
}

export async function toggleSlot(date, slotId) {
  await new Promise((r) => setTimeout(r, 100));
  const slots = userAvailability[date] || [];
  if (slots.includes(slotId)) {
    userAvailability[date] = slots.filter((s) => s !== slotId);
    if (userAvailability[date].length === 0) delete userAvailability[date];
  } else {
    userAvailability[date] = [...slots, slotId];
  }
  mockAvailability[0].availability = { ...userAvailability };
  return { ...userAvailability };
}

export function computeOverlap(participants, date, slotId) {
  return participants.filter((p) => p.availability[date]?.includes(slotId)).length;
}
