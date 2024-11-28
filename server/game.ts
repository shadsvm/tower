import type { ServerWebSocket } from "bun";
import type { GamePlayer, GameState, Room, Tile } from "../shared/types";

export type Position = {
  x: number;
  y: number;
};

export type Player = {
  username: string;
  points: number;
  castle: Position;
  actionTaken: boolean;
  ws: ServerWebSocket;
};

const GRID_SIZE = 12;
const INITIAL_POINTS = 50;
const CASTLE_UNITS = 100;

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

  // Set castles
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

  // Set surrounding tiles
  const surroundingTiles = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];

  surroundingTiles.forEach(({ x, y }) => {
    grid[y][x] = {
      owner: player1Username,
      units: 0,
      type: "empty",
    };
  });

  const p2SurroundingTiles = surroundingTiles.map(({ x, y }) => ({
    x: GRID_SIZE - 1 - x,
    y: GRID_SIZE - 1 - y,
  }));

  p2SurroundingTiles.forEach(({ x, y }) => {
    grid[y][x] = {
      owner: player2Username,
      units: 0,
      type: "empty",
    };
  });

  return {
    grid,
    players,
    currentTurn: player1Username,
    turnNumber: 1,
  };
}

export function calculatePoints(grid: Tile[][], username: string): number {
  return grid
    .flat()
    .reduce((total, tile) => (tile.owner === username ? total + 10 : total), 0);
}
