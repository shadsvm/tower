import { useState, useEffect } from "react";
import {
  ServerMessage,
  ServerMessages,
  ClientMessages,
  GameState,
} from "@shared/types";

type SocketState = {
  isConnected: boolean;
  roomId: string | null;
  message: string | null;
};

export const useSocket = (username: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    roomId: null,
    message: null,
  });

  useEffect(() => {
    if (!username) return;
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        message: "Connected!",
      }));
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
        case ServerMessage.PLAYER_JOINED:
          setState((prev) => ({
            ...prev,
            message: `Player ${data.username} joined!`,
          }));
          break;
        case ServerMessage.GAME_STATE:
          setState((prev) => ({ ...prev, message: "Game starting!" }));
          setGame(data?.state as GameState);
          break;
        case ServerMessage.ERROR:
          setState((prev) => ({ ...prev, message: `Error: ${data.message}` }));
          break;
      }
    };

    socket.onerror = () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        message: "WebSocket Error",
      }));
    };

    socket.onclose = () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
        message: "Disconnected",
      }));
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [username]);

  const sendMessage = (message: ClientMessages) => {
    if (!ws) return;
    console.log("Sending:", message);
    ws.send(JSON.stringify(message));
  };

  return {
    game,
    state,
    sendMessage,
  };
};
