import React from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="app-header" role="banner">
      <nav aria-label="Navegación principal">
        <ul className="nav-list">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/campaigns">Campañas</NavLink>
          </li>
          <li>
            <NavLink to="/characters">Personajes</NavLink>
          </li>
          <li>
            <NavLink to="/creatures">Criaturas</NavLink>
          </li>
          <li>
            <NavLink to="/calendar">Calendario</NavLink>
          </li>
          <li>
            <NavLink to="/profile">Perfil</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;