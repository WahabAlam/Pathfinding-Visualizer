import { createGridData, renderGrid } from "./grid/grid.js";
import { astar } from "./algorithms/astar.js";
import { greedy } from "./algorithms/greedy.js";
import { ucs } from "./algorithms/ucs.js";
import { animateSearch } from "./visualization/animate.js";
import { generateMaze } from "./utils/maze.js";

const ROWS = 41;
const COLS = 41;

// references to page elements we use
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

// current mode and animation state
let mode = "wall";
let startCell = null;
let endCell = null;
let isAnimating = false;

// make an empty grid and draw it
const gridData = createGridData(ROWS, COLS);
renderGrid(gridElement, gridData);

speedValue.textContent = speedSlider.value;

function updateModeLabel() {
  // show what clicks will do right now
  if (mode === "start") {
    // Clicks place move the start node
    modeLabel.textContent = "Mode: Set Start";
  } else if (mode === "end") {
    // Clicks place move the end node
    modeLabel.textContent = "Mode: Set End";
  } else {
    // Clicks toggle wall cells
    modeLabel.textContent = "Mode: Draw Walls";
  }
}

function resetCellPathData(cell) {
  // reset path numbers before a new run
  cell.g = Infinity;
  cell.h = 0;
  cell.f = Infinity;
  // parent stores where we came from
  cell.parent = null;
}

function resetMetrics() {
  // reset the numbers shown for the last run
  document.getElementById("nodesExplored").textContent = "0";
  document.getElementById("pathLength").textContent = "0";
  document.getElementById("timeTaken").textContent = "0";
}

function resetResultsTable() {
  // show empty table message
  resultsTableBody.innerHTML = `
    <tr class="empty-row">
      <td colspan="4">No runs yet for this maze.</td>
    </tr>
  `;
}

function upsertResultRow(algorithmName, nodesExplored, pathLength, timeTaken) {
  // update this algorithm row or add a new row
  const existingRow = resultsTableBody.querySelector(`tr[data-algorithm="${algorithmName}"]`);

  if (existingRow) {
    // replace old numbers for this algorithm
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
    // remove empty table message
    emptyRow.remove();
  }

  // add a new row with this run result
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
  // map internal names to labels for the table
  if (value === "astar") return "A*";
  if (value === "greedy") return "Greedy";
  if (value === "ucs") return "UCS";
  return value;
}

function redrawGridFromData() {
  // redraw each cell based on saved state
  for (const row of gridData) {
    for (const cell of row) {
      if (cell.isStart) {
        // show start style first
        cell.element.className = "cell start";
      } else if (cell.isEnd) {
        // then show end style
        cell.element.className = "cell end";
      } else if (cell.isWall) {
        // then show walls
        cell.element.className = "cell wall";
      } else {
        // all other cells are empty
        cell.element.className = "cell";
      }
    }
  }
}

function clearBoardVisualsAndData() {
  // do nothing while animation is running
  if (isAnimating) return;

  // clear start end walls and path data
  for (const row of gridData) {
    for (const cell of row) {
      // clear cell role flags
      cell.isStart = false;
      cell.isEnd = false;
      cell.isWall = false;
      // reset path data and visual style
      resetCellPathData(cell);
      cell.element.className = "cell";
    }
  }

  // clear saved start end and shown numbers
  startCell = null;
  endCell = null;
  resetMetrics();
  resetResultsTable();
}

function clearSearchVisuals() {
  // do nothing while animation is running
  if (isAnimating) return;

  // keep walls start end but clear run traces
  for (const row of gridData) {
    for (const cell of row) {
      // clear path data on this cell
      resetCellPathData(cell);

      if (cell.isStart) {
        // keep start style
        cell.element.className = "cell start";
      } else if (cell.isEnd) {
        // keep end style
        cell.element.className = "cell end";
      } else if (cell.isWall) {
        // keep wall style
        cell.element.className = "cell wall";
      } else {
        // reset to empty style
        cell.element.className = "cell";
      }
    }
  }

  resetMetrics();
}

function removePreviousStart() {
  // only one start node can exist
  if (!startCell) return;

  // remove old start marker and restore its style
  startCell.isStart = false;
  startCell.element.className = startCell.isWall ? "cell wall" : "cell";
}

function removePreviousEnd() {
  // only one end node can exist
  if (!endCell) return;

  // remove old end marker and restore its style
  endCell.isEnd = false;
  endCell.element.className = endCell.isWall ? "cell wall" : "cell";
}

function autoGenerateMazeIfReady() {
  // make a maze once both endpoints exist
  if (startCell && endCell) {
    // clear old run traces first
    clearSearchVisuals();
    // build maze walls around start and end
    generateMaze(gridData, startCell, endCell);
    // redraw cells after maze generation
    redrawGridFromData();
    // old result rows no longer match this maze
    resetResultsTable();
  }
}

function handleCellClick(cell) {
  // ignore clicks while animation is running
  if (isAnimating) return;

  // any edit clears old run traces and numbers
  clearSearchVisuals();

  if (mode === "start") {
    // place start node and maybe rebuild maze
    removePreviousStart();

    // start cannot also be wall or end
    cell.isWall = false;
    cell.isStart = true;
    cell.isEnd = false;
    cell.element.className = "cell start";
    startCell = cell;

    if (cell === endCell) {
      // if start moved onto end clear old end
      endCell = null;
    }

    autoGenerateMazeIfReady();
    return;
  }

  if (mode === "end") {
    // place end node and maybe rebuild maze
    removePreviousEnd();

    // end cannot also be wall or start
    cell.isWall = false;
    cell.isEnd = true;
    cell.isStart = false;
    cell.element.className = "cell end";
    endCell = cell;

    if (cell === startCell) {
      // if end moved onto start clear old start
      startCell = null;
    }

    autoGenerateMazeIfReady();
    return;
  }

  if (mode === "wall") {
    // toggle wall on this cell
    // never turn start or end into walls
    if (cell.isStart || cell.isEnd) return;

    // update wall flag and visual style
    cell.isWall = !cell.isWall;
    cell.element.className = cell.isWall ? "cell wall" : "cell";
  }
}

// connect cell clicks to the handler
for (const row of gridData) {
  for (const cell of row) {
    cell.element.addEventListener("click", () => handleCellClick(cell));
  }
}

// buttons that change click mode
setStartBtn.addEventListener("click", () => {
  if (isAnimating) return;
  // next clicks place start
  mode = "start";
  updateModeLabel();
});

setEndBtn.addEventListener("click", () => {
  if (isAnimating) return;
  // next clicks place end
  mode = "end";
  updateModeLabel();
});

setWallBtn.addEventListener("click", () => {
  if (isAnimating) return;
  // next clicks toggle walls
  mode = "wall";
  updateModeLabel();
});

// buttons that clear data
clearBtn.addEventListener("click", () => {
  // clear whole board and all results
  clearBoardVisualsAndData();
});

clearSearchBtn.addEventListener("click", () => {
  if (isAnimating) return;
  // keep maze and endpoints but clear run traces
  clearSearchVisuals();
});

// show current speed value
speedSlider.addEventListener("input", () => {
  // update speed text while slider moves
  speedValue.textContent = speedSlider.value;
});

runBtn.addEventListener("click", async () => {
  if (isAnimating) return;

  // read chosen algorithm and check endpoints
  const selectedAlgorithm = document.getElementById("algorithmSelect").value;

  if (!startCell || !endCell) {
    // cannot run without both endpoints
    alert("Please place both a start node and an end node first.");
    return;
  }

  // clear old run traces before running again
  clearSearchVisuals();

  // run algorithm and measure how long it takes
  const startTime = performance.now();
  let result = null;

  if (selectedAlgorithm === "astar") {
    // a star uses path cost plus distance guess
    result = astar(gridData, startCell, endCell);
  } else if (selectedAlgorithm === "greedy") {
    // greedy picks what looks closest to goal
    result = greedy(gridData, startCell, endCell);
  } else if (selectedAlgorithm === "ucs") {
    // ucs picks lowest path cost so far
    result = ucs(gridData, startCell, endCell);
  } else {
    // handle options that are not connected yet
    alert(`${selectedAlgorithm} is not connected yet.`);
    return;
  }

  const endTime = performance.now();

  // compute and show run numbers
  const nodesExplored = result.visitedOrder.length;
  // steps are one less than nodes in the path
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

  // lock editing while animation plays
  isAnimating = true;
  // speed slider controls animation delay
  await animateSearch(result.visitedOrder, result.path, Number(speedSlider.value));
  isAnimating = false;
});

// set starting labels and empty table
updateModeLabel();
resetResultsTable();
