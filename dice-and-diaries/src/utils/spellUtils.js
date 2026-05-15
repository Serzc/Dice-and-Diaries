// src/utils/spellUtils.js

/**
 * Calcula el modificador de aptitud mágica y la CD de salvación.
 * @param {string} ability - "str", "dex", etc.
 * @param {object} abilityScores - { str: 14, ... }
 * @param {number} proficiencyBonus
 * @returns {{ spellMod: number, spellSaveDC: number }}
 */
export function getSpellcastingStats(ability, abilityScores, proficiencyBonus) {
  const mod = Math.floor((abilityScores[ability] - 10) / 2);
  return {
    spellMod: mod,
    spellSaveDC: 8 + mod + proficiencyBonus,
  };
}