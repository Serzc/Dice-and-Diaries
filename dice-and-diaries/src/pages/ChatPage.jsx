import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchChatData, fetchCampaignNotes, sendMessage as sendMessageApi, subscribeToChatMessages } from "../mock/db";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";
import ChatSidebar from "../components/Chat/ChatSidebar";
import "./ChatPage.css";

const ChatPage = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [notes, setNotes] = useState([]);
  const [possessedNPC, setPossessedNPC] = useState(() => {
    const characterId = searchParams.get("characterId");
    const characterName = searchParams.get("characterName");
    if (characterId && characterName) return { id: characterId, name: characterName, avatar: null };
    return null;
  });
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const initialFocusDone = useRef(false);

  useEffect(() => {
    let unsubscribe = null;
    let cancelled = false;

    const load = async () => {
      const data = await fetchChatData(campaignId);
      if (cancelled) return;
      setChatData(data);
      setMessages(data.messages);
      const notesData = await fetchCampaignNotes(campaignId, data.currentUser.isGM);
      if (cancelled) return;
      setNotes(notesData.notes || []);

      unsubscribe = subscribeToChatMessages(data.chatId, (newMsg) => {
        setMessages(prev =>
          prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]
        );
      });
    };

    load();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [campaignId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus the last message on initial load; follow new messages if focus is already inside the container
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    const lastEl = messageRefs.current[lastMsg.id];
    if (!lastEl) return;

    if (!initialFocusDone.current) {
      // Defer slightly so the DOM has painted
      const t = setTimeout(() => {
        lastEl.focus({ preventScroll: true });
        initialFocusDone.current = true;
      }, 150);
      return () => clearTimeout(t);
    }

    // New message arrived: follow it only if user is already navigating messages
    const active = document.activeElement;
    if (active && active.dataset.msgId) {
      lastEl.focus({ preventScroll: true });
    }
  }, [messages]);

  const handleContainerKeyDown = useCallback((e) => {
    const active = document.activeElement;
    const currentId = Number(active?.dataset?.msgId);
    if (!currentId) return;

    const ids = messages.map(m => m.id);
    const idx = ids.indexOf(currentId);
    if (idx === -1) return;

    let nextIdx = idx;
    if      (e.key === "ArrowDown") nextIdx = Math.min(idx + 1, ids.length - 1);
    else if (e.key === "ArrowUp")   nextIdx = Math.max(idx - 1, 0);
    else if (e.key === "End")       nextIdx = ids.length - 1;
    else if (e.key === "Home")      nextIdx = 0;
    else return;

    e.preventDefault();
    messageRefs.current[ids[nextIdx]]?.focus({ preventScroll: false });
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
      characterAppearance: possessedNPC ? possessedNPC.appearance : null,
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
          <div className="possess-banner" role="status" aria-live="polite">
            <span>Hablando como <strong>{possessedNPC.name}</strong></span>
            <button
              className="possess-release-btn"
              onClick={() => setPossessedNPC(null)}
              aria-label={`Dejar de hablar como ${possessedNPC.name}`}
            >
              Soltar
            </button>
          </div>
        )}
        <div
          className="messages-container"
          role="list"
          aria-live="polite"
          aria-label="Mensajes del chat. Usa las flechas arriba y abajo para navegar entre mensajes."
          onKeyDown={handleContainerKeyDown}
        >
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              ref={(el) => { messageRefs.current[msg.id] = el; }}
              message={msg}
              isOwnMessage={msg.senderId === chatData.currentUser.id}
              tabIndex={index === messages.length - 1 ? 0 : -1}
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
          notes={notes}
          onlineUsers={chatData.onlineUsers}
          npcs={chatData.npcs}
          campaignId={Number(campaignId)}
          currentUserId={chatData.currentUser.id}
          onSendDiceRoll={handleSendDiceRoll}
          onSendWhisper={handleSendWhisper}
          onSendNoteAppend={handleSendNoteAppend}
          onSendAbilityAppend={handleSendAbilityAppend}
          onNoteCreated={(note) => setNotes((prev) => [note, ...prev])}
          onPossessNPC={setPossessedNPC}
          onPossessCharacter={(char) => setPossessedNPC({ id: char.id, name: char.name, avatar: char.avatar ?? null, appearance: char.appearance ?? null })}
        />
      )}
    </div>
  );
};

export default ChatPage;