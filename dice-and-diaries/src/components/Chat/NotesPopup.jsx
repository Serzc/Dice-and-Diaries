import React, { useState } from "react";
import Button from "../common/Button";

const NotesPopup = ({ notes, onAppend, onClose }) => {
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");

  const handleAppend = () => {
    if (title && snippet) {
      onAppend({ title, snippet });
    }
  };

  return (
    <div className="popup-overlay" role="dialog" aria-label="Mis notas">
      <div className="popup-content">
        <h3>Mis Notas</h3>
        <input
          type="text"
          placeholder="Título de la nota"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Snippet de la nota"
          value={snippet}
          onChange={(e) => setSnippet(e.target.value)}
        />
        <Button onClick={handleAppend}>Agregar Nota</Button>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default NotesPopup;