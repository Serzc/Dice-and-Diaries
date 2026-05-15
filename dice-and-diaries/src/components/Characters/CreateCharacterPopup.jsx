import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import "../common/Popup.css";

const CreateCharacterPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    // En una app real, primero se crea y luego se navega al editor.
    // Aquí simplemente redirigimos a la página de creación.
    navigate("/characters/new");
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Crear nuevo personaje">
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>¿Crear nuevo personaje?</h3>
        <p>Serás redirigido a la hoja de creación de personaje.</p>
        <div className="popup-actions">
          <Button onClick={handleCreate} ariaLabel="Confirmar creación">Crear</Button>
          <Button onClick={onClose} ariaLabel="Cancelar">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacterPopup;