import { ClientMessage, Position, ServerMessage, Units, type ServerMessages } from '@server/types';
import { create } from 'zustand';
import { useGameStore } from './game';
import { useUserStore } from './user';


interface SocketSend {
  type: ClientMessage;
  unitType?: Units;
  position?: Position;
  destination?: Position;
  roomId?: string;
}

type SocketState = {
  isConnected: boolean;
  roomId: string | null;
  messages: string[];
};

type SocketStore = {
  ws: WebSocket | null;
  state: SocketState;
  send: (data: SocketSend) => void;
  connect: (username: string) => void;
  disconnect: () => void;
};

export const useSocketStore = create<SocketStore>((set, get) => ({
  state: {
    isConnected: false,
    roomId: null,
    messages: []
  },
  ws: null,

  connect: () => {
    const socket = new WebSocket(import.meta.env.DEV ? 'ws://localhost:3000' : `wss://${window.location.host}`);
    const setGame = useGameStore.getState().setState;

    socket.onopen = () => {
      set(state => ({
        ws: socket,
        state: { ...state.state, isConnected: true }
      }));
      if (import.meta.env.DEV) {
        console.info('socket: connected')
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessages;

      if (import.meta.env.DEV) {
        console.debug(data.type, data)
      }


      switch (data.type) {
        case ServerMessage.ROOM_CREATED:
          set(store => ({
            state: {
              ...store.state,
              roomId: data.roomId,
              messages: [...store.state.messages, '✅ Room created!']
            }
          }));
          break;

        case ServerMessage.GAME_OVER:
          setGame(undefined);
          set(store => ({
            state: {
              ...store.state,
              roomId: null,
              messages: [`ℹ️ ${data.username} won!`]
            }
          }));
        break;

        case ServerMessage.GAME_STATE:
          setGame(data.state);
          set(store => ({
            state: {
              ...store.state,
              roomId: store.state.roomId || data.state.roomId,
              messages: [...store.state.messages, `ℹ️ ${data.state.currentTurn} turn`]
            }
          }));
          break;

        case ServerMessage.ERROR:
          set(store => ({
            state: {
              ...store.state,
              messages: [...store.state.messages, '⚠️ ' + data.message]
            }
          }));
          break;
      }
    };
    socket.onclose = () => {
      set(state => ({
        state: { ...state.state, isConnected: false }
      }));
    };
  },

  disconnect: () => {
    const { ws } = get();
    ws?.close();
    set({ ws: null });
  },

  send: (data: SocketSend) => {
    const { ws, state } = get();
    if (!ws) return;
    const username = useUserStore.getState().username;
    const payload = {
      username,
      roomId: state.roomId,  // Add roomId from state
      ...data
    };

    console.log('socket.send()', payload) // Better debugging
    ws.send(JSON.stringify(payload));
  },
}));
