import React, { useEffect, useState } from "react";
import { fetchCampaigns, getCurrentUserId } from "../mock/db";
import CampaignCard from "../components/Campaigns/CampaignCard";
import "./CampaignsPage.css";

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCampaigns(currentUserId);
        // Ordenar por id descendente (simulando más reciente primero)
        data.sort((a, b) => b.id - a.id);
        setCampaigns(data);
      } catch (error) {
        console.error("Error al cargar campañas", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="loading">Cargando campañas...</div>;
  }

  return (
    <main className="campaigns-page" aria-labelledby="campaigns-page-heading">
      <h1 id="campaigns-page-heading" className="page-title">
        Mis Campañas
      </h1>
      {campaigns.length === 0 ? (
        <p className="empty-message">No tienes campañas activas. ¡Crea una o únete a una!</p>
      ) : (
        <div className="campaign-list" role="list">
          {campaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              isGM={camp.ownerId === currentUserId}
            />
          ))}
        </div>
      )}

      <button
        className="fab-create-campaign"
        aria-label="Crear nueva campaña"
        title="Crear campaña"
        onClick={() => alert("Crear campaña")}
      >
        +
      </button>
    </main>
  );
};

export default CampaignsPage;