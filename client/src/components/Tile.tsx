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
      className={`size-13 ${getColor()} rounded hover:bg-neutral-900 transition drop-shadow-md relative`}
      {...rest}
    >
        <span className="absolute inset-0 flex items-center justify-center">
          {tile?.type}
        </span>
      {(tile?.size ?? 0) > 0 && (
        <span className="absolute bottom-0 right-0 text-xs p-1">
          {tile.size}
        </span>
      )}
    </div>
  );
}
