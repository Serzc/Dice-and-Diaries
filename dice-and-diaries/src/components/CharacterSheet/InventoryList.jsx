import React, { useState, useEffect } from "react";
import { fetchInventory } from "../../mock/db";
import ItemCard from "./ItemCard";
import ItemFormPopup from "./ItemFormPopup";
import Button from "../common/Button";
import "./InventoryList.css";

const InventoryList = ({ characterId, onSave }) => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchInventory(characterId).then(setItems);
  }, [characterId]);

  const handleToggleEquip = (id) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, equipped: !item.equipped } : item
      );
      onSave && onSave(updated);
      return updated;
    });
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
    <section className="inventory-panel" aria-labelledby="inventory-heading">
      <div className="panel-header">
        <h3 id="inventory-heading">Inventario</h3>
        <Button onClick={openCreate} ariaLabel="Agregar objeto">+</Button>
      </div>
      <div className="items-list">
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item.id)}
            onToggleEquip={handleToggleEquip}
          />
        ))}
        {items.length === 0 && <p className="empty-message">Sin objetos.</p>}
      </div>
      {showForm && (
        <ItemFormPopup
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
    </section>
  );
};

export default InventoryList;