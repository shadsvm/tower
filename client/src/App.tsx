import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import Start from "@/pages/Start";
import Game from "@/pages/Game";
import Lobby from "@/pages/Lobby";
import Layout from "./components/Layout";

export default function App() {
  const [username, setUsername] = useState("");
  const socket = useSocket(username);

  if (!socket.state.isConnected) {
    return (
      <Layout>
        <Start {...{ setUsername }} />
      </Layout>
    );
  }

  return (
    <Layout>
      {!socket.game ? <Lobby {...{ socket }} /> : <Game {...{ socket }} />}
    </Layout>
  );
}
