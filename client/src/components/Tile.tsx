import { MoveUnit } from "@/pages/Game";
import { useGameStore } from "@/store/game";
import { BuyableUnits, Position, Tile as TileType, Units, UnitsIcons } from "@server/types";
import { getAdjacentTiles } from "@server/utils";
import { ComponentProps, useMemo } from "react";

export default function Tile({
  tile,
  username,
  position,
  buyUnit,
  moveUnit,
  ...rest
}: {
  tile: TileType
  username: string
  position: Position
  buyUnit?: BuyableUnits
  moveUnit?: MoveUnit
} & ComponentProps<"div">) {

  const {state} = useGameStore()

  const isAdjacentMoveUnit = useMemo(() => {
    if (!state?.grid || !moveUnit?.position) return false;
    const adjacentToMoveUnit = getAdjacentTiles(state?.grid, moveUnit?.position).filter(({tile: {type}}) => type !== Units.CASTLE && type !== Units.TOWER)
    return !!(adjacentToMoveUnit.find(({position: {x, y}}) => x === position.x && y === position.y))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveUnit?.position])

  const getColor = () => {
    if (JSON.stringify(moveUnit?.position) === JSON.stringify(position) || isAdjacentMoveUnit) return 'btn btn-warn' //todo
    if (!tile.owner) return "bg-neutral-800";
    return tile.owner === username ? "btn btn-info" : "btn btn-error";
  };

  return (
    <div
      className={`size-13 ${getColor()} ${buyUnit && 'hover:bg-info/20'} rounded  transition drop-shadow-md relative`}
      {...rest}
    >
        {tile?.type &&
        <span className="absolute inset-0 text-3xl flex items-center justify-center">
          {UnitsIcons[tile?.type]}
        </span>
        }
      {tile?.size && (
        <span className="absolute top-0 right-0 text-xs p-1">
          {tile.size}
          {tile.type === Units.SOLDIER && '⚔️'}
          {tile.type === Units.TOWER && '🛡️'}
        </span>
      )}
    </div>
  );
}
