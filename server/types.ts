import type { ServerWebSocket } from "bun";
import type { UnitsPrices } from "./constant";

export enum Units {
  SOLDIER = 'SOLDIER',
  TOWER = 'TOWER',
  CASTLE = 'CASTLE'
}

export enum ServerMessage {
  ROOM_CREATED = "ROOM_CREATED",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  GAME_STATE = "GAME_STATE",
  GAME_OVER = "GAME_OVER",
  ERROR = "ERROR",
}

export enum ClientMessage {
  CREATE_ROOM = "CREATE_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
  END_TURN = "END_TURN",
  BUY_UNIT = "BUY_UNIT",
  MOVE_UNIT = "MOVE_UNIT",
}

export type Position = {
  x: number;
  y: number;
};

export type Player = {
  username: string;
  points: number;
  castle: Position;
  ws: ServerWebSocket;
};

export type GamePlayer = {
  username: string;
  points: number;
  castle: Position;
};

export type GameState = {
  roomId: string;
  grid: Tile[][];
  players: Record<string, GamePlayer>;
  currentTurn: string;
  turnNumber: number;
};

export type RoomPlayer = {
  username: string;
  ws: ServerWebSocket;
};

export type Room = {
  id: string;
  players: Map<string, RoomPlayer>; // Changed from Player to RoomPlayer
  state: "waiting" | "playing";
};

export type Tile = CastleTile | TowerTile | SoldierTile | EmptyTile

type CastleTile = {
  owner: GamePlayer['username']
  type: Units.CASTLE
  size: null
}
type TowerTile = {
  owner: GamePlayer['username']
  type: Units.TOWER
  size: number
}
type SoldierTile = {
  owner: GamePlayer['username']
  type: Units.SOLDIER
  size: number
}
type EmptyTile = {
  owner: GamePlayer['username'] | null
  type: null
  size: null
}

export type ServerMessages =
  | { type: ServerMessage.ROOM_CREATED; roomId: string }
  | { type: ServerMessage.PLAYER_JOINED; username: string }
  | { type: ServerMessage.PLAYER_LEFT; username: string }
  | { type: ServerMessage.GAME_STATE; state: GameState }
  | { type: ServerMessage.GAME_OVER; username: string }
  | { type: ServerMessage.ERROR; message: string };

export type ClientMessages =
  | { type: ClientMessage.CREATE_ROOM; username: string }
  | { type: ClientMessage.JOIN_ROOM; roomId: string; username: string }
  | { type: ClientMessage.END_TURN; roomId: string; username: string }
  | {
      type: ClientMessage.BUY_UNIT;
      username: string;
      roomId: string;
      unitType: BuyableUnits;
      position: Position;
    }
  | {
      type: ClientMessage.MOVE_UNIT;
      username: string;
      roomId: string;
      unitType: MovableUnits;
      position: Position;
      destination: Position
    }

export type MovableUnits = Units.SOLDIER
export type BuyableUnits = keyof typeof UnitsPrices
