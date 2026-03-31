import { createCell } from "./cell.js";

export function createGridData(rows, cols) {
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