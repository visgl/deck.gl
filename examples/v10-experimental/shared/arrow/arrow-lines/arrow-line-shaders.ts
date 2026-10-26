// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ShaderLayout} from '@luma.gl/core';
import {ShaderInputs} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';
import {TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT} from './arrow-line-data';

export const PATH_SHADER_LAYOUT = {
  attributes: [
    {name: 'segmentStartPositions', location: 0, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'segmentEndPositions', location: 1, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'segmentPreviousPositions', location: 2, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'segmentNextPositions', location: 3, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'segmentFlags', location: 4, type: 'u32', stepMode: 'instance'},
    {name: 'rowIndices', location: 5, type: 'u32', stepMode: 'instance'},
    {name: 'segmentStartColors', location: 6, type: 'u32', stepMode: 'instance'},
    {name: 'segmentEndColors', location: 7, type: 'u32', stepMode: 'instance'},
    {name: 'widths', location: 8, type: 'f32', stepMode: 'instance'},
    {name: 'pathViewOrigins', location: 9, type: 'vec4<f32>', stepMode: 'instance'}
  ],
  bindings: []
} satisfies ShaderLayout;

export const PATH_STORAGE_SHADER_LAYOUT = {
  attributes: [
    {name: 'segmentStartPointIndices', location: 0, type: 'u32', stepMode: 'instance'},
    {name: 'segmentFlags', location: 1, type: 'u32', stepMode: 'instance'},
    {name: 'rowIndices', location: 2, type: 'u32', stepMode: 'instance'}
  ],
  bindings: []
} satisfies ShaderLayout;

export const WGSL_SHADER = /* wgsl */ `\
struct PathViewportUniforms {
  viewportScale : vec2<f32>,
  time : f32,
  colorsEnabled : f32,
  widthsEnabled : f32,
  capRounded : f32,
  jointRounded : f32,
  miterLimit : f32,
};

@group(0) @binding(auto) var<uniform> pathViewport : PathViewportUniforms;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) segmentStartPositions : vec4<f32>,
  @location(1) segmentEndPositions : vec4<f32>,
  @location(2) segmentPreviousPositions : vec4<f32>,
  @location(3) segmentNextPositions : vec4<f32>,
  @location(4) segmentFlags : u32,
  @location(5) rowIndices : u32,
  @location(6) segmentStartColors : u32,
  @location(7) segmentEndColors : u32,
  @location(8) widths : f32,
  @location(9) pathViewOrigins : vec4<f32>,
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @location(1) measure : f32,
  @location(2) cornerOffset : vec2<f32>,
  @location(3) miterLength : f32,
  @location(4) pathPosition : vec2<f32>,
  @location(5) pathLength : f32,
  @location(6) jointType : f32,
};

struct PathExtrusion {
  offset : vec2<f32>,
  cornerOffset : vec2<f32>,
  miterLength : f32,
  pathPosition : vec2<f32>,
  pathLength : f32,
  jointType : f32,
};

const PATH_EPSILON : f32 = 0.00001;
const PATH_SEGMENT_FIRST : u32 = 1u;
const PATH_SEGMENT_LAST : u32 = 2u;
const PATH_SEGMENT_CLOSED : u32 = 4u;

fn getSegmentVertex(vertexIndex : u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 2u) { return vec2<f32>(0.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 5u) { return vec2<f32>(0.0, 1.0); }
  if (vertexIndex == 6u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 7u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 8u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 9u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 10u) { return vec2<f32>(1.0, 0.0); }
  return vec2<f32>(1.0, 1.0);
}

fn unpackPathColor(colorWord : u32) -> vec4<f32> {
  return unpack4x8unorm(colorWord);
}

fn flipIfTrue(flag : bool) -> f32 {
  return select(1.0, -1.0, flag);
}

fn computePathExtrusion(
  previousPoint : vec2<f32>,
  currentPoint : vec2<f32>,
  nextPoint : vec2<f32>,
  segmentVertex : vec2<f32>,
  halfWidth : f32,
  segmentFlags : u32
) -> PathExtrusion {
  let isEnd = segmentVertex.x > 0.5;
  let sideOfPath = segmentVertex.y;
  let isJoint = select(0.0, 1.0, abs(sideOfPath) < 0.5);
  let normalizedWidth = max(halfWidth, PATH_EPSILON);
  let deltaA = (currentPoint - previousPoint) / normalizedWidth;
  let deltaB = (nextPoint - currentPoint) / normalizedWidth;
  let lenA = length(deltaA);
  let lenB = length(deltaB);
  let dirA = deltaA / max(lenA, PATH_EPSILON);
  let dirB = deltaB / max(lenB, PATH_EPSILON);
  let perpA = vec2<f32>(-dirA.y, dirA.x);
  let perpB = vec2<f32>(-dirB.y, dirB.x);
  let tangentBasis = dirA + dirB;
  let tangentLength = length(tangentBasis);
  let tangent = select(
    perpA,
    tangentBasis / max(tangentLength, PATH_EPSILON),
    tangentLength > PATH_EPSILON
  );
  let miterVector = vec2<f32>(-tangent.y, tangent.x);
  let direction = select(dirB, dirA, isEnd);
  let perpendicular = select(perpB, perpA, isEnd);
  let pathLength = select(lenB, lenA, isEnd);
  let sinHalfAngle = abs(dot(miterVector, perpendicular));
  let cosHalfAngle = abs(dot(dirA, miterVector));
  let turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  let cornerPosition = sideOfPath * turnDirection;
  var miterSize = 1.0 / max(sinHalfAngle, PATH_EPSILON);
  let trimmedMiterSize = min(
    miterSize,
    max(lenA, lenB) / max(cosHalfAngle, PATH_EPSILON)
  );
  miterSize = select(trimmedMiterSize, miterSize, cornerPosition >= 0.0);
  var cornerOffset = mix(
    miterVector * miterSize,
    perpendicular,
    step(0.5, cornerPosition)
  ) * (sideOfPath + isJoint * turnDirection);
  let isFirst = (segmentFlags & PATH_SEGMENT_FIRST) != 0u;
  let isLast = (segmentFlags & PATH_SEGMENT_LAST) != 0u;
  let isClosed = (segmentFlags & PATH_SEGMENT_CLOSED) != 0u;
  let isStartCap = lenA <= PATH_EPSILON || (!isEnd && isFirst && !isClosed);
  let isEndCap = lenB <= PATH_EPSILON || (isEnd && isLast && !isClosed);
  let isCap = isStartCap || isEndCap;
  var jointType = pathViewport.jointRounded;
  if (isCap) {
    let capOffset =
      direction * pathViewport.capRounded * 4.0 * flipIfTrue(isStartCap);
    cornerOffset = mix(perpendicular * sideOfPath, capOffset, isJoint);
    jointType = pathViewport.capRounded;
  }
  let miterLength = select(
    dot(cornerOffset, miterVector * turnDirection),
    isJoint,
    isCap
  );
  let offsetFromStart = cornerOffset + deltaA * select(0.0, 1.0, isEnd);
  var extrusion : PathExtrusion;
  extrusion.offset = cornerOffset * halfWidth;
  extrusion.cornerOffset = cornerOffset;
  extrusion.miterLength = miterLength;
  extrusion.pathPosition = vec2<f32>(
    dot(offsetFromStart, perpendicular),
    dot(offsetFromStart, direction)
  );
  extrusion.pathLength = pathLength;
  extrusion.jointType = jointType;
  return extrusion;
}

@vertex
fn vertexMain(inputs : VertexInputs) -> FragmentInputs {
  var outputs : FragmentInputs;
  let segmentVertex = getSegmentVertex(inputs.vertexIndex % 12u);
  let previousSegmentPosition = inputs.segmentPreviousPositions.xy;
  let startPosition = inputs.segmentStartPositions.xy;
  let endPosition = inputs.segmentEndPositions.xy;
  let nextSegmentPosition = inputs.segmentNextPositions.xy;
  let previousPoint = mix(previousSegmentPosition, startPosition, segmentVertex.x);
  let currentPoint = mix(startPosition, endPosition, segmentVertex.x);
  let nextPoint = mix(endPosition, nextSegmentPosition, segmentVertex.x);
  let halfWidth = mix(0.0035, inputs.widths, pathViewport.widthsEnabled);
  let extrusion = computePathExtrusion(
    previousPoint,
    currentPoint,
    nextPoint,
    segmentVertex,
    halfWidth,
    inputs.segmentFlags
  );
  let worldPosition = currentPoint + extrusion.offset + inputs.pathViewOrigins.xy;
  let neutralColor = vec4<f32>(0.78, 0.86, 0.96, 0.92);
  let pathColor = mix(
    unpackPathColor(inputs.segmentStartColors),
    unpackPathColor(inputs.segmentEndColors),
    segmentVertex.x
  );
  outputs.Position = vec4<f32>(worldPosition * pathViewport.viewportScale, 0.0, 1.0);
  outputs.color = mix(neutralColor, pathColor, pathViewport.colorsEnabled);
  outputs.measure = mix(
    inputs.segmentStartPositions.w + inputs.pathViewOrigins.w,
    inputs.segmentEndPositions.w + inputs.pathViewOrigins.w,
    segmentVertex.x
  );
  outputs.cornerOffset = extrusion.cornerOffset;
  outputs.miterLength = extrusion.miterLength;
  outputs.pathPosition = extrusion.pathPosition;
  outputs.pathLength = extrusion.pathLength;
  outputs.jointType = extrusion.jointType;
  return outputs;
}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
  if (inputs.pathPosition.y < 0.0 || inputs.pathPosition.y > inputs.pathLength) {
    if (inputs.jointType > 0.5 && length(inputs.cornerOffset) > 1.0) {
      discard;
    }
    if (inputs.jointType < 0.5 && inputs.miterLength > pathViewport.miterLimit + 1.0) {
      discard;
    }
  }
  let measureLag = pathViewport.time - inputs.measure;
  let measureReached = select(0.0, 1.0, measureLag >= 0.0);
  let measureHighlight = measureReached * (1.0 - smoothstep(0.0, 0.16, measureLag));
  let highlight = 0.24 + measureHighlight * 0.76;
  let lightenedColor = mix(
    inputs.color.rgb * 0.72,
    min(inputs.color.rgb * 1.18 + vec3<f32>(0.05), vec3<f32>(1.0)),
    highlight
  );
  return vec4<f32>(lightenedColor, inputs.color.a);
}
`;

function makePathStorageWGSLShader({usesTimestampColumn}: {usesTimestampColumn: boolean}): string {
  return /* wgsl */ `\
struct PathViewportUniforms {
  viewportScale : vec2<f32>,
  time : f32,
  colorsEnabled : f32,
  widthsEnabled : f32,
  capRounded : f32,
  jointRounded : f32,
  miterLimit : f32,
};

@group(0) @binding(auto) var<uniform> pathViewport : PathViewportUniforms;
@group(0) @binding(auto) var<storage, read> pathValues : array<f32>;
@group(0) @binding(auto) var<storage, read> pathRanges : array<vec4<u32>>;
@group(0) @binding(auto) var<storage, read> pathViewOrigins : array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> pathRowColors : array<u32>;
@group(0) @binding(auto) var<storage, read> pathVertexColors : array<u32>;
@group(0) @binding(auto) var<storage, read> pathRowWidths : array<f32>;
${usesTimestampColumn ? '@group(0) @binding(auto) var<storage, read> pathTimestamps : array<f32>;\n' : ''}

struct PathStorageStyleConfig {
  constantColor : vec4<f32>,
  constantWidth : f32,
  useRowColors : u32,
  useRowWidths : u32,
  batchRowIndexBase : u32,
  pathComponentCount : u32,
  useViewOrigins : u32,
  useVertexColors : u32,
  _padding1 : u32,
};

@group(0) @binding(auto) var<uniform> pathStorageStyleConfig : PathStorageStyleConfig;
${
  usesTimestampColumn
    ? `\

struct TripPathConfig {
  currentTime : f32,
  trailLength : f32,
  fadeTrail : u32,
  _padding0 : u32,
};

@group(0) @binding(auto) var<uniform> tripPathConfig : TripPathConfig;
`
    : ''
}

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) segmentStartPointIndices : u32,
  @location(1) segmentFlags : u32,
  @location(2) rowIndices : u32,
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @location(1) measure : f32,
  @location(2) cornerOffset : vec2<f32>,
  @location(3) miterLength : f32,
  @location(4) pathPosition : vec2<f32>,
  @location(5) pathLength : f32,
  @location(6) jointType : f32,
${usesTimestampColumn ? '  @location(7) time : f32,\n' : ''}
};

struct PathExtrusion {
  offset : vec2<f32>,
  cornerOffset : vec2<f32>,
  miterLength : f32,
  pathPosition : vec2<f32>,
  pathLength : f32,
  jointType : f32,
};

const PATH_EPSILON : f32 = 0.00001;
const PATH_SEGMENT_FIRST : u32 = 1u;
const PATH_SEGMENT_LAST : u32 = 2u;
const PATH_SEGMENT_CLOSED : u32 = 4u;

fn getSegmentVertex(vertexIndex : u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 2u) { return vec2<f32>(0.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 5u) { return vec2<f32>(0.0, 1.0); }
  if (vertexIndex == 6u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 7u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 8u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 9u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 10u) { return vec2<f32>(1.0, 0.0); }
  return vec2<f32>(1.0, 1.0);
}

fn unpackPathColor(colorWord : u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn readPathComponent(pointIndex : u32, componentIndex : u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) {
    return 0.0;
  }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readPathPoint(pointIndex : u32) -> vec4<f32> {
  return vec4<f32>(
    readPathComponent(pointIndex, 0u),
    readPathComponent(pointIndex, 1u),
    readPathComponent(pointIndex, 2u),
    readPathComponent(pointIndex, 3u)
  );
}

fn readPathRange(globalRowIndex : u32) -> vec4<u32> {
  return pathRanges[globalRowIndex - pathStorageStyleConfig.batchRowIndexBase];
}

fn readPathViewOrigin(rowIndex : u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) {
    return vec4<f32>(0.0);
  }
  return pathViewOrigins[rowIndex];
}

fn getSegmentEndPointIndex(segmentStartPointIndex : u32) -> u32 {
  return segmentStartPointIndex + 1u;
}

fn getSegmentPreviousPointIndex(
  pathRange : vec4<u32>,
  segmentStartPointIndex : u32,
  segmentFlags : u32
) -> u32 {
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let isFirst = (segmentFlags & PATH_SEGMENT_FIRST) != 0u;
  let isClosed = (segmentFlags & PATH_SEGMENT_CLOSED) != 0u;
  if (isFirst && isClosed) {
    return pathEnd - 2u;
  }
  if (isFirst) {
    return segmentStartPointIndex;
  }
  return max(pathStart, segmentStartPointIndex - 1u);
}

fn getSegmentNextPointIndex(
  pathRange : vec4<u32>,
  segmentEndPointIndex : u32,
  segmentFlags : u32
) -> u32 {
  let pathStart = pathRange.x;
  let isLast = (segmentFlags & PATH_SEGMENT_LAST) != 0u;
  let isClosed = (segmentFlags & PATH_SEGMENT_CLOSED) != 0u;
  if (isLast && isClosed) {
    return pathStart + 1u;
  }
  if (isLast) {
    return segmentEndPointIndex;
  }
  return segmentEndPointIndex + 1u;
}

fn flipIfTrue(flag : bool) -> f32 {
  return select(1.0, -1.0, flag);
}

fn computePathExtrusion(
  previousPoint : vec2<f32>,
  currentPoint : vec2<f32>,
  nextPoint : vec2<f32>,
  segmentVertex : vec2<f32>,
  halfWidth : f32,
  segmentFlags : u32
) -> PathExtrusion {
  let isEnd = segmentVertex.x > 0.5;
  let sideOfPath = segmentVertex.y;
  let isJoint = select(0.0, 1.0, abs(sideOfPath) < 0.5);
  let normalizedWidth = max(halfWidth, PATH_EPSILON);
  let deltaA = (currentPoint - previousPoint) / normalizedWidth;
  let deltaB = (nextPoint - currentPoint) / normalizedWidth;
  let lenA = length(deltaA);
  let lenB = length(deltaB);
  let dirA = deltaA / max(lenA, PATH_EPSILON);
  let dirB = deltaB / max(lenB, PATH_EPSILON);
  let perpA = vec2<f32>(-dirA.y, dirA.x);
  let perpB = vec2<f32>(-dirB.y, dirB.x);
  let tangentBasis = dirA + dirB;
  let tangentLength = length(tangentBasis);
  let tangent = select(
    perpA,
    tangentBasis / max(tangentLength, PATH_EPSILON),
    tangentLength > PATH_EPSILON
  );
  let miterVector = vec2<f32>(-tangent.y, tangent.x);
  let direction = select(dirB, dirA, isEnd);
  let perpendicular = select(perpB, perpA, isEnd);
  let pathLength = select(lenB, lenA, isEnd);
  let sinHalfAngle = abs(dot(miterVector, perpendicular));
  let cosHalfAngle = abs(dot(dirA, miterVector));
  let turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  let cornerPosition = sideOfPath * turnDirection;
  var miterSize = 1.0 / max(sinHalfAngle, PATH_EPSILON);
  let trimmedMiterSize = min(
    miterSize,
    max(lenA, lenB) / max(cosHalfAngle, PATH_EPSILON)
  );
  miterSize = select(trimmedMiterSize, miterSize, cornerPosition >= 0.0);
  var cornerOffset = mix(
    miterVector * miterSize,
    perpendicular,
    step(0.5, cornerPosition)
  ) * (sideOfPath + isJoint * turnDirection);
  let isFirst = (segmentFlags & PATH_SEGMENT_FIRST) != 0u;
  let isLast = (segmentFlags & PATH_SEGMENT_LAST) != 0u;
  let isClosed = (segmentFlags & PATH_SEGMENT_CLOSED) != 0u;
  let isStartCap = lenA <= PATH_EPSILON || (!isEnd && isFirst && !isClosed);
  let isEndCap = lenB <= PATH_EPSILON || (isEnd && isLast && !isClosed);
  let isCap = isStartCap || isEndCap;
  var jointType = pathViewport.jointRounded;
  if (isCap) {
    let capOffset =
      direction * pathViewport.capRounded * 4.0 * flipIfTrue(isStartCap);
    cornerOffset = mix(perpendicular * sideOfPath, capOffset, isJoint);
    jointType = pathViewport.capRounded;
  }
  let miterLength = select(
    dot(cornerOffset, miterVector * turnDirection),
    isJoint,
    isCap
  );
  let offsetFromStart = cornerOffset + deltaA * select(0.0, 1.0, isEnd);
  var extrusion : PathExtrusion;
  extrusion.offset = cornerOffset * halfWidth;
  extrusion.cornerOffset = cornerOffset;
  extrusion.miterLength = miterLength;
  extrusion.pathPosition = vec2<f32>(
    dot(offsetFromStart, perpendicular),
    dot(offsetFromStart, direction)
  );
  extrusion.pathLength = pathLength;
  extrusion.jointType = jointType;
  return extrusion;
}

@vertex
fn vertexMain(inputs : VertexInputs) -> FragmentInputs {
  var outputs : FragmentInputs;
  let segmentVertex = getSegmentVertex(inputs.vertexIndex % 12u);
  let pathRange = readPathRange(inputs.rowIndices);
  let segmentEndPointIndex = getSegmentEndPointIndex(inputs.segmentStartPointIndices);
  let segmentPreviousPointIndex = getSegmentPreviousPointIndex(
    pathRange,
    inputs.segmentStartPointIndices,
    inputs.segmentFlags
  );
  let segmentNextPointIndex = getSegmentNextPointIndex(
    pathRange,
    segmentEndPointIndex,
    inputs.segmentFlags
  );
  let previousPointValue = readPathPoint(segmentPreviousPointIndex);
  let startPointValue = readPathPoint(inputs.segmentStartPointIndices);
  let endPointValue = readPathPoint(segmentEndPointIndex);
  let nextPointValue = readPathPoint(segmentNextPointIndex);
  let previousPoint = mix(previousPointValue.xy, startPointValue.xy, segmentVertex.x);
  let currentPoint = mix(startPointValue.xy, endPointValue.xy, segmentVertex.x);
  let nextPoint = mix(endPointValue.xy, nextPointValue.xy, segmentVertex.x);
  let rowIndex = inputs.rowIndices - pathStorageStyleConfig.batchRowIndexBase;
  let rowOrigin = readPathViewOrigin(rowIndex);
  let storageWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[rowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  let halfWidth = mix(0.0035, storageWidth, pathViewport.widthsEnabled);
  let extrusion = computePathExtrusion(
    previousPoint,
    currentPoint,
    nextPoint,
    segmentVertex,
    halfWidth,
    inputs.segmentFlags
  );
  let worldPosition = currentPoint + extrusion.offset + rowOrigin.xy;
  let neutralColor = vec4<f32>(0.78, 0.86, 0.96, 0.92);
  var storageColor = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    storageColor = mix(
      unpackPathColor(pathVertexColors[inputs.segmentStartPointIndices]),
      unpackPathColor(pathVertexColors[segmentEndPointIndex]),
      segmentVertex.x
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    storageColor = unpackPathColor(pathRowColors[rowIndex]);
  }
  outputs.Position = vec4<f32>(worldPosition * pathViewport.viewportScale, 0.0, 1.0);
  outputs.color = mix(neutralColor, storageColor, pathViewport.colorsEnabled);
${
  usesTimestampColumn
    ? `\
  let timestamp = mix(
    pathTimestamps[inputs.segmentStartPointIndices],
    pathTimestamps[segmentEndPointIndex],
    segmentVertex.x
  );
  outputs.measure = timestamp / ${TEMPORAL_MILLISECONDS_PER_MEASURE_UNIT}.0;
  outputs.time = timestamp;
`
    : '  outputs.measure = mix(startPointValue.w + rowOrigin.w, endPointValue.w + rowOrigin.w, segmentVertex.x);\n'
}
  outputs.cornerOffset = extrusion.cornerOffset;
  outputs.miterLength = extrusion.miterLength;
  outputs.pathPosition = extrusion.pathPosition;
  outputs.pathLength = extrusion.pathLength;
  outputs.jointType = extrusion.jointType;
  return outputs;
}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
${
  usesTimestampColumn
    ? `\
  if (
    inputs.time > tripPathConfig.currentTime ||
    (tripPathConfig.fadeTrail != 0u &&
      inputs.time < tripPathConfig.currentTime - tripPathConfig.trailLength)
  ) {
    discard;
  }
`
    : ''
}
  if (inputs.pathPosition.y < 0.0 || inputs.pathPosition.y > inputs.pathLength) {
    if (inputs.jointType > 0.5 && length(inputs.cornerOffset) > 1.0) {
      discard;
    }
    if (inputs.jointType < 0.5 && inputs.miterLength > pathViewport.miterLimit + 1.0) {
      discard;
    }
  }
  let measureLag = pathViewport.time - inputs.measure;
  let measureReached = select(0.0, 1.0, measureLag >= 0.0);
  let measureHighlight = measureReached * (1.0 - smoothstep(0.0, 0.16, measureLag));
  let highlight = 0.24 + measureHighlight * 0.76;
  let lightenedColor = mix(
    inputs.color.rgb * 0.72,
    min(inputs.color.rgb * 1.18 + vec3<f32>(0.05), vec3<f32>(1.0)),
    highlight
  );
${
  usesTimestampColumn
    ? `\
  var alpha = inputs.color.a;
  if (tripPathConfig.fadeTrail != 0u) {
    alpha *= clamp(
      1.0 - (tripPathConfig.currentTime - inputs.time) / max(tripPathConfig.trailLength, 1.0),
      0.0,
      1.0
    );
  }
  return vec4<f32>(lightenedColor, alpha);
`
    : '  return vec4<f32>(lightenedColor, inputs.color.a);\n'
}
}
`;
}

export const STORAGE_WGSL_SHADER = makePathStorageWGSLShader({usesTimestampColumn: false});
export const TRIPS_STORAGE_WGSL_SHADER = makePathStorageWGSLShader({usesTimestampColumn: true});

export const VS_GLSL = /* glsl */ `\
#version 300 es
precision highp float;
precision highp int;

in vec4 segmentStartPositions;
in vec4 segmentEndPositions;
in vec4 segmentPreviousPositions;
in vec4 segmentNextPositions;
in uint segmentFlags;
in uint rowIndices;
in uint segmentStartColors;
in uint segmentEndColors;
in float widths;
in vec4 pathViewOrigins;

layout(std140) uniform pathViewportUniforms {
  vec2 viewportScale;
  float time;
  float colorsEnabled;
  float widthsEnabled;
  float capRounded;
  float jointRounded;
  float miterLimit;
} pathViewport;

out vec4 vColor;
out float vMeasure;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;

struct PathExtrusion {
  vec2 offset;
  vec2 cornerOffset;
  float miterLength;
  vec2 pathPosition;
  float pathLength;
  float jointType;
};

const float PATH_EPSILON = 0.00001;
const uint PATH_SEGMENT_FIRST = 1u;
const uint PATH_SEGMENT_LAST = 2u;
const uint PATH_SEGMENT_CLOSED = 4u;

vec2 getSegmentVertex(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, 0.0);
  if (vertexIndex == 1) return vec2(0.0, -1.0);
  if (vertexIndex == 2) return vec2(0.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, -1.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  if (vertexIndex == 5) return vec2(0.0, 1.0);
  if (vertexIndex == 6) return vec2(0.0, -1.0);
  if (vertexIndex == 7) return vec2(1.0, -1.0);
  if (vertexIndex == 8) return vec2(1.0, 1.0);
  if (vertexIndex == 9) return vec2(1.0, -1.0);
  if (vertexIndex == 10) return vec2(1.0, 0.0);
  return vec2(1.0, 1.0);
}

vec4 unpackPathColor(uint colorWord) {
  return vec4(
    float(colorWord & 255u),
    float((colorWord >> 8u) & 255u),
    float((colorWord >> 16u) & 255u),
    float((colorWord >> 24u) & 255u)
  ) / 255.0;
}

float flipIfTrue(bool flag) {
  return flag ? -1.0 : 1.0;
}

PathExtrusion computePathExtrusion(
  vec2 previousPoint,
  vec2 currentPoint,
  vec2 nextPoint,
  vec2 segmentVertex,
  float halfWidth,
  uint segmentMetadata
) {
  bool isEnd = segmentVertex.x > 0.5;
  float sideOfPath = segmentVertex.y;
  float isJoint = abs(sideOfPath) < 0.5 ? 1.0 : 0.0;
  float normalizedWidth = max(halfWidth, PATH_EPSILON);
  vec2 deltaA = (currentPoint - previousPoint) / normalizedWidth;
  vec2 deltaB = (nextPoint - currentPoint) / normalizedWidth;
  float lenA = length(deltaA);
  float lenB = length(deltaB);
  vec2 dirA = lenA > PATH_EPSILON ? normalize(deltaA) : vec2(0.0);
  vec2 dirB = lenB > PATH_EPSILON ? normalize(deltaB) : vec2(0.0);
  vec2 perpA = vec2(-dirA.y, dirA.x);
  vec2 perpB = vec2(-dirB.y, dirB.x);
  vec2 tangentBasis = dirA + dirB;
  vec2 tangent = length(tangentBasis) > PATH_EPSILON ? normalize(tangentBasis) : perpA;
  vec2 miterVector = vec2(-tangent.y, tangent.x);
  vec2 direction = isEnd ? dirA : dirB;
  vec2 perpendicular = isEnd ? perpA : perpB;
  float pathLength = isEnd ? lenA : lenB;
  float sinHalfAngle = abs(dot(miterVector, perpendicular));
  float cosHalfAngle = abs(dot(dirA, miterVector));
  float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  float cornerPosition = sideOfPath * turnDirection;
  float miterSize = 1.0 / max(sinHalfAngle, PATH_EPSILON);
  float trimmedMiterSize = min(miterSize, max(lenA, lenB) / max(cosHalfAngle, PATH_EPSILON));
  miterSize = cornerPosition >= 0.0 ? miterSize : trimmedMiterSize;
  vec2 cornerOffset = mix(
    miterVector * miterSize,
    perpendicular,
    step(0.5, cornerPosition)
  ) * (sideOfPath + isJoint * turnDirection);
  bool isFirst = (segmentMetadata & PATH_SEGMENT_FIRST) != 0u;
  bool isLast = (segmentMetadata & PATH_SEGMENT_LAST) != 0u;
  bool isClosed = (segmentMetadata & PATH_SEGMENT_CLOSED) != 0u;
  bool isStartCap = lenA <= PATH_EPSILON || (!isEnd && isFirst && !isClosed);
  bool isEndCap = lenB <= PATH_EPSILON || (isEnd && isLast && !isClosed);
  bool isCap = isStartCap || isEndCap;
  float jointType = pathViewport.jointRounded;
  if (isCap) {
    vec2 capOffset = direction * pathViewport.capRounded * 4.0 * flipIfTrue(isStartCap);
    cornerOffset = mix(perpendicular * sideOfPath, capOffset, isJoint);
    jointType = pathViewport.capRounded;
  }
  float miterLength = isCap
    ? isJoint
    : dot(cornerOffset, miterVector * turnDirection);
  vec2 offsetFromStart = cornerOffset + deltaA * (isEnd ? 1.0 : 0.0);
  PathExtrusion extrusion;
  extrusion.offset = cornerOffset * halfWidth;
  extrusion.cornerOffset = cornerOffset;
  extrusion.miterLength = miterLength;
  extrusion.pathPosition = vec2(
    dot(offsetFromStart, perpendicular),
    dot(offsetFromStart, direction)
  );
  extrusion.pathLength = pathLength;
  extrusion.jointType = jointType;
  return extrusion;
}

void main() {
  vec2 segmentVertex = getSegmentVertex(gl_VertexID % 12);
  vec2 previousSegmentPosition = segmentPreviousPositions.xy;
  vec2 startPosition = segmentStartPositions.xy;
  vec2 endPosition = segmentEndPositions.xy;
  vec2 nextSegmentPosition = segmentNextPositions.xy;
  vec2 previousPoint = mix(previousSegmentPosition, startPosition, segmentVertex.x);
  vec2 currentPoint = mix(startPosition, endPosition, segmentVertex.x);
  vec2 nextPoint = mix(endPosition, nextSegmentPosition, segmentVertex.x);
  float halfWidth = mix(0.0035, widths, pathViewport.widthsEnabled);
  PathExtrusion extrusion = computePathExtrusion(
    previousPoint,
    currentPoint,
    nextPoint,
    segmentVertex,
    halfWidth,
    segmentFlags
  );
  vec2 worldPosition = currentPoint + extrusion.offset + pathViewOrigins.xy;
  vec4 neutralColor = vec4(0.78, 0.86, 0.96, 0.92);
  vec4 pathColor = mix(
    unpackPathColor(segmentStartColors),
    unpackPathColor(segmentEndColors),
    segmentVertex.x
  );
  gl_Position = vec4(worldPosition * pathViewport.viewportScale, 0.0, 1.0);
  vColor = mix(neutralColor, pathColor, pathViewport.colorsEnabled);
  vMeasure = mix(
    segmentStartPositions.w + pathViewOrigins.w,
    segmentEndPositions.w + pathViewOrigins.w,
    segmentVertex.x
  );
  vCornerOffset = extrusion.cornerOffset;
  vMiterLength = extrusion.miterLength;
  vPathPosition = extrusion.pathPosition;
  vPathLength = extrusion.pathLength;
  vJointType = extrusion.jointType;
}
`;

export const FS_GLSL = /* glsl */ `\
#version 300 es
precision highp float;

in vec4 vColor;
in float vMeasure;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
out vec4 fragColor;

layout(std140) uniform pathViewportUniforms {
  vec2 viewportScale;
  float time;
  float colorsEnabled;
  float widthsEnabled;
  float capRounded;
  float jointRounded;
  float miterLimit;
} pathViewport;

void main() {
  if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
    if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
      discard;
    }
    if (vJointType < 0.5 && vMiterLength > pathViewport.miterLimit + 1.0) {
      discard;
    }
  }
  float measureLag = pathViewport.time - vMeasure;
  float measureReached = measureLag >= 0.0 ? 1.0 : 0.0;
  float measureHighlight = measureReached * (1.0 - smoothstep(0.0, 0.16, measureLag));
  float highlight = 0.24 + measureHighlight * 0.76;
  vec3 lightenedColor = mix(
    vColor.rgb * 0.72,
    min(vColor.rgb * 1.18 + vec3(0.05), vec3(1.0)),
    highlight
  );
  fragColor = vec4(lightenedColor, vColor.a);
}
`;

export type PathViewportUniforms = {
  viewportScale: [number, number];
  time: number;
  colorsEnabled: number;
  widthsEnabled: number;
  capRounded: number;
  jointRounded: number;
  miterLimit: number;
};

export const pathViewport: ShaderModule<PathViewportUniforms> = {
  name: 'pathViewport',
  uniformTypes: {
    viewportScale: 'vec2<f32>',
    time: 'f32',
    colorsEnabled: 'f32',
    widthsEnabled: 'f32',
    capRounded: 'f32',
    jointRounded: 'f32',
    miterLimit: 'f32'
  }
};

export function createArrowLineShaderInputs(): ShaderInputs<{
  pathViewport: typeof pathViewport.props;
}> {
  return new ShaderInputs<{pathViewport: typeof pathViewport.props}>({
    pathViewport
  });
}
