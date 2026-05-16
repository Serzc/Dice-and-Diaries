// src/mock/profileMock.js

const userProfile = {
  id: 1,
  username: "GM_Dave",
  displayName: "David García",
  email: "david@example.com",
  bio: "Game Master apasionado por la narrativa y los mundos de fantasía. Llevo 5 años dirigiendo campañas.",
  avatarUrl: null,
  joinedAt: "2024-08-01",
  stats: {
    campaigns: 3,
    characters: 2,
    sessions: 24,
    notesWritten: 47,
  },
};

export async function fetchProfile() {
  await new Promise((r) => setTimeout(r, 150));
  return { ...userProfile };
}

export async function saveProfile(data) {
  await new Promise((r) => setTimeout(r, 200));
  Object.assign(userProfile, data);
  return { ...userProfile };
}
