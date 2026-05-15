import React from "react";
import "./AbilityProficienciesSection.css";

const proficiencyColors = {
  none: { bg: "var(--color-gray-200)", label: "No proficiente" },
  proficient: { bg: "var(--color-success)", label: "Proficiente" },
  expert: { bg: "var(--color-primary)", label: "Experto" },
};

const AbilityProficienciesSection = ({ proficiencies }) => {
  return (
    <section className="sheet-section proficiencies-section" aria-labelledby="proficiencies-heading">
      <h3 id="proficiencies-heading">Proficiencies</h3>
      <ul className="proficiencies-list">
        {proficiencies.map(prof => (
          <li key={prof.ability} className="proficiency-row">
            <span className="prof-ability-name">{prof.ability.toUpperCase()}</span>
            <span className="prof-total-mod">
              {prof.totalMod >= 0 ? "+" : ""}{prof.totalMod}
            </span>
            <span
              className="prof-indicator"
              style={{ backgroundColor: proficiencyColors[prof.proficiencyLevel].bg }}
              title={proficiencyColors[prof.proficiencyLevel].label}
              aria-label={proficiencyColors[prof.proficiencyLevel].label}
            >
              {prof.proficiencyLevel === "none" ? "○" : prof.proficiencyLevel === "proficient" ? "◉" : "⬤"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AbilityProficienciesSection;