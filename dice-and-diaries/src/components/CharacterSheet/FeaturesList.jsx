import React, { useState } from "react";
import { fetchFeatures } from "../../mock/db";
import FeatureCard from "./FeatureCard";
import FeatureFormPopup from "./FeatureFormPopup";
import Button from "../common/Button";
import "./FeaturesList.css";

const FeaturesList = ({ characterId, onSave, restTrigger }) => {
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

  // Respond to rest triggers from CombatInfoSection
  React.useEffect(() => {
    if (!restTrigger?.type || !restTrigger.count) return;
    const type = restTrigger.type;
    const targets = type === "LR" ? ["PerTurn", "SR", "LR"] : type === "SR" ? ["PerTurn", "SR"] : ["PerTurn"];
    setFeatures(prev => {
      const updated = prev.map(f => {
        const effect = f.effect;
        if (!effect) return f;
        const recharge = effect.recharge || effect.action?.recharge;
        if (!targets.includes(recharge)) return f;
        if (effect.uses) return { ...f, effect: { ...effect, uses: { ...effect.uses, current: effect.uses.max } } };
        if (effect.action?.uses) return { ...f, effect: { ...effect, action: { ...effect.action, uses: { ...effect.action.uses, current: effect.action.uses.max } } } };
        return f;
      });
      onSave && onSave(updated);
      return updated;
    });
  }, [restTrigger?.count]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <h3 id="features-heading">Cualidades</h3>
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
