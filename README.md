# Pathfinding Visualizer

An interactive web app for visualizing and comparing three pathfinding algorithms on the same grid/maze:
- A*
- Greedy Best-First Search
- Uniform Cost Search (UCS)


## 1) Clarity of Problem and Motivation

### Problem
Choosing a pathfinding algorithm is not obvious when you only read pseudocode. Different algorithms explore different numbers of nodes, find different path qualities, and behave differently on blocked maps.

### Why this matters
- In games, robotics, and route planning, path quality and speed directly affect user experience and system performance.
- For students, visual feedback makes abstract search behavior concrete.
- Comparing algorithms on the same maze gives a fair and intuitive understanding of tradeoffs.

### Project goal
Build a visual, interactive environment where users can:
- Define start/end points
- Generate a maze
- Run multiple algorithms on the same layout
- Compare metrics (`Nodes Explored`, `Path Length`, `Time`)

## 2) Explanation of AI Algorithms (Steps and Reasoning)

The app uses a 4-direction grid (up, down, left, right) with uniform movement cost.

### A* (`algorithms/astar.js`)
- Score model: `f(n) = g(n) + h(n)`
- `g(n)`: path cost from start
- `h(n)`: Manhattan distance heuristic (`utils/heuristic.js`)
- Expands the node with smallest `f`
- Reason for inclusion: balances cost-so-far and estimated distance-to-goal; strong general-purpose baseline

### Greedy Best-First (`algorithms/greedy.js`)
- Score model: `f(n) = h(n)` only
- Expands the node that appears closest to goal
- Reason for inclusion: demonstrates faster/more goal-directed behavior, but can return less optimal paths

### Uniform Cost Search (`algorithms/ucs.js`)
- Score model: `f(n) = g(n)` only
- Expands cheapest known path first
- Reason for inclusion: no heuristic; useful baseline for optimal cost search in uniform weighted settings

### Why these three techniques
Together they provide a clean comparison across:
- Cost-only search (UCS)
- Heuristic-only search (Greedy)
- Cost + heuristic search (A*)


## 3) System Design and Implementation

### Architecture and data flow
1. User input: click grid cells to set start/end/walls, pick algorithm, adjust speed.
2. State update: `main.js` updates cell flags (`isStart`, `isEnd`, `isWall`) and path fields (`g`, `h`, `f`, `parent`).
3. Maze generation: when both start and end exist, maze is generated (`utils/maze.js`).
4. Algorithm run: selected algorithm returns `visitedOrder` and final `path`.
5. Visualization: `visualization/animate.js` animates visited nodes then final path.
6. Output metrics: UI updates live metrics and per-maze comparison table.

### Core implementation decisions
- Grid cell object centralizes all per-node state (position, role, costs, parent, DOM element).
- Search state is reset before each run to avoid stale values.
- Animation is async and guarded by `isAnimating` to prevent conflicting user actions mid-run.
- Results table is preserved across algorithm runs for the same maze, then reset on new maze/board clear.

## 4) Demonstration Quality (

1. Start app and show controls, legend, and empty results table.
2. Set start and end nodes; mention auto-maze generation.
3. Run `A*`; explain visited vs path animation and metric updates.
4. Run `Greedy` and `UCS` on the same maze; compare table rows directly.
5. Use speed slider to show animation control.
6. Show `Clear Search` vs `Clear Board`.

If asked about issues/errors:
- If start/end is missing, app intentionally blocks run and shows an alert.
- Inputs are intentionally locked during animation to avoid inconsistent state.
- Time metric measures algorithm computation time (not animation delay).

## 5) Communication and Delivery Readiness

Short speaking outline:
1. Problem + motivation (why algorithm comparison matters)
2. Why these 3 algorithms (different search strategies)
3. Data flow from input -> algorithm -> animation -> metrics
4. Live run and comparison table interpretation
5. Conclusion: tradeoff between exploration effort and path quality

Common Q&A:
- Why Manhattan heuristic?  
  Because movement is 4-directional and unit cost, so Manhattan distance is a natural heuristic.
- Why include UCS if costs are uniform?  
  It acts as a baseline to compare heuristic-driven methods.
- How is fairness ensured across runs?  
  Same maze, same start/end, same movement model.

## Project Structure

```text
Pathfinding-Visualizer/
├─ index.html                  # UI layout (controls, grid container, metrics, results table)
├─ style.css                   # App styling, grid cell classes, layout
├─ main.js                     # App controller: modes, events, run pipeline, metrics/results updates
├─ algorithms/
│  ├─ astar.js                 # A* search
│  ├─ greedy.js                # Greedy Best-First Search
│  └─ ucs.js                   # Uniform Cost Search
├─ grid/
│  ├─ cell.js                  # Cell object factory
│  └─ grid.js                  # Grid data creation + DOM rendering
├─ utils/
│  ├─ heuristic.js             # Manhattan heuristic
│  ├─ maze.js                  # Recursive maze generation + extra openings
│  └─ neighbours.js            # Valid non-wall 4-direction neighbors
├─ visualization/
│  └─ animate.js               # Visited/path animation with speed-based delays
└─ metrics/                    # Reserved for future metric/analysis utilities
```

## How to Run

Because the app uses ES modules, run it from a local server (not by opening `index.html` directly).

```bash
# 1) Clone/download this repository
# 2) Open a terminal in the project root (the folder containing index.html)

# Option A: Python (most common)
python3 -m http.server 8000

# Option B: Node.js
npx serve .
```

Then open the local URL shown in your terminal.
Common URLs are:
- `http://localhost:8000` (Python example above)
- `http://localhost:3000` or `http://localhost:5000` (depending on server tool/default port)

## Controls and Outputs

- `Set Start`: place start node
- `Set End`: place goal node
- `Draw Walls`: toggle obstacle cells
- `Clear Search`: remove visited/path visualization only
- `Clear Board`: reset full board + results table
- `Algorithm Select`: choose A*, Greedy, or UCS
- `Run Algorithm`: execute selected search
- `Speed Slider`: controls animation speed

Displayed metrics:
- `Nodes Explored`
- `Path Length`
- `Time (ms)`
- Per-maze comparison table (one row per algorithm)

