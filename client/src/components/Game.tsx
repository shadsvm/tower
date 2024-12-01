import { UseSocket } from "src/hooks/useSocket";
import { MapTile } from "./MapTile";

export const Game = ({ game, username }: UseSocket) => {
  if (!game) return <div>something went wrong</div>;

  const myData = game.players[username];
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg">Points: {myData.points}</div>
      <div className="text-xl">
        {game.currentTurn === username
          ? "Your turn!"
          : `Waiting for ${game.currentTurn}`}
      </div>
      S
      <div className="grid grid-cols-12 perspective-distant transform-3d rotate-x-51 rotate-z-43 shadow-3xl  shadow-white transition-all duration-500 hover:-translate-y-4 hover:rotate-x-49 hover:rotate-z-38 gap-1">
        {game.grid.map((row, y) =>
          row.map((tile, x) => (
            <MapTile key={`${x}-${y}`} tile={tile} username={username} />
          )),
        )}
      </div>
    </div>
  );
};
