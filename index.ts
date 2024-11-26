import type { ServerWebSocket } from "bun";
import { nanoid } from "nanoid";

// Types
type Player = {
  username: string;
  ws: ServerWebSocket;
};

type Room = {
  id: string;
  players: Map<string, Player>;
  state: "waiting" | "playing";
};

type ServerMessage =
  | { type: "ROOM_CREATED"; roomId: string }
  | { type: "PLAYER_JOINED"; username: string }
  | { type: "GAME_START"; players: string[] }
  | { type: "ERROR"; message: string };

type ClientMessage =
  | { type: "CREATE_ROOM"; username: string }
  | { type: "JOIN_ROOM"; roomId: string; username: string };

// Game state
const rooms = new Map<string, Room>();

const server = Bun.serve<undefined>({
  development: true,
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    // When upgrade succeeds, we need to return undefined explicitly
    if (server.upgrade(req)) {
      return undefined;
    }

    switch (url.pathname) {
      case "/api/health": {
        return new Response("All good!");
      }
      default:
        return new Response("Not found", { status: 404 });
    }
  },
  websocket: {
    message(ws, message) {
      try {
        const msg = JSON.parse(message as string) as ClientMessage;

        switch (msg.type) {
          case "CREATE_ROOM": {
            const roomId = nanoid(6); // Short, but unique enough
            const room: Room = {
              id: roomId,
              players: new Map([
                [msg.username, { username: msg.username, ws }],
              ]),
              state: "waiting",
            };

            rooms.set(roomId, room);
            ws.send(JSON.stringify({ type: "ROOM_CREATED", roomId }));
            break;
          }

          case "JOIN_ROOM": {
            const room = rooms.get(msg.roomId);
            if (!room) {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Room not found",
                }),
              );
              return;
            }

            if (room.players.size >= 2) {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Room is full",
                }),
              );
              return;
            }

            // Add second player
            room.players.set(msg.username, { username: msg.username, ws });
            room.state = "playing";

            // Notify both players
            const players = Array.from(room.players.keys());
            room.players.forEach((player) => {
              player.ws.send(
                JSON.stringify({
                  type: "GAME_START",
                  players,
                }),
              );
            });
            break;
          }
        }
      } catch (e) {
        console.error("Error handling message:", e);
        ws.send(
          JSON.stringify({
            type: "ERROR",
            message: "Invalid message format",
          }),
        );
      }
    },

    close(ws) {
      // Clean up rooms when players disconnect
      for (const [roomId, room] of rooms.entries()) {
        for (const [username, player] of room.players.entries()) {
          if (player.ws === ws) {
            room.players.delete(username);
            if (room.players.size === 0) {
              rooms.delete(roomId);
            }
            break;
          }
        }
      }
    },
  },
});
