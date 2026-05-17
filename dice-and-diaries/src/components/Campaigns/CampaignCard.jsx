import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import { uploadCampaignImage } from "../../mock/db";
import "./CampaignCard.css";

const CampaignCard = ({ campaign, isGM, onStartSession, onDelete, onNotesClick, onImageUpdated }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCampaignImage(campaign.id, file);
      onImageUpdated && onImageUpdated({ ...campaign, imageUrl: url });
    } catch (err) {
      console.error("Error al subir imagen:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

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
            onClick={() => onNotesClick ? onNotesClick() : navigate(`/campaigns/${campaign.id}/notes`)}
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
                onClick={() => navigate(`/creatures`)}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <button
                className="campaign-nav-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label={`Cambiar imagen de ${campaign.name}`}
              >
                {uploading ? "..." : "Imagen"}
              </button>
              <button
                className="campaign-nav-btn campaign-nav-btn--danger"
                onClick={() => onDelete && onDelete(campaign.id)}
                aria-label={`Eliminar ${campaign.name}`}
              >
                Eliminar
              </button>
            </>
          )}
        </div>

        {/* Primary action: GM gets start-session, player gets status */}
        {isGM ? (
          <button
            className={`btn-start-session${campaign.active ? " btn-end-session" : ""}`}
            onClick={() => onStartSession ? onStartSession(campaign.id, campaign.active) : navigate(`/campaigns/${campaign.id}/chat`)}
            aria-label={campaign.active ? `Terminar sesión de ${campaign.name}` : `Iniciar sesión de ${campaign.name}`}
          >
            {campaign.active ? "Terminar Sesión" : "Empezar Sesión"}
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
