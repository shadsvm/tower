import { Tile } from "@shared/types";
import { ComponentProps } from "react";

export const MapTile = ({
  tile,
  username,
  ...rest
}: {
  tile: Tile;
  username: string;
} & ComponentProps<"button">) => {
  const getColor = () => {
    if (!tile.owner) return "bg-gray-700";
    return tile.owner === username ? "bg-blue-500" : "bg-red-500";
  };

  return (
    <button
      className={`w-12 h-12 ${getColor()} opacity-75 disabled:opacity-50 hover:opacity-100 border border-gray-600 relative`}
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
    </button>
  );
};
