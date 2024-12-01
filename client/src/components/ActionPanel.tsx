import { ClientMessage } from "@shared/types";
import { UseSocket } from "src/hooks/useSocket";

export const ActionPanel = ({ send, game, username }: UseSocket) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="text-sm">Turn {}</div>
      <button
        onClick={() => {
          send(ClientMessage.END_TURN);
        }}
        disabled={game?.currentTurn === username}
        className="nes-btn is-primary"
      >
        End Turn
      </button>
    </div>
  );
};
