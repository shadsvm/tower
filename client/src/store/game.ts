import { GameState } from '@server/types';
import { create } from 'zustand';

type GameStore = {
  state?: GameState;
  setState: (state: GameState) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  state: undefined,
  setState: (state) => set({ state })
}));
