// src/pages/CreatureSheetPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCreature, saveCreature, fetchCampaigns, currentUser, fmtMod,
  fetchCreatureNotes, createCreatureNote, updateCreatureNote, deleteCreatureNote,
  addCreatureToCampaign, removeCreatureFromCampaign,
} from "../mock/db";
import { useAuth } from "../context/AuthContext";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "../components/common/Popup.css";
import "./CreatureSheetPage.css";

const ABILITIES = [
  { key: "str", label: "FUE", full: "Fuerza" },
  { key: "dex", label: "DES", full: "Destreza" },
  { key: "con", label: "CON", full: "Constitución" },
  { key: "int", label: "INT", full: "Inteligencia" },
  { key: "wis", label: "SAB", full: "Sabiduría" },
  { key: "cha", label: "CAR", full: "Carisma" },
];

const SIZES = ["Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco"];

const VISIBILITY_OPTIONS = [
  { value: "gm",           label: "Solo DM" },
  { value: "players_view", label: "Jugadores pueden ver" },
  { value: "players_edit", label: "Jugadores pueden editar" },
];

const VISIBILITY_BADGE = {
  gm:           { text: "DM",   cls: "cn-vis-gm" },
  players_view: { text: "Ver",  cls: "cn-vis-view" },
  players_edit: { text: "Editar", cls: "cn-vis-edit" },
};

// ── Stat-block sub-sections (unchanged) ──────────────────────────────────────

const StatBlockHeader = ({ creature, isEditing, onChange }) => {
  if (!isEditing) {
    return (
      <div className="stat-block-header">
        <h2 className="sb-name">{creature.name}</h2>
        <p className="sb-subtitle">{creature.size} {creature.creatureType}, {creature.alignment}</p>
        <p className="sb-cr-badge">CR {creature.cr}</p>
      </div>
    );
  }
  return (
    <div className="stat-block-header">
      <div className="sb-edit-row">
        <input className="sb-input sb-input-name" value={creature.name}
          onChange={(e) => onChange({ name: e.target.value })} placeholder="Nombre de la criatura" />
        <div className="sb-edit-field">
          <span className="sb-label">CR</span>
          <input className="sb-input sb-input-sm" value={creature.cr}
            onChange={(e) => onChange({ cr: e.target.value })} placeholder="1/4" />
        </div>
      </div>
      <div className="sb-edit-row">
        <select className="sb-select" value={creature.size}
          onChange={(e) => onChange({ size: e.target.value })}>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="sb-input" value={creature.creatureType}
          onChange={(e) => onChange({ creatureType: e.target.value })} placeholder="Tipo (Bestia, Humanoide...)" />
        <input className="sb-input" value={creature.alignment}
          onChange={(e) => onChange({ alignment: e.target.value })} placeholder="Alineamiento" />
      </div>
    </div>
  );
};

const DefensesSection = ({ creature, isEditing, onChange }) => (
  <div className="stat-block-section">
    <h3 className="sb-section-title">Defensas</h3>
    <div className="sb-defenses-row">
      <div className="sb-defense-item">
        <span className="sb-label">CA</span>
        {isEditing ? (
          <div className="sb-stacked">
            <input type="number" className="sb-input sb-input-sm" value={creature.ac}
              onChange={(e) => onChange({ ac: Number(e.target.value) })} />
            <input className="sb-input" value={creature.acNote || ""}
              onChange={(e) => onChange({ acNote: e.target.value })} placeholder="Nota de CA..." />
          </div>
        ) : (
          <><span className="sb-value">{creature.ac}</span>
          {creature.acNote && <span className="sb-note"> ({creature.acNote})</span>}</>
        )}
      </div>
      <div className="sb-defense-item">
        <span className="sb-label">PV</span>
        {isEditing ? (
          <div className="sb-stacked">
            <span className="sb-hp-inputs">
              <input type="number" className="sb-input sb-input-sm" value={creature.hp.current}
                onChange={(e) => onChange({ hp: { ...creature.hp, current: Number(e.target.value) } })} />
              <span className="sb-slash">/</span>
              <input type="number" className="sb-input sb-input-sm" value={creature.hp.max}
                onChange={(e) => onChange({ hp: { ...creature.hp, max: Number(e.target.value) } })} />
            </span>
            <input className="sb-input" value={creature.hp.formula || ""}
              onChange={(e) => onChange({ hp: { ...creature.hp, formula: e.target.value } })} placeholder="Fórmula (2d8+4)" />
          </div>
        ) : (
          <span className="sb-value">{creature.hp.current}/{creature.hp.max}
            <span className="sb-note"> ({creature.hp.formula})</span>
          </span>
        )}
      </div>
      <div className="sb-defense-item">
        <span className="sb-label">Velocidad</span>
        {isEditing ? (
          <input className="sb-input" value={creature.speed}
            onChange={(e) => onChange({ speed: e.target.value })} placeholder="9 m" />
        ) : (
          <span className="sb-value">{creature.speed}</span>
        )}
      </div>
    </div>
  </div>
);

const AbilitiesSection = ({ abilityScores, isEditing, onChange }) => (
  <div className="stat-block-section">
    <h3 className="sb-section-title">Características</h3>
    <div className="sb-abilities-grid">
      {ABILITIES.map(({ key, label }) => {
        const score = abilityScores[key];
        return (
          <div className="sb-ability-cell" key={key}>
            <div className="sb-ability-label">{label}</div>
            {isEditing ? (
              <input type="number" className="sb-input sb-ability-input" value={score} min={1} max={30}
                onChange={(e) => onChange({ abilityScores: { ...abilityScores, [key]: Number(e.target.value) } })} />
            ) : (
              <div className="sb-ability-score">{score}</div>
            )}
            <div className="sb-ability-mod">{fmtMod(score)}</div>
          </div>
        );
      })}
    </div>
  </div>
);

const ProficienciesSection = ({ creature, isEditing, onChange }) => {
  const hasSaves = creature.savingThrows?.length > 0;
  const hasSkills = creature.skills?.length > 0;
  const hasAny = hasSaves || hasSkills ||
    creature.damageImmunities?.length > 0 || creature.damageResistances?.length > 0 ||
    creature.conditionImmunities?.length > 0 || creature.senses || creature.languages;
  if (!isEditing && !hasAny) return null;

  const addSave = () => onChange({ savingThrows: [...(creature.savingThrows || []), { ability: "FUE", mod: 0 }] });
  const removeSave = (i) => onChange({ savingThrows: creature.savingThrows.filter((_, idx) => idx !== i) });
  const updateSave = (i, f, v) => onChange({ savingThrows: creature.savingThrows.map((s, idx) => idx === i ? { ...s, [f]: v } : s) });
  const addSkill = () => onChange({ skills: [...(creature.skills || []), { name: "", mod: 0 }] });
  const removeSkill = (i) => onChange({ skills: creature.skills.filter((_, idx) => idx !== i) });
  const updateSkill = (i, f, v) => onChange({ skills: creature.skills.map((s, idx) => idx === i ? { ...s, [f]: v } : s) });

  return (
    <div className="stat-block-section">
      <h3 className="sb-section-title">Competencias</h3>
      {isEditing ? (
        <div className="sb-edit-list-section">
          <span className="sb-list-label">Tiradas de salvación</span>
          {(creature.savingThrows || []).map((s, i) => (
            <div key={i} className="sb-list-item-row">
              <input className="sb-input sb-input-sm" value={s.ability} onChange={(e) => updateSave(i, "ability", e.target.value)} placeholder="FUE" />
              <input type="number" className="sb-input sb-input-sm" value={s.mod} onChange={(e) => updateSave(i, "mod", Number(e.target.value))} />
              <button type="button" className="sb-remove-btn" onClick={() => removeSave(i)}>&#x2715;</button>
            </div>
          ))}
          <button type="button" className="sb-add-btn" onClick={addSave}>+ Añadir tirada</button>
        </div>
      ) : hasSaves ? (
        <p className="sb-proficiency-row"><strong>Tiradas de salvación:</strong>{" "}
          {creature.savingThrows.map((s) => `${s.ability} ${s.mod >= 0 ? "+" : ""}${s.mod}`).join(", ")}</p>
      ) : null}

      {isEditing ? (
        <div className="sb-edit-list-section">
          <span className="sb-list-label">Habilidades</span>
          {(creature.skills || []).map((s, i) => (
            <div key={i} className="sb-list-item-row">
              <input className="sb-input" value={s.name} onChange={(e) => updateSkill(i, "name", e.target.value)} placeholder="Percepción" />
              <input type="number" className="sb-input sb-input-sm" value={s.mod} onChange={(e) => updateSkill(i, "mod", Number(e.target.value))} />
              <button type="button" className="sb-remove-btn" onClick={() => removeSkill(i)}>&#x2715;</button>
            </div>
          ))}
          <button type="button" className="sb-add-btn" onClick={addSkill}>+ Añadir habilidad</button>
        </div>
      ) : hasSkills ? (
        <p className="sb-proficiency-row"><strong>Habilidades:</strong>{" "}
          {creature.skills.map((s) => `${s.name} ${s.mod >= 0 ? "+" : ""}${s.mod}`).join(", ")}</p>
      ) : null}

      {isEditing ? (
        <div className="sb-edit-fields-block">
          {[
            ["damageImmunities", "Inm. al daño", "veneno, fuego..."],
            ["damageResistances", "Resistencias", "contundente, cortante..."],
            ["conditionImmunities", "Inm. condiciones", "envenenado, asustado..."],
          ].map(([field, lbl, ph]) => (
            <div key={field} className="sb-edit-field-row">
              <span className="sb-list-label">{lbl}</span>
              <input className="sb-input" value={(creature[field] || []).join(", ")}
                onChange={(e) => onChange({ [field]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder={ph} />
            </div>
          ))}
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Sentidos</span>
            <input className="sb-input" value={creature.senses || ""}
              onChange={(e) => onChange({ senses: e.target.value })} placeholder="Visión en la oscuridad 18 m..." />
          </div>
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Idiomas</span>
            <input className="sb-input" value={creature.languages || ""}
              onChange={(e) => onChange({ languages: e.target.value })} placeholder="Común, Goblin..." />
          </div>
        </div>
      ) : (
        <>
          {creature.damageImmunities?.length > 0 && <p className="sb-proficiency-row"><strong>Inmunidades al daño:</strong> {creature.damageImmunities.join(", ")}</p>}
          {creature.damageResistances?.length > 0 && <p className="sb-proficiency-row"><strong>Resistencias al daño:</strong> {creature.damageResistances.join(", ")}</p>}
          {creature.conditionImmunities?.length > 0 && <p className="sb-proficiency-row"><strong>Inmunidades a condiciones:</strong> {creature.conditionImmunities.join(", ")}</p>}
          {creature.senses && <p className="sb-proficiency-row"><strong>Sentidos:</strong> {creature.senses}</p>}
          {creature.languages && <p className="sb-proficiency-row"><strong>Idiomas:</strong> {creature.languages}</p>}
        </>
      )}
    </div>
  );
};

const TraitsSection = ({ traits, title, isEditing, onChangeTraits }) => {
  if (!isEditing && (!traits || traits.length === 0)) return null;
  const addTrait = () => onChangeTraits([...(traits || []), { name: "", description: "" }]);
  const removeTrait = (i) => onChangeTraits(traits.filter((_, idx) => idx !== i));
  const updateTrait = (i, f, v) => onChangeTraits(traits.map((t, idx) => idx === i ? { ...t, [f]: v } : t));

  return (
    <div className="stat-block-section">
      <h3 className="sb-section-title">{title}</h3>
      {(traits || []).map((trait, i) =>
        isEditing ? (
          <div key={i} className="sb-trait-edit-item">
            <div className="sb-trait-edit-header">
              <input className="sb-input sb-trait-name-input" value={trait.name}
                onChange={(e) => updateTrait(i, "name", e.target.value)} placeholder="Nombre del rasgo" />
              <button type="button" className="sb-remove-btn" onClick={() => removeTrait(i)}>&#x2715;</button>
            </div>
            <textarea className="sb-notes-textarea sb-trait-desc-textarea" value={trait.description}
              onChange={(e) => updateTrait(i, "description", e.target.value)}
              placeholder="Descripción del rasgo..." rows={3} />
          </div>
        ) : (
          <div className="sb-trait-item" key={i}>
            <p className="sb-trait-text"><strong>{trait.name}.</strong> {trait.description}</p>
          </div>
        )
      )}
      {isEditing && <button type="button" className="sb-add-btn" onClick={addTrait}>+ Añadir</button>}
    </div>
  );
};

// ── Campaign assignment section ────────────────────────────────────────────────
const CampaignsSection = ({ creature, allCampaigns, gmCampaigns, canManage, onAdd, onRemove }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const assigned = (creature.campaignIds || []);
  // Picker only shows GM campaigns the creature isn't already in
  const available = (gmCampaigns || []).filter((c) => !assigned.includes(c.id));
  const gmCampaignIds = new Set((gmCampaigns || []).map((c) => c.id));

  return (
    <div className="stat-block-section">
      <h3 className="sb-section-title">Campañas asignadas</h3>
      <div className="sb-campaign-chips">
        {assigned.length === 0 ? (
          <span className="sb-empty-hint">Sin campañas asignadas</span>
        ) : (
          assigned.map((cid) => {
            const camp = allCampaigns.find((c) => c.id === cid);
            return camp ? (
              <span key={cid} className="sb-campaign-chip">
                {camp.name}
                {canManage && gmCampaignIds.has(cid) && (
                  <button
                    className="sb-chip-remove"
                    onClick={() => onRemove(cid)}
                    aria-label={`Quitar de ${camp.name}`}
                  >
                    &#x2715;
                  </button>
                )}
              </span>
            ) : null;
          })
        )}
      </div>
      {canManage && available.length > 0 && (
        pickerOpen ? (
          <select
            className="sb-select sb-campaign-select"
            autoFocus
            defaultValue=""
            onChange={(e) => { if (e.target.value) { onAdd(Number(e.target.value)); setPickerOpen(false); } }}
            onBlur={() => setPickerOpen(false)}
          >
            <option value="" disabled>Seleccionar campaña...</option>
            {available.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <button className="sb-add-btn" style={{ marginTop: "0.5rem" }} onClick={() => setPickerOpen(true)}>
            + Asignar a campaña
          </button>
        )
      )}
    </div>
  );
};

// ── Note editor popup ──────────────────────────────────────────────────────────
const NoteEditorPopup = ({ note, creatureId, isGM, currentUserId, onClose, onSaved }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const isNew = !note;
  const [form, setForm] = useState({
    title: note?.title ?? "",
    content: note?.content ?? "",
    visibility: note?.visibility ?? "gm",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    let saved;
    if (isNew) {
      saved = await createCreatureNote({
        creatureId,
        title: form.title.trim(),
        content: form.content.trim(),
        visibility: form.visibility,
        authorId: currentUserId,
      });
    } else {
      saved = await updateCreatureNote(note.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        ...(isGM ? { visibility: form.visibility } : {}),
      });
    }
    setSaving(false);
    onSaved(saved, isNew);
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
      aria-labelledby="creature-note-popup-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" style={{ maxWidth: "500px" }} ref={contentRef}>
        <form onSubmit={handleSubmit}>
          <div className="popup-header">
            <h2 id="creature-note-popup-title" className="popup-title">
              {isNew ? "Nueva nota" : "Editar nota"}
            </h2>
            <button type="button" className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
          </div>
          <div className="popup-body">
            <div className="form-group">
              <label>Título</label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="Título de la nota..." autoFocus required />
            </div>
            <div className="form-group">
              <label>Contenido</label>
              <textarea value={form.content} onChange={(e) => set("content", e.target.value)}
                rows={5} placeholder="Contenido de la nota..." />
            </div>
            {isGM && (
              <div className="form-group">
                <label>Visibilidad</label>
                <select value={form.visibility} onChange={(e) => set("visibility", e.target.value)} className="sb-select" style={{ width: "100%" }}>
                  {VISIBILITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="popup-footer">
            <button type="submit" className="primary-button" disabled={saving || !form.title.trim()}>
              {saving ? "Guardando..." : isNew ? "Crear" : "Guardar"}
            </button>
            <button type="button" className="primary-button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Confirm delete note popup ──────────────────────────────────────────────────
const ConfirmDeleteNotePopup = ({ note, onConfirm, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
      aria-labelledby="confirm-delete-note-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" style={{ maxWidth: "380px" }} ref={contentRef}>
        <div className="popup-header">
          <h2 id="confirm-delete-note-title" className="popup-title">Eliminar nota</h2>
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
};

// ── Campaign picker popup (for "Poseer" when creature belongs to multiple campaigns) ──
const CampaignPickerPopup = ({ campaigns, onPick, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
      aria-labelledby="campaign-picker-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" style={{ maxWidth: "320px" }} ref={contentRef}>
        <div className="popup-header">
          <h2 id="campaign-picker-title" className="popup-title">Seleccionar campaña</h2>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
        </div>
        <div className="popup-body">
          <p style={{ marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
            Esta criatura pertenece a varias campañas. ¿Desde cuál quieres poseer?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {campaigns.map((c) => (
              <button key={c.id} className="primary-button" onClick={() => onPick(c.id)}>{c.name}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ══ Página principal ══════════════════════════════════════════════════════════
const CreatureSheetPage = () => {
  const { creatureId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [creature, setCreature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [possessCampaigns, setPossessCampaigns] = useState(null);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(undefined); // undefined=closed, null=new, note=edit
  const [deletingNote, setDeletingNote] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  // Campaign assignment state
  const [allCampaigns, setAllCampaigns] = useState([]);

  const originalRef = useRef(null);
  const isOwner = creature != null &&
    creature.ownerId != null &&
    authUser?.id != null &&
    Number(creature.ownerId) === Number(authUser.id);
  const isGM = (authUser?.isGM ?? false);
  const canEdit = isOwner;
  const gmCampaigns = allCampaigns.filter((c) => c.myRole === "gm");

  // ── Data fetch ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCreature(creatureId)
      .then((data) => { setCreature(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [creatureId]);

  useEffect(() => {
    if (!creatureId) return;
    setNotesLoading(true);
    fetchCreatureNotes(creatureId).then((data) => {
      setNotes(isGM ? data : data.filter((n) => n.visibility !== "gm"));
      setNotesLoading(false);
    });
  }, [creatureId, isGM]);

  useEffect(() => {
    fetchCampaigns().then(setAllCampaigns);
  }, []);

  // ── Stat block handlers ───────────────────────────────────────────────────
  const handleChange = useCallback((partial) => {
    setCreature((prev) => ({ ...prev, ...partial }));
  }, []);

  const startEditing = () => {
    originalRef.current = JSON.parse(JSON.stringify(creature));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCreature(originalRef.current);
    originalRef.current = null;
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveCreature(creature.id, creature);
    originalRef.current = null;
    setSaving(false);
    setIsEditing(false);
  };

  // ── Possess ───────────────────────────────────────────────────────────────
  const handlePossess = useCallback(async () => {
    const ids = creature?.campaignIds ?? [];
    if (ids.length === 0) return;
    if (ids.length === 1) {
      navigate(`/campaigns/${ids[0]}/chat?characterId=${creature.id}&characterName=${encodeURIComponent(creature.name)}`);
      return;
    }
    const relevant = allCampaigns.filter((c) => ids.includes(c.id));
    setPossessCampaigns(relevant);
  }, [creature, navigate, allCampaigns]);

  // ── Notes handlers ────────────────────────────────────────────────────────
  const handleNoteSaved = useCallback((saved, isNew) => {
    setNotes((prev) =>
      isNew ? [saved, ...prev] : prev.map((n) => (n.id === saved.id ? saved : n))
    );
    setEditingNote(undefined);
  }, []);

  const handleNoteDeleteConfirm = async () => {
    await deleteCreatureNote(deletingNote.id);
    setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
    setDeletingNote(null);
  };

  // ── Campaign assignment handlers ──────────────────────────────────────────
  const handleAddCampaign = async (campaignId) => {
    const updated = await addCreatureToCampaign(creature.id, campaignId);
    setCreature(updated);
  };

  const handleRemoveCampaign = async (campaignId) => {
    const updated = await removeCreatureFromCampaign(creature.id, campaignId);
    setCreature(updated);
  };

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading) {
    return <main className="creature-sheet-page"><p className="cs-loading">Cargando criatura...</p></main>;
  }

  if (error || !creature) {
    return (
      <main className="creature-sheet-page">
        <p className="cs-error">Error: {error || "Criatura no encontrada."}</p>
        <button className="cs-back-btn" onClick={() => navigate("/creatures")}>
          &#8592; Volver a Mis Criaturas
        </button>
      </main>
    );
  }

  const tabs = [
    { id: "stats", label: "Estadísticas" },
    { id: "notes", label: `Notas${notes.length ? ` (${notes.length})` : ""}` },
  ];

  const hasSpecialTraits = creature.specialTraits?.length > 0 || isEditing;
  const hasActions = creature.actions?.length > 0 || isEditing;
  const hasBonusActions = creature.bonusActions?.length > 0 || isEditing;
  const hasReactions = creature.reactions?.length > 0 || isEditing;

  return (
    <main className="creature-sheet-page" aria-labelledby="creature-sheet-heading">
      {/* Cabecera */}
      <div className="creature-sheet-header">
        <div className="csh-left">
          <button className="cs-back-btn" onClick={() => navigate("/creatures")} aria-label="Volver a Mis Criaturas">
            &#8592;
          </button>
          <div>
            <h1 id="creature-sheet-heading" className="page-title cs-page-title">{creature.name}</h1>
            <span className="cs-type-badge">{creature.size} {creature.creatureType}</span>
          </div>
        </div>
        <div className="csh-right">
          {canEdit && (
            isEditing ? (
              <>
                <button className="cs-btn cs-btn-secondary" onClick={handleCancel}>Cancelar</button>
                <button className="cs-btn cs-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </>
            ) : (
              <button className="cs-btn cs-btn-secondary" onClick={startEditing}>Editar</button>
            )
          )}
          {isGM && (
            <button
              className="cs-btn cs-btn-possess"
              onClick={handlePossess}
              disabled={!creature?.campaignIds?.length}
              title={!creature?.campaignIds?.length ? "Sin campañas asignadas" : "Poseer criatura en el chat"}
            >
              Poseer
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="creature-tabs" role="tablist" aria-label="Secciones de la criatura">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`creature-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`creature-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`creature-tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              const ids = tabs.map((t) => t.id);
              const i = ids.indexOf(activeTab);
              if (e.key === "ArrowRight") setActiveTab(ids[(i + 1) % ids.length]);
              else if (e.key === "ArrowLeft") setActiveTab(ids[(i - 1 + ids.length) % ids.length]);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div id={`creature-panel-${activeTab}`} className="creature-tab-content"
        role="tabpanel" aria-labelledby={`creature-tab-${activeTab}`}>

        {/* ── Stats tab ── */}
        {activeTab === "stats" && (
          <div className="stat-block">
            <StatBlockHeader creature={creature} isEditing={isEditing} onChange={handleChange} />
            <div className="sb-divider" />
            <DefensesSection creature={creature} isEditing={isEditing} onChange={handleChange} />
            <div className="sb-divider" />
            <AbilitiesSection abilityScores={creature.abilityScores} isEditing={isEditing} onChange={handleChange} />
            <div className="sb-divider" />
            <ProficienciesSection creature={creature} isEditing={isEditing} onChange={handleChange} />

            {hasSpecialTraits && (<><div className="sb-divider" />
              <TraitsSection traits={creature.specialTraits} title="Rasgos especiales" isEditing={isEditing}
                onChangeTraits={(v) => handleChange({ specialTraits: v })} /></>)}
            {hasActions && (<><div className="sb-divider" />
              <TraitsSection traits={creature.actions} title="Acciones" isEditing={isEditing}
                onChangeTraits={(v) => handleChange({ actions: v })} /></>)}
            {hasBonusActions && (<><div className="sb-divider" />
              <TraitsSection traits={creature.bonusActions} title="Acciones adicionales" isEditing={isEditing}
                onChangeTraits={(v) => handleChange({ bonusActions: v })} /></>)}
            {hasReactions && (<><div className="sb-divider" />
              <TraitsSection traits={creature.reactions} title="Reacciones" isEditing={isEditing}
                onChangeTraits={(v) => handleChange({ reactions: v })} /></>)}

            {/* GM notes (owner: editable; other GMs: read-only) */}
            {(isGM || isOwner) && (
              <>
                <div className="sb-divider" />
                <div className="stat-block-section">
                  <h3 className="sb-section-title">Notas del DM (privadas)</h3>
                  {canEdit ? (
                    <textarea
                      className="sb-notes-textarea"
                      value={creature.gmNotes || ""}
                      onChange={(e) => handleChange({ gmNotes: e.target.value })}
                      rows={4}
                      placeholder="Notas privadas del DM..."
                    />
                  ) : (
                    <p className="sb-notes-readonly">{creature.gmNotes || <em>Sin notas</em>}</p>
                  )}
                </div>
              </>
            )}

            {/* Campaign assignment: visible to GM users, add/remove only for their own GM campaigns */}
            {(isGM || isOwner) && (
              <>
                <div className="sb-divider" />
                <CampaignsSection
                  creature={creature}
                  allCampaigns={allCampaigns}
                  gmCampaigns={gmCampaigns}
                  canManage={isGM}
                  onAdd={handleAddCampaign}
                  onRemove={handleRemoveCampaign}
                />
              </>
            )}
          </div>
        )}

        {/* ── Notes tab ── */}
        {activeTab === "notes" && (
          <div className="stat-block">
            <div className="cn-notes-header">
              <h3 className="sb-section-title" style={{ margin: 0 }}>Notas de criatura</h3>
              {isGM && (
                <button className="cs-btn cs-btn-secondary cs-btn-sm" onClick={() => setEditingNote(null)}>
                  + Nueva nota
                </button>
              )}
            </div>

            {notesLoading ? (
              <p className="cs-loading" style={{ padding: "1rem 0" }}>Cargando notas...</p>
            ) : notes.length === 0 ? (
              <p className="sb-proficiency-row" style={{ color: "var(--color-text-muted)", marginTop: "0.75rem" }}>
                {isGM ? "No hay notas. Usa el botón + para crear una." : "No hay notas visibles."}
              </p>
            ) : (
              <div className="cn-notes-list" role="list" style={{ marginTop: "0.75rem" }}>
                {notes.map((note) => {
                  const canEdit = isGM || note.visibility === "players_edit";
                  const badge = VISIBILITY_BADGE[note.visibility] || VISIBILITY_BADGE.gm;
                  const isExpanded = expandedNoteId === note.id;

                  return (
                    <article key={note.id} className="cn-note-card" role="listitem">
                      <div className="cn-note-top">
                        <button
                          className="cn-note-title-btn"
                          onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                          aria-expanded={isExpanded}
                        >
                          <span className="cn-note-title">{note.title}</span>
                          <span className="cn-note-chevron">{isExpanded ? "▲" : "▼"}</span>
                        </button>
                        <div className="cn-note-meta">
                          <span className={`cn-visibility-badge ${badge.cls}`}>{badge.text}</span>
                          <span className="cn-note-date">{note.createdAt}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="cn-note-body">
                          <p className="cn-note-content">{note.content || <em>Sin contenido</em>}</p>
                          <div className="cn-note-actions">
                            {canEdit && (
                              <button className="cn-action-btn" onClick={() => setEditingNote(note)}>Editar</button>
                            )}
                            {isGM && (
                              <button className="cn-action-btn cn-action-delete" onClick={() => setDeletingNote(note)}>Eliminar</button>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Popups ── */}
      {editingNote !== undefined && (
        <NoteEditorPopup
          note={editingNote}
          creatureId={creature.id}
          isGM={isGM}
          currentUserId={authUser?.id ?? currentUser.id}
          onClose={() => setEditingNote(undefined)}
          onSaved={handleNoteSaved}
        />
      )}
      {deletingNote && (
        <ConfirmDeleteNotePopup
          note={deletingNote}
          onConfirm={handleNoteDeleteConfirm}
          onClose={() => setDeletingNote(null)}
        />
      )}
      {possessCampaigns && (
        <CampaignPickerPopup
          campaigns={possessCampaigns}
          onPick={(campaignId) => {
            setPossessCampaigns(null);
            navigate(`/campaigns/${campaignId}/chat?characterId=${creature.id}&characterName=${encodeURIComponent(creature.name)}`);
          }}
          onClose={() => setPossessCampaigns(null)}
        />
      )}
    </main>
  );
};

export default CreatureSheetPage;
