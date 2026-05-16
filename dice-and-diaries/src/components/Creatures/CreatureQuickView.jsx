// src/components/Creatures/CreatureQuickView.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { fmtMod } from "../../mock/creaturesMock";
import "./CreatureQuickView.css";

const ABILITY_ORDER = [
  { key: "str", label: "FUE" },
  { key: "dex", label: "DES" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "SAB" },
  { key: "cha", label: "CAR" },
];

// Layout: top row STR/CON/WIS, bottom row DEX/INT/CHA (matching Figma)
const ABILITY_ROWS = [
  [
    { key: "str", label: "FUE" },
    { key: "con", label: "CON" },
    { key: "wis", label: "SAB" },
  ],
  [
    { key: "dex", label: "DES" },
    { key: "int", label: "INT" },
    { key: "cha", label: "CAR" },
  ],
];

const CreatureQuickView = ({ creature, isGM, onNavigateToSheet, onPossess }) => {
  const navigate = useNavigate();
  const { hp, ac, cr, abilityScores, actions = [], specialTraits = [] } = creature;

  const displayedActions = actions.slice(0, 3);

  const handleNavigate = () => {
    if (onNavigateToSheet) {
      onNavigateToSheet(creature.id);
    } else {
      navigate(`/creatures/${creature.id}`);
    }
  };

  return (
    <div className="creature-quick-view">
      {/* Fila de stats principales */}
      <div className="quick-stats-row">
        <span className="quick-stat">
          <span className="label">PV: </span>
          <span className="value">{hp.current}/{hp.max}</span>
        </span>
        <span className="quick-stat">
          <span className="label">CA: </span>
          <span className="value">{ac}</span>
        </span>
        <span className="quick-stat">
          <span className="label">CR: </span>
          <span className="value">{cr}</span>
        </span>
      </div>

      <hr className="quick-divider" />

      {/* Grid de características */}
      <div className="ability-grid">
        {ABILITY_ROWS.map((row, rowIdx) =>
          row.map(({ key, label }) => {
            const score = abilityScores[key];
            const modStr = fmtMod(score);
            return (
              <div className="ability-cell" key={`${rowIdx}-${key}`}>
                <div className="ability-abbr">{label}</div>
                <div className="ability-score">{score}</div>
                <div className="ability-mod">{modStr}</div>
              </div>
            );
          })
        )}
      </div>

      <hr className="quick-divider" />

      {/* Acciones */}
      {displayedActions.length > 0 && (
        <div className="quick-actions-block">
          <div className="quick-section-title">Acciones</div>
          {displayedActions.map((action, idx) => (
            <div className="action-item" key={idx}>
              <strong>{action.name}.</strong> {action.description}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="quick-footer">
        <button className="btn-ver-hoja" onClick={handleNavigate}>
          Ver hoja
        </button>
        {isGM && (
          <button
            className="btn-possess"
            onClick={() => onPossess && onPossess(creature)}
          >
            Poseer
          </button>
        )}
      </div>
    </div>
  );
};

export default CreatureQuickView;
