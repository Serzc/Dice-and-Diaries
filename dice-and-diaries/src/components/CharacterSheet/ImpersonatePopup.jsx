import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCharacterCampaigns } from "../../mock/characterSheetMock";
import "../common/Popup.css";
import "./ImpersonatePopup.css";

const ImpersonatePopup = ({ characterId, characterName, onClose }) => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacterCampaigns(characterId).then(setCampaigns);
  }, [characterId]);

  const handleSelect = (campaignId) => {
    navigate(`/campaigns/${campaignId}/chat?characterId=${characterId}&characterName=${encodeURIComponent(characterName)}`);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Impersonar personaje">
      <div className="popup-content impersonate-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Impersonar a {characterName}</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <p className="popup-desc">
            Selecciona una campaña para hablar como este personaje en el chat:
          </p>
          <div className="popup-list" role="list">
            {campaigns.map(camp => (
              <li key={camp.id} role="listitem" style={{ listStyle: "none", padding: 0 }}>
                <button className="popup-select-btn" onClick={() => handleSelect(camp.id)}>
                  {camp.name}
                </button>
              </li>
            ))}
            {campaigns.length === 0 && (
              <p className="popup-empty">No estás en ninguna campaña con este personaje.</p>
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

export default ImpersonatePopup;
