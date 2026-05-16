import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchCharacterSheet, saveCharacterSection } from "../mock/db";
import {
  fromDatabase,
  toDatabase,
  computeProficiencyBonus,
  serializeAbilityScores,
  serializeSaveProficiencies,
  serializeSkillProficiencies,
} from "../utils/characterDataAdapter";
import GeneralInfo from "../components/CharacterSheet/GeneralInfo";
import AbilityScoresSection from "../components/CharacterSheet/AbilityScoresSection";
import AbilityProficienciesSection from "../components/CharacterSheet/AbilityProficienciesSection";
import CombatInfoSection from "../components/CharacterSheet/CombatInfoSection";
import ActionsPanel from "../components/CharacterSheet/ActionsPanel";
import BonusActionsPanel from "../components/CharacterSheet/BonusActionsPanel";
import OtherProficienciesPanel from "../components/CharacterSheet/OtherProficienciesPanel";
import FeaturesList from "../components/CharacterSheet/FeaturesList";
import SpellsList from "../components/CharacterSheet/SpellsList";
import InventoryList from "../components/CharacterSheet/InventoryList";
import StoryPanel from "../components/CharacterSheet/StoryPanel";
import ImpersonatePopup from "../components/CharacterSheet/ImpersonatePopup";
import Button from "../components/common/Button";
import "./CharacterSheetPage.css";

// Recompute AC from equipped items and feature effects
function calcAC(abilityModifiers, inventory = [], features = []) {
  let ac = 10 + (abilityModifiers?.dex ?? 0);
  inventory.forEach(item => {
    if (item.equipped && item.effect?.ac_bonus) ac += item.effect.ac_bonus;
  });
  features.forEach(feat => {
    if (feat.effect?.ac_bonus) ac += feat.effect.ac_bonus;
    if (feat.effect?.modifiers?.ac_bonus) ac += feat.effect.modifiers.ac_bonus;
  });
  return ac;
}

// Recompute initiative from DEX mod and feature bonuses
function calcInitiative(abilityModifiers, features = []) {
  let init = abilityModifiers?.dex ?? 0;
  features.forEach(feat => {
    if (feat.effect?.initiative_bonus) init += feat.effect.initiative_bonus;
  });
  return init;
}

const CharacterSheetPage = () => {
  const { id } = useParams();
  const [character,       setCharacter]       = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [showImpersonate, setShowImpersonate] = useState(false);

  useEffect(() => {
    fetchCharacterSheet(id).then(rawData => {
      const uiData = fromDatabase(rawData);
      // Store arrays needed for reactive AC/initiative recalculation
      uiData.inventory = rawData.inventory ?? [];
      uiData.features  = rawData.stored_features ?? rawData.features ?? [];
      setCharacter(uiData);
      setLoading(false);
    });
  }, [id]);

  const updateCharacter = useCallback((partialData) => {
    setCharacter(prev => {
      const updated = { ...prev, ...partialData };

      // Recompute proficiency bonus when level changes
      if ("level" in partialData) {
        updated.proficiencyBonus = computeProficiencyBonus(updated.level);
      }

      // Recompute AC and initiative when relevant data changes
      if ("inventory" in partialData || "features" in partialData || "abilityScores" in partialData) {
        if ("abilityScores" in partialData) {
          // Recompute modifiers inline
          const scores = updated.abilityScores;
          const mods = {};
          for (const ab of ["str","dex","con","int","wis","cha"]) {
            mods[ab] = Math.floor(((scores[ab] ?? 10) - 10) / 2);
          }
          updated.abilityModifiers = mods;
        }
        updated.combatInfo = {
          ...updated.combatInfo,
          ac:         calcAC(updated.abilityModifiers, updated.inventory, updated.features),
          initiative: calcInitiative(updated.abilityModifiers, updated.features),
        };
      }

      // Persist to mock / real DB
      const coreKeys = ["name","classes","species","background","level","imageUrl",
                        "abilityScores","combatInfo","saveProficiencies","skillProficiencies",
                        "abilityProficiencies","spellcastingAbility"];
      const isCore = Object.keys(partialData).some(k => coreKeys.includes(k));
      if (isCore) {
        saveCharacterSection(id, "core", toDatabase(updated));
      } else {
        const [section, value] = Object.entries(partialData)[0];
        saveCharacterSection(id, section, value);
      }

      return updated;
    });
  }, [id]);

  if (loading || !character) return <div className="loading">Cargando hoja de personaje...</div>;

  return (
    <main className="character-sheet-page" aria-labelledby="sheet-heading">
      <h1 id="sheet-heading" className="page-title">{character.name}</h1>

      <div className="sheet-grid">
        <div className="sheet-area area-general">
          <GeneralInfo character={character} onSave={(data) => updateCharacter(data)} />
        </div>
        <div className="sheet-area area-abilities">
          <AbilityScoresSection
            scores={character.abilityScores}
            modifiers={character.abilityModifiers}
            savingThrows={character.savingThrows}
            saveProficiencies={character.saveProficiencies}
            proficiencyBonus={character.proficiencyBonus}
            onSave={(data) => updateCharacter(data)}
          />
        </div>
        <div className="sheet-area area-proficiencies">
          <AbilityProficienciesSection
            skills={character.skillProficiencies}
            proficiencyBonus={character.proficiencyBonus}
            onSave={(data) => updateCharacter({ skillProficiencies: data })}
          />
        </div>
        <div className="sheet-area area-combat">
          <CombatInfoSection
            combatInfo={character.combatInfo}
            onSave={(data) => updateCharacter(data)}
          />
        </div>
        <div className="sheet-area area-actions">
          <ActionsPanel characterId={character.id} onSave={(data) => updateCharacter({ actions: data })} />
        </div>
        <div className="sheet-area area-bonus-actions">
          <BonusActionsPanel characterId={character.id} onSave={(data) => updateCharacter({ bonusActions: data })} />
        </div>
        <div className="sheet-area area-other-profs">
          <OtherProficienciesPanel
            characterId={character.id}
            onSave={(data) => updateCharacter({ otherProficiencies: data })}
          />
        </div>
        <div className="sheet-area area-features">
          <FeaturesList characterId={character.id} onSave={(data) => updateCharacter({ features: data })} />
        </div>
        <div className="sheet-area area-spells">
          <SpellsList character={character} onSave={(data) => updateCharacter(data)} />
        </div>
        <div className="sheet-area area-inventory">
          <InventoryList characterId={character.id} onSave={(data) => updateCharacter({ inventory: data })} />
        </div>
        <div className="sheet-area area-story">
          <StoryPanel characterId={character.id} onSave={(note) => updateCharacter({ characterNote: note })} />
        </div>
        <div className="sheet-area area-impersonate">
          <Button onClick={() => setShowImpersonate(true)} ariaLabel="Impersonar personaje">
            Impersonar
          </Button>
        </div>
      </div>

      {showImpersonate && (
        <ImpersonatePopup
          characterId={character.id}
          characterName={character.name}
          onClose={() => setShowImpersonate(false)}
        />
      )}
    </main>
  );
};

export default CharacterSheetPage;
