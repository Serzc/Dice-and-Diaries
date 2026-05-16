// src/pages/CreaturesPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCreaturesInFolder, currentUser } from "../mock/db";
import CreatureListItem from "../components/Creatures/CreatureListItem";
import CreateCreaturePopup from "../components/Creatures/CreateCreaturePopup";
import "./CreaturesPage.css";

const CreaturesPage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({ folders: [], creatures: [], currentFolder: null, breadcrumb: [] });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setExpandedId(null);
    fetchCreaturesInFolder(folderId || null).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [folderId, refreshKey]);

  const handleToggle = (creatureId) => {
    setExpandedId((prev) => (prev === creatureId ? null : creatureId));
  };

  const handleFolderEnter = (id) => {
    navigate(`/creatures/folder/${id}`);
  };

  const handleBack = () => {
    if (data.breadcrumb.length > 1) {
      const parentId = data.breadcrumb[data.breadcrumb.length - 2].id;
      navigate(`/creatures/folder/${parentId}`);
    } else {
      navigate("/creatures");
    }
  };

  const isInsideFolder = !!folderId;

  if (loading) {
    return (
      <main className="creatures-page">
        <p className="creatures-loading">Cargando criaturas...</p>
      </main>
    );
  }

  const folderItems = data.folders.map((f) => ({ ...f, type: "folder" }));
  const creatureItems = data.creatures.map((c) => ({ ...c, type: "creature" }));
  const allItems = [...folderItems, ...creatureItems];

  return (
    <main className="creatures-page" aria-labelledby="creatures-heading">
      {/* Breadcrumb / navegación de carpetas */}
      {isInsideFolder && (
        <nav className="creatures-breadcrumb" aria-label="Ruta de carpeta">
          <button
            className="breadcrumb-back-btn"
            onClick={handleBack}
            aria-label="Volver"
          >
            &#8592;
          </button>
          <span className="breadcrumb-path">
            {data.breadcrumb.length > 1 && (
              <>
                <span className="breadcrumb-ellipsis">...</span>
                <span className="breadcrumb-sep"> / </span>
              </>
            )}
            <span className="breadcrumb-current">
              {data.currentFolder ? data.currentFolder.name : "Raiz"}
            </span>
          </span>
        </nav>
      )}

      {!isInsideFolder && (
        <h1 id="creatures-heading" className="page-title">
          Mis Criaturas
        </h1>
      )}

      {allItems.length === 0 ? (
        <p className="creatures-empty">
          Esta carpeta está vacía. Usa el botón + para añadir una criatura o carpeta.
        </p>
      ) : (
        <div className="creatures-list" role="list" aria-label="Lista de criaturas">
          {allItems.map((item) => (
            <CreatureListItem
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              isGM={currentUser.isGM}
              onToggle={handleToggle}
              onFolderEnter={handleFolderEnter}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}

      {/* FAB para crear */}
      <button
        className="fab-create"
        aria-label="Crear nueva criatura o carpeta"
        title="Crear"
        onClick={() => setShowCreate(true)}
      >
        +
      </button>

      {showCreate && (
        <CreateCreaturePopup
          onClose={() => setShowCreate(false)}
          onFolderCreated={() => setRefreshKey((k) => k + 1)}
          currentFolderId={folderId || null}
        />
      )}
    </main>
  );
};

export default CreaturesPage;
