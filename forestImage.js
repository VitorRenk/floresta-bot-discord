const sharp = require("sharp");

const TREE_PAGE_GOAL = 50;
const IMAGE_SIZE = 1024;
const TILE_WIDTH = 112;
const TILE_HEIGHT = 56;

function getForestProgress(pages) {
  const safePages = Math.max(0, Number(pages) || 0);
  const completeTrees = Math.floor(safePages / TREE_PAGE_GOAL);
  const remainingPages = safePages % TREE_PAGE_GOAL;
  const nextTreeProgress = Math.floor((remainingPages / TREE_PAGE_GOAL) * 100);

  return {
    pages: safePages,
    completeTrees,
    remainingPages,
    nextTreeProgress,
    partialStage: getPartialStage(remainingPages),
  };
}

function getPartialStage(remainingPages) {
  if (remainingPages <= 0) return null;
  if (remainingPages <= 12) return "seed";
  if (remainingPages <= 25) return "small-sprout";
  if (remainingPages <= 37) return "sapling";
  return "almost-tree";
}

async function generateForestImage(pages) {
  const svg = generateForestSvg(pages);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function generateForestSvg(pages) {
  const progress = getForestProgress(pages);
  const hasPartial = progress.remainingPages > 0;
  const totalPlants = progress.completeTrees + (hasPartial ? 1 : 0);
  const gridSize = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(totalPlants + 4))));
  const maxPlants = gridSize * gridSize;
  const visibleCompleteTrees = Math.min(
    progress.completeTrees,
    hasPartial ? maxPlants - 1 : maxPlants,
  );
  const cells = getPlantCells(gridSize, visibleCompleteTrees, hasPartial);
  const centerX = IMAGE_SIZE / 2;
  const islandTopY = 285;

  const tiles = [];
  const plants = [];

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      const point = getIsoPoint(row, col, gridSize, centerX, islandTopY);
      tiles.push(drawGrassTile(point.x, point.y, row, col));
    }
  }

  cells.complete.forEach((cell, index) => {
    const point = getIsoPoint(cell.row, cell.col, gridSize, centerX, islandTopY);
    plants.push(drawTree(point.x, point.y - 12, 0.92 + (index % 3) * 0.05));
  });

  if (cells.partial && progress.partialStage) {
    const point = getIsoPoint(cells.partial.row, cells.partial.col, gridSize, centerX, islandTopY);
    plants.push(drawPartialPlant(point.x, point.y - 8, progress.partialStage));
  }

  const sortedPlants = plants.sort((a, b) => a.y - b.y).map((plant) => plant.svg);
  const island = drawIsland(gridSize, centerX, islandTopY);

  return `
<svg width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" viewBox="0 0 ${IMAGE_SIZE} ${IMAGE_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="512" y1="0" x2="512" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1f5b46"/>
      <stop offset="1" stop-color="#133c31"/>
    </linearGradient>
    <linearGradient id="grassTop" x1="512" y1="250" x2="512" y2="760" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#b4ef4b"/>
      <stop offset="1" stop-color="#7fcb35"/>
    </linearGradient>
    <linearGradient id="soilLeft" x1="180" y1="580" x2="512" y2="850" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7b6a31"/>
      <stop offset="1" stop-color="#5e4b26"/>
    </linearGradient>
    <linearGradient id="soilRight" x1="844" y1="580" x2="512" y2="850" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9a7935"/>
      <stop offset="1" stop-color="#6b5529"/>
    </linearGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#0b2a20" flood-opacity="0.28"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="442" r="372" fill="#2c7351" opacity="0.16"/>
  ${island}
  <g opacity="0.95">${tiles.join("\n")}</g>
  <g filter="url(#softShadow)">${sortedPlants.join("\n")}</g>
</svg>`;
}

function getPlantCells(gridSize, completeCount, hasPartial) {
  const preferred = [
    [0.15, 0.2],
    [0.72, 0.18],
    [0.35, 0.32],
    [0.86, 0.38],
    [0.18, 0.64],
    [0.62, 0.66],
    [0.42, 0.82],
    [0.78, 0.82],
    [0.05, 0.42],
    [0.52, 0.08],
    [0.3, 0.52],
    [0.94, 0.7],
  ];
  const used = new Set();
  const complete = [];

  for (const [rowPct, colPct] of preferred) {
    if (complete.length >= completeCount) break;
    const row = Math.min(gridSize - 1, Math.max(0, Math.round(rowPct * (gridSize - 1))));
    const col = Math.min(gridSize - 1, Math.max(0, Math.round(colPct * (gridSize - 1))));
    const key = `${row}:${col}`;
    if (!used.has(key)) {
      used.add(key);
      complete.push({ row, col });
    }
  }

  for (let row = 0; row < gridSize && complete.length < completeCount; row += 1) {
    for (let col = 0; col < gridSize && complete.length < completeCount; col += 1) {
      const key = `${row}:${col}`;
      if (!used.has(key)) {
        used.add(key);
        complete.push({ row, col });
      }
    }
  }

  let partial = null;
  if (hasPartial) {
    for (let row = gridSize - 1; row >= 0 && !partial; row -= 1) {
      for (let col = gridSize - 1; col >= 0 && !partial; col -= 1) {
        const key = `${row}:${col}`;
        if (!used.has(key)) {
          partial = { row, col };
        }
      }
    }
  }

  return { complete, partial };
}

function getIsoPoint(row, col, gridSize, centerX, topY) {
  const x = centerX + (col - row) * (TILE_WIDTH / 2);
  const y = topY + (col + row) * (TILE_HEIGHT / 2);
  const offsetY = -((gridSize - 1) * TILE_HEIGHT) / 4;
  return { x, y: y + offsetY };
}

function drawIsland(gridSize, centerX, topY) {
  const halfWidth = (gridSize * TILE_WIDTH) / 2;
  const halfHeight = (gridSize * TILE_HEIGHT) / 2;
  const top = topY - 36;
  const left = centerX - halfWidth;
  const right = centerX + halfWidth;
  const middle = top + halfHeight;
  const bottom = middle + 156;

  return `
  <path d="M${centerX} ${top}L${right} ${middle}L${centerX} ${middle + halfHeight}L${left} ${middle}Z" fill="url(#grassTop)"/>
  <path d="M${left} ${middle}L${centerX} ${middle + halfHeight}V${bottom}L${left} ${middle + 156}Z" fill="url(#soilLeft)"/>
  <path d="M${right} ${middle}L${centerX} ${middle + halfHeight}V${bottom}L${right} ${middle + 156}Z" fill="url(#soilRight)"/>
  <path d="M${left} ${middle}L${centerX} ${middle + halfHeight}L${right} ${middle}" stroke="#5a982f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  ${drawSoilPebbles(left, right, middle, bottom)}`;
}

function drawSoilPebbles(left, right, middle, bottom) {
  const pebbles = [];
  for (let index = 0; index < 22; index += 1) {
    const t = index / 21;
    const x = left + (512 - left) * t;
    const y = middle + 28 + (bottom - middle - 64) * t;
    pebbles.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="16" ry="9" fill="#8c7237" opacity="0.5"/>`);
  }
  for (let index = 0; index < 22; index += 1) {
    const t = index / 21;
    const x = right + (512 - right) * t;
    const y = middle + 28 + (bottom - middle - 64) * t;
    pebbles.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="15" ry="8" fill="#b28a43" opacity="0.42"/>`);
  }
  return pebbles.join("\n");
}

function drawGrassTile(x, y, row, col) {
  const shade = (row + col) % 2 === 0 ? "#a7e84a" : "#9edf43";
  return `
    <path d="M${x} ${y - 28}L${x + 56} ${y}L${x} ${y + 28}L${x - 56} ${y}Z" fill="${shade}" opacity="0.38"/>
    <path d="M${x - 16} ${y + 4}C${x - 10} ${y - 6} ${x - 4} ${y - 6} ${x} ${y + 3}" stroke="#72b92e" stroke-width="5" stroke-linecap="round" opacity="0.42"/>
    <path d="M${x + 18} ${y + 13}C${x + 24} ${y + 3} ${x + 30} ${y + 4} ${x + 34} ${y + 12}" stroke="#72b92e" stroke-width="5" stroke-linecap="round" opacity="0.34"/>`;
}

function drawTree(x, y, scale) {
  const trunkWidth = 16 * scale;
  const trunkHeight = 66 * scale;
  const layers = [
    { dy: -84, w: 98, h: 58, color: "#79ca35" },
    { dy: -48, w: 124, h: 70, color: "#53a928" },
    { dy: -10, w: 142, h: 78, color: "#328f1f" },
  ];
  const svg = `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cx="0" cy="48" rx="48" ry="16" fill="#18472d" opacity="0.24"/>
      <rect x="${-trunkWidth / 2}" y="-6" width="${trunkWidth}" height="${trunkHeight}" rx="5" fill="#8a5a17"/>
      ${layers
        .map(
          (layer) =>
            `<path d="M0 ${layer.dy}L${layer.w / 2} ${layer.dy + layer.h}H${-layer.w / 2}Z" fill="${layer.color}"/>`,
        )
        .join("\n")}
      <path d="M0 -84L49 -26H0Z" fill="#95dd3e" opacity="0.38"/>
    </g>`;
  return { y, svg };
}

function drawPartialPlant(x, y, stage) {
  const drawings = {
    seed: `
      <g transform="translate(${x} ${y})">
        <ellipse cx="0" cy="26" rx="34" ry="10" fill="#18472d" opacity="0.18"/>
        <ellipse cx="0" cy="8" rx="14" ry="10" fill="#8d6a2e"/>
        <path d="M0 4C8 -14 22 -18 34 -8" stroke="#62b634" stroke-width="8" stroke-linecap="round"/>
      </g>`,
    "small-sprout": `
      <g transform="translate(${x} ${y})">
        <ellipse cx="0" cy="38" rx="38" ry="12" fill="#18472d" opacity="0.2"/>
        <path d="M0 34C0 4 8 -10 22 -22" stroke="#6c8a22" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="-16" cy="-2" rx="20" ry="11" fill="#73c93b" transform="rotate(-28 -16 -2)"/>
        <ellipse cx="22" cy="-20" rx="22" ry="12" fill="#8ddb45" transform="rotate(-18 22 -20)"/>
      </g>`,
    sapling: `
      <g transform="translate(${x} ${y}) scale(0.72)">
        <ellipse cx="0" cy="52" rx="44" ry="14" fill="#18472d" opacity="0.22"/>
        <rect x="-7" y="-8" width="14" height="58" rx="5" fill="#8a5a17"/>
        <path d="M0 -52L45 2H-45Z" fill="#71c833"/>
        <path d="M0 -20L58 40H-58Z" fill="#389822"/>
      </g>`,
    "almost-tree": `
      <g transform="translate(${x} ${y}) scale(0.84)">
        <ellipse cx="0" cy="50" rx="46" ry="15" fill="#18472d" opacity="0.23"/>
        <rect x="-8" y="-10" width="16" height="62" rx="5" fill="#8a5a17"/>
        <path d="M0 -72L48 -16H-48Z" fill="#7fd238"/>
        <path d="M0 -36L66 30H-66Z" fill="#4faa28"/>
        <path d="M0 -2L76 48H-76Z" fill="#318d20"/>
      </g>`,
  };

  return { y, svg: drawings[stage] };
}

module.exports = {
  TREE_PAGE_GOAL,
  generateForestImage,
  getForestProgress,
};
