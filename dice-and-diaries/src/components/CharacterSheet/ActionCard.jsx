import React from "react";
import Button from "../common/Button";
import "./ActionCard.css";

const ActionCard = ({ action, onUse, onEdit, onDelete }) => {
  const uses = action.uses;
  const rechargeLabels = {
    PerTurn: "Por turno",
    SR: "Descanso corto",
    LR: "Descanso largo",
  };

  return (
    <div className="action-card" aria-label={`Acción: ${action.name}`}>
      <div className="action-header">
        <h4 className="action-name">{action.name}</h4>
        <div className="action-uses">
          {uses && (
            <span className={`uses-display ${uses.current === 0 ? "depleted" : ""}`}>
              {uses.current}/{uses.max}
            </span>
          )}
          <span className="recharge-badge">{rechargeLabels[action.recharge] || action.recharge}</span>
        </div>
      </div>
      <p className="action-desc">{action.description}</p>
      <div className="action-controls">
        <Button onClick={onUse} disabled={uses && uses.current <= 0} ariaLabel={`Usar ${action.name}`}>
          Usar
        </Button>
        <Button onClick={onEdit} ariaLabel={`Editar ${action.name}`}>✎</Button>
        <Button onClick={onDelete} ariaLabel={`Eliminar ${action.name}`}>🗑</Button>
      </div>
    </div>
  );
};

export default ActionCard;