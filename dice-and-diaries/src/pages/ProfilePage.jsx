// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { fetchProfile, saveProfile } from "../mock/db";
import "./ProfilePage.css";

const STAT_LABELS = {
  campaigns: "Campañas",
  characters: "Personajes",
  sessions: "Sesiones",
  notesWritten: "Notas",
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => {
      setProfile(p);
      setForm({ displayName: p.displayName, bio: p.bio, email: p.email });
    });
  }, []);

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setForm({ displayName: profile.displayName, bio: profile.bio, email: profile.email });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = await saveProfile(form);
    setProfile(updated);
    setSaving(false);
    setIsEditing(false);
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  if (!profile) return <main className="profile-page"><p className="profile-loading">Cargando perfil...</p></main>;

  const initials = profile.displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <main className="profile-page" aria-labelledby="profile-heading">
      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          {isEditing && (
            <button className="profile-avatar-change-btn" aria-label="Cambiar foto de perfil">Cambiar foto</button>
          )}
        </div>

        {/* Info */}
        <div className="profile-info">
          <h1 id="profile-heading" className="profile-display-name">
            {profile.displayName}
          </h1>
          <p className="profile-username">@{profile.username}</p>

          {isEditing ? (
            <div className="profile-edit-fields">
              <label htmlFor="profile-display-name" className="profile-field-label">Nombre para mostrar</label>
              <input
                id="profile-display-name"
                className="profile-input"
                value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)}
                placeholder="Nombre completo"
                autoFocus
              />
              <label htmlFor="profile-email" className="profile-field-label">Email</label>
              <input
                id="profile-email"
                className="profile-input"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              <label htmlFor="profile-bio" className="profile-field-label">Biografía</label>
              <textarea
                id="profile-bio"
                className="profile-textarea"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                rows={3}
                placeholder="Cuéntanos sobre ti..."
              />
            </div>
          ) : (
            <>
              <p className="profile-email">{profile.email}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            </>
          )}

          <p className="profile-joined">
            Miembro desde {new Date(profile.joinedAt).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
          </p>

          {/* Action buttons */}
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="profile-btn profile-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button className="profile-btn profile-btn-secondary" onClick={cancelEdit}>
                  Cancelar
                </button>
              </>
            ) : (
              <button className="profile-btn profile-btn-secondary" onClick={startEdit}>
                Editar perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats-section">
        <h2 className="profile-section-title">Estadísticas</h2>
        <div className="profile-stats-grid">
          {Object.entries(profile.stats).map(([key, val]) => (
            <div key={key} className="profile-stat-card">
              <span className="stat-value">{val}</span>
              <span className="stat-label">{STAT_LABELS[key] || key}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
