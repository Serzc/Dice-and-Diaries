import React, { useState } from "react";
import Button from "../common/Button";
import "./CombatInfoSection.css";

const DEFAULT_DEATH_SAVES = { successes: [false, false, false], failures: [false, false, false] };

const CombatInfoSection = ({ combatInfo, onSave, onRest }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited,    setEdited]    = useState({ ...combatInfo });
  const [deathSaves, setDeathSaves] = useState(combatInfo.deathSaves ?? DEFAULT_DEATH_SAVES);

  const isDying = combatInfo.currentHp <= 0;

  const handleEditToggle = () => {
    if (isEditing) {
      onSave && onSave({ combatInfo: { ...edited, deathSaves } });
      setIsEditing(false);
    } else {
      setEdited({ ...combatInfo });
      setIsEditing(true);
    }
  };

  const handleChange = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  const handleUseHitDie = () => {
    const remaining = Math.max(0, combatInfo.hitDiceRemaining - 1);
    onSave && onSave({ combatInfo: { ...combatInfo, hitDiceRemaining: remaining } });
  };

  const toggleDeathSave = (type, index) => {
    const updated = {
      ...deathSaves,
      [type]: deathSaves[type].map((v, i) => (i === index ? !v : v)),
    };
    setDeathSaves(updated);
    onSave && onSave({ combatInfo: { ...combatInfo, deathSaves: updated } });
  };

  return (
    <section className="sheet-section combat-section" aria-labelledby="combat-heading">
      <h3 id="combat-heading">Combate</h3>
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
            <input type="number" value={edited.speed}
              onChange={e => handleChange("speed", parseInt(e.target.value) || 0)} min="0" />
          ) : (
            <span className="combat-value">{combatInfo.speed} ft.</span>
          )}
        </div>
        <div className="combat-item">
          <label>HP Max</label>
          {isEditing ? (
            <input type="number" value={edited.hpMax}
              onChange={e => handleChange("hpMax", parseInt(e.target.value) || 0)} min="0" />
          ) : (
            <span className="combat-value">{combatInfo.hpMax}</span>
          )}
        </div>
        <div className="combat-item">
          <label>Current HP</label>
          {isEditing ? (
            <input type="number" value={edited.currentHp}
              onChange={e => handleChange("currentHp", parseInt(e.target.value) || 0)}
              min="0" max={combatInfo.hpMax} />
          ) : (
            <span className="combat-value">{combatInfo.currentHp}</span>
          )}
        </div>
        <div className="combat-item">
          <label>Temp HP</label>
          {isEditing ? (
            <input type="number" value={edited.tempHp}
              onChange={e => handleChange("tempHp", parseInt(e.target.value) || 0)} min="0" />
          ) : (
            <span className="combat-value">{combatInfo.tempHp}</span>
          )}
        </div>

        {/* Hit Dice */}
        <div className="combat-item combat-item--wide">
          <label>Hit Dice</label>
          {isEditing ? (
            <div className="hit-dice-edit-row">
              <input
                type="number" min="1" max="30"
                value={edited.hitDiceTotal}
                onChange={e => handleChange("hitDiceTotal", parseInt(e.target.value) || 1)}
                style={{ width: "3rem" }}
                aria-label="Total de dados de golpe"
              />
              <select
                value={edited.hitDiceType}
                onChange={e => handleChange("hitDiceType", e.target.value)}
                aria-label="Tipo de dado de golpe"
              >
                {["d4","d6","d8","d10","d12","d20"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hit-dice-row">
              <span className="combat-value">
                {combatInfo.hitDiceType} — {combatInfo.hitDiceRemaining}/{combatInfo.hitDiceTotal}
              </span>
              {combatInfo.hitDiceRemaining > 0 && (
                <button
                  className="hit-die-use-btn"
                  onClick={handleUseHitDie}
                  aria-label="Usar dado de golpe"
                  title="Usar dado de golpe (gasta 1 restante)"
                >
                  Usar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Death Saves — only shown when at 0 HP */}
      {isDying && (
        <div className="death-saves" aria-label="Tiradas de muerte">
          <span className="death-saves-label">Tiradas de muerte</span>
          <div className="death-saves-row">
            <span className="death-saves-type success">Éxitos</span>
            {deathSaves.successes.map((checked, i) => (
              <button
                key={i}
                className={`death-save-box ${checked ? "checked" : ""}`}
                onClick={() => toggleDeathSave("successes", i)}
                aria-label={`Éxito ${i + 1} ${checked ? "marcado" : "vacío"}`}
                aria-pressed={checked}
              />
            ))}
          </div>
          <div className="death-saves-row">
            <span className="death-saves-type failure">Fallos</span>
            {deathSaves.failures.map((checked, i) => (
              <button
                key={i}
                className={`death-save-box failure ${checked ? "checked" : ""}`}
                onClick={() => toggleDeathSave("failures", i)}
                aria-label={`Fallo ${i + 1} ${checked ? "marcado" : "vacío"}`}
                aria-pressed={checked}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rest buttons */}
      <div className="rest-buttons">
        <button className="rest-btn rest-btn--turn" onClick={() => onRest && onRest("turn")}>Turno</button>
        <button className="rest-btn rest-btn--short" onClick={() => onRest && onRest("SR")}>Desc. Corto</button>
        <button className="rest-btn rest-btn--long"  onClick={() => onRest && onRest("LR")}>Desc. Largo</button>
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
