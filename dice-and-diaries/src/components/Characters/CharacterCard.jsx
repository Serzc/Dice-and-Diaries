// src/components/Characters/CharacterCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../common/Card";
import Button from "../common/Button";
import CharacterNotesPopup from "./CharacterNotesPopup";
import { fetchCampaigns, addCharacterToCampaign, getCurrentUserId } from "../../mock/db";
import "../common/Popup.css";
import "./CharacterCard.css";

const CharacterCard = ({ character, onUpdated }) => {
  const navigate = useNavigate();
  const [showNotes,    setShowNotes]    = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaigns,    setCampaigns]    = useState([]);
  const [linking,      setLinking]      = useState(false);
  const [linked,       setLinked]       = useState(new Set((character.campaigns || []).map(c => c.id)));

  const openCampaignPicker = async () => {
    const data = await fetchCampaigns(getCurrentUserId());
    setCampaigns(data);
    setShowCampaign(true);
  };

  const handleToggleCampaign = async (campaignId) => {
    setLinking(true);
    if (linked.has(campaignId)) {
      // keep linked; removing is done from character sheet / campaign view
    } else {
      await addCharacterToCampaign(character.id, campaignId);
      setLinked(prev => new Set([...prev, campaignId]));
      onUpdated && onUpdated();
    }
    setLinking(false);
  };

  const handleCardClick = () => {
    navigate(`/characters/${character.id}`);
  };

  const abilityEntries = [
    { key: "str", label: "STR", full: "Fuerza" },
    { key: "dex", label: "DEX", full: "Destreza" },
    { key: "con", label: "CON", full: "Constitución" },
    { key: "int", label: "INT", full: "Inteligencia" },
    { key: "wis", label: "WIS", full: "Sabiduría" },
    { key: "cha", label: "CHA", full: "Carisma" },
  ];

  const column1 = abilityEntries.slice(0, 3);
  const column2 = abilityEntries.slice(3, 6);

  const getStatClass = (_key, value) => {
    if (value >= 16) return "stat-high";
    if (value <= 8) return "stat-low";
    return "";
  };

  return (
    <>
      <Card
        className="character-card"
        role="article"
        aria-labelledby={`char-name-${character.id}`}
        onClick={handleCardClick}
      >
        {/* Portrait — presentational, name heading already identifies the character */}
        <div className="card-portrait">
          <img
            src={character.imageUrl}
            alt=""
            role="presentation"
            className="character-image"
          />
        </div>

        <div className="card-info">
          {/* h2 wrapping a button: heading navigation + keyboard activation */}
          <h2 id={`char-name-${character.id}`} className="character-name">
            <button
              className="character-name-btn"
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
              aria-label={`Ver hoja de ${character.name}, ${character.classes.join(", ")}, Nivel ${character.level}`}
            >
              {character.name}
            </button>
          </h2>
          <p className="character-classes" aria-hidden="true">{character.classes.join(" / ")}</p>
          <p className="character-level" aria-hidden="true">Nivel {character.level}</p>

          <dl className="ability-scores" aria-label="Puntuaciones de característica">
            <div className="ability-column">
              {column1.map((ab) => (
                <div key={ab.key} className={`ability-row ${getStatClass(ab.key, character.stats[ab.key])}`}>
                  <dt className="ability-label">
                    <abbr title={ab.full} lang="en">{ab.label}</abbr>
                  </dt>
                  <dd className="ability-value">{character.stats[ab.key]}</dd>
                </div>
              ))}
            </div>
            <div className="ability-column">
              {column2.map((ab) => (
                <div key={ab.key} className={`ability-row ${getStatClass(ab.key, character.stats[ab.key])}`}>
                  <dt className="ability-label">
                    <abbr title={ab.full} lang="en">{ab.label}</abbr>
                  </dt>
                  <dd className="ability-value">{character.stats[ab.key]}</dd>
                </div>
              ))}
            </div>
          </dl>

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <Button
              onClick={(e) => { e.stopPropagation(); setShowNotes(true); }}
              ariaLabel={`Notas de campaña de ${character.name}`}
            >
              <span aria-hidden="true">📋</span> Mis Notas
            </Button>
            <Button
              onClick={(e) => { e.stopPropagation(); openCampaignPicker(); }}
              ariaLabel={`Añadir ${character.name} a una campaña`}
            >
              <span aria-hidden="true">⚔</span> Campaña
            </Button>
          </div>
        </div>
      </Card>

      {showNotes && (
        <CharacterNotesPopup
          campaigns={character.campaigns}
          characterId={character.id}
          onClose={() => setShowNotes(false)}
        />
      )}

      {showCampaign && (
        <div className="popup-overlay" onClick={() => setShowCampaign(false)} role="dialog" aria-modal="true" aria-labelledby={`add-campaign-title-${character.id}`}>
          <div className="popup-content" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <h3 id={`add-campaign-title-${character.id}`} className="popup-title">Añadir a campaña</h3>
              <button className="popup-close-btn" onClick={() => setShowCampaign(false)} aria-label="Cerrar">✕</button>
            </div>
            <div className="popup-body">
              {campaigns.length === 0 ? (
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.88rem" }}>No tienes campañas disponibles.</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {campaigns.map(camp => {
                    const isLinked = linked.has(camp.id);
                    return (
                      <li key={camp.id}>
                        <button
                          onClick={() => handleToggleCampaign(camp.id)}
                          disabled={linking || isLinked}
                          aria-pressed={isLinked}
                          aria-label={isLinked ? `${camp.name} ya añadida` : `Añadir a ${camp.name}`}
                          style={{
                            width: "100%", textAlign: "left", padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)", cursor: isLinked ? "default" : "pointer",
                            border: `1.5px solid ${isLinked ? "var(--color-primary)" : "var(--color-gray-300)"}`,
                            background: isLinked ? "var(--color-primary-bg)" : "transparent",
                            color: isLinked ? "var(--color-primary)" : "var(--color-text-primary)",
                            fontWeight: 600, fontSize: "0.88rem",
                          }}
                        >
                          {camp.name}{isLinked ? " ✓" : ""}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="popup-footer">
              <button className="primary-button" onClick={() => setShowCampaign(false)}>Listo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CharacterCard;
