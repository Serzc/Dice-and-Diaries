import React, { useState } from "react";
import Button from "../common/Button";
import "./DiceRoller.css";

const DiceRoller = ({ onRoll, onClose }) => {
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState(20);
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [result, setResult] = useState(null);

  const roll = () => {
    const results = [];
    const rollCount = advantage || disadvantage ? 2 : count;
    for (let i = 0; i < rollCount; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }
    let finalResults, total;
    if (advantage) {
      total = Math.max(...results);
      finalResults = results;
    } else if (disadvantage) {
      total = Math.min(...results);
      finalResults = results;
    } else {
      total = results.reduce((a, b) => a + b, 0);
      finalResults = results;
    }
    setResult({ results: finalResults, total });
    const notation = `${count}d${sides}`;
    onRoll(notation, finalResults, total, advantage, disadvantage);
  };

  return (
    <div className="popup-overlay" role="dialog" aria-label="Tirada de dados">
      <div className="popup-content">
        <h3>Tirada de Dados</h3>
        <div className="form-group">
          <label htmlFor="dice-count">Número de dados</label>
          <input id="dice-count" type="number" min="1" value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} />
        </div>
        <div className="form-group">
          <label htmlFor="dice-sides">Caras</label>
          <select id="dice-sides" value={sides} onChange={(e) => setSides(parseInt(e.target.value))}>
            <option value={4}>d4</option>
            <option value={6}>d6</option>
            <option value={8}>d8</option>
            <option value={10}>d10</option>
            <option value={12}>d12</option>
            <option value={20}>d20</option>
            <option value={100}>d100</option>
          </select>
        </div>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" checked={advantage} onChange={() => { setAdvantage(!advantage); if (!advantage) setDisadvantage(false); }} />
            Ventaja
          </label>
          <label>
            <input type="checkbox" checked={disadvantage} onChange={() => { setDisadvantage(!disadvantage); if (!disadvantage) setAdvantage(false); }} />
            Desventaja
          </label>
        </div>
        <div className="popup-actions">
          <Button onClick={roll} ariaLabel="Lanzar dados">Lanzar</Button>
          <Button onClick={onClose} ariaLabel="Cerrar">Cerrar</Button>
        </div>
        {result && (
          <div className="roll-preview">
            Resultado: [{result.results.join(", ")}] = {result.total}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceRoller;