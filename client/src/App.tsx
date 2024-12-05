import { useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import Start from "@/pages/Start";
import Game from "@/pages/Game";
import Lobby from "@/pages/Lobby";

export default function App() {
  const [username, setUsername] = useState("");
  const socket = useSocket(username);

  if (!socket.state.isConnected) {
    return <Start {...{ setUsername }} />;
  } else if (!socket.game) {
    return <Lobby {...{ socket }} />;
  } else {
    return <Game {...{ socket }} />;
  }
}
