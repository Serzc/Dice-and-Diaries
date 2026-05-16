import React, { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "../common/Popup.css";
import "./ActionFormPopup.css";

const defaultAction = {
  name: "",
  description: "",
  recharge: "PerTurn",
  uses: { current: 1, max: 1 },
};

const ActionFormPopup = ({ action, onSave, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [form, setForm] = useState(action || defaultAction);

  useEffect(() => {
    setForm(action || defaultAction);
  }, [action]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUsesChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      uses: { ...prev.uses, [field]: parseInt(value) || 0 },
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, id: form.id || Date.now() });
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
         aria-labelledby="action-popup-title"
         onKeyDown={(e) => e.key === "Escape" && onClose()}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="popup-content action-popup" ref={contentRef}>
        <div className="popup-header">
          <h2 id="action-popup-title" className="popup-title">{action ? "Editar Acción" : "Nueva Acción"}</h2>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <div className="form-group">
            <label htmlFor="action-name">Nombre</label>
            <input
              id="action-name"
              value={form.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="Nombre de la acción..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="action-desc">Descripción</label>
            <textarea
              id="action-desc"
              value={form.description}
              onChange={e => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Describe el efecto..."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="action-recharge">Recarga</label>
              <select
                id="action-recharge"
                value={form.recharge}
                onChange={e => handleChange("recharge", e.target.value)}
              >
                <option value="PerTurn">Por turno</option>
                <option value="SR">Descanso corto</option>
                <option value="LR">Descanso largo</option>
              </select>
            </div>
            <div className="form-group">
              <label>Usos (actual / máx.)</label>
              <div className="uses-inputs">
                <input
                  type="number" min="0"
                  value={form.uses.current}
                  onChange={e => handleUsesChange("current", e.target.value)}
                  aria-label="Usos actuales"
                />
                <span>/</span>
                <input
                  type="number" min="0"
                  value={form.uses.max}
                  onChange={e => handleUsesChange("max", e.target.value)}
                  aria-label="Usos máximos"
                />
              </div>
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

export default ActionFormPopup;
