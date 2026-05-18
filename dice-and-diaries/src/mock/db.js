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

// ── DB → JS normalizers (DB returns all-lowercase column names) ───────────────
function _normCampaign(c) {
  if (!c) return c;
  return { ...c, ownerId: c.ownerid, imageUrl: c.imageurl ?? null, inviteCode: c.invitecode ?? null };
}

function _normNote(n) {
  if (!n) return n;
  return { ...n, campaignId: n.campaignid, isPublic: n.ispublic, authorId: n.authorid, createdAt: n.createdat };
}

function _normMessage(msg) {
  if (!msg) return msg;
  let content = msg.content;
  if (msg.type !== "text" && msg.type !== "whisper") {
    content = _parseJSON(msg.content, msg.content);
  }
  return {
    ...msg,
    chatId:          msg.chatid,
    senderId:        msg.senderid,
    senderUsername:  msg.senderusername,
    characterId:         msg.characterid,
    characterName:       msg.charactername,
    characterAvatar:     msg.characteravatar,
    characterAppearance: msg.characterappearance ?? null,
    isWhisper:       msg.iswhisper,
    whisperTo:       msg.whisperto,
    content,
  };
}

function _normUser(u) {
  if (!u) return u;
  const { passwordhash: _pw, ...safe } = u;
  return { ...safe, displayName: u.displayname, avatarUrl: u.avatarurl ?? null, joinedAt: u.joinedat };
}

// ── Creature serialization helpers ───────────────────────────────────────────
function _deserializeCreature(row, campaignIds = []) {
  return {
    id:               row.id,
    name:             row.name,
    ownerId:          row.ownerid,
    folderId:         row.folderid ?? null,
    imageUrl:         row.imageurl ?? null,
    campaignIds,
    cr:               row.cr ?? "",
    size:             row.size,
    creatureType:     row.creaturetype,
    alignment:        row.alignment ?? "",
    ac:               row.ac,
    acNote:           row.acnote ?? "",
    hp: {
      current: row.currenthp,
      max:     row.hpmax,
      formula: row.hpformula ?? "",
    },
    speed:              row.speed,
    abilityScores:      _parseAbil(row.abilityscores),
    savingThrows:       _parseJSON(row.savingthrows, []),
    skills:             _parseJSON(row.skills, []),
    damageImmunities:   _parseComma(row.damageimmunities),
    damageResistances:  _parseComma(row.damageresistances),
    conditionImmunities:_parseComma(row.conditionimmunities),
    senses:             row.senses ?? "",
    languages:          row.languages ?? "",
    specialTraits:      _parseJSON(row.specialtraits, []),
    actions:            _parseJSON(row.actions, []),
    bonusActions:       _parseJSON(row.bonusactions, []),
    reactions:          _parseJSON(row.reactions, []),
    gmNotes:            row.gmnotes ?? "",
    playerVisibleNotes: row.playervisiblenotes ?? "",
  };
}

function _serializeCreature(creature) {
  return {
    name:               creature.name,
    size:               creature.size,
    creaturetype:       creature.creatureType,
    alignment:          creature.alignment || null,
    cr:                 creature.cr || null,
    ac:                 creature.ac,
    acnote:             creature.acNote || null,
    hpmax:              creature.hp?.max     ?? creature.hpMax,
    currenthp:          creature.hp?.current ?? creature.currentHp,
    hpformula:          creature.hp?.formula  ?? creature.hpFormula ?? null,
    speed:              creature.speed,
    abilityscores:      _serializeAbil(creature.abilityScores ?? {}),
    savingthrows:       _toJSON(creature.savingThrows ?? []),
    skills:             _toJSON(creature.skills ?? []),
    damageimmunities:   _serializeComma(creature.damageImmunities),
    damageresistances:  _serializeComma(creature.damageResistances),
    conditionimmunities:_serializeComma(creature.conditionImmunities),
    senses:             creature.senses || null,
    languages:          creature.languages || null,
    specialtraits:      _toJSON(creature.specialTraits ?? []),
    actions:            _toJSON(creature.actions ?? []),
    bonusactions:       _toJSON(creature.bonusActions ?? []),
    reactions:          _toJSON(creature.reactions ?? []),
    gmnotes:            creature.gmNotes || null,
    playervisiblenotes: creature.playerVisibleNotes || null,
    folderid:           creature.folderId || null,
    ownerid:            CURRENT_USER_ID,
  };
}

// ── Character deserialization helper ─────────────────────────────────────────
function _deserializeCharacter(row, campaignIds = []) {
  return {
    ...row,
    // camelCase aliases required by characterDataAdapter.js fromDatabase()
    abilityScores:     row.abilityscores,
    saveProficiencies: row.saveproficiencies,
    skillProficiencies:row.skillproficiencies,
    imageUrl:          row.imageurl ?? null,
    hpMax:             row.hpmax,
    currentHp:         row.currenthp,
    tempHp:            row.temphp,
    hitDiceType:       row.hitdicetype,
    hitDiceTotal:      row.hitdicetotal,
    hitDiceRemaining:  row.hitdiceremaining,
    spellcastingAbility: row.spellcastingability || null,
    classes:         row.classes ? row.classes.split(",").map(s => s.trim()) : [],
    inventory:       _parseJSON(row.inventory, []),
    // features must be a parsed array (overrides the raw JSON string from ...row)
    features:        _parseJSON(row.features, []),
    stored_features: _parseJSON(row.features, []),
    character_note:  _parseJSON(row.characternote, { id: Date.now(), title: "Historia", content: "" }),
    proficiency_list:_parseJSON(row.proficiencylist, []),
    appearance:      row.appearance ?? "",
    campaign_ids:    campaignIds,
    spellcasting: {
      ability: row.spellcastingability || "int",
      slots:   row.spellslots,
      spells:  _parseJSON(row.spells, []),
    },
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function registerUser(username, email, password) {
  const { data: existing } = await supabase
    .from("User")
    .select("id")
    .eq("username", username)
    .limit(1);

  if (existing?.length) throw new Error("El nombre de usuario ya está en uso");

  const { data, error } = await supabase
    .from("User")
    .insert({
      username,
      displayname: username,
      email,
      passwordhash: password,
      active: true,
      joinedat: new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) throw new Error("Error al crear la cuenta: " + error.message);
  return { ..._normUser(data), isGM: false };
}

export async function loginUser(username, password) {
  const { data: users, error } = await supabase
    .from("User")
    .select("*")
    .eq("username", username)
    .eq("passwordhash", password)
    .eq("active", true)
    .limit(1);

  if (error || !users?.length) return null;
  const user = users[0];

  const { data: gmRows } = await supabase
    .from("UserXCampaign")
    .select("campaignid")
    .eq("userid", user.id)
    .eq("role", "gm")
    .limit(1);

  const isGM = !!(gmRows?.length);
  return { ..._normUser(user), isGM };
}

// ── Campaign functions ────────────────────────────────────────────────────────
export async function fetchCampaigns(userId = CURRENT_USER_ID) {
  const { data: memberships } = await supabase
    .from("UserXCampaign")
    .select("campaignid, role")
    .eq("userid", userId);

  const ids = (memberships || []).map(m => m.campaignid);
  if (!ids.length) return [];

  const [{ data: campaigns }, { data: allMembers }, { data: creatureLinks }, { data: notes }] =
    await Promise.all([
      supabase.from("Campaign").select("*").in("id", ids),
      supabase.from("UserXCampaign").select("campaignid, userid").in("campaignid", ids),
      supabase.from("CreatureXCampaign").select("campaignid").in("campaignid", ids),
      supabase.from("Note").select("campaignid").in("campaignid", ids).eq("active", true),
    ]);

  return (campaigns || []).map(c => {
    const members   = (allMembers   || []).filter(m => m.campaignid === c.id);
    const playerIds = members.map(m => m.userid);
    const myRole    = (memberships  || []).find(m => Number(m.campaignid) === Number(c.id))?.role ?? null;
    return {
      ..._normCampaign(c),
      players:      playerIds,
      playersCount: playerIds.length,
      npcsCount:    (creatureLinks || []).filter(cr => cr.campaignid === c.id).length,
      notesCount:   (notes         || []).filter(n  => n.campaignid  === c.id).length,
      myRole,
    };
  });
}

export async function fetchHomeData(userId = CURRENT_USER_ID) {
  const campaigns = await fetchCampaigns(userId);

  const { data: userRow } = await supabase
    .from("User").select("*").eq("id", userId).single();

  const chatIds = campaigns.map(c => c.id);
  const { data: lastMsgs } = await supabase
    .from("Message")
    .select("chatid, type, content")
    .in("chatid", chatIds)
    .order("timestamp", { ascending: false });

  const lastByChat = {};
  (lastMsgs || []).forEach(msg => {
    if (!lastByChat[msg.chatid]) lastByChat[msg.chatid] = msg;
  });

  return {
    user: _normUser(userRow ?? {}),
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
    myCharactersCount: 0,
    myCreaturesCount:  0,
  };
}

export async function createCampaign({ name, description = "" }) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data: camp, error } = await supabase
    .from("Campaign")
    .insert({ name, description, ownerid: CURRENT_USER_ID, active: false, invitecode: code })
    .select()
    .single();

  if (error) throw error;

  await Promise.all([
    supabase.from("UserXCampaign").insert({ userid: CURRENT_USER_ID, campaignid: camp.id, role: "gm" }),
    supabase.from("Chat").insert({ campaignid: camp.id }),
  ]);

  // Promote the current session to GM (persists until next login)
  if (currentUser && !currentUser.isGM) {
    currentUser.isGM = true;
    try {
      const raw = localStorage.getItem("dnd_session");
      if (raw) {
        const stored = JSON.parse(raw);
        stored.isGM = true;
        localStorage.setItem("dnd_session", JSON.stringify(stored));
      }
    } catch {}
  }

  return _normCampaign(camp);
}

export async function joinCampaignByCode(code) {
  const { data: camps } = await supabase
    .from("Campaign")
    .select("*")
    .ilike("invitecode", code.trim());

  if (!camps?.length) throw new Error(`Código "${code}" no encontrado.`);
  const camp = camps[0];

  await supabase
    .from("UserXCampaign")
    .upsert({ userid: CURRENT_USER_ID, campaignid: camp.id, role: "player" }, { onConflict: "userid,campaignid" });

  return _normCampaign(camp);
}

export async function toggleCampaignActive(campaignId) {
  const id = Number(campaignId);
  const { data: camp } = await supabase.from("Campaign").select("active").eq("id", id).single();
  const { data: updated, error } = await supabase
    .from("Campaign").update({ active: !camp.active }).eq("id", id).select().single();
  if (error) throw error;
  return _normCampaign(updated);
}

export async function deleteCampaign(campaignId) {
  await supabase.from("Campaign").update({ active: false }).eq("id", Number(campaignId));
  return { success: true };
}

// ── Player functions ──────────────────────────────────────────────────────────
export async function fetchCampaignPlayers(campaignId) {
  const { data: camp } = await supabase
    .from("Campaign").select("ownerid").eq("id", Number(campaignId)).single();
  const { data: members } = await supabase
    .from("UserXCampaign").select("userid").eq("campaignid", Number(campaignId));

  const ids = (members || []).map(m => m.userid);
  const { data: users } = await supabase.from("User").select("*").in("id", ids);

  const players = (users || []).map(_normUser);
  return { ownerId: camp?.ownerid ?? null, players };
}

export async function kickPlayer(campaignId, userId) {
  await supabase
    .from("UserXCampaign")
    .delete()
    .eq("campaignid", Number(campaignId))
    .eq("userid", userId);
  return { success: true };
}

export async function invitePlayer(campaignId, username) {
  const { data: users } = await supabase
    .from("User").select("*").eq("username", username).eq("active", true).limit(1);
  if (!users?.length) throw new Error(`Usuario "${username}" no encontrado.`);
  const user = users[0];

  await supabase
    .from("UserXCampaign")
    .upsert({ userid: user.id, campaignid: Number(campaignId), role: "player" }, { onConflict: "userid,campaignid" });

  return _normUser(user);
}

// ── Character functions ───────────────────────────────────────────────────────
export async function fetchUserCharacters(userId = CURRENT_USER_ID) {
  const { data: chars } = await supabase
    .from("Character").select("id, name, classes, level, species, background, imageurl, abilityscores, ownerid")
    .eq("ownerid", userId).eq("active", true);

  if (!chars?.length) return [];

  const charIds = chars.map(c => c.id);
  const { data: links } = await supabase
    .from("CharacterXCampaign").select("characterid, campaignid").in("characterid", charIds);
  const allCampIds = [...new Set((links || []).map(l => l.campaignid))];
  const { data: allCamps } = allCampIds.length
    ? await supabase.from("Campaign").select("id, name").in("id", allCampIds)
    : { data: [] };

  return chars.map(c => ({
    id:         c.id,
    userId:     c.ownerid,
    name:       c.name,
    classes:    c.classes ? c.classes.split(",").map(s => s.trim()) : [],
    level:      c.level,
    species:    c.species,
    background: c.background,
    imageUrl:   c.imageurl,
    stats:      _parseAbil(c.abilityscores),
    campaigns: (links || [])
      .filter(l => l.characterid === c.id)
      .map(l => { const camp = (allCamps || []).find(x => x.id === l.campaignid); return camp ?? null; })
      .filter(Boolean),
  }));
}

export async function createCharacter() {
  const { data: newChar, error } = await supabase
    .from("Character")
    .insert({
      name: "Nuevo Personaje", classes: "", species: "", background: "", level: 1,
      imageurl: null,
      abilityscores: "101010101010", saveproficiencies: "000000",
      skillproficiencies: "000000000000000000",
      speed: 30, hpmax: 8, currenthp: 8, temphp: 0,
      hitdicetype: "d8", hitdicetotal: 1, hitdiceremaining: 1,
      spellcastingability: "int", spellslots: "000000000000000000",
      actions: "[]", bonusactions: "[]", otherproficiencies: "[]",
      features: "[]", inventory: "[]", spells: "[]",
      characternote: JSON.stringify({ id: Date.now(), title: "Historia", content: "" }),
      proficiencylist: "[]",
      ownerid: CURRENT_USER_ID,
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
    supabase.from("CharacterXCampaign").select("campaignid").eq("characterid", id),
  ]);
  if (error || !char) throw new Error(`Personaje ${characterId} no encontrado.`);

  return _deserializeCharacter(char, (links || []).map(l => l.campaignid));
}

export async function saveCharacterSection(characterId, section, data) {
  const id = Number(characterId);
  let update = {};

  if (section === "core") {
    const d = { ...data };
    delete d.id;
    if (Array.isArray(d.classes)) d.classes = d.classes.join(",");
    // toDatabase() outputs camelCase; remap to lowercase Postgres column names
    const keyMap = {
      imageUrl:            "imageurl",
      abilityScores:       "abilityscores",
      saveProficiencies:   "saveproficiencies",
      skillProficiencies:  "skillproficiencies",
      hpMax:               "hpmax",
      currentHp:           "currenthp",
      tempHp:              "temphp",
      hitDiceType:         "hitdicetype",
      hitDiceTotal:        "hitdicetotal",
      hitDiceRemaining:    "hitdiceremaining",
      spellcastingAbility: "spellcastingability",
      spellSlots:          "spellslots",
    };
    update = {};
    for (const [k, v] of Object.entries(d)) {
      if (v !== undefined) update[keyMap[k] ?? k] = v;
    }
  } else if (section === "inventory") {
    update = { inventory: _toJSON(data) };
  } else if (section === "actions") {
    update = { actions: _toJSON(data) };
  } else if (section === "bonusActions" || section === "bonus_actions") {
    update = { bonusactions: _toJSON(data) };
  } else if (section === "otherProficiencies" || section === "other_proficiencies") {
    update = { otherproficiencies: _toJSON(data) };
  } else if (section === "features" || section === "stored_features") {
    update = { features: _toJSON(data) };
  } else if (section === "characterNote") {
    update = { characternote: _toJSON(data) };
  } else if (section === "spellSlots") {
    update = { spellslots: serializeSpellSlots(data) };
  } else if (section === "spellcastingAbility") {
    update = { spellcastingability: data };
  } else if (section === "spells") {
    update = { spells: _toJSON(data) };
  } else if (section === "spellcasting") {
    update = {
      spellcastingability: data.ability,
      spellslots: serializeSpellSlots(data.slots ?? {}),
      spells: _toJSON(data.spells ?? []),
    };
  } else {
    update = { [section]: _toJSON(data) };
  }

  const { error } = await supabase.from("Character").update(update).eq("id", id);
  if (error) console.error("saveCharacterSection error:", error);
  return { success: !error };
}

export async function uploadCharacterImage(characterId, file) {
  const ext = file.name.split(".").pop();
  const path = `${characterId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("character-images")
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("character-images").getPublicUrl(path);
  const url = data.publicUrl;
  await supabase.from("Character").update({ imageurl: url }).eq("id", Number(characterId));
  return url;
}

export async function uploadCampaignImage(campaignId, file) {
  const ext = file.name.split(".").pop();
  const path = `${campaignId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("campaign-images")
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("campaign-images").getPublicUrl(path);
  const url = data.publicUrl;
  await supabase.from("Campaign").update({ imageurl: url }).eq("id", Number(campaignId));
  return url;
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
    .from("Character").select("bonusactions").eq("id", Number(characterId)).single();
  return _parseJSON(data?.bonusactions, []);
}

export async function fetchOtherProficiencies(characterId) {
  const { data } = await supabase
    .from("Character").select("otherproficiencies").eq("id", Number(characterId)).single();
  return _parseJSON(data?.otherproficiencies, []);
}

export async function fetchSpellcastingData(characterId) {
  const { data } = await supabase
    .from("Character")
    .select("spellcastingability, spellslots, spells")
    .eq("id", Number(characterId))
    .single();
  return {
    ability: data?.spellcastingability || "int",
    slots:   _parseSlots(data?.spellslots || "000000000000000000"),
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
    .from("Character").select("characternote").eq("id", Number(characterId)).single();
  return _parseJSON(data?.characternote, { id: Date.now(), title: "Historia", content: "" });
}

export async function fetchCharacterCampaigns(characterId) {
  const { data: links } = await supabase
    .from("CharacterXCampaign").select("campaignid").eq("characterid", Number(characterId));
  if (!links?.length) return [];

  const campIds = links.map(l => l.campaignid);
  const { data: camps } = await supabase.from("Campaign").select("id, name").in("id", campIds);
  return camps || [];
}

export async function addCharacterToCampaign(characterId, campaignId) {
  await supabase.from("CharacterXCampaign")
    .upsert(
      { characterid: Number(characterId), campaignid: Number(campaignId) },
      { onConflict: "characterid,campaignid", ignoreDuplicates: true }
    );
}

export async function removeCharacterFromCampaign(characterId, campaignId) {
  await supabase.from("CharacterXCampaign")
    .delete()
    .eq("characterid", Number(characterId))
    .eq("campaignid", Number(campaignId));
}

// ── Creature functions ────────────────────────────────────────────────────────
function _buildBreadcrumb(folders, folderId) {
  const crumbs = [];
  let current = folders.find(f => f.id === folderId);
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    current = folders.find(f => f.id === current.parentfolderid);
  }
  return crumbs;
}

export async function fetchCreaturesInFolder(folderId = null) {
  const [{ data: allFolders }, creaturesQuery, campaignLinksQuery] = await Promise.all([
    supabase.from("CreatureFolder").select("*").eq("active", true),
    folderId == null
      ? supabase.from("Creature").select("*").is("folderid", null).eq("active", true)
      : supabase.from("Creature").select("*").eq("folderid", folderId).eq("active", true),
    supabase.from("CreatureXCampaign").select("creatureid, campaignid"),
  ]);

  const creatures = creaturesQuery.data || [];
  const links     = campaignLinksQuery.data || [];
  const folders   = allFolders || [];

  const numericFolderId = folderId ? Number(folderId) : null;

  return {
    folders:       folders.filter(f => f.parentfolderid === numericFolderId),
    creatures:     creatures.map(c => {
      const campaignIds = links.filter(l => l.creatureid === c.id).map(l => l.campaignid);
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
    supabase.from("CreatureXCampaign").select("campaignid").eq("creatureid", id),
  ]);
  if (error || !row) throw new Error(`Criatura '${creatureId}' no encontrada.`);

  return _deserializeCreature(row, (links || []).map(l => l.campaignid));
}

export async function saveCreature(id, data) {
  const numId = Number(id);
  const { data: row } = await supabase.from("Creature").select("ownerid").eq("id", numId).single();
  if (!row || Number(row.ownerid) !== Number(CURRENT_USER_ID)) {
    return { success: false, error: "No autorizado" };
  }
  const serialized = _serializeCreature(data);
  delete serialized.ownerid;
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
      campaignIds.map(cid => ({ creatureid: newRow.id, campaignid: cid }))
    );
  }
  return _deserializeCreature(newRow, campaignIds);
}

export async function createFolder(name, parentId = null) {
  const { data: folder, error } = await supabase
    .from("CreatureFolder")
    .insert({ name, parentfolderid: parentId || null, ownerid: CURRENT_USER_ID })
    .select()
    .single();
  if (error) throw error;
  return { ...folder, parentFolderId: folder.parentfolderid, ownerId: folder.ownerid };
}

export async function addCreatureToCampaign(creatureId, campaignId) {
  const { data: membership } = await supabase
    .from("UserXCampaign")
    .select("role")
    .eq("userid", CURRENT_USER_ID)
    .eq("campaignid", Number(campaignId))
    .single();
  if (!membership || membership.role !== "gm") {
    throw new Error("Solo los DMs pueden añadir criaturas a la campaña");
  }
  const cid = Number(creatureId);
  await supabase
    .from("CreatureXCampaign")
    .upsert({ creatureid: cid, campaignid: Number(campaignId) }, { onConflict: "creatureid,campaignid" });
  return fetchCreature(cid);
}

export async function removeCreatureFromCampaign(creatureId, campaignId) {
  const cid = Number(creatureId);
  await supabase
    .from("CreatureXCampaign")
    .delete()
    .eq("creatureid", cid)
    .eq("campaignid", Number(campaignId));
  return fetchCreature(cid);
}

// ── Creature notes ────────────────────────────────────────────────────────────
export async function fetchCreatureNotes(creatureId) {
  const { data } = await supabase
    .from("CreatureNote")
    .select("*")
    .eq("creatureid", Number(creatureId))
    .eq("active", true)
    .order("createdat", { ascending: false });
  return _clone(data || []);
}

export async function createCreatureNote(data) {
  const { data: note, error } = await supabase
    .from("CreatureNote")
    .insert({
      creatureid:  Number(data.creatureId),
      title:       data.title,
      content:     data.content ?? "",
      visibility:  data.visibility ?? "gm",
      authorid:    data.authorId ?? CURRENT_USER_ID,
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

  let query = supabase.from("Note").select("*").eq("campaignid", numId).eq("active", true);
  if (!isGM) query = query.or(`ispublic.eq.true,authorid.eq.${CURRENT_USER_ID}`);
  const { data: notes } = await query;

  return {
    campaign: camp ? { name: camp.name } : { name: `Campaña ${campaignId}` },
    notes: (notes || []).map(_normNote),
  };
}

export async function createNote(data) {
  const payload = {
    campaignid: Number(data.campaignId ?? data.campaignid),
    title:      data.title,
    content:    data.content ?? "",
    ispublic:   data.isPublic ?? data.ispublic ?? true,
    authorid:   data.authorId ?? data.authorid ?? CURRENT_USER_ID,
    createdat:  data.createdAt ?? data.createdat ?? new Date().toISOString().split("T")[0],
    active:     true,
  };
  const { data: note, error } = await supabase.from("Note").insert(payload).select().single();
  if (error) throw error;
  return _normNote(note);
}

export async function updateNote(id, data) {
  const update = {
    title:    data.title,
    content:  data.content,
    ispublic: data.isPublic ?? data.ispublic,
  };
  const { data: note } = await supabase
    .from("Note").update(update).eq("id", id).select().single();
  return note ? _normNote(note) : null;
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
    supabase.from("UserXCampaign").select("userid, role").eq("campaignid", numId),
    supabase.from("Chat").select("id").eq("campaignid", numId).single(),
  ]);

  const chatId = chat?.id;
  const memberIds = (members || []).map(m => m.userid);
  const gmEntry = (members || []).find(m => m.role === "gm");

  const [
    { data: users },
    { data: messages },
    { data: charLinks },
    { data: creatureLinks },
  ] = await Promise.all([
    supabase.from("User").select("id, username").in("id", memberIds),
    chatId
      ? supabase.from("Message").select("*").eq("chatid", chatId).order("timestamp", { ascending: true })
      : { data: [] },
    supabase.from("CharacterXCampaign")
      .select("characterid")
      .eq("campaignid", numId),
    supabase.from("CreatureXCampaign")
      .select("creatureid")
      .eq("campaignid", numId),
  ]);

  const myCharIds = (charLinks || []).map(l => l.characterid);
  let userCharacters = [];
  if (myCharIds.length) {
    const { data: chars } = await supabase
      .from("Character")
      .select("id, name, imageurl, appearance, ownerid")
      .in("id", myCharIds)
      .eq("ownerid", CURRENT_USER_ID);
    userCharacters = (chars || []).map(ch => ({ id: ch.id, name: ch.name, avatar: ch.imageurl, appearance: ch.appearance ?? "" }));
  }

  const npcIds = (creatureLinks || []).map(l => l.creatureid);
  let npcs = [];
  if (npcIds.length) {
    const { data: creatures } = await supabase
      .from("Creature").select("id, name, imageurl").in("id", npcIds);
    npcs = (creatures || []).map(c => ({ id: c.id, name: c.name, creatureId: c.id, avatar: c.imageurl }));
  }

  const onlineUsers = (users || [])
    .filter(u => u.id !== CURRENT_USER_ID)
    .map(u => ({ id: u.id, username: u.username }));

  return {
    chatId,
    campaign:     camp ? _normCampaign(camp) : { id: campaignId, name: `Campaña ${campaignId}` },
    currentUser:  { id: CURRENT_USER_ID, username: (users || []).find(u => u.id === CURRENT_USER_ID)?.username ?? "", isGM: gmEntry?.userid === CURRENT_USER_ID },
    messages:     (messages || []).map(_normMessage),
    userCharacters,
    npcs,
    onlineUsers,
  };
}

export function subscribeToChatMessages(chatId, onInsert) {
  const channel = supabase
    .channel(`chat-${chatId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "Message", filter: `chatid=eq.${chatId}` },
      (payload) => onInsert(_normMessage(payload.new))
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function sendMessage(campaignId, messageData) {
  const numId = Number(campaignId);
  const { data: chat } = await supabase
    .from("Chat").select("id").eq("campaignid", numId).single();

  const chatId = chat?.id;
  if (!chatId) throw new Error("Chat not found for campaign " + campaignId);

  const content = typeof messageData.content === "object"
    ? JSON.stringify(messageData.content)
    : messageData.content;

  const { data: newMsg, error } = await supabase
    .from("Message")
    .insert({
      chatid:          chatId,
      senderid:        messageData.senderId,
      senderusername:  messageData.senderUsername,
      characterid:          Number.isInteger(messageData.characterId) ? messageData.characterId : null,
      charactername:        messageData.characterName       || null,
      characteravatar:      messageData.characterAvatar     || null,
      characterappearance:  messageData.characterAppearance || null,
      type:            messageData.type,
      content,
      iswhisper:       messageData.isWhisper  || false,
      whisperto:       messageData.whisperTo  || null,
    })
    .select()
    .single();

  if (error) throw error;
  return _normMessage(newMsg);
}

// ── Profile functions ─────────────────────────────────────────────────────────
export async function fetchProfile(userId = CURRENT_USER_ID) {
  const { data: user, error } = await supabase
    .from("User").select("*").eq("id", userId).single();
  if (error || !user) throw new Error(`Usuario ${userId} no encontrado.`);

  const [{ data: memberships }, { data: chars }, { data: notes }, { data: msgs }] = await Promise.all([
    supabase.from("UserXCampaign").select("campaignid").eq("userid", userId),
    supabase.from("Character").select("id").eq("ownerid", userId).eq("active", true),
    supabase.from("Note").select("id").eq("authorid", userId).eq("active", true),
    supabase.from("Message").select("chatid").eq("senderid", userId),
  ]);

  const uniqueChats = new Set((msgs || []).map(m => m.chatid));

  return {
    ..._normUser(user),
    stats: {
      campaigns:    (memberships || []).length,
      characters:   (chars       || []).length,
      sessions:     uniqueChats.size,
      notesWritten: (notes       || []).length,
    },
  };
}

export async function saveProfile(data, userId = CURRENT_USER_ID) {
  const update = {};
  if (data.displayName  !== undefined) update.displayname = data.displayName;
  if (data.displayname  !== undefined) update.displayname = data.displayname;
  if (data.bio          !== undefined) update.bio         = data.bio;
  if (data.avatarUrl    !== undefined) update.avatarurl   = data.avatarUrl;
  if (data.avatarurl    !== undefined) update.avatarurl   = data.avatarurl;
  await supabase.from("User").update(update).eq("id", userId);
  return fetchProfile(userId);
}

// ── Planner functions ─────────────────────────────────────────────────────────
export async function fetchPlanner(campaignId) {
  const { data: members } = await supabase
    .from("UserXCampaign").select("userid").eq("campaignid", Number(campaignId));
  const playerIds = (members || []).map(m => m.userid);

  const { data: users } = await supabase
    .from("User").select("id, username").in("id", playerIds);

  const weekDays = getWeekDays(new Date());
  const { data: avail } = await supabase
    .from("Availability")
    .select("userid, date, slots")
    .in("userid", playerIds)
    .gte("date", weekDays[0])
    .lte("date", weekDays[6]);

  function _groupAvail(uid) {
    const byDate = {};
    (avail || []).filter(a => a.userid === uid).forEach(a => {
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
  const { data: existing } = await supabase
    .from("Availability")
    .select("id, slots")
    .eq("userid", CURRENT_USER_ID)
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
      .insert({ userid: CURRENT_USER_ID, date, slots: updated.join(",") });
  }

  const weekDays = getWeekDays(new Date());
  const { data: allAvail } = await supabase
    .from("Availability")
    .select("date, slots")
    .eq("userid", CURRENT_USER_ID)
    .gte("date", weekDays[0])
    .lte("date", weekDays[6]);

  const result = {};
  (allAvail || []).forEach(a => { result[a.date] = _parseComma(a.slots); });
  return result;
}
