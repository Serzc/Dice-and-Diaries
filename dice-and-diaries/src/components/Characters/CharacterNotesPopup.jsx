import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCharacterNote, saveCharacterSection } from "../../mock/db";
import "../common/Popup.css";

const CharacterNotesPopup = ({ campaigns, characterId, onClose }) => {
  const navigate = useNavigate();
  const [story,        setStory]        = useState(null);
  const [storyContent, setStoryContent] = useState("");
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    fetchCharacterNote(characterId).then(note => {
      setStory(note);
      setStoryContent(note?.content ?? "");
    });
  }, [characterId]);

  const handleSaveStory = async () => {
    if (!story) return;
    setSaving(true);
    const updated = { ...story, content: storyContent };
    await saveCharacterSection(characterId, "characterNote", updated);
    setStory(updated);
    setSaving(false);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Notas del personaje">
      <div className="popup-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="popup-header">
          <h3 className="popup-title">Mis Notas</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Story / Historia */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
              Historia del personaje
            </p>
            <textarea
              value={storyContent}
              onChange={e => setStoryContent(e.target.value)}
              rows={6}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-gray-300)", fontSize: "0.88rem" }}
              aria-label="Historia del personaje"
            />
            <button
              className="primary-button"
              style={{ marginTop: "0.4rem", padding: "0.3rem 0.9rem", fontSize: "0.82rem" }}
              onClick={handleSaveStory}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar historia"}
            </button>
          </div>

          {/* Campaign notes links */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
              Notas por campaña
            </p>
            <div className="popup-list" role="list">
              {campaigns.map(camp => (
                <li key={camp.id} role="listitem" style={{ listStyle: "none", padding: 0 }}>
                  <button className="popup-select-btn" onClick={() => navigate(`/campaigns/${camp.id}/notes?characterId=${characterId}`)}>
                    {camp.name}
                  </button>
                </li>
              ))}
              {campaigns.length === 0 && (
                <p className="popup-empty">No hay campañas asociadas a este personaje.</p>
              )}
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterNotesPopup;
