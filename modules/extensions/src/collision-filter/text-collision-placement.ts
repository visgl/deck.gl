// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

type Candidate = {
  /** Index of the label's visibility cell */
  index: number;
  /** Picking color index of the label's row. Labels of the same row do not collide. */
  pickingIndex: number;
  /** Byte offset of the label's first visibility texel */
  visibilityOffset: number;
  priority: number;
  /** Projected corners, or null for an axis-aligned rectangle given by its bounds */
  polygon: number[] | null;
  /** The drawn parts of a label that an extension such as ClipExtension hides in part */
  parts: number[][] | null;
  axisAligned: boolean;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  /** Index of the last candidate tested against this one, to test each pair once */
  lastCheckedBy: number;
};

// Each object owns a 4x4 texel cell of the visibility and placement textures, with its texels
// numbered row by row. A visibility texel holds whether a part of the label is unoccluded in red,
// and whether that part was drawn in alpha. The placement texels hold ten 32-bit words, three bytes
// per texel and least significant first, and set alpha where written: eight corner coordinates,
// priority and picking color index.
const CELL_SIZE = 4;
const TEXEL_COUNT = CELL_SIZE * CELL_SIZE;
const ALL_PARTS = (1 << TEXEL_COUNT) - 1;
const PLACEMENT_BYTE_COUNT = 40;
const PLACEMENT_TEXEL_COUNT = Math.ceil(PLACEMENT_BYTE_COUNT / 3);
const PRIORITY_BYTE_OFFSET = 32;
const PICKING_INDEX_BYTE_OFFSET = 36;

// Size of the spatial grid cells used to find nearby accepted labels, in pixels
const GRID_CELL_SIZE = 64;

/** Get the byte offset of a texel of an object's cell */
function getTexelOffset(cellOffset: number, texel: number, rowStride: number): number {
  return cellOffset + Math.floor(texel / CELL_SIZE) * rowStride + (texel % CELL_SIZE) * 4;
}

// Get a bit mask of the label's drawn parts, by texel. Returns 0 unless the GPU found the label
// visible: no part is occluded, and at least one part was drawn.
function getDrawnParts(visibility: Uint8Array, cellOffset: number, rowStride: number): number {
  let drawnParts = 0;
  for (let texel = 0; texel < TEXEL_COUNT; texel++) {
    const offset = getTexelOffset(cellOffset, texel, rowStride);
    if (visibility[offset] < 128) return 0;
    if (visibility[offset + 3] >= 128) drawnParts |= 1 << texel;
  }
  return drawnParts;
}

// Get the part of the label that a texel of its cell tests. Like collision_testBounds, the parts
// split the label 4x4 between its corners. Texel rows run bottom to top, from the label's last row
// of parts.
function getPartPolygon(corners: number[], texel: number): number[] {
  const column = texel % CELL_SIZE;
  const row = CELL_SIZE - 1 - Math.floor(texel / CELL_SIZE);
  const polygon: number[] = [];
  for (const [u, v] of [
    [column, row],
    [column + 1, row],
    [column + 1, row + 1],
    [column, row + 1]
  ]) {
    for (let axis = 0; axis < 2; axis++) {
      const top = corners[axis] + ((corners[2 + axis] - corners[axis]) * u) / CELL_SIZE;
      const bottom = corners[6 + axis] + ((corners[4 + axis] - corners[6 + axis]) * u) / CELL_SIZE;
      polygon.push(top + ((bottom - top) * v) / CELL_SIZE);
    }
  }
  return polygon;
}

// Copy the label's placement words. Fails if no copy of the label wrote them, or if an extension
// such as MaskExtension discarded some of their texels.
function readPlacementData(
  placement: Uint8Array,
  cellOffset: number,
  rowStride: number,
  data: Uint8Array
): boolean {
  for (let texel = 0; texel < PLACEMENT_TEXEL_COUNT; texel++) {
    const offset = getTexelOffset(cellOffset, texel, rowStride);
    if (placement[offset + 3] === 0) return false;
    for (let i = 0; i < 3 && texel * 3 + i < PLACEMENT_BYTE_COUNT; i++) {
      data[texel * 3 + i] = placement[offset + i];
    }
  }
  return true;
}

// Clip only labels crossing the viewport boundary. Intersections outside the
// viewport must not prevent two visible portions from being placed together.
// Returns an empty polygon if nothing with a nonzero area remains.
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

function getPolygons(candidate: Candidate): number[][] {
  if (candidate.parts) return candidate.parts;
  // Create the rectangles of axis-aligned labels only when a rotated label needs them.
  const {minX, minY, maxX, maxY} = candidate;
  candidate.polygon ||= [minX, minY, maxX, minY, maxX, maxY, minX, maxY];
  return [candidate.polygon];
}

function overlaps(a: Candidate, b: Candidate): boolean {
  if (a.maxX <= b.minX || b.maxX <= a.minX || a.maxY <= b.minY || b.maxY <= a.minY) {
    return false;
  }
  if (a.axisAligned && b.axisAligned) return true;
  for (const polygonA of getPolygons(a)) {
    for (const polygonB of getPolygons(b)) {
      if (!hasSeparatingAxis(polygonA, polygonB) && !hasSeparatingAxis(polygonB, polygonA)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Place labels in descending priority. Ties go to the higher visibility cell, which is usually,
 * but not always, the label drawn later. Labels that share a picking color, such as the labels of
 * two TextLayers with the same data, do not collide with each other.
 * Places the labels that the GPU found visible in their visibility cells, which hold the tests
 * against non-text geometry, using the projected corners in their placement cells. A label that
 * another extension hides in part is placed with the parts of it that were drawn. Hides the
 * labels that are not placed by marking their first visibility texel occluded.
 * @returns the number of visible labels
 */
export function placeTextLabels(
  visibility: Uint8Array,
  placement: Uint8Array,
  textureWidth: number,
  cellCount: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  const rowStride = textureWidth * 4;
  const columns = textureWidth / CELL_SIZE;
  const candidates: Candidate[] = [];
  const data = new Uint8Array(PLACEMENT_BYTE_COUNT);
  const words = new DataView(data.buffer);
  const getCoordinate = (word: number, size: number) => words.getFloat32(word * 4, true) * size;
  for (let index = 1; index <= cellCount; index++) {
    const cellOffset =
      Math.floor(index / columns) * CELL_SIZE * rowStride + (index % columns) * CELL_SIZE * 4;
    // Objects without text, and labels that were not drawn or are occluded, stay hidden
    const drawnParts = getDrawnParts(visibility, cellOffset, rowStride);
    if (!drawnParts) continue;
    // Hide the label unless it is placed below, e.g. when it is behind the globe
    const visibilityOffset = cellOffset;
    visibility[visibilityOffset] = 0;
    if (!readPlacementData(placement, cellOffset, rowStride, data)) continue;
    const x0 = getCoordinate(0, viewportWidth);
    const y0 = getCoordinate(1, viewportHeight);
    const x1 = getCoordinate(2, viewportWidth);
    const y1 = getCoordinate(3, viewportHeight);
    const x2 = getCoordinate(4, viewportWidth);
    const y2 = getCoordinate(5, viewportHeight);
    const x3 = getCoordinate(6, viewportWidth);
    const y3 = getCoordinate(7, viewportHeight);
    let minX = Math.min(x0, x1, x2, x3);
    let minY = Math.min(y0, y1, y2, y3);
    let maxX = Math.max(x0, x1, x2, x3);
    let maxY = Math.max(y0, y1, y2, y3);
    // Skip empty and offscreen labels. NaN corners also fail these comparisons.
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
    const crossesViewport = minX < 0 || minY < 0 || maxX > viewportWidth || maxY > viewportHeight;
    const corners = [x0, y0, x1, y1, x2, y2, x3, y3];
    let parts: number[][] | null = null;
    if (drawnParts !== ALL_PARTS) {
      parts = [];
      minX = minY = Infinity;
      maxX = maxY = -Infinity;
      for (let texel = 0; texel < TEXEL_COUNT; texel++) {
        if (!(drawnParts & (1 << texel))) continue;
        let part = getPartPolygon(corners, texel);
        if (crossesViewport) {
          part = clipPolygon(part, viewportWidth, viewportHeight);
          if (part.length < 6) continue;
        }
        parts.push(part);
        for (let i = 0; i < part.length; i += 2) {
          minX = Math.min(minX, part[i]);
          minY = Math.min(minY, part[i + 1]);
          maxX = Math.max(maxX, part[i]);
          maxY = Math.max(maxY, part[i + 1]);
        }
      }
      if (!parts.length) continue;
    }
    const axisAligned =
      !parts &&
      ((x0 === x3 && x1 === x2 && y0 === y1 && y2 === y3) ||
        (x0 === x1 && x2 === x3 && y0 === y3 && y1 === y2));
    let polygon = axisAligned || parts ? null : corners;
    if (polygon && crossesViewport) {
      polygon = clipPolygon(polygon, viewportWidth, viewportHeight);
      if (polygon.length < 6) continue;
    }
    candidates.push({
      index,
      pickingIndex: words.getUint32(PICKING_INDEX_BYTE_OFFSET, true),
      visibilityOffset,
      priority: words.getFloat32(PRIORITY_BYTE_OFFSET, true),
      polygon,
      parts,
      axisAligned,
      minX: Math.max(0, minX),
      minY: Math.max(0, minY),
      maxX: Math.min(viewportWidth, maxX),
      maxY: Math.min(viewportHeight, maxY),
      lastCheckedBy: -1
    });
  }
  candidates.sort((a, b) => b.priority - a.priority || b.index - a.index);

  const gridWidth = Math.ceil(viewportWidth / GRID_CELL_SIZE);
  const grid: Candidate[][] = [];
  let visibleCount = 0;
  for (const candidate of candidates) {
    const firstX = Math.floor(candidate.minX / GRID_CELL_SIZE);
    const firstY = Math.floor(candidate.minY / GRID_CELL_SIZE);
    const lastX = Math.min(gridWidth - 1, Math.floor(candidate.maxX / GRID_CELL_SIZE));
    const lastY = Math.ceil(candidate.maxY / GRID_CELL_SIZE) - 1;
    let blocked = false;
    for (let y = firstY; !blocked && y <= lastY; y++) {
      for (let x = firstX; !blocked && x <= lastX; x++) {
        const gridCell = grid[y * gridWidth + x];
        if (!gridCell) continue;
        for (const accepted of gridCell) {
          // A label spanning several grid cells is tested once
          if (accepted.lastCheckedBy === candidate.index) continue;
          accepted.lastCheckedBy = candidate.index;
          if (accepted.pickingIndex !== candidate.pickingIndex && overlaps(candidate, accepted)) {
            blocked = true;
            break;
          }
        }
      }
    }
    if (blocked) continue;
    visibility[candidate.visibilityOffset] = 255;
    visibleCount++;
    for (let y = firstY; y <= lastY; y++) {
      for (let x = firstX; x <= lastX; x++) {
        (grid[y * gridWidth + x] ||= []).push(candidate);
      }
    }
  }
  return visibleCount;
}
