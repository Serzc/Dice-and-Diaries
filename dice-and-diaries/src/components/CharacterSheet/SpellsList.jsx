import React, { useState, useEffect, useCallback } from "react";
import { fetchSpellcastingData } from "../../mock/characterSheetMock";
import { getSpellcastingStats } from "../../utils/spellUtils";
import SpellLevelGroup from "./SpellLevelGroup";
import SpellFormPopup from "./SpellFormPopup";
import Button from "../common/Button";
import "./SpellsList.css";

const SpellsList = ({ character, onSave }) => {
  const [spellData, setSpellData] = useState(null);
  const [editingSpell, setEditingSpell] = useState(null);
  const [showAddSpell, setShowAddSpell] = useState(false);
  const [spellcastingAbility, setSpellcastingAbility] = useState("");
  const [spellSlots, setSpellSlots] = useState({});
  const [spells, setSpells] = useState([]);

  const { abilityScores, proficiencyBonus } = character;

  useEffect(() => {
    fetchSpellcastingData(character.id).then(data => {
      setSpellcastingAbility(data.ability);
      setSpellSlots(data.slots);
      setSpells(data.spells);
      setSpellData(data);
    });
  }, [character.id]);

  const stats = getSpellcastingStats(spellcastingAbility, abilityScores, proficiencyBonus);
  const maxLevel = Math.max(...Object.keys(spellSlots).map(Number), 0);

  const handleSpendSlot = (level) => {
    setSpellSlots(prev => ({
      ...prev,
      [level]: { ...prev[level], current: Math.max(0, prev[level].current - 1) }
    }));
    onSave && onSave({ spellSlots });
  };

  const handleRecoverSlot = (level) => {
    setSpellSlots(prev => ({
      ...prev,
      [level]: { ...prev[level], current: Math.min(prev[level].max, prev[level].current + 1) }
    }));
    onSave && onSave({ spellSlots });
  };

  const handleTogglePrepared = (spellId) => {
    setSpells(prev => prev.map(s => s.id === spellId ? { ...s, prepared: !s.prepared } : s));
  };

  const handleSaveSpell = (spellData) => {
    if (editingSpell) {
      setSpells(prev => prev.map(s => s.id === spellData.id ? spellData : s));
    } else {
      setSpells(prev => [...prev, spellData]);
    }
    setShowAddSpell(false);
    setEditingSpell(null);
  };

  const handleDeleteSpell = (spellId) => {
    setSpells(prev => prev.filter(s => s.id !== spellId));
  };

  const openEditSpell = (spell) => {
    setEditingSpell(spell);
    setShowAddSpell(true);
  };

  const openNewSpell = () => {
    setEditingSpell(null);
    setShowAddSpell(true);
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
            onChange={e => setSpellcastingAbility(e.target.value)}
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
        <Button onClick={openNewSpell} ariaLabel="Agregar hechizo">+</Button>
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
          onEditSpell={openEditSpell}
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