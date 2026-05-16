// src/components/Characters/CharacterCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import CharacterNotesPopup from "./CharacterNotesPopup";
import "./CharacterCard.css";

const CharacterCard = ({ character }) => {
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);

  const handleCardClick = () => {
    navigate(`/characters/${character.id}`);
  };

  const abilityEntries = [
    { key: "str", label: "STR" },
    { key: "dex", label: "DEX" },
    { key: "con", label: "CON" },
    { key: "int", label: "INT" },
    { key: "wis", label: "WIS" },
    { key: "cha", label: "CHA" },
  ];

  const column1 = abilityEntries.slice(0, 3);
  const column2 = abilityEntries.slice(3, 6);

  const getStatClass = (key, value) => {
    if (value >= 16) return "stat-high";
    if (value <= 8) return "stat-low";
    return "";
  };

  return (
    <>
      <Card
        className="character-card"
        role="button"
        tabIndex="0"
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        aria-label={`Ver hoja de personaje de ${character.name}`}
      >
        {/* Dark portrait section */}
        <div className="card-portrait">
          <img
            src={character.imageUrl}
            alt={`Retrato de ${character.name}`}
            className="character-image"
          />
        </div>

        {/* White info section */}
        <div className="card-info">
          <h2 className="character-name">{character.name}</h2>
          <p className="character-classes">{character.classes.join(" / ")}</p>
          <p className="character-level">Nivel {character.level}</p>

          <div className="ability-scores">
            <div className="ability-column">
              {column1.map((ab) => (
                <div key={ab.key} className={`ability-row ${getStatClass(ab.key, character.stats[ab.key])}`}>
                  <span className="ability-label">{ab.label}</span>
                  <span className="ability-value">{character.stats[ab.key]}</span>
                </div>
              ))}
            </div>
            <div className="ability-column">
              {column2.map((ab) => (
                <div key={ab.key} className={`ability-row ${getStatClass(ab.key, character.stats[ab.key])}`}>
                  <span className="ability-label">{ab.label}</span>
                  <span className="ability-value">{character.stats[ab.key]}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes(true);
            }}
            ariaLabel={`Ver notas de campañas de ${character.name}`}
          >
            📋 Mis Notas
          </Button>
        </div>
      </Card>

      {showNotes && (
        <CharacterNotesPopup
          campaigns={character.campaigns}
          characterId={character.id}
          onClose={() => setShowNotes(false)}
        />
      )}
    </>
  );
};

export default CharacterCard;
