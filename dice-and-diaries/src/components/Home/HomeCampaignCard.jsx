import React from "react";
import "./HomeCampaignCard.css";

const HomeCampaignCard = ({ campaign, onClick }) => {
  return (
    <div
      className="home-campaign-card"
      role="listitem"
      onClick={onClick}
      tabIndex="0"
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`Campaña ${campaign.name}. ${campaign.active ? "Activa" : "Inactiva"}. Último mensaje: ${campaign.lastMessage}`}
    >
      {/* Image / placeholder area */}
      <div
        className="card-image-area"
        style={campaign.imageUrl ? { backgroundImage: `url(${campaign.imageUrl})` } : undefined}
      >
        {!campaign.imageUrl && <div className="card-image-placeholder" aria-hidden="true" />}

        {campaign.unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${campaign.unreadCount} mensajes sin leer`}>
            {campaign.unreadCount}
          </span>
        )}

        {/* Campaign name overlay */}
        <div className="card-overlay">
          <h3 className="campaign-name">{campaign.name}</h3>
        </div>
      </div>

      {/* Last message */}
      <div className="card-footer">
        <p className="last-message" title={campaign.lastMessage}>{campaign.lastMessage}</p>
        <span
          className={`status-dot ${campaign.active ? "active" : "inactive"}`}
          title={campaign.active ? "Sesión Activa" : "Sesión Inactiva"}
          aria-label={campaign.active ? "Sesión Activa" : "Sesión Inactiva"}
        />
      </div>
    </div>
  );
};

export default HomeCampaignCard;
