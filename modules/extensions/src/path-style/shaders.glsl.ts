export const dashShaders = {
  inject: {
    'vs:#decl': `
attribute vec2 instanceDashArrays;
attribute float instanceDashOffsets;
varying vec2 vDashArray;
varying float vDashOffset;
`,

    'vs:#main-end': `
vDashArray = instanceDashArrays;
vDashOffset = instanceDashOffsets / width.x;
`,

    'fs:#decl': `
uniform float dashAlignMode;
uniform float capType;
uniform bool dashGapPickable;
varying vec2 vDashArray;
varying float vDashOffset;

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

  float offset;

  if (unitLength > 0.0) {
    if (dashAlignMode == 0.0) {
      offset = vDashOffset;
    } else {
      unitLength = vPathLength / round(vPathLength / unitLength);
      offset = solidLength / 2.0;
    }

    float unitOffset = mod(vPathPosition.y + offset, unitLength);

    if (gapLength > 0.0 && unitOffset > solidLength) {
      if (capType <= 0.5) {
        if (!(dashGapPickable && picking_uActive)) {
          discard;
        }
      } else {
        // caps are rounded, test the distance to solid ends
        float distToEnd = length(vec2(
          min(unitOffset - solidLength, unitLength - unitOffset),
          vPathPosition.x
        ));
        if (distToEnd > 1.0) {
          if (!(dashGapPickable && picking_uActive)) {
            discard;
          }
        }
      }
    }
  }
`
  }
};

export const offsetShaders = {
  inject: {
    'vs:#decl': `
attribute float instanceOffsets;
`,
    'vs:DECKGL_FILTER_SIZE': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  size *= offsetWidth;
`,
    'vs:#main-end': `
  float offsetWidth = abs(instanceOffsets * 2.0) + 1.0;
  float offsetDir = sign(instanceOffsets);
  vPathPosition.x = (vPathPosition.x + offsetDir) * offsetWidth - offsetDir;
  vPathPosition.y *= offsetWidth;
  vPathLength *= offsetWidth;
`,
    'fs:#main-start': `
  float isInside;
  isInside = step(-1.0, vPathPosition.x) * step(vPathPosition.x, 1.0);
  if (isInside == 0.0) {
    discard;
  }
`
  }
};
