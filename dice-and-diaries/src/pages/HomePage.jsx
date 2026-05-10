import React, { useEffect, useState } from "react";
import { fetchHomeData } from "../mock/homeMock";
import HomeCampaignCard from "../components/Home/HomeCampaignCard";
import Button from "../components/common/Button";
import "./HomePage.css";

const HomePage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchHomeData().then(setData);
  }, []);

  if (!data) return <div className="loading">Cargando...</div>;

  return (
    <main className="home-page" aria-labelledby="home-heading">
      <h1 id="home-heading" className="page-title">Home</h1>

      <div className="home-layout">
        {/* Columna principal: Campañas */}
        <section className="campaigns-section" aria-labelledby="campaigns-heading">
          <h2 id="campaigns-heading">Campañas</h2>
          <h3>Sesiones Anteriores</h3>
          {data.recentSessions && data.recentSessions.length > 0 ? (
            <ul className="sessions-list">
              {/* Iterar sesiones cuando existan */}
            </ul>
          ) : (
            <p className="empty-message">No hay sesiones recientes.</p>
          )}

          <div className="campaign-cards-list" role="list">
            {data.campaigns.map((camp) => (
              <HomeCampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        </section>

        {/* Barra lateral */}
        <aside className="sidebar" aria-label="Acciones rápidas">
          <section className="sidebar-section" aria-labelledby="characters-heading">
            <h2 id="characters-heading">Mis Personajes</h2>
            <p className="stat-text">{data.myCharactersCount} personajes creados</p>
            <Button onClick={() => alert("Unirse a campaña")}>
              Unirse a una Campaña
            </Button>
          </section>

          <section className="sidebar-section" aria-labelledby="creatures-heading">
            <h2 id="creatures-heading">Mis Criaturas</h2>
            <p className="stat-text">{data.myCreaturesCount} criaturas disponibles</p>
            <Button onClick={() => alert("Planificar sesión")}>
              Planificar Sesión
            </Button>
          </section>

          <a href="/profile" className="profile-link">
            Mi Perfil
          </a>
        </aside>
      </div>
    </main>
  );
};

export default HomePage;