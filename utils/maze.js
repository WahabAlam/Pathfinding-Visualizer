export function generateMaze(gridData, startCell, endCell) {
  const rows = gridData.length;
  const cols = gridData[0].length;

  // Reset search metadata and start from a fully walled grid except endpoints
  for (const row of gridData) {
    for (const cell of row) {
      cell.g = Infinity;
      cell.h = 0;
      cell.f = Infinity;
      cell.parent = null;

      if (!cell.isStart && !cell.isEnd) {
        cell.isWall = true;
      }
    }
  }

  // Fisher Yates shuffle so carve directions are randomized
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function inInteriorOddBounds(r, c) {
    return r > 0 && r < rows - 1 && c > 0 && c < cols - 1;
  }

  // Recursive backtracker maze cells are odd indexed snap values onto odd coordinates
  function nearestOdd(value, min, max) {
    let v = Math.max(min, Math.min(value, max));
    if (v % 2 === 0) {
      if (v + 1 <= max) v += 1;
      else v -= 1;
    }
    return v;
  }

  // Map start end including border positions to valid interior odd anchors
  function getAnchor(cell) {
    if (cell.row === 0) {
      return {
        row: 1,
        col: nearestOdd(cell.col, 1, cols - 2)
      };
    }

    if (cell.row === rows - 1) {
      return {
        row: nearestOdd(rows - 2, 1, rows - 2),
        col: nearestOdd(cell.col, 1, cols - 2)
      };
    }

    if (cell.col === 0) {
      return {
        row: nearestOdd(cell.row, 1, rows - 2),
        col: 1
      };
    }

    if (cell.col === cols - 1) {
      return {
        row: nearestOdd(cell.row, 1, rows - 2),
        col: nearestOdd(cols - 2, 1, cols - 2)
      };
    }

    return {
      row: nearestOdd(cell.row, 1, rows - 2),
      col: nearestOdd(cell.col, 1, cols - 2)
    };
  }

  const startAnchor = getAnchor(startCell);
  const endAnchor = getAnchor(endCell);

  // Seed the maze carve from the start anchor
  gridData[startAnchor.row][startAnchor.col].isWall = false;

  function carve(r, c) {
    // DFS carve in 2 cell steps opening the wall between current and next cells
    const directions = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2]
    ];

    shuffle(directions);

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (!inInteriorOddBounds(nr, nc)) continue;
      if (!gridData[nr][nc].isWall) continue;

      gridData[r + dr / 2][c + dc / 2].isWall = false;
      gridData[nr][nc].isWall = false;

      carve(nr, nc);
    }
  }

  // Generate the main perfect maze from the start anchor
  carve(startAnchor.row, startAnchor.col);

  // Ensure start and end connect cleanly from their exact positions into the maze
  connectCellToAnchor(startCell, startAnchor, gridData);
  connectCellToAnchor(endCell, endAnchor, gridData);

  // Add loops to reduce dead ends and create alternative routes
  addExtraOpenings(gridData, startCell, endCell, 30);

  // Keep endpoints traversable
  startCell.isWall = false;
  endCell.isWall = false;
}

function connectCellToAnchor(cell, anchor, gridData) {
  // Carve a straight Manhattan tunnel from a boundary cell to its anchor
  let r = cell.row;
  let c = cell.col;

  gridData[r][c].isWall = false;

  while (r !== anchor.row) {
    r += anchor.row > r ? 1 : -1;
    gridData[r][c].isWall = false;
  }

  while (c !== anchor.col) {
    c += anchor.col > c ? 1 : -1;
    gridData[r][c].isWall = false;
  }
}

function addExtraOpenings(gridData, startCell, endCell, count = 30) {
  const rows = gridData.length;
  const cols = gridData[0].length;

  let added = 0;
  let attempts = 0;
  const maxAttempts = 3000;

  // Randomly remove selected walls that bridge parallel corridors
  while (added < count && attempts < maxAttempts) {
    attempts++;

    const row = Math.floor(Math.random() * (rows - 2)) + 1;
    const col = Math.floor(Math.random() * (cols - 2)) + 1;
    const cell = gridData[row][col];

    if (cell === startCell || cell === endCell) continue;
    if (!cell.isWall) continue;

    const up = gridData[row - 1][col];
    const down = gridData[row + 1][col];
    const left = gridData[row][col - 1];
    const right = gridData[row][col + 1];

    const verticalPassage = !up.isWall && !down.isWall && left.isWall && right.isWall;
    const horizontalPassage = !left.isWall && !right.isWall && up.isWall && down.isWall;

    if (verticalPassage || horizontalPassage) {
      cell.isWall = false;
      added++;
    }
  }
}
