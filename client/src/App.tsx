import Layout from '@/components/Layout';
import Game from '@/pages/Game';
import Lobby from '@/pages/Lobby';
import Start from '@/pages/Start';
import { useGameStore } from '@/store/game';
import { useSocketStore } from '@/store/socket';
import { useEffect } from 'react';

export default function App() {
  const socket = useSocketStore();
  const game = useGameStore();

  useEffect(() => {
    console.dir(socket.state)
  }, [socket])

  useEffect(() => {
    console.dir(game)
  }, [game])


  return (
    <Layout>
      {!socket.state.isConnected ? <Start /> : !game.state ? <Lobby /> : <Game />}
    </Layout>
  );
}
