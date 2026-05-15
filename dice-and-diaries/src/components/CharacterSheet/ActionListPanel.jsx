import React, { useState, useEffect } from "react";
import ActionCard from "./ActionCard";
import ActionFormPopup from "./ActionFormPopup";
import Button from "../common/Button";
import "./ActionsPanel.css"; // mismo CSS

const ActionListPanel = ({ title, type, characterId, fetchData, onSave }) => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData(characterId).then(setItems);
  }, [characterId, fetchData]);

  const handleUse = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        uses: { ...item.uses, current: Math.max(0, item.uses.current - 1) }
      };
    }));
    // Aquí se podría propagar al guardado
  };

  const handleSaveItem = (item) => {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setItems(prev => [...prev, item]);
    }
    setShowForm(false);
    setEditingItem(null);
    // Notificar al padre para persistir
    onSave && onSave(items);
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const openCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  return (
    <section className="action-list-panel" aria-labelledby={`${type}-heading`}>
      <h3 id={`${type}-heading`}>{title}</h3>
      <div className="items-list">
        {items.map(item => (
          <ActionCard
            key={item.id}
            action={item}
            onUse={() => handleUse(item.id)}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>
      <div className="add-item-btn">
        <Button onClick={openCreate} ariaLabel={`Agregar ${title.toLowerCase()}`}>+</Button>
      </div>
      {showForm && (
        <ActionFormPopup
          action={editingItem}
          onSave={handleSaveItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
    </section>
  );
};

export default ActionListPanel;