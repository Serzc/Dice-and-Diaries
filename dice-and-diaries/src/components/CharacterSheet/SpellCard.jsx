import React from "react";
import "./SpellCard.css";

const SpellCard = ({ spell, onTogglePrepared, onEdit, onDelete }) => {
  return (
    <div className="spell-card">
      <div className="spell-header">
        <h4 className="spell-name">{spell.name}</h4>
        <div className="spell-tags">
          {spell.ritual && <span className="tag ritual" title="Ritual">R</span>}
          {spell.concentration && <span className="tag concentration" title="Concentración">C</span>}
        </div>
      </div>
      <p className="spell-desc">{spell.description}</p>
      <div className="spell-effect-summary">
        {renderSpellEffect(spell.effect)}
      </div>
      <div className="spell-footer">
        <label className="prepared-label">
          <input
            type="checkbox"
            checked={spell.prepared}
            onChange={() => onTogglePrepared(spell.id)}
            aria-label={`Preparar ${spell.name}`}
          />
          Preparado
        </label>
        <div className="spell-controls">
          <button onClick={onEdit} aria-label="Editar hechizo" className="icon-btn">✎</button>
          <button onClick={onDelete} aria-label="Eliminar hechizo" className="icon-btn">🗑</button>
        </div>
      </div>
    </div>
  );
};

// Helper para mostrar el efecto de manera compacta
function renderSpellEffect(effect) {
  if (!effect) return null;
  const parts = [];
  if (effect.damage) parts.push(`Daño: ${effect.damage} ${effect.type || ""}`);
  if (effect.range) parts.push(`Alcance: ${effect.range}`);
  if (effect.components) parts.push(`Comp: ${effect.components}`);
  if (effect.duration) parts.push(`Dur: ${effect.duration}`);
  return <p className="effect-text">{parts.join(" | ")}</p>;
}

export default SpellCard;