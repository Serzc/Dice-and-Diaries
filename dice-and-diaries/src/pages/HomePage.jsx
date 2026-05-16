import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHomeData, joinCampaignByCode } from "../mock/db";
import HomeCampaignCard from "../components/Home/HomeCampaignCard";
import "./HomePage.css";

const TABS = [
  { id: "sessions", label: "Sesiones Anteriores" },
  { id: "join", label: "Unirse a una Campaña" },
  { id: "plan", label: "Planificar Sesión" },
];

const TAB_IDS = TABS.map(t => t.id);

const HomePage = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("sessions");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const handleTabKeyDown = (e) => {
    const i = TAB_IDS.indexOf(activeTab);
    if (e.key === "ArrowRight") { e.preventDefault(); setActiveTab(TAB_IDS[(i + 1) % TAB_IDS.length]); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); setActiveTab(TAB_IDS[(i - 1 + TAB_IDS.length) % TAB_IDS.length]); }
    else if (e.key === "Home") { e.preventDefault(); setActiveTab(TAB_IDS[0]); }
    else if (e.key === "End") { e.preventDefault(); setActiveTab(TAB_IDS[TAB_IDS.length - 1]); }
  };

  useEffect(() => {
    fetchHomeData().then(setData);
  }, []);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");
    setJoinSuccess("");
    try {
      const camp = await joinCampaignByCode(joinCode.trim());
      setJoinSuccess(`Te uniste a "${camp.name}"`);
      setJoinCode("");
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  };

  if (!data) return <div className="loading home-loading">Cargando...</div>;

  return (
    <main className="home-page" aria-labelledby="home-heading">
      <h1 id="home-heading" className="sr-only">Home</h1>

      {/* Tab bar */}
      <div role="tablist" aria-label="Secciones de inicio" className="home-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`home-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`home-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={handleTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`home-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`home-tab-${activeTab}`}
        className="home-content"
      >
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
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button className="join-btn" onClick={handleJoin} disabled={joining || !joinCode.trim()}>
                {joining ? "Uniéndose..." : "Unirse"}
              </button>
            </div>
            {joinError && <p className="join-error">{joinError}</p>}
            {joinSuccess && <p className="join-success">{joinSuccess}</p>}
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
                  onClick={() => navigate(`/calendar?campaignId=${camp.id}`)}
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
