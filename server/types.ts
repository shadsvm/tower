import type { ServerWebSocket } from "bun";
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
      unitType: BuyUnits;
      position: Position;
    };


export type Tile = {
  type: BuyUnits | 'castle' | null,
  size: number | null
  owner: string | null
};
interface Soldier {
  type: 'soldier',
  size: number
  owner: string
}
interface Tower {
  type: 'tower'
  size: number
  owner: string
}
interface Castle {
  type: 'castle'
  size: null
  owner: string
}

export type BuyUnits =  'tower' | 'soldier'

export const UnitCosts = {
  'soldier': 10,
  'tower': 50,
} as const;

export const UnitsIcons = {
  'soldier': '🥷',
  'castle': '🏰',
  'tower': '🗼',
} as const
