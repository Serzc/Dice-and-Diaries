import React, { useState } from "react";
import "../common/Popup.css";

const WhisperPopup = ({ users, onSend, onClose }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (selectedUser && message.trim()) {
      onSend(parseInt(selectedUser), message.trim());
    }
  };

  const isValid = selectedUser && message.trim();

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Enviar susurro">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Enviar Susurro</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <div className="form-group">
            <label htmlFor="whisper-target">Destinatario</label>
            <select
              id="whisper-target"
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
            >
              <option value="">Seleccionar jugador...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.username}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="whisper-message">Mensaje privado</label>
            <textarea
              id="whisper-message"
              placeholder="Solo el destinatario podrá leerlo..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={handleSend} disabled={!isValid}>
            Enviar
          </button>
          <button className="primary-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default WhisperPopup;
