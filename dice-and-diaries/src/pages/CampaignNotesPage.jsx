// src/pages/CampaignNotesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCampaignNotes, createNote, updateNote, deleteNote } from "../mock/db";
import "../components/common/Popup.css";
import "./CampaignNotesPage.css";

const CURRENT_USER_ID = 1;
const IS_GM = true; // In real app: derived from auth + campaign

// ── Note edit popup ───────────────────────────────────────────────────────────
const NotePopup = ({ note, campaignId, onClose, onSaved }) => {
  const isNew = !note;
  const [form, setForm] = useState({
    title: note?.title ?? "",
    content: note?.content ?? "",
    isPublic: note?.isPublic ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    let saved;
    if (isNew) {
      saved = await createNote({
        campaignId: Number(campaignId),
        title: form.title.trim(),
        content: form.content.trim(),
        isPublic: form.isPublic,
        authorId: CURRENT_USER_ID,
        createdAt: new Date().toISOString().split("T")[0],
      });
    } else {
      saved = await updateNote(note.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        isPublic: form.isPublic,
      });
    }
    setSaving(false);
    onSaved(saved, isNew);
  };

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" style={{ maxWidth: "520px" }}>
        <form onSubmit={handleSubmit}>
          <div className="popup-header">
            <h2 className="popup-title">{isNew ? "Nueva Nota" : "Editar Nota"}</h2>
            <button type="button" className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
          </div>
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
                rows={6}
                placeholder="Escribe el contenido de la nota..."
              />
            </div>
            {IS_GM && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => set("isPublic", e.target.checked)}
                />
                Visible para jugadores
              </label>
            )}
          </div>
          <div className="popup-footer">
            <button type="submit" className="primary-button" disabled={saving || !form.title.trim()}>
              {saving ? "Guardando..." : isNew ? "Crear nota" : "Guardar cambios"}
            </button>
            <button type="button" className="primary-button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Confirm delete popup ──────────────────────────────────────────────────────
const ConfirmDeletePopup = ({ note, onConfirm, onClose }) => (
  <div
    className="popup-overlay"
    role="dialog"
    aria-modal="true"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="popup-content" style={{ maxWidth: "380px" }}>
      <div className="popup-header">
        <h2 className="popup-title">Eliminar nota</h2>
        <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
      </div>
      <div className="popup-body">
        <p className="popup-desc">
          ¿Seguro que quieres eliminar <strong>"{note.title}"</strong>? Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="popup-footer">
        <button className="primary-button cn-delete-btn" onClick={onConfirm}>Eliminar</button>
        <button className="primary-button" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CampaignNotesPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(undefined); // undefined=closed, null=new, note=edit
  const [deletingNote, setDeletingNote] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchCampaignNotes(campaignId, IS_GM).then(({ campaign, notes }) => {
      setCampaign(campaign);
      setNotes(notes);
      setLoading(false);
    });
  }, [campaignId]);

  const handleSaved = useCallback((saved, isNew) => {
    setNotes((prev) =>
      isNew ? [saved, ...prev] : prev.map((n) => (n.id === saved.id ? saved : n))
    );
    setEditingNote(undefined);
  }, []);

  const handleDeleteConfirm = async () => {
    await deleteNote(deletingNote.id);
    setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
    setDeletingNote(null);
  };

  if (loading) return <main className="cn-page"><p className="cn-loading">Cargando notas...</p></main>;

  return (
    <main className="cn-page" aria-labelledby="cn-heading">
      <div className="cn-header">
        <button
          className="cn-back-btn"
          onClick={() => navigate("/campaigns")}
          aria-label="Volver a campañas"
        >
          &#8592;
        </button>
        <div>
          <h1 id="cn-heading" className="page-title cn-page-title">Notas</h1>
          <span className="cn-campaign-name">{campaign?.name}</span>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="cn-empty">
          {IS_GM
            ? "No hay notas en esta campaña. Usa el botón + para crear una."
            : "No hay notas públicas en esta campaña."}
        </p>
      ) : (
        <div className="cn-notes-list" role="list">
          {notes.map((note) => (
            <article key={note.id} className="cn-note-card" role="listitem">
              <div className="cn-note-top">
                <button
                  className="cn-note-title-btn"
                  onClick={() => setExpandedId((prev) => (prev === note.id ? null : note.id))}
                  aria-expanded={expandedId === note.id}
                >
                  <span className="cn-note-title">{note.title}</span>
                  <span className="cn-note-chevron">{expandedId === note.id ? "▲" : "▼"}</span>
                </button>
                <div className="cn-note-meta">
                  <span className={`cn-visibility-badge ${note.isPublic ? "public" : "private"}`}>
                    {note.isPublic ? "Público" : "Privado"}
                  </span>
                  <span className="cn-note-date">{note.createdAt}</span>
                </div>
              </div>

              {expandedId === note.id && (
                <div className="cn-note-body">
                  <p className="cn-note-content">{note.content}</p>
                  {IS_GM && (
                    <div className="cn-note-actions">
                      <button className="cn-action-btn" onClick={() => setEditingNote(note)}>
                        Editar
                      </button>
                      <button className="cn-action-btn cn-action-delete" onClick={() => setDeletingNote(note)}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* FAB */}
      {IS_GM && (
        <button
          className="cn-fab"
          aria-label="Crear nueva nota"
          title="Nueva nota"
          onClick={() => setEditingNote(null)}
        >
          +
        </button>
      )}

      {/* Popups */}
      {editingNote !== undefined && (
        <NotePopup
          note={editingNote}
          campaignId={campaignId}
          onClose={() => setEditingNote(undefined)}
          onSaved={handleSaved}
        />
      )}
      {deletingNote && (
        <ConfirmDeletePopup
          note={deletingNote}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingNote(null)}
        />
      )}
    </main>
  );
};

export default CampaignNotesPage;
