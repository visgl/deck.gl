#define SHADER_NAME path-layer-vertex-shader

attribute vec3 positions;

attribute vec3 instanceStartPositions;
attribute vec3 instanceEndPositions;
attribute vec3 instanceLeftDeltas;
attribute vec3 instanceRightDeltas;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform float thickness;
uniform float strokeMinPixels;
uniform float strokeMaxPixels;
uniform float jointType;
uniform float miterLimit;
uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;
varying vec3 vCornerUV;
varying float shouldDiscard;

// calculate line join positions
vec3 miterJoin(vec3 prevPoint, vec3 currPoint, vec3 nextPoint) {

  float offset = clamp(project_scale(thickness),
    strokeMinPixels, strokeMaxPixels) / 2.0;
  float offsetScale = 1.0;

  vec2 deltaA = currPoint.xy - prevPoint.xy;
  vec2 deltaB = nextPoint.xy - currPoint.xy;

  vec2 dir = vec2(0.0);
  float offsetDirection = positions.y;
  shouldDiscard = positions.z;

  if (deltaA == vec2(0.0)) {
    // starting point uses (next - current)
    dir = normalize(deltaB);
  } else if (deltaB == vec2(0.0)) {
    // ending point uses (current - previous)
    dir = normalize(deltaA);
  } else {
    vec2 dirA = normalize(deltaA);
    vec2 dirB = normalize(deltaB);
    // direction of the corner
    vec2 tangent = normalize(dirA + dirB);
    // width offset from current position
    dir = mix(dirB, dirA, positions.x);
    vec2 perp = vec2(-dir.y, dir.x);

    vec2 miterVec = vec2(-tangent.y, tangent.x);
    dir = tangent;
    offsetScale = 1.0 / dot(miterVec, perp);

    bool isOutsideCorner = (dirB.y > dirA.y) == (positions.y < 0.0);

    if (!isOutsideCorner && positions.z == 0.0) {
      // is inside corner
      float maxLen = min(length(deltaA), length(deltaB));
      maxLen *= abs(dot(miterVec, dirA));
      if (offsetScale * offset > maxLen) {
        isOutsideCorner = true;
      }
    }

    // needs cropping?
    if (offsetScale > miterLimit) {
      if (positions.z == 1.0) {
        // is bevel center point
        offsetDirection = dirB.y > dirA.y ? -1.0 : 1.0;
        offsetScale = miterLimit;
        shouldDiscard = 0.0;
      } else if (isOutsideCorner) {
        // is outside corner
        // move to bevel center
        currPoint += vec3(miterVec * (offset * miterLimit) * offsetDirection, 0.0);

        // offset from bevel center
        offsetScale = (offsetScale - miterLimit) / offsetScale;
        offsetScale /= abs(dot(miterVec, dirA));
        offsetDirection *= float((dirB.y > dirA.y) == (positions.x == 0.)) * 2. - 1.;
        dir = miterVec;
      }
    }
  }
  vec2 normal = vec2(-dir.y, dir.x) * offsetDirection;

  return currPoint + vec3(normal * offset * offsetScale, 0.0);
}

vec3 roundJoin(vec3 prevPoint, vec3 currPoint, vec3 nextPoint) {

  float offset = clamp(project_scale(thickness),
    strokeMinPixels, strokeMaxPixels) / 2.0;
  float offsetScale = 1.0;

  vec2 deltaA = currPoint.xy - prevPoint.xy;
  vec2 deltaB = nextPoint.xy - currPoint.xy;

  vec2 dir = vec2(0.0);
  float offsetDirection = positions.y;
  float isOutsideCorner = 0.0;

  if (deltaA == vec2(0.0)) {
    // starting point uses (next - current)
    dir = normalize(deltaB);
    // end cap
    if (positions.z == 1.0) {
      dir = vec2(-dir.y, dir.x);
      offsetDirection = 1.0;
      offsetScale = 4.0;
      isOutsideCorner = 1.0;
    }

  } else if (deltaB == vec2(0.0)) {
    // ending point uses (current - previous)
    dir = normalize(deltaA);
    // end cap
    if (positions.z == 1.0) {
      dir = vec2(-dir.y, dir.x);
      offsetDirection = -1.0;
      offsetScale = 4.0;
      isOutsideCorner = 1.0;
    }

  } else {

    vec2 dirA = normalize(deltaA);
    vec2 dirB = normalize(deltaB);

    if ((dirB.y > dirA.y) == (positions.y < 0.0) && positions.z == 0.0) {
      // is outside corner
      dir = mix(dirB, dirA, positions.x);
    } else {
      // direction of the corner
      vec2 tangent = normalize(dirA + dirB);
      // width offset from current position
      dir = mix(dirB, dirA, positions.x);
      vec2 perp = vec2(-dir.y, dir.x);

      vec2 miterVec = vec2(-tangent.y, tangent.x);
      dir = tangent;
      offsetScale = 1.0 / dot(miterVec, perp);

      if (positions.z == 1.0) {
        // is bevel center point
        offsetDirection = dirB.y > dirA.y ? -1.0 : 1.0;
        isOutsideCorner = offsetScale;
      } else {
        // is inside
        float maxLen = min(length(deltaA), length(deltaB));
        maxLen *= abs(dot(miterVec, dirA));
        if (offsetScale * offset > maxLen) {
          dir = mix(dirB, dirA, positions.x);
          offsetScale = 1.0;
        } else {
          isOutsideCorner = -offsetScale;
        }
      }
    }
  }

  vec2 normal = vec2(-dir.y, dir.x) * offsetDirection;
  vCornerUV = vec3(normal * offsetScale, isOutsideCorner);

  return currPoint + vec3(normal * offset * offsetScale, 0.0);
}


void main() {
  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors, 255.) / 255.;
  vColor = mix(color, pickingColor, renderPickingBuffer);

  float isEnd = positions.x;

  vec3 prevPosition = mix(-instanceLeftDeltas, vec3(0.0), isEnd) + instanceStartPositions;
  prevPosition = project_position(prevPosition);

  vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
  currPosition = project_position(currPosition);

  vec3 nextPosition = mix(vec3(0.0), instanceRightDeltas, isEnd) + instanceEndPositions;
  nextPosition = project_position(nextPosition);

  vec3 pos;

  if (jointType == 0.0) {
    pos = miterJoin(prevPosition, currPosition, nextPosition);
  } else {
    pos = roundJoin(prevPosition, currPosition, nextPosition);
  }

  gl_Position = project_to_clipspace(vec4(pos, 1.0));
}
