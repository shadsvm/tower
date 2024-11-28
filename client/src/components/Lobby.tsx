import { useState } from "react";
import { ClientMessage, ClientMessages } from "@shared/types";

type LobbyProps = {
  username: string;
  roomId: string | null;
  sendMessage: (msg: ClientMessages) => void;
};

const Lobby = ({ username, roomId, sendMessage }: LobbyProps) => {
  const [joinRoomId, setJoinRoomId] = useState("");

  const copyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId);
    }
  };

  const createRoom = () => {
    sendMessage({
      type: ClientMessage.CREATE_ROOM,
      username,
    });
  };

  const joinRoom = () => {
    if (!joinRoomId) return;
    sendMessage({
      type: ClientMessage.JOIN_ROOM,
      username,
      roomId: joinRoomId,
    });
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
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
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

export default Lobby;
