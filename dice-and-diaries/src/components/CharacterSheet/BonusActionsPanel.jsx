import React from "react";
import ActionListPanel from "./ActionListPanel";
import { fetchBonusActions } from "../../mock/db";

const BonusActionsPanel = ({ characterId, onSave }) => (
  <ActionListPanel
    title="Bonus Actions"
    type="bonus-actions"
    characterId={characterId}
    fetchData={fetchBonusActions}
    onSave={onSave}
  />
);

export default BonusActionsPanel;