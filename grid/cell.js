export function createCell(row, col) {
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