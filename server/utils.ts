import { Config, Units, type GamePlayer, type GameState, type Position, type Room, type Tile } from "./types";

export type Adjacent = {
  tile: Tile;
  position: Position;
};


export function init(room: Room): GameState {
  const players: Record<string, GamePlayer> | never = {};
  const [player1, player2] = room.players.keys();
  const { gridSize, initialPoints } = Config;

  const castles = Object.entries({
    [player1]: { x: 0, y: 0 },
    [player2]: { x: gridSize - 1, y: gridSize - 1 }
  })
  const grid: Tile[][] = Array(gridSize)
    .fill(null)
    .map(() =>
      Array(gridSize)
        .fill(null)
        .map(() => ({
          owner: null,
          type: null,
          size: null
        })),
    );

  for (let [owner, cords] of castles) {
    grid[cords.y][cords.x] = { owner, size: null, type: Units.CASTLE}
    players[owner] = {
      username: owner,
      points: initialPoints,
      castle: cords
    }
  }

  return {
    grid,
    players,
    currentTurn: player1,
    turnNumber: 1,
    roomId: room.id,
  };
}


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
