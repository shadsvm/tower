import { nanoid } from "nanoid";
import {
    ClientMessage,
    ServerMessage,
    Units,
    UnitsPrices,
    type ClientMessages,
    type GameState,
    type Room
} from "./types";
import { endTurn, getAdjacentTiles, init } from "./utils";

const rooms = new Map<string, Room>();
const state = new Map<string, GameState>();

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
  websocket: {
    message(ws, message) {
      try {
        const msg = JSON.parse(message as string) as ClientMessages;
        // console.log("Received message:", msg); // Debug log

        switch (msg.type) {
          case ClientMessage.CREATE_ROOM: {
            const roomId = nanoid(6);
            const room: Room = {
              id: roomId,
              state: "waiting",
              players: new Map([
                [msg.username, ws ]
              ]),
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
            room.players.set(msg.username, ws);
            // Now matches RoomPlayer type
            ws.subscribe(msg.roomId);

            // Initialize and start game immediately
            const gameState = init(room);
            state.set(room.id, gameState);
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

            const gameState = state.get(room.id);
            if (!gameState) return;


            if (gameState.currentTurn !== msg.username) {
              throw new Error("Not your turn!");
            }

            const newState = endTurn(gameState)
            // Store and broadcast new state
            state.set(room.id, newState);
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

            const gameState = state.get(room.id);
            if (!gameState) return;


            if (gameState.currentTurn !== msg.username) {
              throw new Error("Not your turn!");
            }

            const player = gameState.players[msg.username];
            const cost = UnitsPrices[msg?.unitType];
            if (player.points < cost) {
              throw new Error("Not enough points!");
            }

            const { x, y } = msg.position;
            const target = gameState.grid[y][x];

            if (target.owner === msg.username || target.owner === null) {

              if (msg.unitType ===  Units.SOLDIER) {
                const adjacent = getAdjacentTiles(gameState.grid, msg.position)
                const isAdjacent = adjacent.find((_) => _.tile.owner === msg.username)
                if (!isAdjacent) {
                  throw new Error("Can only place units on owned or adjacent tiles!");
                }
              }
              if (msg.unitType === Units.TOWER) {
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
                  size: (target?.size ?? 0) +
                  UnitsPrices[msg.unitType],
                  type: msg.unitType
                };

              const newState = endTurn(gameState)
              state.set(room.id, newState);
              server.publish(
                msg.roomId,
                JSON.stringify({
                  type: ServerMessage.GAME_STATE,
                  state: newState
                })
              );
            }
            break;
          }

          case ClientMessage.MOVE_UNIT: {
            const room = rooms.get(msg.roomId);
            if (!room) return;

            const gameState = state.get(room.id);
            if (!gameState) return;

            if (gameState.currentTurn !== msg.username) {
              throw new Error("Not your turn!");
            }

            const origin = gameState.grid[msg.position.y][msg.position.x];
            const target = gameState.grid[msg.destination.y][msg.destination.x];

            if (origin.type !==  Units.SOLDIER) {
              throw new Error("This unit cannot move")
            }

            if (origin.owner !==  msg.username) {
              throw new Error("This is not yours unit")
            }

            const adjacent = getAdjacentTiles(gameState.grid, msg.position)
            const isAdjacent = !!(adjacent.find(({position: {x, y}}) => x === msg.destination.x && y === msg.destination.y))

            if (!isAdjacent) {
              throw new Error("Outside of your reach");
            }

            if (target.type === null) {
              gameState.grid[msg.position.y][msg.position.x] = {
                  owner: msg.username,
                  size: null,
                  type: null
                };
              gameState.grid[msg.destination.y][msg.destination.x] = {
                ...origin
              };
            }

            if (target.type === Units.CASTLE) {
              if (target.owner !== origin.owner) {
                server.publish(
                  msg.roomId,
                  JSON.stringify({
                    type: ServerMessage.GAME_OVER,
                    username: origin.owner
                  })
                )
                setTimeout(() => {
                  room.players
                    .keys()
                    .forEach(
                      (username) => room.players.delete(username)
                    )
                    rooms.delete(msg.roomId);
                }, 3000)
                break;
              }
            }

            if (target.type === Units.TOWER) {
              if (target.owner === origin.owner) {
                throw new Error('You cannot destroy your own tower')
              }
              else if (origin.size <= target.size) {
                throw new Error('This unit is too weak to destroy this tower.')
              }
              else {
                gameState.grid[msg.position.y][msg.position.x] = {
                  owner: msg.username,
                  size: null,
                  type: null
                };
                gameState.grid[msg.destination.y][msg.destination.x] = {
                  owner: msg.username,
                  size: origin.size - target.size,
                  type: Units.SOLDIER
                  };

              }
            }

            if (target.type === Units.SOLDIER) {
              if (target.owner === origin.owner) {
                gameState.grid[msg.position.y][msg.position.x] = {
                  owner: msg.username,
                  size: null,
                  type: null
                };
                gameState.grid[msg.destination.y][msg.destination.x] = {
                  owner: msg.username,
                  size: origin.size + target.size,
                  type: Units.SOLDIER
                  };
                }
              else if (target.size) {
                const fightWinner = origin.size > target.size
                  ? {...origin, owner: origin.owner, size: origin.size - target.size}
                  : {...target, owner: target.owner, size: target.size - origin.size}

                gameState.grid[msg.position.y][msg.position.x] = {
                  owner: msg.username,
                  size: null,
                  type: null
                };
                gameState.grid[msg.destination.y][msg.destination.x] = fightWinner;
              }
            }

            const newState = endTurn(gameState)
            state.set(room.id, newState);
            server.publish(
              msg.roomId,
              JSON.stringify({
                type: ServerMessage.GAME_STATE,
                state: newState
              })
            );
          }
        break;
        }

        } catch ({message}: any) {
        // console.error("Error:", message);
        ws.send(
          JSON.stringify({
            type: ServerMessage.ERROR,
            message,
          }),
        );
      }
    },

    close(ws) {
      for (const [roomId, room] of rooms.entries()) {
        for (const [username, usersocket] of room.players.entries()) {
          if (ws === usersocket) {
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
