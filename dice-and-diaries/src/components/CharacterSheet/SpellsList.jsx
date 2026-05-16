import React, { useState, useEffect } from "react";
import { fetchSpellcastingData } from "../../mock/db";
import { getSpellcastingStats } from "../../utils/spellUtils";
import SpellLevelGroup from "./SpellLevelGroup";
import SpellFormPopup from "./SpellFormPopup";
import Button from "../common/Button";
import "./SpellsList.css";

const SpellsList = ({ character, onSave }) => {
  const [spellData,          setSpellData]          = useState(null);
  const [editingSpell,       setEditingSpell]       = useState(null);
  const [showAddSpell,       setShowAddSpell]       = useState(false);
  const [spellcastingAbility, setSpellcastingAbility] = useState("");
  const [spellSlots,         setSpellSlots]         = useState({});
  const [spells,             setSpells]             = useState([]);

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
  const maxLevel = Math.max(...Object.keys(spellSlots).map(Number), 0);

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
        <Button onClick={() => { setEditingSpell(null); setShowAddSpell(true); }} ariaLabel="Agregar hechizo">+</Button>
      </div>

      {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
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
