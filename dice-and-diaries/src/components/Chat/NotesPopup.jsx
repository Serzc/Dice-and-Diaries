import React, { useRef, useState } from "react";
import { createNote } from "../../mock/db";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "../common/Popup.css";
import "./NotesPopup.css";

const EMPTY_FORM = { title: "", content: "", isPublic: true };

const NotesPopup = ({ notes, campaignId, currentUserId, isGM, onAppend, onNoteCreated, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [mode, setMode] = useState("list"); // "list" | "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleAttach = (note) => {
    onAppend({ title: note.title, snippet: note.content });
    onClose();
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const saved = await createNote({
      campaignId: Number(campaignId),
      title: form.title.trim(),
      content: form.content.trim(),
      isPublic: form.isPublic,
      authorId: currentUserId,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setSaving(false);
    onNoteCreated?.(saved);
    onAppend({ title: saved.title, snippet: saved.content });
    onClose();
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-popup-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" ref={contentRef}>
        <div className="popup-header">
          <h3 id="notes-popup-title" className="popup-title">
            {mode === "new" ? "Nueva nota" : "Notas de campaña"}
          </h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
        </div>

        {mode === "list" ? (
          <>
            <div className="popup-body">
              {notes.length === 0 ? (
                <p className="np-status">No hay notas en esta campaña aún.</p>
              ) : (
                <ul className="np-notes-list">
                  {notes.map((n) => (
                    <li key={n.id} className="np-note-item">
                      <div className="np-note-info">
                        <span className="np-note-title">{n.title}</span>
                        <span className="np-note-date">{n.createdAt}</span>
                      </div>
                      <button className="np-attach-btn" onClick={() => handleAttach(n)}>
                        Adjuntar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="popup-footer">
              {isGM && (
                <button className="primary-button" onClick={() => setMode("new")}>
                  + Nueva nota
                </button>
              )}
              <button className="primary-button" onClick={onClose}>Cerrar</button>
            </div>
          </>
        ) : (
          <>
            <div className="popup-body">
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Título de la nota..."
                  autoFocus
                  required
                />
              </div>
              <div className="form-group">
                <label>Contenido</label>
                <textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  rows={4}
                  placeholder="Contenido de la nota..."
                />
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => set("isPublic", e.target.checked)}
                />
                Visible para jugadores
              </label>
            </div>
            <div className="popup-footer">
              <button
                className="primary-button"
                onClick={handleCreate}
                disabled={saving || !form.title.trim()}
              >
                {saving ? "Creando..." : "Crear y adjuntar"}
              </button>
              <button className="primary-button" onClick={() => setMode("list")}>Volver</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotesPopup;
