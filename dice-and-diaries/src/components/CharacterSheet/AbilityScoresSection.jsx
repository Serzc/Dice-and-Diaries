import React, { useState } from "react";
import Button from "../common/Button";
import "./AbilityScoresSection.css";

const abilityAbbr = ["str", "dex", "con", "int", "wis", "cha"];
const abilityNames = {
  str: "Strength", dex: "Dexterity", con: "Constitution",
  int: "Intelligence", wis: "Wisdom", cha: "Charisma",
};

const AbilityScoresSection = ({ scores, modifiers, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScores, setEditedScores] = useState({ ...scores });

  const handleEditToggle = () => {
    if (isEditing) {
      // Guardar cambios
      onSave({ abilityScores: editedScores });
      setIsEditing(false);
    } else {
      setEditedScores({ ...scores });
      setIsEditing(true);
    }
  };

  const handleScoreChange = (ability, value) => {
    setEditedScores(prev => ({
      ...prev,
      [ability]: parseInt(value) || 0,
    }));
  };

  return (
    <section className="sheet-section ability-scores-section" aria-labelledby="ability-scores-heading">
      <h3 id="ability-scores-heading">Ability Scores</h3>
      <div className="ability-scores-list">
        {abilityAbbr.map(ab => (
          <div key={ab} className="ability-item">
            <span className="ability-name" aria-label={abilityNames[ab]}>{ab.toUpperCase()}</span>
            {isEditing ? (
              <input
                type="number"
                value={editedScores[ab]}
                onChange={e => handleScoreChange(ab, e.target.value)}
                min="0"
                max="30"
                className="score-input"
                aria-label={`${abilityNames[ab]} score`}
              />
            ) : (
              <span className="score-value">{scores[ab]}</span>
            )}
            <span className="modifier-value">
              {modifiers[ab] >= 0 ? "+" : ""}{modifiers[ab]}
            </span>
          </div>
        ))}
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