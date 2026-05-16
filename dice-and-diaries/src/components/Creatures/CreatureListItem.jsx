// src/components/Creatures/CreatureListItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import CreatureQuickView from "./CreatureQuickView";
import "./CreatureListItem.css";

const FolderIcon = () => (
  <svg
    className="item-icon folder-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronRight = () => (
  <svg
    className="item-icon chevron-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDown = () => (
  <svg
    className="item-icon chevron-icon expanded"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CreatureListItem = ({
  item,
  isExpanded,
  isGM,
  onToggle,
  onFolderEnter,
  onPossess,
  currentUser,
}) => {
  const isFolder = item.type === "folder" || item.parentId !== undefined;
  const navigate = useNavigate();

  if (isFolder) {
    return (
      <div className="creature-list-item folder-item" role="listitem">
        <div
          className="list-item-header"
          onClick={() => onFolderEnter && onFolderEnter(item.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onFolderEnter && onFolderEnter(item.id);
            }
          }}
          aria-label={`Abrir carpeta ${item.name}`}
        >
          <span className="item-name">{item.name}</span>
          <FolderIcon />
        </div>
      </div>
    );
  }

  // Criatura
  return (
    <div
      className={`creature-list-item creature-item${isExpanded ? " is-expanded" : ""}`}
      role="listitem"
    >
      <div
        className="list-item-header"
        onClick={() => onToggle && onToggle(item.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onToggle && onToggle(item.id);
          }
        }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${item.name}`}
      >
        <span className={`item-name${isExpanded ? " expanded" : ""}`}>
          {item.name}
        </span>
        <button
          className="btn-ver-hoja-inline"
          onClick={(e) => { e.stopPropagation(); navigate(`/creatures/${item.id}`); }}
          aria-label={`Ver hoja de ${item.name}`}
        >
          Ver hoja
        </button>
        {isExpanded ? <ChevronDown /> : <ChevronRight />}
      </div>

      {isExpanded && (
        <div className="creature-expanded-body">
          <CreatureQuickView
            creature={item}
            isGM={isGM}
            onPossess={onPossess}
          />
        </div>
      )}
    </div>
  );
};

export default CreatureListItem;
