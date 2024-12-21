import { Config } from "./constant";
import { Units, type GamePlayer, type GameState, type Room, type Tile } from "./types";

const gameStates = new Map<string, GameState>();

export function setState(roomId: string, state: GameState) {
  gameStates.set(roomId, state);
}

export function getState(roomId: string): GameState | undefined {
  return gameStates.get(roomId);
}

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

  const initialState = {
    grid,
    players,
    currentTurn: player1,
    turnNumber: 1,
    roomId: room.id,
  };

  return initialState;
}
