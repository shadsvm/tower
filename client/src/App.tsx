import Layout from '@/components/Layout';
import Game from '@/pages/Game';
import Lobby from '@/pages/Lobby';
import Start from '@/pages/Start';
import { useGameStore } from '@/store/game';
import { useSocketStore } from '@/store/socket';

export default function App() {
  const socket = useSocketStore();
  const game = useGameStore();

  return (
    <Layout>
      {!socket.state.isConnected ? <Start /> : !game.state ? <Lobby /> : <Game />}
    </Layout>
  );
}
