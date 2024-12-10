import {
  ClientMessage,
  GameState,
  Position,
  ServerMessage,
  ServerMessages,
  UnitType,
} from "@server/types";
import { useEffect, useState } from "react";

interface SocketSend {
  type: ClientMessage;
  unitType?: UnitType;
  position?: Position;
  roomId?: string;
}

export type UseSocket = {
  username: string;
  state: SocketState;
  game: GameState | null;
  send: (data: SocketSend) => void;
};

type SocketState = {
  isConnected: boolean;
  message: string;
  roomId: string | null;
};

export const useSocket = (username: string): UseSocket => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    message: "",
    roomId: null,
  });

  function connect() {
    const socket = new WebSocket(`ws://${window.location.hostname}:3000`)

    socket.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessages;
      console.log("Received:", data);

      switch (data.type) {
        case ServerMessage.ROOM_CREATED:
          setState((prev) => ({
            ...prev,
            roomId: data.roomId,
            message: `Room created!`,
          }));
          break;
        case ServerMessage.GAME_STATE:
          setGame(data.state);
          // Important: If we don't have roomId yet (joining player), get it from game state
          setState((prev) => ({
            ...prev,
            message: "Game starting!",
            roomId: prev.roomId || data.state.roomId, // We'll need to add roomId to GameState
          }));
          break;
        case ServerMessage.ERROR:
          setState((prev) => ({ ...prev, message: data.message }));
          break;
      }
    };
    setWs(socket);
    return socket;
  }

  const send = (props: SocketSend) => {
    if (ws) {
      const message = {
        ...props,
        username,
        roomId: state.roomId || props.roomId,
      };
      ws.send(JSON.stringify(message));
      // console.log("ws: Message sent", message);
    } else console.error("ws: Connection lost");
  };

  useEffect(() => {
    if (!username) return;
    const socket = connect();

    return () => socket.close();
  }, [username]);

  return {
    username,
    state,
    game,
    send,
  };
};
