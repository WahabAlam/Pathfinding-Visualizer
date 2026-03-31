export async function animateSearch(visitedOrder, path, speed) {
  await animateVisitedNodes(visitedOrder, speed);
  await animatePath(path, speed);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getVisitedDelay(speed) {
  return Math.max(1, 105 - speed);
}

function getPathDelay(speed) {
  return Math.max(1, 125 - speed);
}

async function animateVisitedNodes(visitedOrder, speed) {
  const delay = getVisitedDelay(speed);

  for (const cell of visitedOrder) {
    if (!cell.isStart && !cell.isEnd) {
      cell.element.classList.add("visited");
      await sleep(delay);
    }
  }
}

async function animatePath(path, speed) {
  const delay = getPathDelay(speed);

  for (const cell of path) {
    if (!cell.isStart && !cell.isEnd) {
      cell.element.classList.remove("visited");
      cell.element.classList.add("path");
      await sleep(delay);
    }
  }
}