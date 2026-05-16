import React from "react";
import { useNavigate } from "react-router-dom";
import "../common/Popup.css";

const CharacterNotesPopup = ({ campaigns, characterId, onClose }) => {
  const navigate = useNavigate();

  const handleSelectCampaign = (campaignId) => {
    navigate(`/campaigns/${campaignId}/notes?characterId=${characterId}`);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Notas del personaje">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Mis Notas</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <p className="popup-desc">
            Selecciona una campaña para ver las notas de este personaje:
          </p>
          <div className="popup-list" role="list">
            {campaigns.map(camp => (
              <li key={camp.id} role="listitem" style={{ listStyle: "none", padding: 0 }}>
                <button className="popup-select-btn" onClick={() => handleSelectCampaign(camp.id)}>
                  {camp.name}
                </button>
              </li>
            ))}
            {campaigns.length === 0 && (
              <p className="popup-empty">No hay campañas asociadas a este personaje.</p>
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

export default CharacterNotesPopup;
