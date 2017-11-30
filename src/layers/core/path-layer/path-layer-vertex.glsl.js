// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default `\
#define SHADER_NAME path-layer-vertex-shader-64

attribute vec3 positions;

attribute vec3 instanceStartPositions;
attribute vec3 instanceEndPositions;
attribute vec3 instanceLeftDeltas;
attribute vec3 instanceRightDeltas;
attribute float instanceStrokeWidths;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform float widthScale;
uniform float widthMinPixels;
uniform float widthMaxPixels;
uniform float jointType;
uniform float miterLimit;

uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;
varying vec2 vCornerOffset;
varying float vMiterLength;

const float EPSILON = 0.001;
const float PIXEL_EPSILON = 0.1;

float flipIfTrue(bool flag) {
  return -(float(flag) * 2. - 1.);
}

// calculate line join positions
vec3 lineJoin(vec3 prevPoint, vec3 currPoint, vec3 nextPoint) {

  float width = clamp(project_scale(instanceStrokeWidths * widthScale),
    widthMinPixels, widthMaxPixels) / 2.0;

  vec2 deltaA = currPoint.xy - prevPoint.xy;
  vec2 deltaB = nextPoint.xy - currPoint.xy;

  vec2 offsetVec;
  float offsetScale;
  float offsetDirection;

  float lenA = length(deltaA);
  float lenB = length(deltaB);

  // when two points are closer than PIXEL_EPSILON in pixels,
  // assume they are the same point to avoid precision issue
  lenA = lenA > PIXEL_EPSILON ? lenA : 0.0;
  lenB = lenB > PIXEL_EPSILON ? lenB : 0.0;
  vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
  vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);
  vec2 perpA = vec2(-dirA.y, dirA.x);
  vec2 perpB = vec2(-dirB.y, dirB.x);

  // tangent of the corner
  vec2 tangent = vec2(dirA + dirB);
  tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
  // direction of the corner
  vec2 miterVec = vec2(-tangent.y, tangent.x);
  // width offset from current position
  vec2 perp = mix(perpB, perpA, positions.x);
  float L = mix(lenB, lenA, positions.x);

  // cap super sharp angles
  float sinHalfA = abs(dot(miterVec, perp));
  float cosHalfA = abs(dot(dirA, miterVec));
  bool turnsRight = dirA.x * dirB.y > dirA.y * dirB.x;

  // relative position to the corner:
  // -1: inside (smaller side of the angle)
  // 0: center
  // 1: outside (bigger side of the angle)
  float cornerPosition = mix(
    flipIfTrue(turnsRight == (positions.y > 0.0)),
    0.0,
    positions.z
  );

  offsetScale = 1.0 / max(sinHalfA, EPSILON);

  // do not bevel if line segment is too short
  cornerPosition *= float(cornerPosition <= 0.0 || sinHalfA < min(lenA, lenB) / width * cosHalfA);
  // trim if inside corner extends further than the line segment
  offsetScale = mix(
    offsetScale,
    min(offsetScale, L / width / max(cosHalfA, EPSILON)),
    float(cornerPosition < 0.0)
  );

  vMiterLength = mix(
    offsetScale * cornerPosition,
    mix(offsetScale, 0.0, cornerPosition),
    step(0.0, cornerPosition)
  ) - sinHalfA * jointType;
  offsetDirection = mix(
    positions.y,
    mix(
      flipIfTrue(turnsRight),
      positions.y * flipIfTrue(turnsRight == (positions.x == 1.)),
      cornerPosition
    ),
    step(0.0, cornerPosition)
  );
  offsetVec = mix(miterVec, -tangent, step(0.5, cornerPosition));
  offsetScale = mix(offsetScale, 1.0 / max(cosHalfA, 0.001), step(0.5, cornerPosition));

  // special treatment for start cap and end cap
  float isStartCap = step(0.0, -lenA);
  float isEndCap = step(0.0, -lenB);
  float isCap = max(isStartCap, isEndCap);

  // 0: center, 1: side
  cornerPosition = isCap * (1.0 - positions.z);

  // start of path: use next - curr
  offsetVec = mix(offsetVec, mix(dirB, perpB, cornerPosition), isStartCap);
  // end of path: use curr - prev
  offsetVec = mix(offsetVec, mix(dirA, perpA, cornerPosition), isEndCap);

  // extend out a triangle to envelope the round cap
  offsetScale = mix(
    offsetScale,
    mix(4.0 * jointType, 1.0, cornerPosition),
    isCap
  );
  vMiterLength = mix(vMiterLength, 1.0 - cornerPosition, isCap);

  offsetDirection = mix(
    offsetDirection,
    mix(flipIfTrue(isStartCap > 0.), positions.y, cornerPosition),
    isCap
  );

  vCornerOffset = offsetVec * offsetDirection * offsetScale;

  return currPoint + vec3(vCornerOffset * width, 0.0);
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

  pos = lineJoin(prevPosition, currPosition, nextPosition);

  gl_Position = project_to_clipspace(vec4(pos, 1.0));
}
`;
