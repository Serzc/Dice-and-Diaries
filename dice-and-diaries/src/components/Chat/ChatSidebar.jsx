import React, { useState } from "react";
import Button from "../common/Button";
import DiceRoller from "./DiceRoller";
import CharacterSheetPopup from "./CharacterSheetPopup";
import NotesPopup from "./NotesPopup";
import WhisperPopup from "./WhisperPopup";
import NPCsPopup from "./NPCsPopup";
import "./ChatSidebar.css";

const ChatSidebar = ({ isGM, characters, notes, onlineUsers, npcs, onSendDiceRoll, onSendWhisper, onSendAbilityAppend, onSendNoteAppend }) => {
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
        <Button onClick={() => setActivePopup("dice")} ariaLabel="Tirada de dados">
          🎲 Dados
        </Button>
        <Button onClick={() => setActivePopup("character")} ariaLabel="Hoja de personaje">
          📄 Personaje
        </Button>
        <Button onClick={() => setActivePopup("notes")} ariaLabel="Mis notas">
          📝 Notas
        </Button>
        <Button onClick={() => setActivePopup("whisper")} ariaLabel="Enviar susurro">
          🤫 Susurro
        </Button>
        {isGM && (
          <Button onClick={() => setActivePopup("npcs")} ariaLabel="Ver NPCs">
            👤 NPCs
          </Button>
        )}
      </div>

      {activePopup === "dice" && (
        <DiceRoller onRoll={handleDiceRoll} onClose={closePopup} />
      )}
      {activePopup === "character" && (
        <CharacterSheetPopup
          characters={characters}
          onSelect={(char) => {
            // Al seleccionar un personaje, se podría cambiar la identidad del habla
            // Pero aquí solo mostramos. Luego se puede integrar.
            closePopup();
          }}
          onClose={closePopup}
        />
      )}
      {activePopup === "notes" && (
        <NotesPopup
          notes={notes}
          onAppend={(note) => {
            onSendNoteAppend(note);
            closePopup();
          }}
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
        <NPCsPopup npcs={npcs} onClose={closePopup} />
      )}
    </aside>
  );
};

export default ChatSidebar;