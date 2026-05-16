import React from "react";
import "../common/Popup.css";

const NPCsPopup = ({ npcs, onClose }) => {
  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="NPCs de la campaña">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">NPCs</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          {npcs.length === 0 ? (
            <p className="popup-empty">No hay NPCs en esta campaña.</p>
          ) : (
            <ul className="popup-list" role="list">
              {npcs.map(npc => (
                <li key={npc.id}>{npc.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default NPCsPopup;
