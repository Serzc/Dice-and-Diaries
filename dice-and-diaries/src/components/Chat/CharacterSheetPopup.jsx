import React from "react";
import "../common/Popup.css";

const CharacterSheetPopup = ({ characters, onSelect, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Hoja de personaje">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Seleccionar Personaje</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <p className="popup-desc">Elige el personaje con el que quieres hablar:</p>
          <div className="popup-list" role="list">
            {characters.map(char => (
              <li key={char.id} role="listitem" style={{ listStyle: "none", padding: 0 }}>
                <button className="popup-select-btn" onClick={() => onSelect(char)}>
                  {char.name}
                </button>
              </li>
            ))}
            {characters.length === 0 && (
              <p className="popup-empty">No tienes personajes disponibles.</p>
            )}
          </div>
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetPopup;
