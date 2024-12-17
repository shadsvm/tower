import { nanoid } from "nanoid";
import {
  getState,
  init,
  setState,
} from "./init";
import {
  ClientMessage,
  ServerMessage,
  UnitCosts,
  type ClientMessages,
  type GameState,
  type Room
} from "./types";
import { calculatePoints, getAdjacentTiles } from "./utils";

const rooms = new Map<string, Room>();

const server = Bun.serve<undefined>({
  // development: true,
  port: Number(process.env.PORT) || 3000,
  error(error) {
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  fetch(req) {
    const url = new URL(req.url);

    // When upgrade succeeds, we need to return undefined explicitly
    if (server.upgrade(req)) {
      return undefined;
    }

    if (url.pathname === "/") {
      return new Response(Bun.file("./client/dist/index.html"));
    } else {
      return new Response(Bun.file("./client/dist" + url.pathname));
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
            const roomId = nanoid(6);
            const room: Room = {
              id: roomId,
              players: new Map([
                [msg.username, { username: msg.username, ws }]  // Now matches RoomPlayer type
              ]),
              state: "waiting",
            };

            rooms.set(roomId, room);
            ws.subscribe(roomId);
            ws.send(JSON.stringify({
              type: ServerMessage.ROOM_CREATED,
              roomId,
            }));
            break;
          }
          case ClientMessage.JOIN_ROOM: {
            const room = rooms.get(msg.roomId);
            if (!room) {
              throw new Error("Room not found");
            }

            if (room.players.size >= 2) {
              throw new Error("Room is full");
            }

            // Second player joins
            room.players.set(msg.username, { username: msg.username, ws });  // Now matches RoomPlayer type
            ws.subscribe(msg.roomId);

            // Initialize and start game immediately
            const gameState = init(room);
            setState(room.id, gameState);

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
          case ClientMessage.END_TURN: {
            const room = rooms.get(msg.roomId);
            if (!room) return;

            // Get game state
            const gameState = getState(room.id); // We'll create this function
            if (!gameState) return;

            // Validate it's actually their turn
            if (gameState.currentTurn !== msg.username) {
              throw new Error("Not your turn!");
            }

            // Calculate points for next turn
            const players = gameState.players;
            Object.keys(players).forEach((username) => {
              players[username].points += calculatePoints(
                gameState.grid,
                username,
              );
            });

            // Switch turns
            const playerUsernames = Object.keys(players);
            const currentIndex = playerUsernames.indexOf(gameState.currentTurn);
            const nextPlayer =
              playerUsernames[(currentIndex + 1) % playerUsernames.length];

            const newState: GameState = {
              ...gameState,
              players,
              currentTurn: nextPlayer,
              turnNumber: gameState.turnNumber + 1,
            };

            // Store and broadcast new state
            setState(room.id, newState); // We'll create this function
            server.publish(
              msg.roomId,
              JSON.stringify({
                type: ServerMessage.GAME_STATE,
                state: newState,
              }),
            );
            break;
          }
          case ClientMessage.BUY_UNIT: {
            const room = rooms.get(msg.roomId);
            if (!room) return;

            const gameState = getState(room.id);
            if (!gameState) return;

            // Validate turn
            if (gameState.currentTurn !== msg.username) {
              throw new Error("Not your turn!");
            }

            // Get player data
            const player = gameState.players[msg.username];

            // Check if they can afford it
            const cost = UnitCosts[msg?.unitType];
            if (player.points < cost) {
              throw new Error("Not enough points!");
            }

            const { x, y } = msg.position;
            const target = gameState.grid[y][x];



            if (target.owner === msg.username || target.owner === null) {

              if (msg.unitType === 'soldier') {
                const adjacent = getAdjacentTiles(gameState.grid, msg.position)
                const isAdjacent = adjacent.find((_) => _.tile.owner === msg.username)
                if (!isAdjacent) {
                  throw new Error("Can only place units on owned or adjacent tiles!");
                }
              }
              if (msg.unitType === 'tower') {
                getAdjacentTiles(gameState.grid, msg.position).forEach(({ position }) => {
                  const tile = gameState.grid[position.y][position.x];
                  if (tile.type === null) {
                    let tile = gameState.grid[position.y][position.x]
                    gameState.grid[position.y][position.x] = {
                      ...tile,
                      owner: msg.username,
                    };
                  }
                });
              }

              gameState.grid[y][x] = {
                  owner: msg.username,
                  size: (target?.size ?? 0) + 1,
                  type: msg.unitType
                };


              // Update game state
              setState(room.id, gameState);

              // Broadcast new state
              server.publish(
                msg.roomId,
                JSON.stringify({
                  type: ServerMessage.GAME_STATE,
                  state: gameState
                })
              );
            }
              break;
            }
          }
        } catch (err: any) {
        console.error("Error:", err.message);
        ws.send(
          JSON.stringify({
            type: ServerMessage.ERROR,
            message: err.message,
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
