import React, { useState } from "react";
import Button from "../common/Button";
import "./GeneralInfo.css";

const GeneralInfo = ({ character, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState({
    name: character.name,
    classes: character.classes.join(" / "), // se muestra como string
    species: character.species,
    background: character.background,
    level: character.level,
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Guardar cambios: convertir clases a array
      const updated = {
        ...edited,
        classes: edited.classes.split("/").map(c => c.trim()).filter(Boolean),
      };
      onSave({ generalInfo: updated });
      setIsEditing(false);
    } else {
      // Reiniciar campos al estado actual del personaje
      setEdited({
        name: character.name,
        classes: character.classes.join(" / "),
        species: character.species,
        background: character.background,
        level: character.level,
      });
      setIsEditing(true);
    }
  };

  const handleChange = (field, value) => {
    setEdited(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="sheet-section general-info-section" aria-labelledby="general-info-heading">
      <h3 id="general-info-heading" className="sr-only">Información General</h3>
      <div className="general-info-grid">
        {/* Columna izquierda: datos principales */}
        <div className="info-left">
          <div className="info-field">
            <label htmlFor="char-name">Nombre</label>
            {isEditing ? (
              <input
                id="char-name"
                type="text"
                value={edited.name}
                onChange={e => handleChange("name", e.target.value)}
                placeholder="Nombre del personaje"
              />
            ) : (
              <span className="field-value">{character.name}</span>
            )}
          </div>
          <div className="info-field">
            <label htmlFor="char-classes">Clase(s)</label>
            {isEditing ? (
              <input
                id="char-classes"
                type="text"
                value={edited.classes}
                onChange={e => handleChange("classes", e.target.value)}
                placeholder="Ej: Ranger / Rogue"
              />
            ) : (
              <span className="field-value">{character.classes.join(" / ")}</span>
            )}
          </div>
          <div className="info-field">
            <label htmlFor="char-species">Especie</label>
            {isEditing ? (
              <input
                id="char-species"
                type="text"
                value={edited.species}
                onChange={e => handleChange("species", e.target.value)}
                placeholder="Ej: Half-Elf"
              />
            ) : (
              <span className="field-value">{character.species}</span>
            )}
          </div>
          <div className="info-field">
            <label htmlFor="char-background">Background</label>
            {isEditing ? (
              <input
                id="char-background"
                type="text"
                value={edited.background}
                onChange={e => handleChange("background", e.target.value)}
                placeholder="Ej: Outlander"
              />
            ) : (
              <span className="field-value">{character.background}</span>
            )}
          </div>
        </div>

        {/* Columna derecha: nivel, retrato, botón de editar */}
        <div className="info-right">
          <div className="info-field">
            <label htmlFor="char-level">Nivel</label>
            {isEditing ? (
              <input
                id="char-level"
                type="number"
                min="1"
                max="20"
                value={edited.level}
                onChange={e => handleChange("level", parseInt(e.target.value) || 1)}
              />
            ) : (
              <span className="field-value">{character.level}</span>
            )}
          </div>
          <div className="character-portrait">
            <img
              src={character.imageUrl}
              alt={`Retrato de ${character.name}`}
              className="portrait-image"
            />
          </div>
          <div className="edit-button-wrapper">
            <Button
              onClick={handleEditToggle}
              ariaLabel={isEditing ? "Guardar información general" : "Editar información general"}
            >
              {isEditing ? "✓" : "✎"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneralInfo;