export const dashShaders = {
  inject: {
    'vs:#decl': `
attribute vec2 instanceDashArrays;
varying vec2 vDashArray;
`,

    'vs:#main-end': `
vDashArray = instanceDashArrays;
`,

    'fs:#decl': `
uniform float dashAlignMode;
varying vec2 vDashArray;

// mod doesn't work correctly for negative numbers
float mod2(float a, float b) {
  return a - floor(a / b) * b;
}

float round(float x) {
  return floor(x + 0.5);
}
`,

    // if given position is in the gap part of the dashed line
    // dashArray.x: solid stroke length, relative to width
    // dashArray.y: gap length, relative to width
    // alignMode:
    // 0 - no adjustment
    // o----     ----     ----     ---- o----     -o----     ----     o
    // 1 - stretch to fit, draw half dash at each end for nicer joints
    // o--    ----    ----    ----    --o--      --o--     ----     --o
    'fs:#main-start': `
  float solidLength = vDashArray.x;
  float gapLength = vDashArray.y;
  float unitLength = solidLength + gapLength;

  if (unitLength > 0.0) {
    unitLength = mix(
      unitLength,
      vPathLength / round(vPathLength / unitLength),
      dashAlignMode
    );

    float offset = dashAlignMode * solidLength / 2.0;

    if (
      gapLength > 0.0 &&
      vPathPosition.y >= 0.0 &&
      vPathPosition.y <= vPathLength &&
      mod2(vPathPosition.y + offset, unitLength) > solidLength
    ) {
      discard;
    }
  }  
`
  }
};

export const offsetShaders = {
  inject: {
    'vs:#decl': `
attribute float instanceOffsets;
varying float vOffset;
`,
    'vs:DECKGL_FILTER_SIZE': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  size *= offsetWidth;
  vOffset = instanceOffsets;
`,
    'vCornerOffset = offset;': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;

  miterVec = isCap ? perp : miterVec;
  miterSize = isCap ? 1.0 : miterSize;
  vec2 corner = miterVec * miterSize * instanceOffsets * 2.0;
  vCornerOffset = vCornerOffset * offsetWidth - corner;
`,
    'fs:#decl': `
varying float vOffset;
`,
    'fs:#main-start': `
  float isInside;
  float offsetWidth = (abs(vOffset * 2.0) + 1.0);
  if (vOffset >= 0.0) {
    isInside = step(vOffset * 2.0 - 1.0, vPathPosition.x * offsetWidth);
  } else {
    isInside = step(vPathPosition.x * offsetWidth, vOffset * 2.0 + 1.0);
  }
  if (isInside == 0.0) {
    discard;
  }
`
  }
};
