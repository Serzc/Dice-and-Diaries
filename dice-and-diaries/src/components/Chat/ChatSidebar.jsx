import React, { useState } from "react";
import Button from "../common/Button";
import DiceRoller from "./DiceRoller";
import CharacterSheetPopup from "./CharacterSheetPopup";
import NotesPopup from "./NotesPopup";
import WhisperPopup from "./WhisperPopup";
import NPCsPopup from "./NPCsPopup";
import "./ChatSidebar.css";

const ChatSidebar = ({ isGM, characters, notes, onlineUsers, npcs, campaignId, currentUserId, onSendDiceRoll, onSendWhisper, onSendAbilityAppend, onSendNoteAppend, onNoteCreated, onPossessNPC, onPossessCharacter }) => {
  const [activePopup, setActivePopup] = useState(null);

  const closePopup = () => setActivePopup(null);

  const handleDiceRoll = (notation, results, total, advantage, disadvantage) => {
    // Se envía al chat a través de la función proporcionada por la página
    onSendDiceRoll(notation, results, total, advantage, disadvantage);
    closePopup();
  };

  return (
    <aside className="chat-sidebar" aria-label="Herramientas de chat">
      <div className="sidebar-buttons">
        <button className="sidebar-btn" onClick={() => setActivePopup("dice")} aria-label="Tirada de dados">
          <span className="sidebar-btn-icon">d20</span>
          <span className="sidebar-btn-label">Dados</span>
        </button>
        <button className="sidebar-btn" onClick={() => setActivePopup("character")} aria-label="Hoja de personaje">
          <span className="sidebar-btn-icon">PC</span>
          <span className="sidebar-btn-label">Personaje</span>
        </button>
        <button className="sidebar-btn" onClick={() => setActivePopup("notes")} aria-label="Mis notas">
          <span className="sidebar-btn-icon">✎</span>
          <span className="sidebar-btn-label">Notas</span>
        </button>
        <button className="sidebar-btn" onClick={() => setActivePopup("whisper")} aria-label="Enviar susurro">
          <span className="sidebar-btn-icon">≫</span>
          <span className="sidebar-btn-label">Susurro</span>
        </button>
        {isGM && (
          <button className="sidebar-btn" onClick={() => setActivePopup("npcs")} aria-label="Ver NPCs">
            <span className="sidebar-btn-icon">NPC</span>
            <span className="sidebar-btn-label">NPCs</span>
          </button>
        )}
      </div>

      {activePopup === "dice" && (
        <DiceRoller onRoll={handleDiceRoll} onClose={closePopup} />
      )}
      {activePopup === "character" && (
        <CharacterSheetPopup
          characters={characters}
          onSelect={(char) => {
            onPossessCharacter && onPossessCharacter(char);
          }}
          onClose={closePopup}
        />
      )}
      {activePopup === "notes" && (
        <NotesPopup
          notes={notes}
          campaignId={campaignId}
          currentUserId={currentUserId}
          isGM={isGM}
          onAppend={(note) => { onSendNoteAppend(note); }}
          onNoteCreated={onNoteCreated}
          onClose={closePopup}
        />
      )}
      {activePopup === "whisper" && (
        <WhisperPopup
          users={onlineUsers}
          onSend={(userId, message) => {
            onSendWhisper(userId, message);
            closePopup();
          }}
          onClose={closePopup}
        />
      )}
      {activePopup === "npcs" && (
        <NPCsPopup
          npcs={npcs}
          onClose={closePopup}
          onPossess={(npc) => { onPossessNPC && onPossessNPC(npc); closePopup(); }}
        />
      )}
    </aside>
  );
};

export default ChatSidebar;