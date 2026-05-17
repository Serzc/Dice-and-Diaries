import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <main className="notfound-page" aria-labelledby="notfound-heading">
      <div className="notfound-content">
        <span className="notfound-code" aria-hidden="true">404</span>
        <h1 id="notfound-heading" className="notfound-title">Página no encontrada</h1>
        <p className="notfound-desc">La ruta que buscas no existe o fue movida.</p>
        <button className="notfound-btn" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
