// ========================
// src/mock/db.js  –  Supabase backend
// All exported signatures are identical to the original mock so no
// page/component imports need to change.
// ========================
import { supabase } from "../lib/supabase";
import { serializeSpellSlots } from "../utils/characterDataAdapter";

// ── Helpers ───────────────────────────────────────────────────────────────────
const _clone = obj => JSON.parse(JSON.stringify(obj));

function _parseJSON(str, fallback) {
  if (str == null) return fallback;
  if (typeof str !== "string") return str;
  try { return JSON.parse(str); } catch { return fallback; }
}

function _toJSON(val) { return JSON.stringify(val ?? null); }

function _parseComma(str) {
  if (!str) return [];
  return str.split(",").map(s => s.trim()).filter(Boolean);
}

function _serializeComma(arr) { return (arr || []).join(", "); }

// Compact 12-char ability scores string ↔ {str,dex,con,int,wis,cha}
const _AB = ["str", "dex", "con", "int", "wis", "cha"];
function _parseAbil(str) {
  if (typeof str !== "string") return str ?? { str:10,dex:10,con:10,int:10,wis:10,cha:10 };
  const o = {};
  _AB.forEach((k, i) => { o[k] = parseInt(str.slice(i*2, i*2+2), 10) || 10; });
  return o;
}
function _serializeAbil(obj) {
  return _AB.map(k => String(obj[k] ?? 10).padStart(2, "0")).join("");
}

// Parse compact spellSlots string → {1:{max,current}, ...}
function _parseSlots(raw) {
  if (typeof raw !== "string") return raw ?? {};
  const slots = {};
  for (let lv = 1; lv <= 9; lv++) {
    const idx = (lv - 1) * 2;
    const max     = parseInt(raw[idx]     ?? "0", 10);
    const current = parseInt(raw[idx + 1] ?? "0", 10);
    if (max > 0) slots[lv] = { max, current };
  }
  return slots;
}

// ── Current user (mutable singleton used by pages directly) ──────────────────
let CURRENT_USER_ID = null;
export const currentUser = { id: null, isGM: false };

export function getCurrentUserId() { return CURRENT_USER_ID; }

export function setCurrentUser({ id, isGM }) {
  CURRENT_USER_ID   = id ?? null;
  currentUser.id    = CURRENT_USER_ID;
  currentUser.isGM  = isGM !== undefined ? isGM : false;
}

// ── Utility exports (pure – no DB needed) ────────────────────────────────────
function _mod(score) { return Math.floor((score - 10) / 2); }
export function fmtMod(score) { const m = _mod(score); return m >= 0 ? `+${m}` : `${m}`; }

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

export const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

export function computeOverlap(participants, date, slotId) {
  return participants.filter(p => p.availability[date]?.includes(slotId)).length;
}

// ── Creature serialization helpers ───────────────────────────────────────────
function _deserializeCreature(row, campaignIds = []) {
  return {
    id:               row.id,
    name:             row.name,
    folderId:         row.folderId ?? null,
    imageUrl:         row.imageUrl ?? null,
    campaignIds,
    cr:               row.cr ?? "",
    size:             row.size,
    creatureType:     row.creatureType,
    alignment:        row.alignment ?? "",
    ac:               row.ac,
    acNote:           row.acNote ?? "",
    hp: {
      current: row.currentHp,
      max:     row.hpMax,
      formula: row.hpFormula ?? "",
    },
    speed:              row.speed,
    abilityScores:      _parseAbil(row.abilityScores),
    savingThrows:       _parseJSON(row.savingThrows, []),
    skills:             _parseJSON(row.skills, []),
    damageImmunities:   _parseComma(row.damageImmunities),
    damageResistances:  _parseComma(row.damageResistances),
    conditionImmunities:_parseComma(row.conditionImmunities),
    senses:             row.senses ?? "",
    languages:          row.languages ?? "",
    specialTraits:      _parseJSON(row.specialTraits, []),
    actions:            _parseJSON(row.actions, []),
    bonusActions:       _parseJSON(row.bonusActions, []),
    reactions:          _parseJSON(row.reactions, []),
    gmNotes:            row.gmNotes ?? "",
    playerVisibleNotes: row.playerVisibleNotes ?? "",
  };
}

function _serializeCreature(creature) {
  return {
    name:               creature.name,
    size:               creature.size,
    creatureType:       creature.creatureType,
    alignment:          creature.alignment || null,
    cr:                 creature.cr || null,
    ac:                 creature.ac,
    acNote:             creature.acNote || null,
    hpMax:              creature.hp?.max     ?? creature.hpMax,
    currentHp:          creature.hp?.current ?? creature.currentHp,
    hpFormula:          creature.hp?.formula  ?? creature.hpFormula ?? null,
    speed:              creature.speed,
    abilityScores:      _serializeAbil(creature.abilityScores ?? {}),
    savingThrows:       _toJSON(creature.savingThrows ?? []),
    skills:             _toJSON(creature.skills ?? []),
    damageImmunities:   _serializeComma(creature.damageImmunities),
    damageResistances:  _serializeComma(creature.damageResistances),
    conditionImmunities:_serializeComma(creature.conditionImmunities),
    senses:             creature.senses || null,
    languages:          creature.languages || null,
    specialTraits:      _toJSON(creature.specialTraits ?? []),
    actions:            _toJSON(creature.actions ?? []),
    bonusActions:       _toJSON(creature.bonusActions ?? []),
    reactions:          _toJSON(creature.reactions ?? []),
    gmNotes:            creature.gmNotes || null,
    playerVisibleNotes: creature.playerVisibleNotes || null,
    folderId:           creature.folderId || null,
    ownerId:            CURRENT_USER_ID,
  };
}

// ── Character deserialization helper ─────────────────────────────────────────
// Returns a "raw DB" object that characterDataAdapter.fromDatabase() can parse.
function _deserializeCharacter(row, campaignIds = []) {
  return {
    // Pass compact string fields through – fromDatabase() handles them
    ...row,
    classes:        row.classes ? row.classes.split(",").map(s => s.trim()) : [],
    inventory:      _parseJSON(row.inventory, []),
    stored_features:_parseJSON(row.features, []),
    character_note: _parseJSON(row.characterNote, { id: Date.now(), title: "Historia", content: "" }),
    proficiency_list:_parseJSON(row.proficiencyList, []),
    campaign_ids:   campaignIds,
    spellcasting: {
      ability: row.spellcastingAbility || "int",
      slots:   row.spellSlots,   // compact string – fromDatabase() parses it
      spells:  _parseJSON(row.spells, []),
    },
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginUser(username, password) {
  const { data: users, error } = await supabase
    .from("User")
    .select("*")
    .eq("username", username)
    .eq("passwordHash", password)
    .eq("active", true)
    .limit(1);

  if (error || !users?.length) return null;
  const user = users[0];

  // Determine global GM flag: user is GM if they own any campaign
  const { data: gmRows } = await supabase
    .from("UserXCampaign")
    .select("campaignId")
    .eq("userId", user.id)
    .eq("role", "gm")
    .limit(1);

  const isGM = !!(gmRows?.length);

  const { passwordHash: _pw, ...safeUser } = user;
  return { ...safeUser, isGM };
}

// ── Campaign functions ────────────────────────────────────────────────────────
export async function fetchCampaigns(userId = CURRENT_USER_ID) {
  const { data: memberships } = await supabase
    .from("UserXCampaign")
    .select("campaignId")
    .eq("userId", userId);

  const ids = (memberships || []).map(m => m.campaignId);
  if (!ids.length) return [];

  const [{ data: campaigns }, { data: allMembers }, { data: creatureLinks }, { data: notes }] =
    await Promise.all([
      supabase.from("Campaign").select("*").in("id", ids),
      supabase.from("UserXCampaign").select("campaignId, userId").in("campaignId", ids),
      supabase.from("CreatureXCampaign").select("campaignId").in("campaignId", ids),
      supabase.from("Note").select("campaignId").in("campaignId", ids).eq("active", true),
    ]);

  return (campaigns || []).map(c => {
    const members   = (allMembers   || []).filter(m => m.campaignId === c.id);
    const playerIds = members.map(m => m.userId);
    return {
      ...c,
      players:      playerIds,
      playersCount: playerIds.length,
      npcsCount:    (creatureLinks || []).filter(cr => cr.campaignId === c.id).length,
      notesCount:   (notes         || []).filter(n  => n.campaignId  === c.id).length,
    };
  });
}

export async function fetchHomeData(userId = CURRENT_USER_ID) {
  const campaigns = await fetchCampaigns(userId);

  const { data: userRow } = await supabase
    .from("User").select("*").eq("id", userId).single();
  const { passwordHash: _pw, ...safeUser } = userRow ?? {};

  // Last message per campaign (from Chat → Message join)
  const chatIds = campaigns.map(c => c.id); // campaign id == chat id in seed
  const { data: lastMsgs } = await supabase
    .from("Message")
    .select("chatId, type, content")
    .in("chatId", chatIds)
    .order("timestamp", { ascending: false });

  // Build a map: chatId → last message
  const lastByChat = {};
  (lastMsgs || []).forEach(msg => {
    if (!lastByChat[msg.chatId]) lastByChat[msg.chatId] = msg;
  });

  return {
    user: safeUser,
    campaigns: campaigns.map(c => {
      const lastMsg = lastByChat[c.id];
      let lastMessage = "";
      if (lastMsg) {
        if (lastMsg.type === "text" || lastMsg.type === "whisper") {
          lastMessage = typeof lastMsg.content === "string" ? lastMsg.content : "";
        } else if (lastMsg.type === "dice_roll") {
          const d = _parseJSON(lastMsg.content, {});
          lastMessage = `🎲 ${d.dice} = ${d.total}`;
        } else if (lastMsg.type === "ability_append") {
          const d = _parseJSON(lastMsg.content, {});
          lastMessage = `⚡ ${d.abilityName}`;
        } else if (lastMsg.type === "note_append") {
          const d = _parseJSON(lastMsg.content, {});
          lastMessage = `📝 ${d.noteTitle}`;
        }
      }
      return { id: c.id, name: c.name, active: c.active, imageUrl: c.imageUrl, lastMessage, unreadCount: 0 };
    }),
    recentSessions: [],
    myCharactersCount: 0, // computed below
    myCreaturesCount:  0,
  };
}

export async function createCampaign({ name, description = "" }) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data: camp, error } = await supabase
    .from("Campaign")
    .insert({ name, description, ownerId: CURRENT_USER_ID, active: false, inviteCode: code })
    .select()
    .single();

  if (error) throw error;

  await Promise.all([
    supabase.from("UserXCampaign").insert({ userId: CURRENT_USER_ID, campaignId: camp.id, role: "gm" }),
    supabase.from("Chat").insert({ campaignId: camp.id }),
  ]);

  return _clone(camp);
}

export async function joinCampaignByCode(code) {
  const { data: camps } = await supabase
    .from("Campaign")
    .select("*")
    .ilike("inviteCode", code.trim());

  if (!camps?.length) throw new Error(`Código "${code}" no encontrado.`);
  const camp = camps[0];

  await supabase
    .from("UserXCampaign")
    .upsert({ userId: CURRENT_USER_ID, campaignId: camp.id, role: "player" }, { onConflict: "userId,campaignId" });

  return _clone(camp);
}

export async function toggleCampaignActive(campaignId) {
  const id = Number(campaignId);
  const { data: camp } = await supabase.from("Campaign").select("active").eq("id", id).single();
  const { data: updated, error } = await supabase
    .from("Campaign").update({ active: !camp.active }).eq("id", id).select().single();
  if (error) throw error;
  return _clone(updated);
}

export async function deleteCampaign(campaignId) {
  await supabase.from("Campaign").update({ active: false }).eq("id", Number(campaignId));
  return { success: true };
}

// ── Player functions ──────────────────────────────────────────────────────────
export async function fetchCampaignPlayers(campaignId) {
  const { data: camp } = await supabase
    .from("Campaign").select("ownerId").eq("id", Number(campaignId)).single();
  const { data: members } = await supabase
    .from("UserXCampaign").select("userId").eq("campaignId", Number(campaignId));

  const ids = (members || []).map(m => m.userId);
  const { data: users } = await supabase.from("User").select("*").in("id", ids);

  const players = (users || []).map(u => { const { passwordHash: _pw, ...safe } = u; return safe; });
  return { ownerId: camp?.ownerId ?? null, players };
}

export async function kickPlayer(campaignId, userId) {
  await supabase
    .from("UserXCampaign")
    .delete()
    .eq("campaignId", Number(campaignId))
    .eq("userId", userId);
  return { success: true };
}

export async function invitePlayer(campaignId, username) {
  const { data: users } = await supabase
    .from("User").select("*").eq("username", username).eq("active", true).limit(1);
  if (!users?.length) throw new Error(`Usuario "${username}" no encontrado.`);
  const user = users[0];

  await supabase
    .from("UserXCampaign")
    .upsert({ userId: user.id, campaignId: Number(campaignId), role: "player" }, { onConflict: "userId,campaignId" });

  const { passwordHash: _pw, ...safeUser } = user;
  return safeUser;
}

// ── Character functions ───────────────────────────────────────────────────────
export async function fetchUserCharacters(userId = CURRENT_USER_ID) {
  const { data: chars } = await supabase
    .from("Character").select("id, name, classes, level, species, background, imageUrl, ownerId")
    .eq("ownerId", userId).eq("active", true);

  if (!chars?.length) return [];

  const charIds = chars.map(c => c.id);
  const { data: links } = await supabase
    .from("CharacterXCampaign").select("characterId, campaignId").in("characterId", charIds);
  const allCampIds = [...new Set((links || []).map(l => l.campaignId))];
  const { data: allCamps } = allCampIds.length
    ? await supabase.from("Campaign").select("id, name").in("id", allCampIds)
    : { data: [] };

  return chars.map(c => ({
    id:         c.id,
    userId:     c.ownerId,
    name:       c.name,
    classes:    c.classes ? c.classes.split(",").map(s => s.trim()) : [],
    level:      c.level,
    species:    c.species,
    background: c.background,
    imageUrl:   c.imageUrl,
    stats:      {},
    campaigns: (links || [])
      .filter(l => l.characterId === c.id)
      .map(l => { const camp = (allCamps || []).find(x => x.id === l.campaignId); return camp ?? null; })
      .filter(Boolean),
  }));
}

export async function createCharacter() {
  const { data: newChar, error } = await supabase
    .from("Character")
    .insert({
      name: "Nuevo Personaje", classes: "", species: "", background: "", level: 1,
      imageUrl: null,
      abilityScores: "101010101010", saveProficiencies: "000000",
      skillProficiencies: "000000000000000000",
      speed: 30, hpMax: 8, currentHp: 8, tempHp: 0,
      hitDiceType: "d8", hitDiceTotal: 1, hitDiceRemaining: 1,
      spellcastingAbility: "int", spellSlots: "000000000000000000",
      actions: "[]", bonusActions: "[]", otherProficiencies: "[]",
      features: "[]", inventory: "[]", spells: "[]",
      characterNote: JSON.stringify({ id: Date.now(), title: "Historia", content: "" }),
      proficiencyList: "[]",
      ownerId: CURRENT_USER_ID,
    })
    .select("id")
    .single();

  if (error) throw error;
  return { id: newChar.id };
}

export async function fetchCharacterSheet(characterId) {
  const id = Number(characterId);
  const [{ data: char, error }, { data: links }] = await Promise.all([
    supabase.from("Character").select("*").eq("id", id).single(),
    supabase.from("CharacterXCampaign").select("campaignId").eq("characterId", id),
  ]);
  if (error || !char) throw new Error(`Personaje ${characterId} no encontrado.`);

  return _deserializeCharacter(char, (links || []).map(l => l.campaignId));
}

export async function saveCharacterSection(characterId, section, data) {
  const id = Number(characterId);
  let update = {};

  if (section === "core") {
    update = { ...data };
    delete update.id;
    // Ensure classes array is serialized
    if (Array.isArray(update.classes)) update.classes = update.classes.join(",");
  } else if (section === "inventory") {
    update = { inventory: _toJSON(data) };
  } else if (section === "actions") {
    update = { actions: _toJSON(data) };
  } else if (section === "bonusActions" || section === "bonus_actions") {
    update = { bonusActions: _toJSON(data) };
  } else if (section === "otherProficiencies" || section === "other_proficiencies") {
    update = { otherProficiencies: _toJSON(data) };
  } else if (section === "features" || section === "stored_features") {
    update = { features: _toJSON(data) };
  } else if (section === "characterNote") {
    update = { characterNote: _toJSON(data) };
  } else if (section === "spellSlots") {
    update = { spellSlots: serializeSpellSlots(data) };
  } else if (section === "spellcastingAbility") {
    update = { spellcastingAbility: data };
  } else if (section === "spells") {
    update = { spells: _toJSON(data) };
  } else if (section === "spellcasting") {
    update = {
      spellcastingAbility: data.ability,
      spellSlots: serializeSpellSlots(data.slots ?? {}),
      spells: _toJSON(data.spells ?? []),
    };
  } else {
    // Generic fallback: store as JSON
    update = { [section]: _toJSON(data) };
  }

  const { error } = await supabase.from("Character").update(update).eq("id", id);
  if (error) console.error("saveCharacterSection error:", error);
  return { success: !error };
}

export async function fetchCharacterNotesInCampaign(_characterId, _campaignId) {
  return [];
}

export async function fetchFeatures(characterId) {
  const { data } = await supabase
    .from("Character").select("features").eq("id", Number(characterId)).single();
  return _parseJSON(data?.features, []);
}

export async function fetchActions(characterId) {
  const { data } = await supabase
    .from("Character").select("actions").eq("id", Number(characterId)).single();
  return _parseJSON(data?.actions, []);
}

export async function fetchBonusActions(characterId) {
  const { data } = await supabase
    .from("Character").select("bonusActions").eq("id", Number(characterId)).single();
  return _parseJSON(data?.bonusActions, []);
}

export async function fetchOtherProficiencies(characterId) {
  const { data } = await supabase
    .from("Character").select("otherProficiencies").eq("id", Number(characterId)).single();
  return _parseJSON(data?.otherProficiencies, []);
}

export async function fetchSpellcastingData(characterId) {
  const { data } = await supabase
    .from("Character")
    .select("spellcastingAbility, spellSlots, spells")
    .eq("id", Number(characterId))
    .single();
  return {
    ability: data?.spellcastingAbility || "int",
    slots:   _parseSlots(data?.spellSlots || "000000000000000000"),
    spells:  _parseJSON(data?.spells, []),
  };
}

export async function fetchInventory(characterId) {
  const { data } = await supabase
    .from("Character").select("inventory").eq("id", Number(characterId)).single();
  return _parseJSON(data?.inventory, []);
}

export async function fetchCharacterNote(characterId) {
  const { data } = await supabase
    .from("Character").select("characterNote").eq("id", Number(characterId)).single();
  return _parseJSON(data?.characterNote, { id: Date.now(), title: "Historia", content: "" });
}

export async function fetchCharacterCampaigns(characterId) {
  const { data: links } = await supabase
    .from("CharacterXCampaign").select("campaignId").eq("characterId", Number(characterId));
  if (!links?.length) return [];

  const campIds = links.map(l => l.campaignId);
  const { data: camps } = await supabase.from("Campaign").select("id, name").in("id", campIds);
  return camps || [];
}

// ── Creature functions ────────────────────────────────────────────────────────
function _buildBreadcrumb(folders, folderId) {
  const crumbs = [];
  let current = folders.find(f => f.id === folderId);
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    current = folders.find(f => f.id === current.parentFolderId);
  }
  return crumbs;
}

export async function fetchCreaturesInFolder(folderId = null) {
  const [{ data: allFolders }, creaturesQuery, campaignLinksQuery] = await Promise.all([
    supabase.from("CreatureFolder").select("*").eq("active", true),
    folderId == null
      ? supabase.from("Creature").select("*").is("folderId", null).eq("active", true)
      : supabase.from("Creature").select("*").eq("folderId", folderId).eq("active", true),
    supabase.from("CreatureXCampaign").select("creatureId, campaignId"),
  ]);

  const creatures = creaturesQuery.data || [];
  const links     = campaignLinksQuery.data || [];
  const folders   = allFolders || [];

  const numericFolderId = folderId ? Number(folderId) : null;

  return {
    folders:       folders.filter(f => f.parentFolderId === numericFolderId),
    creatures:     creatures.map(c => {
      const campaignIds = links.filter(l => l.creatureId === c.id).map(l => l.campaignId);
      return _deserializeCreature(c, campaignIds);
    }),
    currentFolder: numericFolderId ? (folders.find(f => f.id === numericFolderId) || null) : null,
    breadcrumb:    numericFolderId ? _buildBreadcrumb(folders, numericFolderId) : [],
  };
}

export async function fetchCreature(creatureId) {
  const id = Number(creatureId);
  const [{ data: row, error }, { data: links }] = await Promise.all([
    supabase.from("Creature").select("*").eq("id", id).single(),
    supabase.from("CreatureXCampaign").select("campaignId").eq("creatureId", id),
  ]);
  if (error || !row) throw new Error(`Criatura '${creatureId}' no encontrada.`);

  return _deserializeCreature(row, (links || []).map(l => l.campaignId));
}

export async function saveCreature(id, data) {
  const numId = Number(id);
  const serialized = _serializeCreature(data);
  delete serialized.ownerId; // don't overwrite owner on save
  const { error } = await supabase.from("Creature").update(serialized).eq("id", numId);
  if (error) console.error("saveCreature error:", error);
  return { success: !error };
}

export async function createCreature(data) {
  const payload = _serializeCreature({ ...data, ownerId: CURRENT_USER_ID });
  const { data: newRow, error } = await supabase
    .from("Creature").insert(payload).select().single();
  if (error) throw error;

  const campaignIds = data.campaignIds || [];
  if (campaignIds.length) {
    await supabase.from("CreatureXCampaign").insert(
      campaignIds.map(cid => ({ creatureId: newRow.id, campaignId: cid }))
    );
  }
  return _deserializeCreature(newRow, campaignIds);
}

export async function createFolder(name, parentId = null) {
  const { data: folder, error } = await supabase
    .from("CreatureFolder")
    .insert({ name, parentFolderId: parentId || null, ownerId: CURRENT_USER_ID })
    .select()
    .single();
  if (error) throw error;
  return { ...folder };
}

export async function addCreatureToCampaign(creatureId, campaignId) {
  const cid = Number(creatureId);
  await supabase
    .from("CreatureXCampaign")
    .upsert({ creatureId: cid, campaignId: Number(campaignId) }, { onConflict: "creatureId,campaignId" });
  return fetchCreature(cid);
}

export async function removeCreatureFromCampaign(creatureId, campaignId) {
  const cid = Number(creatureId);
  await supabase
    .from("CreatureXCampaign")
    .delete()
    .eq("creatureId", cid)
    .eq("campaignId", Number(campaignId));
  return fetchCreature(cid);
}

// ── Creature notes ────────────────────────────────────────────────────────────
export async function fetchCreatureNotes(creatureId) {
  const { data } = await supabase
    .from("CreatureNote")
    .select("*")
    .eq("creatureId", Number(creatureId))
    .eq("active", true)
    .order("createdAt", { ascending: false });
  return _clone(data || []);
}

export async function createCreatureNote(data) {
  const { data: note, error } = await supabase
    .from("CreatureNote")
    .insert({
      creatureId:  Number(data.creatureId),
      title:       data.title,
      content:     data.content ?? "",
      visibility:  data.visibility ?? "gm",
      authorId:    data.authorId ?? CURRENT_USER_ID,
    })
    .select()
    .single();
  if (error) throw error;
  return _clone(note);
}

export async function updateCreatureNote(id, data) {
  const { data: note, error } = await supabase
    .from("CreatureNote")
    .update({ title: data.title, content: data.content, visibility: data.visibility })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("Nota no encontrada");
  return _clone(note);
}

export async function deleteCreatureNote(id) {
  await supabase.from("CreatureNote").update({ active: false }).eq("id", id);
}

// ── Campaign note functions ───────────────────────────────────────────────────
export async function fetchCampaignNotes(campaignId, isGM) {
  const numId = Number(campaignId);
  const { data: camp } = await supabase
    .from("Campaign").select("name").eq("id", numId).single();

  let query = supabase.from("Note").select("*").eq("campaignId", numId).eq("active", true);
  if (!isGM) query = query.eq("isPublic", true);
  const { data: notes } = await query;

  return {
    campaign: camp ? { name: camp.name } : { name: `Campaña ${campaignId}` },
    notes: notes || [],
  };
}

export async function createNote(data) {
  const { data: note, error } = await supabase.from("Note").insert(data).select().single();
  if (error) throw error;
  return _clone(note);
}

export async function updateNote(id, data) {
  const { data: note } = await supabase
    .from("Note").update(data).eq("id", id).select().single();
  return _clone(note);
}

export async function deleteNote(id) {
  await supabase.from("Note").update({ active: false }).eq("id", id);
  return { success: true };
}

// ── Chat functions ────────────────────────────────────────────────────────────
export async function fetchChatData(campaignId) {
  const numId = Number(campaignId);

  const [
    { data: camp },
    { data: members },
    { data: chat },
  ] = await Promise.all([
    supabase.from("Campaign").select("*").eq("id", numId).single(),
    supabase.from("UserXCampaign").select("userId, role").eq("campaignId", numId),
    supabase.from("Chat").select("id").eq("campaignId", numId).single(),
  ]);

  const chatId = chat?.id;
  const memberIds = (members || []).map(m => m.userId);
  const gmEntry = (members || []).find(m => m.role === "gm");

  const [
    { data: users },
    { data: messages },
    { data: charLinks },
    { data: creatureLinks },
  ] = await Promise.all([
    supabase.from("User").select("id, username").in("id", memberIds),
    chatId
      ? supabase.from("Message").select("*").eq("chatId", chatId).order("timestamp", { ascending: true })
      : { data: [] },
    supabase.from("CharacterXCampaign")
      .select("characterId")
      .eq("campaignId", numId),
    supabase.from("CreatureXCampaign")
      .select("creatureId")
      .eq("campaignId", numId),
  ]);

  // Characters the current user can speak as
  const myCharIds = (charLinks || []).map(l => l.characterId);
  let userCharacters = [];
  if (myCharIds.length) {
    const { data: chars } = await supabase
      .from("Character")
      .select("id, name, imageUrl, ownerId")
      .in("id", myCharIds)
      .eq("ownerId", CURRENT_USER_ID);
    userCharacters = (chars || []).map(ch => ({ id: ch.id, name: ch.name, avatar: ch.imageUrl }));
  }

  // NPCs
  const npcIds = (creatureLinks || []).map(l => l.creatureId);
  let npcs = [];
  if (npcIds.length) {
    const { data: creatures } = await supabase
      .from("Creature").select("id, name, imageUrl").in("id", npcIds);
    npcs = (creatures || []).map(c => ({ id: c.id, name: c.name, creatureId: c.id, avatar: c.imageUrl }));
  }

  const onlineUsers = (users || [])
    .filter(u => u.id !== CURRENT_USER_ID)
    .map(u => ({ id: u.id, username: u.username }));

  // Deserialize message content
  const parsedMessages = (messages || []).map(msg => {
    let content = msg.content;
    if (msg.type !== "text" && msg.type !== "whisper") {
      content = _parseJSON(msg.content, msg.content);
    }
    return { ...msg, content };
  });

  return {
    campaign:     camp || { id: campaignId, name: `Campaña ${campaignId}` },
    currentUser:  { id: CURRENT_USER_ID, username: (users || []).find(u => u.id === CURRENT_USER_ID)?.username ?? "", isGM: gmEntry?.userId === CURRENT_USER_ID },
    messages:     parsedMessages,
    userCharacters,
    npcs,
    onlineUsers,
  };
}

export async function sendMessage(campaignId, messageData) {
  const numId = Number(campaignId);
  const { data: chat } = await supabase
    .from("Chat").select("id").eq("campaignId", numId).single();

  const chatId = chat?.id;
  if (!chatId) throw new Error("Chat not found for campaign " + campaignId);

  // Serialize content if it's an object (dice_roll, ability_append, note_append)
  const content = typeof messageData.content === "object"
    ? JSON.stringify(messageData.content)
    : messageData.content;

  const { data: newMsg, error } = await supabase
    .from("Message")
    .insert({
      chatId,
      senderId:        messageData.senderId,
      senderUsername:  messageData.senderUsername,
      characterId:     Number.isInteger(messageData.characterId) ? messageData.characterId : null,
      characterName:   messageData.characterName   || null,
      characterAvatar: messageData.characterAvatar || null,
      type:            messageData.type,
      content,
      isWhisper:       messageData.isWhisper  || false,
      whisperTo:       messageData.whisperTo  || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Return in the same shape the UI expects (content as object when applicable)
  let parsedContent = newMsg.content;
  if (newMsg.type !== "text" && newMsg.type !== "whisper") {
    parsedContent = _parseJSON(newMsg.content, newMsg.content);
  }
  return { ...newMsg, content: parsedContent };
}

// ── Profile functions ─────────────────────────────────────────────────────────
export async function fetchProfile(userId = CURRENT_USER_ID) {
  const { data: user, error } = await supabase
    .from("User").select("*").eq("id", userId).single();
  if (error || !user) throw new Error(`Usuario ${userId} no encontrado.`);

  const { passwordHash: _pw, ...safeUser } = user;

  const [{ data: memberships }, { data: chars }, { data: notes }] = await Promise.all([
    supabase.from("UserXCampaign").select("campaignId").eq("userId", userId),
    supabase.from("Character").select("id").eq("ownerId", userId).eq("active", true),
    supabase.from("Note").select("id").eq("authorId", userId).eq("active", true),
  ]);

  return {
    ...safeUser,
    stats: {
      campaigns:    (memberships || []).length,
      characters:   (chars       || []).length,
      sessions:     0,
      notesWritten: (notes       || []).length,
    },
  };
}

export async function saveProfile(data, userId = CURRENT_USER_ID) {
  const { stats: _s, password: _p, passwordHash: _ph, ...editable } = data;
  await supabase.from("User").update(editable).eq("id", userId);
  return fetchProfile(userId);
}

// ── Planner functions ─────────────────────────────────────────────────────────
export async function fetchPlanner(campaignId) {
  const { data: members } = await supabase
    .from("UserXCampaign").select("userId").eq("campaignId", Number(campaignId));
  const playerIds = (members || []).map(m => m.userId);

  const { data: users } = await supabase
    .from("User").select("id, username").in("id", playerIds);

  const weekDays = getWeekDays(new Date());
  const { data: avail } = await supabase
    .from("Availability")
    .select("userId, date, slots")
    .in("userId", playerIds)
    .gte("date", weekDays[0])
    .lte("date", weekDays[6]);

  // Group availability by userId → { date: [slotId, ...] }
  function _groupAvail(userId) {
    const byDate = {};
    (avail || []).filter(a => a.userId === userId).forEach(a => {
      byDate[a.date] = _parseComma(a.slots);
    });
    return byDate;
  }

  const participants = playerIds.map(uid => ({
    userId:       uid,
    username:     (users || []).find(u => u.id === uid)?.username || `User${uid}`,
    availability: _groupAvail(uid),
  }));

  return {
    participants,
    currentUserId:            CURRENT_USER_ID,
    currentUserAvailability:  _groupAvail(CURRENT_USER_ID),
  };
}

export async function toggleSlot(date, slotId) {
  // Get existing row for this user+date
  const { data: existing } = await supabase
    .from("Availability")
    .select("id, slots")
    .eq("userId", CURRENT_USER_ID)
    .eq("date", date)
    .single();

  const current = existing ? _parseComma(existing.slots) : [];
  let updated;
  if (current.includes(slotId)) {
    updated = current.filter(s => s !== slotId);
  } else {
    updated = [...current, slotId];
  }

  if (existing) {
    if (updated.length === 0) {
      await supabase.from("Availability").delete().eq("id", existing.id);
    } else {
      await supabase.from("Availability")
        .update({ slots: updated.join(",") })
        .eq("id", existing.id);
    }
  } else if (updated.length > 0) {
    await supabase.from("Availability")
      .insert({ userId: CURRENT_USER_ID, date, slots: updated.join(",") });
  }

  // Return full availability map for current user (same week)
  const weekDays = getWeekDays(new Date());
  const { data: allAvail } = await supabase
    .from("Availability")
    .select("date, slots")
    .eq("userId", CURRENT_USER_ID)
    .gte("date", weekDays[0])
    .lte("date", weekDays[6]);

  const result = {};
  (allAvail || []).forEach(a => { result[a.date] = _parseComma(a.slots); });
  return result;
}
