import { useState, useEffect } from "react";

export const useWebSocket = (roomId?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:3000/game${roomId ? `?room=${roomId}` : ""}`,
    );
    setSocket(ws);
    // handle connection, messages, cleanup...
  }, [roomId]);

  return socket;
};
