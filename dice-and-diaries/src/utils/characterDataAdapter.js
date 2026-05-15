// src/utils/characterDataAdapter.js

/**
 * Convierte los datos crudos de la base de datos al objeto de personaje que usa la UI.
 * @param {Object} raw - Datos como vienen de la BD.
 * @returns {Object} Datos preparados para los componentes.
 */
export function fromDatabase(raw) {
  const abilityScores = raw.ability_scores;
  const abilityModifiers = {};
  for (let ab of ["str","dex","con","int","wis","cha"]) {
    abilityModifiers[ab] = Math.floor((abilityScores[ab] - 10) / 2);
  }

  // Calcular AC base + bonificadores de features e inventario.
  let ac = 10 + abilityModifiers.dex; // armadura no equipada por defecto
  // En un sistema real se sumarían bonos de armaduras, escudos, etc.
  // Simulamos un bono de armadura si existe en inventario.
  if (raw.inventory) {
    for (let item of raw.inventory) {
      if (item.equipped && item.effect?.ac_bonus) {
        ac += item.effect.ac_bonus;
      }
    }
  }
  // Features que modifican AC
  if (raw.features) {
    for (let feat of raw.features) {
      if (feat.effect?.ac_bonus) {
        ac += feat.effect.ac_bonus;
      }
    }
  }

  // Iniciativa = modificador de destreza + otros bonos
  let initiative = abilityModifiers.dex;
  // Simulamos bonos de features
  if (raw.features) {
    for (let feat of raw.features) {
      if (feat.effect?.initiative_bonus) {
        initiative += feat.effect.initiative_bonus;
      }
    }
  }

  // Procesar proficiencias de habilidad
  const proficiencies = raw.proficiency_list || []; // formato: [{ability: 'dex', level: 'proficient'}, ...]
  const proficiencyBonus = raw.proficiency_bonus; // dado por nivel

  // Mapeo de habilidades con modificador total
  const abilityProficiencies = ["str","dex","con","int","wis","cha"].map(ab => {
    const baseMod = abilityModifiers[ab];
    const prof = proficiencies.find(p => p.ability === ab);
    let level = "none";
    let totalMod = baseMod;
    if (prof) {
      level = prof.level;
      if (level === "proficient") totalMod += proficiencyBonus;
      else if (level === "expert") totalMod += proficiencyBonus * 2; // house rule
    }
    return { ability: ab, baseMod, proficiencyLevel: level, totalMod };
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
    abilityProficiencies, // [{ ability, baseMod, proficiencyLevel, totalMod }]
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
    // ... otros datos que se irán agregando
  };
}

/**
 * Convierte el estado del personaje de vuelta al formato de la base de datos.
 * @param {Object} uiCharacter - Datos del personaje en el estado de la UI.
 * @returns {Object} Datos listos para enviar a la BD.
 */
export function toDatabase(uiCharacter) {
  // Transformación inversa (ejemplo básico)
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
    // Las demás propiedades se añadirán según se necesiten
  };
}