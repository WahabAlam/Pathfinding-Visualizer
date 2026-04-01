export function createCell(row, col) {
  // Canonical per node state shared by grid rendering and all search algorithms
  return {
    row,
    col,
    isStart: false,
    isEnd: false,
    isWall: false,
    g: Infinity,
    h: 0,
    f: Infinity,
    parent: null,
    element: null
  };
}
