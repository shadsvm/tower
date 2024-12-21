import { Config } from "./constant";
import type { GameState, Position, Tile } from "./types";

export type Adjacent = {
  tile: Tile;
  position: Position;
};


export function calculatePoints(grid: Tile[][], username: string): number {
  return grid
    .flat()
    .reduce((total, tile) => (tile.owner === username ? total + Config.incrementPoints : total), 0);
}

export function getAdjacentTiles(grid: Tile[][], position: Position): Adjacent[] {
  const adjacent: Adjacent[] = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]  // Left, Right, Up, Down
  ];

  for (const [dx, dy] of directions) {
    const x = position.x + dx;
    const y = position.y + dy;
    const {gridSize} = Config

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      adjacent.push({
        tile: grid[y][x],
        position: { x, y }
      });
    }
  }

  return adjacent;
}

export function endTurn(gameState: GameState): GameState {
    const playerUsernames = Object.keys(gameState.players);
    playerUsernames.forEach((username) => {
      gameState.players[username].points += calculatePoints(
        gameState.grid,
        username,
      );
    });
    const currentIndex = playerUsernames.indexOf(gameState.currentTurn);
    const nextPlayer =
      playerUsernames[(currentIndex + 1) % playerUsernames.length];

    return {
      ...gameState,
      currentTurn: nextPlayer,
      turnNumber: gameState.turnNumber + 1,
    };
}
