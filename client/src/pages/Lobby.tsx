import Layout from "@/components/Layout";
import { ClientMessage } from "@server/types";
import { useState } from "react";
import { UseSocket } from "src/hooks/useSocket";

export default function Lobby({
  socket: { state, send },
}: {
  socket: UseSocket;
}) {
  const [input, setInput] = useState("");

  const copyRoomId = async () => {
    if (!state.roomId) return;
    await navigator.clipboard.writeText(state.roomId);
  };

  const createRoom = () => {
    send({ type: ClientMessage.CREATE_ROOM });
  };

  const joinRoom = () => {
    if (input) send({ type: ClientMessage.JOIN_ROOM, roomId: input });
  };

  return (
    <Layout slot={<pre>{state.message}</pre>}>
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="flex flex-col items-center gap-4">
          {state.roomId ? (
            <>
              <div>Waiting for other player</div>
              <button onClick={copyRoomId} className="nes-btn">
                Copy Room ID
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <button onClick={createRoom} className="nes-btn is-success">
                Host Game
              </button>
              <div className="nes-field text-white flex gap-2">
                <input
                  id="roomid-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Room ID"
                  className="nes-input is-dark"
                />
                <button onClick={joinRoom} className="nes-btn is-warning">
                  Join Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
