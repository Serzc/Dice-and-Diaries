// src/utils/characterDataAdapter.js
//
// Translates between the PostgreSQL/Supabase DB format and the UI state format.
//
// DB compact string formats (see supabase/migrations/001_create_tables.sql):
//   abilityScores     varchar(12)  "141813101508"  → STR=14 DEX=18 CON=13 INT=10 WIS=15 CHA=8
//   saveProficiencies varchar(6)   "010100"        → DEX and INT proficient
//   skillProficiencies varchar(18) "100001010010100200" → one char per skill, '0'/'1'/'2'
//   spellSlots        varchar(18)  "433200000000000000" → 2 chars per level (max,current)

const ABILITY_ORDER = ["str", "dex", "con", "int", "wis", "cha"];

export const SKILLS = [
  { id: "acrobatics",      name: "Acrobacias",          ability: "dex" },
  { id: "animal_handling", name: "Trato con animales",   ability: "wis" },
  { id: "arcana",          name: "Arcanos",              ability: "int" },
  { id: "athletics",       name: "Atletismo",            ability: "str" },
  { id: "deception",       name: "Engaño",               ability: "cha" },
  { id: "history",         name: "Historia",             ability: "int" },
  { id: "insight",         name: "Perspicacia",          ability: "wis" },
  { id: "intimidation",    name: "Intimidación",         ability: "cha" },
  { id: "investigation",   name: "Investigación",        ability: "int" },
  { id: "medicine",        name: "Medicina",             ability: "wis" },
  { id: "nature",          name: "Naturaleza",           ability: "int" },
  { id: "perception",      name: "Percepción",           ability: "wis" },
  { id: "performance",     name: "Interpretación",       ability: "cha" },
  { id: "persuasion",      name: "Persuasión",           ability: "cha" },
  { id: "religion",        name: "Religión",             ability: "int" },
  { id: "sleight_of_hand", name: "Juego de manos",       ability: "dex" },
  { id: "stealth",         name: "Sigilo",               ability: "dex" },
  { id: "survival",        name: "Supervivencia",        ability: "wis" },
];

// ── Proficiency bonus (computed from level per D&D 5e rules) ──────────
export function computeProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1;
}

// ── Ability scores ────────────────────────────────────────────────────

function parseAbilityScores(raw) {
  if (typeof raw === "string") {
    const result = {};
    for (let i = 0; i < 6; i++) {
      result[ABILITY_ORDER[i]] = parseInt(raw.slice(i * 2, i * 2 + 2), 10) || 10;
    }
    return result;
  }
  // Legacy object format from mock data (ability_scores or abilityScores as object)
  return raw;
}

export function serializeAbilityScores(scores) {
  return ABILITY_ORDER
    .map(ab => String(scores[ab] ?? 10).padStart(2, "0"))
    .join("");
}

// ── Save proficiencies ────────────────────────────────────────────────

function parseSaveProficiencies(raw) {
  if (typeof raw === "string") {
    return ABILITY_ORDER.filter((_, i) => raw[i] === "1");
  }
  // Legacy array format from mock
  return Array.isArray(raw) ? raw : [];
}

export function serializeSaveProficiencies(profs) {
  return ABILITY_ORDER
    .map(ab => (profs ?? []).includes(ab) ? "1" : "0")
    .join("");
}

// ── Skill proficiencies ───────────────────────────────────────────────

const PROF_CHAR = { "0": "none", "1": "proficient", "2": "expert" };
const PROF_CODE = { none: "0", proficient: "1", expert: "2" };

function parseSkillProficiencies(raw, abilityModifiers, proficiencyBonus) {
  let levelMap; // skill.id → "none"|"proficient"|"expert"

  if (typeof raw === "string") {
    levelMap = {};
    SKILLS.forEach((skill, i) => {
      levelMap[skill.id] = PROF_CHAR[raw[i] ?? "0"] ?? "none";
    });
  } else if (Array.isArray(raw)) {
    // Legacy array format: [{skill, level}, ...]
    levelMap = {};
    raw.forEach(({ skill, level }) => { levelMap[skill] = level; });
  } else {
    levelMap = {};
  }

  return SKILLS.map(skill => {
    const level = levelMap[skill.id] ?? "none";
    const baseMod = abilityModifiers[skill.ability];
    let totalMod = baseMod;
    if (level === "proficient") totalMod += proficiencyBonus;
    else if (level === "expert")    totalMod += proficiencyBonus * 2;
    return { ...skill, level, totalMod };
  });
}

export function serializeSkillProficiencies(skillProfs) {
  return SKILLS
    .map(skill => {
      const prof = (skillProfs ?? []).find(p => p.id === skill.id);
      return PROF_CODE[prof?.level ?? "none"] ?? "0";
    })
    .join("");
}

// ── Spell slots ───────────────────────────────────────────────────────

function parseSpellSlots(raw) {
  if (typeof raw === "string") {
    const slots = {};
    for (let level = 1; level <= 9; level++) {
      const idx = (level - 1) * 2;
      const max     = parseInt(raw[idx]     ?? "0", 10);
      const current = parseInt(raw[idx + 1] ?? "0", 10);
      if (max > 0) slots[level] = { max, current };
    }
    return slots;
  }
  // Legacy object format from mock: { 1: {max, current}, ... }
  return raw ?? {};
}

export function serializeSpellSlots(slots) {
  let result = "";
  for (let level = 1; level <= 9; level++) {
    const slot = (slots ?? {})[level];
    result += slot ? `${slot.max}${slot.current}` : "00";
  }
  return result;
}

// ── Main conversion: DB row → UI state ───────────────────────────────

/**
 * Converts raw DB row (Supabase response) to the character object used by the UI.
 * Supports both compact string format (real DB) and legacy object format (mock).
 *
 * @param {Object} raw - DB row, camelCase columns.
 *   Also accepts legacy snake_case mock format (ability_scores, save_proficiencies…).
 * @returns {Object} Character ready for React state.
 */
export function fromDatabase(raw) {
  // Support legacy snake_case field names from the mock alongside camelCase DB names
  const rawScores   = raw.abilityScores   ?? raw.ability_scores;
  const rawSaveProf = raw.saveProficiencies ?? raw.save_proficiencies;
  const rawSkillProf = raw.skillProficiencies ?? raw.skill_proficiencies;
  const rawSpellSlots = raw.spellSlots    ?? raw.spellcasting?.slots;

  const level = raw.level ?? 1;
  const proficiencyBonus = raw.proficiency_bonus ?? computeProficiencyBonus(level);

  const abilityScores = parseAbilityScores(rawScores);

  const abilityModifiers = {};
  for (const ab of ABILITY_ORDER) {
    abilityModifiers[ab] = Math.floor((abilityScores[ab] - 10) / 2);
  }

  const saveProficiencies = parseSaveProficiencies(rawSaveProf);

  // Saving throws
  const savingThrows = {};
  for (const ab of ABILITY_ORDER) {
    const mod = abilityModifiers[ab];
    savingThrows[ab] = saveProficiencies.includes(ab) ? mod + proficiencyBonus : mod;
  }

  // Ability-level proficiencies (for legacy AbilityProficienciesSection panel)
  const rawAbilityProf = raw.proficiency_list ?? [];
  const abilityProficiencies = ABILITY_ORDER.map(ab => {
    const baseMod = abilityModifiers[ab];
    const prof = rawAbilityProf.find(p => p.ability === ab);
    const level_ = prof?.level ?? "none";
    let totalMod = baseMod;
    if (level_ === "proficient") totalMod += proficiencyBonus;
    else if (level_ === "expert") totalMod += proficiencyBonus * 2;
    return { ability: ab, baseMod, proficiencyLevel: level_, totalMod };
  });

  const skillProficiencies = parseSkillProficiencies(rawSkillProf, abilityModifiers, proficiencyBonus);

  // AC: base 10 + DEX mod + equipped item bonuses + feature bonuses
  let ac = 10 + abilityModifiers.dex;
  (raw.inventory ?? []).forEach(item => {
    if (item.equipped && item.effect?.ac_bonus) ac += item.effect.ac_bonus;
  });
  (raw.features ?? raw.stored_features ?? []).forEach(feat => {
    if (feat.effect?.ac_bonus) ac += feat.effect.ac_bonus;
    if (feat.effect?.modifiers?.ac_bonus) ac += feat.effect.modifiers.ac_bonus;
  });

  // Initiative: DEX mod + feature bonuses
  let initiative = abilityModifiers.dex;
  (raw.features ?? raw.stored_features ?? []).forEach(feat => {
    if (feat.effect?.initiative_bonus) initiative += feat.effect.initiative_bonus;
  });

  // HP data
  const hp = raw.hp ?? { max: raw.hpMax ?? 1, current: raw.currentHp ?? 1, temp: raw.tempHp ?? 0 };
  const hitDice = raw.hit_dice ?? {
    type: raw.hitDiceType ?? "d8",
    total: raw.hitDiceTotal ?? level,
    remaining: raw.hitDiceRemaining ?? level,
  };

  return {
    id: raw.id,
    name: raw.name,
    classes: raw.classes,
    species: raw.species,
    background: raw.background,
    level,
    imageUrl: raw.imageUrl ?? raw.image_url,
    appearance: raw.appearance ?? "",
    abilityScores,
    abilityModifiers,
    proficiencyBonus,
    savingThrows,
    saveProficiencies,
    abilityProficiencies,
    skillProficiencies,
    spellSlots: parseSpellSlots(rawSpellSlots),
    spellcastingAbility: raw.spellcastingAbility ?? raw.spellcasting?.ability ?? null,
    combatInfo: {
      ac,
      initiative,
      speed: raw.speed ?? 30,
      hpMax: hp.max,
      currentHp: hp.current,
      tempHp: hp.temp,
      hitDiceType: hitDice.type,
      hitDiceTotal: hitDice.total,
      hitDiceRemaining: hitDice.remaining,
    },
  };
}

// ── Main conversion: UI state → DB row ───────────────────────────────

/**
 * Converts UI character state back to DB-format object ready for Supabase upsert.
 * All column names are camelCase to match the SQL schema.
 *
 * @param {Object} uiCharacter - React state character object.
 * @returns {Object} DB-ready row (compact string formats).
 */
export function toDatabase(uiCharacter) {
  return {
    id:                   uiCharacter.id,
    name:                 uiCharacter.name,
    classes:              uiCharacter.classes,
    species:              uiCharacter.species,
    background:           uiCharacter.background,
    level:                uiCharacter.level,
    imageUrl:             uiCharacter.imageUrl,
    appearance:           uiCharacter.appearance ?? "",

    abilityScores:        serializeAbilityScores(uiCharacter.abilityScores),
    saveProficiencies:    serializeSaveProficiencies(uiCharacter.saveProficiencies),
    skillProficiencies:   serializeSkillProficiencies(uiCharacter.skillProficiencies),

    speed:                uiCharacter.combatInfo.speed,
    hpMax:                uiCharacter.combatInfo.hpMax,
    currentHp:            uiCharacter.combatInfo.currentHp,
    tempHp:               uiCharacter.combatInfo.tempHp,
    hitDiceType:          uiCharacter.combatInfo.hitDiceType,
    hitDiceTotal:         uiCharacter.combatInfo.hitDiceTotal,
    hitDiceRemaining:     uiCharacter.combatInfo.hitDiceRemaining,

    spellcastingAbility:  uiCharacter.spellcastingAbility ?? null,
    spellSlots:           serializeSpellSlots(uiCharacter.spellSlots),
  };
}
