import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import "./ItemFormPopup.css";

const defaultItem = {
  name: "",
  weight: 0,
  quantity: 1,
  description: "",
  equipable: false,
  equipped: false,
  effect: null,
};

const ItemFormPopup = ({ item, onSave, onClose }) => {
  const [form, setForm] = useState(item || defaultItem);
  const [hasEffect, setHasEffect] = useState(!!item?.effect);

  useEffect(() => {
    setForm(item || defaultItem);
    setHasEffect(!!item?.effect);
  }, [item]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEffectChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      effect: { ...prev.effect, [field]: value },
    }));
  };

  const toggleEffect = () => {
    if (hasEffect) {
      setForm(prev => ({ ...prev, effect: null }));
      setHasEffect(false);
    } else {
      setForm(prev => ({
        ...prev,
        effect: { damage: "", type: "", ac_bonus: 0, heal: "" },
      }));
      setHasEffect(true);
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || Date.now() });
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Formulario de objeto">
      <div className="popup-content item-popup" onClick={e => e.stopPropagation()}>
        <h3>{item ? "Editar objeto" : "Nuevo objeto"}</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input value={form.name} onChange={e => handleChange("name", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Peso (lb)</label>
            <input
              type="number" step="0.1"
              value={form.weight}
              onChange={e => handleChange("weight", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="form-group">
            <label>Cantidad</label>
            <input
              type="number" min="1"
              value={form.quantity}
              onChange={e => handleChange("quantity", parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Descripción (opcional)</label>
          <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={2} />
        </div>
        <div className="form-row check-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={form.equipable} onChange={e => handleChange("equipable", e.target.checked)} />
            Equipable
          </label>
          {form.equipable && (
            <label className="checkbox-label">
              <input type="checkbox" checked={form.equipped} onChange={e => handleChange("equipped", e.target.checked)} />
              Equipado
            </label>
          )}
        </div>
        <div className="effect-toggle">
          <Button onClick={toggleEffect} ariaLabel={hasEffect ? "Quitar efecto" : "Añadir efecto"}>
            {hasEffect ? "Quitar efecto" : "Añadir efecto"}
          </Button>
        </div>
        {hasEffect && (
          <div className="effect-section">
            <div className="form-row">
              <div className="form-group">
                <label>Daño</label>
                <input value={form.effect.damage || ""} onChange={e => handleEffectChange("damage", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <input value={form.effect.type || ""} onChange={e => handleEffectChange("type", e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Bono CA</label>
              <input type="number" value={form.effect.ac_bonus || 0} onChange={e => handleEffectChange("ac_bonus", parseInt(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label>Curación</label>
              <input value={form.effect.heal || ""} onChange={e => handleEffectChange("heal", e.target.value)} placeholder="Ej. 2d4+2" />
            </div>
          </div>
        )}
        <div className="popup-actions">
          <Button onClick={handleSave} ariaLabel="Guardar objeto">Guardar</Button>
          <Button onClick={onClose} ariaLabel="Cancelar">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

export default ItemFormPopup;