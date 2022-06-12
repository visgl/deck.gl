import GL from '@luma.gl/constants';
import {isWebGL2} from '@luma.gl/core';

export function getBounds(points: number[][]): number[] {
  // Now build bounding box in world space (aligned to world coordiante system)
  const x = points.map(p => p[0]);
  const y = points.map(p => p[1]);

  const xMin = Math.min.apply(null, x);
  const xMax = Math.max.apply(null, x);
  const yMin = Math.min.apply(null, y);
  const yMax = Math.max.apply(null, y);

  return [xMin, yMin, xMax, yMax];
}

// true if currentBounds contains targetBounds, false otherwise
export function boundsContain(currentBounds: number[], targetBounds: number[]): boolean {
  if (
    targetBounds[0] >= currentBounds[0] &&
    targetBounds[2] <= currentBounds[2] &&
    targetBounds[1] >= currentBounds[1] &&
    targetBounds[3] <= currentBounds[3]
  ) {
    return true;
  }
  return false;
}

const scratchArray = new Float32Array(12);

// For given rectangle bounds generates two triangles vertices that coverit completely
export function packVertices(points: number[][], dimensions: number = 2): Float32Array {
  let index = 0;
  for (const point of points) {
    for (let i = 0; i < dimensions; i++) {
      scratchArray[index++] = point[i] || 0;
    }
  }
  return scratchArray;
}

// Expands boundingBox:[xMin, yMin, xMax, yMax] to match aspect ratio of given width and height
export function scaleToAspectRatio(boundingBox: number[], width: number, height: number): number[] {
  const [xMin, yMin, xMax, yMax] = boundingBox;

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

  if (newWidth < width) {
    newWidth = width;
    newHeight = height;
  }

  const xCenter = (xMax + xMin) / 2;
  const yCenter = (yMax + yMin) / 2;

  return [
    xCenter - newWidth / 2,
    yCenter - newHeight / 2,
    xCenter + newWidth / 2,
    yCenter + newHeight / 2
  ];
}

// Get texture coordiante of point inside a bounding box
export function getTextureCoordinates(point: number[], bounds: number[]) {
  const [xMin, yMin, xMax, yMax] = bounds;
  return [(point[0] - xMin) / (xMax - xMin), (point[1] - yMin) / (yMax - yMin)];
}

// Returns format and type for creating texture objects
export function getTextureParams({gl, floatTargetSupport}) {
  return floatTargetSupport
    ? {
        // format:  should be RGBA32F on WebGL2 (float textures), RGBA in WebGL1 for float or non float textures
        format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
        type: GL.FLOAT
      }
    : {
        format: GL.RGBA,
        type: GL.UNSIGNED_BYTE
      };
}
