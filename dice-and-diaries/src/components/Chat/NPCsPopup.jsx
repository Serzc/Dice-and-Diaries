import React from "react";
import Button from "../common/Button";

const NPCsPopup = ({ npcs, onClose }) => {
  return (
    <div className="popup-overlay" role="dialog" aria-label="Ver NPCs">
      <div className="popup-content">
        <h3>NPCs</h3>
        <ul>
          {npcs.map((npc) => (
            <li key={npc.id}>{npc.name}</li>
          ))}
        </ul>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

export default NPCsPopup;