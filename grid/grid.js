import { createCell } from "./cell.js";

export function createGridData(rows, cols) {
  // Build a 2D matrix of cell objects used as the single source of truth
  const grid = [];

  for (let row = 0; row < rows; row++) {
    const currentRow = [];

    for (let col = 0; col < cols; col++) {
      currentRow.push(createCell(row, col));
    }

    grid.push(currentRow);
  }

  return grid;
}

export function renderGrid(container, gridData) {
  // Recreate the DOM grid and bind each cell object to its rendered element
  container.innerHTML = "";

  for (const row of gridData) {
    for (const cell of row) {
      const cellElement = document.createElement("div");
      cellElement.className = "cell";
      cellElement.dataset.row = cell.row;
      cellElement.dataset.col = cell.col;

      cell.element = cellElement;
      container.appendChild(cellElement);
    }
  }
}
