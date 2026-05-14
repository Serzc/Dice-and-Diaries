import React, { useState } from "react";
import Button from "../common/Button";
import "./ChatInput.css";

const ChatInput = ({ onSend, onToggleSidebar, isSidebarOpen }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() === "") return;
    onSend({ type: "text", content: message.trim() });
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <textarea
        className="message-input"
        placeholder="Escribe un mensaje..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        rows={1}
        aria-label="Mensaje de chat"
      />
      <div className="input-actions">
        <Button onClick={handleSend} ariaLabel="Enviar mensaje">
          Enviar
        </Button>
        <Button
          onClick={onToggleSidebar}
          ariaLabel={isSidebarOpen ? "Cerrar bandeja de herramientas" : "Abrir bandeja de herramientas"}
        >
          {isSidebarOpen ? "✕" : "☰"}
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;