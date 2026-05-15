import React, { useState } from "react";
import Button from "../common/Button";
import "./CombatInfoSection.css";

const CombatInfoSection = ({ combatInfo, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({ ...combatInfo });

  const handleEditToggle = () => {
    if (isEditing) {
      onSave({ combatInfo: edited });
      setIsEditing(false);
    } else {
      setEdited({ ...combatInfo });
      setIsEditing(true);
    }
  };

  const handleChange = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  // Campo de hit dice no editable (por ahora) pero se podría ampliar

  return (
    <section className="sheet-section combat-section" aria-labelledby="combat-heading">
      <h3 id="combat-heading">Combat Info</h3>
      <div className="combat-grid">
        <div className="combat-item">
          <label>AC</label>
          <span className="combat-value">{combatInfo.ac}</span>
        </div>
        <div className="combat-item">
          <label>Iniciativa</label>
          <span className="combat-value">
            {combatInfo.initiative >= 0 ? "+" : ""}{combatInfo.initiative}
          </span>
        </div>
        <div className="combat-item">
          <label>Speed</label>
          {isEditing ? (
            <input
              type="number"
              value={edited.speed}
              onChange={e => handleChange("speed", parseInt(e.target.value) || 0)}
              min="0"
            />
          ) : (
            <span className="combat-value">{combatInfo.speed} ft.</span>
          )}
        </div>
        <div className="combat-item">
          <label>HP Max</label>
          {isEditing ? (
            <input
              type="number"
              value={edited.hpMax}
              onChange={e => handleChange("hpMax", parseInt(e.target.value) || 0)}
              min="0"
            />
          ) : (
            <span className="combat-value">{combatInfo.hpMax}</span>
          )}
        </div>
        <div className="combat-item">
          <label>Current HP</label>
          {isEditing ? (
            <input
              type="number"
              value={edited.currentHp}
              onChange={e => handleChange("currentHp", parseInt(e.target.value) || 0)}
              min="0"
              max={combatInfo.hpMax}
            />
          ) : (
            <span className="combat-value">{combatInfo.currentHp}</span>
          )}
        </div>
        <div className="combat-item">
          <label>Temp HP</label>
          {isEditing ? (
            <input
              type="number"
              value={edited.tempHp}
              onChange={e => handleChange("tempHp", parseInt(e.target.value) || 0)}
              min="0"
            />
          ) : (
            <span className="combat-value">{combatInfo.tempHp}</span>
          )}
        </div>
        <div className="combat-item">
          <label>Hit Dice</label>
          <span className="combat-value">
            {combatInfo.hitDiceType} (Total: {combatInfo.hitDiceTotal}, Rest: {combatInfo.hitDiceRemaining})
          </span>
        </div>
      </div>
      <Button
        onClick={handleEditToggle}
        ariaLabel={isEditing ? "Guardar información de combate" : "Editar información de combate"}
      >
        {isEditing ? "✓" : "✎"}
      </Button>
    </section>
  );
};

export default CombatInfoSection;