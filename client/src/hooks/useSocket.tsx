import { useState, useEffect } from "react";
import {
  ServerMessage,
  ServerMessages,
  GameState,
  ClientMessage,
  UnitType,
} from "@shared/types";

export type UseSocket = {
  username: string;
  state: SocketState;
  game: GameState | null;
  send: (data: any) => void;
};

type SocketState = {
  isConnected: boolean;
  message: string;
  roomId: string | null;
};

export const useSocket = (username: string): UseSocket => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    message: "",
    roomId: null,
  });
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    if (!username) return;

    const socket = new WebSocket("ws://localhost:3000");

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
            message: `Room created! Share this ID: ${data.roomId}`,
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
          setState((prev) => ({ ...prev, message: `Error: ${data.message}` }));
          break;
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [username]);

  const send = ({
    type,
    unitType,
    position,
  }: {
    type: ClientMessage;
    unitType?: UnitType;
    position?: Position;
  }) => {
    if (!ws) return;
    // Ensure roomId is always set from state
    const message = {
      type,
      unitType,
      position,
      username,
      roomId: state.roomId,
    };
    console.log("Sending:", message);
    ws.send(JSON.stringify(message));
  };

  return {
    username,
    state,
    game,
    send,
  };
};
