import React, { useState, useEffect } from "react";
import { fetchCharacterNote } from "../../mock/characterSheetMock";
import Button from "../common/Button";
import "./StoryPanel.css";

const StoryPanel = ({ characterId, onSave }) => {
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchCharacterNote(characterId).then(data => {
      setNote(data);
      setContent(data.content);
    });
  }, [characterId]);

  const handleSave = () => {
    if (note) {
      const updatedNote = { ...note, content };
      onSave && onSave(updatedNote);
      setNote(updatedNote);
    }
  };

  if (!note) return <div className="loading">Cargando historia...</div>;

  return (
    <section className="story-panel" aria-labelledby="story-heading">
      <h3 id="story-heading">Historia</h3>
      <textarea
        className="story-textarea"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        aria-label="Historia del personaje"
      />
      <div className="story-actions">
        <Button onClick={handleSave}>Guardar historia</Button>
      </div>
    </section>
  );
};

export default StoryPanel;