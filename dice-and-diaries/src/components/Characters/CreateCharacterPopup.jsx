import React from "react";
import { useNavigate } from "react-router-dom";
import "../common/Popup.css";

const CreateCharacterPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/characters/new");
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Crear nuevo personaje">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Crear Personaje</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <p className="popup-desc">
            Serás redirigido a la hoja de creación de personaje para configurar todos sus atributos.
          </p>
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={handleCreate}>Crear</button>
          <button className="primary-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacterPopup;
