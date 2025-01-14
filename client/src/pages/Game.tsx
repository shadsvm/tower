import Actions from "@/components/Actions";
import Tile from "@/components/Tile";
import { useGameStore } from "@/store/game";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import {
  BuyableUnits,
  ClientMessage,
  MovableUnits,
  Position,
  Tile as TileType,
  Units,
} from "@server/types";
import { useMemo, useState } from "react";

export interface ActionResolve {
  type?: ClientMessage;
  unitType?: BuyableUnits;
  position?: Position;
}
export interface MoveUnit {
  unitType: MovableUnits;
  position?: Position;
}

const initialMoveUnit = {
  unitType: Units.SOLDIER,
  position: undefined,
} as const;

export default function Game() {
  const { state } = useGameStore();
  const { send } = useSocketStore();
  const { username } = useUserStore();
  const [buyUnit, setBuyUnit] = useState<BuyableUnits | undefined>(undefined);
  const [moveUnit, setMoveUnit] = useState<MoveUnit>({ ...initialMoveUnit });
  const disabled = useMemo(
    () => state?.currentTurn !== username,
    [username, state?.currentTurn]
  );

  function handleTileClick(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    tile: TileType,
    position: Position
  ) {
    event.stopPropagation();
    if (buyUnit) {
      send({
        type: ClientMessage.BUY_UNIT,
        unitType: buyUnit,
        position,
      });
      setBuyUnit(undefined);
    } else if (!moveUnit.position) {
      if (tile.owner !== username || tile.type !== Units.SOLDIER) return;
      setMoveUnit((prev) => ({ ...prev, position }));
    } else if (
      JSON.stringify(moveUnit?.position) === JSON.stringify(position)
    ) {
      setMoveUnit(initialMoveUnit);
    } else {
      send({
        type: ClientMessage.MOVE_UNIT,
        destination: position,
        ...moveUnit,
      });
      setMoveUnit(initialMoveUnit);
    }
  }

  if (state === undefined) return <div>Something went wrong</div>;
  return (
    <div className="space-y-5">
      <header className="  border-b-2 border-stone-500 py-2 flex justify-between items-center text-lg">
        <div className="flex-1 overflow-hidden inline-flex space-x-2">
          <p className="text-stone-300">Turn:</p>
          <p className={disabled ? "text-error" : "text-info"}>
            {state.currentTurn}
          </p>
        </div>
        <div className="text-green-300">{state.players[username].points}$</div>
      </header>

      <div
        className="flex flex-col items-center gap-4 z-10 "
        onClick={() => setBuyUnit(undefined)}
      >
        <div className="grid grid-cols-6 transition-all duration-500 gap-1">
          {state.grid.map((row, y) =>
            row.map((tile, x) => (
              <Tile
                key={[x, y].join("-")}
                onClick={(e) => handleTileClick(e, tile, { x, y })}
                {...{
                  tile,
                  username,
                  disabled: !buyUnit,
                  buyUnit,
                  moveUnit,
                  position: { x, y },
                }}
              />
            ))
          )}
        </div>
      </div>
      <Actions {...{ buyUnit, setBuyUnit }} />
    </div>
  );
}
