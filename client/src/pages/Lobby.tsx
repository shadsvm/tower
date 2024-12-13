import { useSocketStore } from "@/store/socket";
import { ClientMessage } from "@server/types";
import { useState } from "react";

const validateInput = (input: string) => {
  const trimmed = input.trim();
  return trimmed.length >= 3 && trimmed.length <= 9;
};

export default function Lobby() {
  const [input, setInput] = useState("");
  const state = useSocketStore(({state}) => state);
  const send = useSocketStore(({send}) => send);


  const copyRoomId = async () => {
    if (!state.roomId) return;
    await navigator.clipboard.writeText(state.roomId);
  };

  const createRoom = () => {
    send({ type: ClientMessage.CREATE_ROOM });
  };

  const joinRoom = () => {
    if (!input) return;
    send({ type: ClientMessage.JOIN_ROOM, roomId: input });
  };

  return (
          <div className="card flex flex-col gap-6 ">
            <header className="text-center space-y-3 p-5">
              <div className="text-4xl">Tower 🏰</div>
              <p className="text-neutral-400">Matchmaking Lobby</p>
            </header>
            <div
              className="space-x-4"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                minLength={3}
                maxLength={9}
                placeholder="Room ID"
                className={`btn max-w-64`}
              />
              <button
                type="button"
                onClick={() => joinRoom()}
                className={`btn btn-white disabled:btn-error`}
                disabled={!input.length || !validateInput(input)}
              >
                Join
              </button>
            </div>
            <div className="w-full border border-neutral-600"></div>
      {state.roomId ? (
        <>
          <div>Waiting for other player</div>
          <button
            type="button"
            onClick={copyRoomId}
            className="btn btn-warn"
          >
            Copy Room ID
          </button>
        </>
      ): (
            <button
              type="button"
              onClick={createRoom}
              className="btn btn-white"
            >
              Host Game
            </button>
      )}
          </div>
  );
}
