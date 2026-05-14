import React from "react";
import "./ChatMessage.css";

const ChatMessage = ({ message, isOwnMessage }) => {
  const isInCharacter = message.characterId !== null;
  const senderDisplay = isInCharacter
    ? `${message.characterName} (${message.senderUsername})`
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
      className={`chat-message ${isOwnMessage ? "own-message" : ""}`}
      role="listitem"
      aria-label={`Mensaje de ${senderDisplay}`}
    >
      {message.characterAvatar && (
        <img
          src={message.characterAvatar}
          alt={`Avatar de ${message.characterName}`}
          className="avatar-small"
        />
      )}
      <div className="message-body">
        <div className="message-header">
          <span className="sender-name">{senderDisplay}</span>
          <time className="message-time" dateTime={message.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

// Subcomponente para tirada de dados
const DiceRollDisplay = ({ roll }) => {
  const { dice, results, total, advantage, disadvantage } = roll;
  let advantageText = "";
  if (advantage) advantageText = " (con ventaja)";
  if (disadvantage) advantageText = " (con desventaja)";

  return (
    <div className="dice-roll-result" aria-label={`Resultado de ${dice}: ${total}`}>
      <span className="dice-icon">🎲</span>
      <span className="dice-notation">{dice}{advantageText}: </span>
      <span className="dice-results">[{results.join(", ")}]</span>
      <span className="dice-total"> = {total}</span>
    </div>
  );
};

export default ChatMessage;