// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import './styles/colors.css';
import './styles/theme.css';
import Header from "./components/common/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CampaignsPage from "./pages/CampaignsPage";
import CharactersPage from "./pages/CharactersPage";
import CharacterSheetPage from "./pages/CharacterSheetPage";
import ChatPage from "./pages/ChatPage";
import CreaturesPage from "./pages/CreaturesPage";
import CreatureSheetPage from "./pages/CreatureSheetPage";
import ProfilePage from "./pages/ProfilePage";
import PlannerPage from "./pages/PlannerPage";
import CampaignNotesPage from "./pages/CampaignNotesPage";
import CampaignPlayersPage from "./pages/CampaignPlayersPage";

import "./App.css";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} /> 
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:campaignId/chat" element={<ChatPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/:id" element={<CharacterSheetPage />} />
        <Route path="/creatures" element={<CreaturesPage />} />
        <Route path="/creatures/folder/:folderId" element={<CreaturesPage />} />
        <Route path="/creatures/:creatureId" element={<CreatureSheetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/calendar" element={<PlannerPage />} />
        <Route path="/campaigns/:campaignId/notes" element={<CampaignNotesPage />} />
        <Route path="/campaigns/:campaignId/players" element={<CampaignPlayersPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;