import React from "react";
import "./ItemCard.css";

const ItemCard = ({ item, onEdit, onDelete, onToggleEquip }) => {
  return (
    <div className="item-card" aria-label={`Objeto: ${item.name}`}>
      <div className="item-header">
        <h4 className="item-name">{item.name}</h4>
        <span className="item-weight">{item.weight} lb</span>
        <span className="item-quantity">x{item.quantity}</span>
      </div>
      {item.description && <p className="item-desc">{item.description}</p>}
      {item.effect && <div className="item-effect-summary">{renderItemEffect(item.effect)}</div>}
      <div className="item-footer">
        {item.equipable && (
          <label className="equip-label">
            <input
              type="checkbox"
              checked={item.equipped}
              onChange={() => onToggleEquip(item.id)}
              aria-label={`Equipar ${item.name}`}
            />
            Equipado
          </label>
        )}
        <div className="item-controls">
          <button onClick={onEdit} aria-label="Editar objeto" className="icon-btn">✎</button>
          <button onClick={onDelete} aria-label="Eliminar objeto" className="icon-btn">🗑</button>
        </div>
      </div>
    </div>
  );
};

function renderItemEffect(effect) {
  const parts = [];
  if (effect.damage) parts.push(`Daño: ${effect.damage} ${effect.type || ""}`);
  if (effect.ac_bonus) parts.push(`CA +${effect.ac_bonus}`);
  if (effect.heal) parts.push(`Cura: ${effect.heal}`);
  return <p className="effect-text">{parts.join(" | ")}</p>;
}

export default ItemCard;