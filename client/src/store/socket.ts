import { ClientMessage, Position, ServerMessage, UnitType, type ServerMessages } from '@server/types';
import { create } from 'zustand';
import { useGameStore } from './game';
import { useUserStore } from './user';


interface SocketSend {
  type: ClientMessage;
  unitType?: UnitType;
  position?: Position;
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
    const socket = new WebSocket('ws://localhost:3000');
    const setGame = useGameStore.getState().setGame;

    socket.onopen = () => {
      set(state => ({
        ws: socket,
        state: { ...state.state, isConnected: true }
      }));
      if (import.meta.env.DEV) {
        console.group('useSocket')
        console.info('connection established')
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
              messages: [...store.state.messages, 'Room created!']
            }
          }));
          break;

        case ServerMessage.GAME_STATE:
          setGame(data.state);
          set(store => ({
            state: {
              ...store.state,
              roomId: store.state.roomId || data.state.roomId,
              messages: [...store.state.messages, "Game starting!"]
            }
          }));
          break;

        case ServerMessage.ERROR:
          set(store => ({
            state: {
              ...store.state,
              messages: [...store.state.messages, data.message]
            }
          }));
          break;
      }
    };
    console.groupEnd()
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
    const { ws } = get();
    console.debug('socket: send')
    const username = useUserStore.getState().username;
    if (!ws) return;

    const message = {
      username,
      ...data
    };

    ws.send(JSON.stringify(message));
  },
}));
