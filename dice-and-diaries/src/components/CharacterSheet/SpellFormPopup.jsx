import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import "./SpellFormPopup.css";

const defaultSpell = {
  name: "",
  description: "",
  level: 1,
  ritual: false,
  concentration: false,
  prepared: true,
  effect: {
    damage: "",
    type: "",
    range: "",
    components: "",
    duration: "",
  },
};

const SpellFormPopup = ({ spell, onSave, onClose }) => {
  const [form, setForm] = useState(spell || defaultSpell);

  useEffect(() => {
    setForm(spell || defaultSpell);
  }, [spell]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEffectChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      effect: { ...prev.effect, [field]: value },
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      id: form.id || Date.now(),
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Formulario de hechizo">
      <div className="popup-content spell-popup" onClick={e => e.stopPropagation()}>
        <h3>{spell ? "Editar hechizo" : "Nuevo hechizo"}</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input value={form.name} onChange={e => handleChange("name", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Nivel</label>
            <select value={form.level} onChange={e => handleChange("level", parseInt(e.target.value))}>
              {[0,1,2,3,4,5,6,7,8,9].map(lv => (
                <option key={lv} value={lv}>{lv === 0 ? "Truco" : lv}</option>
              ))}
            </select>
          </div>
          <div className="form-group check-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={form.ritual} onChange={e => handleChange("ritual", e.target.checked)} />
              Ritual
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.concentration} onChange={e => handleChange("concentration", e.target.checked)} />
              Concentración
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.prepared} onChange={e => handleChange("prepared", e.target.checked)} />
              Preparado
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} />
        </div>
        <div className="effect-section">
          <h4>Efecto</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Daño</label>
              <input value={form.effect.damage} onChange={e => handleEffectChange("damage", e.target.value)} placeholder="Ej: 2d6" />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <input value={form.effect.type} onChange={e => handleEffectChange("type", e.target.value)} placeholder="fuego, curación..." />
            </div>
          </div>
          <div className="form-group">
            <label>Alcance</label>
            <input value={form.effect.range} onChange={e => handleEffectChange("range", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Componentes</label>
            <input value={form.effect.components} onChange={e => handleEffectChange("components", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Duración</label>
            <input value={form.effect.duration} onChange={e => handleEffectChange("duration", e.target.value)} />
          </div>
          {/* Se puede extender con salvación, área, etc. */}
        </div>
        <div className="popup-actions">
          <Button onClick={handleSave} ariaLabel="Guardar hechizo">Guardar</Button>
          <Button onClick={onClose} ariaLabel="Cancelar">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

export default SpellFormPopup;