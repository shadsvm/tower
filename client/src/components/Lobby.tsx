import { ClientMessage } from "@shared/types";
import { useState } from "react";
import { UseSocket } from "src/hooks/useSocket";
import Layout from "./Layout";

export default function Lobby({ state, send }: UseSocket) {
  const [joinRoomId, setJoinRoomId] = useState("");

  const copyRoomId = async () => {
    if (!state.roomId) return;
    await navigator.clipboard.writeText(state.roomId);
  };

  const createRoom = () => {
    send({ type: ClientMessage.CREATE_ROOM });
  };

  const joinRoom = () => {
    if (!joinRoomId) return;
    send({ type: ClientMessage.JOIN_ROOM, roomId: joinRoomId });
  };

  return (
    <Layout slot={<pre>{state.message}</pre>}>
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <button onClick={createRoom} className="nes-btn is-success">
              Host Game
            </button>
            <div className="nes-field text-white flex gap-2">
              <input
                id="roomid-input"
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Room ID"
                className="nes-input is-dark"
              />
              <button onClick={joinRoom} className="nes-btn is-warning">
                Join Game
              </button>
            </div>
          </div>
          {state.roomId && (
            <button onClick={copyRoomId} className="nes-btn is-disabled">
              Copy Room ID
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
