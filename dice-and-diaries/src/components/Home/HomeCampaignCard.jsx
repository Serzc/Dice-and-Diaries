import React from "react";
import Card from "../common/Card";  // suponemos que ya tienes Card (o podemos crearlo)
import "./HomeCampaignCard.css";

const HomeCampaignCard = ({ campaign }) => {
  return (
    <Card className="home-campaign-card" role="listitem">
      <h3 className="campaign-name">{campaign.name}</h3>
      <p className="last-message" aria-label={`Último mensaje: ${campaign.lastMessage}`}>
        {campaign.lastMessage}
      </p>
      <span className={`status-badge ${campaign.active ? "active" : "inactive"}`}>
        {campaign.active ? "Activa" : "Inactiva"}
      </span>
    </Card>
  );
};

export default HomeCampaignCard;