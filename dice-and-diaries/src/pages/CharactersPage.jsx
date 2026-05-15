import React, { useEffect, useState } from "react";
import { fetchUserCharacters } from "../mock/charactersMock";
import CharacterCard from "../components/Characters/CharacterCard";
import CreateCharacterPopup from "../components/Characters/CreateCharacterPopup";
import Button from "../components/common/Button";
import "./CharactersPage.css";

const CharactersPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchUserCharacters().then((data) => {
      setCharacters(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading">Cargando personajes...</div>;

  return (
    <main className="characters-page" aria-labelledby="characters-heading">
      <h1 id="characters-heading" className="page-title">
        Mis Personajes
      </h1>

      {characters.length === 0 ? (
        <p className="empty-message">Aún no has creado ningún personaje.</p>
      ) : (
        <div className="character-list" role="list">
          {characters.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      )}

      {/* Botón flotante para crear personaje */}
      <button
        className="fab-create"
        aria-label="Crear nuevo personaje"
        title="Crear personaje"
        onClick={() => setShowCreate(true)}
      >
        +
      </button>

      {showCreate && (
        <CreateCharacterPopup onClose={() => setShowCreate(false)} />
      )}
    </main>
  );
};

export default CharactersPage;