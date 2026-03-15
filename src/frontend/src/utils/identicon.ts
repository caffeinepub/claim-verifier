/**
 * Generates a deterministic SVG-based identicon from a username string.
 * Uses a 5x5 symmetric grid pattern with a color derived from the username hash.
 */

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit
}

function hueFromUsername(username: string): number {
  const hash = hashString(username);
  // Map to hue, but avoid the coral-orange range (10-40) to prevent clashing with primary
  const raw = hash % 360;
  // Shift hues in the 10-40 range away
  if (raw >= 10 && raw <= 40) {
    return (raw + 180) % 360;
  }
  return raw;
}

function generatePattern(username: string): boolean[][] {
  const hash = hashString(username);
  // 5x5 grid, symmetric: only need to determine 3 columns (0,1,2), mirror 3->1, 4->0
  const grid: boolean[][] = [];
  for (let row = 0; row < 5; row++) {
    const rowArr: boolean[] = [];
    for (let col = 0; col < 5; col++) {
      const mirrorCol = col > 2 ? 4 - col : col;
      const bitIndex = row * 3 + mirrorCol;
      const bit = (hash >> bitIndex) & 1;
      rowArr.push(bit === 1);
    }
    grid.push(rowArr);
  }
  return grid;
}

export function generateIdenticonDataUrl(username: string): string {
  const size = 100;
  const cellSize = size / 5;
  const padding = 10;
  const totalSize = size + padding * 2;

  const hue = hueFromUsername(username);
  const bgLightness = 92;
  const fgLightness = 45;
  const chroma = 0.15;

  const bgColor = `oklch(${bgLightness}% ${chroma * 0.3} ${hue})`;
  const fgColor = `oklch(${fgLightness}% ${chroma} ${hue})`;

  const pattern = generatePattern(username);

  let cells = "";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (pattern[row][col]) {
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;
        cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fgColor}" rx="2"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
  <rect width="${totalSize}" height="${totalSize}" fill="${bgColor}" rx="${totalSize / 2}"/>
  ${cells}
</svg>`;

  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
