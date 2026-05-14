import React, { useState } from "react";
import Button from "../common/Button";

const WhisperPopup = ({ users, onSend, onClose }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (selectedUser && message) {
      onSend(parseInt(selectedUser), message);
    }
  };

  return (
    <div className="popup-overlay" role="dialog" aria-label="Enviar susurro">
      <div className="popup-content">
        <h3>Enviar Susurro</h3>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Seleccionar usuario</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <textarea
          placeholder="Mensaje susurrado"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSend}>Enviar</Button>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default WhisperPopup;