import { useState } from "react";

export const Lobby = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  const validateUsername = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 15;
  };

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setStatus("Room ID copied to clipboard!");
  };

  const connect = () => {
    if (!validateUsername(username)) {
      setStatus("Username must be 2-15 characters!");
      return;
    }

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      setStatus("Connected!");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "ROOM_CREATED":
          setRoomId(data.roomId);
          setStatus(`Room created! Share this ID: ${data.roomId}`);
          break;
        case "GAME_START":
          setStatus(`Game starting! Players: ${data.players.join(", ")}`);
          break;
        case "ERROR":
          setStatus(`Error: ${data.message}`);
          break;
      }
    };

    socket.onerror = () => {
      setStatus("WebSocket error!");
    };
  };

  const createRoom = () => {
    ws?.send(
      JSON.stringify({
        type: "CREATE_ROOM",
        username,
      }),
    );
  };

  const joinRoom = () => {
    if (!roomId) {
      setStatus("Please enter room ID!");
      return;
    }

    ws?.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        username,
        roomId,
      }),
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      {!ws ? (
        <>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (2-15 chars)"
            className="nes-input"
          />
          <button
            onClick={connect}
            className="nes-btn is-primary"
            disabled={!validateUsername(username)}
          >
            Connect
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <button onClick={createRoom} className="nes-btn is-success">
              Host Game
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room ID"
                className="nes-input"
              />
              <button onClick={joinRoom} className="nes-btn is-warning">
                Join Game
              </button>
            </div>
          </div>
          {roomId && (
            <button onClick={copyRoomId} className="nes-btn is-primary">
              Copy Room ID
            </button>
          )}
        </div>
      )}

      {status && (
        <div className="nes-container is-dark">
          <p>{status}</p>
        </div>
      )}
    </div>
  );
};
