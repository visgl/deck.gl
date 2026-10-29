// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

type Candidate = {
  index: number;
  pixel: number;
  priority: number;
  polygon: number[] | null;
  axisAligned: boolean;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  checkedBy: number;
};

const CELL_SIZE = 64;

// Clip only labels crossing the viewport boundary. Intersections outside the
// viewport must not prevent two visible portions from being placed together.
function clipPolygon(polygon: number[], width: number, height: number): number[] {
  for (let edge = 0; edge < 4 && polygon.length; edge++) {
    const axis = edge % 2;
    const limit = edge < 2 ? 0 : axis === 0 ? width : height;
    const sign = edge < 2 ? 1 : -1;
    const clipped: number[] = [];
    let previous = polygon.length - 2;
    for (let current = 0; current < polygon.length; current += 2) {
      const previousDistance = (polygon[previous + axis] - limit) * sign;
      const currentDistance = (polygon[current + axis] - limit) * sign;
      if (previousDistance >= 0 !== currentDistance >= 0) {
        const t = previousDistance / (previousDistance - currentDistance);
        clipped.push(
          polygon[previous] + t * (polygon[current] - polygon[previous]),
          polygon[previous + 1] + t * (polygon[current + 1] - polygon[previous + 1])
        );
      }
      if (currentDistance >= 0) clipped.push(polygon[current], polygon[current + 1]);
      previous = current;
    }
    polygon = clipped;
  }
  let area = 0;
  for (let i = 0; i < polygon.length; i += 2) {
    const next = (i + 2) % polygon.length;
    area += polygon[i] * polygon[next + 1] - polygon[next] * polygon[i + 1];
  }
  return area === 0 ? [] : polygon;
}

// Separating-axis test for convex projected/clipped label rectangles.
function hasSeparatingAxis(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i += 2) {
    const next = (i + 2) % a.length;
    const x = a[i + 1] - a[next + 1];
    const y = a[next] - a[i];
    if (x === 0 && y === 0) continue;
    let minA = Infinity;
    let maxA = -Infinity;
    let minB = Infinity;
    let maxB = -Infinity;
    for (let j = 0; j < a.length; j += 2) {
      const value = x * a[j] + y * a[j + 1];
      minA = Math.min(minA, value);
      maxA = Math.max(maxA, value);
    }
    for (let j = 0; j < b.length; j += 2) {
      const value = x * b[j] + y * b[j + 1];
      minB = Math.min(minB, value);
      maxB = Math.max(maxB, value);
    }
    if (maxA <= minB || maxB <= minA) return true;
  }
  return false;
}

function overlaps(a: Candidate, b: Candidate): boolean {
  if (a.maxX <= b.minX || b.maxX <= a.minX || a.maxY <= b.minY || b.maxY <= a.minY) {
    return false;
  }
  if (a.axisAligned && b.axisAligned) return true;
  a.polygon ||= [a.minX, a.minY, a.maxX, a.minY, a.maxX, a.maxY, a.minX, a.maxY];
  b.polygon ||= [b.minX, b.minY, b.maxX, b.minY, b.maxX, b.maxY, b.minX, b.maxY];
  return !hasSeparatingAxis(a.polygon, b.polygon) && !hasSeparatingAxis(b.polygon, a.polygon);
}

/**
 * Place labels in descending priority, breaking ties by source draw order.
 * The GPU supplies projected corners and eligibility against non-text geometry
 * in 4x4 RGBA8 blocks: eight corner coordinates, priority, presence, then six
 * non-text collision results. Floats are encoded least-significant byte first.
 * Update the last texel of each block with its final visibility.
 */
export function placeTextLabels(
  pixels: Uint8Array,
  textureWidth: number,
  objectCount: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  const floats = new DataView(pixels.buffer, pixels.byteOffset, pixels.byteLength);
  const rowStride = textureWidth * 4;
  const columns = textureWidth / 4;
  const candidates: Candidate[] = [];
  for (let index = 1; index <= objectCount; index++) {
    const base = Math.floor(index / columns) * 4 * rowStride + (index % columns) * 16;
    const pixel = base + 3 * rowStride + 12;
    let eligible = floats.getFloat32(base + 2 * rowStride + 4, true) === 1;
    for (let component = 10; eligible && component < 16; component++) {
      if (pixels[base + Math.floor(component / 4) * rowStride + (component % 4) * 4] === 0)
        eligible = false;
    }
    pixels[pixel] = 0;
    if (!eligible) continue;
    const x0 = floats.getFloat32(base, true) * viewportWidth;
    const y0 = floats.getFloat32(base + 4, true) * viewportHeight;
    const x1 = floats.getFloat32(base + 8, true) * viewportWidth;
    const y1 = floats.getFloat32(base + 12, true) * viewportHeight;
    const x2 = floats.getFloat32(base + rowStride, true) * viewportWidth;
    const y2 = floats.getFloat32(base + rowStride + 4, true) * viewportHeight;
    const x3 = floats.getFloat32(base + rowStride + 8, true) * viewportWidth;
    const y3 = floats.getFloat32(base + rowStride + 12, true) * viewportHeight;
    const minX = Math.min(x0, x1, x2, x3);
    const minY = Math.min(y0, y1, y2, y3);
    const maxX = Math.max(x0, x1, x2, x3);
    const maxY = Math.max(y0, y1, y2, y3);
    if (
      !(
        minX < maxX &&
        minY < maxY &&
        minX < viewportWidth &&
        minY < viewportHeight &&
        maxX > 0 &&
        maxY > 0
      )
    )
      continue;
    const axisAligned =
      (x0 === x3 && x1 === x2 && y0 === y1 && y2 === y3) ||
      (x0 === x1 && x2 === x3 && y0 === y3 && y1 === y2);
    let polygon = axisAligned ? null : [x0, y0, x1, y1, x2, y2, x3, y3];
    if (polygon && (minX < 0 || minY < 0 || maxX > viewportWidth || maxY > viewportHeight)) {
      polygon = clipPolygon(polygon, viewportWidth, viewportHeight);
      if (polygon.length < 6) continue;
    }
    candidates.push({
      index,
      pixel,
      priority: floats.getFloat32(base + 2 * rowStride, true),
      polygon,
      axisAligned,
      minX: Math.max(0, minX),
      minY: Math.max(0, minY),
      maxX: Math.min(viewportWidth, maxX),
      maxY: Math.min(viewportHeight, maxY),
      checkedBy: -1
    });
  }
  candidates.sort((a, b) => b.priority - a.priority || b.index - a.index);

  const gridWidth = Math.ceil(viewportWidth / CELL_SIZE);
  const cells: Candidate[][] = [];
  let visibleCount = 0;
  for (const candidate of candidates) {
    const firstX = Math.floor(candidate.minX / CELL_SIZE);
    const firstY = Math.floor(candidate.minY / CELL_SIZE);
    const lastX = Math.min(gridWidth - 1, Math.floor(candidate.maxX / CELL_SIZE));
    const lastY = Math.ceil(candidate.maxY / CELL_SIZE) - 1;
    let blocked = false;
    for (let y = firstY; !blocked && y <= lastY; y++) {
      for (let x = firstX; !blocked && x <= lastX; x++) {
        const cell = cells[y * gridWidth + x];
        if (!cell) continue;
        for (const accepted of cell) {
          if (accepted.checkedBy === candidate.index) continue;
          accepted.checkedBy = candidate.index;
          if (overlaps(candidate, accepted)) {
            blocked = true;
            break;
          }
        }
      }
    }
    if (blocked) continue;
    pixels[candidate.pixel] = 255;
    visibleCount++;
    for (let y = firstY; y <= lastY; y++) {
      for (let x = firstX; x <= lastX; x++) {
        (cells[y * gridWidth + x] ||= []).push(candidate);
      }
    }
  }
  return visibleCount;
}
