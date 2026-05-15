import React from "react";
import Button from "../common/Button";
import "./FeatureCard.css";

const FeatureCard = ({ feature, onEdit, onDelete, onUse }) => {
  // Determinar si tiene usos limitados
  const hasUses = feature.effect?.action?.uses || feature.effect?.uses;
  const uses = feature.effect?.action?.uses || feature.effect?.uses;

  return (
    <div className="feature-card" aria-label={`Feature: ${feature.name}`}>
      <div className="feature-header">
        <h4 className="feature-name">{feature.name}</h4>
        <div className="feature-actions">
          {hasUses && (
            <span className="feature-uses">
              {uses.current}/{uses.max}
            </span>
          )}
          <Button onClick={onEdit} ariaLabel={`Editar ${feature.name}`}>✎</Button>
          <Button onClick={onDelete} ariaLabel={`Eliminar ${feature.name}`}>🗑</Button>
        </div>
      </div>
      <p className="feature-desc">{feature.description}</p>
      {hasUses && (
        <Button onClick={onUse} ariaLabel={`Usar ${feature.name}`} disabled={uses.current <= 0}>
          Usar
        </Button>
      )}
      <div className="feature-effect-summary">
        {renderEffectSummary(feature.effect)}
      </div>
    </div>
  );
};

// Pequeña función para mostrar un resumen legible del efecto
const renderEffectSummary = (effect) => {
  if (!effect) return null;
  const parts = [];
  if (effect.action?.attack) {
    parts.push(`Ataque: ${effect.action.attack.damage} ${effect.action.attack.type || ""}`);
  }
  if (effect.action?.heal) {
    parts.push(`Cura: ${effect.action.heal}`);
  }
  if (effect.modifiers?.ac_bonus) {
    parts.push(`CA +${effect.modifiers.ac_bonus}`);
  }
  if (effect.modifiers?.ability_proficiencies) {
    parts.push(`Competencias: ${effect.modifiers.ability_proficiencies.map(p => `${p.ability} ${p.level}`).join(", ")}`);
  }
  return <p className="effect-summary">{parts.join(" | ")}</p>;
};

export default FeatureCard;