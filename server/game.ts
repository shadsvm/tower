import { CASTLE_UNITS, GRID_SIZE, INITIAL_POINTS } from "./constant";
import type { GamePlayer, GameState, Position, Room, Tile } from "./types";
// Game state storage
const gameStates = new Map<string, GameState>();

export function setGameState(roomId: string, state: GameState) {
  gameStates.set(roomId, state);
}

export function getGameState(roomId: string): GameState | undefined {
  return gameStates.get(roomId);
}

export function initializeGame(room: Room): GameState {
  const [player1Entry, player2Entry] = Array.from(room.players.entries());
  const player1Username = player1Entry[0];
  const player2Username = player2Entry[0];

  const grid: Tile[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({
          owner: null,
          units: 0,
          type: "empty",
        })),
    );

  const player1Castle: Position = { x: 0, y: 0 };
  const player2Castle: Position = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };

  // Only set castles, remove surrounding tiles setup
  grid[player1Castle.y][player1Castle.x] = {
    owner: player1Username,
    units: CASTLE_UNITS,
    type: "castle",
  };

  grid[player2Castle.y][player2Castle.x] = {
    owner: player2Username,
    units: CASTLE_UNITS,
    type: "castle",
  };

  // Create players object
  const players: Record<string, GamePlayer> = {
    [player1Username]: {
      username: player1Username,
      points: INITIAL_POINTS,
      castle: player1Castle,
      actionTaken: false,
    },
    [player2Username]: {
      username: player2Username,
      points: INITIAL_POINTS,
      castle: player2Castle,
      actionTaken: false,
    },
  };

  const initialState = {
    grid,
    players,
    currentTurn: player1Username,
    turnNumber: 1,
    roomId: room.id,
  };

  setGameState(room.id, initialState);

  return initialState;
}

export function calculatePoints(grid: Tile[][], username: string): number {
  return grid
    .flat()
    .reduce((total, tile) => (tile.owner === username ? total + 10 : total), 0);
}
