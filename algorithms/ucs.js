import { getNeighbors } from "../utils/neighbours.js";

export function ucs(gridData, startCell, endCell) {
  const openSet = [];
  const visitedOrder = [];

  startCell.g = 0;
  startCell.f = startCell.g;

  openSet.push(startCell);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.g - b.g);
    const current = openSet.shift();

    visitedOrder.push(current);

    if (current === endCell) {
      return {
        visitedOrder,
        path: reconstructPath(endCell)
      };
    }

    const neighbors = getNeighbors(current, gridData);

    for (const neighbor of neighbors) {
      const tentativeG = current.g + 1;

      if (tentativeG < neighbor.g) {
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.f = neighbor.g;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return {
    visitedOrder,
    path: []
  };
}

function reconstructPath(endCell) {
  const path = [];
  let current = endCell;

  while (current !== null) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}