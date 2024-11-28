import type { ServerWebSocket } from "bun";
import type { Room } from "../shared/types";

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

export type Tile = {
  owner: string | null;
  units: number;
  type: "empty" | "castle" | "tower";
};

export type GameState = {
  grid: Tile[][];
  players: Map<string, Player>;
  currentTurn: string;
  turnNumber: number;
};

const GRID_SIZE = 12;
const INITIAL_POINTS = 50;
const CASTLE_UNITS = 100;

export function initializeGame(room: Room): GameState {
  const [player1Entry, player2Entry] = Array.from(room.players.entries());
  const player1 = { username: player1Entry[0], ws: player1Entry[1].ws };
  const player2 = { username: player2Entry[0], ws: player2Entry[1].ws };

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

  //
  const player1Castle: Position = { x: 0, y: 0 };
  const player2Castle: Position = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };

  grid[player1Castle.y][player1Castle.x] = {
    owner: player1.username,
    units: CASTLE_UNITS,
    type: "castle",
  };

  grid[player2Castle.y][player2Castle.x] = {
    owner: player2.username,
    units: CASTLE_UNITS,
    type: "castle",
  };

  const surroundingTiles = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ];

  surroundingTiles.forEach(({ x, y }) => {
    grid[y][x] = {
      owner: player1.username,
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
      owner: player2.username,
      units: 0,
      type: "empty",
    };
  });

  const players = new Map<string, Player>([
    [
      player1.username,
      {
        username: player1.username,
        points: INITIAL_POINTS,
        castle: player1Castle,
        actionTaken: false,
        ws: player1.ws,
      },
    ],
    [
      player2.username,
      {
        username: player2.username,
        points: INITIAL_POINTS,
        castle: player2Castle,
        actionTaken: false,
        ws: player2.ws,
      },
    ],
  ]);

  return {
    grid,
    players,
    currentTurn: player1.username,
    turnNumber: 1,
  };
}

export function calculatePoints(grid: Tile[][], username: string): number {
  return grid
    .flat()
    .reduce((total, tile) => (tile.owner === username ? total + 10 : total), 0);
}
