import { useMemo, useState } from "react";
import { Lobby } from "./components/Lobby";

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const username = useMemo(() => localStorage.getItem("username"), []);
  const [usernameInput, setUsernameInput] = useState("");
  const [status, setStatus] = useState("");

  const validateUsername = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 15;
  };

  const connect = () => {
    if (!validateUsername(usernameInput)) {
      return setStatus("Username must be 2-15 characters!");
    }

    localStorage.setItem("username", usernameInput);

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      setWs(socket);
      setStatus("Connected!");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case ServerMessage.ROOM_CREATED:
          setRoomId(data.roomId);
          setStatus(`Room created! Share this ID: ${data.roomId}`);
          break;
        case ServerMessage.GAME_READY:
          setStatus(`Game starting! Players: ${data.players.join(", ")}`);
          break;
        case ServerMessage.ERROR:
          setStatus(`Error: ${data.message}`);
          break;
      }
    };

    socket.onerror = () => {
      setStatus("WebSocket error!");
    };
  };

  if (!username)
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <input
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="Enter username (2-15 chars)"
          className="nes-input"
        />
        <button
          onClick={connect}
          className="nes-btn is-primary"
          disabled={!validateUsername(usernameInput)}
        >
          Connect
        </button>
      </div>
    );
  else if (ws)
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <h1 className="text-center p-8 text-4xl">Tower Defense RTS</h1>
        {status && (
          <div className="nes-container is-dark">
            <p>{status}</p>
          </div>
        )}
        <Lobby {...{ username, ws, setStatus }} />
      </div>
    );
}

export default App;
