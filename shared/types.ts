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

export type ServerMessage =
  | { type: "ROOM_CREATED"; roomId: string }
  | { type: "PLAYER_JOINED"; username: string }
  | { type: "GAME_START"; players: string[] }
  | { type: "GAME_STATE"; state: string[] }
  | { type: "ERROR"; message: string };

export type ClientMessage =
  | { type: "CREATE_ROOM"; username: string }
  | { type: "JOIN_ROOM"; roomId: string; username: string }
  | { type: "START_GAME"; roomId: string; username: string };

// Game state
