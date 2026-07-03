const path = require("path");
const sharp = require("sharp");

const TREE_PAGE_GOAL = 50;
const IMAGE_SIZE = 1024;
const VIEWPORT_CROP_SIZE = 650;
const VIEWPORT_CROP_OFFSET = Math.round((IMAGE_SIZE - VIEWPORT_CROP_SIZE) / 2);
const ASSET_DIR = path.join(__dirname, "assets", "forest");
const ISLAND_LEFT = 62;
const ISLAND_TOP = 162;

const SPRITES = {
  island: path.join(ASSET_DIR, "island.png"),
  trees: {
    default: {
      full: path.join(ASSET_DIR, "tree-full.png"),
      seed: path.join(ASSET_DIR, "tree-seed.png"),
      sprout: path.join(ASSET_DIR, "tree-sprout.png"),
      sapling: path.join(ASSET_DIR, "tree-sapling.png"),
      young: path.join(ASSET_DIR, "tree-young.png"),
    },
    pine: {
      full: path.join(ASSET_DIR, "pine-full.png"),
      seed: path.join(ASSET_DIR, "pine-seed.png"),
      sprout: path.join(ASSET_DIR, "pine-sprout.png"),
      sapling: path.join(ASSET_DIR, "pine-sapling.png"),
      young: path.join(ASSET_DIR, "pine-young.png"),
    },
    oak: {
      full: path.join(ASSET_DIR, "oak-full.png"),
      seed: path.join(ASSET_DIR, "oak-seed.png"),
      sprout: path.join(ASSET_DIR, "oak-sprout.png"),
      sapling: path.join(ASSET_DIR, "oak-sapling.png"),
      young: path.join(ASSET_DIR, "oak-young.png"),
    },
  },
};

const GRID_DIVISIONS = 6;
const PLANT_POINTS = createPlantPoints();
const TREE_TYPES = ["default", "pine", "oak"];

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
  if (remainingPages <= 25) return "sprout";
  if (remainingPages <= 37) return "sapling";
  return "young";
}

async function generateForestImage(pages, userId = "default") {
  const progress = getForestProgress(pages);
  const background = Buffer.from(getBackgroundSvg());
  const plants = await getPlantComposites(progress, userId);

  return sharp(background)
    .composite([
      { input: SPRITES.island, left: ISLAND_LEFT, top: ISLAND_TOP },
      ...plants,
    ])
    .extract({
      left: VIEWPORT_CROP_OFFSET,
      top: VIEWPORT_CROP_OFFSET,
      width: VIEWPORT_CROP_SIZE,
      height: VIEWPORT_CROP_SIZE,
    })
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .png()
    .toBuffer();
}

async function getPlantComposites(progress, userId) {
  const hasPartial = Boolean(progress.partialStage);
  const maxCompleteTrees = hasPartial
    ? PLANT_POINTS.length - 1
    : PLANT_POINTS.length;
  const completeTrees = Math.min(progress.completeTrees, maxCompleteTrees);
  const composites = [];

  for (let index = 0; index < completeTrees; index += 1) {
    const treeType = getTreeType(userId, index);
    composites.push(
      await createPlantComposite(
        SPRITES.trees[treeType].full,
        PLANT_POINTS[index],
        index,
      ),
    );
  }

  if (hasPartial && completeTrees < PLANT_POINTS.length) {
    const treeType = getTreeType(userId, completeTrees);
    composites.push(
      await createPlantComposite(
        SPRITES.trees[treeType][progress.partialStage],
        PLANT_POINTS[completeTrees],
        completeTrees,
        getStageScale(progress.partialStage),
      ),
    );
  }

  return composites.sort((a, b) => a.zIndex - b.zIndex).map(({ zIndex, ...item }) => item);
}

async function createPlantComposite(spritePath, point, index, stageScale = 1) {
  const width = Math.round(point.size * stageScale);
  const left = Math.round(point.x - width / 2);
  const top = Math.round(point.y - width * 0.95);

  return {
    input: await sharp(spritePath).resize({ width }).png().toBuffer(),
    left,
    top,
    zIndex: point.y + index / 100,
  };
}

function getStageScale(stage) {
  const scales = {
    seed: 0.44,
    sprout: 0.58,
    sapling: 0.74,
    young: 0.86,
  };
  return scales[stage] || 1;
}

function getTreeType(userId, index) {
  const hash = hashString(`${userId}:${index}`);
  return TREE_TYPES[hash % TREE_TYPES.length];
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createPlantPoints() {
  const preferredCells = [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
    [4, 1],
    [2, 4],
    [4, 3],
    [3, 0],
    [0, 3],
    [5, 2],
    [1, 1],
    [1, 3],
    [3, 3],
    [3, 1],
    [4, 3],
    [2, 5],
    [3, 4],
    [5, 0],
    [0, 5],
    [5, 4],
    [4, 5],
  ];
  const points = [];
  const used = new Set();

  for (const [row, col] of preferredCells) {
    addPlantPoint(points, used, row, col);
  }

  for (let row = 0; row < GRID_DIVISIONS; row += 1) {
    for (let col = 0; col < GRID_DIVISIONS; col += 1) {
      addPlantPoint(points, used, row, col);
    }
  }

  return points;
}

function addPlantPoint(points, used, row, col) {
  const key = `${row}:${col}`;
  if (used.has(key)) return;

  used.add(key);
  points.push(getGridPoint(row, col));
}

function getGridPoint(row, col) {
  const top = { x: 512, y: 206 };
  const right = { x: 898, y: 432 };
  const left = { x: 126, y: 432 };
  const inset = 0.065;
  const colAmount = inset + ((col + 0.5) / GRID_DIVISIONS) * (1 - inset * 2);
  const rowAmount = inset + ((row + 0.5) / GRID_DIVISIONS) * (1 - inset * 2);
  const x =
    top.x +
    (right.x - top.x) * colAmount +
    (left.x - top.x) * rowAmount;
  const y =
    top.y +
    (right.y - top.y) * colAmount +
    (left.y - top.y) * rowAmount;
  const depth = row + col;
  const edgeDistance = Math.min(row, col, GRID_DIVISIONS - 1 - row, GRID_DIVISIONS - 1 - col);
  const edgeScale = edgeDistance === 0 ? 0.84 : edgeDistance === 1 ? 0.94 : 1;
  const size = Math.max(112, Math.round((164 - depth * 4) * edgeScale));

  return {
    x: Math.round(x),
    y: Math.round(y + 20),
    size,
  };
}

function getBackgroundSvg() {
  return `
<svg width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" viewBox="0 0 ${IMAGE_SIZE} ${IMAGE_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(512 432) rotate(90) scale(520)">
      <stop offset="0" stop-color="#2e7854"/>
      <stop offset="0.58" stop-color="#1f5b46"/>
      <stop offset="1" stop-color="#12372d"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.055"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" fill="url(#glow)"/>
  <rect width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" filter="url(#grain)" opacity="0.28"/>
</svg>`;
}

module.exports = {
  TREE_PAGE_GOAL,
  generateForestImage,
  getForestProgress,
};
