import React, { useState } from "react";
import { fetchFeatures } from "../../mock/db";
import FeatureCard from "./FeatureCard";
import FeatureFormPopup from "./FeatureFormPopup";
import Button from "../common/Button";
import "./FeaturesList.css";

const FeaturesList = ({ characterId, onSave }) => {
  const [features, setFeatures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  React.useEffect(() => {
    fetchFeatures(characterId).then(setFeatures);
  }, [characterId]);

  const persist = (updated) => {
    setFeatures(updated);
    onSave && onSave(updated);
  };

  const handleRecarga = (type) => {
    const rechargeTarget = type === "turn" ? "PerTurn" : type === "SR" ? "SR" : "LR";
    const updated = features.map(f => {
      const effect = f.effect;
      if (!effect) return f;
      if (effect.recharge === rechargeTarget || effect.action?.recharge === rechargeTarget) {
        if (effect.uses) return { ...f, effect: { ...effect, uses: { ...effect.uses, current: effect.uses.max } } };
        if (effect.action?.uses) return { ...f, effect: { ...effect, action: { ...effect.action, uses: { ...effect.action.uses, current: effect.action.uses.max } } } };
      }
      return f;
    });
    persist(updated);
  };

  const handleUseFeature = (id) => {
    const updated = features.map(f => {
      if (f.id !== id) return f;
      const effect = f.effect;
      if (effect?.uses && effect.uses.current > 0) {
        return { ...f, effect: { ...effect, uses: { ...effect.uses, current: effect.uses.current - 1 } } };
      }
      if (effect?.action?.uses && effect.action.uses.current > 0) {
        return { ...f, effect: { ...effect, action: { ...effect.action, uses: { ...effect.action.uses, current: effect.action.uses.current - 1 } } } };
      }
      return f;
    });
    persist(updated);
  };

  const handleSaveFeature = (featureData) => {
    const updated = editingFeature
      ? features.map(f => f.id === featureData.id ? featureData : f)
      : [...features, { ...featureData, id: featureData.id || Date.now() }];
    setShowForm(false);
    setEditingFeature(null);
    persist(updated);
  };

  const handleDeleteFeature = (id) => {
    persist(features.filter(f => f.id !== id));
  };

  return (
    <section className="features-section" aria-labelledby="features-heading">
      <h3 id="features-heading">Features</h3>
      <div className="recarga-buttons">
        <Button onClick={() => handleRecarga("turn")} ariaLabel="Recargar turno">Turno</Button>
        <Button onClick={() => handleRecarga("SR")} ariaLabel="Descanso Corto">Descanso Corto</Button>
        <Button onClick={() => handleRecarga("LR")} ariaLabel="Descanso Largo">Descanso Largo</Button>
      </div>
      <div className="features-list">
        {features.map(f => (
          <FeatureCard
            key={f.id}
            feature={f}
            onEdit={() => { setEditingFeature(f); setShowForm(true); }}
            onDelete={() => handleDeleteFeature(f.id)}
            onUse={() => handleUseFeature(f.id)}
          />
        ))}
      </div>
      <div className="add-feature-btn">
        <Button onClick={() => { setEditingFeature(null); setShowForm(true); }} ariaLabel="Agregar nueva feature">+</Button>
      </div>
      {showForm && (
        <FeatureFormPopup
          feature={editingFeature}
          onSave={handleSaveFeature}
          onClose={() => { setShowForm(false); setEditingFeature(null); }}
        />
      )}
    </section>
  );
};

export default FeaturesList;
