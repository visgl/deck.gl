function toFinite(n) {
  return Number.isFinite(n) ? n : 0;
}

// Parse input data to build positions, wights and bounding box.
/* eslint-disable max-statements */
export function getBoundingBox(attributes, vertexCount) {
  // TODO - value might not exist (e.g. attribute transition)
  const positions = attributes.positions.value;

  let yMin = Infinity;
  let yMax = -Infinity;
  let xMin = Infinity;
  let xMax = -Infinity;
  let y;
  let x;

  for (let i = 0; i < vertexCount; i++) {
    x = positions[i * 3];
    y = positions[i * 3 + 1];
    yMin = y < yMin ? y : yMin;
    yMax = y > yMax ? y : yMax;
    xMin = x < xMin ? x : xMin;
    xMax = x > xMax ? x : xMax;
  }

  const boundingBox = {
    xMin: toFinite(xMin),
    xMax: toFinite(xMax),
    yMin: toFinite(yMin),
    yMax: toFinite(yMax)
  };

  return boundingBox;
}
/* eslint-enable max-statements */

// Aligns `inValue` to given `cellSize`
export function alignToCell(inValue, cellSize) {
  const sign = inValue < 0 ? -1 : 1;

  let value = sign < 0 ? Math.abs(inValue) + cellSize : Math.abs(inValue);

  value = Math.floor(value / cellSize) * cellSize;

  return value * sign;
}
