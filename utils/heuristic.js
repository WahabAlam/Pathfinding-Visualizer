export function heuristic(cellA, cellB) {
  return Math.abs(cellA.row - cellB.row) + Math.abs(cellA.col - cellB.col);
}