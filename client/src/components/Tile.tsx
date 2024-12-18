import { BuyUnits, Tile as TileType, UnitsIcons } from "@server/types";
import { ComponentProps } from "react";


export default function Tile({
  tile,
  username,
  selectedUnit,
  ...rest
}: {
  tile: TileType;
  username: string;
  selectedUnit?: BuyUnits
} & ComponentProps<"div">) {
  const getColor = () => {
    if (!tile.owner) return "bg-neutral-800";
    return tile.owner === username ? "btn btn-info" : "btn btn-error";
  };

  return (
    <div
      className={`size-13 ${getColor()} ${selectedUnit && 'hover:bg-info/20'} rounded  transition drop-shadow-md relative`}
      {...rest}
    >
        {tile?.type &&
        <span className="absolute inset-0 text-3xl flex items-center justify-center">
          {UnitsIcons[tile?.type]}
        </span>
        }
      {(tile?.size ?? 0) > 0 && (
        <span className="absolute top-0 right-0 text-xs p-1">
          {tile.size}
        </span>
      )}
    </div>
  );
}
