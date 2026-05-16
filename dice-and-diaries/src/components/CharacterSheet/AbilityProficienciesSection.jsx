import React, { useState } from "react";
import Button from "../common/Button";
import "./AbilityProficienciesSection.css";

const LEVELS = ["none", "proficient", "expert"];

const LEVEL_CONFIG = {
  none:       { symbol: "○", label: "Sin competencia", className: "level-none" },
  proficient: { symbol: "◉", label: "Competente",      className: "level-proficient" },
  expert:     { symbol: "⬤", label: "Experto",          className: "level-expert" },
};

const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);

const AbilityProficienciesSection = ({ skills = [], proficiencyBonus, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState(skills);

  const handleEditToggle = () => {
    if (isEditing) {
      onSave(editedSkills);
      setIsEditing(false);
    } else {
      setEditedSkills(skills.map(s => ({ ...s })));
      setIsEditing(true);
    }
  };

  const cycleLevel = (skillId) => {
    setEditedSkills(prev => prev.map(s => {
      if (s.id !== skillId) return s;
      const currentIndex = LEVELS.indexOf(s.level);
      const nextLevel = LEVELS[(currentIndex + 1) % LEVELS.length];
      const baseMod = s.totalMod - (
        s.level === "proficient" ? proficiencyBonus :
        s.level === "expert" ? proficiencyBonus * 2 : 0
      );
      const newTotal = baseMod + (
        nextLevel === "proficient" ? proficiencyBonus :
        nextLevel === "expert" ? proficiencyBonus * 2 : 0
      );
      return { ...s, level: nextLevel, totalMod: newTotal };
    }));
  };

  const displaySkills = isEditing ? editedSkills : skills;

  return (
    <section className="sheet-section proficiencies-section" aria-labelledby="proficiencies-heading">
      <div className="prof-header-row">
        <h3 id="proficiencies-heading">Competencias</h3>
        <Button
          onClick={handleEditToggle}
          ariaLabel={isEditing ? "Guardar competencias" : "Editar competencias"}
        >
          {isEditing ? "✓" : "✎"}
        </Button>
      </div>

      {/* Column headers */}
      <div className="prof-col-headers" aria-hidden="true">
        <span className="prof-col-indicator" />
        <span className="prof-col-name">Habilidad</span>
        <span className="prof-col-ability">Attr.</span>
        <span className="prof-col-mod">Mod.</span>
      </div>

      <ul className="proficiencies-list">
        {displaySkills.map(skill => {
          const cfg = LEVEL_CONFIG[skill.level];
          return (
            <li key={skill.id} className="proficiency-row">
              <button
                className={`prof-indicator ${cfg.className} ${isEditing ? "editable" : ""}`}
                onClick={() => isEditing && cycleLevel(skill.id)}
                title={cfg.label}
                aria-label={`${skill.name}: ${cfg.label}${isEditing ? ". Clic para cambiar." : ""}`}
                disabled={!isEditing}
                tabIndex={isEditing ? 0 : -1}
              >
                {cfg.symbol}
              </button>

              <span className="prof-skill-name">{skill.name}</span>

              <span className="prof-ability-tag" title={skill.ability.toUpperCase()}>
                {skill.ability.toUpperCase()}
              </span>

              <span className="prof-total-mod">
                {fmt(skill.totalMod)}
              </span>
            </li>
          );
        })}
      </ul>

      {isEditing && (
        <p className="prof-edit-hint">
          Clic en el indicador para cambiar nivel (○ → ◉ → ⬤)
        </p>
      )}
    </section>
  );
};

export default AbilityProficienciesSection;
