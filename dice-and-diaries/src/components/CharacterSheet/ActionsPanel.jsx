import React from "react";
import ActionListPanel from "./ActionListPanel";
import { fetchActions } from "../../mock/db";

const ActionsPanel = ({ characterId, onSave }) => (
  <ActionListPanel
    title="Acciones"
    type="actions"
    characterId={characterId}
    fetchData={fetchActions}
    onSave={onSave}
  />
);

export default ActionsPanel;