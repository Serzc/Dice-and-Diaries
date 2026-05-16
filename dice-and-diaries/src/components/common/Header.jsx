import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header" role="banner">
      <nav aria-label="Navegación principal">
        <ul className="nav-list">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/campaigns">Campañas</NavLink></li>
          <li><NavLink to="/characters">Personajes</NavLink></li>
          <li><NavLink to="/creatures">Criaturas</NavLink></li>
          <li><NavLink to="/calendar">Calendario</NavLink></li>
          <li><NavLink to="/profile">Perfil</NavLink></li>
        </ul>
      </nav>

      {user && (
        <div className="header-user">
          <span className="header-username">@{user.username}</span>
          <button className="header-logout-btn" onClick={handleLogout} aria-label="Cerrar sesión">
            Salir
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
