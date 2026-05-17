import React, { useState, useEffect } from "react";
import { fetchSpellcastingData } from "../../mock/db";
import { getSpellcastingStats } from "../../utils/spellUtils";
import SpellLevelGroup from "./SpellLevelGroup";
import SpellFormPopup from "./SpellFormPopup";
import Button from "../common/Button";
import "./SpellsList.css";

const SpellsList = ({ character, onSave, restTrigger }) => {
  const [spellData,          setSpellData]          = useState(null);
  const [editingSpell,       setEditingSpell]       = useState(null);
  const [showAddSpell,       setShowAddSpell]       = useState(false);
  const [showSlotEditor,     setShowSlotEditor]     = useState(false);
  const [spellcastingAbility, setSpellcastingAbility] = useState("");
  const [spellSlots,         setSpellSlots]         = useState({});
  const [spells,             setSpells]             = useState([]);
  // Editable slot maximums (9 levels)
  const [slotMaxEdit,        setSlotMaxEdit]        = useState(Array(9).fill(0));

  const { abilityScores, proficiencyBonus } = character;

  useEffect(() => {
    fetchSpellcastingData(character.id).then(data => {
      setSpellcastingAbility(data.ability || "int");
      setSpellSlots(data.slots || {});
      setSpells(data.spells || []);
      setSpellData(data);
    });
  }, [character.id]);

  const safeAbility = spellcastingAbility || "int";
  const stats = getSpellcastingStats(safeAbility, abilityScores, proficiencyBonus);

  // Show levels that have slots configured OR have spells
  const spellLevels = [...new Set([
    ...Object.keys(spellSlots).map(Number).filter(l => spellSlots[l]?.max > 0),
    ...spells.map(s => s.level).filter(Boolean),
  ])].sort((a, b) => a - b);

  // ── Spell slots ──────────────────────────────────────────────────────
  const handleSpendSlot = (level) => {
    const updated = { ...spellSlots, [level]: { ...spellSlots[level], current: Math.max(0, spellSlots[level].current - 1) } };
    setSpellSlots(updated);
    onSave && onSave({ spellSlots: updated });
  };

  const handleRecoverSlot = (level) => {
    const updated = { ...spellSlots, [level]: { ...spellSlots[level], current: Math.min(spellSlots[level].max, spellSlots[level].current + 1) } };
    setSpellSlots(updated);
    onSave && onSave({ spellSlots: updated });
  };

  // ── Spellcasting ability ──────────────────────────────────────────────
  const handleAbilityChange = (e) => {
    const ability = e.target.value;
    setSpellcastingAbility(ability);
    onSave && onSave({ spellcastingAbility: ability });
  };

  // ── Individual spells ─────────────────────────────────────────────────
  const handleTogglePrepared = (spellId) => {
    const updated = spells.map(s => s.id === spellId ? { ...s, prepared: !s.prepared } : s);
    setSpells(updated);
    onSave && onSave({ spells: updated });
  };

  const handleSaveSpell = (spellFormData) => {
    const updated = editingSpell
      ? spells.map(s => s.id === spellFormData.id ? spellFormData : s)
      : [...spells, { ...spellFormData, id: spellFormData.id || Date.now() }];
    setShowAddSpell(false);
    setEditingSpell(null);
    setSpells(updated);
    onSave && onSave({ spells: updated });
  };

  const handleDeleteSpell = (spellId) => {
    const updated = spells.filter(s => s.id !== spellId);
    setSpells(updated);
    onSave && onSave({ spells: updated });
  };

  // Open slot editor: seed inputs from current slot config
  const openSlotEditor = () => {
    const maxes = Array(9).fill(0).map((_, i) => spellSlots[i + 1]?.max ?? 0);
    setSlotMaxEdit(maxes);
    setShowSlotEditor(true);
  };

  const saveSlotEditor = () => {
    const updated = {};
    slotMaxEdit.forEach((max, i) => {
      const level = i + 1;
      const current = Math.min(spellSlots[level]?.current ?? max, max);
      if (max > 0) updated[level] = { max, current };
    });
    setSpellSlots(updated);
    setShowSlotEditor(false);
    onSave && onSave({ spellSlots: updated });
  };

  // Long rest: restore all spell slots to max
  useEffect(() => {
    if (restTrigger?.type !== "LR" || !restTrigger.count) return;
    const restored = {};
    for (const [lvl, slot] of Object.entries(spellSlots)) {
      restored[lvl] = { ...slot, current: slot.max };
    }
    setSpellSlots(restored);
    onSave && onSave({ spellSlots: restored });
  }, [restTrigger?.count]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!spellData) return <div className="loading">Cargando hechizos...</div>;

  return (
    <section className="spells-section" aria-labelledby="spells-heading">
      <h3 id="spells-heading">Hechizos</h3>
      <div className="spellcasting-header">
        <div className="ability-selector">
          <label htmlFor="spell-ability">Aptitud mágica</label>
          <select
            id="spell-ability"
            value={spellcastingAbility}
            onChange={handleAbilityChange}
          >
            <option value="int">Inteligencia</option>
            <option value="wis">Sabiduría</option>
            <option value="cha">Carisma</option>
          </select>
        </div>
        <div className="spell-stats">
          <span>Mod: {stats.spellMod >= 0 ? "+" : ""}{stats.spellMod}</span>
          <span>CD: {stats.spellSaveDC}</span>
        </div>
        <button className="spell-slot-edit-btn" onClick={openSlotEditor} title="Configurar casillas de conjuro" aria-label="Editar casillas de conjuro">⚙ Casillas</button>
        <Button onClick={() => { setEditingSpell(null); setShowAddSpell(true); }} ariaLabel="Agregar hechizo">+</Button>
      </div>

      {spellLevels.length === 0 && (
        <p className="spells-empty-hint">Configura las casillas de conjuro con ⚙ para empezar.</p>
      )}

      {spellLevels.map(level => (
        <SpellLevelGroup
          key={level}
          level={level}
          slots={spellSlots}
          spells={spells}
          onSpendSlot={handleSpendSlot}
          onRecoverSlot={handleRecoverSlot}
          onTogglePrepared={handleTogglePrepared}
          onEditSpell={(spell) => { setEditingSpell(spell); setShowAddSpell(true); }}
          onDeleteSpell={handleDeleteSpell}
        />
      ))}

      {/* Slot editor popup */}
      {showSlotEditor && (
        <div className="popup-overlay" onClick={() => setShowSlotEditor(false)} role="dialog" aria-modal="true" aria-label="Configurar casillas de conjuro">
          <div className="popup-content" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">Casillas de conjuro</h3>
              <button className="popup-close-btn" onClick={() => setShowSlotEditor(false)} aria-label="Cerrar">✕</button>
            </div>
            <div className="popup-body">
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                Escribe el número máximo de casillas por nivel (0 = ninguna).
              </p>
              <div className="slot-editor-grid">
                {slotMaxEdit.map((val, i) => (
                  <label key={i} className="slot-editor-row">
                    <span>Nivel {i + 1}</span>
                    <input
                      type="number" min="0" max="9" value={val}
                      onChange={e => {
                        const n = Math.max(0, Math.min(9, parseInt(e.target.value) || 0));
                        setSlotMaxEdit(prev => prev.map((v, j) => j === i ? n : v));
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="popup-footer">
              <button className="primary-button" onClick={saveSlotEditor}>Guardar</button>
              <button className="primary-button" onClick={() => setShowSlotEditor(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showAddSpell && (
        <SpellFormPopup
          spell={editingSpell}
          onSave={handleSaveSpell}
          onClose={() => { setShowAddSpell(false); setEditingSpell(null); }}
        />
      )}
    </section>
  );
};

export default SpellsList;
