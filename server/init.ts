import { GRID_SIZE, INITIAL_POINTS } from "./constant";
import type { GamePlayer, GameState, Room, Tile } from "./types";
// Game state storage
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

  const castles = Object.entries({
    [player1]: { x: 0, y: 0 },
    [player2]: { x: GRID_SIZE - 1, y: GRID_SIZE - 1 }
  })
  const grid: Tile[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({
          owner: null,
          type: null,
          size: null
        })),
    );

  for (let [owner, cords] of castles) {
    grid[cords.y][cords.x] = { owner, size: null, type: 'castle'}
    players[owner] = {
      username: owner,
      points: INITIAL_POINTS,
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
