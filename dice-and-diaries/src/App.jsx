// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/common/Header";
import NotFoundPage from "./pages/NotFoundPage";

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
import './styles/colors.css';
import './styles/theme.css';

// Redirects to /login when not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
      )}
      {!isLoginPage && <Header />}
      <div id="main-content">
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/campaigns" element={<PrivateRoute><CampaignsPage /></PrivateRoute>} />
          <Route path="/campaigns/:campaignId/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/campaigns/:campaignId/notes" element={<PrivateRoute><CampaignNotesPage /></PrivateRoute>} />
          <Route path="/campaigns/:campaignId/players" element={<PrivateRoute><CampaignPlayersPage /></PrivateRoute>} />
          <Route path="/characters" element={<PrivateRoute><CharactersPage /></PrivateRoute>} />
          <Route path="/characters/:id" element={<PrivateRoute><CharacterSheetPage /></PrivateRoute>} />
          <Route path="/creatures" element={<PrivateRoute><CreaturesPage /></PrivateRoute>} />
          <Route path="/creatures/folder/:folderId" element={<PrivateRoute><CreaturesPage /></PrivateRoute>} />
          <Route path="/creatures/:creatureId" element={<PrivateRoute><CreatureSheetPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><PlannerPage /></PrivateRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
      </div>
    </>
  );
}

function App() {
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
