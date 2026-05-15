import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import "./ActionFormPopup.css";

const defaultAction = {
  name: "",
  description: "",
  recharge: "PerTurn",
  uses: { current: 1, max: 1 },
};

const ActionFormPopup = ({ action, onSave, onClose }) => {
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
    // Validación simple
    if (!form.name.trim()) return;
    onSave({
      ...form,
      id: form.id || Date.now(),
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Formulario de acción">
      <div className="popup-content action-popup" onClick={e => e.stopPropagation()}>
        <h3>{action ? "Editar acción" : "Nueva acción"}</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input value={form.name} onChange={e => handleChange("name", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} rows={3} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Recarga</label>
            <select value={form.recharge} onChange={e => handleChange("recharge", e.target.value)}>
              <option value="PerTurn">Por turno</option>
              <option value="SR">Descanso corto</option>
              <option value="LR">Descanso largo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Usos</label>
            <div className="uses-inputs">
              <input
                type="number" min="0" placeholder="Actual"
                value={form.uses.current}
                onChange={e => handleUsesChange("current", e.target.value)}
              />
              <span>/</span>
              <input
                type="number" min="0" placeholder="Máx"
                value={form.uses.max}
                onChange={e => handleUsesChange("max", e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="popup-actions">
          <Button onClick={handleSave} ariaLabel="Guardar acción">Guardar</Button>
          <Button onClick={onClose} ariaLabel="Cancelar">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

export default ActionFormPopup;