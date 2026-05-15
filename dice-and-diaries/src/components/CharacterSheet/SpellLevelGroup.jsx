import React from "react";
import SpellCard from "./SpellCard";
import "./SpellLevelGroup.css";

const SpellLevelGroup = ({
  level,
  slots,
  spells,
  onSpendSlot,
  onRecoverSlot,
  onTogglePrepared,
  onEditSpell,
  onDeleteSpell,
}) => {
  const levelSpells = spells.filter(s => s.level === level);
  const slotInfo = slots[level] || { max: 0, current: 0 };

  return (
    <div className="spell-level-group">
      <div className="level-header">
        <h4>Nivel {level}</h4>
        <div className="slot-manager">
          <span className="slot-display">
            {slotInfo.current}/{slotInfo.max}
          </span>
          <button
            onClick={() => onSpendSlot(level)}
            disabled={slotInfo.current <= 0}
            aria-label="Gastar espacio de conjuro"
            className="slot-btn"
          >
            -
          </button>
          <button
            onClick={() => onRecoverSlot(level)}
            disabled={slotInfo.current >= slotInfo.max}
            aria-label="Recuperar espacio de conjuro"
            className="slot-btn"
          >
            +
          </button>
        </div>
      </div>
      <div className="spell-list">
        {levelSpells.map(spell => (
          <SpellCard
            key={spell.id}
            spell={spell}
            onTogglePrepared={onTogglePrepared}
            onEdit={() => onEditSpell(spell)}
            onDelete={() => onDeleteSpell(spell.id)}
          />
        ))}
        {levelSpells.length === 0 && (
          <p className="no-spells">Sin hechizos de este nivel.</p>
        )}
      </div>
    </div>
  );
};

export default SpellLevelGroup;