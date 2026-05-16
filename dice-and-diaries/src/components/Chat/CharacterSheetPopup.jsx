import React from "react";
import { useNavigate } from "react-router-dom";
import "../common/Popup.css";

const CharacterSheetPopup = ({ characters, onSelect, onClose }) => {
  const navigate = useNavigate();

  const handleViewSheet = (char) => {
    onClose();
    navigate(`/characters/${char.id}`);
  };

  const handleSpeak = (char) => {
    onSelect && onSelect(char);
    onClose();
  };

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Personajes"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Personajes</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
        </div>

        <div className="popup-body">
          {characters.length === 0 ? (
            <p className="popup-empty">No tienes personajes disponibles.</p>
          ) : (
            <div className="popup-list" role="list">
              {characters.map((char) => (
                <li key={char.id} role="listitem" className="npc-list-item">
                  <span className="npc-name">{char.name}</span>
                  <div className="npc-actions">
                    <button
                      className="npc-action-btn"
                      onClick={() => handleViewSheet(char)}
                      aria-label={`Ver hoja de ${char.name}`}
                    >
                      Ver hoja
                    </button>
                    <button
                      className="npc-action-btn npc-possess-btn"
                      onClick={() => handleSpeak(char)}
                      aria-label={`Hablar como ${char.name}`}
                    >
                      Hablar
                    </button>
                  </div>
                </li>
              ))}
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheetPopup;
