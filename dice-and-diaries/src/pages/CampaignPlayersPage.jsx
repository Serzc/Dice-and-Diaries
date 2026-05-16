// src/pages/CampaignPlayersPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCampaignPlayers, kickPlayer, invitePlayer } from "../mock/db";
import { useAuth } from "../context/AuthContext";
import { useFocusTrap } from "../hooks/useFocusTrap";
import "../components/common/Popup.css";
import "./CampaignPlayersPage.css";

// ── Invite popup ──────────────────────────────────────────────────────────────
const InvitePopup = ({ onInvite, onClose, error }) => {
  const contentRef = useRef(null);
  useFocusTrap(contentRef);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setLocalError("");
    try {
      await onInvite(username.trim());
      onClose();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-popup-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="popup-content" style={{ maxWidth: "360px" }} ref={contentRef}>
        <form onSubmit={handleSubmit}>
          <div className="popup-header">
            <h2 id="invite-popup-title" className="popup-title">Invitar jugador</h2>
            <button type="button" className="popup-close-btn" onClick={onClose} aria-label="Cerrar">&#x2715;</button>
          </div>
          <div className="popup-body">
            <div className="form-group">
              <label>Nombre de usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. Player_Ana"
                autoFocus
                required
              />
            </div>
            {localError && <p className="cp-invite-error">{localError}</p>}
          </div>
          <div className="popup-footer">
            <button type="submit" className="primary-button" disabled={loading || !username.trim()}>
              {loading ? "Invitando..." : "Invitar"}
            </button>
            <button type="button" className="primary-button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const CampaignPlayersPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;

  const [ownerId, setOwnerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [kicking, setKicking] = useState(null);

  const isGM = ownerId === currentUserId;

  useEffect(() => {
    setLoading(true);
    fetchCampaignPlayers(campaignId).then(({ ownerId, players }) => {
      setOwnerId(ownerId);
      setPlayers(players);
      setLoading(false);
    });
  }, [campaignId]);

  const handleKick = async (userId) => {
    setKicking(userId);
    await kickPlayer(campaignId, userId);
    setPlayers((prev) => prev.filter((p) => p.id !== userId));
    setKicking(null);
  };

  const handleInvite = async (username) => {
    const newPlayer = await invitePlayer(campaignId, username);
    setPlayers((prev) => {
      if (prev.some((p) => p.id === newPlayer.id)) return prev;
      return [...prev, newPlayer];
    });
  };

  if (loading) return <main className="cp-page"><p className="cp-loading">Cargando jugadores...</p></main>;

  return (
    <main className="cp-page" aria-labelledby="cp-heading">
      <div className="cp-header">
        <button
          className="cp-back-btn"
          onClick={() => navigate("/campaigns")}
          aria-label="Volver a campañas"
        >
          &#8592;
        </button>
        <h1 id="cp-heading" className="page-title cp-page-title">Jugadores</h1>
        {isGM && (
          <button className="cp-invite-btn" onClick={() => setShowInvite(true)}>
            + Invitar
          </button>
        )}
      </div>

      <div className="cp-players-list" role="list">
        {players.map((player) => {
          const isOwner = player.id === ownerId;
          const isMe = player.id === currentUserId;
          const initials = player.displayName
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join("");

          return (
            <div key={player.id} className="cp-player-card" role="listitem">
              <div className="cp-player-avatar">{initials}</div>
              <div className="cp-player-info">
                <span className="cp-player-name">{player.displayName}</span>
                <span className="cp-player-username">@{player.username}</span>
              </div>
              <div className="cp-player-badges">
                {isOwner && <span className="cp-badge cp-badge-gm">GM</span>}
                {isMe && <span className="cp-badge cp-badge-me">Tú</span>}
              </div>
              {isGM && !isOwner && (
                <button
                  className="cp-kick-btn"
                  onClick={() => handleKick(player.id)}
                  disabled={kicking === player.id}
                  aria-label={`Expulsar a ${player.displayName}`}
                >
                  {kicking === player.id ? "..." : "Expulsar"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {players.length === 0 && (
        <p className="cp-empty">No hay jugadores en esta campaña.</p>
      )}

      {showInvite && (
        <InvitePopup
          onInvite={handleInvite}
          onClose={() => setShowInvite(false)}
        />
      )}
    </main>
  );
};

export default CampaignPlayersPage;
