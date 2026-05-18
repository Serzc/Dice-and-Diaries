// src/components/Campaigns/CampaignNotesPopup.jsx
import React, { useEffect, useRef, useState } from "react";
import { fetchCampaignNotes, createNote, updateNote, deleteNote } from "../../mock/db";
import { useAuth } from "../../context/AuthContext";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "../common/Popup.css";
import "../../pages/CampaignNotesPage.css";
import "./CampaignNotesPopup.css";

const EMPTY_FORM = { title: "", content: "", isPublic: true };

const CampaignNotesPopup = ({ campaignId, campaignName, isGM, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | noteObject
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCampaignNotes(campaignId, isGM).then(({ notes }) => {
      setNotes(notes);
      setLoading(false);
    });
  }, [campaignId, isGM]);

  const startNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
    setExpandedId(null);
  };

  const startEdit = (note) => {
    setForm({ title: note.title, content: note.content, isPublic: note.isPublic });
    setEditing(note);
    setExpandedId(null);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    if (editing === "new") {
      const saved = await createNote({
        campaignId: Number(campaignId),
        title: form.title.trim(),
        content: form.content.trim(),
        isPublic: form.isPublic,
        authorId: currentUserId,
        createdAt: new Date().toISOString().split("T")[0],
      });
      setNotes((prev) => [saved, ...prev]);
    } else {
      const saved = await updateNote(editing.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        isPublic: form.isPublic,
      });
      setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
    }
    setSaving(false);
    cancelEdit();
  };

  const handleDelete = async (note) => {
    if (!window.confirm(`¿Eliminar "${note.title}"? Esta acción no se puede deshacer.`)) return;
    await deleteNote(note.id);
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    if (expandedId === note.id) setExpandedId(null);
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cnp-popup-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content cnp-popup" ref={contentRef}>
        <div className="popup-header">
          <h2 id="cnp-popup-title" className="popup-title">
            Notas — {campaignName}
          </h2>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
        </div>

        <div className="popup-body cnp-body">
          {loading ? (
            <p className="cnp-status">Cargando notas...</p>
          ) : editing ? (
            <div className="cnp-form">
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
                  rows={6}
                  placeholder="Escribe el contenido de la nota..."
                />
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => set("isPublic", e.target.checked)}
                />
                Visible para todos
              </label>
            </div>
          ) : notes.length === 0 ? (
            <p className="cnp-status">No hay notas aún. Usa el botón + para crear una.</p>
          ) : (
            <div className="cn-notes-list" role="list">
              {notes.map((note) => {
                const isExpanded = expandedId === note.id;
                return (
                  <article key={note.id} className="cn-note-card" role="listitem">
                    <div className="cn-note-top">
                      <button
                        className="cn-note-title-btn"
                        onClick={() => setExpandedId(isExpanded ? null : note.id)}
                        aria-expanded={isExpanded}
                      >
                        <span className="cn-note-title">{note.title}</span>
                        <span className="cn-note-chevron">{isExpanded ? "▲" : "▼"}</span>
                      </button>
                      <div className="cn-note-meta">
                        <span className={`cn-visibility-badge ${note.isPublic ? "public" : "private"}`}>
                          {note.isPublic ? "Público" : "Privado"}
                        </span>
                        <span className="cn-note-date">{note.createdAt}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="cn-note-body">
                        <p className="cn-note-content">{note.content}</p>
                        {(isGM || note.authorId === currentUserId) && (
                          <div className="cn-note-actions">
                            <button className="cn-action-btn" onClick={() => startEdit(note)}>Editar</button>
                            <button className="cn-action-btn cn-action-delete" onClick={() => handleDelete(note)}>Eliminar</button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="popup-footer">
          {editing ? (
            <>
              <button
                className="primary-button"
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
              >
                {saving ? "Guardando..." : editing === "new" ? "Crear nota" : "Guardar cambios"}
              </button>
              <button className="primary-button" onClick={cancelEdit}>Cancelar</button>
            </>
          ) : (
            <button className="primary-button" onClick={startNew}>+ Nueva nota</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignNotesPopup;
