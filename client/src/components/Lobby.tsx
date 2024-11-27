import { Dispatch, SetStateAction, useState } from "react";

export const Lobby = ({
  username,
  setStatus,
  ws,
}: {
  username: string;
  setStatus: Dispatch<SetStateAction<string>>;
  ws: WebSocket;
}) => {
  const [roomId, setRoomId] = useState("");

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setStatus("Room ID copied to clipboard!");
  };

  const createRoom = () => {
    ws.send(
      JSON.stringify({
        type: "CREATE_ROOM",
        username,
      }),
    );
  };

  const joinRoom = () => {
    if (!roomId) return setStatus("Please enter room ID!");

    ws.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        username,
        roomId,
      }),
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8">
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
    </div>
  );
};
