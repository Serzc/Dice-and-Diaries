import React, { useState, useEffect } from "react";
import "../common/Popup.css";
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

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleEffectChange = (field, value) =>
    setForm(prev => ({ ...prev, effect: { ...prev.effect, [field]: value } }));

  const toggleEffect = () => {
    if (hasEffect) {
      setForm(prev => ({ ...prev, effect: null }));
      setHasEffect(false);
    } else {
      setForm(prev => ({ ...prev, effect: { damage: "", type: "", ac_bonus: 0, heal: "" } }));
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
        <div className="popup-header">
          <h3 className="popup-title">{item ? "Editar Objeto" : "Nuevo Objeto"}</h3>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <div className="form-group">
            <label htmlFor="item-name">Nombre</label>
            <input
              id="item-name"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Nombre del objeto..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="item-weight">Peso (lb)</label>
              <input
                id="item-weight"
                type="number" step="0.1"
                value={form.weight}
                onChange={e => handleChange("weight", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-qty">Cantidad</label>
              <input
                id="item-qty"
                type="number" min="1"
                value={form.quantity}
                onChange={e => handleChange("quantity", parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="item-desc">Descripción (opcional)</label>
            <textarea
              id="item-desc"
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={2}
              placeholder="Finesse, light..."
            />
          </div>

          <div className="check-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.equipable}
                onChange={e => handleChange("equipable", e.target.checked)}
              />
              Equipable
            </label>
            {form.equipable && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.equipped}
                  onChange={e => handleChange("equipped", e.target.checked)}
                />
                Equipado
              </label>
            )}
          </div>

          <div className="effect-toggle">
            <button className="popup-select-btn" onClick={toggleEffect} style={{ width: "auto", padding: "0.35rem 0.85rem", fontSize: "0.82rem" }}>
              {hasEffect ? "Quitar efecto" : "+ Añadir efecto"}
            </button>
          </div>

          {hasEffect && (
            <div className="effect-section">
              <h4>Efecto</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="item-damage">Daño</label>
                  <input
                    id="item-damage"
                    value={form.effect?.damage || ""}
                    onChange={e => handleEffectChange("damage", e.target.value)}
                    placeholder="1d8"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="item-dmg-type">Tipo</label>
                  <input
                    id="item-dmg-type"
                    value={form.effect?.type || ""}
                    onChange={e => handleEffectChange("type", e.target.value)}
                    placeholder="cortante..."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="item-ac">Bono CA</label>
                  <input
                    id="item-ac"
                    type="number"
                    value={form.effect?.ac_bonus || 0}
                    onChange={e => handleEffectChange("ac_bonus", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="item-heal">Curación</label>
                  <input
                    id="item-heal"
                    value={form.effect?.heal || ""}
                    onChange={e => handleEffectChange("heal", e.target.value)}
                    placeholder="2d4+2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={handleSave} disabled={!form.name.trim()}>
            Guardar
          </button>
          <button className="primary-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ItemFormPopup;
