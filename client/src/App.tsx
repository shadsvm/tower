import Layout from '@/components/Layout';
import Toast from '@/components/Toast';
import Game from '@/pages/Game';
import Lobby from '@/pages/Lobby';
import Start from '@/pages/Start';
import { useGameStore } from '@/store/game';
import { useSocketStore } from '@/store/socket';
import { useUserStore } from '@/store/user';
import { useEffect } from 'react';

export default function App() {
  const username = useUserStore(({username}) => username);
  const [state, connect] = useSocketStore((store) => [store.state, store.connect]);
  const game = useGameStore();

  useEffect(() => {
    if (username) connect(username)
    console.log('useEffect: socket.connect')
  }, [username])

  if (!username || !state.isConnected) {
    return (
      <Layout>
        <Toast />
        <Start />
      </Layout>
    );
  }
  return (
    <Layout>
      <Toast />
      {!game ? <Lobby /> : <Game />}
    </Layout>
  );
}
