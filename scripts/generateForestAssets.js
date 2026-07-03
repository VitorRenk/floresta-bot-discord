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
    <linearGradient id="appleTrunk" x1="110" y1="124" x2="110" y2="238" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a66a28"/>
      <stop offset="1" stop-color="#704516"/>
    </linearGradient>
    <linearGradient id="appleLeaf" x1="110" y1="52" x2="110" y2="220" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a9e84f"/>
      <stop offset="1" stop-color="#2f8f2c"/>
    </linearGradient>
  </defs>
  <ellipse cx="110" cy="238" rx="55" ry="18" fill="#123c2a" opacity="0.25"/>
  <rect x="96" y="126" width="28" height="112" rx="8" fill="url(#appleTrunk)"/>
  <path d="M110 165C92 152 79 141 64 126" stroke="#7a4a17" stroke-width="11" stroke-linecap="round"/>
  <path d="M111 164C129 150 141 138 155 122" stroke="#7a4a17" stroke-width="11" stroke-linecap="round"/>
  <circle cx="75" cy="135" r="42" fill="#63b93b"/>
  <circle cx="110" cy="104" r="54" fill="#99dc49"/>
  <circle cx="148" cy="134" r="42" fill="#5fb43a"/>
  <circle cx="108" cy="159" r="56" fill="url(#appleLeaf)"/>
  <path d="M83 116C97 78 126 66 151 84C122 80 101 94 83 116Z" fill="#c7f65b" opacity="0.28"/>
  <path d="M63 161C88 200 137 202 162 164C140 183 87 184 63 161Z" fill="#247326" opacity="0.18"/>
  <circle cx="78" cy="149" r="8" fill="#d9472f"/>
  <circle cx="125" cy="128" r="8" fill="#e65334"/>
  <circle cx="145" cy="166" r="7" fill="#c9362a"/>
  <circle cx="101" cy="184" r="7" fill="#d9472f"/>
  <rect x="99" y="206" width="23" height="34" rx="7" fill="url(#appleTrunk)"/>
  <path d="M102 209H121V222C114 226 106 226 100 221Z" fill="#bd7a28" opacity="0.38"/>
</svg>`;
}

function youngTreeSvg() {
  return `
<svg width="190" height="235" viewBox="0 0 190 235" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="95" cy="207" rx="44" ry="15" fill="#123c2a" opacity="0.23"/>
  <rect x="83" y="104" width="24" height="104" rx="7" fill="#90591c"/>
  <path d="M95 151C80 140 70 130 59 117" stroke="#784918" stroke-width="9" stroke-linecap="round"/>
  <path d="M96 151C111 139 121 128 132 114" stroke="#784918" stroke-width="9" stroke-linecap="round"/>
  <circle cx="67" cy="126" r="34" fill="#66ba3d"/>
  <circle cx="96" cy="98" r="43" fill="#95d948"/>
  <circle cx="124" cy="127" r="35" fill="#5fb43a"/>
  <circle cx="94" cy="146" r="44" fill="#3f9b30"/>
  <path d="M74 112C86 83 108 74 128 88C105 86 89 96 74 112Z" fill="#c8f55a" opacity="0.3"/>
  <circle cx="76" cy="143" r="6" fill="#d9472f"/>
  <circle cx="116" cy="127" r="6" fill="#e65334"/>
  <rect x="86" y="174" width="19" height="36" rx="6" fill="#90591c"/>
</svg>`;
}

function saplingSvg() {
  return `
<svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="164" rx="35" ry="12" fill="#123c2a" opacity="0.2"/>
  <rect x="67" y="80" width="16" height="88" rx="6" fill="#90591c"/>
  <path d="M75 126C64 117 56 108 49 98" stroke="#784918" stroke-width="7" stroke-linecap="round"/>
  <path d="M76 126C88 116 95 107 103 96" stroke="#784918" stroke-width="7" stroke-linecap="round"/>
  <circle cx="56" cy="105" r="26" fill="#66ba3d"/>
  <circle cx="76" cy="83" r="32" fill="#95d948"/>
  <circle cx="96" cy="108" r="27" fill="#5fb43a"/>
  <circle cx="75" cy="126" r="33" fill="#3f9b30"/>
  <circle cx="88" cy="121" r="5" fill="#d9472f"/>
  <rect x="68" y="143" width="14" height="27" rx="5" fill="#90591c"/>
</svg>`;
}

function sproutSvg() {
  return `
<svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="65" cy="126" rx="35" ry="11" fill="#123c2a" opacity="0.19"/>
  <path d="M65 120C64 82 68 59 80 38" stroke="#8c5b21" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="43" cy="69" rx="27" ry="16" fill="#65b93d" transform="rotate(24 43 69)"/>
  <ellipse cx="88" cy="42" rx="30" ry="17" fill="#95d948" transform="rotate(-18 88 42)"/>
  <ellipse cx="78" cy="82" rx="23" ry="14" fill="#4aa135" transform="rotate(-12 78 82)"/>
  <circle cx="87" cy="78" r="5" fill="#d9472f"/>
</svg>`;
}

function seedSvg() {
  return `
<svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="96" rx="30" ry="10" fill="#123c2a" opacity="0.16"/>
  <ellipse cx="48" cy="80" rx="17" ry="13" fill="#8f6830"/>
  <path d="M36 70H60C58 61 53 56 48 56C42 56 38 61 36 70Z" fill="#614016"/>
  <path d="M54 72C62 50 75 38 90 35" stroke="#65b93d" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="87" cy="33" rx="16" ry="9" fill="#95d948" transform="rotate(-18 87 33)"/>
</svg>`;
}

function pineFullSvg() {
  return `
<svg width="220" height="270" viewBox="0 0 220 270" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="trunk" x1="110" y1="122" x2="110" y2="238" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9c6420"/>
      <stop offset="1" stop-color="#684015"/>
    </linearGradient>
    <linearGradient id="pineA" x1="110" y1="16" x2="110" y2="232" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#9ee445"/>
      <stop offset="1" stop-color="#146f25"/>
    </linearGradient>
    <linearGradient id="pineB" x1="110" y1="70" x2="110" y2="230" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#61b937"/>
      <stop offset="1" stop-color="#0e5f21"/>
    </linearGradient>
  </defs>
  <ellipse cx="110" cy="238" rx="52" ry="17" fill="#123c2a" opacity="0.25"/>
  <rect x="98" y="118" width="24" height="118" rx="7" fill="url(#trunk)"/>
  <path d="M110 16L145 82L124 94H96L75 82Z" fill="url(#pineA)"/>
  <path d="M110 58L164 137L132 154H88L56 137Z" fill="url(#pineB)"/>
  <path d="M110 111L184 204L142 228H78L36 204Z" fill="url(#pineB)"/>
  <path d="M110 16L145 82L119 76Z" fill="#c7f652" opacity="0.3"/>
  <path d="M110 58L164 137L121 125Z" fill="#83d440" opacity="0.24"/>
  <path d="M110 111L184 204L124 188Z" fill="#58bd35" opacity="0.2"/>
  <rect x="99" y="208" width="22" height="31" rx="7" fill="url(#trunk)"/>
</svg>`;
}

function pineYoungSvg() {
  return `
<svg width="190" height="235" viewBox="0 0 190 235" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="95" cy="207" rx="43" ry="15" fill="#123c2a" opacity="0.22"/>
  <rect x="85" y="98" width="20" height="108" rx="7" fill="#855319"/>
  <path d="M95 28L128 88L109 101H81L62 88Z" fill="#96df44"/>
  <path d="M95 75L148 151L118 171H72L42 151Z" fill="#2f942d"/>
  <path d="M95 28L128 88L103 82Z" fill="#c5f44e" opacity="0.3"/>
  <path d="M95 75L148 151L108 141Z" fill="#70ca3c" opacity="0.22"/>
  <rect x="87" y="174" width="17" height="36" rx="6" fill="#855319"/>
</svg>`;
}

function pineSaplingSvg() {
  return `
<svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="164" rx="34" ry="12" fill="#123c2a" opacity="0.2"/>
  <rect x="68" y="78" width="14" height="88" rx="6" fill="#855319"/>
  <path d="M75 33L105 84L88 97H62L45 84Z" fill="#96df44"/>
  <path d="M75 78L121 139L94 157H56L29 139Z" fill="#2f942d"/>
  <path d="M75 33L105 84L82 79Z" fill="#c5f44e" opacity="0.32"/>
  <rect x="69" y="144" width="12" height="26" rx="5" fill="#855319"/>
</svg>`;
}

function pineSproutSvg() {
  return `
<svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="65" cy="126" rx="34" ry="11" fill="#123c2a" opacity="0.18"/>
  <path d="M65 119C65 83 67 61 74 41" stroke="#76511b" stroke-width="11" stroke-linecap="round"/>
  <path d="M73 32L98 73H48Z" fill="#86d63d"/>
  <path d="M73 61L109 110H37Z" fill="#2f942d"/>
  <path d="M73 32L98 73L78 68Z" fill="#c5f44e" opacity="0.3"/>
</svg>`;
}

function pineSeedSvg() {
  return `
<svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="96" rx="29" ry="10" fill="#123c2a" opacity="0.16"/>
  <ellipse cx="48" cy="82" rx="16" ry="12" fill="#8a6427"/>
  <path d="M51 75C54 52 64 39 78 31" stroke="#6dbb32" stroke-width="7" stroke-linecap="round"/>
  <path d="M78 23L94 49H62Z" fill="#8dda3d"/>
</svg>`;
}

function oakFullSvg() {
  return `
<svg width="220" height="270" viewBox="0 0 220 270" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="oakTrunk" x1="110" y1="126" x2="110" y2="238" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a46824"/>
      <stop offset="1" stop-color="#704416"/>
    </linearGradient>
    <linearGradient id="oakLeaf" x1="110" y1="42" x2="110" y2="218" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#a9e34a"/>
      <stop offset="1" stop-color="#2f8a2b"/>
    </linearGradient>
  </defs>
  <ellipse cx="110" cy="238" rx="55" ry="18" fill="#123c2a" opacity="0.25"/>
  <rect x="96" y="126" width="28" height="112" rx="8" fill="url(#oakTrunk)"/>
  <circle cx="76" cy="136" r="44" fill="#5fb43b"/>
  <circle cx="110" cy="104" r="55" fill="#8bd342"/>
  <circle cx="148" cy="137" r="45" fill="#62b63b"/>
  <circle cx="108" cy="158" r="57" fill="url(#oakLeaf)"/>
  <path d="M82 115C95 76 124 64 150 83C122 78 101 93 82 115Z" fill="#c6f254" opacity="0.28"/>
  <path d="M63 161C87 199 139 202 163 162C142 183 86 184 63 161Z" fill="#247326" opacity="0.18"/>
  <rect x="99" y="206" width="23" height="34" rx="7" fill="url(#oakTrunk)"/>
</svg>`;
}

function oakYoungSvg() {
  return `
<svg width="190" height="235" viewBox="0 0 190 235" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="95" cy="207" rx="44" ry="15" fill="#123c2a" opacity="0.22"/>
  <rect x="84" y="104" width="23" height="104" rx="7" fill="#90591c"/>
  <circle cx="68" cy="125" r="34" fill="#65b93d"/>
  <circle cx="95" cy="96" r="43" fill="#8bd342"/>
  <circle cx="124" cy="126" r="35" fill="#62b63b"/>
  <circle cx="94" cy="146" r="44" fill="#3f992f"/>
  <path d="M73 111C85 82 107 73 128 88C105 86 88 95 73 111Z" fill="#c6f254" opacity="0.3"/>
  <rect x="86" y="174" width="19" height="36" rx="6" fill="#90591c"/>
</svg>`;
}

function oakSaplingSvg() {
  return `
<svg width="150" height="190" viewBox="0 0 150 190" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="75" cy="164" rx="34" ry="12" fill="#123c2a" opacity="0.2"/>
  <rect x="67" y="80" width="16" height="88" rx="6" fill="#90591c"/>
  <circle cx="57" cy="104" r="27" fill="#65b93d"/>
  <circle cx="77" cy="82" r="33" fill="#8bd342"/>
  <circle cx="96" cy="109" r="28" fill="#4aa135"/>
  <circle cx="75" cy="126" r="34" fill="#3f992f"/>
  <rect x="68" y="143" width="14" height="27" rx="5" fill="#90591c"/>
</svg>`;
}

function oakSproutSvg() {
  return `
<svg width="130" height="150" viewBox="0 0 130 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="65" cy="126" rx="34" ry="11" fill="#123c2a" opacity="0.18"/>
  <path d="M65 120C64 82 66 60 78 39" stroke="#8c5b21" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="43" cy="68" rx="27" ry="16" fill="#65b93d" transform="rotate(24 43 68)"/>
  <ellipse cx="86" cy="43" rx="29" ry="17" fill="#8bd342" transform="rotate(-19 86 43)"/>
  <ellipse cx="78" cy="82" rx="23" ry="14" fill="#4aa135" transform="rotate(-12 78 82)"/>
</svg>`;
}

function oakSeedSvg() {
  return `
<svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="96" rx="29" ry="10" fill="#123c2a" opacity="0.16"/>
  <ellipse cx="48" cy="80" rx="17" ry="13" fill="#8f6830"/>
  <path d="M36 70H60C58 61 53 56 48 56C42 56 38 61 36 70Z" fill="#614016"/>
  <path d="M54 72C62 50 75 38 90 35" stroke="#65b93d" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="87" cy="33" rx="16" ry="9" fill="#8bd342" transform="rotate(-18 87 33)"/>
</svg>`;
}

async function main() {
  await writePng("island.png", islandSvg());
  await writePng("tree-full.png", fullTreeSvg());
  await writePng("tree-young.png", youngTreeSvg());
  await writePng("tree-sapling.png", saplingSvg());
  await writePng("tree-sprout.png", sproutSvg());
  await writePng("tree-seed.png", seedSvg());
  await writePng("pine-full.png", pineFullSvg());
  await writePng("pine-young.png", pineYoungSvg());
  await writePng("pine-sapling.png", pineSaplingSvg());
  await writePng("pine-sprout.png", pineSproutSvg());
  await writePng("pine-seed.png", pineSeedSvg());
  await writePng("oak-full.png", oakFullSvg());
  await writePng("oak-young.png", oakYoungSvg());
  await writePng("oak-sapling.png", oakSaplingSvg());
  await writePng("oak-sprout.png", oakSproutSvg());
  await writePng("oak-seed.png", oakSeedSvg());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
