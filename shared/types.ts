import type { ServerWebSocket } from "bun";

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
  ROOM_CREATED = "ROOM_CREATED",
  PLAYER_JOINED = "PLAYER_JOINED",
  PLAYER_LEFT = "PLAYER_LEFT",
  GAME_STATE = "GAME_STATE",
  ERROR = "ERROR",
}

export enum ClientMessage {
  CREATE_ROOM = "CREATE_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
}

export type ServerMessages =
  | { type: ServerMessage.ROOM_CREATED; roomId: string }
  | { type: ServerMessage.PLAYER_JOINED; username: string }
  | { type: ServerMessage.PLAYER_LEFT; username: string }
  | { type: ServerMessage.GAME_STATE; state: string[] }
  | { type: ServerMessage.ERROR; message: string };

export type ClientMessages =
  | { type: ClientMessage.CREATE_ROOM; username: string }
  | { type: ClientMessage.JOIN_ROOM; roomId: string; username: string };
