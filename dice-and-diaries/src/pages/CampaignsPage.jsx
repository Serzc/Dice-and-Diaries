import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCampaigns, getCurrentUserId, createCampaign, toggleCampaignActive, deleteCampaign } from "../mock/db";
import { useFocusTrap } from "../hooks/useFocusTrap";
import CampaignCard from "../components/Campaigns/CampaignCard";
import CampaignNotesPopup from "../components/Campaigns/CampaignNotesPopup";
import "../components/common/Popup.css";
import "./CampaignsPage.css";

const CreateCampaignModal = ({ onClose, onCreated }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const camp = await createCampaign({ name: name.trim(), description: description.trim() });
    setSaving(false);
    setInviteCode(camp.inviteCode);
    onCreated(camp);
  };

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true"
      aria-labelledby="create-campaign-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="popup-content" style={{ maxWidth: "440px" }} ref={contentRef}>
        {inviteCode ? (
          <>
            <div className="popup-header">
              <h2 id="create-campaign-title" className="popup-title">¡Campaña creada!</h2>
              <button className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
            </div>
            <div className="popup-body">
              <p>Comparte este código con tus jugadores para que se unan:</p>
              <p className="cc-invite-code">{inviteCode}</p>
            </div>
            <div className="popup-footer">
              <button className="primary-button" onClick={onClose}>Listo</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="popup-header">
              <h2 id="create-campaign-title" className="popup-title">Nueva Campaña</h2>
              <button type="button" className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre de la campaña..." autoFocus required />
              </div>
              <div className="form-group">
                <label>Descripción (opcional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={3} placeholder="Breve descripción..." />
              </div>
            </div>
            <div className="popup-footer">
              <button type="submit" className="primary-button" disabled={saving || !name.trim()}>
                {saving ? "Creando..." : "Crear campaña"}
              </button>
              <button type="button" className="primary-button" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [notesTarget, setNotesTarget] = useState(null);
  const currentUserId = getCurrentUserId();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCampaigns(currentUserId);
        data.sort((a, b) => b.id - a.id);
        setCampaigns(data);
      } catch (error) {
        console.error("Error al cargar campañas", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreated = (camp) => {
    setCampaigns((prev) => [camp, ...prev]);
  };

  const handleStartSession = async (campaignId) => {
    try {
      const updated = await toggleCampaignActive(campaignId);
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (e) { /* ignore */ }
    navigate(`/campaigns/${campaignId}/chat`);
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm("¿Eliminar esta campaña? Esta acción no se puede deshacer.")) return;
    await deleteCampaign(campaignId);
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  };

  if (loading) {
    return <div className="loading">Cargando campañas...</div>;
  }

  return (
    <main className="campaigns-page" aria-labelledby="campaigns-page-heading">
      <h1 id="campaigns-page-heading" className="page-title">
        Mis Campañas
      </h1>
      {campaigns.length === 0 ? (
        <p className="empty-message">No tienes campañas activas. ¡Crea una o únete a una!</p>
      ) : (
        <div className="campaign-list" role="list">
          {campaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              isGM={camp.ownerId === currentUserId}
              onStartSession={handleStartSession}
              onDelete={handleDelete}
              onNotesClick={() => setNotesTarget({ id: camp.id, name: camp.name, isGM: camp.ownerId === currentUserId })}
            />
          ))}
        </div>
      )}

      <button
        className="fab-create-campaign"
        aria-label="Crear nueva campaña"
        title="Crear campaña"
        onClick={() => setShowCreate(true)}
      >
        +
      </button>

      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {notesTarget && (
        <CampaignNotesPopup
          campaignId={notesTarget.id}
          campaignName={notesTarget.name}
          isGM={notesTarget.isGM}
          onClose={() => setNotesTarget(null)}
        />
      )}
    </main>
  );
};

export default CampaignsPage;