import React, { useState } from "react";
import Button from "../common/Button";
import "./AbilityScoresSection.css";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_NAMES = {
  str: "Fuerza",
  dex: "Destreza",
  con: "Constitución",
  int: "Inteligencia",
  wis: "Sabiduría",
  cha: "Carisma",
};

const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);

const AbilityScoresSection = ({ scores, modifiers, savingThrows, saveProficiencies = [], proficiencyBonus, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScores, setEditedScores] = useState({ ...scores });

  const handleEditToggle = () => {
    if (isEditing) {
      onSave({ abilityScores: editedScores });
      setIsEditing(false);
    } else {
      setEditedScores({ ...scores });
      setIsEditing(true);
    }
  };

  const handleScoreChange = (ability, value) => {
    setEditedScores(prev => ({ ...prev, [ability]: parseInt(value) || 0 }));
  };

  const toggleSaveProficiency = (ab) => {
    const updated = saveProficiencies.includes(ab)
      ? saveProficiencies.filter(x => x !== ab)
      : [...saveProficiencies, ab];
    onSave({ saveProficiencies: updated });
  };

  return (
    <section className="sheet-section ability-scores-section" aria-labelledby="ability-scores-heading">
      <div className="ability-scores-header-row">
        <h3 id="ability-scores-heading">Atributos</h3>
        {proficiencyBonus !== undefined && (
          <span className="prof-bonus-badge" title="Bonificador de competencia">
            BC: {fmt(proficiencyBonus)}
          </span>
        )}
      </div>

      {/* Column headers */}
      <div className="ability-col-headers" aria-hidden="true">
        <span>Hab.</span>
        <span>Punt.</span>
        <span>Mod.</span>
        <span title="Competencia en tirada de salvación">Prof.</span>
        <span>Sal.</span>
      </div>

      <div className="ability-scores-list">
        {ABILITIES.map(ab => {
          const isSaveProficient = saveProficiencies.includes(ab);
          const saveVal = savingThrows?.[ab];
          return (
            <div key={ab} className="ability-item">
              <span className="ability-name" title={ABILITY_NAMES[ab]}>
                {ab.toUpperCase()}
              </span>

              {isEditing ? (
                <input
                  type="number"
                  value={editedScores[ab]}
                  onChange={e => handleScoreChange(ab, e.target.value)}
                  min="1" max="30"
                  className="score-input"
                  aria-label={`${ABILITY_NAMES[ab]} puntuación`}
                />
              ) : (
                <span className="score-value" title={`Puntuación de ${ABILITY_NAMES[ab]}`}>
                  {scores[ab]}
                </span>
              )}

              <span className="modifier-value" title={`Modificador de ${ABILITY_NAMES[ab]}`}>
                {fmt(modifiers[ab])}
              </span>

              <input
                type="checkbox"
                className="save-prof-checkbox"
                checked={isSaveProficient}
                onChange={() => toggleSaveProficiency(ab)}
                aria-label={`Competencia en salvación de ${ABILITY_NAMES[ab]}`}
                title={`Competencia en salvación de ${ABILITY_NAMES[ab]}`}
              />

              <span
                className={`save-value ${isSaveProficient ? "save-proficient" : ""}`}
                title={`Salvación de ${ABILITY_NAMES[ab]}${isSaveProficient ? " (competente)" : ""}`}
              >
                {saveVal !== undefined ? fmt(saveVal) : fmt(modifiers[ab] ?? 0)}
              </span>
            </div>
          );
        })}
      </div>

      <Button
        onClick={handleEditToggle}
        ariaLabel={isEditing ? "Guardar puntuaciones" : "Editar puntuaciones"}
      >
        {isEditing ? "✓" : "✎"}
      </Button>
    </section>
  );
};

export default AbilityScoresSection;
