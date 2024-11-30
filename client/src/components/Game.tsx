import { ClientMessages, GameState, Tile } from "@shared/types";

type GameProps = {
  state: GameState;
  username: string;
  roomId: string;
  sendMessage: (msg: ClientMessages) => void;
};

const TileComponent = ({
  tile,
  username,
}: {
  tile: Tile;
  username: string;
}) => {
  const getColor = () => {
    if (!tile.owner) return "bg-gray-700";
    return tile.owner === username ? "bg-blue-500" : "bg-red-500";
  };

  return (
    <div className={`w-12 h-12 ${getColor()} border border-gray-600 relative`}>
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
};
import { TurnInfo } from "./TurnInfo";
import { ClientMessage } from "@shared/types";

export const Game = ({ state, username, sendMessage, roomId }: GameProps) => {
  const isMyTurn = state.currentTurn === username;
  const myData = state.players[username];

  const handleEndTurn = () => {
    sendMessage({
      type: ClientMessage.END_TURN,
      username,
      roomId,
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <TurnInfo
        isMyTurn={isMyTurn}
        currentTurn={state.currentTurn}
        turnNumber={state.turnNumber}
        onEndTurn={handleEndTurn}
      />
      <div className="text-lg">Points: {myData.points}</div>
      <div className="grid grid-cols-12 perspective-distant transform-3d rotate-x-51 rotate-z-43 shadow-3xl  shadow-white transition-all duration-500 hover:-translate-y-4 hover:rotate-x-49 hover:rotate-z-38 gap-1">
        {state.grid.map((row, y) =>
          row.map((tile, x) => (
            <TileComponent key={`${x}-${y}`} tile={tile} username={username} />
          )),
        )}
      </div>
    </div>
  );
};
