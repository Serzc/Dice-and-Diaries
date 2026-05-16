// src/pages/CreatureSheetPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCreature, saveCreature, currentUser, fmtMod } from "../mock/db";
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

// ── Cabecera del stat block ──────────────────────────────────────────────────
const StatBlockHeader = ({ creature, isEditing, onChange }) => {
  if (!isEditing) {
    return (
      <div className="stat-block-header">
        <h2 className="sb-name">{creature.name}</h2>
        <p className="sb-subtitle">
          {creature.size} {creature.creatureType}, {creature.alignment}
        </p>
        <p className="sb-cr-badge">CR {creature.cr}</p>
      </div>
    );
  }

  return (
    <div className="stat-block-header">
      <div className="sb-edit-row">
        <input
          className="sb-input sb-input-name"
          value={creature.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Nombre de la criatura"
        />
        <div className="sb-edit-field">
          <span className="sb-label">CR</span>
          <input
            className="sb-input sb-input-sm"
            value={creature.cr}
            onChange={(e) => onChange({ cr: e.target.value })}
            placeholder="1/4"
          />
        </div>
      </div>
      <div className="sb-edit-row">
        <select
          className="sb-select"
          value={creature.size}
          onChange={(e) => onChange({ size: e.target.value })}
        >
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          className="sb-input"
          value={creature.creatureType}
          onChange={(e) => onChange({ creatureType: e.target.value })}
          placeholder="Tipo (Bestia, Humanoide...)"
        />
        <input
          className="sb-input"
          value={creature.alignment}
          onChange={(e) => onChange({ alignment: e.target.value })}
          placeholder="Alineamiento"
        />
      </div>
    </div>
  );
};

// ── Defensas ─────────────────────────────────────────────────────────────────
const DefensesSection = ({ creature, isEditing, onChange }) => (
  <div className="stat-block-section">
    <h3 className="sb-section-title">Defensas</h3>
    <div className="sb-defenses-row">
      <div className="sb-defense-item">
        <span className="sb-label">CA</span>
        {isEditing ? (
          <div className="sb-stacked">
            <input
              type="number"
              className="sb-input sb-input-sm"
              value={creature.ac}
              onChange={(e) => onChange({ ac: Number(e.target.value) })}
            />
            <input
              className="sb-input"
              value={creature.acNote || ""}
              onChange={(e) => onChange({ acNote: e.target.value })}
              placeholder="Nota de CA..."
            />
          </div>
        ) : (
          <>
            <span className="sb-value">{creature.ac}</span>
            {creature.acNote && <span className="sb-note"> ({creature.acNote})</span>}
          </>
        )}
      </div>

      <div className="sb-defense-item">
        <span className="sb-label">PV</span>
        {isEditing ? (
          <div className="sb-stacked">
            <span className="sb-hp-inputs">
              <input
                type="number"
                className="sb-input sb-input-sm"
                value={creature.hp.current}
                onChange={(e) =>
                  onChange({ hp: { ...creature.hp, current: Number(e.target.value) } })
                }
              />
              <span className="sb-slash">/</span>
              <input
                type="number"
                className="sb-input sb-input-sm"
                value={creature.hp.max}
                onChange={(e) =>
                  onChange({ hp: { ...creature.hp, max: Number(e.target.value) } })
                }
              />
            </span>
            <input
              className="sb-input"
              value={creature.hp.formula || ""}
              onChange={(e) => onChange({ hp: { ...creature.hp, formula: e.target.value } })}
              placeholder="Fórmula (2d8+4)"
            />
          </div>
        ) : (
          <span className="sb-value">
            {creature.hp.current}/{creature.hp.max}
            <span className="sb-note"> ({creature.hp.formula})</span>
          </span>
        )}
      </div>

      <div className="sb-defense-item">
        <span className="sb-label">Velocidad</span>
        {isEditing ? (
          <input
            className="sb-input"
            value={creature.speed}
            onChange={(e) => onChange({ speed: e.target.value })}
            placeholder="9 m"
          />
        ) : (
          <span className="sb-value">{creature.speed}</span>
        )}
      </div>
    </div>
  </div>
);

// ── Características (ability scores) ─────────────────────────────────────────
const AbilitiesSection = ({ abilityScores, isEditing, onChange }) => (
  <div className="stat-block-section">
    <h3 className="sb-section-title">Características</h3>
    <div className="sb-abilities-grid">
      {ABILITIES.map(({ key, label }) => {
        const score = abilityScores[key];
        const modStr = fmtMod(score);
        return (
          <div className="sb-ability-cell" key={key}>
            <div className="sb-ability-label">{label}</div>
            {isEditing ? (
              <input
                type="number"
                className="sb-input sb-ability-input"
                value={score}
                min={1}
                max={30}
                onChange={(e) =>
                  onChange({ abilityScores: { ...abilityScores, [key]: Number(e.target.value) } })
                }
              />
            ) : (
              <div className="sb-ability-score">{score}</div>
            )}
            <div className="sb-ability-mod">{modStr}</div>
          </div>
        );
      })}
    </div>
  </div>
);

// ── Competencias / proficiencies ──────────────────────────────────────────────
const ProficienciesSection = ({ creature, isEditing, onChange }) => {
  const hasSaves = creature.savingThrows && creature.savingThrows.length > 0;
  const hasSkills = creature.skills && creature.skills.length > 0;
  const hasAny =
    hasSaves || hasSkills ||
    creature.damageImmunities?.length > 0 ||
    creature.damageResistances?.length > 0 ||
    creature.conditionImmunities?.length > 0 ||
    creature.senses || creature.languages;

  if (!isEditing && !hasAny) return null;

  const addSave = () =>
    onChange({ savingThrows: [...(creature.savingThrows || []), { ability: "FUE", mod: 0 }] });
  const removeSave = (idx) =>
    onChange({ savingThrows: creature.savingThrows.filter((_, i) => i !== idx) });
  const updateSave = (idx, field, val) =>
    onChange({
      savingThrows: creature.savingThrows.map((s, i) =>
        i === idx ? { ...s, [field]: val } : s
      ),
    });

  const addSkill = () =>
    onChange({ skills: [...(creature.skills || []), { name: "", mod: 0 }] });
  const removeSkill = (idx) =>
    onChange({ skills: creature.skills.filter((_, i) => i !== idx) });
  const updateSkill = (idx, field, val) =>
    onChange({
      skills: creature.skills.map((s, i) =>
        i === idx ? { ...s, [field]: val } : s
      ),
    });

  return (
    <div className="stat-block-section">
      <h3 className="sb-section-title">Competencias</h3>

      {/* Tiradas de salvación */}
      {isEditing ? (
        <div className="sb-edit-list-section">
          <span className="sb-list-label">Tiradas de salvación</span>
          {(creature.savingThrows || []).map((s, idx) => (
            <div key={idx} className="sb-list-item-row">
              <input
                className="sb-input sb-input-sm"
                value={s.ability}
                onChange={(e) => updateSave(idx, "ability", e.target.value)}
                placeholder="FUE"
              />
              <input
                type="number"
                className="sb-input sb-input-sm"
                value={s.mod}
                onChange={(e) => updateSave(idx, "mod", Number(e.target.value))}
              />
              <button type="button" className="sb-remove-btn" onClick={() => removeSave(idx)}>
                &#x2715;
              </button>
            </div>
          ))}
          <button type="button" className="sb-add-btn" onClick={addSave}>
            + Añadir tirada
          </button>
        </div>
      ) : hasSaves ? (
        <p className="sb-proficiency-row">
          <strong>Tiradas de salvación:</strong>{" "}
          {creature.savingThrows
            .map((s) => `${s.ability} ${s.mod >= 0 ? "+" : ""}${s.mod}`)
            .join(", ")}
        </p>
      ) : null}

      {/* Habilidades */}
      {isEditing ? (
        <div className="sb-edit-list-section">
          <span className="sb-list-label">Habilidades</span>
          {(creature.skills || []).map((s, idx) => (
            <div key={idx} className="sb-list-item-row">
              <input
                className="sb-input"
                value={s.name}
                onChange={(e) => updateSkill(idx, "name", e.target.value)}
                placeholder="Percepción"
              />
              <input
                type="number"
                className="sb-input sb-input-sm"
                value={s.mod}
                onChange={(e) => updateSkill(idx, "mod", Number(e.target.value))}
              />
              <button type="button" className="sb-remove-btn" onClick={() => removeSkill(idx)}>
                &#x2715;
              </button>
            </div>
          ))}
          <button type="button" className="sb-add-btn" onClick={addSkill}>
            + Añadir habilidad
          </button>
        </div>
      ) : hasSkills ? (
        <p className="sb-proficiency-row">
          <strong>Habilidades:</strong>{" "}
          {creature.skills
            .map((s) => `${s.name} ${s.mod >= 0 ? "+" : ""}${s.mod}`)
            .join(", ")}
        </p>
      ) : null}

      {/* Inmunidades / resistencias / condiciones / sentidos / idiomas */}
      {isEditing ? (
        <div className="sb-edit-fields-block">
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Inm. al daño</span>
            <input
              className="sb-input"
              value={(creature.damageImmunities || []).join(", ")}
              onChange={(e) =>
                onChange({
                  damageImmunities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="veneno, fuego..."
            />
          </div>
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Resistencias</span>
            <input
              className="sb-input"
              value={(creature.damageResistances || []).join(", ")}
              onChange={(e) =>
                onChange({
                  damageResistances: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="contundente, cortante..."
            />
          </div>
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Inm. a condiciones</span>
            <input
              className="sb-input"
              value={(creature.conditionImmunities || []).join(", ")}
              onChange={(e) =>
                onChange({
                  conditionImmunities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="envenenado, asustado..."
            />
          </div>
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Sentidos</span>
            <input
              className="sb-input"
              value={creature.senses || ""}
              onChange={(e) => onChange({ senses: e.target.value })}
              placeholder="Visión en la oscuridad 18 m..."
            />
          </div>
          <div className="sb-edit-field-row">
            <span className="sb-list-label">Idiomas</span>
            <input
              className="sb-input"
              value={creature.languages || ""}
              onChange={(e) => onChange({ languages: e.target.value })}
              placeholder="Común, Goblin..."
            />
          </div>
        </div>
      ) : (
        <>
          {creature.damageImmunities?.length > 0 && (
            <p className="sb-proficiency-row">
              <strong>Inmunidades al daño:</strong> {creature.damageImmunities.join(", ")}
            </p>
          )}
          {creature.damageResistances?.length > 0 && (
            <p className="sb-proficiency-row">
              <strong>Resistencias al daño:</strong> {creature.damageResistances.join(", ")}
            </p>
          )}
          {creature.conditionImmunities?.length > 0 && (
            <p className="sb-proficiency-row">
              <strong>Inmunidades a condiciones:</strong>{" "}
              {creature.conditionImmunities.join(", ")}
            </p>
          )}
          {creature.senses && (
            <p className="sb-proficiency-row">
              <strong>Sentidos:</strong> {creature.senses}
            </p>
          )}
          {creature.languages && (
            <p className="sb-proficiency-row">
              <strong>Idiomas:</strong> {creature.languages}
            </p>
          )}
        </>
      )}
    </div>
  );
};

// ── Lista de rasgos (read + edit) ─────────────────────────────────────────────
const TraitsSection = ({ traits, title, isEditing, onChangeTraits }) => {
  if (!isEditing && (!traits || traits.length === 0)) return null;

  const addTrait = () => onChangeTraits([...(traits || []), { name: "", description: "" }]);
  const removeTrait = (idx) => onChangeTraits(traits.filter((_, i) => i !== idx));
  const updateTrait = (idx, field, val) =>
    onChangeTraits(traits.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));

  return (
    <div className="stat-block-section">
      <h3 className="sb-section-title">{title}</h3>
      {(traits || []).map((trait, idx) =>
        isEditing ? (
          <div key={idx} className="sb-trait-edit-item">
            <div className="sb-trait-edit-header">
              <input
                className="sb-input sb-trait-name-input"
                value={trait.name}
                onChange={(e) => updateTrait(idx, "name", e.target.value)}
                placeholder="Nombre del rasgo"
              />
              <button
                type="button"
                className="sb-remove-btn"
                onClick={() => removeTrait(idx)}
              >
                &#x2715;
              </button>
            </div>
            <textarea
              className="sb-notes-textarea sb-trait-desc-textarea"
              value={trait.description}
              onChange={(e) => updateTrait(idx, "description", e.target.value)}
              placeholder="Descripción del rasgo..."
              rows={3}
            />
          </div>
        ) : (
          <div className="sb-trait-item" key={idx}>
            <p className="sb-trait-text">
              <strong>{trait.name}.</strong> {trait.description}
            </p>
          </div>
        )
      )}
      {isEditing && (
        <button type="button" className="sb-add-btn" onClick={addTrait}>
          + Añadir
        </button>
      )}
    </div>
  );
};

// ── Notas ─────────────────────────────────────────────────────────────────────
const NotesSection = ({ creature, isGM, onChange }) => (
  <div className="stat-block-section">
    {isGM && (
      <div className="sb-notes-block">
        <label className="sb-notes-label">Notas del DM (privadas)</label>
        <textarea
          className="sb-notes-textarea"
          value={creature.gmNotes || ""}
          onChange={(e) => onChange({ gmNotes: e.target.value })}
          rows={5}
          placeholder="Notas privadas del DM..."
        />
      </div>
    )}
    <div className="sb-notes-block">
      <label className="sb-notes-label">Notas visibles para jugadores</label>
      <textarea
        className="sb-notes-textarea"
        value={creature.playerVisibleNotes || ""}
        onChange={(e) => onChange({ playerVisibleNotes: e.target.value })}
        rows={4}
        placeholder="Descripción visible para los jugadores..."
        readOnly={!isGM}
      />
    </div>
  </div>
);

// ══ Página principal ══════════════════════════════════════════════════════════
const CreatureSheetPage = () => {
  const { creatureId } = useParams();
  const navigate = useNavigate();

  const [creature, setCreature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const originalRef = useRef(null);
  const isGM = currentUser.isGM;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCreature(creatureId)
      .then((data) => {
        setCreature(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [creatureId]);

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

  if (loading) {
    return (
      <main className="creature-sheet-page">
        <p className="cs-loading">Cargando criatura...</p>
      </main>
    );
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

  const tabs = isGM
    ? [
        { id: "stats", label: "Estadísticas" },
        { id: "notes", label: "Notas" },
      ]
    : [{ id: "notes", label: "Notas" }];

  const hasSpecialTraits = creature.specialTraits?.length > 0 || isEditing;
  const hasActions = creature.actions?.length > 0 || isEditing;
  const hasBonusActions = creature.bonusActions?.length > 0 || isEditing;
  const hasReactions = creature.reactions?.length > 0 || isEditing;

  return (
    <main className="creature-sheet-page" aria-labelledby="creature-sheet-heading">
      {/* Cabecera */}
      <div className="creature-sheet-header">
        <div className="csh-left">
          <button
            className="cs-back-btn"
            onClick={() => navigate("/creatures")}
            aria-label="Volver a Mis Criaturas"
          >
            &#8592;
          </button>
          <div>
            <h1 id="creature-sheet-heading" className="page-title cs-page-title">
              {creature.name}
            </h1>
            <span className="cs-type-badge">
              {creature.size} {creature.creatureType}
            </span>
          </div>
        </div>
        <div className="csh-right">
          {isGM && (
            <>
              {isEditing ? (
                <>
                  <button className="cs-btn cs-btn-secondary" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button
                    className="cs-btn cs-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </>
              ) : (
                <button className="cs-btn cs-btn-secondary" onClick={startEditing}>
                  Editar
                </button>
              )}
              <button
                className="cs-btn cs-btn-possess"
                onClick={() => console.log("[Poseer] criatura:", creature.name)}
              >
                Poseer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="creature-tabs" role="tablist" aria-label="Secciones de la criatura">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`creature-tab-btn${activeTab === tab.id ? " active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="creature-tab-content" role="tabpanel">
        {activeTab === "stats" && isGM && (
          <div className="stat-block">
            <StatBlockHeader creature={creature} isEditing={isEditing} onChange={handleChange} />
            <div className="sb-divider" />
            <DefensesSection creature={creature} isEditing={isEditing} onChange={handleChange} />
            <div className="sb-divider" />
            <AbilitiesSection
              abilityScores={creature.abilityScores}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <div className="sb-divider" />
            <ProficienciesSection creature={creature} isEditing={isEditing} onChange={handleChange} />

            {hasSpecialTraits && (
              <>
                <div className="sb-divider" />
                <TraitsSection
                  traits={creature.specialTraits}
                  title="Rasgos especiales"
                  isEditing={isEditing}
                  onChangeTraits={(val) => handleChange({ specialTraits: val })}
                />
              </>
            )}
            {hasActions && (
              <>
                <div className="sb-divider" />
                <TraitsSection
                  traits={creature.actions}
                  title="Acciones"
                  isEditing={isEditing}
                  onChangeTraits={(val) => handleChange({ actions: val })}
                />
              </>
            )}
            {hasBonusActions && (
              <>
                <div className="sb-divider" />
                <TraitsSection
                  traits={creature.bonusActions}
                  title="Acciones adicionales"
                  isEditing={isEditing}
                  onChangeTraits={(val) => handleChange({ bonusActions: val })}
                />
              </>
            )}
            {hasReactions && (
              <>
                <div className="sb-divider" />
                <TraitsSection
                  traits={creature.reactions}
                  title="Reacciones"
                  isEditing={isEditing}
                  onChangeTraits={(val) => handleChange({ reactions: val })}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="stat-block">
            <NotesSection creature={creature} isGM={isGM} onChange={handleChange} />
          </div>
        )}
      </div>
    </main>
  );
};

export default CreatureSheetPage;
