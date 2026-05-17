import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter } from "../../mock/db";
import "../common/Popup.css";

const CreateCharacterPopup = ({ onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { id } = await createCharacter();
      navigate(`/characters/${id}`);
    } catch (e) {
      setError("Error al crear el personaje. Inténtalo de nuevo.");
      setLoading(false);
    }
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
            Se creará una hoja en blanco y serás redirigido para configurar todos sus atributos.
          </p>
          {error && <p style={{ color: "#dc2626", fontSize: "0.88rem", marginTop: "0.5rem" }}>{error}</p>}
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
          <button className="primary-button" onClick={onClose} disabled={loading}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacterPopup;
