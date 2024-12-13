import { GameState } from '@server/types';
import { create } from 'zustand';

type GameStore = {
  game?: GameState;
  setGame: (game: GameState) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  game: undefined,
  setGame: (game) => set({ game })
}));
