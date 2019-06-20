
export function generateCoords(min, max, length) {
  const count = Math.ceil((max - min) / length);
  const coords = new Array(count);
  for (let i = 0; i < count + 1; i++) {
    coords[i] = Math.min(min + i * length, max);
  }
  return coords;
}

export function tesselateRectangle(rect, opts = {}) {

  const {xMin = 0, yMin = 0, xMax = 1, yMax = 1} = rect;

  const xDelta = xMax - xMin;
  const yDelta = yMax - yMin;
  const {xLength = xDelta, yLength = yDelta, addZ = false} = opts;
  const xCoords = generateCoords(xMin, xMax, xLength);
  const yCoords = generateCoords(yMin, yMax, yLength);
  const xCount = xCoords.length;
  const yCount = yCoords.length;

  let vertices = [];
  for (let col = 0; col < yCount - 1; col++) {
    const y = yCoords[col];
    const yNext = yCoords[col+1];
    for (let row = 0; row < xCount - 1; row++) {
      const x = xCoords[row];
      const xNext = xCoords[row+1];
      if (addZ) {
        vertices = vertices.concat([
          x, y, 0,  xNext, y, 0,  xNext, yNext, 0,
          x, y, 0,  xNext, yNext, 0,  x, yNext, 0
        ]);
      } else {
        vertices = vertices.concat([
          x, y,  xNext, y,  xNext, yNext,
          x, y,  xNext, yNext, x, yNext
        ]);
      }

    }
  }
  return vertices;
}

// function tesselateVertices(rectangles, result) {
//   rectangles.forEach(rectangle => {
//     if (rectangle.level >= 3) {
//       // const {xMin, yMin, xMax, yMax} = rectangle;
//       const newVertices = getTriangleVertices(rectangle);
//       result.vertices = result.vertices.concat(newVertices);
//     } else {
//       const newRectangles = tesselate(rectangle);
//       tesselateVertices(newRectangles, result);
//     }
//   });
// }
//
// function tesselate(rectangle) {
//   const {xMin, yMin, xMax, yMax} = rectangle;
//   const level = rectangle.level + 1;
//   const xMid = (xMin + xMax) / 2.0;
//   const yMid = (yMin + yMax) / 2.0;
//   return [
//     {
//       xMin,
//       xMax: xMid,
//       yMin,
//       yMax: yMid,
//       level
//     },
//     {
//       xMin: xMid,
//       xMax,
//       yMin,
//       yMax: yMid,
//       level
//     },
//     {
//       xMin,
//       xMax: xMid,
//       yMin: yMid,
//       yMax,
//       level
//     },
//     {
//       xMin: xMid,
//       xMax,
//       yMin: yMid,
//       yMax,
//       level
//     }
//   ]
// }
//
export function getTriangleVertices(opts = {}) {
  const {xMin = 0, yMin = 0, xMax = 1, yMax = 1, addZ = false} = opts;
  // if (xDeltaMin > Math.abs(xMax - xMin)) {
  //   xDeltaMin = Math.abs(xMax - xMin);
  // }
  // if (yDeltaMin > Math.abs(yMax - yMin)) {
  //   yDeltaMin = Math.abs(yMax - yMin);
  // }
  if (addZ) {
    return [
      xMin, yMin, 0,  xMax, yMin, 0,  xMax, yMax, 0,
      xMin, yMin, 0,  xMax, yMax, 0,  xMin, yMax, 0
    ];
  }
  return [
    xMin, yMin,  xMax, yMin,  xMax, yMax,
    xMin, yMin,  xMax, yMax, xMin, yMax
  ];
}
