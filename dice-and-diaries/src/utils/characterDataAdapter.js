// src/utils/characterDataAdapter.js

const SKILLS = [
  { id: "acrobatics",     name: "Acrobacias",          ability: "dex" },
  { id: "animal_handling",name: "Trato con animales",  ability: "wis" },
  { id: "arcana",         name: "Arcanos",              ability: "int" },
  { id: "athletics",      name: "Atletismo",            ability: "str" },
  { id: "deception",      name: "Engaño",               ability: "cha" },
  { id: "history",        name: "Historia",             ability: "int" },
  { id: "insight",        name: "Perspicacia",          ability: "wis" },
  { id: "intimidation",   name: "Intimidación",         ability: "cha" },
  { id: "investigation",  name: "Investigación",        ability: "int" },
  { id: "medicine",       name: "Medicina",             ability: "wis" },
  { id: "nature",         name: "Naturaleza",           ability: "int" },
  { id: "perception",     name: "Percepción",           ability: "wis" },
  { id: "performance",    name: "Interpretación",       ability: "cha" },
  { id: "persuasion",     name: "Persuasión",           ability: "cha" },
  { id: "religion",       name: "Religión",             ability: "int" },
  { id: "sleight_of_hand", name: "Juego de manos",     ability: "dex" },
  { id: "stealth",        name: "Sigilo",               ability: "dex" },
  { id: "survival",       name: "Supervivencia",        ability: "wis" },
];

export { SKILLS };

/**
 * Convierte los datos crudos de la base de datos al objeto de personaje que usa la UI.
 * @param {Object} raw - Datos como vienen de la BD.
 * @returns {Object} Datos preparados para los componentes.
 */
export function fromDatabase(raw) {
  const abilityScores = raw.ability_scores;
  const abilityModifiers = {};
  for (let ab of ["str", "dex", "con", "int", "wis", "cha"]) {
    abilityModifiers[ab] = Math.floor((abilityScores[ab] - 10) / 2);
  }

  // Calcular AC base + bonificadores de features e inventario.
  let ac = 10 + abilityModifiers.dex;
  if (raw.inventory) {
    for (let item of raw.inventory) {
      if (item.equipped && item.effect?.ac_bonus) {
        ac += item.effect.ac_bonus;
      }
    }
  }
  if (raw.features) {
    for (let feat of raw.features) {
      if (feat.effect?.ac_bonus) {
        ac += feat.effect.ac_bonus;
      }
    }
  }

  // Iniciativa = modificador de destreza + otros bonos
  let initiative = abilityModifiers.dex;
  if (raw.features) {
    for (let feat of raw.features) {
      if (feat.effect?.initiative_bonus) {
        initiative += feat.effect.initiative_bonus;
      }
    }
  }

  const proficiencyBonus = raw.proficiency_bonus;

  // Saving throws por habilidad
  const saveProficiencies = raw.save_proficiencies || [];
  const savingThrows = {};
  for (let ab of ["str", "dex", "con", "int", "wis", "cha"]) {
    const mod = abilityModifiers[ab];
    savingThrows[ab] = saveProficiencies.includes(ab) ? mod + proficiencyBonus : mod;
  }

  // Proficiencias de habilidad (para la sección de ability saves, legacy)
  const abilityProfs = raw.proficiency_list || [];
  const abilityProficiencies = ["str", "dex", "con", "int", "wis", "cha"].map(ab => {
    const baseMod = abilityModifiers[ab];
    const prof = abilityProfs.find(p => p.ability === ab);
    let level = "none";
    let totalMod = baseMod;
    if (prof) {
      level = prof.level;
      if (level === "proficient") totalMod += proficiencyBonus;
      else if (level === "expert") totalMod += proficiencyBonus * 2;
    }
    return { ability: ab, baseMod, proficiencyLevel: level, totalMod };
  });

  // Skill proficiencies (18 habilidades D&D 5e)
  const rawSkillProfs = raw.skill_proficiencies || [];
  const skillProficiencies = SKILLS.map(skill => {
    const prof = rawSkillProfs.find(p => p.skill === skill.id);
    const level = prof ? prof.level : "none";
    const baseMod = abilityModifiers[skill.ability];
    let totalMod = baseMod;
    if (level === "proficient") totalMod += proficiencyBonus;
    else if (level === "expert") totalMod += proficiencyBonus * 2;
    return { ...skill, level, totalMod };
  });

  return {
    id: raw.id,
    name: raw.name,
    classes: raw.classes,
    species: raw.species,
    background: raw.background,
    level: raw.level,
    imageUrl: raw.image_url,
    abilityScores,
    abilityModifiers,
    proficiencyBonus,
    savingThrows,
    saveProficiencies,
    abilityProficiencies,
    skillProficiencies,
    combatInfo: {
      ac,
      initiative,
      speed: raw.speed || 30,
      hpMax: raw.hp?.max || 0,
      currentHp: raw.hp?.current || 0,
      tempHp: raw.hp?.temp || 0,
      hitDiceType: raw.hit_dice?.type || "d8",
      hitDiceTotal: raw.hit_dice?.total || 0,
      hitDiceRemaining: raw.hit_dice?.remaining || 0,
    },
  };
}

/**
 * Convierte el estado del personaje de vuelta al formato de la base de datos.
 * @param {Object} uiCharacter - Datos del personaje en el estado de la UI.
 * @returns {Object} Datos listos para enviar a la BD.
 */
export function toDatabase(uiCharacter) {
  return {
    id: uiCharacter.id,
    name: uiCharacter.name,
    classes: uiCharacter.classes,
    species: uiCharacter.species,
    background: uiCharacter.background,
    level: uiCharacter.level,
    image_url: uiCharacter.imageUrl,
    ability_scores: uiCharacter.abilityScores,
    speed: uiCharacter.combatInfo.speed,
    hp: {
      max: uiCharacter.combatInfo.hpMax,
      current: uiCharacter.combatInfo.currentHp,
      temp: uiCharacter.combatInfo.tempHp,
    },
    hit_dice: {
      type: uiCharacter.combatInfo.hitDiceType,
      total: uiCharacter.combatInfo.hitDiceTotal,
      remaining: uiCharacter.combatInfo.hitDiceRemaining,
    },
    proficiency_list: uiCharacter.abilityProficiencies
      .filter(p => p.proficiencyLevel !== "none")
      .map(p => ({ ability: p.ability, level: p.proficiencyLevel })),
    save_proficiencies: uiCharacter.saveProficiencies || [],
    skill_proficiencies: (uiCharacter.skillProficiencies || [])
      .filter(s => s.level !== "none")
      .map(s => ({ skill: s.id, level: s.level })),
  };
}
