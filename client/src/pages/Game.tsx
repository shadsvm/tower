import Actions from "@/components/Actions";
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
    <div className="space-y-5">
      <Actions
        disabled={socket.game.currentTurn !== socket.username}
        socket={socket}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
      />
      <div
        className="flex flex-col items-center gap-4 z-10"
        onClick={() => {
          setSelectedUnit(undefined);
        }}
      >
        <div className="grid grid-cols-12 shadow-white transition-all duration-500  gap-1">
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
    </div>
  );
}
