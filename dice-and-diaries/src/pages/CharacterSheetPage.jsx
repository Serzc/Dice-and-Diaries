import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fetchCharacterSheet, saveCharacterSection } from "../mock/characterSheetMock";
import { fromDatabase, toDatabase } from "../utils/characterDataAdapter";
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
import "./CharacterSheetPage.css";
import Button from "../components/common/Button";

const CharacterSheetPage = () => {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImpersonate, setShowImpersonate] = useState(false);

  // Cargar datos crudos y transformarlos a formato UI
  useEffect(() => {
    fetchCharacterSheet(id).then(rawData => {
      const uiData = fromDatabase(rawData);
      setCharacter(uiData);
      setLoading(false);
    });
  }, [id]);

  // Función genérica para actualizar partes del personaje y guardar en BD
  const updateCharacter = useCallback((partialData) => {
    setCharacter(prev => {
      const updated = { ...prev, ...partialData };
      // Recalcular campos dependientes después de ciertos cambios
      // Como los cálculos de AC, iniciativa ya los hace fromDatabase, 
      // podríamos llamar a fromDatabase de nuevo con los datos completos,
      // pero eso requeriría convertir a formato raw y luego de vuelta.
      // Para simplificar, confiamos en que el estado ya está actualizado.
      // En un caso real, se recalcularía aquí o se delegaría al adaptador.
      return updated;
    });
    // Simulación de guardado: convertimos a formato BD y "enviamos"
    const raw = toDatabase({ ...character, ...partialData });
    console.log("Guardando en BD:", raw);
    // Aquí iría una llamada a la API real
  }, [character]);

  if (loading || !character) return <div className="loading">Cargando hoja de personaje...</div>;

  return (
    <main className="character-sheet-page" aria-labelledby="sheet-heading">
      <h1 id="sheet-heading" className="page-title">{character.name}</h1>

      <div className="sheet-grid">
        {/* Fila 1: Información general (todo el ancho) */}
        <div className="sheet-area area-general">
          <GeneralInfo
            character={character}
            onSave={(data) => updateCharacter(data)}
          />
        </div>

        {/* Fila 2, Col 1: Ability Scores */}
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

        {/* Fila 2, Col 2: Skill Proficiencies */}
        <div className="sheet-area area-proficiencies">
          <AbilityProficienciesSection
            skills={character.skillProficiencies}
            proficiencyBonus={character.proficiencyBonus}
            onSave={(data) => updateCharacter({ skillProficiencies: data })}
          />
        </div>

        {/* Fila 2, Col 3: Información de combate */}
        <div className="sheet-area area-combat">
          <CombatInfoSection
            combatInfo={character.combatInfo}
            onSave={(data) => updateCharacter(data)}
          />
        </div>

        {/* Fila 3, Col 1: Acciones */}
        <div className="sheet-area area-actions">
          <ActionsPanel characterId={character.id} onSave={(data) => updateCharacter({ actions: data })} />
        </div>

        {/* Fila 3, Col 2: Bonus Actions */}
        <div className="sheet-area area-bonus-actions">
          <BonusActionsPanel characterId={character.id} onSave={(data) => updateCharacter({ bonusActions: data })} />
        </div>

        {/* Fila 4, Col 1: Other Proficiencies */}
        <div className="sheet-area area-other-profs">
          <OtherProficienciesPanel
            characterId={character.id}
            onSave={(data) => updateCharacter({ otherProficiencies: data })}
          />
        </div>

        {/* Fila 4, Col 2: Features */}
        <div className="sheet-area area-features">
          <FeaturesList characterId={character.id} onSave={(data) => updateCharacter({ features: data })} />
        </div>

        {/* Fila 5, Col 1: Hechizos */}
        <div className="sheet-area area-spells">
          <SpellsList character={character} onSave={(data) => updateCharacter(data)} />
        </div>

        {/* Fila 5, Col 2: Inventario */}
        <div className="sheet-area area-inventory">
          <InventoryList characterId={character.id} onSave={(data) => updateCharacter({ inventory: data })} />
        </div>

        {/* Fila 6: Historia (todo el ancho) */}
        <div className="sheet-area area-story">
          <StoryPanel characterId={character.id} onSave={(note) => updateCharacter({ characterNote: note })} />
        </div>

        {/* Fila 7: Botón de Impersonar */}
        <div className="sheet-area area-impersonate">
          <Button onClick={() => setShowImpersonate(true)} ariaLabel="Impersonar personaje">
            🎭 Impersonar
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