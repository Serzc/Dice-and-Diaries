import React, { useState, useEffect } from "react";
import { fetchOtherProficiencies } from "../../mock/db";
import Button from "../common/Button";
import "./OtherProficienciesPanel.css";

const OtherProficienciesPanel = ({ characterId, onSave }) => {
  const [proficiencies, setProficiencies] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState("");
  const [newEntry, setNewEntry] = useState("");

  useEffect(() => {
    fetchOtherProficiencies(characterId).then(setProficiencies);
  }, [characterId]);

  const handleAdd = () => {
    if (newEntry.trim()) {
      const updated = [...proficiencies, newEntry.trim()];
      setProficiencies(updated);
      setNewEntry("");
      onSave && onSave(updated);
    }
  };

  const handleDelete = (index) => {
    const updated = proficiencies.filter((_, i) => i !== index);
    setProficiencies(updated);
    onSave && onSave(updated);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditText(proficiencies[index]);
  };

  const saveEdit = () => {
    const updated = [...proficiencies];
    updated[editingIndex] = editText.trim();
    setProficiencies(updated);
    setEditingIndex(-1);
    onSave && onSave(updated);
  };

  return (
    <section className="other-proficiencies-panel" aria-labelledby="other-profs-heading">
      <h3 id="other-profs-heading">Otras competencias</h3>
      <ul className="proficiencies-text-list">
        {proficiencies.map((prof, idx) => (
          <li key={idx} className="prof-entry">
            {editingIndex === idx ? (
              <div className="edit-row">
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyPress={e => e.key === "Enter" && saveEdit()}
                  autoFocus
                />
                <Button onClick={saveEdit} ariaLabel="Guardar">✓</Button>
              </div>
            ) : (
              <div className="view-row">
                <span>{prof}</span>
                <div className="prof-actions">
                  <Button onClick={() => startEdit(idx)} ariaLabel="Editar">✎</Button>
                  <Button onClick={() => handleDelete(idx)} ariaLabel="Eliminar">🗑</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="add-prof-row">
        <input
          placeholder="Nueva competencia"
          value={newEntry}
          onChange={e => setNewEntry(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} ariaLabel="Agregar competencia">+</Button>
      </div>
    </section>
  );
};

export default OtherProficienciesPanel;