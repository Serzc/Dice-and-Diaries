import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <main className="notfound-page">
      <div className="notfound-content">
        <span className="notfound-code">404</span>
        <h1 className="notfound-title">Página no encontrada</h1>
        <p className="notfound-desc">La ruta que buscas no existe o fue movida.</p>
        <button className="notfound-btn" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
