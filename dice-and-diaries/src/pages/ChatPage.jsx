import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchChatData, sendMessage as sendMessageApi } from "../mock/chatMock";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";
import ChatSidebar from "../components/Chat/ChatSidebar";
import "./ChatPage.css";

const ChatPage = () => {
  const { campaignId } = useParams();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [possessedNPC, setPossessedNPC] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchChatData(campaignId);
      setChatData(data);
      setMessages(data.messages);
    };
    load();
  }, [campaignId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (newMsg) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleSendText = (textData) => {
    if (!chatData) return;
    const msg = {
      senderId: chatData.currentUser.id,
      senderUsername: possessedNPC ? possessedNPC.name : chatData.currentUser.username,
      characterId: possessedNPC ? possessedNPC.id : null,
      characterName: possessedNPC ? possessedNPC.name : null,
      characterAvatar: possessedNPC ? possessedNPC.avatar : null,
      type: textData.type,
      content: textData.content,
      isWhisper: false,
    };
    sendMessageApi(campaignId, msg).then(addMessage);
  };

  const handleSendDiceRoll = (notation, results, total, advantage, disadvantage) => {
    if (!chatData) return;
    const msg = {
      senderId: chatData.currentUser.id,
      senderUsername: chatData.currentUser.username,
      type: "dice_roll",
      content: { dice: notation, results, total, advantage, disadvantage },
    };
    sendMessageApi(campaignId, msg).then(addMessage);
  };

  const handleSendWhisper = (userId, content) => {
    if (!chatData) return;
    const msg = {
      senderId: chatData.currentUser.id,
      senderUsername: chatData.currentUser.username,
      type: "whisper",
      content,
      isWhisper: true,
      whisperTo: userId,
    };
    sendMessageApi(campaignId, msg).then(addMessage);
  };

  const handleSendNoteAppend = (note) => {
    if (!chatData) return;
    const msg = {
      senderId: chatData.currentUser.id,
      senderUsername: chatData.currentUser.username,
      type: "note_append",
      content: { noteTitle: note.title, snippet: note.snippet },
    };
    sendMessageApi(campaignId, msg).then(addMessage);
  };

  const handleSendAbilityAppend = (ability) => {
    if (!chatData) return;
    const msg = {
      senderId: chatData.currentUser.id,
      senderUsername: chatData.currentUser.username,
      type: "ability_append",
      content: { abilityName: ability.name, description: ability.description },
    };
    sendMessageApi(campaignId, msg).then(addMessage);
  };

  if (!chatData) return <div className="loading">Cargando chat...</div>;

  return (
    <div className="chat-page-container">
      <div className="chat-main-area">
        <h1 className="chat-title">{chatData.campaign.name} – Chat</h1>
        {possessedNPC && (
          <div className="possess-banner" role="alert">
            <span>Hablando como <strong>{possessedNPC.name}</strong></span>
            <button className="possess-release-btn" onClick={() => setPossessedNPC(null)}>
              Soltar
            </button>
          </div>
        )}
        <div className="messages-container" role="log" aria-live="polite">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === chatData.currentUser.id}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput
          onSend={handleSendText}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          isSidebarOpen={showSidebar}
        />
      </div>
      {showSidebar && (
        <ChatSidebar
          isGM={chatData.currentUser.isGM}
          characters={chatData.userCharacters}
          notes={[]} // Pasar notas reales si las tienes
          onlineUsers={chatData.onlineUsers}
          npcs={chatData.npcs}
          onSendDiceRoll={handleSendDiceRoll}
          onSendWhisper={handleSendWhisper}
          onSendNoteAppend={handleSendNoteAppend}
          onSendAbilityAppend={handleSendAbilityAppend}
          onPossessNPC={setPossessedNPC}
        />
      )}
    </div>
  );
};

export default ChatPage;