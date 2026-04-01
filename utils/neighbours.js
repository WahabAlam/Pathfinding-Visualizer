export function getNeighbors(cell, gridData) {
  const neighbors = [];
  // Four directional movement up down left right
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];

  for (const [dRow, dCol] of directions) {
    const newRow = cell.row + dRow;
    const newCol = cell.col + dCol;

    // Keep neighbors inside bounds then ignore blocked cells
    if (
      newRow >= 0 &&
      newRow < gridData.length &&
      newCol >= 0 &&
      newCol < gridData[0].length
    ) {
      const neighbor = gridData[newRow][newCol];

      if (!neighbor.isWall) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}
