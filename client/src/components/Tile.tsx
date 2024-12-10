import { Tile as TileType } from "@server/types";
import { ComponentProps } from "react";

export default function Tile({
  tile,
  username,
  ...rest
}: {
  tile: TileType;
  username: string;
} & ComponentProps<"div">) {
  const getColor = () => {
    if (!tile.owner) return "bg-neutral-800";
    return tile.owner === username ? "bg-blue-500" : "bg-red-500";
  };

  return (
    <div
      className={`size-13 ${getColor()} rounded disabled:opacity-50 shadow shadow-neutral-500 relative`}
      {...rest}
    >
      {tile.type === "castle" && (
        <span className="absolute inset-0 flex items-center justify-center">
          🏰
        </span>
      )}
      {tile.type === "tower" && (
        <span className="absolute inset-0 flex items-center justify-center">
          🗼
        </span>
      )}
      {tile.units > 0 && (
        <span className="absolute bottom-0 right-0 text-xs p-1">
          {tile.units}
        </span>
      )}
    </div>
  );
}
