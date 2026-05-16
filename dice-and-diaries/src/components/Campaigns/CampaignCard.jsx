import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import "./CampaignCard.css";

const CampaignCard = ({ campaign, isGM }) => {
  const navigate = useNavigate();

  return (
    <Card className={`campaign-card ${isGM ? "campaign-card--gm" : ""}`} role="listitem" aria-labelledby={`campaign-${campaign.id}-name`}>
      {/* Name + GM badge */}
      <div className="campaign-info">
        <h2 id={`campaign-${campaign.id}-name`} className="campaign-name">
          {campaign.name}
        </h2>
        {isGM && <span className="gm-badge" aria-label="Game Master">GM</span>}
      </div>

      {/* Right side: nav buttons + primary action */}
      <div className="campaign-right">
        {/* Nav buttons */}
        <div className="campaign-nav-buttons" role="group" aria-label="Acciones de campaña">
          <button
            className="campaign-nav-btn"
            onClick={() => navigate(`/campaigns/${campaign.id}/notes`)}
            aria-label={`Notas de ${campaign.name}`}
          >
            Notas
          </button>
          <button
            className="campaign-nav-btn"
            onClick={() => navigate(`/campaigns/${campaign.id}/chat`)}
            aria-label={`Chat de ${campaign.name}`}
          >
            Chat
          </button>
          {isGM && (
            <>
              <button
                className="campaign-nav-btn"
                onClick={() => navigate(`/campaigns/${campaign.id}/npcs`)}
                aria-label={`NPCs de ${campaign.name}`}
              >
                NPCs
              </button>
              <button
                className="campaign-nav-btn"
                onClick={() => navigate(`/campaigns/${campaign.id}/players`)}
                aria-label={`Gestionar jugadores de ${campaign.name}`}
              >
                Jugadores
              </button>
            </>
          )}
        </div>

        {/* Primary action: GM gets start-session, player gets status */}
        {isGM ? (
          <button
            className="btn-start-session"
            onClick={() => navigate(`/campaigns/${campaign.id}/start`)}
            aria-label={`Iniciar sesión de ${campaign.name}`}
          >
            Empezar Sesión
          </button>
        ) : (
          <span className="session-status">
            <span className={`status-dot ${campaign.active ? "active" : "inactive"}`} aria-hidden="true" />
            {campaign.active ? "Sesión Activa" : "Sesión Inactiva"}
          </span>
        )}
      </div>
    </Card>
  );
};

export default CampaignCard;
