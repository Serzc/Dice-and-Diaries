import React from "react";
import ActionListPanel from "./ActionListPanel";
import { fetchBonusActions } from "../../mock/db";

const BonusActionsPanel = ({ characterId, onSave, restTrigger }) => (
  <ActionListPanel
    title="Acciones Bonus"
    type="bonus-actions"
    characterId={characterId}
    fetchData={fetchBonusActions}
    onSave={onSave}
    restTrigger={restTrigger}
  />
);

export default BonusActionsPanel;