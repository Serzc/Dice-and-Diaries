import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import "./CampaignCard.css";

const CampaignCard = ({ campaign, isGM }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Card className="campaign-card" role="listitem" aria-labelledby={`campaign-${campaign.id}-name`}>
      <div className="campaign-info">
        <h2 id={`campaign-${campaign.id}-name`} className="campaign-name">
          {campaign.name}
        </h2>
        <div className="campaign-meta">
          {isGM && <span className="badge gm-badge">GM</span>}
          <span className={`badge status-badge ${campaign.active ? "active" : "inactive"}`}>
            {campaign.active ? "Activa" : "Inactiva"}
          </span>
        </div>
      </div>

      <div className="campaign-actions" role="group" aria-label="Acciones de campaña">
        <Button onClick={() => handleNavigate(`/campaigns/${campaign.id}/notes`)} ariaLabel={`Notas de ${campaign.name}`}>
          Notas
        </Button>
        <Button onClick={() => handleNavigate(`/campaigns/${campaign.id}/chat`)} ariaLabel={`Chat de ${campaign.name}`}>
          Chat
        </Button>
        {isGM && (
          <>
            <Button onClick={() => handleNavigate(`/campaigns/${campaign.id}/npcs`)} ariaLabel={`NPCs de ${campaign.name}`}>
              NPCs
            </Button>
            <Button onClick={() => handleNavigate(`/campaigns/${campaign.id}/players`)} ariaLabel={`Gestionar jugadores de ${campaign.name}`}>
              Jugadores
            </Button>
            <Button onClick={() => handleNavigate(`/campaigns/${campaign.id}/start`)} ariaLabel={`Iniciar sesión de ${campaign.name}`}>
              Iniciar sesión
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default CampaignCard;