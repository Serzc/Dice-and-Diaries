// src/components/Creatures/CreateCreaturePopup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCreature, createFolder } from "../../mock/db";
import "../../components/common/Popup.css";
import "./CreateCreaturePopup.css";

const SIZES = ["Diminuto", "Pequeño", "Mediano", "Grande", "Enorme", "Gargantuesco"];

const ABILITY_KEYS = [
  { key: "str", label: "FUE" },
  { key: "dex", label: "DES" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "SAB" },
  { key: "cha", label: "CAR" },
];

const defaultForm = {
  name: "",
  size: "Mediano",
  creatureType: "",
  alignment: "No alineado",
  cr: "1",
  ac: 10,
  acNote: "",
  hpMax: 10,
  hpFormula: "2d8",
  speed: "9 m",
  str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
};

function calcMod(score) {
  const m = Math.floor((Number(score) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const CreateCreaturePopup = ({ onClose, onFolderCreated, currentFolderId }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("choose");
  const [form, setForm] = useState(defaultForm);
  const [folderName, setFolderName] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleCreateCreature = async (e) => {
    e.preventDefault();
    setSaving(true);
    const newCreature = await createCreature({
      name: form.name.trim() || "Nueva Criatura",
      size: form.size,
      creatureType: form.creatureType.trim(),
      alignment: form.alignment.trim(),
      cr: form.cr.trim(),
      ac: Number(form.ac),
      acNote: form.acNote.trim(),
      hp: { current: Number(form.hpMax), max: Number(form.hpMax), formula: form.hpFormula.trim() },
      speed: form.speed.trim(),
      abilityScores: {
        str: Number(form.str), dex: Number(form.dex), con: Number(form.con),
        int: Number(form.int), wis: Number(form.wis), cha: Number(form.cha),
      },
      folderId: currentFolderId || null,
    });
    setSaving(false);
    onClose();
    navigate(`/creatures/${newCreature.id}`);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setSaving(true);
    const newFolder = await createFolder(folderName.trim(), currentFolderId || null);
    setSaving(false);
    onFolderCreated && onFolderCreated(newFolder);
    onClose();
  };

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="popup-content"
        style={{ maxWidth: step === "creature" ? "580px" : "360px" }}
      >
        {/* ── Elegir tipo ── */}
        {step === "choose" && (
          <>
            <div className="popup-header">
              <h2 className="popup-title">Crear nuevo</h2>
              <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
            </div>
            <div className="popup-body cc-choose-body">
              <button className="popup-select-btn" onClick={() => setStep("creature")}>
                Nueva Criatura
              </button>
              <button className="popup-select-btn" onClick={() => setStep("folder")}>
                Nueva Carpeta
              </button>
            </div>
          </>
        )}

        {/* ── Formulario criatura ── */}
        {step === "creature" && (
          <form onSubmit={handleCreateCreature}>
            <div className="popup-header">
              <h2 className="popup-title">Nueva Criatura</h2>
              <button type="button" className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
            </div>
            <div className="popup-body">
              {/* Nombre + Tamaño */}
              <div className="form-row" style={{ gridTemplateColumns: "2fr 1fr" }}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Nombre de la criatura"
                    autoFocus
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tamaño</label>
                  <select value={form.size} onChange={(e) => set("size", e.target.value)}>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Tipo + Alineamiento + CR */}
              <div className="form-row" style={{ gridTemplateColumns: "2fr 2fr 1fr" }}>
                <div className="form-group">
                  <label>Tipo</label>
                  <input
                    type="text"
                    value={form.creatureType}
                    onChange={(e) => set("creatureType", e.target.value)}
                    placeholder="Bestia, Humanoide..."
                  />
                </div>
                <div className="form-group">
                  <label>Alineamiento</label>
                  <input
                    type="text"
                    value={form.alignment}
                    onChange={(e) => set("alignment", e.target.value)}
                    placeholder="Legal Bueno..."
                  />
                </div>
                <div className="form-group">
                  <label>CR</label>
                  <input
                    type="text"
                    value={form.cr}
                    onChange={(e) => set("cr", e.target.value)}
                    placeholder="1/4"
                  />
                </div>
              </div>

              {/* CA + Nota CA */}
              <div className="form-row" style={{ gridTemplateColumns: "1fr 2fr" }}>
                <div className="form-group">
                  <label>CA</label>
                  <input
                    type="number"
                    value={form.ac}
                    min={1} max={30}
                    onChange={(e) => set("ac", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Nota de CA</label>
                  <input
                    type="text"
                    value={form.acNote}
                    onChange={(e) => set("acNote", e.target.value)}
                    placeholder="armadura natural..."
                  />
                </div>
              </div>

              {/* PV + Fórmula + Velocidad */}
              <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div className="form-group">
                  <label>PV máx</label>
                  <input
                    type="number"
                    value={form.hpMax}
                    min={1}
                    onChange={(e) => set("hpMax", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Fórmula PV</label>
                  <input
                    type="text"
                    value={form.hpFormula}
                    onChange={(e) => set("hpFormula", e.target.value)}
                    placeholder="2d8+4"
                  />
                </div>
                <div className="form-group">
                  <label>Velocidad</label>
                  <input
                    type="text"
                    value={form.speed}
                    onChange={(e) => set("speed", e.target.value)}
                    placeholder="9 m"
                  />
                </div>
              </div>

              {/* Características */}
              <div className="form-group">
                <label>Características</label>
                <div className="cc-abilities-grid">
                  {ABILITY_KEYS.map(({ key, label }) => (
                    <div key={key} className="cc-ability-cell">
                      <span className="cc-ability-label">{label}</span>
                      <input
                        type="number"
                        className="cc-ability-input"
                        value={form[key]}
                        min={1} max={30}
                        onChange={(e) => set(key, e.target.value)}
                      />
                      <span className="cc-ability-mod">{calcMod(form[key])}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Creando..." : "Crear Criatura"}
              </button>
              <button type="button" className="primary-button" onClick={() => setStep("choose")}>
                Atrás
              </button>
            </div>
          </form>
        )}

        {/* ── Formulario carpeta ── */}
        {step === "folder" && (
          <form onSubmit={handleCreateFolder}>
            <div className="popup-header">
              <h2 className="popup-title">Nueva Carpeta</h2>
              <button type="button" className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label>Nombre de la carpeta</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Ej: Humanoides, Jefes..."
                  autoFocus
                  required
                />
              </div>
            </div>
            <div className="popup-footer">
              <button
                type="submit"
                className="primary-button"
                disabled={saving || !folderName.trim()}
              >
                {saving ? "Creando..." : "Crear Carpeta"}
              </button>
              <button type="button" className="primary-button" onClick={() => setStep("choose")}>
                Atrás
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateCreaturePopup;
