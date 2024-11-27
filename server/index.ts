import type { ServerWebSocket } from "bun";
import { nanoid } from "nanoid";
import { initializeGame } from "./game";
import {
  ClientMessage,
  ServerMessage,
  type ClientMessages,
  type Room,
} from "../shared/types";

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
        const msg = JSON.parse(message as string) as ClientMessages;

        switch (msg.type) {
          case ClientMessage.CREATE_ROOM: {
            const roomId = nanoid(6); // Short, but unique enough
            const room: Room = {
              id: roomId,
              players: new Map([
                [msg.username, { username: msg.username, ws }],
              ]),
              state: "waiting",
            };

            rooms.set(roomId, room);
            ws.send(
              JSON.stringify({ type: ServerMessage.ROOM_CREATED, roomId }),
            );
            break;
          }
          case ClientMessage.JOIN_ROOM: {
            const room = rooms.get(msg.roomId);
            if (!room) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Room not found",
                }),
              );
              return;
            }

            if (room.players.size >= 2) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
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
                  type: ServerMessage.GAME_READY,
                  players,
                }),
              );
            });
            break;
          }
          case ClientMessage.START_GAME: {
            const room = rooms.get(msg.roomId);
            if (!room) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Room not found",
                }),
              );
              return;
            }

            // Get first player (host) from room
            const [hostUsername] = Array.from(room.players.keys());
            if (msg.username !== hostUsername) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Only host can start the game",
                }),
              );
              return;
            }

            if (room.players.size !== 2) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Waiting for second player",
                }),
              );
              return;
            }

            const [player1, player2] = Array.from(room.players.entries());

            const gameState = initializeGame(
              { username: player1[0], ws: player1[1].ws },
              { username: player2[0], ws: player2[1].ws },
            );

            // Send initial state to both players
            room.players.forEach((player) => {
              player.ws.send(
                JSON.stringify({
                  type: ServerMessage.GAME_STATE,
                  state: gameState,
                }),
              );
            });

            room.state = "playing";
          }
        }
      } catch (e) {
        console.error("Error handling message:", e);
        ws.send(
          JSON.stringify({
            type: ServerMessage.ERROR,
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
