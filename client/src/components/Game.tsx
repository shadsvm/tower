import { UseSocket } from "src/hooks/useSocket";
import { MapTile } from "./MapTile";
import Layout from "src/Layout";
import { ActionPanel } from "./ActionPanel";
import { useState } from "react";
import { UnitType, Position, ClientMessage } from "@shared/types";

export interface ActionResolve {
  type?: keyof typeof ClientMessage;
  unitType?: keyof typeof UnitType;
}

export const Game = ({ socket }: { socket: UseSocket }) => {
  const [actionBuffer, setActionBuffer] = useState<ActionResolve>({
    type: undefined,
    unitType: undefined,
  });
  const handleAction = (position: Position) => {
    console.log("handleAction", actionBuffer, position);
    if (actionBuffer.type && actionBuffer.unitType) {
      if (actionBuffer.type === ClientMessage.BUY_UNIT) {
        socket.send({
          type: ClientMessage.BUY_UNIT,
          unitType: actionBuffer.unitType,
          position,
        });
      }
    }
  };

  if (!socket.game)
    return (
      <div>
        <p>something went wrong</p>
      </div>
    );

  const { game, username } = socket;
  const myData = game.players[username];
  return (
    <Layout slot={<ActionPanel {...{ ...socket, setActionBuffer }} />}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg">Points: {myData.points}</div>
        <div className="text-xl">
          {game.currentTurn === username
            ? "Your turn!"
            : `Waiting for ${game.currentTurn}`}
        </div>
        <div className="grid grid-cols-12 perspective-distant transform-3d rotate-x-51 rotate-z-43 shadow-3xl  shadow-white transition-all duration-500 hover:-translate-y-4 hover:rotate-x-49 hover:rotate-z-38 gap-1">
          {game.grid.map((row, y) =>
            row.map((tile, x) => (
              <MapTile
                key={`${x}-${y}`}
                onClick={() => handleAction({ x, y })}
                {...{ tile, username, disabled: !actionBuffer }}
              />
            )),
          )}
        </div>
      </div>
    </Layout>
  );
};
