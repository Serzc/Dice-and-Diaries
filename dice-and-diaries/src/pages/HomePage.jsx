import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHomeData } from "../mock/db";
import HomeCampaignCard from "../components/Home/HomeCampaignCard";
import "./HomePage.css";

const TABS = [
  { id: "sessions", label: "Sesiones Anteriores" },
  { id: "join", label: "Unirse a una Campaña" },
  { id: "plan", label: "Planificar Sesión" },
];

const HomePage = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("sessions");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData().then(setData);
  }, []);

  if (!data) return <div className="loading home-loading">Cargando...</div>;

  return (
    <main className="home-page" aria-labelledby="home-heading">
      <h1 id="home-heading" className="sr-only">Home</h1>

      {/* Tab bar */}
      <nav className="home-tabs" aria-label="Secciones de inicio">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="home-content">
        {/* Sessions tab: campaign cards */}
        {activeTab === "sessions" && (
          <section aria-labelledby="sessions-heading">
            <h2 id="sessions-heading" className="sr-only">Sesiones Anteriores</h2>
            {data.campaigns.length === 0 ? (
              <p className="home-empty">No hay campañas recientes.</p>
            ) : (
              <div className="campaign-cards-grid" role="list">
                {data.campaigns.map((camp) => (
                  <HomeCampaignCard
                    key={camp.id}
                    campaign={camp}
                    onClick={() => navigate(`/campaigns/${camp.id}/chat`)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Join tab */}
        {activeTab === "join" && (
          <section className="tab-panel" aria-labelledby="join-heading">
            <h2 id="join-heading" className="tab-panel-title">Unirse a una Campaña</h2>
            <p className="tab-panel-desc">Ingresa el código de invitación para unirte a una campaña existente.</p>
            <div className="join-form">
              <input
                type="text"
                className="join-input"
                placeholder="Código de campaña..."
                aria-label="Código de invitación"
              />
              <button className="join-btn" onClick={() => alert("Unirse")}>Unirse</button>
            </div>
          </section>
        )}

        {/* Plan tab */}
        {activeTab === "plan" && (
          <section className="tab-panel" aria-labelledby="plan-heading">
            <h2 id="plan-heading" className="tab-panel-title">Planificar Sesión</h2>
            <p className="tab-panel-desc">Selecciona una campaña para coordinar la próxima sesión.</p>
            <div className="plan-campaigns" role="list">
              {data.campaigns.map((camp) => (
                <button
                  key={camp.id}
                  className="plan-campaign-btn"
                  onClick={() => navigate('/calendar')}
                >
                  {camp.name}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default HomePage;
