export async function animateSearch(visitedOrder, path, speed) {
  // Animate exploration first then highlight the final shortest path
  await animateVisitedNodes(visitedOrder, speed);
  await animatePath(path, speed);
}

function sleep(ms) {
  // Small async pause to control animation pacing
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getVisitedDelay(speed) {
  // Higher speed slider values should produce shorter delays
  return Math.max(1, 105 - speed);
}

function getPathDelay(speed) {
  return Math.max(1, 125 - speed);
}

async function animateVisitedNodes(visitedOrder, speed) {
  const delay = getVisitedDelay(speed);

  // Paint every explored cell except endpoints
  for (const cell of visitedOrder) {
    if (!cell.isStart && !cell.isEnd) {
      cell.element.classList.add("visited");
      await sleep(delay);
    }
  }
}

async function animatePath(path, speed) {
  const delay = getPathDelay(speed);

  // Replace visited styling with path styling on the final route
  for (const cell of path) {
    if (!cell.isStart && !cell.isEnd) {
      cell.element.classList.remove("visited");
      cell.element.classList.add("path");
      await sleep(delay);
    }
  }
}
