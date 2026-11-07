// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME path-layer-vertex-shader

in vec2 positions;

in float instanceTypes;
in vec3 instanceStartPositions;
in vec3 instanceEndPositions;
in vec3 instanceLeftPositions;
in vec3 instanceRightPositions;
in vec3 instanceLeftPositions64Low;
in vec3 instanceStartPositions64Low;
in vec3 instanceEndPositions64Low;
in vec3 instanceRightPositions64Low;
in float instanceStrokeWidths;
in vec4 instanceColors;
in float rowIndexes;

uniform float opacity;

out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
#ifdef DASH_ENABLED
// [position along the source segment, complete source-segment length]
out vec2 vDashSegment;
#endif

const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);

float flipIfTrue(bool flag) {
  return -(float(flag) * 2. - 1.);
}

// calculate line join positions
vec3 getLineJoinOffset(
  vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
  vec2 width
#ifdef DASH_ENABLED
  , float sourcePathLength, vec2 sourcePathRange
#endif
#ifdef ANTIALIASING
  , float coverageScale
#endif
) {
  bool isEnd = positions.x > 0.0;
  // side of the segment - -1: left, 0: center, 1: right
  float sideOfPath = positions.y;
  float isJoint = float(sideOfPath == 0.0);

  vec3 deltaA3 = (currPoint - prevPoint);
  vec3 deltaB3 = (nextPoint - currPoint);

  mat3 rotationMatrix;
  bool needsRotation = !path.billboard && project_needs_rotation(currPoint, rotationMatrix);
  if (needsRotation) {
    deltaA3 = deltaA3 * rotationMatrix;
    deltaB3 = deltaB3 * rotationMatrix;
  }
  vec2 deltaA = deltaA3.xy / width;
  vec2 deltaB = deltaB3.xy / width;

  float lenA = length(deltaA);
  float lenB = length(deltaB);

  vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
  vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);

  vec2 perpA = vec2(-dirA.y, dirA.x);
  vec2 perpB = vec2(-dirB.y, dirB.x);

  // tangent of the corner
  vec2 tangent = dirA + dirB;
  tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
  // direction of the corner
  vec2 miterVec = vec2(-tangent.y, tangent.x);
  // direction of the segment
  vec2 dir = isEnd ? dirA : dirB;
  // direction of the extrusion
  vec2 perp = isEnd ? perpA : perpB;
  // length of the segment
  float L = isEnd ? lenA : lenB;

#ifdef DASH_ENABLED
  // Extrusion happens in the XY plane, so L above is a 2D length. For a path that also moves
  // in Z, the source-segment arclength is longer by this ratio. Keep that dash coordinate
  // separate from vPathPosition so PathLayer's geometric cap and joint tests stay unchanged.
  // Billboard mode extrudes in clip space, where the perspective divide has already reduced
  // the segment to its screen projection, so its complete common-space length is supplied by
  // the caller.
  vec3 currDelta3 = isEnd ? deltaA3 : deltaB3;
  float currLength2D = length(currDelta3.xy);
  float dashArcLengthRatio = 1.0;
  float dashPositionOffset = 0.0;
  float dashSegmentLength = L;
  if (path.billboard) {
    // clipLine may shorten the visible screen-space segment. Preserve the corresponding interval
    // of the complete common-space arclength instead of compressing the full dash period into the
    // visible span. Keep dashSegmentLength complete so justification is stable as the camera
    // clips it.
    float visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
    dashArcLengthRatio = L > 0.0 ? visiblePathLength / L : 0.0;
    dashPositionOffset = sourcePathLength * sourcePathRange.x;
    dashSegmentLength = sourcePathLength;
  } else if (currLength2D > 0.0) {
    // Do not clamp a valid denominator to EPSILON: high-zoom Web Mercator deltas are often
    // smaller than that in common space, and changing their scale corrupts even flat paths.
    dashArcLengthRatio = length(currDelta3) / currLength2D;
    dashSegmentLength = L * dashArcLengthRatio;
  }
#endif

  // A = angle of the corner
  float sinHalfA = abs(dot(miterVec, perp));
  float cosHalfA = abs(dot(dirA, miterVec));

  // -1: right, 1: left
  float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);

  // relative position to the corner:
  // -1: inside (smaller side of the angle)
  // 0: center
  // 1: outside (bigger side of the angle)
  float cornerPosition = sideOfPath * turnDirection;

  float miterSize = 1.0 / max(sinHalfA, EPSILON);
  // trim if inside corner extends further than the line segment
  miterSize = mix(
    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
    miterSize,
    step(0.0, cornerPosition)
  );

  vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))
    * (sideOfPath + isJoint * turnDirection);

  // special treatment for start cap and end cap
  bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
  bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
  bool isCap = isStartCap || isEndCap;

  // extend out a triangle to envelope the round cap
  if (isCap) {
    offsetVec = mix(perp * sideOfPath, dir * path.capType * 4.0 * flipIfTrue(isStartCap), isJoint);
    vJointType = path.capType;
  } else {
    vJointType = path.jointType;
  }

#ifdef ANTIALIASING
  // The physical stroke still ends at offsetVec; the scaled coordinates and vertices only extend
  // its rasterized envelope to include the outer half of the centered coverage ramp.
  vec2 coverageOffsetVec = offsetVec * coverageScale;
  vPathLength = L;
  vCornerOffset = coverageOffsetVec;
  vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
  vMiterLength = isCap ? isJoint : vMiterLength;

  vec2 offsetFromStartOfPath = coverageOffsetVec + deltaA * float(isEnd);
  float positionAlongPath = dot(offsetFromStartOfPath, dir);
  vPathPosition = vec2(dot(offsetFromStartOfPath, perp), positionAlongPath);
#ifdef DASH_ENABLED
  vDashSegment = vec2(
    dashPositionOffset + positionAlongPath * dashArcLengthRatio,
    dashSegmentLength
  );
#endif
  geometry.uv = vPathPosition;

  float isValid = step(instanceTypes, 3.5);
  vec3 offset = vec3(coverageOffsetVec * width * isValid, 0.0);
#else
  // Generate variables for fragment shader
  vPathLength = L;
  vCornerOffset = offsetVec;
  vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
  vMiterLength = isCap ? isJoint : vMiterLength;

  vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
  float positionAlongPath = dot(offsetFromStartOfPath, dir);
  vPathPosition = vec2(dot(offsetFromStartOfPath, perp), positionAlongPath);
#ifdef DASH_ENABLED
  vDashSegment = vec2(
    dashPositionOffset + positionAlongPath * dashArcLengthRatio,
    dashSegmentLength
  );
#endif
  geometry.uv = vPathPosition;

  float isValid = step(instanceTypes, 3.5);
  vec3 offset = vec3(offsetVec * width * isValid, 0.0);
#endif

  if (needsRotation) {
    offset = rotationMatrix * offset;
  }
  return offset;
}

// In clipspace extrusion, if a line extends behind the camera, clip it to avoid visual artifacts
void clipLine(inout vec4 position, vec4 refPosition) {
  if (position.w < EPSILON) {
    float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
    position = refPosition + (position - refPosition) * r;
  }
}

#ifdef DASH_ENABLED
// Return the visible interval of the original segment before clipLine moves either endpoint.
vec2 getClippedPathRange(float startW, float endW) {
  bool startClipped = startW < EPSILON;
  bool endClipped = endW < EPSILON;
  if (startClipped && endClipped) {
    return vec2(0.0);
  }
  if (startClipped || endClipped) {
    float intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
    return startClipped ? vec2(intersection, 1.0) : vec2(0.0, intersection);
  }
  return vec2(0.0, 1.0);
}
#endif

void main() {
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);

  vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);

  float isEnd = positions.x;

  vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);
  vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);

  vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
  vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);

  vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);
  vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);

  geometry.worldPosition = currPosition;
  vec2 widthPixels = vec2(clamp(
    project_size_to_pixel(instanceStrokeWidths * path.widthScale, path.widthUnits),
    path.widthMinPixels, path.widthMaxPixels) / 2.0);
  vec3 width;

  if (path.billboard) {
    // Extrude in clipspace
#ifdef DASH_ENABLED
    vec4 prevPositionCommon;
    vec4 nextPositionCommon;
    vec4 prevPositionScreen = project_position_to_clipspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET, prevPositionCommon
    );
#else
    vec4 prevPositionScreen = project_position_to_clipspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
#endif
    vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
#ifdef DASH_ENABLED
    vec4 nextPositionScreen = project_position_to_clipspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET, nextPositionCommon
    );
#else
    vec4 nextPositionScreen = project_position_to_clipspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
#endif

#ifdef DASH_ENABLED
    vec4 sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
    vec4 sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
    vec2 billboardPathRange = getClippedPathRange(
      sourcePathStartScreen.w, sourcePathEndScreen.w
    );
#endif

    clipLine(prevPositionScreen, currPositionScreen);
    clipLine(nextPositionScreen, currPositionScreen);
    clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));

    width = vec3(widthPixels, 0.0);
    DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
    vec2 coveragePadding = vec2(0.5 / project.devicePixelRatio);
    float coverageScale = length(width.xy) > 0.0
      ? length(width.xy + coveragePadding) / length(width.xy)
      : 1.0;
#endif

#ifdef DASH_ENABLED
    vec3 currentDeltaCommon = isEnd > 0.0
      ? geometry.position.xyz - prevPositionCommon.xyz
      : nextPositionCommon.xyz - geometry.position.xyz;
    float billboardPathLength = width.x > 0.0
      ? length(currentDeltaCommon) * project.scale / (width.x * project.focalDistance)
      : 0.0;
#endif

    vec3 offset = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(width.xy)
#ifdef DASH_ENABLED
      ,
      billboardPathLength, billboardPathRange
#endif
#ifdef ANTIALIASING
      ,
      coverageScale
#endif
    );
    DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
    gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
  } else {
    // Extrude in commonspace
    prevPosition = project_position(prevPosition, prevPosition64Low);
    currPosition = project_position(currPosition, currPosition64Low);
    nextPosition = project_position(nextPosition, nextPosition64Low);

    width = vec3(project_pixel_size(widthPixels), 0.0);
    DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
    vec2 coveragePadding = project_pixel_size(vec2(0.5 / project.devicePixelRatio));
    float coverageScale = length(width.xy) > 0.0
      ? length(width.xy + coveragePadding) / length(width.xy)
      : 1.0;
#endif

    vec3 offset = getLineJoinOffset(
      prevPosition, currPosition, nextPosition, width.xy
#ifdef DASH_ENABLED
      , 1.0, vec2(0.0, 1.0)
#endif
#ifdef ANTIALIASING
      , coverageScale
#endif
    );
    geometry.position = vec4(currPosition + offset, 1.0);
    gl_Position = project_common_position_to_clipspace(geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
