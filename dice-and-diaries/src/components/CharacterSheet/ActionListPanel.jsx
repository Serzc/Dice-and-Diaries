import React, { useState, useEffect } from "react";
import ActionCard from "./ActionCard";
import ActionFormPopup from "./ActionFormPopup";
import Button from "../common/Button";
import "./ActionsPanel.css"; // mismo CSS

const ActionListPanel = ({ title, type, characterId, fetchData, onSave, restTrigger }) => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData(characterId).then(setItems);
  }, [characterId, fetchData]);

  // Recharge uses on rest
  useEffect(() => {
    if (!restTrigger?.type || !restTrigger.count) return;
    const restType = restTrigger.type;
    const targets = restType === "LR" ? ["PerTurn", "SR", "LR"] : restType === "SR" ? ["PerTurn", "SR"] : ["PerTurn"];
    setItems(prev => {
      const updated = prev.map(item => {
        if (!item.recharge || !targets.includes(item.recharge)) return item;
        if (item.uses) return { ...item, uses: { ...item.uses, current: item.uses.max } };
        return item;
      });
      const changed = updated.some((u, i) => u !== prev[i]);
      if (changed) onSave && onSave(updated);
      return updated;
    });
  }, [restTrigger?.count]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const updated = editingItem
      ? items.map(i => i.id === item.id ? item : i)
      : [...items, { ...item, id: item.id || Date.now() }];
    setItems(updated);
    setShowForm(false);
    setEditingItem(null);
    onSave && onSave(updated);
  };

  const handleDelete = (id) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onSave && onSave(updated);
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