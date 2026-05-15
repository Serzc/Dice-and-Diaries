import React, { useState } from "react";
import { fetchFeatures } from "../../mock/characterSheetMock";
import FeatureCard from "./FeatureCard";
import FeatureFormPopup from "./FeatureFormPopup";
import Button from "../common/Button";
import "./FeaturesList.css";

const FeaturesList = ({ characterId }) => {
  const [features, setFeatures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  // Cargar features al montar (simulado)
  React.useEffect(() => {
    fetchFeatures(characterId).then(setFeatures);
  }, [characterId]);

  const handleRecarga = (type) => {
    // Actualiza usos de features según tipo de descanso
    setFeatures(prev => prev.map(f => {
      const effect = f.effect;
      if (!effect) return f;
      // Recargar si el periodo coincide
      const rechargeTarget = type === "turn" ? "PerTurn" : type === "SR" ? "SR" : "LR";
      if (effect.recharge === rechargeTarget || effect.action?.recharge === rechargeTarget) {
        // Resetear usos a máximo
        if (effect.uses) return { ...f, effect: { ...effect, uses: { ...effect.uses, current: effect.uses.max } } };
        if (effect.action?.uses) {
          return { ...f, effect: { ...effect, action: { ...effect.action, uses: { ...effect.action.uses, current: effect.action.uses.max } } } };
        }
      }
      return f;
    }));
  };

  const handleUseFeature = (id) => {
    setFeatures(prev => prev.map(f => {
      if (f.id !== id) return f;
      // Decrementar usos si tiene
      const effect = f.effect;
      let updated = f;
      if (effect.uses && effect.uses.current > 0) {
        updated = { ...f, effect: { ...effect, uses: { ...effect.uses, current: effect.uses.current - 1 } } };
      } else if (effect.action?.uses && effect.action.uses.current > 0) {
        updated = { ...f, effect: { ...effect, action: { ...effect.action, uses: { ...effect.action.uses, current: effect.action.uses.current - 1 } } } };
      }
      return updated;
    }));
  };

  const handleSaveFeature = (featureData) => {
    if (editingFeature) {
      setFeatures(prev => prev.map(f => f.id === featureData.id ? featureData : f));
    } else {
      setFeatures(prev => [...prev, { ...featureData, id: Date.now() }]);
    }
    setShowForm(false);
    setEditingFeature(null);
  };

  const handleDeleteFeature = (id) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  };

  const openCreateForm = () => {
    setEditingFeature(null);
    setShowForm(true);
  };

  const openEditForm = (feature) => {
    setEditingFeature(feature);
    setShowForm(true);
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
            onEdit={() => openEditForm(f)}
            onDelete={() => handleDeleteFeature(f.id)}
            onUse={() => handleUseFeature(f.id)}
          />
        ))}
      </div>
      <div className="add-feature-btn">
        <Button onClick={openCreateForm} ariaLabel="Agregar nueva feature">+</Button>
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