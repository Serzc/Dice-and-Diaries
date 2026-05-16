import React, { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "../common/Popup.css";
import "./SpellFormPopup.css";

const defaultSpell = {
  name: "",
  description: "",
  level: 1,
  ritual: false,
  concentration: false,
  prepared: true,
  effect: { damage: "", type: "", range: "", components: "", duration: "" },
};

const SpellFormPopup = ({ spell, onSave, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [form, setForm] = useState(spell || defaultSpell);

  useEffect(() => {
    setForm(spell || defaultSpell);
  }, [spell]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleEffectChange = (field, value) =>
    setForm(prev => ({ ...prev, effect: { ...prev.effect, [field]: value } }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || Date.now() });
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
         aria-labelledby="spell-popup-title"
         onKeyDown={(e) => e.key === "Escape" && onClose()}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="popup-content spell-popup" ref={contentRef}>
        <div className="popup-header">
          <h2 id="spell-popup-title" className="popup-title">{spell ? "Editar Hechizo" : "Nuevo Hechizo"}</h2>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <div className="form-group">
            <label htmlFor="spell-name">Nombre</label>
            <input
              id="spell-name"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Nombre del hechizo..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="spell-level">Nivel</label>
              <select
                id="spell-level"
                value={form.level}
                onChange={e => handleChange("level", parseInt(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lv => (
                  <option key={lv} value={lv}>{lv === 0 ? "Truco (0)" : lv}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Propiedades</label>
              <div className="check-group" style={{ marginBottom: 0 }}>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.ritual} onChange={e => handleChange("ritual", e.target.checked)} />
                  Ritual
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.concentration} onChange={e => handleChange("concentration", e.target.checked)} />
                  Conc.
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.prepared} onChange={e => handleChange("prepared", e.target.checked)} />
                  Preparado
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="spell-desc">Descripción</label>
            <textarea
              id="spell-desc"
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Describe el hechizo..."
            />
          </div>

          <div className="effect-section">
            <h4>Efecto</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="spell-damage">Daño</label>
                <input
                  id="spell-damage"
                  value={form.effect.damage}
                  onChange={e => handleEffectChange("damage", e.target.value)}
                  placeholder="Ej: 2d6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="spell-type">Tipo</label>
                <input
                  id="spell-type"
                  value={form.effect.type}
                  onChange={e => handleEffectChange("type", e.target.value)}
                  placeholder="fuego, curación..."
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="spell-range">Alcance</label>
                <input
                  id="spell-range"
                  value={form.effect.range}
                  onChange={e => handleEffectChange("range", e.target.value)}
                  placeholder="60 pies..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="spell-components">Componentes</label>
                <input
                  id="spell-components"
                  value={form.effect.components}
                  onChange={e => handleEffectChange("components", e.target.value)}
                  placeholder="V, S, M..."
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="spell-duration">Duración</label>
              <input
                id="spell-duration"
                value={form.effect.duration}
                onChange={e => handleEffectChange("duration", e.target.value)}
                placeholder="Instantáneo, Concentración..."
              />
            </div>
          </div>
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

export default SpellFormPopup;
