import { Units } from "./types";

export const Config = {
  gridSize: 6,
  initialPoints: 50,
  incrementPoints: 10
} as const

export const UnitsPrices = {
  [Units.SOLDIER]: 10,
  [Units.TOWER]: 50,
} as const;

export const UnitsIcons = {
  [Units.SOLDIER]: '🥷',
  [Units.CASTLE]: '🏰',
  [Units.TOWER]: '🗼',
} as const
