import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import "../common/Popup.css"; // Estilo genérico para modales

const CharacterNotesPopup = ({ campaigns, characterId, onClose }) => {
  const navigate = useNavigate();

  const handleSelectCampaign = (campaignId) => {
    navigate(`/campaigns/${campaignId}/notes?characterId=${characterId}`);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Notas del personaje por campaña">
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>Mis Notas</h3>
        <p>Selecciona una campaña para ver las notas de este personaje:</p>
        <ul className="campaign-list-popup">
          {campaigns.map((camp) => (
            <li key={camp.id}>
              <Button onClick={() => handleSelectCampaign(camp.id)}>
                {camp.name}
              </Button>
            </li>
          ))}
          {campaigns.length === 0 && <li>No hay campañas asociadas.</li>}
        </ul>
        <div className="popup-actions">
          <Button onClick={onClose} ariaLabel="Cerrar">Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterNotesPopup;