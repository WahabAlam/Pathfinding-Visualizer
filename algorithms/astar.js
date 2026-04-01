import { heuristic } from "../utils/heuristic.js";
import { getNeighbors } from "../utils/neighbours.js";

export function astar(gridData, startCell, endCell) {
  // nodes we still need to check and order for animation
  const openSet = [];
  const visitedOrder = [];

  // set start path cost and distance guess for a star
  startCell.g = 0;
  startCell.h = heuristic(startCell, endCell);
  startCell.f = startCell.g + startCell.h;

  // put start node into open set
  openSet.push(startCell);

  // keep taking the node with the best total score
  while (openSet.length > 0) {
    // sort keeps lowest total score first
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    // save visit order for animation
    visitedOrder.push(current);

    // if we reached goal build and return the path
    if (current === endCell) {
      return {
        visitedOrder,
        path: reconstructPath(endCell)
      };
    }

    // check each neighbor and see if this path is better
    const neighbors = getNeighbors(current, gridData);

    for (const neighbor of neighbors) {
      // each move to a neighbor costs 1
      const tentativeG = current.g + 1;

      // update neighbor only when this path is better
      if (tentativeG < neighbor.g) {
        // remember where we came from so we can rebuild the path
        neighbor.parent = current;
        neighbor.g = tentativeG;
        neighbor.h = heuristic(neighbor, endCell);
        neighbor.f = neighbor.g + neighbor.h;

        // add neighbor to open set if it is not already there
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  // no path was found
  return {
    visitedOrder,
    path: []
  };
}

function reconstructPath(endCell) {
  const path = [];
  let current = endCell;

  // walk backward from goal to start using parent links
  while (current !== null) {
    path.unshift(current);
    // move to the parent node
    current = current.parent;
  }

  return path;
}
