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
  // ... other config
  websocket: {
    message(ws, message) {
      try {
        const msg = JSON.parse(message as string) as ClientMessages;
        console.log("Received message:", msg); // Debug log

        switch (msg.type) {
          case ClientMessage.CREATE_ROOM: {
            console.log("Creating room..."); // Debug log

            const roomId = nanoid(6);
            const room: Room = {
              id: roomId,
              players: new Map([
                [msg.username, { username: msg.username, ws }],
              ]),
              state: "waiting",
            };

            rooms.set(roomId, room);
            ws.subscribe(roomId); // Host subscribes to room

            const response = {
              type: ServerMessage.ROOM_CREATED,
              roomId,
            };
            console.log("Sending response:", response); // Debug log
            ws.send(JSON.stringify(response));
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

            // Second player joins
            room.players.set(msg.username, { username: msg.username, ws });
            ws.subscribe(msg.roomId);

            // Initialize and start game immediately
            const gameState = initializeGame(room);
            room.state = "playing";

            // Notify everyone in room
            server.publish(
              msg.roomId,
              JSON.stringify({
                type: ServerMessage.GAME_STATE,
                state: gameState,
              }),
            );

            break;
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
      // We might want to notify other player in room
      for (const [roomId, room] of rooms.entries()) {
        for (const [username, player] of room.players.entries()) {
          if (player.ws === ws) {
            server.publish(
              roomId,
              JSON.stringify({
                type: ServerMessage.PLAYER_LEFT,
                username,
              }),
            );
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
