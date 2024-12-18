import Actions from "@/components/Actions";
import Tile from "@/components/Tile";
import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { BuyUnits, ClientMessage, Position } from "@server/types";
import { useMemo, useState } from "react";

export interface ActionResolve {
  type?: ClientMessage;
  unitType?: BuyUnits;
  position?: Position;
}

export default function Game() {
  const {state} = useGameStore();
  const {send} = useSocketStore();
  const {username} = useUserStore();
  const [selectedUnit, setSelectedUnit] = useState<BuyUnits | undefined>(
    undefined,
  );
  const disabled = useMemo(() => state?.currentTurn !== username, [username,state?.currentTurn])

  if (state === undefined) return (<div>Something went wrong</div>);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center text-lg">
        <div className={disabled ? 'text-error' : 'text-info'}>
          {disabled
            ? `Waiting for ${state.currentTurn}`
            : "Your turn!"}
        </div>
        <div className="flex justify-center items-center gap-2 mr-8">
          {state.players[username].points}
          💰
        </div>
      </div>


      <div
        className="flex flex-col items-center gap-4 z-10 "
        onClick={() => {
          setSelectedUnit(undefined);
        }}
      >
        <div className="grid grid-cols-6  transition-all duration-500 gap-1">
          {state.grid.map((row, y) =>
            row.map((tile, x) => (
              <Tile
                selectedUnit={selectedUnit}
                key={`${x}-${y}`}
                onClick={(e) => {
                  if (!selectedUnit) return;
                  e.stopPropagation();
                  send({
                    type: ClientMessage.BUY_UNIT,
                    unitType: selectedUnit,
                    position: { x, y },
                  });
                  setSelectedUnit(undefined)
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
      <Actions
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
      />
    </div>
  );
}
