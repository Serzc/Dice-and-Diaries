import React, { useState } from "react";
import "../common/Popup.css";

const NotesPopup = ({ notes, onAppend, onClose }) => {
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");

  const handleAppend = () => {
    if (title.trim() && snippet.trim()) {
      onAppend({ title: title.trim(), snippet: snippet.trim() });
    }
  };

  const isValid = title.trim() && snippet.trim();

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Agregar nota">
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">Agregar Nota al Chat</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <div className="form-group">
            <label htmlFor="note-title">Título</label>
            <input
              id="note-title"
              type="text"
              placeholder="Pistas encontradas..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="note-snippet">Contenido</label>
            <textarea
              id="note-snippet"
              placeholder="Describe la nota..."
              value={snippet}
              onChange={e => setSnippet(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={handleAppend} disabled={!isValid}>
            Agregar al Chat
          </button>
          <button className="primary-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default NotesPopup;
