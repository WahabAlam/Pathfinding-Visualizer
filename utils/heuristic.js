export function heuristic(cellA, cellB) {
  // Manhattan distance for orthogonal grid movement
  return Math.abs(cellA.row - cellB.row) + Math.abs(cellA.col - cellB.col);
}
