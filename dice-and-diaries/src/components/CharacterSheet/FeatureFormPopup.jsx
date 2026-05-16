import React, { useState, useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import "../common/Popup.css";
import "./FeatureFormPopup.css";

const emptyEffect = {
  recharge: "",
  uses: { current: 0, max: 0 },
  modifiers: { ac_bonus: 0, initiative_bonus: 0 },
  action: null,
  bonus_action: null,
  reaction: null,
};

const ActionSubform = ({ type, data, onChange }) => {
  const label = type === "action" ? "Acción" : type === "bonus_action" ? "Acción de bonus" : "Reacción";
  return (
    <div className="action-subform">
      <h5>{label}</h5>
      <div className="form-row">
        <div className="form-group">
          <label>Daño (ej. 2d6)</label>
          <input
            value={data.attack?.damage || ""}
            onChange={e => onChange({ ...data, attack: { ...data.attack, damage: e.target.value } })}
          />
        </div>
        <div className="form-group">
          <label>Tipo de daño</label>
          <input
            value={data.attack?.type || ""}
            onChange={e => onChange({ ...data, attack: { ...data.attack, type: e.target.value } })}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Curación (ej. 1d8+2)</label>
        <input
          value={data.heal || ""}
          onChange={e => onChange({ ...data, heal: e.target.value })}
        />
      </div>
    </div>
  );
};

const FeatureFormPopup = ({ feature, onSave, onClose }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [name, setName] = useState(feature?.name || "");
  const [description, setDescription] = useState(feature?.description || "");
  const [effect, setEffect] = useState(feature?.effect || emptyEffect);

  useEffect(() => {
    setName(feature?.name || "");
    setDescription(feature?.description || "");
    setEffect(feature?.effect || emptyEffect);
  }, [feature]);

  const addActionType = (type) => {
    setEffect(prev => ({
      ...prev,
      [type]: { attack: { damage: "", type: "", range: "" }, heal: "" },
    }));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id: feature?.id || Date.now(), name, description, effect });
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
         aria-labelledby="feature-popup-title"
         onKeyDown={(e) => e.key === "Escape" && onClose()}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="popup-content feature-popup" ref={contentRef}>
        <div className="popup-header">
          <h2 id="feature-popup-title" className="popup-title">{feature ? "Editar Habilidad" : "Nueva Habilidad"}</h2>
          <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="popup-body">
          <div className="form-group">
            <label htmlFor="feat-name">Nombre</label>
            <input
              id="feat-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de la habilidad..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="feat-desc">Descripción</label>
            <textarea
              id="feat-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe la habilidad..."
            />
          </div>

          <div className="effect-section">
            <h4>Efecto</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="feat-recharge">Recarga</label>
                <select
                  id="feat-recharge"
                  value={effect.recharge || ""}
                  onChange={e => setEffect(prev => ({ ...prev, recharge: e.target.value }))}
                >
                  <option value="">Ninguna</option>
                  <option value="PerTurn">Por Turno</option>
                  <option value="SR">Descanso Corto</option>
                  <option value="LR">Descanso Largo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Usos (actual / máx.)</label>
                <div className="uses-inputs">
                  <input
                    type="number" min="0"
                    value={effect.uses?.current || 0}
                    onChange={e => setEffect(prev => ({ ...prev, uses: { ...prev.uses, current: parseInt(e.target.value) || 0 } }))}
                    aria-label="Usos actuales"
                  />
                  <span>/</span>
                  <input
                    type="number" min="0"
                    value={effect.uses?.max || 0}
                    onChange={e => setEffect(prev => ({ ...prev, uses: { ...prev.uses, max: parseInt(e.target.value) || 0 } }))}
                    aria-label="Usos máximos"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="feat-ac">Bonificador CA</label>
              <input
                id="feat-ac"
                type="number"
                value={effect.modifiers?.ac_bonus || 0}
                onChange={e => setEffect(prev => ({ ...prev, modifiers: { ...prev.modifiers, ac_bonus: parseInt(e.target.value) || 0 } }))}
              />
            </div>

            {/* Add action/bonus/reaction */}
            <div className="feat-action-buttons">
              {!effect.action && (
                <button className="popup-select-btn feat-add-btn" onClick={() => addActionType("action")}>
                  + Acción
                </button>
              )}
              {!effect.bonus_action && (
                <button className="popup-select-btn feat-add-btn" onClick={() => addActionType("bonus_action")}>
                  + Bonus
                </button>
              )}
              {!effect.reaction && (
                <button className="popup-select-btn feat-add-btn" onClick={() => addActionType("reaction")}>
                  + Reacción
                </button>
              )}
            </div>

            {effect.action && (
              <ActionSubform type="action" data={effect.action}
                onChange={data => setEffect(prev => ({ ...prev, action: data }))} />
            )}
            {effect.bonus_action && (
              <ActionSubform type="bonus_action" data={effect.bonus_action}
                onChange={data => setEffect(prev => ({ ...prev, bonus_action: data }))} />
            )}
            {effect.reaction && (
              <ActionSubform type="reaction" data={effect.reaction}
                onChange={data => setEffect(prev => ({ ...prev, reaction: data }))} />
            )}
          </div>
        </div>

        <div className="popup-footer">
          <button className="primary-button" onClick={handleSave} disabled={!name.trim()}>
            Guardar
          </button>
          <button className="primary-button" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default FeatureFormPopup;
