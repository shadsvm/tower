import { useState } from "react";
import Lobby from "./components/Lobby";
import { useSocket } from "./hooks/useSocket";
import { Game } from "./components/Game";

export default function App() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");

  const { game, state, sendMessage } = useSocket(username);

  const validateUsername = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 15;
  };

  if (!state.isConnected)
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter username (2-15 chars)"
          className="nes-input"
        />
        <button
          onClick={() => setUsername(input)}
          className="nes-btn is-primary"
          disabled={!validateUsername(input)}
        >
          Connect
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <h1 className="text-center p-8 text-4xl">Tower Defense RTS</h1>
      {state.message && (
        <div className="nes-container is-dark">
          <p>{state.message}</p>
        </div>
      )}
      {!game ? (
        <Lobby
          username={username}
          roomId={state.roomId}
          sendMessage={sendMessage}
        />
      ) : (
        <Game state={game} username={username} />
      )}
    </div>
  );
}
