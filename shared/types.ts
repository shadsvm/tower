import type { ServerWebSocket } from "bun";

// Types
export type Player = {
  username: string;
  ws: ServerWebSocket;
};

export type Room = {
  id: string;
  players: Map<string, Player>;
  state: "waiting" | "playing";
};

export enum ServerMessage {
  "ROOM_CREATED",
  "PLAYER_JOINED",
  "GAME_READY",
  "GAME_STATE",
  "ERROR",
}

export enum ClientMessage {
  "CREATE_ROOM",
  "JOIN_ROOM",
  "START_GAME",
}

export type ServerMessages =
  | { type: ServerMessage.ROOM_CREATED; roomId: string }
  | { type: ServerMessage.PLAYER_JOINED; username: string }
  | { type: ServerMessage.GAME_READY; players: string[] }
  | { type: ServerMessage.GAME_STATE; state: string[] }
  | { type: ServerMessage.ERROR; message: string };

export type ClientMessages =
  | { type: ClientMessage.CREATE_ROOM; username: string }
  | { type: ClientMessage.JOIN_ROOM; roomId: string; username: string }
  | { type: ClientMessage.START_GAME; roomId: string; username: string };

// Game state
