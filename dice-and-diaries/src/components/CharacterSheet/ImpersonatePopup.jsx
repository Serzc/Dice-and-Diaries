import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCharacterCampaigns } from "../../mock/db";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "../common/Popup.css";
import "./ImpersonatePopup.css";

const ImpersonatePopup = ({ characterId, characterName, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacterCampaigns(characterId).then(setCampaigns);
  }, [characterId]);

  const handleSelect = (campaignId) => {
    navigate(`/campaigns/${campaignId}/chat?characterId=${characterId}&characterName=${encodeURIComponent(characterName)}`);
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
         aria-labelledby="impersonate-popup-title"
         onKeyDown={(e) => e.key === "Escape" && onClose()}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="popup-content impersonate-popup" ref={contentRef}>
        <div className="popup-header">
          <h2 id="impersonate-popup-title" className="popup-title">Impersonar a {characterName}</h2>
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
