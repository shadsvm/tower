import Actions from "@/components/Actions";
import Tile from "@/components/Tile";
import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { ClientMessage, Position, UnitType } from "@server/types";
import { useState } from "react";

export interface ActionResolve {
  type?: ClientMessage;
  unitType?: UnitType;
  position?: Position;
}

export default function Game() {
  const {state} = useGameStore();
  const send = useSocketStore(({send}) => send);
  const username = useUserStore(({username}) => username);
  const [selectedUnit, setSelectedUnit] = useState<UnitType | undefined>(
    undefined,
  );

  if (state === undefined) return (<div>Something went wrong</div>);

  return (
    <div className="space-y-5">
      <Actions
        disabled={state.currentTurn !== username}
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
          {state.grid.map((row, y) =>
            row.map((tile, x) => (
              <Tile
                key={`${x}-${y}`}
                onClick={(e) => {
                  if (!selectedUnit) return;
                  e.stopPropagation();
                  send({
                    type: ClientMessage.BUY_UNIT,
                    unitType: selectedUnit,
                    position: { x, y },
                  });
                }}
                {...{
                  tile,
                  username: username,
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
