// src/pages/PlannerPage.jsx
import React, { useEffect, useState } from "react";
import { fetchCampaigns } from "../mock/campaignsMock";
import { fetchPlanner, toggleSlot, computeOverlap, getWeekDays, TIME_SLOTS, DAY_LABELS } from "../mock/plannerMock";
import "./PlannerPage.css";

const LEVEL_CLASSES = ["overlap-0", "overlap-1", "overlap-2", "overlap-3", "overlap-max"];

function overlapClass(count, total) {
  if (count === 0 || total === 0) return "overlap-0";
  const idx = Math.min(Math.ceil((count / total) * (LEVEL_CLASSES.length - 1)), LEVEL_CLASSES.length - 1);
  return LEVEL_CLASSES[idx];
}

const PlannerPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [data, setData] = useState(null);
  const [weekStart, setWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchCampaigns().then((list) => {
      setCampaigns(list);
      if (list.length > 0) setSelectedCampaignId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedCampaignId == null) return;
    setData(null);
    fetchPlanner(selectedCampaignId).then(setData);
  }, [selectedCampaignId]);

  useEffect(() => {
    setWeekDays(getWeekDays(weekStart));
  }, [weekStart]);

  const prevWeek = () => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
  const nextWeek = () => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });

  const handleToggle = async (date, slotId) => {
    const key = `${date}-${slotId}`;
    if (toggling === key) return;
    setToggling(key);
    const updated = await toggleSlot(date, slotId);
    setData((prev) => ({ ...prev, currentUserAvailability: updated }));
    setToggling(null);
  };

  const isMySlot = (date, slotId) => data?.currentUserAvailability[date]?.includes(slotId) ?? false;
  const formatDate = (isoDate) => new Date(isoDate + "T00:00:00").getDate();
  const isToday = (isoDate) => isoDate === new Date().toISOString().split("T")[0];

  const totalParticipants = data?.participants.length ?? 0;

  return (
    <main className="planner-page" aria-labelledby="planner-heading">
      <div className="planner-header-row">
        <h1 id="planner-heading" className="page-title planner-title">Planificador</h1>
        <div className="planner-controls">
          <div className="planner-campaign-selector">
            <label htmlFor="campaign-select" className="planner-select-label">Campaña</label>
            <select
              id="campaign-select"
              className="planner-select"
              value={selectedCampaignId ?? ""}
              onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="planner-week-nav" aria-label="Semana">
            <button className="planner-nav-btn" onClick={prevWeek} aria-label="Semana anterior">&#8592;</button>
            <span className="planner-week-label">
              {weekDays.length > 0 && (
                <>
                  {new Date(weekDays[0] + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  {" – "}
                  {new Date(weekDays[6] + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </>
              )}
            </span>
            <button className="planner-nav-btn" onClick={nextWeek} aria-label="Semana siguiente">&#8594;</button>
          </div>
        </div>
      </div>

      <div className="planner-legend">
        <span className="legend-label">Disponibilidad:</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`legend-dot ${LEVEL_CLASSES[i]}`} aria-hidden="true" />
        ))}
        <span className="legend-text">Poca → Mucha</span>
        <span className="legend-sep">|</span>
        <span className="legend-dot my-slot" aria-hidden="true" />
        <span className="legend-text">Tu disponibilidad (haz clic para cambiar)</span>
      </div>

      {!data ? (
        <p className="planner-loading">Cargando planificador...</p>
      ) : data.participants.length === 0 ? (
        <p className="planner-empty">No hay participantes en esta campaña.</p>
      ) : (
        <>
          <div className="planner-grid-wrapper">
            <div className="planner-grid" style={{ gridTemplateColumns: `7rem repeat(${weekDays.length}, 1fr)` }}>
              {/* Day headers */}
              <div className="planner-cell planner-corner" />
              {weekDays.map((date, i) => (
                <div key={date} className={`planner-cell planner-day-header ${isToday(date) ? "today" : ""}`}>
                  <span className="day-abbr">{DAY_LABELS[i]}</span>
                  <span className="day-num">{formatDate(date)}</span>
                </div>
              ))}

              {/* Time slot rows */}
              {TIME_SLOTS.map((slot) => (
                <React.Fragment key={slot.id}>
                  <div className="planner-cell planner-slot-label">
                    <span className="slot-name">{slot.label}</span>
                    <span className="slot-range">{slot.range}</span>
                  </div>
                  {weekDays.map((date) => {
                    const count = computeOverlap(data.participants, date, slot.id);
                    const mine = isMySlot(date, slot.id);
                    const cls = overlapClass(count, totalParticipants);
                    const key = `${date}-${slot.id}`;
                    return (
                      <button
                        key={date}
                        className={`planner-cell planner-slot-cell ${cls} ${mine ? "my-slot" : ""} ${toggling === key ? "toggling" : ""}`}
                        onClick={() => handleToggle(date, slot.id)}
                        aria-label={`${DAY_LABELS[weekDays.indexOf(date)]} ${slot.label}: ${count} de ${totalParticipants} disponibles${mine ? " (tú incluido)" : ""}`}
                        title={`${count}/${totalParticipants} disponibles`}
                      >
                        {count > 0 && <span className="slot-count">{count}/{totalParticipants}</span>}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="planner-participants">
            <h2 className="planner-section-title">Participantes ({totalParticipants})</h2>
            <div className="planner-participants-list">
              {data.participants.map((p) => {
                const totalSlots = Object.values(p.availability).flat().length;
                const isMe = p.userId === data.currentUserId;
                return (
                  <div key={p.userId} className={`participant-chip ${isMe ? "participant-me" : ""}`}>
                    <span className="participant-avatar">{p.username[0].toUpperCase()}</span>
                    <span className="participant-name">{p.username}</span>
                    {isMe && <span className="participant-you-tag">Tú</span>}
                    <span className="participant-slots">{totalSlots} franjas</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default PlannerPage;
