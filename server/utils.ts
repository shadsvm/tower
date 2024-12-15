// New utility file for game logic
import { GRID_SIZE } from "./constant";
import type { Position, Tile } from "./types";

export type Adjacent = {
  tile: Tile;
  position: Position;
};

export function getAdjacentTiles(grid: Tile[][], position: Position): Adjacent[] {
  const adjacent: Adjacent[] = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]  // Left, Right, Up, Down
  ];

  for (const [dx, dy] of directions) {
    const x = position.x + dx;
    const y = position.y + dy;

    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      adjacent.push({
        tile: grid[y][x],
        position: { x, y }
      });
    }
  }

  return adjacent;
}

export function canPlaceOnTile(
  grid: Tile[][],
  position: Position,
  username: string
): boolean {
  const targetTile = grid[position.y][position.x];

  // Can't build on buildings
  if (targetTile.type === "castle" || targetTile.type === "tower") {
    return false;
  }

  // Can build on owned tile
  if (targetTile.owner === username) {
    return true;
  }

  // Can build next to owned tiles
  const adjacentTiles = getAdjacentTiles(grid, position);
  return adjacentTiles.some(({tile}) => tile.owner === username);
}
