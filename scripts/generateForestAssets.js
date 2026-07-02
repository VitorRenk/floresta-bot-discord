const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

const outDir = path.join(__dirname, "..", "assets", "forest");

async function writePng(name, svg) {
  await fs.mkdir(outDir, { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, name));
}

function islandSvg() {
  return `
<svg width="900" height="640" viewBox="0 0 900 640" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grass" x1="450" y1="42" x2="450" y2="436" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#c5fb55"/>
      <stop offset="0.48" stop-color="#a9ea45"/>
      <stop offset="1" stop-color="#79c83a"/>
    </linearGradient>
    <linearGradient id="leftSoil" x1="64" y1="330" x2="450" y2="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#78662e"/>
      <stop offset="1" stop-color="#4e3c22"/>
    </linearGradient>
    <linearGradient id="rightSoil" x1="836" y1="330" x2="450" y2="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a27b38"/>
      <stop offset="1" stop-color="#624923"/>
    </linearGradient>
    <filter id="shadow" x="0" y="0" width="900" height="640" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="24" stdDeviation="18" flood-color="#06251b" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <path d="M450 44L836 270L450 496L64 270Z" fill="url(#grass)"/>
    <path d="M64 270L450 496V610L64 384Z" fill="url(#leftSoil)"/>
    <path d="M836 270L450 496V610L836 384Z" fill="url(#rightSoil)"/>
    <path d="M64 270L450 496L836 270" stroke="#5f9d32" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

    <g opacity="0.2" stroke="#66b931" stroke-width="3">
      ${gridLines(6)}
    </g>

    <g opacity="0.45">
      ${Array.from({ length: 26 }, (_, i) => {
        const t = i / 25;
        const x = 90 + (356 * t);
        const y = 402 + (190 * t);
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="18" ry="10" fill="#8a6b35"/>`;
      }).join("")}
      ${Array.from({ length: 26 }, (_, i) => {
        const t = i / 25;
        const x = 810 - (356 * t);
        const y = 402 + (190 * t);
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="18" ry="10" fill="#b1843f"/>`;
      }).join("")}
    </g>

    <g stroke="#6cb833" stroke-width="6" stroke-linecap="round" opacity="0.55">
      <path d="M175 247C185 231 195 231 205 247"/>
      <path d="M300 205C310 189 320 189 330 205"/>
      <path d="M455 165C465 149 475 149 485 165"/>
      <path d="M570 226C580 210 590 210 600 226"/>
      <path d="M692 276C702 260 712 260 722 276"/>
      <path d="M388 296C398 280 408 280 418 296"/>
      <path d="M510 355C520 339 530 339 540 355"/>
      <path d="M275 347C285 331 295 331 305 347"/>
      <path d="M630 332C640 316 650 316 660 332"/>
    </g>
  </g>
</svg>`;
}

function gridLines(divisions) {
  const top = { x: 450, y: 44 };
  const right = { x: 836, y: 270 };
  const bottom = { x: 450, y: 496 };
  const left = { x: 64, y: 270 };
  const lines = [];

  for (let index = 1; index < divisions; index += 1) {
    const amount = index / divisions;
    const a1 = interpolate(left, top, amount);
    const a2 = interpolate(bottom, right, amount);
    const b1 = interpolate(top, right, amount);
    const b2 = interpolate(left, bottom, amount);
    lines.push(`<path d="M${a1.x} ${a1.y}L${a2.x} ${a2.y}"/>`);
    lines.push(`<path d="M${b1.x} ${b1.y}L${b2.x} ${b2.y}"/>`);
  }

  return lines.join("");
}

function interpolate(start, end, amount) {
  return {
    x: Math.round(start.x + (end.x - start.x) * amount),
    y: Math.round(start.y + (end.y - start.y) * amount),
  };
}

function fullTreeSvg() {
  return `
<svg width="220" height="270" viewBox="0 0 220 270" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="trunk" x1="110" y1="142" x2="110" y2="235" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9e661c"/>
      <stop offset="1" stop-color="#744713"/>
    </linearGradient>
    <linearGradient id="leaf1" x1="110" y1="10" x2="110" y2="108" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#b5ef45"/>
      <stop offset="1" stop-color="#6fbd24"/>
    </linearGradient>
    <linearGradient id="leaf2" x1="110" y1="70" x2="110" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8ed937"/>
      <stop offset="1" stop-color="#3f9e20"/>
    </linearGradient>
    <linearGradient id="leaf3" x1="110" y1="126" x2="110" y2="228" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#67c42f"/>
      <stop offset="1" stop-color="#21841d"/>
    </linearGradient>
  </defs>
  <ellipse cx="110" cy="238" rx="54" ry="18" fill="#123c2a" opacity="0.26"/>
  <rect x="96" y="123" width="28" height="112" rx="8" fill="url(#trunk)"/>
  <path d="M101 128H124V144C115 150 105 149 96 142Z" fill="#6f4312" opacity="0.34"/>
  <path d="M110 118L184 192L142 216H78L36 192Z" fill="url(#leaf3)"/>
  <path d="M110 73L170 143L135 164H85L50 143Z" fill="url(#leaf2)"/>
  <path d="M110 24L152 84L128 101H92L68 84Z" fill="url(#leaf1)"/>
  <path d="M110 118L184 192L123 180Z" fill="#8bdd3e" opacity="0.22"/>
  <path d="M110 73L170 143L122 132Z" fill="#b3ef45" opacity="0.26"/>
  <path d="M110 24L152 84L118 79Z" fill="#d6ff58" opacity="0.3"/>
  <path d="M36 192L78 216H142L184 192L142 228H78Z" fill="#217719" opacity="0.18"/>
  <path d="M50 143L85 164H135L170 143L135 176H85Z" fill="#2d841b" opacity="0.18"/>
  <rect x="98" y="207" width="24" height="32" rx="7" fill="url(#trunk)"/>
  <path d="M101 210H121V222C114 226 106 226 99 221Z" fill="#b97820" opacity="0.4"/>
</svg>`;
}

function youngTreeSvg() {
  return `
<svg width="190" height="235" viewBox="0 0 190 235" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="95" cy="207" rx="44" ry="15" fill="#123c2a" opacity="0.23"/>
  <rect x="83" y="100" width="24" height="106" rx="7" fill="#8f5a18"/>
  <path d="M95 81L153 151L120 174H70L37 151Z" fill="#3f9e22"/>
  <path d="M95 30L138 90L113 108H77L52 90Z" fill="#8bd73a"/>
  <path d="M95 81L153 151L108 142Z" fill="#86da38" opacity="0.22"/>
  <path d="M95 30L138 90L104 84Z" fill="#c5f34d" opacity="0.34"/>
  <path d="M37 151L70 174H120L153 151L120 190H70Z" fill="#237b1b" opacity="0.2"/>
  <rect x="85" y="174" width="20" height="36" rx="6" fill="#8f5a18"/>
</svg>`;
}

function saplingSvg() {
  return `
<svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="164" rx="35" ry="12" fill="#123c2a" opacity="0.2"/>
  <rect x="67" y="77" width="16" height="88" rx="6" fill="#8f5a18"/>
  <path d="M75 72L124 132L96 151H54L26 132Z" fill="#3f9e22"/>
  <path d="M75 31L110 82L90 98H60L40 82Z" fill="#8edc3d"/>
  <path d="M75 72L124 132L86 124Z" fill="#86da38" opacity="0.22"/>
  <path d="M75 31L110 82L83 77Z" fill="#c7f653" opacity="0.34"/>
  <rect x="68" y="143" width="14" height="27" rx="5" fill="#8f5a18"/>
</svg>`;
}

function sproutSvg() {
  return `
<svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="65" cy="126" rx="35" ry="11" fill="#123c2a" opacity="0.19"/>
  <path d="M64 121C64 78 72 57 93 37" stroke="#6e8c25" stroke-width="13" stroke-linecap="round"/>
  <path d="M63 118C60 86 48 67 28 52" stroke="#6e8c25" stroke-width="11" stroke-linecap="round"/>
  <ellipse cx="96" cy="35" rx="31" ry="17" fill="#8cda3a" transform="rotate(-22 96 35)"/>
  <ellipse cx="30" cy="52" rx="28" ry="16" fill="#64bd32" transform="rotate(26 30 52)"/>
  <ellipse cx="75" cy="72" rx="22" ry="12" fill="#a6eb43" transform="rotate(-28 75 72)"/>
</svg>`;
}

function seedSvg() {
  return `
<svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="96" rx="30" ry="10" fill="#123c2a" opacity="0.16"/>
  <ellipse cx="48" cy="80" rx="18" ry="13" fill="#8f6830"/>
  <path d="M52 72C60 45 74 34 91 32" stroke="#68b832" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="85" cy="30" rx="17" ry="9" fill="#8ddb40" transform="rotate(-20 85 30)"/>
</svg>`;
}

async function main() {
  await writePng("island.png", islandSvg());
  await writePng("tree-full.png", fullTreeSvg());
  await writePng("tree-young.png", youngTreeSvg());
  await writePng("tree-sapling.png", saplingSvg());
  await writePng("tree-sprout.png", sproutSvg());
  await writePng("tree-seed.png", seedSvg());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
