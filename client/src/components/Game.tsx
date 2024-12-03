import { UseSocket } from "src/hooks/useSocket";
import { MapTile } from "./MapTile";
import { ActionPanel } from "./ActionPanel";
import { useState } from "react";
import { UnitType, Position, ClientMessage } from "@shared/types";
import Layout from "./Layout";

export interface ActionResolve {
  type?: ClientMessage;
  unitType?: UnitType;
  position?: Position;
}

export function Game(socket: UseSocket) {
  const debug = false;
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>(
    undefined,
  );
  if (!socket.game) return;
  const { game, username } = socket;

  const handleAction = (position: Position) => {
    if (!selectedUnit) return;
    console.log("handleAction", selectedUnit, position);
    socket.send({
      type: ClientMessage.BUY_UNIT,
      unitType: selectedUnit,
      position,
    });
    setSelectedUnit(undefined);
  };

  return (
    <Layout
      slot={
        <ActionPanel
          disabled={game.currentTurn !== username}
          socket={socket}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
        />
      }
    >
      {debug && (
        <pre>
          {JSON.stringify(
            {
              ...socket.state,
              currentTurn: socket.game?.currentTurn,
              buffer: selectedUnit,
              username: socket.username,
              points: socket.game?.players[socket.username].points,
            },
            null,
            2,
          )}
        </pre>
      )}
      <div className="container mx-auto w-full flex justify-around my-8 items-center">
        <div className="text-xl">
          {game.currentTurn === username
            ? "Your turn!"
            : `Waiting for ${game.currentTurn}`}
        </div>
      </div>
      <div
        className="flex flex-col items-center gap-4 z-0"
        onClick={() => {
          setSelectedUnit(undefined);
        }}
      >
        <div className="z-0 grid grid-cols-12 perspective-distant transform-3d rotate-x-51 rotate-z-43 shadow-3xl  shadow-white transition-all duration-500 hover:-translate-y-4 hover:rotate-x-49 hover:rotate-z-38 gap-2">
          {game.grid.map((row, y) =>
            row.map((tile, x) => (
              <MapTile
                key={`${x}-${y}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction({ x, y });
                }}
                {...{ tile, username, selectedUnit, disabled: !selectedUnit }}
              />
            )),
          )}
        </div>
        <div
          className={
            "px-4 py-2.5 border ring ring-gray-700 ring-offset-4 border-gray-300 bg-neutral-900/50 disabled:cursor-default transition"
          }
        >
          <p className="title">Info</p>
          <p>{socket.state.message}</p>
        </div>
      </div>
    </Layout>
  );
}
