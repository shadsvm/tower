import Actions from "@/components/Actions";
import Alert from "@/components/Alert";
import Layout from "@/components/Layout";
import Tile from "@/components/Tile";
import { UseSocket } from "@/hooks/useSocket";
import { ClientMessage, Position, UnitType } from "@server/types";
import { useState } from "react";

export interface ActionResolve {
  type?: ClientMessage;
  unitType?: UnitType;
  position?: Position;
}

export default function Game({ socket }: { socket: UseSocket }) {
  const debug = false;
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>(
    undefined,
  );
  if (!socket.game) return;

  const handleAction = (position: Position) => {
    if (!selectedUnit) return;
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
        <Actions
          disabled={socket.game.currentTurn !== socket.username}
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
          {socket.game.currentTurn === socket.username
            ? "Your turn!"
            : `Waiting for ${socket.game.currentTurn}`}
        </div>
      </div>
      <Alert text={socket.state.message} />
      <div
        className="flex flex-col items-center gap-4 z-0"
        onClick={() => {
          setSelectedUnit(undefined);
        }}
      >
        <div className="z-0 grid grid-cols-12 perspective-distant transform-3d rotate-x-51 rotate-z-43 shadow-3xl  shadow-white transition-all duration-500 hover:-translate-y-4 hover:rotate-x-49 hover:rotate-z-38 gap-2">
          {socket.game.grid.map((row, y) =>
            row.map((tile, x) => (
              <Tile
                key={`${x}-${y}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction({ x, y });
                }}
                {...{
                  tile,
                  username: socket.username,
                  disabled: !selectedUnit,
                }}
              />
            )),
          )}
        </div>
      </div>
    </Layout>
  );
}
