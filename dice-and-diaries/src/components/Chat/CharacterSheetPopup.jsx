import React from "react";
import Button from "../common/Button";

const CharacterSheetPopup = ({ characters, onSelect, onClose }) => {
  return (
    <div className="popup-overlay" role="dialog" aria-label="Hoja de personaje">
      <div className="popup-content">
        <h3>Hoja de Personaje</h3>
        <p>Selecciona un personaje:</p>
        <ul>
          {characters.map((char) => (
            <li key={char.id}>
              <Button onClick={() => onSelect(char)}>{char.name}</Button>
            </li>
          ))}
        </ul>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default CharacterSheetPopup;