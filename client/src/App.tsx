import { useSocket } from "@/hooks/useSocket";
import Game from "@/pages/Game";
import Lobby from "@/pages/Lobby";
import Start from "@/pages/Start";
import { useState } from "react";
import Layout from "./components/Layout";
import Toast from "./components/Toast";

export default function App() {
  const [username, setUsername] = useState("");
  const socket = useSocket(username);

  if (!socket.state.isConnected) {
    return (
      <Layout>
        <Toast {...{socket}} />
        <Start {...{ setUsername }} />
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast {...{socket}} />

      {!socket.game ? <Lobby {...{ socket }} /> : <Game {...{ socket }} />}
    </Layout>
  );
}
