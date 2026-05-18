import React from "react";
import "./ChatMessage.css";

function getAriaLabel(message, senderDisplay) {
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const prefix = time ? `${senderDisplay}, ${time}` : senderDisplay;

  switch (message.type) {
    case "text":
      return `${prefix}: ${message.content}`;
    case "whisper":
      return `Susurro de ${prefix}: ${message.content}`;
    case "dice_roll": {
      const { dice, total, advantage, disadvantage } = message.content ?? {};
      const adv = advantage ? " con ventaja" : disadvantage ? " con desventaja" : "";
      return `${prefix} tiró ${dice}${adv}, resultado ${total}`;
    }
    case "ability_append":
      return `${prefix} comparte la habilidad: ${message.content?.abilityName ?? ""}`;
    case "note_append":
      return `${prefix} comparte la nota: ${message.content?.noteTitle ?? ""}`;
    default:
      return `Mensaje de ${prefix}`;
  }
}

const ChatMessage = React.forwardRef(({ message, isOwnMessage, tabIndex }, ref) => {
  const isInCharacter = message.characterId !== null;
  const senderDisplay = isInCharacter
    ? message.characterName
    : message.senderUsername;

  const renderContent = () => {
    switch (message.type) {
      case "text":
        return <p className="message-text">{message.content}</p>;
      case "dice_roll":
        return <DiceRollDisplay roll={message.content} />;
      case "whisper":
        return (
          <div className="whisper-indicator">
            <span className="whisper-label">[Susurro] </span>
            <p className="message-text">{message.content}</p>
          </div>
        );
      case "ability_append":
        return (
          <div className="append-box">
            <strong>{message.content.abilityName}</strong>
            <p>{message.content.description}</p>
          </div>
        );
      case "note_append":
        return (
          <div className="append-box">
            <strong>{message.content.noteTitle}</strong>
            <p>{message.content.snippet}</p>
          </div>
        );
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <div
      ref={ref}
      data-msg-id={message.id}
      className={`chat-message ${isOwnMessage ? "own-message" : ""}`}
      role="listitem"
      tabIndex={tabIndex ?? -1}
      aria-label={getAriaLabel(message, senderDisplay)}
    >
      <div className="message-body">
        {renderContent()}
      </div>
      <div className="message-sender-info">
        {message.characterAvatar && (
          <img
            src={message.characterAvatar}
            alt={message.characterAppearance || `Avatar de ${message.characterName}`}
            className="avatar-small"
          />
        )}
        <span className="sender-name">{senderDisplay}</span>
        <time className="message-time" dateTime={message.timestamp}>
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
        </time>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

// Subcomponente para tirada de dados
const DiceRollDisplay = ({ roll }) => {
  const { dice, results, total, advantage, disadvantage } = roll;
  let advantageText = "";
  if (advantage) advantageText = " (con ventaja)";
  if (disadvantage) advantageText = " (con desventaja)";

  return (
    <div className="dice-roll-result">
      <span className="dice-icon">🎲</span>
      <span className="dice-notation">{dice}{advantageText}: </span>
      <span className="dice-results">[{results.join(", ")}]</span>
      <span className="dice-total"> = {total}</span>
    </div>
  );
};

export default ChatMessage;
