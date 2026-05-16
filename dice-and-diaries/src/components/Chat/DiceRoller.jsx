import React, { useState } from "react";
import "../common/Popup.css";

const DICE_OPTIONS = [4, 6, 8, 10, 12, 20, 100];

const DiceRoller = ({ onRoll, onClose }) => {
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState(20);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [result, setResult] = useState(null);

  const roll = () => {
    const rollCount = advantage || disadvantage ? 2 : count;
    const results = Array.from({ length: rollCount }, () =>
      Math.floor(Math.random() * sides) + 1
    );
    let total;
    if (advantage) total = Math.max(...results);
    else if (disadvantage) total = Math.min(...results);
    else total = results.reduce((a, b) => a + b, 0);

    setResult({ results, total });
    onRoll(`${count}d${sides}`, results, total, advantage, disadvantage);
  };

  const toggleAdvantage = () => {
    setAdvantage(a => !a);
    setDisadvantage(false);
  };

  const toggleDisadvantage = () => {
    setDisadvantage(d => !d);
    setAdvantage(false);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Tirada de dados">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Tirada de Dados</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          {/* Dice type grid */}
          <div className="dice-grid">
            {DICE_OPTIONS.map(d => (
              <button
                key={d}
                className={`dice-btn ${sides === d ? "dice-selected" : ""}`}
                onClick={() => setSides(d)}
                aria-pressed={sides === d}
              >
                d{d}
              </button>
            ))}
          </div>

          {/* Count */}
          <div className="dice-count-row">
            <label htmlFor="dice-count">Cantidad</label>
            <input
              id="dice-count"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Advantage / disadvantage */}
          <div className="adv-row">
            <button
              className={`adv-btn ${advantage ? "adv-active" : ""}`}
              onClick={toggleAdvantage}
              aria-pressed={advantage}
            >
              Ventaja
            </button>
            <button
              className={`adv-btn ${disadvantage ? "disadv-active" : ""}`}
              onClick={toggleDisadvantage}
              aria-pressed={disadvantage}
            >
              Desventaja
            </button>
          </div>

          {result && (
            <div className="roll-preview" aria-live="polite">
              [{result.results.join(", ")}] = <strong>{result.total}</strong>
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button
            className="primary-button"
            onClick={roll}
            aria-label="Lanzar dados"
          >
            Lanzar {count}d{sides}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiceRoller;
