import { Dispatch, SetStateAction } from "react";
import { UseSocket } from "src/hooks/useSocket";
import { ActionResolve } from "./Game";
import { ClientMessage, UnitCosts, UnitType } from "@shared/types";

export const ActionPanel = ({
  send,
  game,
  username,
  setActionBuffer,
}: {
  setActionBuffer: Dispatch<SetStateAction<ActionResolve>>;
} & UseSocket) => {
  return (
    <div className="flex items-center gap-4 p-4">
      <button
        onClick={() => {
          send({ type: ClientMessage.END_TURN });
        }}
        disabled={game?.currentTurn === username}
        className="nes-btn is-primary"
      >
        End Turn
      </button>
      <button
        disabled={game!.players[username].points >= UnitCosts.SOLDIER}
        onClick={() =>
          setActionBuffer({
            type: ClientMessage.BUY_UNIT,
            unitType: UnitType.SOLDIER,
          })
        }
      >
        🥷
      </button>
      <button
        disabled={game!.players[username].points >= UnitCosts.SMALL_TOWER}
        onClick={() =>
          setActionBuffer({
            type: ClientMessage.BUY_UNIT,
            unitType: UnitType.SMALL_TOWER,
          })
        }
      >
        🗼
      </button>
    </div>
  );
};
