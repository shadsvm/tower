import { useState } from "react";
import Lobby from "./components/Lobby";
import { useSocket } from "./hooks/useSocket";
import { Game } from "./components/Game";
import { ActionPanel } from "./components/ActionPanel";
import Layout from "./Layout";

export default function App() {
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");

  const socket = useSocket(username);

  const validateUsername = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 15;
  };

  if (!socket.state.isConnected)
    return (
      <Layout>
        <div className="h-full flex flex-col justify-center items-center gap-8 pb-44">
          <h1 className="text-4xl">What is your name?</h1>
          <div className="nes-field is-inline text-white flex gap-2">
            <input
              id="username-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter username (2-15 chars)"
              className="nes-input is-dark"
            />
            <button
              onClick={() => setUsername(input)}
              className="nes-btn is-primary"
              disabled={!validateUsername(input)}
            >
              Connect
            </button>
          </div>
        </div>
      </Layout>
    );
  else if (!socket.game)
    return (
      <Layout>
        <Lobby {...socket} />
      </Layout>
    );
  return (
    <Layout slot={<ActionPanel {...socket} />}>
      <Game {...socket} />
    </Layout>
  );
}
