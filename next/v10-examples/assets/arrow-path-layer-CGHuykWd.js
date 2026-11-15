import{g as an,a as Ce,i as sn,b as oo,D as V,K as ro,B as w,M as ao,G as F,c as cn,f as io,L as ln,d as be,p as mt,e as so,U as co,h as lo,r as uo}from"./deck-example-device-BATdhonL.js";import{O as ho}from"./orthographic-view-C4OLJg06.js";import{C as un}from"./composite-layer-6mX7XaPy.js";import{g as fo,a as go,G as po,v as le,b as mo,r as dn,m as M,i as Lt,c as ct,d as ue,e as hn,f as wo,h as Po,j as fn,k as yo,D as So,s as xo,l as Eo,n as Te,o as Ae,p as G,q as vo,t as Co,u as bo,w as To,x as gn,y as _e,z as Ao,A as _o,B as Io,C as Ie,E as Oe,F as dt}from"./arrow-example-panels-D-eEZsiV.js";import{T as W,V as D,B as de,D as A,F as v,a as O,b as B,S as pn,c as U,d as q,e as _,L as K,U as ht,f as rt,m as Oo,g as Rt,v as mn,h as Lo,i as wn}from"./recordbatch-BqLwuqbF.js";import{p as Pn,m as k,a as Ro}from"./arrow-shader-layout-DIN30uhO.js";import{p as yn}from"./project32-DQHaUC8v.js";import{A as Bo}from"./arrow-deck-B0KwyTHJ.js";import{g as Do}from"./arrow-layer-tooltip-D-4Wl9xx.js";import{D as Mo}from"./arrow-example-source-panel-sDb8GGM5.js";const Vo=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,No={name:"color",dependencies:[],source:Vo,getUniforms:t=>({})},Fo={name:"pathShaderPlugin",injectionTargets:[{name:"DECKGL_FILTER_PATH_COLOR_VERTEX",stage:"vertex",wgsl:{parameters:"color: ptr<function, vec4<f32>>, pathPosition: vec2<f32>, pathLength: f32"}},{name:"DECKGL_FILTER_PATH_COLOR",stage:"fragment",wgsl:{parameters:""}},{name:"DECKGL_PATH_STYLE_COORDINATES",stage:"vertex",wgsl:{parameters:"pathPosition: ptr<function, vec2<f32>>, pathLength: ptr<function, f32>, pathBounds: ptr<function, vec2<f32>>, halfWidth: f32"}},{name:"DECKGL_PATH_STYLE_COLOR",stage:"fragment",wgsl:{parameters:"color: ptr<function, vec4<f32>>, pathPosition: vec2<f32>, pathCoverage: f32"}}]};function Sn({vertexEntry:t=`@vertex
fn vertexMain(attributes: Attributes) -> Varyings`,vertexSetup:e="",vertexOutput:n="",extraVaryings:o="",fragmentFilter:r="",colorFilter:a=""}={}){return`const EPSILON: f32 = 0.001;
const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct JoinResult {
  offset: vec3<f32>,
  cornerOffset: vec2<f32>,
  miterLength: f32,
  pathPosition: vec2<f32>,
  pathLength: f32,
  jointType: f32,
};

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) instanceTypes: f32,
  @location(2) instanceLeftPositions: vec3<f32>,
  @location(3) instanceStartPositions: vec3<f32>,
  @location(4) instanceEndPositions: vec3<f32>,
  @location(5) instanceRightPositions: vec3<f32>,
  @location(6) instanceLeftPositions64Low: vec3<f32>,
  @location(7) instanceStartPositions64Low: vec3<f32>,
  @location(8) instanceEndPositions64Low: vec3<f32>,
  @location(9) instanceRightPositions64Low: vec3<f32>,
  @location(10) instanceStrokeWidths: f32,
  @location(11) instanceColors: vec4<f32>,
  @location(12) rowIndexes: u32,
};

struct Varyings {
  ${o}
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) vCornerOffset: vec2<f32>,
  @location(2) vMiterLength: f32,
  @location(3) vPathPosition: vec2<f32>,
  @location(4) vPathLength: f32,
  @location(5) vJointType: f32,
#ifdef DASH_ENABLED
  @location(8) vPathBounds: vec2<f32>,
#endif
};

fn flipIfTrue(flag: bool) -> f32 {
  return select(1.0, -1.0, flag);
}

fn clipLine(position: vec4<f32>, refPosition: vec4<f32>) -> vec4<f32> {
  if (position.w < EPSILON) {
    let r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
    return refPosition + (position - refPosition) * r;
  }
  return position;
}

#ifdef DASH_ENABLED
// Return the visible interval of the original segment before clipLine moves either endpoint.
fn getClippedPathRange(startW: f32, endW: f32) -> vec2<f32> {
  let startClipped = startW < EPSILON;
  let endClipped = endW < EPSILON;
  if (startClipped && endClipped) {
    return vec2<f32>(0.0, 0.0);
  }
  if (startClipped || endClipped) {
    let intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
    if (startClipped) {
      return vec2<f32>(intersection, 1.0);
    }
    return vec2<f32>(0.0, intersection);
  }
  return vec2<f32>(0.0, 1.0);
}
#endif

fn getLineJoinOffset(
  prevPoint: vec3<f32>,
  currPoint: vec3<f32>,
  nextPoint: vec3<f32>,
  width: vec2<f32>,
#ifdef DASH_ENABLED
  sourcePathLength: f32,
  sourcePathRange: vec2<f32>,
#endif
#ifdef ANTIALIASING
  coverageScale: f32,
#endif
  positions: vec2<f32>,
  instanceTypes: f32
) -> JoinResult {
  let isEnd = positions.x > 0.0;
  let sideOfPath = positions.y;
  let isJoint = select(0.0, 1.0, sideOfPath == 0.0);

  var deltaA3 = currPoint - prevPoint;
  var deltaB3 = nextPoint - currPoint;

  let rotationResult = project_needs_rotation(currPoint);
  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    deltaA3 = rotationResult.transform * deltaA3;
    deltaB3 = rotationResult.transform * deltaB3;
  }

  let deltaA = deltaA3.xy / width;
  let deltaB = deltaB3.xy / width;

  let lenA = length(deltaA);
  let lenB = length(deltaB);

  let dirA = select(vec2<f32>(0.0, 0.0), normalize(deltaA), lenA > 0.0);
  let dirB = select(vec2<f32>(0.0, 0.0), normalize(deltaB), lenB > 0.0);

  let perpA = vec2<f32>(-dirA.y, dirA.x);
  let perpB = vec2<f32>(-dirB.y, dirB.x);

  var tangent = dirA + dirB;
  tangent = select(perpA, normalize(tangent), length(tangent) > 0.0);
  let miterVec = vec2<f32>(-tangent.y, tangent.x);
  let dir = select(dirB, dirA, isEnd);
  let perp = select(perpB, perpA, isEnd);
#ifdef DASH_ENABLED
  let segmentLength2D = select(lenB, lenA, isEnd);

  // Extrusion happens in the XY plane, so segmentLength2D is a 2D length and pathPosition.y
  // below measures 2D distance along the segment. For a path that also moves in Z the true
  // arc length is longer by this ratio. Scaling pathLength and pathPosition.y by it makes
  // the coordinate measure real 3D distance while leaving the joint tests unchanged, since
  // they compare the two against each other and both are scaled alike. Billboard mode
  // extrudes in clip space, where the perspective divide has already reduced the segment to
  // its screen projection, so its complete common-space length is supplied by the caller.
  // Mirrors path-layer-vertex.glsl.ts.
  let currDelta3 = select(deltaB3, deltaA3, isEnd);
  let currLength2D = length(currDelta3.xy);
  // Do not clamp a valid denominator to EPSILON: high-zoom Web Mercator deltas are often
  // smaller than that in common space, and changing their scale corrupts even flat paths.
  let safeLength2D = select(1.0, currLength2D, currLength2D > 0.0);
  var arcLengthRatio = 1.0;
  var pathPositionOffset = 0.0;
  var pathLength = segmentLength2D;
  if (path.billboard != 0.0) {
    // clipLine may shorten the visible screen-space segment. Preserve the corresponding interval
    // of the complete common-space arclength instead of compressing the full dash period into the
    // visible span. Keep pathLength complete so justification is stable as the camera clips it.
    let visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
    arcLengthRatio = 0.0;
    if (segmentLength2D > 0.0) {
      arcLengthRatio = visiblePathLength / segmentLength2D;
    }
    pathPositionOffset = sourcePathLength * sourcePathRange.x;
    pathLength = sourcePathLength;
  } else if (currLength2D > 0.0) {
    arcLengthRatio = length(currDelta3) / safeLength2D;
    pathLength = segmentLength2D * arcLengthRatio;
  }
#else
  let pathLength = select(lenB, lenA, isEnd);
#endif

  let sinHalfA = abs(dot(miterVec, perp));
  let cosHalfA = abs(dot(dirA, miterVec));
  let turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  let cornerPosition = sideOfPath * turnDirection;

  var miterSize = 1.0 / max(sinHalfA, EPSILON);
  miterSize = mix(
    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
    miterSize,
    step(0.0, cornerPosition)
  );

  var offsetVec =
    mix(miterVec * miterSize, perp, step(0.5, cornerPosition)) *
    (sideOfPath + isJoint * turnDirection);

  let isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
  let isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
  let isCap = isStartCap || isEndCap;

  var jointType = path.jointType;
  if (isCap) {
    offsetVec = mix(
      perp * sideOfPath,
      dir * path.capType * 4.0 * flipIfTrue(isStartCap),
      isJoint
    );
    jointType = path.capType;
  }

#ifdef ANTIALIASING
  let coverageOffsetVec = offsetVec * coverageScale;
  var miterLength = dot(coverageOffsetVec, miterVec * turnDirection);
#else
  var miterLength = dot(offsetVec, miterVec * turnDirection);
#endif
  miterLength = select(miterLength, isJoint, isCap);

#ifdef ANTIALIASING
  let offsetFromStartOfPath = coverageOffsetVec + deltaA * select(0.0, 1.0, isEnd);
#else
  let offsetFromStartOfPath = offsetVec + deltaA * select(0.0, 1.0, isEnd);
#endif
  let pathPosition = vec2<f32>(
    dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
    pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
    dot(offsetFromStartOfPath, dir)
#endif
  );
  let isValid = step(f32(instanceTypes), 3.5);
#ifdef ANTIALIASING
  var offset = vec3<f32>(coverageOffsetVec * width * isValid, 0.0);
#else
  var offset = vec3<f32>(offsetVec * width * isValid, 0.0);
#endif

  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    offset = rotationResult.transform * offset;
  }

#ifdef ANTIALIASING
  return JoinResult(
    offset, coverageOffsetVec, miterLength, pathPosition, pathLength, jointType
  );
#else
  return JoinResult(offset, offsetVec, miterLength, pathPosition, pathLength, jointType);
#endif
}

${t} {
  ${e}
  var varyings: Varyings;

  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let isEnd = attributes.positions.x;

  let prevPosition = mix(attributes.instanceLeftPositions, attributes.instanceStartPositions, isEnd);
  let prevPosition64Low = mix(
    attributes.instanceLeftPositions64Low,
    attributes.instanceStartPositions64Low,
    isEnd
  );
  let currPosition = mix(attributes.instanceStartPositions, attributes.instanceEndPositions, isEnd);
  let currPosition64Low = mix(
    attributes.instanceStartPositions64Low,
    attributes.instanceEndPositions64Low,
    isEnd
  );
  let nextPosition = mix(attributes.instanceEndPositions, attributes.instanceRightPositions, isEnd);
  let nextPosition64Low = mix(
    attributes.instanceEndPositions64Low,
    attributes.instanceRightPositions64Low,
    isEnd
  );

  geometry.worldPosition = currPosition;

  var widthPixels =
    clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * path.widthScale, path.widthUnits),
      path.widthMinPixels,
      path.widthMaxPixels
    ) / 2.0;
  var size = vec3<f32>(widthPixels, widthPixels, 0.0);
  DECKGL_FILTER_SIZE(&size, geometry);
  widthPixels = size.x;

  if (path.billboard != 0.0) {
#ifdef DASH_ENABLED
    let prevProjection = project_position_to_clipspace_and_commonspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    let nextProjection = project_position_to_clipspace_and_commonspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
    let prevPositionCommon = prevProjection.commonPosition.xyz;
    let nextPositionCommon = nextProjection.commonPosition.xyz;
    var prevPositionScreen = prevProjection.clipPosition;
    var nextPositionScreen = nextProjection.clipPosition;
#else
    var prevPositionScreen = project_position_to_clipspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    var nextPositionScreen = project_position_to_clipspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
#endif
    let currProjection = project_position_to_clipspace_and_commonspace(
      currPosition, currPosition64Low, ZERO_OFFSET
    );
    geometry.position = currProjection.commonPosition;
    var currPositionScreen = currProjection.clipPosition;
#ifdef DASH_ENABLED
    let currPositionCommon = currProjection.commonPosition.xyz;
    let sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
    let sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
    let billboardPathRange = getClippedPathRange(
      sourcePathStartScreen.w, sourcePathEndScreen.w
    );
#endif

    prevPositionScreen = clipLine(prevPositionScreen, currPositionScreen);
    nextPositionScreen = clipLine(nextPositionScreen, currPositionScreen);
    currPositionScreen = clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));

#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
#ifdef DASH_ENABLED
    let currentDeltaCommon = select(
      nextPositionCommon - currPositionCommon,
      currPositionCommon - prevPositionCommon,
      isEnd > 0.0
    );
    let billboardPathLength = select(
      0.0,
      length(currentDeltaCommon) * project.scale / (widthPixels * project.focalDistance),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(vec2<f32>(widthPixels, widthPixels)),
#ifdef DASH_ENABLED
      billboardPathLength,
      billboardPathRange,
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    // Phase and justification use the complete source segment, while cap and joint coverage
    // must still recognize the endpoints moved by clipLine.
    varyings.vPathBounds = billboardPathLength * billboardPathRange;
#endif

    geometry.uv = join.pathPosition;
    varyings.position = vec4<f32>(
      currPositionScreen.xyz + join.offset * currPositionScreen.w,
      currPositionScreen.w
    );
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  } else {
    let prevPositionCommon = project_position_vec3_f64(prevPosition, prevPosition64Low);
    let currPositionCommon = project_position_vec3_f64(currPosition, currPosition64Low);
    let nextPositionCommon = project_position_vec3_f64(nextPosition, nextPosition64Low);

    let width = vec2<f32>(
      project_pixel_size_float(widthPixels),
      project_pixel_size_float(widthPixels)
    );
#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionCommon,
      currPositionCommon,
      nextPositionCommon,
      width,
#ifdef DASH_ENABLED
      1.0,
      vec2<f32>(0.0, 1.0),
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    varyings.vPathBounds = vec2<f32>(0.0, join.pathLength);
#endif

    geometry.position = vec4<f32>(currPositionCommon + join.offset, 1.0);
    geometry.uv = join.pathPosition;
    varyings.position = project_common_position_to_clipspace(geometry.position);
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  }

  var pathBounds = vec2<f32>(0.0);
#ifdef DASH_ENABLED
  pathBounds = varyings.vPathBounds;
#endif
  var pathPosition = varyings.vPathPosition;
  var pathLength = varyings.vPathLength;
  DECKGL_PATH_STYLE_COORDINATES(
    &pathPosition, &pathLength, &pathBounds,
    select(project_pixel_size_float(widthPixels), widthPixels, path.billboard != 0)
  );
#ifdef DASH_ENABLED
  varyings.vPathBounds = pathBounds;
#endif
  varyings.vPathPosition = pathPosition;
  varyings.vPathLength = pathLength;
  geometry.uv = pathPosition;

  varyings.vColor = vec4<f32>(
    attributes.instanceColors.rgb,
    attributes.instanceColors.a * layer.opacity
  );
  DECKGL_FILTER_PATH_COLOR_VERTEX(&varyings.vColor, varyings.vPathPosition, varyings.vPathLength);
  DECKGL_FILTER_GL_POSITION(&varyings.position, geometry);
  ${n}
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.vPathPosition;
  fragmentGeometry.uv = geometry.uv;

#ifdef ANTIALIASING
  // Coordinates of the outer silhouette, in units of half-width: rounded joints and caps are
  // bounded by the corner offset, everywhere else by the edge of the stroke. Dividing by the
  // screen-space derivative converts the distance to the boundary into device pixels, which stays
  // correct under perspective foreshortening and under extensions that rescale the stroke.
#ifdef DASH_ENABLED
  let isCorner =
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y;
#else
  let isCorner = varyings.vPathPosition.y < 0.0 || varyings.vPathPosition.y > varyings.vPathLength;
#endif
  let isRound = varyings.vJointType > 0.5;

  // Distance to the silhouette in device pixels, from the derivative of the coordinate that
  // bounds it. Computed before the discards below: derivatives need uniform control flow and are
  // undefined after a discard in the quad. See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
  let bodyCoord = abs(varyings.vPathPosition.x);
  let cornerCoord = length(varyings.vCornerOffset);
  // Both evaluated so each derivative stays on one field across the corner/body boundary
  let bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
  let cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
  // Rounded corners still intersect the stroke-width envelope. Extensions may remap
  // vPathPosition.x independently of vCornerOffset, as PathStyleExtension does for offsets.
  let edgePixels = select(bodyPixels, min(cornerPixels, bodyPixels), isRound && isCorner);
#else
  let edgePixels = select(bodyPixels, cornerPixels, isRound && isCorner);
#endif

  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }

  if (isCorner) {
    if (!isRound && varyings.vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }

  var color = varyings.vColor;

  // Feather one device pixel across the width only, before premultiplication. edgePixels is a
  // signed device-pixel distance and SMOOTH_EDGE_RADIUS is 0.5, so this ramps across one pixel.
  let pathCoverage = smoothedge(0.0, edgePixels);
  color.a *= pathCoverage;
#else
#ifdef DASH_ENABLED
  if (
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y
  ) {
#else
  if (
    varyings.vPathPosition.y < 0.0 ||
    varyings.vPathPosition.y > varyings.vPathLength
  ) {
#endif
    if (varyings.vJointType > 0.5 && length(varyings.vCornerOffset) > 1.0) {
      discard;
    }
    if (
      varyings.vJointType < 0.5 &&
      varyings.vMiterLength > path.miterLimit + 1.0
    ) {
      discard;
    }
  }
#endif

  // Fragment-layer injections that discard pixels must run after analytic coverage derivatives.
  // See TripsLayer, which rejects fragments outside of the active time window at this anchor.
  ${r}
  DECKGL_FILTER_PATH_COLOR();
#ifndef ANTIALIASING
  var color = varyings.vColor;
  let pathCoverage = 1.0;
#endif
  ${a}
  DECKGL_PATH_STYLE_COLOR(&color, varyings.vPathPosition, pathCoverage);
  DECKGL_FILTER_COLOR(&color, fragmentGeometry);
  return deckgl_premultiplied_alpha(color);
}
`}Sn();const Uo=`struct PathUniforms {
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  jointType: f32,
  capType: f32,
  miterLimit: f32,
  billboard: f32,
  widthUnits: i32,
};

@group(0) @binding(auto)
var<uniform> path: PathUniforms;
`,Le=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,Go={name:"path",source:Uo,vs:Le,fs:Le,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}};function ko(t,e={}){const n=t.name||"PathModel",o=e.selectors||{},r=$o(e.data),a=new Set(r?fo(r):[]),i=Wo(t.gpuInputSchema);Yo(n,i,o);const s={};for(const c of i){if(!Ho(c.columnName))throw new Error(`${n} source mapping does not support GPU input "${c.columnName}"`);const u=zo(n,c,o[c.columnName],r,a);u&&jo(s,c.columnName,u)}if(!s.paths)throw new Error(`${n} source mapping requires paths`);return s}function $o(t){if(t)return t instanceof W?t:new W([t])}function Wo(t){return t.filter(e=>!e.internal)}function Yo(t,e,n){const o=new Set(e.map(r=>r.columnName));for(const[r,a]of Object.entries(n))if(a!==void 0&&!o.has(r))throw new Error(`${t} source selector "${r}" is not declared as source-mappable`)}function zo(t,e,n,o,r){if(n===null){if(e.required)throw new Error(`${t} source selector "${e.columnName}" cannot be null`);return}if(n instanceof D)return n;const a=n??e.columnName;if(!o){if(n===void 0&&!e.required)return;throw new Error(`${t} source selector "${e.columnName}" requires data to resolve column "${a}"`)}if(!r.has(a)){if(n===void 0&&!e.required)return;throw new Error(`${t} source column "${a}" for "${e.columnName}" is missing`)}return go(o,a)}function Ho(t){return t==="paths"||t==="colors"||t==="widths"||t==="timestamps"}function jo(t,e,n){t[e]=n}const kt="segmentStartPositions",$t="segmentEndPositions",Re="segmentPreviousPositions",Be="segmentNextPositions",Wt="segmentStartColors",Yt="segmentEndColors",De="segmentFlags",Me="rowIndices",xn="expandedPathVertexData",vt="pathViewOrigins",En="pathViewOriginData",qo=Float32Array.BYTES_PER_ELEMENT*16+Uint32Array.BYTES_PER_ELEMENT*4,Ko=Float32Array.BYTES_PER_ELEMENT*4,Xo=Float32Array.BYTES_PER_ELEMENT*8,Jo=Float32Array.BYTES_PER_ELEMENT*12,vn=Float32Array.BYTES_PER_ELEMENT*16,Cn=vn+Uint32Array.BYTES_PER_ELEMENT,bn=Cn+Uint32Array.BYTES_PER_ELEMENT,Zo=bn+Uint32Array.BYTES_PER_ELEMENT,Qo=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],tr={attributes:[{name:kt,location:0,type:"vec4<f32>",stepMode:"instance"},{name:$t,location:1,type:"vec4<f32>",stepMode:"instance"},{name:Wt,location:2,type:"u32",stepMode:"instance"},{name:Yt,location:3,type:"u32",stepMode:"instance"},{name:vt,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},er=`#version 300 es
precision highp float;

in vec4 segmentStartPositions;
in vec4 segmentEndPositions;
in uint segmentStartColors;
in uint segmentEndColors;
in vec4 pathViewOrigins;

void main() {
  vec4 pathDelta = gl_VertexID % 2 == 0 ? segmentStartPositions : segmentEndPositions;
  vec4 pathPosition = pathViewOrigins + pathDelta;
  gl_Position = vec4(pathPosition.xyz, 1.0);
}
`,nr=`#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0);
}
`;class he extends po{static gpuInputSchema=Qo;segmentLayout;expandedPathVertexData;pathViewOriginData;renderBatches;pathProps;pathShaderLayout;pathTable;ownsPathTable;constructor(e,n){const o=Ve(n);super(e,o.modelProps),this.pathTable=n.table,this.ownsPathTable=n.ownsTable??!1,this.pathProps=n,this.pathShaderLayout=o.modelProps.shaderLayout,this.segmentLayout=o.segmentLayout,this.expandedPathVertexData=o.expandedPathVertexData,this.pathViewOriginData=o.pathViewOriginData,this.renderBatches=o.renderBatches}setProps(e){const n={...this.pathProps,...e},o=e.pathState!==void 0||e.table!==void 0||e.ownsTable!==void 0;if(this.pathProps=n,!o){super.setProps({});return}const r=Ve(n);this.segmentLayout=r.segmentLayout,this.expandedPathVertexData=r.expandedPathVertexData,this.pathViewOriginData=r.pathViewOriginData,this.renderBatches=r.renderBatches,this.pathShaderLayout=r.modelProps.shaderLayout;const a=this.pathTable,i=this.ownsPathTable;this.pathTable=n.table,this.ownsPathTable=n.ownsTable??!1,super.setProps({table:this.pathTable}),i&&a!==this.pathTable&&a.destroy(),this.setAttributes(zt(r.modelProps.shaderLayout,r)),this.setInstanceCount(r.segmentLayout.segmentCount),this.setNeedsRedraw("Path segment state updated")}draw(e,n){return n?.parameters?this._withDrawParameters(e,n.parameters,()=>this.drawPathAttributeModelBatches(e)):this.drawPathAttributeModelBatches(e)}drawPathAttributeModelBatches(e){const n=this.table?.batches||[];if(n.length>0&&n.length!==this.renderBatches.length)throw new Error("PathAttributeModel draw batches must align with generated path render batches");let o=!0;try{for(const[r,a]of this.renderBatches.entries()){const i=n[r];this.setAttributes({...i?an(i.bufferLayout,i.gpuData):{},...Tn(this.pathShaderLayout,a)},{byteOffsets:i?Ce(i.bufferLayout,i.gpuData):{}}),this.setInstanceCount(a.segmentCount),o=super.draw(e)&&o}}finally{const r=this.table?.batches[0];this.setAttributes({...or(this.table),...zt(this.pathShaderLayout,{expandedPathVertexData:this.expandedPathVertexData,pathViewOriginData:this.pathViewOriginData})},{byteOffsets:r?Ce(r.bufferLayout,r.gpuData):{}}),this.setInstanceCount(this.segmentLayout.segmentCount)}return o}destroy(){super.destroy(),this.ownsPathTable&&(this.pathTable.destroy(),this.ownsPathTable=!1)}}function or(t){const e=t?.batches[0];return e?an(e.bufferLayout,e.gpuData):{}}function Ve(t){rr(t),ar(t),cr(t);const e=t.shaderLayout??tr,n=t.pathState.renderBatches[0];if(!n)throw new Error("PathAttributeModel requires at least one prepared path render batch");const o=dr(t);return{modelProps:{...t,vs:t.vs??er,fs:t.fs??nr,shaderLayout:e,attributes:{...t.attributes||{},...Tn(e,n)},bufferLayout:[...t.bufferLayout||[],...hr(e,o)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:t.pathState.segmentLayout.segmentCount,table:t.table,tableCount:"none"},segmentLayout:t.pathState.segmentLayout,expandedPathVertexData:n.expandedPathVertexData,pathViewOriginData:n.pathViewOriginData,renderBatches:t.pathState.renderBatches}}function rr(t){le("PathAttributeModel",he.gpuInputSchema,{paths:t.paths,colors:t.colors,widths:t.widths,viewOrigins:t.viewOrigins})}function ar(t){const e=ir(t),[n,o]=e[0];for(const[r,a]of e.slice(1)){if(a.length!==o.length)throw new Error(`PathAttributeModel ${r} rows must match ${n} rows (${a.length} !== ${o.length})`);if(a.data.length!==o.data.length)throw new Error(`PathAttributeModel ${r} batch count must match ${n} batch count`);for(let i=0;i<a.data.length;i++)if(a.data[i].length!==o.data[i].length)throw new Error(`PathAttributeModel ${r} batch ${i} rows must match ${n}`)}t.colors&&sr(t.colors)&&lr(t.paths,t.colors)}function ir(t){return[["paths",t.paths],["colors",t.colors],["widths",t.widths],["viewOrigins",t.viewOrigins]].filter(([,e])=>e!==void 0)}function sr(t){return t.format!==void 0&&sn(t.format)}function cr(t){if(!t.pathState)throw new Error("PathAttributeModel requires prepared pathState");const e=t.pathState.segmentLayout.startIndices.length-1;if(e!==t.paths.length)throw new Error(`PathAttributeModel prepared path rows must match path GPU rows (${e} !== ${t.paths.length})`)}function lr(t,e){for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,r=e.data[n]?.valueOffsets;if(!o||!r||!ur(o,r))throw new Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function ur(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function dr(t){const e=new Set(Object.keys(t.constantAttributes||{}));for(const n of t.bufferLayout||[])if(n.attributes)for(const o of n.attributes)e.add(o.attribute);else e.add(n.name);return e}function hr(t,e){const n=new Set(t.attributes.map(a=>a.name).filter(a=>!e.has(a))),o=[];n.has(kt)&&o.push({attribute:kt,format:"float32x4",byteOffset:0}),n.has($t)&&o.push({attribute:$t,format:"float32x4",byteOffset:Ko}),n.has(Re)&&o.push({attribute:Re,format:"float32x4",byteOffset:Xo}),n.has(Be)&&o.push({attribute:Be,format:"float32x4",byteOffset:Jo}),n.has(De)&&o.push({attribute:De,format:"uint32",byteOffset:vn}),n.has(Me)&&o.push({attribute:Me,format:"uint32",byteOffset:Cn}),n.has(Wt)&&o.push({attribute:Wt,format:"uint32",byteOffset:bn}),n.has(Yt)&&o.push({attribute:Yt,format:"uint32",byteOffset:Zo});const r=[{name:xn,byteStride:qo,stepMode:"instance",attributes:o}];return n.has(vt)&&r.push({name:En,byteStride:Float32Array.BYTES_PER_ELEMENT*4,stepMode:"instance",attributes:[{attribute:vt,format:"float32x4",byteOffset:0}]}),r}function zt(t,e){const n=new Set(t.attributes.map(o=>o.name));return{[xn]:e.expandedPathVertexData,...n.has(vt)?{[En]:e.pathViewOriginData}:{}}}function Tn(t,e){return zt(t,e)}function An(t,e){fr(t,e),gr(t);const n=[],o=Pr(t.paths);let r=t.rowIndexBase??0;for(let a=0;a<t.paths.data.length;a++){const i=t.paths.data[a],s=fe(i),c=wr(s,i.length),u=c[c.length-1]??0,l=t.colors?.data[a],d=t.widths?.data[a],f=t.timestamps?.data[a],h=t.viewOrigins?.data[a];n.push({batchRowIndexBase:r,rowCount:i.length,componentCount:o,valueOffsets:s,recordOffsets:c,segmentCount:u,pathValuesBinding:J(i,Vt(i,t.paths.byteStride)),viewOriginsBinding:h?J(h,h.length*t.viewOrigins.byteStride):void 0,colorsBinding:l?J(l,Vt(l,t.colors.byteStride)):void 0,widthsBinding:d?J(d,d.length*t.widths.byteStride):void 0,timestampsBinding:f?J(f,Vt(f,t.timestamps.byteStride)):void 0}),r+=i.length}return{batches:n}}function fr(t,e){le("PathStorageModel",e,{paths:t.paths,colors:t.colors,widths:t.widths,timestamps:t.timestamps,viewOrigins:t.viewOrigins})}function gr(t){const e=[["paths",t.paths],["colors",t.colors],["widths",t.widths],["timestamps",t.timestamps],["viewOrigins",t.viewOrigins]].filter(([,r])=>r!==void 0),[n,o]=e[0];for(const[r,a]of e.slice(1)){if(a.length!==o.length)throw new Error(`PathStorageModel ${r} rows must match ${n} rows (${a.length} !== ${o.length})`);if(a.data.length!==o.data.length)throw new Error(`PathStorageModel ${r} batch count must match ${n} batch count`);for(let i=0;i<a.data.length;i++)if(a.data[i].length!==o.data[i].length)throw new Error(`PathStorageModel ${r} batch ${i} rows must match ${n}`)}t.timestamps&&pr(t.paths,t.timestamps),t.colors&&yr(t.colors)&&mr(t.paths,t.colors)}function pr(t,e){for(let n=0;n<t.data.length;n++){const o=fe(t.data[n]),r=e.data[n].valueOffsets;if(!r)throw new Error("PathStorageModel timestamps require copied variable-length offsets");if(!_n(o,r))throw new Error("PathStorageModel timestamps must align with path vertex offsets")}}function mr(t,e){for(let n=0;n<t.data.length;n++){const o=fe(t.data[n]),r=e.data[n].valueOffsets;if(!r)throw new Error("PathStorageModel vertex colors require copied variable-length offsets");if(!_n(o,r))throw new Error("PathStorageModel vertex colors must align with path vertex offsets")}}function _n(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function fe(t){if(!t.valueOffsets)throw new Error("PathStorageModel paths require copied variable-length offset metadata");return t.valueOffsets}function wr(t,e){const n=[0];for(let o=0;o<e;o++){const r=t[o]??0,a=t[o+1]??r,i=Math.max(0,a-r-1);n.push((n[n.length-1]??0)+i)}return n}function Pr(t){const e=t.format;if(!e)throw new Error("PathStorageModel paths require GPUVector.format");return oo(e).components}function yr(t){return t.format!==void 0&&sn(t.format)}function J(t,e){return{buffer:Sr(t),offset:t.byteOffset,...e&&e>0?{size:e}:{}}}function Sr(t){return t.buffer instanceof V?t.buffer.buffer:t.buffer}function Vt(t,e){return t.valueByteLength??t.valueLength*e}function xr(t,e){const{bindings:n={},...o}=e;return{kernel:new ro(t,o),bindings:{...n}}}const Ne=4,at=3,Ct=6,Er=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathRanges : array<vec4<u32>>;
@group(0) @binding(2) var<storage, read> pathExpansionConfig : array<u32>;
@group(0) @binding(3) var<storage, read_write> generatedPathVertices : array<u32>;

const PATH_SEGMENT_FIRST : u32 = 1u;
const PATH_SEGMENT_LAST : u32 = 2u;
const PATH_SEGMENT_CLOSED : u32 = 4u;
const COMPACT_PATH_RECORD_WORD_COUNT : u32 = ${at}u;

fn getPathComponentCount() -> u32 {
  return pathExpansionConfig[1];
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= getPathComponentCount()) {
    return 0.0;
  }
  return pathValues[pointIndex * getPathComponentCount() + componentIndex];
}

fn pathIsClosed(pathStart: u32, pointCount: u32) -> bool {
  if (pointCount < 3u) {
    return false;
  }
  let lastPointIndex = pathStart + pointCount - 1u;
  var componentIndex = 0u;
  loop {
    if (componentIndex >= getPathComponentCount()) {
      break;
    }
    if (
      readPathComponent(pathStart, componentIndex) !=
      readPathComponent(lastPointIndex, componentIndex)
    ) {
      return false;
    }
    componentIndex += 1u;
  }
  return true;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let localRowIndex = globalInvocationId.x;
  let rowCount = pathExpansionConfig[0];
  if (localRowIndex >= rowCount) {
    return;
  }

  let rowStart = pathExpansionConfig[2];
  let generatedRecordStart = pathExpansionConfig[3];
  let recordWordCount = pathExpansionConfig[4];
  let pathRange = pathRanges[rowStart + localRowIndex];
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let outputStart = pathRange.z - generatedRecordStart;
  let rowIndex = pathRange.w;
  let pointCount = select(0u, pathEnd - pathStart, pathEnd >= pathStart);
  let segmentCount = select(0u, pointCount - 1u, pointCount > 0u);
  let closedPath = pathIsClosed(pathStart, pointCount);

  var segmentOffset = 0u;
  loop {
    if (segmentOffset >= segmentCount) {
      break;
    }
    let segmentStartPointIndex = pathStart + segmentOffset;
    let segmentEndPointIndex = segmentStartPointIndex + 1u;
    var previousPointIndex = segmentStartPointIndex;
    if (segmentOffset > 0u) {
      previousPointIndex = segmentStartPointIndex - 1u;
    } else if (closedPath) {
      previousPointIndex = pathEnd - 2u;
    }
    var nextPointIndex = segmentEndPointIndex + 1u;
    if (segmentOffset == segmentCount - 1u) {
      nextPointIndex = segmentEndPointIndex;
      if (closedPath) {
        nextPointIndex = pathStart + 1u;
      }
    }

    var flags = select(0u, PATH_SEGMENT_CLOSED, closedPath);
    if (segmentOffset == 0u) {
      flags |= PATH_SEGMENT_FIRST;
    }
    if (segmentOffset == segmentCount - 1u) {
      flags |= PATH_SEGMENT_LAST;
    }
    let recordWordOffset = (outputStart + segmentOffset) * recordWordCount;
    if (recordWordCount == COMPACT_PATH_RECORD_WORD_COUNT) {
      generatedPathVertices[recordWordOffset] = segmentStartPointIndex;
      generatedPathVertices[recordWordOffset + 1u] = flags;
      generatedPathVertices[recordWordOffset + 2u] = rowIndex;
    } else {
      generatedPathVertices[recordWordOffset] = segmentStartPointIndex;
      generatedPathVertices[recordWordOffset + 1u] = segmentEndPointIndex;
      generatedPathVertices[recordWordOffset + 2u] = previousPointIndex;
      generatedPathVertices[recordWordOffset + 3u] = nextPointIndex;
      generatedPathVertices[recordWordOffset + 4u] = flags;
      generatedPathVertices[recordWordOffset + 5u] = rowIndex;
    }
    segmentOffset += 1u;
  }
}
`,vr={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"pathExpansionConfig",type:"read-only-storage",group:0,location:2},{name:"generatedPathVertices",type:"storage",group:0,location:3}],attributes:[]};function Cr(t,e,n){const{valueOffsets:o,recordOffsets:r,batchRowIndexBase:a,rowCount:i}=n,s=new Uint32Array(Math.max(i,1)*Ne);for(let u=0;u<i;u++){const l=u*Ne;s[l]=Math.max(0,o[u]??0),s[l+1]=Math.max(s[l],o[u+1]??s[l]),s[l+2]=Math.max(0,r[u]??0),s[l+3]=a+u}const c=t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-path-ranges`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:s});return{pathRangesBuffer:c,byteLength:s.byteLength,destroy:()=>c.destroy()}}function br(t,e,n){const{generatedBufferBatch:o,componentCount:r,recordWordCount:a}=n,i=o.rowEnd-o.rowStart;if(a!==at&&a!==Ct)throw new Error(`Unsupported GPU path record word count ${a}; expected ${at} or ${Ct}`);const s=new Uint32Array([i,r,o.rowStart,o.recordStart,a]);return{expansionConfigBuffer:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-expansion-config`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:s}),byteLength:s.byteLength}}function Tr(t,e,n,o){if(o!==at&&o!==Ct)throw new Error(`Unsupported GPU path record word count ${o}; expected ${at} or ${Ct}`);const r=Math.max(n,1),a=n*Uint32Array.BYTES_PER_ELEMENT*o;return{compactPathVertexData:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-generated-path-vertices`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(r*o)}),byteLength:a}}function Ar(t,e,n){const o=xr(t,{id:`${e.id||"gpu-expanded-path-model"}-compute`,source:Er,shaderLayout:vr,bindings:{pathValues:n.pathValues,pathRanges:n.pathRanges,pathExpansionConfig:n.expansionInput.expansionConfigBuffer,generatedPathVertices:n.generated.compactPathVertexData}});if(n.rowCount>0&&n.segmentCount>0){const r=t.beginComputePass({});o.kernel.dispatch(r,{bindings:o.bindings,x:Math.ceil(n.rowCount/64)}),r.end(),t.submit()}o.kernel.destroy()}const Ht="segmentStartPointIndices",jt="segmentEndPointIndices",qt="segmentPreviousPointIndices",Kt="segmentNextPointIndices",Xt="segmentFlags",Jt="rowIndices",tt="compactPathVertexData",_r="pathRanges",Ir="pathViewOrigins",Or=Uint32Array.BYTES_PER_ELEMENT*3,In=Uint32Array.BYTES_PER_ELEMENT*6,Lr=Uint32Array.BYTES_PER_ELEMENT,Rr=Uint32Array.BYTES_PER_ELEMENT*2,Br=Uint32Array.BYTES_PER_ELEMENT*3,Dr=Uint32Array.BYTES_PER_ELEMENT*4,Mr=Uint32Array.BYTES_PER_ELEMENT*5,Vr=Uint32Array.BYTES_PER_ELEMENT,Nr=Uint32Array.BYTES_PER_ELEMENT*2,On=[255,255,255,255],Ln=1,Fr=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!1,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],Rn={attributes:[{name:Ht,location:0,type:"u32",stepMode:"instance"},{name:Xt,location:1,type:"u32",stepMode:"instance"},{name:Jt,location:2,type:"u32",stepMode:"instance"}],bindings:[]},Ur=`
  @group(0) @binding(auto) var<storage, read> pathValues : array<f32>;
  @group(0) @binding(auto) var<storage, read> pathRanges : array<vec4<u32>>;
  @group(0) @binding(auto) var<storage, read> pathViewOrigins : array<vec4<f32>>;
  @group(0) @binding(auto) var<storage, read> pathRowColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathVertexColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathRowWidths : array<f32>;

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

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) segmentStartPointIndices : u32,
  @location(1) segmentFlags : u32,
  @location(2) rowIndices : u32,
};

struct FragmentInputs {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec4<f32>,
};

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) {
    return 0.0;
  }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readPathPoint(pointIndex: u32) -> vec4<f32> {
  return vec4<f32>(
    readPathComponent(pointIndex, 0u),
    readPathComponent(pointIndex, 1u),
    readPathComponent(pointIndex, 2u),
    readPathComponent(pointIndex, 3u)
  );
}

fn readPathRange(globalRowIndex: u32) -> vec4<u32> {
  return pathRanges[globalRowIndex - pathStorageStyleConfig.batchRowIndexBase];
}

fn readPathViewOrigin(rowIndex: u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) {
    return vec4<f32>(0.0);
  }
  return pathViewOrigins[rowIndex];
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  let rowIndex = inputs.rowIndices - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = readPathRange(inputs.rowIndices);
  let segmentEndPointIndex = min(inputs.segmentStartPointIndices + 1u, pathRange.y - 1u);
  let pathWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[rowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  let pathPosition = select(
    readPathPoint(inputs.segmentStartPointIndices),
    readPathPoint(segmentEndPointIndex),
    (inputs.vertexIndex & 1u) == 1u
  ) + readPathViewOrigin(rowIndex);
  var outputs : FragmentInputs;
  outputs.position = vec4<f32>(
    pathPosition.xyz + vec3<f32>(0.0, 0.0, pathWidth * 0.0),
    1.0
  );
  outputs.color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    outputs.color = mix(
      unpackPathColor(pathVertexColors[inputs.segmentStartPointIndices]),
      unpackPathColor(pathVertexColors[segmentEndPointIndex]),
      f32(inputs.vertexIndex & 1u)
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackPathColor(pathRowColors[rowIndex]);
  }
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  return inputs.color;
}
`;class X extends ao{static gpuInputSchema=Fr;segmentCount;pathRangeBuildTimeMs;pathRangeByteLength;pathRecordByteStride;compactPathVertexByteLength;generatedRenderBufferByteLength;rowStorageByteLength;transientComputeInputByteLength;batches;renderBatches;rowColorsBinding;vertexColorsBinding;rowWidthsBinding;styleConfigBuffer;compactPathVertexData;storageState;pathProps;ownsStorageState;constructor(e,n){if(e.type!=="webgpu")throw new Error("PathStorageModel is WebGPU-only");const o=!Ue(n),r=o?Fe(e,n):n.storageState;super(e,$r(n,r)),this.pathProps=n,this.storageState=r,this.ownsStorageState=o,this.applyStorageState(r)}setProps(e){const n={...this.pathProps,...e},o=Ue(n),r=e,i="storageState"in e&&e.storageState!==void 0||r.paths!==void 0||r.shaderLayout!==void 0||r.rowIndexBase!==void 0,s=!o&&(r.colors!==void 0||r.widths!==void 0||r.timestamps!==void 0||r.viewOrigins!==void 0||r.color!==void 0||r.width!==void 0);if(this.pathProps=n,!i){if(s){zr(this.device,n,this.storageState),this.applyStorageState(this.storageState);const d=H(this.storageState);this.setBindings(Z(n,d)),this.setNeedsRedraw("Storage path row bindings updated")}return}const c=o?n.storageState:Fe(this.device,n);this.ownsStorageState&&this.storageState.destroy(),this.storageState=c,this.ownsStorageState=!o,this.applyStorageState(c);const u=H(c),l=it(c);this.setAttributes({[tt]:l.compactPathVertexData}),this.setBindings(Z(n,u)),this.setInstanceCount(l.segmentCount),this.setNeedsRedraw("Storage path state updated")}draw(e,n){return n?.parameters?this._withDrawParameters(e,n.parameters,()=>this.drawPathStorageModelBatches(e)):this.drawPathStorageModelBatches(e)}drawPathStorageModelBatches(e){let n=!0;for(const a of this.storageState.renderBatches){if(a.segmentCount===0)continue;const i=this.storageState.batches[a.rowBindingBatchIndex];if(!i)throw new Error("PathStorageModel render batch is missing its row-binding batch");this.setAttributes({[tt]:a.compactPathVertexData}),this.setBindings(Z(this.pathProps,i)),this.setInstanceCount(a.segmentCount),n=super.draw(e)&&n}const o=H(this.storageState),r=it(this.storageState);return this.setAttributes({[tt]:r.compactPathVertexData}),this.setBindings(Z(this.pathProps,o)),this.setInstanceCount(this.storageState.segmentCount),n}destroy(){this.ownsStorageState&&this.storageState.destroy(),super.destroy()}applyStorageState(e){this.segmentCount=e.segmentCount,this.pathRangeBuildTimeMs=e.pathRangeBuildTimeMs,this.pathRangeByteLength=e.pathRangeByteLength,this.pathRecordByteStride=e.pathRecordByteStride,this.compactPathVertexByteLength=e.compactPathVertexByteLength,this.generatedRenderBufferByteLength=e.generatedRenderBufferByteLength,this.rowStorageByteLength=e.rowStorageByteLength,this.transientComputeInputByteLength=e.transientComputeInputByteLength,this.batches=e.batches,this.renderBatches=e.renderBatches,this.rowColorsBinding=e.rowColorsBinding,this.vertexColorsBinding=e.vertexColorsBinding,this.rowWidthsBinding=e.rowWidthsBinding,this.styleConfigBuffer=e.styleConfigBuffer,this.compactPathVertexData=e.compactPathVertexData}}function Gr(t){const e=new Set(t.attributes.map(n=>n.name));return Bn(e)?"legacy":"compact"}function Bn(t){return t.has(jt)||t.has(qt)||t.has(Kt)}function kr(t){return t==="legacy"?In:Or}function Fe(t,e){if(t.type!=="webgpu")throw new Error("createPathStorageState requires a WebGPU device");const n=Ge(),o=e.shaderLayout??Rn,r=Gr(o),a=kr(r),i=a/Uint32Array.BYTES_PER_ELEMENT,s=An(e,X.gpuInputSchema),c=Dn(t,e),u=[...c.ownedResources],l=[],d=[],f=[];let h=0,g=0,m=0,p=c.byteLength,y=0;for(const[b,P]of s.batches.entries()){const E=Cr(t,{id:e.id},{valueOffsets:P.valueOffsets,recordOffsets:P.recordOffsets,batchRowIndexBase:P.batchRowIndexBase,rowCount:P.rowCount});l.push(E),g+=E.byteLength;const T=Mn(t,e,P,c),z=Pn({device:t,recordOffsets:P.recordOffsets,recordByteStride:a,maxBatchByteLength:t.limits.maxStorageBufferBindingSize,resourceLabel:"PathStorageModel indexed generated path vertex data"});for(const I of z){const L=br(t,{id:e.id},{generatedBufferBatch:I,componentCount:P.componentCount,recordWordCount:i}),R=Tr(t,{id:e.id},I.recordCount,i);Ar(t,{id:e.id},{pathValues:P.pathValuesBinding,pathRanges:E.pathRangesBuffer,expansionInput:L,generated:R,rowCount:I.rowEnd-I.rowStart,segmentCount:I.recordCount}),f.push({rowBindingBatchIndex:b,rowStart:I.rowStart,rowEnd:I.rowEnd,segmentCount:I.recordCount,compactPathVertexData:R.compactPathVertexData}),m+=R.byteLength,y+=L.byteLength,L.expansionConfigBuffer.destroy()}d.push({...T,batchRowIndexBase:P.batchRowIndexBase,rowCount:P.rowCount,segmentCount:P.segmentCount,pathValuesBinding:P.pathValuesBinding,pathRangesBinding:E.pathRangesBuffer,...P.timestampsBinding?{pathTimestampsBinding:P.timestampsBinding}:{},pathViewOriginsBinding:T.pathViewOriginsBinding}),u.push(...T.ownedResources),p+=T.ownedByteLength,h+=P.segmentCount}const x=H({batches:d}),S=it({renderBatches:f});let C=!1;return{segmentCount:h,pathRangeBuildTimeMs:Ge()-n,pathRangeByteLength:g,pathRecordByteStride:a,compactPathVertexByteLength:m,generatedRenderBufferByteLength:m,rowStorageByteLength:p,transientComputeInputByteLength:y,batches:d,renderBatches:f,ownedRowBindingResources:u,rowColorsBinding:x.rowColorsBinding,vertexColorsBinding:x.vertexColorsBinding,rowWidthsBinding:x.rowWidthsBinding,styleConfigBuffer:x.styleConfigBuffer,compactPathVertexData:S.compactPathVertexData,destroy:()=>{if(!C){C=!0,Zt(u),Zt(l);for(const b of f)b.compactPathVertexData.destroy()}}}}function $r(t,e){const n=t.shaderLayout??Rn,o=H(e),r=it(e);return{...t,source:t.source??Ur,shaderLayout:n,bindings:Z(t,o),attributes:{...t.attributes||{},[tt]:r.compactPathVertexData},bufferLayout:[...t.bufferLayout||[],Wr(n,e.pathRecordByteStride)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:r.segmentCount}}function Z(t,e){return{...t.bindings||{},pathValues:e.pathValuesBinding,[_r]:e.pathRangesBinding,[Ir]:e.pathViewOriginsBinding,pathRowColors:e.rowColorsBinding,pathVertexColors:e.vertexColorsBinding,pathRowWidths:e.rowWidthsBinding,...e.pathTimestampsBinding?{pathTimestamps:e.pathTimestampsBinding}:{},pathStorageStyleConfig:e.styleConfigBuffer}}function Wr(t,e){const n=new Set(t.attributes.map(a=>a.name)),o=e===In,r=[];if(n.has(Ht)&&r.push({attribute:Ht,format:"uint32",byteOffset:0}),!o&&Bn(n))throw new Error("PathStorageModel storageState uses compact path records, but the shader layout requests legacy segment neighbor attributes");return o&&n.has(jt)&&r.push({attribute:jt,format:"uint32",byteOffset:Lr}),o&&n.has(qt)&&r.push({attribute:qt,format:"uint32",byteOffset:Rr}),o&&n.has(Kt)&&r.push({attribute:Kt,format:"uint32",byteOffset:Br}),n.has(Xt)&&r.push({attribute:Xt,format:"uint32",byteOffset:o?Dr:Vr}),n.has(Jt)&&r.push({attribute:Jt,format:"uint32",byteOffset:o?Mr:Nr}),{name:tt,stepMode:"instance",byteStride:e,attributes:r}}function Dn(t,e){const n=e.id||"path-storage-model",o=Nt(t,`${n}-default-row-colors`,"unorm8x4",new Uint8Array(e.color??On)),r=Nt(t,`${n}-default-row-widths`,"float32",new Float32Array([e.width??Ln])),a=Nt(t,`${n}-default-view-origins`,"float32x4",new Float32Array(4));return{colorsBinding:ft(o),vertexColorsBinding:ft(o),widthsBinding:ft(r),viewOriginsBinding:ft(a),byteLength:Uint8Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*4,ownedResources:[o,r,a]}}function Mn(t,e,n,o){const r=Yr(e,n.batchRowIndexBase,n.componentCount),a=new V(t,{id:`${e.id||"path-storage-model"}-style-config-${n.batchRowIndexBase}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:r});return{pathViewOriginsBinding:n.viewOriginsBinding??o.viewOriginsBinding,rowColorsBinding:e.colors&&Vn(e.colors)&&n.colorsBinding?n.colorsBinding:o.colorsBinding,vertexColorsBinding:e.colors&&Nn(e.colors)&&n.colorsBinding?n.colorsBinding:o.vertexColorsBinding,rowWidthsBinding:n.widthsBinding??o.widthsBinding,styleConfigBuffer:a,ownedResources:[a],ownedByteLength:r.byteLength}}function Nt(t,e,n,o){return new F({type:"buffer",name:e,buffer:t.createBuffer({id:e,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:o}),format:n,length:1,ownsBuffer:!0})}function ft(t){const[e,...n]=t.data;if(!e||n.length>0)throw new Error(`Storage path vector "${t.name}" requires exactly one GPUData chunk`);const o=e.buffer;return o instanceof V?o.buffer:o}function Vn(t){return t.format==="unorm8x4"}function Nn(t){return t.format==="vertex-list<unorm8x4>"}function Yr(t,e,n){const o=new ArrayBuffer(48),r=new Float32Array(o),a=new Uint32Array(o),i=t.color??On;return r[0]=i[0]/255,r[1]=i[1]/255,r[2]=i[2]/255,r[3]=i[3]/255,r[4]=t.width??Ln,a[5]=t.colors&&Vn(t.colors)?1:0,a[6]=t.widths?1:0,a[7]=e,a[8]=n,a[9]=t.viewOrigins?1:0,a[10]=t.colors&&Nn(t.colors)?1:0,a}function zr(t,e,n){const o=An(e,X.gpuInputSchema);Hr(n,o.batches);const r=[],a=Dn(t,e);r.push(...a.ownedResources);let i=a.byteLength;const s=o.batches.map((c,u)=>{const l=n.batches[u],d=Mn(t,e,c,a);return r.push(...d.ownedResources),i+=d.ownedByteLength,{...d,batchRowIndexBase:l.batchRowIndexBase,rowCount:l.rowCount,segmentCount:l.segmentCount,pathValuesBinding:l.pathValuesBinding,pathRangesBinding:l.pathRangesBinding,...c.timestampsBinding?{pathTimestampsBinding:c.timestampsBinding}:{},pathViewOriginsBinding:d.pathViewOriginsBinding}});qr(n.ownedRowBindingResources,r),n.batches=s,n.rowStorageByteLength=i,jr(n)}function Hr(t,e){if(e.length!==t.batches.length)throw new Error("PathStorageModel row-binding updates must preserve path batch count");for(const[n,o]of e.entries()){const r=t.batches[n];if(!r||r.batchRowIndexBase!==o.batchRowIndexBase||r.rowCount!==o.rowCount||r.segmentCount!==o.segmentCount)throw new Error("PathStorageModel row-binding updates must preserve path batch rows")}}function jr(t){const e=H(t),n=it(t);t.rowColorsBinding=e.rowColorsBinding,t.vertexColorsBinding=e.vertexColorsBinding,t.rowWidthsBinding=e.rowWidthsBinding,t.styleConfigBuffer=e.styleConfigBuffer,t.compactPathVertexData=n.compactPathVertexData}function Zt(t){for(const e of t)e.destroy()}function qr(t,e){Zt(t),t.splice(0,t.length,...e)}function H(t){const e=t.batches[0];if(!e)throw new Error("PathStorageState requires at least one row-binding batch");return e}function it(t){const e=t.renderBatches[0];if(!e)throw new Error("PathStorageState requires at least one render batch");return e}function Ue(t){return"storageState"in t&&t.storageState!==void 0}function Ge(){return typeof performance>"u"?Date.now():performance.now()}const Kr=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!0,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],Xr=`
  @group(0) @binding(auto) var<storage, read> pathValues : array<f32>;
  @group(0) @binding(auto) var<storage, read> pathRanges : array<vec4<u32>>;
  @group(0) @binding(auto) var<storage, read> pathViewOrigins : array<vec4<f32>>;
  @group(0) @binding(auto) var<storage, read> pathRowColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathVertexColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathRowWidths : array<f32>;
  @group(0) @binding(auto) var<storage, read> pathTimestamps : array<f32>;

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

struct TripPathConfig {
  currentTime : f32,
  trailLength : f32,
  fadeTrail : u32,
  _padding0 : u32,
};

@group(0) @binding(auto) var<uniform> pathStorageStyleConfig : PathStorageStyleConfig;
@group(0) @binding(auto) var<uniform> tripPathConfig : TripPathConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) segmentStartPointIndices : u32,
  @location(1) segmentFlags : u32,
  @location(2) rowIndices : u32,
};

struct FragmentInputs {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @location(1) time : f32,
};

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) {
    return 0.0;
  }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readPathPoint(pointIndex: u32) -> vec4<f32> {
  return vec4<f32>(
    readPathComponent(pointIndex, 0u),
    readPathComponent(pointIndex, 1u),
    readPathComponent(pointIndex, 2u),
    readPathComponent(pointIndex, 3u)
  );
}

fn readPathRange(globalRowIndex: u32) -> vec4<u32> {
  return pathRanges[globalRowIndex - pathStorageStyleConfig.batchRowIndexBase];
}

fn readPathViewOrigin(rowIndex: u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) {
    return vec4<f32>(0.0);
  }
  return pathViewOrigins[rowIndex];
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  let rowIndex = inputs.rowIndices - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = readPathRange(inputs.rowIndices);
  let segmentEndPointIndex = min(inputs.segmentStartPointIndices + 1u, pathRange.y - 1u);
  let pathWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[rowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  let useSegmentEnd = (inputs.vertexIndex & 1u) == 1u;
  let pathPosition = select(
    readPathPoint(inputs.segmentStartPointIndices),
    readPathPoint(segmentEndPointIndex),
    useSegmentEnd
  ) + readPathViewOrigin(rowIndex);
  var outputs : FragmentInputs;
  outputs.position = vec4<f32>(
    pathPosition.xyz + vec3<f32>(0.0, 0.0, pathWidth * 0.0),
    1.0
  );
  outputs.color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    outputs.color = select(
      unpackPathColor(pathVertexColors[inputs.segmentStartPointIndices]),
      unpackPathColor(pathVertexColors[segmentEndPointIndex]),
      useSegmentEnd
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackPathColor(pathRowColors[rowIndex]);
  }
  outputs.time = select(
    pathTimestamps[inputs.segmentStartPointIndices],
    pathTimestamps[segmentEndPointIndex],
    useSegmentEnd
  );
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  if (
    inputs.time > tripPathConfig.currentTime ||
    (tripPathConfig.fadeTrail != 0u &&
      inputs.time < tripPathConfig.currentTime - tripPathConfig.trailLength)
  ) {
    discard;
  }
  var color = inputs.color;
  if (tripPathConfig.fadeTrail != 0u) {
    color.a *= 1.0 - (tripPathConfig.currentTime - inputs.time) / tripPathConfig.trailLength;
  }
  return color;
}
`;class ge extends X{static gpuInputSchema=Kr;tripProps;tripConfigBuffer;constructor(e,n){Jr(n)&&le("PathTripsStorageModel",ge.gpuInputSchema,{paths:n.paths,colors:n.colors,widths:n.widths,timestamps:n.timestamps,viewOrigins:n.viewOrigins});const o=Zr(e,n);super(e,{...n,source:n.source??Xr,bindings:{...n.bindings||{},tripPathConfig:o}}),this.tripProps=n,this.tripConfigBuffer=o}setProps(e){const n={...this.tripProps,...e};(e.currentTime!==void 0||e.trailLength!==void 0||e.fadeTrail!==void 0)&&this.tripConfigBuffer.write(Fn(n)),this.tripProps=n,super.setProps({...e,bindings:{...e.bindings||this.tripProps.bindings||{},tripPathConfig:this.tripConfigBuffer}})}destroy(){this.tripConfigBuffer.destroy(),super.destroy()}}function Jr(t){return"paths"in t}function Zr(t,e){return new V(t,{id:`${e.id||"path-trips-storage-model"}-trip-config`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:Fn(e)})}function Fn(t){const e=new ArrayBuffer(16),n=new Float32Array(e),o=new Uint32Array(e);return n[0]=t.currentTime,n[1]=t.trailLength,o[2]=t.fadeTrail===!1?0:1,o}const Qr=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathRanges : array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> closedFlags : array<u32>;

struct PathClosureConfig {
  epsilon : f32,
  rowCount : u32,
  componentCount : u32,
  _padding0 : u32,
};

@group(0) @binding(3) var<uniform> pathClosureConfig : PathClosureConfig;
@group(0) @binding(4) var<storage, read_write> needsInjection : array<u32>;

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  return pathValues[pointIndex * pathClosureConfig.componentCount + componentIndex];
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= pathClosureConfig.rowCount) {
    return;
  }

  needsInjection[rowIndex] = 0u;
  if (closedFlags[rowIndex] == 0u) {
    return;
  }

  let pathRange = pathRanges[rowIndex];
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let pointCount = select(0u, pathEnd - pathStart, pathEnd >= pathStart);
  if (pointCount <= 1u) {
    return;
  }

  let lastPointIndex = pathStart + pointCount - 1u;
  var componentIndex = 0u;
  loop {
    if (componentIndex >= pathClosureConfig.componentCount) {
      break;
    }
    let firstComponent = readPathComponent(pathStart, componentIndex);
    let lastComponent = readPathComponent(lastPointIndex, componentIndex);
    if (!(abs(firstComponent - lastComponent) <= pathClosureConfig.epsilon)) {
      needsInjection[rowIndex] = 1u;
      return;
    }
    componentIndex += 1u;
  }
}
`,ta={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"closedFlags",type:"read-only-storage",group:0,location:2},{name:"pathClosureConfig",type:"uniform",group:0,location:3},{name:"needsInjection",type:"storage",group:0,location:4}],attributes:[]},ea=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathScatterRanges : array<vec4<u32>>;

struct PathScatterConfig {
  rowCount : u32,
  componentCount : u32,
  _padding0 : u32,
  _padding1 : u32,
};

@group(0) @binding(2) var<uniform> pathScatterConfig : PathScatterConfig;
@group(0) @binding(3) var<storage, read_write> outputPathValues : array<f32>;

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  return pathValues[pointIndex * pathScatterConfig.componentCount + componentIndex];
}

fn writePathComponent(pointIndex: u32, componentIndex: u32, value: f32) {
  outputPathValues[pointIndex * pathScatterConfig.componentCount + componentIndex] = value;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= pathScatterConfig.rowCount) {
    return;
  }

  let pathRange = pathScatterRanges[rowIndex];
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let outputStart = pathRange.z;
  let needsInjection = pathRange.w != 0u;
  let pointCount = select(0u, pathEnd - pathStart, pathEnd >= pathStart);

  var pointOffset = 0u;
  loop {
    if (pointOffset >= pointCount) {
      break;
    }
    var componentIndex = 0u;
    loop {
      if (componentIndex >= pathScatterConfig.componentCount) {
        break;
      }
      writePathComponent(
        outputStart + pointOffset,
        componentIndex,
        readPathComponent(pathStart + pointOffset, componentIndex)
      );
      componentIndex += 1u;
    }
    pointOffset += 1u;
  }

  if (needsInjection && pointCount > 0u) {
    var componentIndex = 0u;
    loop {
      if (componentIndex >= pathScatterConfig.componentCount) {
        break;
      }
      writePathComponent(
        outputStart + pointCount,
        componentIndex,
        readPathComponent(pathStart, componentIndex)
      );
      componentIndex += 1u;
    }
  }
}
`,na={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathScatterRanges",type:"read-only-storage",group:0,location:1},{name:"pathScatterConfig",type:"uniform",group:0,location:2},{name:"outputPathValues",type:"storage",group:0,location:3}],attributes:[]};async function Un(t,e){const n=oa(e),o=Bt(e.paths),r=aa(e.paths,e.closed);if(t.type!=="webgpu")return Pa(t,e,r,n);const a=await Promise.all(r.map((i,s)=>ca(t,e,i,s,n)));return new F({type:"data",name:e.paths.name,dataType:o,format:e.paths.format,data:a,stride:e.paths.stride,byteStride:e.paths.byteStride,rowByteLength:e.paths.rowByteLength,ownsData:!0})}function oa(t){if(ra(Bt(t.paths)),!(t.closed.type instanceof de))throw new Error("closeArrowPaths closed flags must be Vector<Bool>");if(t.closed.length!==t.paths.length)throw new Error(`closeArrowPaths closed flag rows must match path rows (${t.closed.length} !== ${t.paths.length})`);if(t.closed.data.some(e=>e.nullCount>0))throw new Error("closeArrowPaths closed flags cannot contain null rows");if(!Number.isFinite(t.epsilon)||t.epsilon<0)throw new Error("closeArrowPaths epsilon must be a finite non-negative number");return Math.fround(t.epsilon)}function ra(t){if(!Lt(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<1||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof v))throw new Error("closeArrowPaths paths must be GPUVector<List<FixedSizeList<Float32>[1..4]>>")}function aa(t,e){const n=ia(e),o=[];let r=0;for(const a of t.data){if(!a.valueOffsets||a.valueByteLength===void 0)throw new Error("closeArrowPaths paths require copied variable-length Arrow offset metadata");sa(a.valueOffsets,a.length),o.push({pathData:a,valueOffsets:a.valueOffsets,valueByteLength:a.valueByteLength,closedFlags:n.subarray(r,r+a.length),rowIndexBase:r}),r+=a.length}return o}function ia(t){const e=new Uint32Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.get(n)?1:0;return e}function sa(t,e){if(t.length!==e+1)throw new Error("closeArrowPaths path offsets must contain one trailing entry per path chunk");let n=t[0]??0;if(n!==0)throw new Error("closeArrowPaths path offsets must be normalized to start at zero");for(let o=1;o<t.length;o++){const r=t[o]??n;if(r<n)throw new Error("closeArrowPaths path offsets must be monotonically non-decreasing");n=r}}async function ca(t,e,n,o,r){const a=Bt(e.paths),i=$n(a),s=la(t,e,n,o,i,r);let c;try{ua(t,e,n,s),c=await da(s.needsInjectionBuffer,n.pathData.length)}finally{s.pathRangesBuffer.destroy(),s.closedFlagsBuffer.destroy(),s.pathClosureConfigBuffer.destroy(),s.needsInjectionBuffer.destroy()}const u=kn(n.valueOffsets,c,n.pathData.length),l=ha(t,e,n,o,i,u,c);try{fa(t,e,n,l)}finally{l.pathScatterRangesBuffer.destroy(),l.pathScatterConfigBuffer.destroy()}const d=(u[u.length-1]??0)*i*Float32Array.BYTES_PER_ELEMENT;return new cn({buffer:l.outputPathValuesBuffer,dataType:a,format:n.pathData.format,length:n.pathData.length,stride:n.pathData.stride,byteStride:n.pathData.byteStride,rowByteLength:n.pathData.rowByteLength,ownsBuffer:!0,readbackMetadata:wa(u,d),valueOffsets:u,valueByteLength:d})}function la(t,e,n,o,r,a){const i=n.pathData.length,s=new Uint32Array(Math.max(i,1)*2);for(let l=0;l<i;l++){const d=l*2,f=n.valueOffsets[l]??0,h=n.valueOffsets[l+1]??f;s[d]=f,s[d+1]=Math.max(f,h)}const c=pa(a,i,r),u=e.id||"closed-arrow-paths";return{pathRangesBuffer:t.createBuffer({id:`${u}-ranges-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:s}),closedFlagsBuffer:t.createBuffer({id:`${u}-closed-flags-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:ma(n.closedFlags)}),pathClosureConfigBuffer:new V(t,{id:`${u}-closure-config-${o}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:c}),needsInjectionBuffer:t.createBuffer({id:`${u}-needs-injection-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(Math.max(i,1))})}}function ua(t,e,n,o){const r={pathValues:Gn(n),pathRanges:o.pathRangesBuffer,closedFlags:o.closedFlagsBuffer,pathClosureConfig:o.pathClosureConfigBuffer.buffer,needsInjection:o.needsInjectionBuffer},a=ue(t,{id:`${e.id||"closed-arrow-paths"}-classify`,source:Qr,shaderLayout:ta});if(n.pathData.length>0){const i=t.beginComputePass({});a.dispatch(i,{x:Math.ceil(n.pathData.length/64),bindings:r}),i.end(),t.submit()}a.destroy()}async function da(t,e){if(e===0)return new Uint32Array(0);const n=await t.readAsync(0,e*Uint32Array.BYTES_PER_ELEMENT);return new Uint32Array(n.buffer,n.byteOffset,e).slice()}function ha(t,e,n,o,r,a,i){const s=n.pathData.length,c=new Uint32Array(Math.max(s,1)*4);for(let h=0;h<s;h++){const g=h*4,m=n.valueOffsets[h]??0,p=n.valueOffsets[h+1]??m;c[g]=m,c[g+1]=Math.max(m,p),c[g+2]=a[h]??0,c[g+3]=i[h]??0}const d=(a[a.length-1]??0)*r*Float32Array.BYTES_PER_ELEMENT,f=e.id||"closed-arrow-paths";return{pathScatterRangesBuffer:t.createBuffer({id:`${f}-scatter-ranges-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:c}),pathScatterConfigBuffer:new V(t,{id:`${f}-scatter-config-${o}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:new Uint32Array([s,r,0,0])}),outputPathValuesBuffer:new V(t,{id:`${f}-closed-values-${o}`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,byteLength:Math.max(d,Float32Array.BYTES_PER_ELEMENT)})}}function fa(t,e,n,o){const r={pathValues:Gn(n),pathScatterRanges:o.pathScatterRangesBuffer,pathScatterConfig:o.pathScatterConfigBuffer.buffer,outputPathValues:o.outputPathValuesBuffer.buffer},a=ue(t,{id:`${e.id||"closed-arrow-paths"}-scatter`,source:ea,shaderLayout:na});if(n.pathData.length>0){const i=t.beginComputePass({});a.dispatch(i,{x:Math.ceil(n.pathData.length/64),bindings:r}),i.end(),t.submit()}a.destroy()}function Gn(t){return{buffer:ga(t.pathData),offset:t.pathData.byteOffset,...t.valueByteLength>0?{size:t.valueByteLength}:{}}}function ga(t){return t.buffer instanceof V?t.buffer.buffer:t.buffer}function pa(t,e,n){const o=new ArrayBuffer(16),r=new Float32Array(o),a=new Uint32Array(o);return r[0]=t,a[1]=e,a[2]=n,a}function ma(t){return t.length>0?t:new Uint32Array(1)}function kn(t,e,n){const o=new Int32Array(n+1);for(let r=0;r<n;r++){const a=t[r]??0,i=t[r+1]??a,s=Math.max(0,i-a);o[r+1]=o[r]+s+(e[r]?1:0)}return o}function wa(t,e){return{kind:"variable-length-attribute",valueOffsets:t,nullCount:0,valueByteLength:e}}async function Pa(t,e,n,o){const r=await dn(e.paths),a=$n(Bt(e.paths)),i=r.data.map((u,l)=>ya(u,n[l],a,o)),s=new D(i);return e.paths.format?M(t,s,{name:e.paths.name,format:e.paths.format,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}}):M(t,s,{name:e.paths.name,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}})}function ya(t,e,n,o){if(!e)throw new Error("closeArrowPaths CPU fallback requires path chunk metadata");const r=ct(t),a=Sa(r,e.valueOffsets,e.closedFlags,n,o,t.length),i=kn(e.valueOffsets,a,t.length),s=xa(r,e.valueOffsets,i,a,n,t.length);return Ea(t.type,i,s)}function Sa(t,e,n,o,r,a){const i=new Uint32Array(a);for(let s=0;s<a;s++){if(!n[s])continue;const c=e[s]??0,u=e[s+1]??c,l=Math.max(0,u-c);if(l<=1)continue;const d=c+l-1;for(let f=0;f<o;f++){const h=t[c*o+f]??0,g=t[d*o+f]??0;if(!(Math.abs(h-g)<=r)){i[s]=1;break}}}return i}function xa(t,e,n,o,r,a){const i=n[n.length-1]??0,s=new Float32Array(i*r);for(let c=0;c<a;c++){const u=e[c]??0,l=e[c+1]??u,d=n[c]??0,f=Math.max(0,l-u),h=u*r,g=l*r;if(s.set(t.subarray(h,g),d*r),o[c]&&f>0){const m=t.subarray(h,h+r);s.set(m,(d+f)*r)}}return s}function Ea(t,e,n){const o=t.children[0].type,r=new O(new v,0,n.length,0,{[B.DATA]:n}),a=new O(o,0,o.listSize===0?0:n.length/o.listSize,0,{},[r]);return new O(t,0,e.length-1,0,{[B.OFFSET]:e},[a])}function $n(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("closeArrowPaths paths require FixedSizeList coordinate elements");return e.listSize}function Bt(t){return mo(t)}function Wn(t,e){if(!e)return k(new v,4,t);const n=[];let o=0;for(const r of e){const a=o+r;n.push(k(new v,4,t.slice(o*4,a*4)).data[0]),o=a}if(o*4!==t.length)throw new Error("Arrow path view-origin chunk rows must cover every source row");return new D(n)}function bt(t,e){let n=0;for(const o of t.data){const r=n+o.length;o.buffer.write(e.subarray(n*4,r*4),o.byteOffset),n=r}if(n*4!==e.length)throw new Error("Arrow path view-origin GPU chunks must cover every source row")}function Tt(t,e,n){if(n.length<16)throw new Error("convertArrowPathToGPUVectors updateViewOrigins requires a 4x4 modelViewMatrix");for(let o=0;o<e.length/4;o++){const r=o*4,a=e[r]??0,i=e[r+1]??0,s=e[r+2]??0;t[r]=(n[0]??0)*a+(n[4]??0)*i+(n[8]??0)*s+(n[12]??0),t[r+1]=(n[1]??0)*a+(n[5]??0)*i+(n[9]??0)*s+(n[13]??0),t[r+2]=(n[2]??0)*a+(n[6]??0)*i+(n[10]??0)*s+(n[14]??0),t[r+3]=e[r+3]??0}}const et="segmentStartPositions",nt="segmentEndPositions",wt="segmentPreviousPositions",Pt="segmentNextPositions",pe="segmentStartColors",me="segmentEndColors",yt="segmentFlags",St="rowIndices",we="pathViewOrigins",va=1,Ca=2,ba=4,Q=Float32Array.BYTES_PER_ELEMENT*16+Uint32Array.BYTES_PER_ELEMENT*4,Ta=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),Aa={attributes:[{name:et,location:0,type:"vec4<f32>",stepMode:"instance"},{name:nt,location:1,type:"vec4<f32>",stepMode:"instance"},{name:pe,location:2,type:"u32",stepMode:"instance"},{name:me,location:3,type:"u32",stepMode:"instance"},{name:we,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]};function _a(t){if(t.rowTable.schema.fields.length>0&&t.rowTable.numRows!==t.paths.length)throw new Error("PathAttributeModel requires rowTable rows to match path rows");N(t.rowTable,et),N(t.rowTable,nt),N(t.rowTable,wt),N(t.rowTable,Pt),N(t.rowTable,pe),N(t.rowTable,me),N(t.rowTable,yt),N(t.rowTable,St),N(t.rowTable,we);const e=We(),n=Ma(t.rowTable),o=Va(t.paths,t.viewOrigins,n),r=Qt(o.startIndices,t.rowIndexBase),a=Qt(o.startIndices),i=[],s={};for(const l of t.rowTable.schema.fields){const d=t.rowTable.getChild(l.name);!d||!hn(d.type)||(i.push(l),s[l.name]=wo(d,a))}i.push(pt(et,4)),i.push(pt(nt,4)),i.push(pt(wt,4)),i.push(pt(Pt,4)),i.push(new _(yt,new ht,!1)),i.push(new _(St,new ht,!1)),s[et]=k(new v,4,o.segmentStartPositions),s[nt]=k(new v,4,o.segmentEndPositions),s[wt]=k(new v,4,o.segmentPreviousPositions),s[Pt]=k(new v,4,o.segmentNextPositions),s[yt]=$e(new ht,o.segmentFlags),s[St]=$e(new ht,r);const c=We()-e,u=ni(s);return{table:new W(new pn(i,t.rowTable.schema.metadata),s),segmentLayout:o,segmentAttributeBuildTimeMs:c,attributeByteLength:u}}function Ia(t,e){const n=_a({rowTable:e.rowTable,paths:e.paths,viewOrigins:e.viewOrigins,rowIndexBase:e.rowIndexBase}),o=Pn({device:t,recordOffsets:n.segmentLayout.startIndices,recordByteStride:Q,resourceLabel:"PathAttributeModel expanded path vertex data"}),r=o.map(l=>ti(t,{id:e.id},{segmentTable:n,generatedBufferBatch:l})),a=o.map(l=>ei(t,{id:e.id},n,l)),i=r[0],s=a[0];if(!i||!s)throw new Error("PathAttributeModel requires at least one generated path render batch");const c=o.map((l,d)=>({rowStart:l.rowStart,rowEnd:l.rowEnd,segmentCount:l.recordCount,expandedPathVertexData:r[d].buffer,pathViewOriginData:a[d].buffer}));let u=!1;return{segmentTable:n,segmentLayout:n.segmentLayout,expandedPathVertexData:i.buffer,pathViewOriginData:s.buffer,renderBatches:c,generatedBufferBatches:o,destroy:()=>{u||(u=!0,oi(c))}}}function ke(t,e){if(!e.pathState)throw new Error("makePathAttributeModelProps requires pathState prepared by convertArrowPathToGPUVectors()");const{allowWebGLOnlyFormats:n,...o}=e,r=e.shaderLayout??Aa;return{...o,shaderLayout:r,ownsTable:!0,table:Ro(t,Qa(e.pathState.segmentTable.table,e.pathState.generatedBufferBatches),{shaderLayout:r,allowWebGLOnlyFormats:n})}}async function Oa(t,e,n={}){La(e),Ra(e);const o=n.id||"arrow-path-model",r=$a(e.paths),a=r.sourceOrigins,i=r.paths.data.map(S=>S.length),s=Na(r.paths.type);let c=M(t,r.paths,{name:"paths",id:`${o}-paths`,format:s}),u=r.paths;if(e.closed){const S=await Un(t,{paths:c,closed:e.closed,epsilon:n.closeEpsilon??0,id:`${o}-closed`});c.destroy(),c=S,u=await dn(c)}const l=e.colors?M(t,e.colors,{name:"colors",id:`${o}-colors`,format:Fa(e.colors.type),preserveDataChunks:!0}):void 0,d=e.widths?M(t,e.widths,{name:"widths",id:`${o}-widths`,format:"float32",preserveDataChunks:!0}):void 0,f=new Float32Array(e.paths.length*4),h=a?Wn(f,i):void 0,g=a?M(t,h,{name:we,id:`${o}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;a&&(Tt(f,a,Ta),bt(g,f));const m={};e.colors&&(m.colors=e.colors),e.widths&&(m.widths=e.widths);const p=Ia(t,{id:o,rowTable:new W(m),paths:u,viewOrigins:h,rowIndexBase:n.rowIndexBase});let y=!1;return{id:o,paths:c,...l?{colors:l}:{},...d?{widths:d}:{},...g?{viewOrigins:g}:{},pathState:p,...a?{sourceOrigins:a}:{},updateViewOrigins:({modelViewMatrix:S})=>{!a||!g||(Tt(f,a,S),bt(g,f),za(p,f))},destroy:()=>{y||(y=!0,p.destroy(),c.destroy(),l?.destroy(),d?.destroy(),g?.destroy())}}}function La(t){if(Da(t.paths.type,"paths"),t.colors&&!Pe(t.colors.type))throw new Error("convertArrowPathToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof v))throw new Error("convertArrowPathToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof de))throw new Error("convertArrowPathToGPUVectors closed flags must be Vector<Bool>")}function Ra(t){const e=[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]];for(const[n,o]of e)if(o&&o.length!==t.paths.length)throw new Error(`convertArrowPathToGPUVectors ${n} rows must match paths rows (${o.length} !== ${t.paths.length})`);t.colors&&lt(t.colors.type)&&Hn(t.paths,t.colors)}function Ba(t,e){if(!Lt(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof v))throw new Error(`PathAttributeModel ${e} must be GPUVector<List<FixedSizeList<Float32>[2..4]>>`)}function Da(t,e){const n=Yn(t);if(!Lt(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(n instanceof v)&&!(n instanceof U))throw new Error(`convertArrowPathToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}function Yn(t){const e=t.children[0]?.type;return A.isFixedSizeList(e)?e.children[0]?.type:void 0}function Ma(t){const e=t.getChild("colors");if(e)return Pe(e.type)?e:void 0}function Va(t,e,n){Ba(t.type,"paths"),e&&ka(e,t.length),n&&Ua(n,t);const o=ye(t.type),r=[0];for(const x of t.data){const S=x.valueOffsets;if(!S)throw new Error("PathAttributeModel source path chunks require Arrow list offsets");for(let C=0;C<x.length;C++){const b=S[C]??0,P=S[C+1]??b,E=Math.max(0,P-b-1);r.push((r[r.length-1]??0)+E)}}const a=r[r.length-1]??0,i=new Float32Array(a*4),s=new Float32Array(a*4),c=new Float32Array(a*4),u=new Float32Array(a*4),l=new Float32Array(a*4),d=new Uint32Array(a),f=new Uint32Array(a),h=new Uint32Array(a);f.fill(4294967295),h.fill(4294967295);const g=ja(e),m=qa(n);let p=0,y=0;for(const x of t.data){const S=x.valueOffsets;if(!S)throw new Error("PathAttributeModel source path chunks require Arrow list offsets");const C=ct(x),b=S[0]??0;for(let P=0;P<x.length;P++){const E=(S[P]??b)-b,T=(S[P+1]??E)-b,z=Math.max(0,T-E),I=Math.max(0,z-1),L=Ha(C,o,E,z);Ka(l,r[y]??p,I,g,y),Ja(f,h,r[y]??p,I,m,y);for(let R=0;R<I;R++){const ut=E+R,Dt=ut+1,eo=R===0?L?T-2:ut:ut-1,no=R===I-1?L?E+1:Dt:Dt+1;gt(i,p,C,ut,o),gt(s,p,C,Dt,o),gt(c,p,C,eo,o),gt(u,p,C,no,o);let Mt=L?ba:0;R===0&&(Mt|=va),R===I-1&&(Mt|=Ca),d[p]=Mt,p++}y++}}return{startIndices:r,segmentCount:a,segmentStartPositions:i,segmentEndPositions:s,segmentPreviousPositions:c,segmentNextPositions:u,segmentViewOrigins:l,segmentFlags:d,segmentStartColors:f,segmentEndColors:h}}function zn(t){return A.isFixedSizeList(t)&&t.listSize===4&&t.children[0]?.type instanceof rt}function lt(t){return A.isList(t)&&zn(t.children[0]?.type)}function Pe(t){return zn(t)||lt(t)}function Na(t){switch(ye(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("PathAttributeModel paths require 2, 3, or 4 coordinate components")}}function Fa(t){return lt(t)?"vertex-list<unorm8x4>":"unorm8x4"}function Ua(t,e){if(!Pe(t.type))throw new Error("PathAttributeModel colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.length!==e.length)throw new Error(`PathAttributeModel color rows must match path rows (${t.length} !== ${e.length})`);lt(t.type)&&Hn(e,t)}function Hn(t,e){if(t.data.length!==e.data.length)throw new Error("PathAttributeModel vertex color batch count must match path batch count");for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,r=e.data[n]?.valueOffsets;if(!o||!r||!Ga(o,r))throw new Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function Ga(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function ka(t,e){if(!A.isFixedSizeList(t.type)||t.type.listSize!==4||!(t.type.children[0]?.type instanceof v))throw new Error("PathAttributeModel view origins must be Vector<FixedSizeList<Float32>[4]>");if(t.length!==e)throw new Error(`PathAttributeModel view origin rows must match path rows (${t.length} !== ${e})`)}function ye(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("PathAttributeModel paths require FixedSizeList coordinate elements");return e.listSize}function $a(t){const e=Yn(t.type);if(e instanceof v)return{paths:t};if(!(e instanceof U))throw new Error("convertArrowPathToGPUVectors paths must contain Float32 or Float64 coordinates");const n=ye(t.type),o=Wa(n),r=new Float64Array(t.length*4),a=[];let i=0;for(const s of t.data){const c=s.valueOffsets;if(!c)throw new Error("convertArrowPathToGPUVectors Float64 paths require Arrow list offsets");const u=ct(s),l=c[0]??0,d=new Int32Array(c.length),f=new Float32Array(u.length);for(let h=0;h<c.length;h++)d[h]=(c[h]??l)-l;for(let h=0;h<s.length;h++){const g=i+h,m=(c[h]??l)-l,p=(c[h+1]??l)-l,y=Math.max(0,p-m);let x=0,S=0,C=0,b=0;if(y>0){const E=m*n;x=u[E]??0,S=u[E+1]??0,n>2&&(C=u[E+2]??0),n>3&&(b=u[E+3]??0)}const P=g*4;r[P]=x,r[P+1]=S,r[P+2]=C,r[P+3]=b;for(let E=m;E<p;E++){const T=E*n;f[T]=(u[T]??0)-x,f[T+1]=(u[T+1]??0)-S,n>2&&(f[T+2]=(u[T+2]??0)-C),n>3&&(f[T+3]=(u[T+3]??0)-b)}}a.push(Ya(o,d,f)),i+=s.length}return{paths:new D(a),sourceOrigins:r}}function Wa(t){const e=new q(t,new _("values",new v,!1));return new K(new _("coordinates",e,!1))}function Ya(t,e,n){const o=t.children[0].type,r=new O(new v,0,n.length,0,{[B.DATA]:n}),a=new O(o,0,o.listSize===0?0:n.length/o.listSize,0,{},[r]);return new O(t,0,e.length-1,0,{[B.OFFSET]:e},[a])}function za(t,e){const{segmentLayout:n}=t.segmentTable;for(let o=0;o<n.startIndices.length-1;o++){const r=n.startIndices[o]??0,a=n.startIndices[o+1]??r,i=o*4;for(let s=r;s<a;s++)n.segmentViewOrigins.set(e.subarray(i,i+4),s*4)}for(const[o,r]of t.generatedBufferBatches.entries()){const a=t.renderBatches[o];if(!a)continue;const i=new Float32Array(Math.max(r.recordCount*4,4));i.set(n.segmentViewOrigins.subarray(r.recordStart*4,r.recordEnd*4)),a.pathViewOriginData.write(i)}}function Ha(t,e,n,o){if(o<3)return!1;const r=n*e,a=(n+o-1)*e;for(let i=0;i<e;i++)if(t[r+i]!==t[a+i])return!1;return!0}function ja(t){if(!t)return;const e=[];let n=0;for(const o of t.data){const r=n+o.length;e.push({rowStart:n,rowEnd:r,values:fn(o)}),n=r}return{chunks:e,currentChunkIndex:0}}function qa(t){if(!t)return;const e=[];let n=0;for(const o of t.data){const r=n+o.length;if(lt(o.type)){const a=o.valueOffsets;if(!a)throw new Error("PathAttributeModel vertex colors require Arrow list offsets");e.push({kind:"vertex",rowStart:n,rowEnd:r,valueOffsets:a,values:ct(o)})}else e.push({kind:"row",rowStart:n,rowEnd:r,values:fn(o)});n=r}return{chunks:e,currentChunkIndex:0}}function Ka(t,e,n,o,r){if(!o||n===0)return;const a=Xa(o,r),i=(r-a.rowStart)*4,s=a.values,c=s[i]??0,u=s[i+1]??0,l=s[i+2]??0,d=s[i+3]??0;for(let f=0;f<n;f++){const h=(e+f)*4;t[h]=c,t[h+1]=u,t[h+2]=l,t[h+3]=d}}function Xa(t,e){let n=t.chunks[t.currentChunkIndex];for(;n&&e>=n.rowEnd;)t.currentChunkIndex++,n=t.chunks[t.currentChunkIndex];if(n&&e>=n.rowStart&&e<n.rowEnd)return n;throw new Error(`PathAttributeModel view origin row ${e} is missing`)}function Ja(t,e,n,o,r,a){if(!r||o===0)return;const i=Za(r,a),s=a-i.rowStart;if(i.kind==="row"){const d=s*4,f=Ft(i.values,d);t.fill(f,n,n+o),e.fill(f,n,n+o);return}const c=i.valueOffsets[0]??0,u=(i.valueOffsets[s]??c)-c;if((i.valueOffsets[s+1]??u)-c-u<o+1)throw new Error("PathAttributeModel vertex colors must provide one color per path vertex");for(let d=0;d<o;d++){const f=n+d;t[f]=Ft(i.values,(u+d)*4),e[f]=Ft(i.values,(u+d+1)*4)}}function Za(t,e){let n=t.chunks[t.currentChunkIndex];for(;n&&e>=n.rowEnd;)t.currentChunkIndex++,n=t.chunks[t.currentChunkIndex];if(n&&e>=n.rowStart&&e<n.rowEnd)return n;throw new Error(`PathAttributeModel color row ${e} is missing`)}function Ft(t,e){return((t[e]??255)|(t[e+1]??255)<<8|(t[e+2]??255)<<16|(t[e+3]??255)<<24)>>>0}function gt(t,e,n,o,r){const a=e*4,i=o*r;for(let s=0;s<r;s++)t[a+s]=n[i+s]??0}function Qa(t,e){const n=new Set([et,nt,wt,Pt,pe,me,yt,St]),o=[],r={};for(const s of t.schema.fields){if(n.has(s.name))continue;const c=t.getChild(s.name);c&&(o.push(s),r[s.name]=c)}const a=new W(new pn(o,new Map(t.schema.metadata)),r);if(!e||e.length<=1||o.length===0)return a;const i=e.flatMap(s=>a.slice(s.recordStart,s.recordEnd).batches);return new W(a.schema,i)}function ti(t,e,{segmentTable:n,generatedBufferBatch:o}){const{segmentLayout:r}=n,a=o.byteLength,i=new ArrayBuffer(Math.max(a,Q)),s=new Float32Array(i),c=new Uint32Array(i),u=Qt(r.startIndices);for(let l=o.recordStart;l<o.recordEnd;l++){const d=l-o.recordStart,f=d*Q/Float32Array.BYTES_PER_ELEMENT,h=d*Q/Uint32Array.BYTES_PER_ELEMENT,g=l*4;s.set(r.segmentStartPositions.subarray(g,g+4),f),s.set(r.segmentEndPositions.subarray(g,g+4),f+4),s.set(r.segmentPreviousPositions.subarray(g,g+4),f+8),s.set(r.segmentNextPositions.subarray(g,g+4),f+12),c[h+16]=r.segmentFlags[l],c[h+17]=u[l],c[h+18]=r.segmentStartColors[l],c[h+19]=r.segmentEndColors[l]}return{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-expanded-path-vertex-data-${o.rowStart}`,usage:w.VERTEX|w.COPY_DST|w.COPY_SRC,data:new Uint8Array(i,0,Math.max(a,Q))}),byteLength:a}}function ei(t,e,n,o){const r=Float32Array.BYTES_PER_ELEMENT*4,a=o.recordCount*r,i=new Float32Array(Math.max(o.recordCount*4,4)),s=o.recordStart*4,c=o.recordEnd*4;return i.set(n.segmentLayout.segmentViewOrigins.subarray(s,c)),{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-path-view-origin-data-${o.rowStart}`,usage:w.VERTEX|w.COPY_DST|w.COPY_SRC,data:i}),byteLength:a}}function Qt(t,e=0){const n=t[t.length-1]??0,o=new Uint32Array(n);for(let r=0;r<t.length-1;r++)o.fill(e+r,t[r],t[r+1]);return o}function N(t,e){if(t.getChild(e))throw new Error(`PathAttributeModel rowTable column "${e}" is reserved`)}function pt(t,e){return new _(t,new q(e,new _("value",new v,!1)),!1)}function $e(t,e){return Oo(Rt({type:t,length:e.length,data:e}))}function ni(t){let e=0;for(const n of Object.values(t))hn(n.type)&&(e+=Po(n).byteLength);return e}function oi(t){const e=new Set(t.flatMap(n=>[n.expandedPathVertexData,n.pathViewOriginData]));for(const n of e)n.destroy()}function We(){return typeof performance>"u"?Date.now():performance.now()}const ri=`
@group(0) @binding(0) var<storage, read> sourcePathValues : array<vec2<u32>>;
@group(0) @binding(1) var<storage, read> sourcePathValueOffsets : array<u32>;
@group(0) @binding(2) var<storage, read> pathDeltaConfig : array<u32>;
@group(0) @binding(3) var<storage, read_write> pathDeltaValues : array<f32>;

fn readSourcePathValueBits(scalarIndex : u32) -> vec2<u32> {
  // Float64Array uploads preserve host word order. Browser and Node WebGPU
  // runtimes are little-endian, while fp64u32 helpers consume canonical hi/lo.
  return sourcePathValues[scalarIndex].yx;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId : vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  let rowCount = pathDeltaConfig[0];
  if (rowIndex >= rowCount) {
    return;
  }

  let componentCount = pathDeltaConfig[1];
  let pathStart = sourcePathValueOffsets[rowIndex];
  let pathEnd = sourcePathValueOffsets[rowIndex + 1u];
  if (pathEnd <= pathStart) {
    return;
  }

  var pointIndex = pathStart;
  loop {
    if (pointIndex >= pathEnd) {
      break;
    }
    var componentIndex = 0u;
    loop {
      if (componentIndex >= componentCount) {
        break;
      }
      let scalarIndex = pointIndex * componentCount + componentIndex;
      let originScalarIndex = pathStart * componentCount + componentIndex;
      pathDeltaValues[scalarIndex] = sub_fp64u32_to_f32(
        readSourcePathValueBits(scalarIndex),
        readSourcePathValueBits(originScalarIndex)
      );
      componentIndex += 1u;
    }
    pointIndex += 1u;
  }
}
`,ai={bindings:[{name:"sourcePathValues",type:"read-only-storage",group:0,location:0},{name:"sourcePathValueOffsets",type:"read-only-storage",group:0,location:1},{name:"pathDeltaConfig",type:"read-only-storage",group:0,location:2},{name:"pathDeltaValues",type:"storage",group:0,location:3}],attributes:[]};async function ii(t,e,n={}){if(t.type!=="webgpu")throw new Error("convertArrowPathFloat64ToGPUVector requires a WebGPU device");const o=ci(e.type),r=ui(o),a=li(o),i=[],s=new Float64Array(e.length*4),c=[];let u=0;for(const[l,d]of e.data.entries()){const f=ct(d),h=di(d);hi(s,u,f,h,o);const g=new V(t,{id:`${n.id||"arrow-path-storage-model"}-source-path-values-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,...f.length>0?{data:f}:{byteLength:Float64Array.BYTES_PER_ELEMENT}}),m=t.createBuffer({id:`${n.id||"arrow-path-storage-model"}-source-path-value-offsets-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(h)}),p=t.createBuffer({id:`${n.id||"arrow-path-storage-model"}-path-delta-config-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array([d.length,o])}),y=new V(t,{id:`${n.id||"arrow-path-storage-model"}-path-delta-values-${l}`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,f.length*Float32Array.BYTES_PER_ELEMENT)});si(t,n,{chunkIndex:l,rowCount:d.length,sourcePathValues:g,sourcePathValueOffsets:m,pathDeltaConfig:p,pathDeltaValues:y}),i.push(new cn({buffer:y,dataType:r,format:a,length:d.length,valueLength:f.length/o,stride:o,byteStride:o*Float32Array.BYTES_PER_ELEMENT,rowByteLength:o*Float32Array.BYTES_PER_ELEMENT,ownsBuffer:!0,readbackMetadata:{kind:"variable-length-attribute",valueOffsets:h,nullCount:0,valueByteLength:f.length*Float32Array.BYTES_PER_ELEMENT}})),c.push(g,m,p),u+=d.length}await fi(t);for(const l of c)l.destroy();return{paths:new F({type:"data",name:"paths",dataType:r,format:a,data:i,stride:o,byteStride:o*Float32Array.BYTES_PER_ELEMENT,rowByteLength:o*Float32Array.BYTES_PER_ELEMENT,ownsData:!0}),sourceOrigins:s}}function si(t,e,n){const o={sourcePathValues:n.sourcePathValues,sourcePathValueOffsets:n.sourcePathValueOffsets,pathDeltaConfig:n.pathDeltaConfig,pathDeltaValues:n.pathDeltaValues},r=ue(t,{id:`${e.id||"arrow-path-storage-model"}-path-delta-compute-${n.chunkIndex}`,source:ri,modules:[io],shaderLayout:ai});if(n.rowCount>0){const a=t.beginComputePass({});r.dispatch(a,{x:Math.ceil(n.rowCount/64),bindings:o}),a.end(),t.submit()}r.destroy()}function ci(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("Float64 path conversion requires FixedSizeList coordinate elements");return e.listSize}function li(t){switch(t){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("convertArrowPathFloat64ToGPUVector paths require 2, 3, or 4 components")}}function ui(t){const e=new q(t,new _("values",new v,!1));return new K(new _("coordinates",e,!1))}function di(t){const e=t.valueOffsets;if(!e)throw new Error("Float64 path conversion requires Arrow list offsets");const n=e[0]??0;return Int32Array.from(e,o=>o-n)}function hi(t,e,n,o,r){for(let a=0;a<o.length-1;a++){const i=o[a]??0,s=o[a+1]??i,c=Math.max(0,s-i),u=(e+a)*4;if(c===0)continue;const l=i*r;t[u]=n[l]??0,t[u+1]=n[l+1]??0,r>2&&(t[u+2]=n[l+2]??0),r>3&&(t[u+3]=n[l+3]??0)}}async function fi(t){await t.handle?.queue?.onSubmittedWorkDone?.()}async function jn(t,e,n={}){if(t.type!=="webgpu")throw new Error("convertArrowPathStorageToGPUVectors requires a WebGPU device");mi(e),wi(e);const o=n.id||"arrow-path-storage-model",r=await xi(t,e.paths,{id:o});let a=r.paths;if(e.closed){const p=await Un(t,{paths:a,closed:e.closed,epsilon:n.closeEpsilon??0,id:`${o}-closed`});a.destroy(),a=p}const i=e.colors?M(t,e.colors,{name:"colors",id:`${o}-colors`,format:pi(e.colors.type),preserveDataChunks:!0}):void 0,s=e.widths?M(t,e.widths,{name:"widths",id:`${o}-widths`,preserveDataChunks:!0}):void 0,c=e.timestamps?await yo(t,e.timestamps,{name:"timestamps",id:`${o}-timestamps`}):void 0,u=c?.temporal,l=r.sourceOrigins,d=new Float32Array(e.paths.length*4),f=l?Wn(d,r.paths.data.map(p=>p.length)):void 0,h=l?M(t,f,{name:"pathViewOrigins",id:`${o}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;l&&h&&(Tt(d,l,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),bt(h,d));let g=!1;const m=({modelViewMatrix:p})=>{!l||!h||(Tt(d,l,p),bt(h,d))};return{id:o,paths:a,...i?{colors:i}:{},...s?{widths:s}:{},...u?{timestamps:u}:{},...h?{viewOrigins:h}:{},rowIndexBase:n.rowIndexBase,...l?{sourceOrigins:l}:{},updateViewOrigins:m,destroy:()=>{g||(g=!0,a.destroy(),i?.destroy(),s?.destroy(),c?.destroy(),h?.destroy())}}}function qn(t){return A.isFixedSizeList(t)&&t.listSize===4&&t.children[0]?.type instanceof rt}function Se(t){return A.isList(t)&&qn(t.children[0]?.type)}function gi(t){return qn(t)||Se(t)}function pi(t){return Se(t)?"vertex-list<unorm8x4>":"unorm8x4"}function mi(t){if(Pi(t.paths.type,"paths"),t.colors&&!gi(t.colors.type))throw new Error("convertArrowPathStorageToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof v))throw new Error("convertArrowPathStorageToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof de))throw new Error("convertArrowPathStorageToGPUVectors closed flags must be Vector<Bool>");if(t.timestamps&&!(A.isList(t.timestamps.type)&&t.timestamps.type.children[0]?.type&&(A.isDate(t.timestamps.type.children[0].type)||A.isTime(t.timestamps.type.children[0].type)||A.isTimestamp(t.timestamps.type.children[0].type)||A.isDuration(t.timestamps.type.children[0].type))))throw new Error("convertArrowPathStorageToGPUVectors timestamps must be Vector<List<Date|Time|Timestamp|Duration>>")}function wi(t){const e=[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]];for(const[n,o]of e)if(o&&o.length!==t.paths.length)throw new Error(`convertArrowPathStorageToGPUVectors ${n} rows must match paths rows (${o.length} !== ${t.paths.length})`);t.colors&&Se(t.colors.type)&&yi(t.paths,t.colors)}function Pi(t,e){const n=Kn(t);if(!Lt(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(n instanceof v)&&!(n instanceof U))throw new Error(`convertArrowPathStorageToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}function yi(t,e){if(t.data.length!==e.data.length)throw new Error("convertArrowPathStorageToGPUVectors vertex color batch count must match paths");for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,r=e.data[n]?.valueOffsets;if(!o||!r||!Si(o,r))throw new Error("convertArrowPathStorageToGPUVectors vertex colors must align with paths")}}function Si(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function Kn(t){const e=t.children[0]?.type;return A.isFixedSizeList(e)?e.children[0]?.type:void 0}async function xi(t,e,n){const o=Kn(e.type);if(o instanceof v)return{paths:M(t,e,{name:"paths",id:`${n.id||"arrow-path-storage-model"}-paths`,format:Ei(e.type),preserveDataChunks:!0})};if(!(o instanceof U))throw new Error("convertArrowPathStorageToGPUVectors paths must contain Float32 or Float64");return ii(t,e,n)}function Ei(t){switch(vi(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("convertArrowPathStorageToGPUVectors paths require 2, 3, or 4 components")}}function vi(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("convertArrowPathStorageToGPUVectors paths require FixedSizeList coordinates");return e.listSize}function Ci(t,e,n={}){return Oa(t,e,n)}function bi(t,e,n={}){return jn(t,e,n)}function Ti(t,e,n={}){if(!e.timestamps)throw new Error("convertArrowTripsToStorage requires a timestamps column");return jn(t,e,n)}class Ut{static async convertToGPUVectors(e,n,o={}){const{model:r="attribute",...a}=o;switch(r){case"storage":return bi(e,n,a);case"trips":return Ti(e,n,a);case"attribute":return Ci(e,n,a)}}static makeModelProps(e,n){return ke(e,n)}static createModel(e,n){switch(n.model){case"storage":{const{model:o,...r}=n;return new X(e,r)}case"trips":{const{model:o,...r}=n;return new ge(e,r)}case"attribute":case void 0:{const{model:o,...r}=n;return new he(e,ke(e,r))}}throw new Error("ArrowPathRenderer received unsupported model")}}const Ai=[199,219,245,255],_i=.0035,Ye="constantPathColor",ze="constantPathWidth",He="constantPathTemporal",Ii=`#version 300 es
precision highp float;

in vec4 vColor;
in float vVisible;
in vec3 vTimeWindow;
out vec4 fragColor;

void main() {
  if (vVisible < 0.5 || vTimeWindow.x < vTimeWindow.y || vTimeWindow.x > vTimeWindow.z) discard;
  fragColor = vColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Oi={attributes:[{name:"segmentStartPositions",location:0,type:"vec4<f32>",stepMode:"instance"},{name:"segmentEndPositions",location:1,type:"vec4<f32>",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"},{name:"segmentStartColors",location:3,type:"u32",stepMode:"instance"},{name:"segmentEndColors",location:4,type:"u32",stepMode:"instance"},{name:"widths",location:5,type:"f32",stepMode:"instance"},{name:"pathViewOrigins",location:6,type:"vec4<f32>",stepMode:"instance"},{name:"currentTime",location:7,type:"f32",stepMode:"instance"},{name:"trailLength",location:8,type:"f32",stepMode:"instance"},{name:"temporalEnabled",location:9,type:"f32",stepMode:"instance"}],bindings:[]},Li=`#version 300 es
precision highp float;
precision highp int;

in vec4 segmentStartPositions;
in vec4 segmentEndPositions;
in uint rowIndices;
in uint segmentStartColors;
in uint segmentEndColors;
in float widths;
in vec4 pathViewOrigins;
in float currentTime;
in float trailLength;
in float temporalEnabled;

out vec4 vColor;
out float vVisible;
out vec3 vTimeWindow;

vec3 encodeDeckPickingColor(int objectIndex) {
  int colorIndex = objectIndex + 1;
  return vec3(
    float(colorIndex % 256),
    float((colorIndex / 256) % 256),
    float((colorIndex / 65536) % 256)
  );
}

vec4 unpackPathColor(uint colorWord) {
  return vec4(
    float(colorWord & 255u),
    float((colorWord >> 8u) & 255u),
    float((colorWord >> 16u) & 255u),
    float((colorWord >> 24u) & 255u)
  ) / 255.0;
}

vec2 getTriangleCorner(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, -1.0);
  if (vertexIndex == 1) return vec2(1.0, -1.0);
  if (vertexIndex == 2) return vec2(1.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, -1.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  return vec2(0.0, 1.0);
}

void main() {
  vec2 corner = getTriangleCorner(gl_VertexID % 6);
  vec4 startPosition = pathViewOrigins + segmentStartPositions;
  vec4 endPosition = pathViewOrigins + segmentEndPositions;
  vec2 direction = normalize(endPosition.xy - startPosition.xy);
  if (any(isnan(direction))) direction = vec2(1.0, 0.0);
  vec2 normal = vec2(-direction.y, direction.x);
  vec4 pathPosition = mix(startPosition, endPosition, corner.x);
  pathPosition.xy += normal * corner.y * widths;
  gl_Position = project_position_to_clipspace(pathPosition.xyz, vec3(0.0), vec3(0.0));
  float startMeasure = segmentStartPositions.w + pathViewOrigins.w;
  float endMeasure = segmentEndPositions.w + pathViewOrigins.w;
  vVisible = temporalEnabled < 0.5 ||
    (endMeasure >= currentTime - trailLength && startMeasure <= currentTime) ? 1.0 : 0.0;
  vTimeWindow = vec3(
    mix(startMeasure, endMeasure, corner.x),
    temporalEnabled < 0.5 ? -1e30 : currentTime - trailLength,
    temporalEnabled < 0.5 ? 1e30 : currentTime
  );
  geometry.position = gl_Position;
  geometry.pickingColor = encodeDeckPickingColor(int(rowIndices));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vColor = mix(
    unpackPathColor(segmentStartColors),
    unpackPathColor(segmentEndColors),
    corner.x
  );
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Ri=`
${gn}

struct PathVertexInputs {
  @location(0) segmentStartPositions: vec4<f32>,
  @location(1) segmentEndPositions: vec4<f32>,
  @location(2) rowIndices: u32,
  @location(3) segmentStartColors: u32,
  @location(4) segmentEndColors: u32,
  @location(5) widths: f32,
  @location(6) pathViewOrigins: vec4<f32>,
  @location(7) currentTime: f32,
  @location(8) trailLength: f32,
  @location(9) temporalEnabled: f32,
};

struct PathVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) @interpolate(flat) visible: f32,
  @location(3) timeWindow: vec3<f32>,
};

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn getTriangleCorner(vertexIndex: u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

@vertex
fn vertexMain(inputs: PathVertexInputs, @builtin(vertex_index) vertexIndex: u32) -> PathVertexOutputs {
  var outputs: PathVertexOutputs;
  let corner = getTriangleCorner(vertexIndex % 6u);
  let startPosition = inputs.pathViewOrigins + inputs.segmentStartPositions;
  let endPosition = inputs.pathViewOrigins + inputs.segmentEndPositions;
  let delta = endPosition.xy - startPosition.xy;
  var direction = vec2<f32>(1.0, 0.0);
  if (length(delta) > 0.000001) {
    direction = normalize(delta);
  }
  let normal = vec2<f32>(-direction.y, direction.x);
  var pathPosition = mix(startPosition, endPosition, corner.x);
  pathPosition.x += normal.x * corner.y * inputs.widths;
  pathPosition.y += normal.y * corner.y * inputs.widths;
  outputs.position = deck_projectPosition(pathPosition.xyz);
  outputs.color = mix(
    unpackPathColor(inputs.segmentStartColors),
    unpackPathColor(inputs.segmentEndColors),
    corner.x
  );
  outputs.pickingColor = deck_encodePickingColor(inputs.rowIndices);
  let startMeasure = inputs.segmentStartPositions.w + inputs.pathViewOrigins.w;
  let endMeasure = inputs.segmentEndPositions.w + inputs.pathViewOrigins.w;
  outputs.visible = select(
    0.0,
    1.0,
    inputs.temporalEnabled < 0.5 ||
      (endMeasure >= inputs.currentTime - inputs.trailLength && startMeasure <= inputs.currentTime)
  );
  outputs.timeWindow = vec3<f32>(
    mix(startMeasure, endMeasure, corner.x),
    select(inputs.currentTime - inputs.trailLength, -1e30, inputs.temporalEnabled < 0.5),
    select(inputs.currentTime, 1e30, inputs.temporalEnabled < 0.5)
  );
  return outputs;
}

@fragment
fn fragmentMain(inputs: PathVertexOutputs) -> @location(0) vec4<f32> {
  if (inputs.visible < 0.5 || inputs.timeWindow.x < inputs.timeWindow.y || inputs.timeWindow.x > inputs.timeWindow.z) { discard; }
  return deck_filterColor(inputs.color, inputs.pickingColor);
}
`,Bi={attributes:[{name:"segmentStartPointIndices",location:0,type:"u32",stepMode:"instance"},{name:"segmentFlags",location:1,type:"u32",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"},{name:"currentTime",location:3,type:"f32",stepMode:"instance"},{name:"trailLength",location:4,type:"f32",stepMode:"instance"},{name:"temporalEnabled",location:5,type:"f32",stepMode:"instance"},{name:"fadeTrail",location:6,type:"f32",stepMode:"instance"}],bindings:[]},Di=`
${gn}

@group(0) @binding(auto) var<storage, read> pathValues: array<f32>;
@group(0) @binding(auto) var<storage, read> pathRanges: array<vec4<u32>>;
@group(0) @binding(auto) var<storage, read> pathViewOrigins: array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> pathRowColors: array<u32>;
@group(0) @binding(auto) var<storage, read> pathVertexColors: array<u32>;
@group(0) @binding(auto) var<storage, read> pathRowWidths: array<f32>;
@group(0) @binding(auto) var<storage, read> pathTimestamps: array<f32>;

struct PathStorageStyleConfig {
  constantColor: vec4<f32>,
  constantWidth: f32,
  useRowColors: u32,
  useRowWidths: u32,
  batchRowIndexBase: u32,
  pathComponentCount: u32,
  useViewOrigins: u32,
  useVertexColors: u32,
  _padding1: u32,
};

@group(0) @binding(auto) var<uniform> pathStorageStyleConfig: PathStorageStyleConfig;

struct PathStorageVertexInputs {
  @location(0) segmentStartPointIndex: u32,
  @location(1) segmentFlags: u32,
  @location(2) rowIndex: u32,
  @location(3) currentTime: f32,
  @location(4) trailLength: f32,
  @location(5) temporalEnabled: f32,
  @location(6) fadeTrail: f32,
};

struct PathStorageVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) @interpolate(flat) visible: f32,
  @location(3) timeWindow: vec3<f32>,
  @location(4) @interpolate(flat) fadeTrail: f32,
};

fn unpackStoragePathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn readStoragePathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) { return 0.0; }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readStoragePathPoint(pointIndex: u32) -> vec4<f32> {
  return vec4<f32>(
    readStoragePathComponent(pointIndex, 0u),
    readStoragePathComponent(pointIndex, 1u),
    readStoragePathComponent(pointIndex, 2u),
    readStoragePathComponent(pointIndex, 3u)
  );
}

fn readStoragePathViewOrigin(rowIndex: u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) { return vec4<f32>(0.0); }
  return pathViewOrigins[rowIndex];
}

fn getStoragePathCorner(vertexIndex: u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

@vertex
fn vertexMain(
  inputs: PathStorageVertexInputs,
  @builtin(vertex_index) vertexIndex: u32
) -> PathStorageVertexOutputs {
  let localRowIndex = inputs.rowIndex - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = pathRanges[localRowIndex];
  let segmentEndPointIndex = min(inputs.segmentStartPointIndex + 1u, pathRange.y - 1u);
  let viewOrigin = readStoragePathViewOrigin(localRowIndex);
  let startPosition = readStoragePathPoint(inputs.segmentStartPointIndex) + viewOrigin;
  let endPosition = readStoragePathPoint(segmentEndPointIndex) + viewOrigin;
  let delta = endPosition.xy - startPosition.xy;
  var direction = vec2<f32>(1.0, 0.0);
  if (length(delta) > 0.000001) { direction = normalize(delta); }
  let normal = vec2<f32>(-direction.y, direction.x);
  let corner = getStoragePathCorner(vertexIndex % 6u);
  let pathWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[localRowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  var pathPosition = mix(startPosition, endPosition, corner.x);
  pathPosition.x += normal.x * corner.y * pathWidth;
  pathPosition.y += normal.y * corner.y * pathWidth;

  var outputs: PathStorageVertexOutputs;
  outputs.position = deck_projectPosition(pathPosition.xyz);
  outputs.color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    outputs.color = mix(
      unpackStoragePathColor(pathVertexColors[inputs.segmentStartPointIndex]),
      unpackStoragePathColor(pathVertexColors[segmentEndPointIndex]),
      corner.x
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackStoragePathColor(pathRowColors[localRowIndex]);
  }
  outputs.pickingColor = deck_encodePickingColor(inputs.rowIndex);
  let usesTimestampColumn = inputs.temporalEnabled > 1.5;
  let startMeasure = select(
    startPosition.w,
    pathTimestamps[inputs.segmentStartPointIndex],
    usesTimestampColumn
  );
  let endMeasure = select(
    endPosition.w,
    pathTimestamps[segmentEndPointIndex],
    usesTimestampColumn
  );
  outputs.visible = select(
    0.0,
    1.0,
    inputs.temporalEnabled < 0.5 ||
      (endMeasure >= inputs.currentTime - inputs.trailLength && startMeasure <= inputs.currentTime)
  );
  outputs.timeWindow = vec3<f32>(
    mix(startMeasure, endMeasure, corner.x),
    select(inputs.currentTime - inputs.trailLength, -1e30, inputs.temporalEnabled < 0.5),
    select(inputs.currentTime, 1e30, inputs.temporalEnabled < 0.5)
  );
  outputs.fadeTrail = select(0.0, 1.0, usesTimestampColumn && inputs.fadeTrail > 0.5);
  return outputs;
}

@fragment
fn fragmentMain(inputs: PathStorageVertexOutputs) -> @location(0) vec4<f32> {
  if (inputs.visible < 0.5 || inputs.timeWindow.x < inputs.timeWindow.y || inputs.timeWindow.x > inputs.timeWindow.z) { discard; }
  var color = inputs.color;
  color.a *= select(
    1.0,
    clamp((inputs.timeWindow.x - inputs.timeWindow.y) / max(inputs.timeWindow.z - inputs.timeWindow.y, 0.000001), 0.0, 1.0),
    inputs.fadeTrail > 0.5
  );
  return deck_filterColor(color, inputs.pickingColor);
}
`,_t=class _t extends ln{getAttributeManager(){return null}setShaderModuleProps(e){super.setShaderModuleProps(this.context.device.type==="webgpu"?{layer:e.layer,picking:e.picking}:{layer:e.layer,project:e.project,picking:e.picking})}initializeState(){this.setState({batches:[],loadVersion:0,sourceInitialized:!1,gpuVectorSourceCache:new Map})}updateState({props:e,oldProps:n,changeFlags:o}){const r=this.getLayerState(),a=!r.sourceInitialized||o.dataChanged||e.paths!==n.paths||e.model!==n.model||e.colors!==n.colors||e.widths!==n.widths,i=e.timestamps!==n.timestamps;if(a||i){r.sourceInitialized=!0,this.loadSource(e);return}if(e.currentTime!==n.currentTime||e.trailLength!==n.trailLength||e.temporalEnabled!==n.temporalEnabled||e.fadeTrail!==n.fadeTrail){for(const s of r.batches)Fi(s,e);this.setNeedsRedraw()}}getModels(){return this.state?.batches.map(e=>e.model)??[]}draw({renderPass:e,context:n}){for(const{model:o}of this.getLayerState().batches)o.device.type==="webgpu"&&xo(o,n.viewport),o.draw(e)}getPickingInfo({info:e}){const n=e,o=n.index,r=this.getLayerState().batches.find(a=>o>=a.rowIndexOffset&&o<a.rowIndexOffset+a.rowCount);return r&&(n.arrow={rowIndex:o,batchIndex:r.batchIndex,batchRowIndex:o-r.rowIndexOffset}),n}finalizeState(e){const n=this.getLayerState();n.cancelLoad?.(),n.loadVersion++,Xe(n.batches),this.setState({batches:[],loadVersion:n.loadVersion,sourceInitialized:!0,gpuVectorSourceCache:new Map}),super.finalizeState(e)}async loadSource(e){const n=this.getLayerState();n.cancelLoad?.();const o=n.loadVersion+1;n.loadVersion=o;const r=n.batches;this.setState({batches:[],loadVersion:o,sourceInitialized:!0}),Xe(r),this.setNeedsRedraw();try{e.data?await this.loadRecordBatchSource(e,e.data,o):e.paths&&typeof e.paths!="string"&&await this.appendSourceBatch(e,void 0,0,0,o)}catch(a){this.isActiveLoad(o)&&(e.onDataError?e.onDataError(a):this.raiseError(ki(a),`loading Arrow data in ${this}`))}}async loadRecordBatchSource(e,n,o){if(!this.isActiveLoad(o))return;const r=Eo(n);let a;const i=()=>(a??=(async()=>{await r.return?.()})(),a);let s;const c=new Promise(h=>{s=()=>h({done:!0,value:void 0})}),u=()=>{s(),i().catch(()=>{})},l=this.getLayerState();l.cancelLoad=u;let d=0,f=0;try{for(;this.isActiveLoad(o);){const h=await Promise.race([r.next(),c]);if(h.done||!this.isActiveLoad(o))return;await this.appendSourceBatch(e,h.value,d,f,o),f+=h.value.numRows,d++}}finally{l.cancelLoad===u&&(l.cancelLoad=void 0),await i()}}async appendSourceBatch(e,n,o,r,a){const i=Ui(this.context.device,e.model),s=Te(e.colors,Ie),c=Te(e.widths,Oe),u=Ae(e.colors,Ai,Ie),l=Ae(e.widths,_i,Oe),d=this.resolveNamedBatchStyleSource(s,n,"color",u),f=this.resolveNamedBatchStyleSource(c,n,"width",l);G(d)&&vo("ArrowPathLayer color",d),G(f)&&Co("ArrowPathLayer width",f,["float32"]);const h=i==="storage"&&G(d)?void 0:await this.resolvePathStyleSource(d,r,n?.numRows,!0),g=i==="storage"&&G(f)?void 0:await this.resolvePathStyleSource(f,r,n?.numRows,!1);let m=ko(i==="storage"?X:he,{data:n,selectors:{paths:e.paths,colors:h??null,widths:g??null,...i==="storage"&&e.timestamps!==void 0?{timestamps:e.timestamps}:{}}});m.colors&&!A.isList(m.colors.type)&&(m={...m,colors:await bo(this.context.device,m.colors,`${e.id}-batch-${o}-arrow-colors`)}),m=Mi(m,u,l);const p=await Ut.convertToGPUVectors(this.context.device,m,{model:i,id:`${e.id}-batch-${o}`,rowIndexBase:r});if(!this.isActiveLoad(a)){p.destroy();return}let y=null,x=p.colors;if(i==="storage"&&G(d)){try{const L=Ke(d,o,m.paths.length),R=await To(this.context.device,L,`${e.id}-batch-${o}-colors`);x=R.vector,y=R.converted?R.vector:null}catch(L){throw p.destroy(),L}if(!this.isActiveLoad(a)){y?.destroy(),p.destroy();return}}const S=i==="storage"&&G(f)?Ke(f,o,m.paths.length):p.widths,C=x??new be({format:"unorm8x4",value:new Uint8Array(u)}),b=S??new be({format:"float32",value:new Float32Array([l])}),P=Ni(this.context.device,{id:`${e.id}-batch-${o}`,hasColors:i==="storage"||!!m.colors,hasWidths:i==="storage"||!!m.widths,color:u,width:l,currentTime:e.currentTime??0,trailLength:e.trailLength??0,temporalEnabled:e.temporalEnabled??!1,timestampColumnEnabled:!!m.timestamps,fadeTrail:e.fadeTrail??!1});let E;try{i==="storage"?E=Ut.createModel(this.context.device,{...p,model:"storage",id:`${e.id}-batch-${o}`,...this.getShaders({modules:[_e,mt],source:Di}),shaderLayout:Bi,bufferLayout:P.bufferLayout,attributes:P.attributes,bindings:{pathTimestamps:P.defaultTimestampBuffer},...C instanceof F?{colors:C}:{color:u},...b instanceof F?{widths:b}:{width:l},topology:"triangle-list",vertexCount:6}):E=Ut.createModel(this.context.device,{...p,model:"attribute",id:`${e.id}-batch-${o}`,...this.getShaders(this.context.device.type==="webgpu"?{modules:[_e,mt],source:Ri}:{modules:[yn,mt],vs:Li,fs:Ii}),shaderLayout:Oi,...C instanceof F?{colors:C}:{},...b instanceof F?{widths:b}:{},bufferLayout:P.bufferLayout,attributes:P.attributes,constantAttributes:P.constantAttributes,topology:"triangle-list",vertexCount:6})}catch(L){throw te(P.buffers),y?.destroy(),p.destroy(),L}if(!this.isActiveLoad(a)){E.destroy(),te(P.buffers),y?.destroy(),p.destroy();return}const T=m.paths.length,z={model:E,prepared:p,constantBuffers:P.buffers,batchIndex:o,rowIndexOffset:r,rowCount:T,temporalBuffer:P.temporalBuffer,timestampColumnEnabled:!!m.timestamps,convertedColorVector:y},I=[...this.getLayerState().batches,z];this.setState({batches:I,loadVersion:a,sourceInitialized:!0}),this.setNeedsRedraw(),Ao(E,()=>{this.isActiveLoad(a)&&this.setNeedsRedraw()},L=>{this.isActiveLoad(a)&&(e.onDataError?e.onDataError(L):this.raiseError(L,`linking Arrow shaders in ${this}`))}),e.onDataBatch?.({loadedBatchCount:I.length,isFirstBatch:o===0,batchIndex:o,rowIndexOffset:r,rowCount:T})}isActiveLoad(e){return this.getLayerState().loadVersion===e}async resolvePathStyleSource(e,n,o,r){if(!G(e))return e;const a=this.getLayerState().gpuVectorSourceCache;let i=a.get(e);i||(i=_o(this.context.device,e,`${this.id}-${r?"colors":"values"}`,r),a.set(e,i));const s=await i;return o===void 0?s:s.slice(n,n+o)}resolveNamedBatchStyleSource(e,n,o,r){if(typeof e!="string"||Io(n,e))return e;so.warn(`${this.id}: ArrowPathLayer ${o} column "${e}" is missing; using ${o} default ${JSON.stringify(r)}`)()}getLayerState(){return this.state}};_t.layerName="ArrowPathRendererLayer",_t.defaultProps={data:{type:"object",value:null,optional:!0},parameters:So};let j=_t;function Mi(t,e,n){const o=t.colors,r=t.widths;return{...t,...o&&qe(o)?{colors:Vi(t.paths,o,e)}:{},...r&&qe(r)?{widths:mn(Array.from({length:r.length},(a,i)=>r.get(i)??n),r.type)}:{}}}function Vi(t,e,n){const o=Array.from({length:e.length},(r,a)=>{const i=e.get(a);if(A.isList(e.type)){const s=t.get(a),c=s?Array.from(s).length:0;return i?Array.from(i,u=>je(u,n)):Array.from({length:c},()=>n)}return je(i,n)});return mn(o,e.type)}function je(t,e){if(!t||typeof t!="object"||!(Symbol.iterator in t))return e;const n=Array.from(t);return[n[0]??e[0],n[1]??e[1],n[2]??e[2],n[3]??e[3]]}function qe(t){return t.data.some(e=>Xn(e))}function Xn(t){return t.nullCount>0||t.children.some(Xn)}function Ke(t,e,n){const o=t.data.length===1&&e===0&&t.length===n,r=o?t.data[0]:t.data[e];if(!r||r.length!==n)throw new Error(`ArrowPathLayer GPUVector "${t.name}" batch ${e} rows must match paths rows`);return o?t:new F({type:"data",name:`${t.name}-batch-${e}`,format:t.format,data:[r],ownsData:!1})}function Ni(t,{id:e,hasColors:n,hasWidths:o,color:r,width:a,currentTime:i,trailLength:s,temporalEnabled:c,timestampColumnEnabled:u,fadeTrail:l}){const d=[],f={},h={},g=[];let m=null,p=null;if(!n){const x=new Uint32Array([Gi(r),0,0,0]);if(d.push({name:Ye,byteStride:0,stepMode:"instance",attributes:[{attribute:"segmentStartColors",format:"uint32",byteOffset:0},{attribute:"segmentEndColors",format:"uint32",byteOffset:0}]}),t.type==="webgl")h.segmentStartColors=x,h.segmentEndColors=x;else{const S=t.createBuffer({id:`${e}-constant-color`,data:x});f[Ye]=S,g.push(S)}}if(!o){const x=new Float32Array([a]);if(d.push({name:ze,byteStride:0,stepMode:"instance",attributes:[{attribute:"widths",format:"float32",byteOffset:0}]}),t.type==="webgl")h.widths=x;else{const S=t.createBuffer({id:`${e}-constant-width`,data:x});f[ze]=S,g.push(S)}}const y=Jn({currentTime:i,trailLength:s,temporalEnabled:c,timestampColumnEnabled:u,fadeTrail:l});return d.push({name:He,byteStride:0,stepMode:"instance",attributes:[{attribute:"currentTime",format:"float32",byteOffset:0},{attribute:"trailLength",format:"float32",byteOffset:4},{attribute:"temporalEnabled",format:"float32",byteOffset:8},{attribute:"fadeTrail",format:"float32",byteOffset:12}]}),t.type==="webgl"?(h.currentTime=y.subarray(0,1),h.trailLength=y.subarray(1,2),h.temporalEnabled=y.subarray(2,3),h.fadeTrail=y.subarray(3,4)):(m=t.createBuffer({id:`${e}-constant-temporal`,data:y}),f[He]=m,g.push(m),p=t.createBuffer({id:`${e}-default-timestamp`,data:new Float32Array([0]),usage:w.STORAGE}),g.push(p)),{bufferLayout:d,attributes:f,constantAttributes:h,buffers:g,temporalBuffer:m,defaultTimestampBuffer:p}}function Fi(t,e){const n=Jn({currentTime:e.currentTime??0,trailLength:e.trailLength??0,temporalEnabled:e.temporalEnabled??!1,timestampColumnEnabled:t.timestampColumnEnabled,fadeTrail:e.fadeTrail??!1});t.model.device.type==="webgl"?t.model.setConstantAttributes({currentTime:n.subarray(0,1),trailLength:n.subarray(1,2),temporalEnabled:n.subarray(2,3),fadeTrail:n.subarray(3,4)}):t.temporalBuffer?.write(n)}function Jn({currentTime:t,trailLength:e,temporalEnabled:n,timestampColumnEnabled:o,fadeTrail:r}){const a=o?2:n?1:0;return new Float32Array([t,e,a,r?1:0])}function Ui(t,e="auto"){if(e==="storage"&&t.type!=="webgpu")throw new Error("ArrowPathLayer storage rendering requires WebGPU");return e==="auto"?t.type==="webgpu"?"storage":"attribute":e}function Gi(t){const[e,n,o,r]=t.map(a=>Math.max(0,Math.min(255,Math.round(a))));return(e|n<<8|o<<16|r<<24)>>>0}function te(t){for(const e of t)e.destroy()}function Xe(t){for(const e of t)e.model.destroy(),te(e.constantBuffers),e.convertedColorVector?.destroy(),e.prepared.destroy()}function ki(t){return t instanceof Error?t:new Error(String(t))}function $i(t,e){let n=0;for(const[o,r]of t.data.entries()){if(e<n+r.length)return{rowIndex:e,batchIndex:o,batchRowIndex:e-n};n+=r.length}return{rowIndex:e,batchIndex:-1,batchRowIndex:-1}}const It=class It extends un{renderLayers(){const{paths:e,colors:n,widths:o,...r}=this.props;return xt(e)?new ne({...r,...this.getSubLayerProps({id:"storage"}),paths:e,colors:n,widths:o}):new j({...r,...this.getSubLayerProps({id:"arrow"}),parameters:{...j.defaultProps.parameters,...this.props.parameters},paths:e,colors:n,widths:o})}getModels(){return this.getSubLayers().flatMap(e=>e.getModels())}};It.layerName="StoragePathLayer",It.defaultProps={data:j.defaultProps.data};let ee=It;const Wi={attributes:[{name:"segmentStartPointIndices",location:0,type:"u32",stepMode:"instance"},{name:"segmentFlags",location:1,type:"u32",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"}],bindings:[]},Yi=`
@group(0) @binding(auto) var<storage, read> pathValues: array<f32>;
@group(0) @binding(auto) var<storage, read> pathRanges: array<vec4<u32>>;
@group(0) @binding(auto) var<storage, read> pathViewOrigins: array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> pathRowColors: array<u32>;
@group(0) @binding(auto) var<storage, read> pathVertexColors: array<u32>;
@group(0) @binding(auto) var<storage, read> pathRowWidths: array<f32>;
@group(0) @binding(auto) var<storage, read> pathTimestamps: array<f32>;

struct PathStorageStyleConfig {
  constantColor: vec4<f32>,
  constantWidth: f32,
  useRowColors: u32,
  useRowWidths: u32,
  batchRowIndexBase: u32,
  pathComponentCount: u32,
  useViewOrigins: u32,
  useVertexColors: u32,
  _padding1: u32,
};
@group(0) @binding(auto) var<uniform> pathStorageStyleConfig: PathStorageStyleConfig;

struct PathLayerStyle {
  currentTime: f32,
  trailLength: f32,
  temporalMode: u32,
  fadeTrail: u32,
};
@group(0) @binding(auto) var<uniform> pathLayerStyle: PathLayerStyle;

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) { return 0.0; }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readPathPoint(pointIndex: u32) -> vec4<f32> {
  return vec4<f32>(
    readPathComponent(pointIndex, 0u),
    readPathComponent(pointIndex, 1u),
    readPathComponent(pointIndex, 2u),
    readPathComponent(pointIndex, 3u)
  );
}

@vertex fn vertexMain(
  @location(0) start: u32,
  @location(1) flags: u32,
  @location(2) rowIndex: u32,
  @builtin(vertex_index) vertexIndex: u32
) -> Varyings
`,zi=`
  let corners = array(vec2<f32>(0, 0), vec2<f32>(0, -1), vec2<f32>(0, 1),
                      vec2<f32>(1, -1), vec2<f32>(1, 1), vec2<f32>(1, 0));
  let indices = array(0u, 1u, 2u, 1u, 4u, 2u, 1u, 3u, 4u, 3u, 5u, 4u);
  let corner = corners[indices[vertexIndex]];
  let row = rowIndex - pathStorageStyleConfig.batchRowIndexBase;
  let range = pathRanges[row];
  let first = range.x;
  let last = range.y - 1u;
  let end = min(start + 1u, last);
  let closed = last > first + 2u && all(readPathPoint(first).xyz == readPathPoint(last).xyz);
  let left = select(max(start, first + 1u) - 1u, last - 1u, start == first && closed);
  let right = select(min(end + 1u, last), first + 1u, end == last && closed);
  let segmentType = select(0.0, 1.0, start == first && !closed) +
                    select(0.0, 2.0, end == last && !closed);
  let origin = select(vec4<f32>(0.0), pathViewOrigins[row], pathStorageStyleConfig.useViewOrigins != 0u);
  let startPoint = readPathPoint(start) + origin;
  let endPoint = readPathPoint(end) + origin;
  let width = select(pathStorageStyleConfig.constantWidth, pathRowWidths[row], pathStorageStyleConfig.useRowWidths != 0u);
  var strokeColor = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    strokeColor = unpackPathColor(pathVertexColors[select(start, end, corner.x > 0.0)]);
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    strokeColor = unpackPathColor(pathRowColors[row]);
  }
  let zero = vec3<f32>(0.0);
  let attributes = Attributes(
    corner, segmentType, (readPathPoint(left) + origin).xyz, startPoint.xyz,
    endPoint.xyz, (readPathPoint(right) + origin).xyz, zero, zero, zero, zero,
    width, strokeColor, rowIndex
  );
`,Hi=`
  varyings.pathPickingColor = picking_getPickingColorFromIndex(rowIndex);
  let timestamp = pathLayerStyle.temporalMode == 2u;
  varyings.measure = select(
    mix(startPoint.w, endPoint.w, corner.x),
    pathTimestamps[select(start, end, corner.x > 0.0)],
    timestamp
  );
`,ji=Sn({vertexEntry:Yi,vertexSetup:zi,vertexOutput:Hi,extraVaryings:"@location(9) measure: f32, @location(10) @interpolate(flat) pathPickingColor: vec3<f32>,",fragmentFilter:`
    let trailStart = pathLayerStyle.currentTime - pathLayerStyle.trailLength;
    if (pathLayerStyle.temporalMode != 0u &&
        (varyings.measure < trailStart || varyings.measure > pathLayerStyle.currentTime)) { discard; }
    if (picking.isActive > 0.5) {
      if (!picking_isColorValid(varyings.pathPickingColor)) { discard; }
      return vec4<f32>(varyings.pathPickingColor, 1.0);
    }
  `,colorFilter:`
    if (pathLayerStyle.temporalMode == 2u && pathLayerStyle.fadeTrail != 0u) {
      color.a *= clamp((varyings.measure - trailStart) / max(pathLayerStyle.trailLength, 0.000001), 0.0, 1.0);
    }
  `}),ve=class ve extends ln{getAttributeManager(){return null}initializeState({device:e}){if(e.type!=="webgpu")throw new Error("StoragePathLayer requires WebGPU");this.setState({model:null,temporalBuffer:null,defaultTimestampBuffer:null}),this.createModel()}updateState({props:e}){const n=this.state.model?.userData.boundInputs??[];(e.paths!==n[0]||e.colors!==n[1]||e.widths!==n[2]||e.timestamps!==n[3]||e.viewOrigins!==n[4]||!!e.antialiasing!==n[5])&&(this.destroyModel(),this.createModel())}getModels(){const e=this.state?.model;return e?[e]:[]}draw({renderPass:e}){const{model:n,temporalBuffer:o}=this.state;if(!n||!o)return;const r=new ArrayBuffer(16),a=new Float32Array(r),i=new Uint32Array(r);a.set([this.props.currentTime??0,this.props.trailLength??0]),i.set([this.props.timestamps?2:this.props.currentTime!==void 0?1:0,this.props.fadeTrail?1:0],2),n.shaderInputs.setProps({path:{widthScale:this.props.widthScale??1,widthMinPixels:this.props.widthMinPixels??0,widthMaxPixels:this.props.widthMaxPixels??Number.MAX_SAFE_INTEGER,miterLimit:this.props.miterLimit??4,widthUnits:co[this.props.widthUnits??"pixels"],jointType:+!!this.props.jointRounded,capType:+!!this.props.capRounded,billboard:this.props.billboard??!0}}),o.write(new Uint8Array(r)),n.draw(e)}getPickingInfo({info:e}){const n=e;return n.gpuVector=$i(this.props.paths,n.index),n}finalizeState(e){this.destroyModel(),super.finalizeState(e)}createModel(){const{device:e}=this.context,n=e.createBuffer({id:`${this.id}-temporal-style`,byteLength:16,usage:w.UNIFORM|w.COPY_DST}),o=e.createBuffer({id:`${this.id}-default-timestamp`,data:new Float32Array([0]),usage:w.STORAGE|w.COPY_DST}),r=xt(this.props.colors)?void 0:qi(this.props.colors??[0,0,0,255]),a=new X(e,{...this.getShaders({modules:[yn,No,mt,Go],plugins:[Fo],defines:this.props.antialiasing?{ANTIALIASING:1}:{},source:ji}),id:`${this.id}-model`,shaderLayout:Wi,paths:this.props.paths,...xt(this.props.colors)?{colors:this.props.colors}:{color:r},...xt(this.props.widths)?{widths:this.props.widths}:{width:typeof this.props.widths=="number"?this.props.widths:1},...this.props.timestamps?{timestamps:this.props.timestamps}:{},...this.props.viewOrigins?{viewOrigins:this.props.viewOrigins}:{},bindings:{pathLayerStyle:n,pathTimestamps:o},topology:"triangle-list",vertexCount:12});a.userData.boundInputs=[this.props.paths,this.props.colors,this.props.widths,this.props.timestamps,this.props.viewOrigins,!!this.props.antialiasing],this.setState({model:a,temporalBuffer:n,defaultTimestampBuffer:o})}destroyModel(){const e=this.state;e.model?.destroy(),e.temporalBuffer?.destroy(),e.defaultTimestampBuffer?.destroy(),this.setState({model:null,temporalBuffer:null,defaultTimestampBuffer:null})}};ve.layerName="PreparedPathLayer";let ne=ve;function qi(t){return[t[0],t[1],t[2],t[3]??255]}function xt(t){return!!(t&&typeof t=="object"&&"data"in t&&"format"in t)}const Ot=class Ot extends un{renderLayers(){return new ee({...this.props,...this.getSubLayerProps({id:"path"})})}getModels(){return this.getSubLayers().flatMap(e=>e.getModels())}};Ot.layerName="ArrowPathLayer",Ot.defaultProps=j.defaultProps;let oe=Ot;const Ki=1700000000000n,Zn=1e3,re=1.48,Xi=220,Ji=10,Zi=1e3,Qi=240,Je=12,Ze=13,Qe=15,tn=3,en=6,ts=24,ae={240:{pathCount:240,pointCount:18,label:"240 paths, 4.1K segments"},960:{pathCount:960,pointCount:22,label:"960 paths, 20K segments"},2400:{pathCount:2400,pointCount:26,label:"2.4K paths, 60K segments"}};function es(t,e,n,o,r,a=null){const i=nn(),s=n,c=o,u=r,l=c!=="vertex-colors"&&u!=="timestamps",d=as(t.pathCount,t.pointCount,e,s,l,a),f=u==="timestamps"?hs(t.pathCount,t.pointCount,a):void 0,h=c==="none"?void 0:c==="vertex-colors"?fs(t.pathCount,t.pointCount,a):gs(t.pathCount,a),g=ps(t.pathCount,a),m=nn()-i,p=dt(d)+(f?dt(f):0),y=(h?dt(h):0)+dt(g);return{sourceVectors:{paths:d,...h?{colors:h}:{},widths:g,...f?{timestamps:f}:{}},pathArrowByteLength:p,styleArrowByteLength:y,arrowVectorBuildTimeMs:m}}function ns(t){return new W(t.sourceVectors).batches}async function*os(t){for(let e=0;e<t.length;e++){e>0&&await rs();const n=t[e];n&&(yield n)}}function rs(){return new Promise(t=>{setTimeout(t,Zi)})}function as(t,e,n,o,r,a=null){if(o==="dense-union")return n==="polygons"?ss(t,a):is(t,e,r,a);const i=o==="float64"?new U:new v,s=[];return Y(t,a,(c,u)=>{s.push(ie(ds(c,u),t,e,i,4))}),new D(s)}function is(t,e,n,o=null){const r=[];return Y(t,o,(a,i)=>{const s=new Int8Array(i),c=new Int32Array(i),u=[],l=[],d=[];for(let p=0;p<i;p++){const y=a+p,x=n?y%3:y%2;x===0?(s[p]=Je,c[p]=u.length,u.push(y)):x===1?(s[p]=Ze,c[p]=l.length,l.push(y)):(s[p]=Qe,c[p]=d.length,d.push(y))}const f=ie(u,t,e,new v,3),h=ie(l,t,e,new U,4),g=cs(d,t,e,new v,3),m=new wn([Je,Ze,Qe],[new _("LineStringXYM",f.type,!0),new _("LineStringXYZM",h.type,!0),new _("MultiLineStringXYM",g.type,!0)]);r.push(Rt({type:m,length:i,nullCount:0,typeIds:s,valueOffsets:c,children:[f,h,g]}))}),new D(r)}function ss(t,e=null){const n=[];return Y(t,e,(o,r)=>{const a=new Int8Array(r),i=new Int32Array(r),s=[],c=[];for(let f=0;f<r;f++){const h=o+f;h%4===0?(a[f]=en,i[f]=c.length,c.push(h)):(a[f]=tn,i[f]=s.length,s.push(h))}const u=ls(s,t),l=us(c,t),d=new wn([tn,en],[new _("Polygon",u.type,!0),new _("MultiPolygon",l.type,!0)]);n.push(Rt({type:d,length:r,nullCount:0,typeIds:a,valueOffsets:i,children:[u,l]}))}),new D(n)}function cs(t,e,n,o,r){const a=t.length*2,i=new Int32Array(t.length+1),s=new Int32Array(a+1),c=o instanceof U?new Float64Array(a*n*r):new Float32Array(a*n*r);for(let d=0;d<t.length;d++){const f=t[d];i[d]=d*2;for(let h=0;h<2;h++){const g=d*2+h;s[g]=g*n;for(let m=0;m<n;m++){const p=(g*n+m)*r;Qn(c,p,f,e,m,n,r),c[p]=c[p]*.43+(h===0?-.38:.38),c[p+1]+=h===0?-.036:.036}}}i[t.length]=a,s[a]=a*n;const u=xe(o,r,c),l=$(u,s);return $(l,i)}function ls(t,e){const n=new Int32Array(t.length+1),o=new Int32Array(ms(t)+1),r=ws(t),a=new Float32Array(r*2);let i=0,s=0;for(let l=0;l<t.length;l++){const d=t[l];n[l]=i,o[i++]=s,s=se(a,s,d,e,0),Ee(d)&&(o[i++]=s,s=se(a,s,d,e,1))}n[t.length]=i,o[i]=s;const c=xe(new v,2,a),u=$(c,o);return $(u,n)}function us(t,e){const n=new Int32Array(t.length+1),o=new Int32Array(t.length*2+1),r=new Int32Array(Ps(t)+1),a=ys(t),i=new Float32Array(a*2);let s=0,c=0,u=0;for(let h=0;h<t.length;h++){const g=t[h];n[h]=s;for(let m=0;m<2;m++)o[s++]=c,r[c++]=u,u=se(i,u,g+m*17,e,m+2)}n[t.length]=s,o[s]=c,r[c]=u;const l=xe(new v,2,i),d=$(l,r),f=$(d,o);return $(f,n)}function ie(t,e,n,o,r){const a=new q(r,new _("values",o,!1)),i=new K(new _("coordinates",a,!1)),s=new Int32Array(t.length+1),c=o instanceof U?new Float64Array(t.length*n*r):new Float32Array(t.length*n*r);for(let d=0;d<t.length;d++){const f=t[d];s[d]=d*n;for(let h=0;h<n;h++)Qn(c,(d*n+h)*r,f,e,h,n,r)}s[t.length]=t.length*n;const u=new O(o,0,c.length,0,{[B.DATA]:c}),l=new O(a,0,c.length/r,0,{},[u]);return new O(i,0,t.length,0,{[B.OFFSET]:s},[l])}function xe(t,e,n){const o=new O(t,0,n.length,0,{[B.DATA]:n}),r=new q(e,new _("values",t,!1));return new O(r,0,n.length/e,0,{},[o])}function $(t,e){const n=new K(new _("values",t.type,!1));return new O(n,0,e.length-1,0,{[B.OFFSET]:e},[t])}function ds(t,e){const n=[];for(let o=0;o<e;o++)n.push(t+o);return n}function hs(t,e,n=null){const o=new Lo,r=new K(new _("timestamps",o,!1)),a=[];return Y(t,n,(i,s)=>{const c=new Int32Array(s+1),u=new BigInt64Array(s*e);for(let d=0;d<s;d++){const f=i+d;c[d]=d*e;for(let h=0;h<e;h++){const g=d*e+h;u[g]=Ki+BigInt(Math.round(ce(f,h,e)*Zn))}}c[s]=s*e;const l=new O(o,0,u.length,0,{[B.DATA]:u});a.push(new O(r,0,s,0,{[B.OFFSET]:c},[l]))}),new D(a)}function fs(t,e,n=null){const o=new q(4,new _("values",new rt,!1)),r=new K(new _("colors",o,!1)),a=[];return Y(t,n,(i,s)=>{const c=new Int32Array(s+1),u=xs(i,s,e);for(let f=0;f<s;f++)c[f]=f*e;c[s]=s*e;const l=new O(new rt,0,u.length,0,{[B.DATA]:u}),d=new O(o,0,u.length/4,0,{},[l]);a.push(new O(r,0,s,0,{[B.OFFSET]:c},[d]))}),new D(a)}function gs(t,e=null){const n=[];return Y(t,e,(o,r)=>{n.push(k(new rt,4,Es(o,r)).data[0])}),new D(n)}function ps(t,e=null){const n=[];return Y(t,e,(o,r)=>{const a=vs(o,r);n.push(Rt({type:new v,length:a.length,data:a}))}),new D(n)}function Y(t,e,n){const o=e&&e>0&&e<t?e:t;for(let r=0;r<t;r+=o)n(r,Math.min(o,t-r))}function Qn(t,e,n,o,r,a,i){const s=a<=1?0:r/(a-1),u=-.92+(o<=1?0:n/(o-1))*1.84,l=n*.13;if(t[e]=-1.24+s*2.48,t[e+1]=u+Math.sin(s*11.5+l)*.028+Math.cos(s*4.2-l*.55)*.014,i===3){t[e+2]=ce(n,r,a);return}t[e+2]=0,t[e+3]=ce(n,r,a)}function se(t,e,n,o,r){const{x:a,y:i,radius:s,cellWidth:c}=Ss(n,o),u=st(n,r),l=r===1,d=r>=2,f=r%2===0?-1:1,h=a+(d?f*c*.22:0),g=i+(l?s*.1:d?f*s*.16:0),m=s*(l?.38:d?.58:.92),p=-Math.PI/2+ot(n,19+r)*.42,y=.84+ot(n,31+r)*.12,x=.86+ot(n,43+r)*.12;for(let S=0;S<u;S++){const C=l?u-S:S,b=p+C/u*Math.PI*2,P=Math.sin(b*3+n*.17)*.08,E=m*(1+P),T=(e+S)*2;t[T]=h+Math.cos(b)*E*y,t[T+1]=g+Math.sin(b)*E*x}return e+u}function ms(t){return t.reduce((e,n)=>e+(Ee(n)?2:1),0)}function ws(t){return t.reduce((e,n)=>e+st(n,0)+(Ee(n)?st(n,1):0),0)}function Ps(t){return t.length*2}function ys(t){return t.reduce((e,n)=>e+st(n,2)+st(n+17,3),0)}function st(t,e){return e===1?5+t%3:6+(t+e)%5}function Ee(t){return t%5===0}function Ss(t,e){const n=ts,o=Math.ceil(e/n),r=1.86/n,a=1.76/o,i=t%n,s=Math.floor(t/n),c=ot(t,61)*r*.15,u=ot(t,73)*a*.15;return{x:-.93+(i+.5)*r+c,y:.88-(s+.5)*a+u,radius:Math.min(r,a)*.46,cellWidth:r}}function ot(t,e){const n=Math.sin((t+1)*(e+29)*12.9898)*43758.5453;return n-Math.floor(n)-.5}function ce(t,e,n){const o=n<=1?0:e/(n-1),a=.58+t%5*.16,i=Math.floor(t/5)%4*.08;return o*a+i}function xs(t,e,n){const o=new Uint8Array(e*n*4);for(let r=0;r<e;r++){const a=t+r,i=Et(a),s=Et(a+2),c=Et(a+4),u=[42,116,255];for(let l=0;l<n;l++){const d=n<=1?0:l/(n-1),f=l%2===0?i:s,h=l%4===0?c:f,g=Math.min(1,Math.max(0,(d-.18)/.72)),m=l%2===0?72:-28,p=(r*n+l)*4;o[p]=Gt(h[0]*(1-g)+u[0]*g+m),o[p+1]=Gt(h[1]*(1-g)+u[1]*g+m),o[p+2]=Gt(h[2]*(1-g)+u[2]*g+m),o[p+3]=l%2===0?242:202}}return o}function Es(t,e){const n=new Uint8Array(e*4);for(let o=0;o<e;o++){const r=t+o,a=Et(r),i=o*4;n[i]=a[0],n[i+1]=a[1],n[i+2]=a[2],n[i+3]=220}return n}function vs(t,e){return Float32Array.from({length:e},(n,o)=>.0022+(t+o)%7*72e-5)}function Et(t){switch(t%5){case 0:return[72,205,217];case 1:return[255,186,73];case 2:return[255,111,97];case 3:return[120,177,255];default:return[152,221,132]}}function Gt(t){return Math.min(255,Math.max(0,Math.round(t)))}function nn(){return typeof performance>"u"?Date.now():performance.now()}class Cs{state={rowCountKind:"240-stream",coordinateKind:"float32",colorKind:"row-colors",widthKind:"row-widths",timeKind:"none",animate:!0,modelKind:"storage"};panel=null;onDataUpdated;isFinalized=!1;activeUpdate=null;constructor({onDataUpdated:e}){this.onDataUpdated=e}initialize(e){const n=e.type==="webgpu";n||(this.state.modelKind="attribute"),this.panel=new Mo({id:"deck-arrow-paths",description:"Variable-length Arrow paths stream progressively from an async iterable of RecordBatch values while preserving source batch boundaries.",schema:bs(n),initialState:this.state,onSettingsChange:o=>{const r=Object.keys(o).every(a=>a==="animate"||o[a]===this.state[a]);this.state=o,r&&this.activeUpdate?(this.activeUpdate={...this.activeUpdate,animate:o.animate},this.onDataUpdated(this.activeUpdate)):this.emitDataSource()}}),this.panel.initialize(),this.emitDataSource()}finalize(){this.isFinalized||(this.isFinalized=!0,this.panel?.finalize())}emitDataSource(){const e=this.panel;if(!e)return;const n=this.state.rowCountKind==="240-stream"?"240":"2400",o=es(ae[n],"lines",this.state.coordinateKind,this.state.colorKind,this.state.timeKind,Qi),r=ns(o).slice(0,Ji),a=e.beginTableStream(r);this.activeUpdate={asyncIterator:os(r),model:this.state.modelKind,currentTime:this.state.animate?re*.25:re,trailLength:Xi/Zn,temporalEnabled:this.state.timeKind==="xyzm",animate:this.state.animate,colorColumn:this.state.colorKind!=="none",widthColumn:this.state.widthKind!=="constant",layerProps:{onDataBatch:i=>{this.isFinalized||a.setLoadedBatchCount(i.loadedBatchCount)}}},this.onDataUpdated(this.activeUpdate)}}function bs(t){return{title:"Settings",sections:[{id:"data",name:"Data",initiallyCollapsed:!1,settings:[{name:"rowCountKind",label:"Rows",type:"select",persist:"none",options:[{label:ae[240].label,value:"240-stream"},{label:ae[2400].label,value:"2400-stream"}]},{name:"coordinateKind",label:"Coordinates",type:"select",persist:"none",options:[{label:"Float32 XY(ZM)",value:"float32"},{label:"Float64 XY(ZM)",value:"float64"}]},{name:"colorKind",label:"Colors",type:"select",persist:"none",options:[{label:"Constant",value:"none"},{label:"Row colors",value:"row-colors"},{label:"Vertex colors",value:"vertex-colors"}]},{name:"widthKind",label:"Widths",type:"select",persist:"none",options:[{label:"Constant",value:"constant"},{label:"Row widths",value:"row-widths"}]},{name:"timeKind",label:"Time",type:"select",persist:"none",options:[{label:"None",value:"none"},{label:"XYZM coordinate",value:"xyzm"}]},{name:"animate",label:"Animate",type:"boolean",persist:"none"}]},{id:"renderer",name:"Renderer",initiallyCollapsed:!1,settings:[{name:"modelKind",label:"Model",type:"select",persist:"none",options:[...t?[{label:"Storage (WebGPU)",value:"storage"}]:[],{label:"Attribute",value:"attribute"}]}]}]}}const Ts=[199,219,245,235],As={source:"colors",nullValue:[199,219,245,235]},_s={source:"widths",nullValue:.0035};function to(t,e={}){let n=null,o=null,r=0;const a=new Bo({parent:t,...lo(e),views:new ho({id:"main"}),initialViewState:{target:[0,0],zoom:8},controller:!0,getTooltip:Do,layers:[],onLoad:({device:s})=>i.initialize(s),onBeforeRender:({deck:s})=>{const c=n;if(c?.animate&&c.temporalEnabled){const u=performance.now(),l=(u-(o??u))/1e3;o=u,r=(r+l*.24)%re,on(s,c,r)}},onFinalize:()=>i.finalize()}),i=new Cs({onDataUpdated:s=>{s.asyncIterator!==n?.asyncIterator&&(r=s.currentTime),n=s,o=null,on(a,s,r)}});return a}function on(t,e,n){t.setProps({layers:[new oe({id:"arrow-paths",pickable:!0,model:e.model??"auto",data:e.asyncIterator,paths:"paths",colors:e.colorColumn?As:Ts,widths:e.widthColumn?_s:.0035,currentTime:n,trailLength:e.trailLength,temporalEnabled:e.temporalEnabled,...e.layerProps})]})}const At=document.querySelector("#deck-device");At.value=await uo(new URLSearchParams(location.search).get("backend"));let rn=to(void 0,{deviceType:At.value});At.addEventListener("change",()=>{rn.finalize(),rn=to(void 0,{deviceType:At.value})});
