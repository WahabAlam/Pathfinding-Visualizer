import { createGridData, renderGrid } from "./grid/grid.js";
import { astar } from "./algorithms/astar.js";
import { greedy } from "./algorithms/greedy.js";
import { ucs } from "./algorithms/ucs.js";
import { animateSearch } from "./visualization/animate.js";
import { generateMaze } from "./utils/maze.js";

const ROWS = 41;
const COLS = 41;

const gridElement = document.getElementById("grid");
const modeLabel = document.getElementById("modeLabel");

const setStartBtn = document.getElementById("setStartBtn");
const setEndBtn = document.getElementById("setEndBtn");
const setWallBtn = document.getElementById("setWallBtn");
const clearBtn = document.getElementById("clearBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const runBtn = document.getElementById("runBtn");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const resultsTableBody = document.getElementById("resultsTableBody");

let mode = "wall";
let startCell = null;
let endCell = null;
let isAnimating = false;

const gridData = createGridData(ROWS, COLS);
renderGrid(gridElement, gridData);

speedValue.textContent = speedSlider.value;

function updateModeLabel() {
  if (mode === "start") {
    modeLabel.textContent = "Mode: Set Start";
  } else if (mode === "end") {
    modeLabel.textContent = "Mode: Set End";
  } else {
    modeLabel.textContent = "Mode: Draw Walls";
  }
}

function resetCellPathData(cell) {
  cell.g = Infinity;
  cell.h = 0;
  cell.f = Infinity;
  cell.parent = null;
}

function resetMetrics() {
  document.getElementById("nodesExplored").textContent = "0";
  document.getElementById("pathLength").textContent = "0";
  document.getElementById("timeTaken").textContent = "0";
}

function resetResultsTable() {
  resultsTableBody.innerHTML = `
    <tr class="empty-row">
      <td colspan="4">No runs yet for this maze.</td>
    </tr>
  `;
}

function upsertResultRow(algorithmName, nodesExplored, pathLength, timeTaken) {
  const existingRow = resultsTableBody.querySelector(`tr[data-algorithm="${algorithmName}"]`);

  if (existingRow) {
    existingRow.innerHTML = `
      <td>${algorithmName}</td>
      <td>${nodesExplored}</td>
      <td>${pathLength}</td>
      <td>${timeTaken}</td>
    `;
    return;
  }

  const emptyRow = resultsTableBody.querySelector(".empty-row");
  if (emptyRow) {
    emptyRow.remove();
  }

  const row = document.createElement("tr");
  row.dataset.algorithm = algorithmName;
  row.innerHTML = `
    <td>${algorithmName}</td>
    <td>${nodesExplored}</td>
    <td>${pathLength}</td>
    <td>${timeTaken}</td>
  `;
  resultsTableBody.appendChild(row);
}

function getAlgorithmLabel(value) {
  if (value === "astar") return "A*";
  if (value === "greedy") return "Greedy";
  if (value === "ucs") return "UCS";
  return value;
}

function redrawGridFromData() {
  for (const row of gridData) {
    for (const cell of row) {
      if (cell.isStart) {
        cell.element.className = "cell start";
      } else if (cell.isEnd) {
        cell.element.className = "cell end";
      } else if (cell.isWall) {
        cell.element.className = "cell wall";
      } else {
        cell.element.className = "cell";
      }
    }
  }
}

function clearBoardVisualsAndData() {
  if (isAnimating) return;

  for (const row of gridData) {
    for (const cell of row) {
      cell.isStart = false;
      cell.isEnd = false;
      cell.isWall = false;
      resetCellPathData(cell);
      cell.element.className = "cell";
    }
  }

  startCell = null;
  endCell = null;
  resetMetrics();
  resetResultsTable();
}

function clearSearchVisuals() {
  if (isAnimating) return;

  for (const row of gridData) {
    for (const cell of row) {
      resetCellPathData(cell);

      if (cell.isStart) {
        cell.element.className = "cell start";
      } else if (cell.isEnd) {
        cell.element.className = "cell end";
      } else if (cell.isWall) {
        cell.element.className = "cell wall";
      } else {
        cell.element.className = "cell";
      }
    }
  }

  resetMetrics();
}

function removePreviousStart() {
  if (!startCell) return;

  startCell.isStart = false;
  startCell.element.className = startCell.isWall ? "cell wall" : "cell";
}

function removePreviousEnd() {
  if (!endCell) return;

  endCell.isEnd = false;
  endCell.element.className = endCell.isWall ? "cell wall" : "cell";
}

function autoGenerateMazeIfReady() {
  if (startCell && endCell) {
    clearSearchVisuals();
    generateMaze(gridData, startCell, endCell);
    redrawGridFromData();
    resetResultsTable();
  }
}

function handleCellClick(cell) {
  if (isAnimating) return;

  clearSearchVisuals();

  if (mode === "start") {
    removePreviousStart();

    cell.isWall = false;
    cell.isStart = true;
    cell.isEnd = false;
    cell.element.className = "cell start";
    startCell = cell;

    if (cell === endCell) {
      endCell = null;
    }

    autoGenerateMazeIfReady();
    return;
  }

  if (mode === "end") {
    removePreviousEnd();

    cell.isWall = false;
    cell.isEnd = true;
    cell.isStart = false;
    cell.element.className = "cell end";
    endCell = cell;

    if (cell === startCell) {
      startCell = null;
    }

    autoGenerateMazeIfReady();
    return;
  }

  if (mode === "wall") {
    if (cell.isStart || cell.isEnd) return;

    cell.isWall = !cell.isWall;
    cell.element.className = cell.isWall ? "cell wall" : "cell";
  }
}

for (const row of gridData) {
  for (const cell of row) {
    cell.element.addEventListener("click", () => handleCellClick(cell));
  }
}

setStartBtn.addEventListener("click", () => {
  if (isAnimating) return;
  mode = "start";
  updateModeLabel();
});

setEndBtn.addEventListener("click", () => {
  if (isAnimating) return;
  mode = "end";
  updateModeLabel();
});

setWallBtn.addEventListener("click", () => {
  if (isAnimating) return;
  mode = "wall";
  updateModeLabel();
});

clearBtn.addEventListener("click", () => {
  clearBoardVisualsAndData();
});

clearSearchBtn.addEventListener("click", () => {
  if (isAnimating) return;
  clearSearchVisuals();
});

speedSlider.addEventListener("input", () => {
  speedValue.textContent = speedSlider.value;
});

runBtn.addEventListener("click", async () => {
  if (isAnimating) return;

  const selectedAlgorithm = document.getElementById("algorithmSelect").value;

  if (!startCell || !endCell) {
    alert("Please place both a start node and an end node first.");
    return;
  }

  clearSearchVisuals();

  const startTime = performance.now();
  let result = null;

  if (selectedAlgorithm === "astar") {
    result = astar(gridData, startCell, endCell);
  } else if (selectedAlgorithm === "greedy") {
    result = greedy(gridData, startCell, endCell);
  } else if (selectedAlgorithm === "ucs") {
    result = ucs(gridData, startCell, endCell);
  } else {
    alert(`${selectedAlgorithm} is not connected yet.`);
    return;
  }

  const endTime = performance.now();

  const nodesExplored = result.visitedOrder.length;
  const pathLength = result.path.length > 0 ? result.path.length - 1 : 0;
  const timeTaken = (endTime - startTime).toFixed(2);

  document.getElementById("nodesExplored").textContent = nodesExplored;
  document.getElementById("pathLength").textContent = pathLength;
  document.getElementById("timeTaken").textContent = timeTaken;

  upsertResultRow(
    getAlgorithmLabel(selectedAlgorithm),
    nodesExplored,
    pathLength,
    timeTaken
  );

  isAnimating = true;
  await animateSearch(result.visitedOrder, result.path, Number(speedSlider.value));
  isAnimating = false;
});

updateModeLabel();
resetResultsTable();