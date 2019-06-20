import {experimental, createIterable} from '@deck.gl/core';
const {count} = experimental;

// Parse input data to build positions, wights arrays.
export function parseData(data, getPosition, getWeight) {
  const pointCount = count(data);

  const positions = new Float32Array(pointCount * 3);
  const weights = new Float32Array(pointCount);

  const {iterable, objectInfo} = createIterable(data);
  for (const object of iterable) {
    objectInfo.index++;
    const position = getPosition(object, objectInfo);
    const {index} = objectInfo;
    positions[index * 3] = position[0];
    positions[index * 3 + 1] = position[1];
    positions[index * 3 + 2] = position[2] || 0;
    weights[index] = getWeight(object, objectInfo);
  }

  return {
    positions,
    weights
  };
}

// true if currentBounds contains targetBounds, false otherwise
export function boundsContain(currentBounds, targetBounds) {
  const [currentMin, currentMax] = currentBounds;
  const [targetMin, targetMax] = targetBounds;

  if (
    targetMin[0] >= currentMin[0] &&
    targetMax[0] <= currentMax[0] &&
    (targetMin[1] >= currentMin[1] && targetMax[1] <= currentMax[1])
  ) {
    return true;
  }
  return false;
}

// For given rectangle bounds generates two triangles vertices that coverit completely
export function getTriangleVertices(opts = {}) {
  const {xMin = 0, yMin = 0, xMax = 1, yMax = 1, addZ = false} = opts;

  if (addZ) {
    return new Float32Array([
      xMin,
      yMin,
      0,
      xMax,
      yMin,
      0,
      xMax,
      yMax,
      0,
      xMin,
      yMin,
      0,
      xMax,
      yMax,
      0,
      xMin,
      yMax,
      0
    ]);
  }
  return new Float32Array([xMin, yMin, xMax, yMin, xMax, yMax, xMin, yMin, xMax, yMax, xMin, yMax]);
}

// Expands boundingBox:[[xMin, yMin], [xMax, yMax]] to match aspect ratio of given width and height
export function scaleToAspectRatio(boundingBox, width, height) {
  const [[xMin, yMin], [xMax, yMax]] = boundingBox;

  const currentWidth = xMax - xMin;
  const currentHeight = yMax - yMin;

  let newWidth = currentWidth;
  let newHeight = currentHeight;
  if (currentWidth / currentHeight < width / height) {
    // expand bounding box width
    newWidth = (width / height) * currentHeight;
  } else {
    newHeight = (height / width) * currentWidth;
  }

  if (newWidth < width || newHeight < height) {
    newWidth = width;
    newHeight = height;
  }

  const xCenter = (xMax + xMin) / 2;
  const yCenter = (yMax + yMin) / 2;

  return [
    [xCenter - newWidth / 2, yCenter - newHeight / 2],
    [xCenter + newWidth / 2, yCenter + newHeight / 2]
  ];
}

// Scales texture coordiante range to a sub rectangel
export function scaleTextureCoordiantes(originalRect, subRect) {
  const [[xMin, yMin], [xMax, yMax]] = originalRect;
  const [[subXMin, subYMin], [subXMax, subYMax]] = subRect;
  const width = xMax - xMin;
  const height = yMax - yMin;
  const tXMin = (subXMin - xMin) / width;
  const tXMax = (subXMax - xMin) / width;
  const tYMin = (subYMin - yMin) / height;
  const tYMax = (subYMax - yMin) / height;
  return [[tXMin, tYMin], [tXMax, tYMax]];
}
