import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import "./FeatureFormPopup.css";

const emptyEffect = {
  recharge: "",
  uses: { current: 0, max: 0 },
  modifiers: {
    ability_scores: {},
    ability_proficiencies: [],
    ac_bonus: 0,
    initiative_bonus: 0,
  },
  action: null,
  bonus_action: null,
  reaction: null,
};

const FeatureFormPopup = ({ feature, onSave, onClose }) => {
  const [name, setName] = useState(feature?.name || "");
  const [description, setDescription] = useState(feature?.description || "");
  const [effect, setEffect] = useState(feature?.effect || emptyEffect);

  const handleAddAction = (type) => {
    const actionTemplate = {
      attack: { damage: "", type: "", range: "" },
      heal: "",
      recharge: "",
      uses: { current: 0, max: 0 },
    };
    setEffect(prev => ({ ...prev, [type]: actionTemplate }));
  };

  const handleSave = () => {
    const newFeature = {
      id: feature?.id || Date.now(),
      name,
      description,
      effect,
    };
    onSave(newFeature);
  };

  // Renderizado simplificado de campos de efecto
  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Formulario de Feature">
      <div className="popup-content feature-popup" onClick={e => e.stopPropagation()}>
        <h3>{feature ? "Editar Feature" : "Nueva Feature"}</h3>
        <div className="form-group">
          <label>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="effect-section">
          <h4>Efecto</h4>
          {/* Opciones de recarga */}
          <div className="form-row">
            <label>Recarga</label>
            <select value={effect.recharge || ""} onChange={e => setEffect(prev => ({ ...prev, recharge: e.target.value }))}>
              <option value="">Ninguna</option>
              <option value="PerTurn">Por Turno</option>
              <option value="SR">Descanso Corto</option>
              <option value="LR">Descanso Largo</option>
            </select>
          </div>
          {/* Usos */}
          <div className="form-row">
            <label>Usos</label>
            <div className="uses-inputs">
              <input type="number" min="0" placeholder="Actual" value={effect.uses?.current || 0}
                onChange={e => setEffect(prev => ({ ...prev, uses: { ...prev.uses, current: parseInt(e.target.value) || 0 } }))} />
              <input type="number" min="0" placeholder="Máx" value={effect.uses?.max || 0}
                onChange={e => setEffect(prev => ({ ...prev, uses: { ...prev.uses, max: parseInt(e.target.value) || 0 } }))} />
            </div>
          </div>
          {/* Modificadores */}
          <div className="form-group">
            <label>Bonificador CA</label>
            <input type="number" value={effect.modifiers?.ac_bonus || 0}
              onChange={e => setEffect(prev => ({ ...prev, modifiers: { ...prev.modifiers, ac_bonus: parseInt(e.target.value) || 0 } }))} />
          </div>
          {/* Acciones, Bonus Actions, Reacciones */}
          <div className="form-row">
            <label>Agregar</label>
            <Button onClick={() => handleAddAction("action")}>Acción</Button>
            <Button onClick={() => handleAddAction("bonus_action")}>Bonus Action</Button>
            <Button onClick={() => handleAddAction("reaction")}>Reacción</Button>
          </div>
          {effect.action && <ActionForm type="action" data={effect.action} onChange={(data) => setEffect(prev => ({ ...prev, action: data }))} />}
          {effect.bonus_action && <ActionForm type="bonus_action" data={effect.bonus_action} onChange={(data) => setEffect(prev => ({ ...prev, bonus_action: data }))} />}
          {effect.reaction && <ActionForm type="reaction" data={effect.reaction} onChange={(data) => setEffect(prev => ({ ...prev, reaction: data }))} />}
        </div>
        <div className="popup-actions">
          <Button onClick={handleSave} ariaLabel="Guardar feature">Guardar</Button>
          <Button onClick={onClose} ariaLabel="Cancelar">Cancelar</Button>
        </div>
      </div>
    </div>
  );
};

// Subcomponente para configurar una acción individual
const ActionForm = ({ type, data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="action-form">
      <h5>{type === "action" ? "Acción" : type === "bonus_action" ? "Bonus Action" : "Reacción"}</h5>
      <div className="form-group">
        <label>Daño (ej. 2d6)</label>
        <input value={data.attack?.damage || ""} onChange={e => handleChange("attack", { ...data.attack, damage: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Tipo de daño</label>
        <input value={data.attack?.type || ""} onChange={e => handleChange("attack", { ...data.attack, type: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Curación (ej. 1d8+2)</label>
        <input value={data.heal || ""} onChange={e => handleChange("heal", e.target.value)} />
      </div>
      {/* se podría agregar más configuración */}
    </div>
  );
};

export default FeatureFormPopup;