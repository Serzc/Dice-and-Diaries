// src/components/Chat/NPCsPopup.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../common/Popup.css";

const NPCsPopup = ({ npcs, onClose, onPossess }) => {
  const navigate = useNavigate();

  const handleViewSheet = (npc) => {
    onClose();
    navigate(`/creatures/${npc.creatureId}`);
  };

  const handlePossess = (npc) => {
    onPossess && onPossess(npc);
    onClose();
  };

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="npcs-popup-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3 id="npcs-popup-title" className="popup-title">NPCs</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
        </div>

        <div className="popup-body">
          {npcs.length === 0 ? (
            <p className="popup-empty">No hay NPCs en esta campaña.</p>
          ) : (
            <div className="popup-list" role="list">
              {npcs.map((npc) => (
                <li key={npc.id} role="listitem" className="npc-list-item">
                  <span className="npc-name">{npc.name}</span>
                  <div className="npc-actions">
                    {npc.creatureId && (
                      <button
                        className="npc-action-btn"
                        onClick={() => handleViewSheet(npc)}
                        aria-label={`Ver hoja de ${npc.name}`}
                      >
                        Ver hoja
                      </button>
                    )}
                    <button
                      className="npc-action-btn npc-possess-btn"
                      onClick={() => handlePossess(npc)}
                      aria-label={`Poseer a ${npc.name}`}
                    >
                      Poseer
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

export default NPCsPopup;
