import { useState, useEffect } from "react";
import { ServerMessage, ServerMessages, ClientMessages } from "@shared/types";

type SocketState = {
  isConnected: boolean;
  roomId: string | null;
};

export const useSocket = (username: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    roomId: null,
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!username) return;

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true }));
      setStatus("Connected!");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessages;
      console.log("Received:", data);

      switch (data.type) {
        case ServerMessage.ROOM_CREATED:
          setState((prev) => ({ ...prev, roomId: data.roomId }));
          setStatus(`Room created! Share this ID: ${data.roomId}`);
          break;
        case ServerMessage.PLAYER_JOINED:
          setStatus(`Player ${data.username} joined!`);
          break;
        case ServerMessage.GAME_STATE:
          setStatus("Game starting!");
          // Handle game state
          break;
        case ServerMessage.ERROR:
          setStatus(`Error: ${data.message}`);
          break;
      }
    };

    socket.onerror = () => {
      setStatus("WebSocket error!");
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    socket.onclose = () => {
      setStatus("Disconnected");
      setState((prev) => ({ ...prev, isConnected: false }));
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
    state,
    status,
    sendMessage,
  };
};
