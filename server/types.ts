import type { ServerWebSocket } from "bun";
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

export type GamePlayer = {
  username: string;
  points: number;
  castle: Position;
  actionTaken: boolean;
};

export type GameState = {
  roomId: string; // Add this
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
  players: Map<string, RoomPlayer>;  // Changed from Player to RoomPlayer
  state: "waiting" | "playing";
};

export enum ServerMessage {
  ROOM_CREATED = "ROOM_CREATED",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  GAME_STATE = "GAME_STATE",
  ERROR = "ERROR",
}

export type ServerMessages =
  | { type: ServerMessage.ROOM_CREATED; roomId: string }
  | { type: ServerMessage.PLAYER_JOINED; username: string }
  | { type: ServerMessage.PLAYER_LEFT; username: string }
  | { type: ServerMessage.GAME_STATE; state: GameState } // Changed from string[]
  | { type: ServerMessage.ERROR; message: string };

export enum ClientMessage {
  CREATE_ROOM = "CREATE_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
  END_TURN = "END_TURN", // New message
  BUY_UNIT = "BUY_UNIT",
}

export type ClientMessages =
  | { type: ClientMessage.CREATE_ROOM; username: string }
  | { type: ClientMessage.JOIN_ROOM; roomId: string; username: string }
  | { type: ClientMessage.END_TURN; roomId: string; username: string }
  | {
      type: ClientMessage.BUY_UNIT;
      username: string;
      roomId: string;
      unitType: UnitType;
      position: Position;
    };

export enum UnitType {
  SOLDIER = "🥷",
  TOWER = "🗼",
}

export const UnitCosts: Record<UnitType, number> = {
  [UnitType.SOLDIER]: 10,
  [UnitType.TOWER]: 50,
};
