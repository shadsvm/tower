import { nanoid } from "nanoid";
import {
  calculatePoints,
  getGameState,
  initializeGame,
  setGameState,
} from "./game";
import {
  ClientMessage,
  ServerMessage,
  UnitCosts,
  UnitType,
  type ClientMessages,
  type GameState,
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
          case ClientMessage.END_TURN: {
            const room = rooms.get(msg.roomId);
            if (!room) return;

            // Get game state
            const gameState = getGameState(room.id); // We'll create this function
            if (!gameState) return;

            // Validate it's actually their turn
            if (gameState.currentTurn !== msg.username) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Not your turn!",
                }),
              );
              return;
            }

            // Calculate points for next turn
            const players = gameState.players;
            Object.keys(players).forEach((username) => {
              players[username].points += calculatePoints(
                gameState.grid,
                username,
              );
              players[username].actionTaken = false; // Reset action flag
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
            setGameState(room.id, newState); // We'll create this function
            server.publish(
              msg.roomId,
              JSON.stringify({
                type: ServerMessage.GAME_STATE,
                state: newState,
              }),
            );
            break;
          }
          // In the message switch
          case ClientMessage.BUY_UNIT: {
            const room = rooms.get(msg.roomId);
            if (!room) return;

            const gameState = getGameState(room.id);
            if (!gameState) return;

            // Validate turn
            if (gameState.currentTurn !== msg.username) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Not your turn!",
                }),
              );
              return;
            }

            // Get player data
            const player = gameState.players[msg.username];
            if (player.actionTaken) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "You've already taken an action this turn!",
                }),
              );
              return;
            }

            // Check if they can afford it
            const cost = UnitCosts[msg.unitType as UnitType];
            if (player.points < cost) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Not enough points!",
                }),
              );
              return;
            }

            // Validate placement position
            const { x, y } = msg.position;
            const castle = player.castle;

            // Must be adjacent to castle
            const isAdjacent =
              Math.abs(x - castle.x) <= 1 &&
              Math.abs(y - castle.y) <= 1 &&
              !(x === castle.x && y === castle.y);

            if (!isAdjacent) {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Must place units adjacent to your castle!",
                }),
              );
              return;
            }

            // Check if tile is available
            const targetTile = gameState.grid[y][x];
            if (targetTile.type === "castle" || targetTile.type === "tower") {
              ws.send(
                JSON.stringify({
                  type: ServerMessage.ERROR,
                  message: "Can't place units on buildings!",
                }),
              );
              return;
            }

            // All validations passed, place the unit
            const unitCount = msg.unitType === UnitType.HORSEMAN ? 5 : 10;

            gameState.grid[y][x] = {
              owner: msg.username,
              units: unitCount,
              type:
                msg.unitType === UnitType.SMALL_TOWER ||
                msg.unitType === UnitType.LARGE_TOWER
                  ? "tower"
                  : "empty",
            };

            // Deduct points and mark action taken
            player.points -= cost;
            player.actionTaken = true;

            // Update game state
            setGameState(room.id, gameState);

            // Broadcast new state
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
