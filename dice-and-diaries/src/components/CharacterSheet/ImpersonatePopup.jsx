import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { fetchCharacterCampaigns } from "../../mock/characterSheetMock";
import "./ImpersonatePopup.css";

const ImpersonatePopup = ({ characterId, characterName, onClose }) => {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacterCampaigns(characterId).then(setCampaigns);
  }, [characterId]);

  const handleSelect = (campaignId) => {
    // Redirige al chat de la campaña con el parámetro characterId para impersonar
    navigate(`/campaigns/${campaignId}/chat?characterId=${characterId}&characterName=${encodeURIComponent(characterName)}`);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Impersonar personaje">
      <div className="popup-content impersonate-popup" onClick={e => e.stopPropagation()}>
        <h3>Impersonar a {characterName}</h3>
        <p>Selecciona una campaña para hablar como este personaje:</p>
        <ul className="campaign-list">
          {campaigns.map(camp => (
            <li key={camp.id}>
              <Button onClick={() => handleSelect(camp.id)}>
                {camp.name}
              </Button>
            </li>
          ))}
          {campaigns.length === 0 && <li>No estás en ninguna campaña con este personaje.</li>}
        </ul>
        <div className="popup-actions">
          <Button onClick={onClose} ariaLabel="Cerrar">Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

export default ImpersonatePopup;