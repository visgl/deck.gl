import{$ as ue,as as Ae,at as ao,au as io,av as so,aw as co,ax as lo,ay as un,az as _e,I as dn,H as uo,a2 as N,K as ho,B as w,Z as fo,ao as U,G as hn,aA as go,am as Le,aq as mt,ar as fn,ap as po,aB as mo,D as wo,E as Po,F as yo}from"./deck-example-device-DiTRJGUk.js";import{O as So}from"./orthographic-view-XebhxcJn.js";import{q as xo,g as Eo,r as Co,v as de,R as vo,x as gn,S as V,j as Rt,T as ct,U as he,k as pn,V as bo,W as To,X as mn,Y as Ao,D as _o,z as Lo,Z as Oo,C as Oe,H as Ie,I as k,L as Io,_ as Ro,J as Bo,$ as Do,N as wn,O as Re,P as Mo,M as Vo,a0 as No,F as Be,a1 as De,u as dt}from"./arrow-example-panels-Cah-djRw.js";import{T as Y,a1 as M,E as fe,Y as _,s as T,$ as R,ab as D,S as Pn,F as G,f as q,a as L,L as K,w as ht,y as rt,Z as Fo,_ as Bt,v as yn,k as Uo,b as Sn}from"./recordbatch-S1BoZKEa.js";import{p as xn,m as $,a as Go}from"./arrow-shader-layout-Dsu0y7Hk.js";import{g as ko}from"./arrow-layer-tooltip-D-4Wl9xx.js";import{D as $o}from"./arrow-example-source-panel-BCwhi5bF.js";import"./arrow-column-utils-BuR7d7zi.js";const Wo=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,Yo={name:"color",dependencies:[],source:Wo,getUniforms:t=>({})},zo="compositeLayer.renderLayers",be=class be extends ue{get isComposite(){return!0}get isDrawable(){return!1}get isLoaded(){return super.isLoaded&&this.getSubLayers().every(e=>e.isLoaded)}getSubLayers(){return this.internalState&&this.internalState.subLayers||[]}initializeState(e){}setState(e){super.setState(e),this.setNeedsUpdate()}getPickingInfo({info:e}){const{object:n}=e;return n&&n.__source&&n.__source.parent&&n.__source.parent.id===this.id&&(e.object=n.__source.object,e.index=n.__source.index),e}filterSubLayer(e){return!0}shouldRenderSubLayer(e,n){return n&&n.length}getSubLayerClass(e,n){const{_subLayerProps:o}=this.props;return o&&o[e]&&o[e].type||n}getSubLayerRow(e,n,o){return e.__source={parent:this,object:n,index:o},e}getSubLayerAccessor(e){if(typeof e=="function"){const n={index:-1,data:this.props.data,target:[]};return(o,r)=>o&&o.__source?(n.index=o.__source.index,e(o.__source.object,n)):e(o,r)}return e}getSubLayerColorAccessor(e,n,o=4){if(!this.usesNormalizedColors()||e===n)return e;const r=a=>{if(!Array.isArray(a))return a;const i=o===3?[0,0,0]:[0,0,0,0];return lo(a,i,0,o),i};return typeof e=="function"?(a,i)=>r(e(a,i)):r(e)}getSubLayerProps(e={}){const{opacity:n,pickable:o,visible:r,parameters:a,getPolygonOffset:i,highlightedObjectIndex:s,autoHighlight:c,highlightColor:u,coordinateSystem:l,coordinateOrigin:d,wrapLongitude:f,positionFormat:h,modelMatrix:g,extensions:m,fetch:p,operation:S,_subLayerProps:E}=this.props,P={id:"",updateTriggers:{},opacity:n,pickable:o,visible:r,parameters:a,getPolygonOffset:i,highlightedObjectIndex:s,autoHighlight:c,highlightColor:u,coordinateSystem:l,coordinateOrigin:d,wrapLongitude:f,positionFormat:h,modelMatrix:g,extensions:m,fetch:p,operation:S},v=E&&e.id&&E[e.id],A=v&&v.updateTriggers,y=e.id||"sublayer";if(v){const x=this.props[Ae],I=e.type?e.type._propTypes:{};for(const b in v){const O=I[b]||x[b];O&&O.type==="accessor"&&(v[b]=this.getSubLayerAccessor(v[b]))}}Object.assign(P,e,v),P.id=`${this.props.id}-${y}`,P.updateTriggers={all:this.props.updateTriggers?.all,...e.updateTriggers,...A};for(const x of m){const I=x.getSubLayerProps.call(this,x);I&&Object.assign(P,I,{updateTriggers:Object.assign(P.updateTriggers,I.updateTriggers)})}const C=Object.entries(this.props[ao]??{});for(const[x,I]of Object.entries(this.props[io]??{})){const b=this.props[Ae][x];b&&"arrow"in b&&typeof b.arrow=="string"&&I.column&&C.push([x,I.column])}if(C.length){const x=P.updateTriggers.all,I=x&&typeof x=="object"?Object.entries(x).flat():[x];P.updateTriggers={...P.updateTriggers,all:[...I,...C.flat()]}}return P}_updateAutoHighlight(e){for(const n of this.getSubLayers())n.updateAutoHighlight(e)}_getAttributeManager(){return null}_postUpdate(e,n){let o=this.internalState.subLayers;const r=!o||this.needsUpdate();if(r){const a=this.renderLayers();o=so(a,Boolean),this.internalState.subLayers=o}co(zo,this,r,o);for(const a of o)a.parent=this}};be.layerName="CompositeLayer";let Ct=be;const Ho={name:"pathShaderPlugin",injectionTargets:[{name:"DECKGL_FILTER_PATH_COLOR_VERTEX",stage:"vertex",wgsl:{parameters:"color: ptr<function, vec4<f32>>, pathPosition: vec2<f32>, pathLength: f32"}},{name:"DECKGL_FILTER_PATH_COLOR",stage:"fragment",wgsl:{parameters:""}},{name:"DECKGL_PATH_STYLE_COORDINATES",stage:"vertex",wgsl:{parameters:"pathPosition: ptr<function, vec2<f32>>, pathLength: ptr<function, f32>, dashSegment: ptr<function, vec2<f32>>, halfWidth: f32"}},{name:"DECKGL_PATH_STYLE_COLOR",stage:"fragment",wgsl:{parameters:"color: ptr<function, vec4<f32>>, pathPosition: vec2<f32>, pathCoverage: f32"}}]};function En({vertexEntry:t=`@vertex
fn vertexMain(attributes: Attributes) -> Varyings`,vertexSetup:e="",vertexOutput:n="varyings.pathPickingColor = geometry.pickingColor;",extraVaryings:o="@location(10) @interpolate(flat) pathPickingColor: vec3<f32>,",fragmentFilter:r="",pickingFilter:a=`
    if (picking.isActive > 0.5) {
      if (!picking_isColorValid(varyings.pathPickingColor)) { discard; }
      var extensionColor = vec4<f32>(varyings.pathPickingColor, 1.0);
      DECKGL_FILTER_COLOR(&extensionColor, fragmentGeometry);
      return vec4<f32>(varyings.pathPickingColor, 1.0);
    }
  `,colorFilter:i=`
    if (picking.isHighlightActive > 0.5) {
      let selected = picking_normalizeColor(picking.highlightedObjectColor);
      if (picking_isColorZero(abs(varyings.pathPickingColor - selected))) {
        let alpha = picking.highlightColor.a;
        let blendedAlpha = alpha + color.a * (1.0 - alpha);
        let ratio = alpha / max(blendedAlpha, 0.000001);
        color = vec4<f32>(mix(color.rgb, picking.highlightColor.rgb, ratio), blendedAlpha);
      }
    }
  `}={}){return`const EPSILON: f32 = 0.001;
const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct JoinResult {
  offset: vec3<f32>,
  cornerOffset: vec2<f32>,
  miterLength: f32,
  pathPosition: vec2<f32>,
  pathLength: f32,
#ifdef DASH_ENABLED
  dashSegment: vec2<f32>,
#endif
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
  // [position along the source segment, complete source-segment length]
  @location(8) vDashSegment: vec2<f32>,
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
  let pathLength = select(lenB, lenA, isEnd);
#ifdef DASH_ENABLED
  // Extrusion happens in the XY plane, so pathLength is a 2D length. For a path that also
  // moves in Z, the source-segment arclength is longer by this ratio. Keep that dash coordinate
  // separate from pathPosition so PathLayer's geometric cap and joint tests stay unchanged.
  // Billboard mode extrudes in clip space, where the perspective divide has already reduced
  // the segment to its screen projection, so its complete common-space length is supplied by
  // the caller.
  // Mirrors path-layer-vertex.glsl.ts.
  let currDelta3 = select(deltaB3, deltaA3, isEnd);
  let currLength2D = length(currDelta3.xy);
  // Do not clamp a valid denominator to EPSILON: high-zoom Web Mercator deltas are often
  // smaller than that in common space, and changing their scale corrupts even flat paths.
  let safeLength2D = select(1.0, currLength2D, currLength2D > 0.0);
  var dashArcLengthRatio = 1.0;
  var dashPositionOffset = 0.0;
  var dashSegmentLength = pathLength;
  if (path.billboard != 0.0) {
    // clipLine may shorten the visible screen-space segment. Preserve the corresponding interval
    // of the complete common-space arclength instead of compressing the full dash period into the
    // visible span. Keep dashSegmentLength complete so justification is stable as the camera clips it.
    let visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
    dashArcLengthRatio = 0.0;
    if (pathLength > 0.0) {
      dashArcLengthRatio = visiblePathLength / pathLength;
    }
    dashPositionOffset = sourcePathLength * sourcePathRange.x;
    dashSegmentLength = sourcePathLength;
  } else if (currLength2D > 0.0) {
    dashArcLengthRatio = length(currDelta3) / safeLength2D;
    dashSegmentLength = pathLength * dashArcLengthRatio;
  }
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
  let positionAlongPath = dot(offsetFromStartOfPath, dir);
  let pathPosition = vec2<f32>(dot(offsetFromStartOfPath, perp), positionAlongPath);
#ifdef DASH_ENABLED
  let dashSegment = vec2<f32>(
    dashPositionOffset + positionAlongPath * dashArcLengthRatio,
    dashSegmentLength
  );
#endif
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
    offset, coverageOffsetVec, miterLength, pathPosition, pathLength,
#ifdef DASH_ENABLED
    dashSegment,
#endif
    jointType
  );
#else
  return JoinResult(
    offset, offsetVec, miterLength, pathPosition, pathLength,
#ifdef DASH_ENABLED
    dashSegment,
#endif
    jointType
  );
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
    geometry.uv = join.pathPosition;
    geometry.screenSpaceOffset = join.offset;
    varyings.position = vec4<f32>(
      currPositionScreen.xyz + join.offset * currPositionScreen.w,
      currPositionScreen.w
    );
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
#ifdef DASH_ENABLED
    varyings.vDashSegment = join.dashSegment;
#endif
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
    geometry.position = vec4<f32>(currPositionCommon + join.offset, 1.0);
    geometry.uv = join.pathPosition;
    varyings.position = project_common_position_to_clipspace(geometry.position);
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
#ifdef DASH_ENABLED
    varyings.vDashSegment = join.dashSegment;
#endif
    varyings.vJointType = join.jointType;
  }

  var dashSegment = vec2<f32>(0.0);
#ifdef DASH_ENABLED
  dashSegment = varyings.vDashSegment;
#endif
  var pathPosition = varyings.vPathPosition;
  var pathLength = varyings.vPathLength;
  DECKGL_PATH_STYLE_COORDINATES(
    &pathPosition, &pathLength, &dashSegment,
    select(project_pixel_size_float(widthPixels), widthPixels, path.billboard != 0)
  );
#ifdef DASH_ENABLED
  varyings.vDashSegment = dashSegment;
#endif
  varyings.vPathPosition = pathPosition;
  varyings.vPathLength = pathLength;
  geometry.uv = pathPosition;

  varyings.vColor = vec4<f32>(
    attributes.instanceColors.rgb,
    attributes.instanceColors.a * layer.opacity
  );
#ifdef DASH_ENABLED
  // Camera clipping shortens the visible geometry, but trip time still follows the original segment.
  DECKGL_FILTER_PATH_COLOR_VERTEX(
    &varyings.vColor,
    vec2<f32>(varyings.vPathPosition.x, varyings.vDashSegment.x),
    varyings.vDashSegment.y
  );
#else
  DECKGL_FILTER_PATH_COLOR_VERTEX(&varyings.vColor, varyings.vPathPosition, varyings.vPathLength);
#endif
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
  let isCorner = varyings.vPathPosition.y < 0.0 || varyings.vPathPosition.y > varyings.vPathLength;
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
  if (
    varyings.vPathPosition.y < 0.0 ||
    varyings.vPathPosition.y > varyings.vPathLength
  ) {
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
  ${i}
  DECKGL_PATH_STYLE_COLOR(&color, varyings.vPathPosition, pathCoverage);
  ${a}
  DECKGL_FILTER_COLOR(&color, fragmentGeometry);
  return deckgl_premultiplied_alpha(color);
}
`}En();const jo=`struct PathUniforms {
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
`,Me=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,qo={name:"path",source:jo,vs:Me,fs:Me,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}};function Ko(t,e={}){const n=t.name||"PathModel",o=e.selectors||{},r=Xo(e.data),a=new Set(r?xo(r):[]),i=Zo(t.gpuInputSchema);Jo(n,i,o);const s={};for(const c of i){if(!tr(c.columnName))throw new Error(`${n} source mapping does not support GPU input "${c.columnName}"`);const u=Qo(n,c,o[c.columnName],r,a);u&&er(s,c.columnName,u)}if(!s.paths)throw new Error(`${n} source mapping requires paths`);return s}function Xo(t){if(t)return t instanceof Y?t:new Y([t])}function Zo(t){return t.filter(e=>!e.internal)}function Jo(t,e,n){const o=new Set(e.map(r=>r.columnName));for(const[r,a]of Object.entries(n))if(a!==void 0&&!o.has(r))throw new Error(`${t} source selector "${r}" is not declared as source-mappable`)}function Qo(t,e,n,o,r){if(n===null){if(e.required)throw new Error(`${t} source selector "${e.columnName}" cannot be null`);return}if(n instanceof M)return n;const a=n??e.columnName;if(!o){if(n===void 0&&!e.required)return;throw new Error(`${t} source selector "${e.columnName}" requires data to resolve column "${a}"`)}if(!r.has(a)){if(n===void 0&&!e.required)return;throw new Error(`${t} source column "${a}" for "${e.columnName}" is missing`)}return Eo(o,a)}function tr(t){return t==="paths"||t==="colors"||t==="widths"||t==="timestamps"}function er(t,e,n){t[e]=n}const $t="segmentStartPositions",Wt="segmentEndPositions",Ve="segmentPreviousPositions",Ne="segmentNextPositions",Yt="segmentStartColors",zt="segmentEndColors",Fe="segmentFlags",Ue="rowIndices",Cn="expandedPathVertexData",vt="pathViewOrigins",vn="pathViewOriginData",nr=Float32Array.BYTES_PER_ELEMENT*16+Uint32Array.BYTES_PER_ELEMENT*4,or=Float32Array.BYTES_PER_ELEMENT*4,rr=Float32Array.BYTES_PER_ELEMENT*8,ar=Float32Array.BYTES_PER_ELEMENT*12,bn=Float32Array.BYTES_PER_ELEMENT*16,Tn=bn+Uint32Array.BYTES_PER_ELEMENT,An=Tn+Uint32Array.BYTES_PER_ELEMENT,ir=An+Uint32Array.BYTES_PER_ELEMENT,sr=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],cr={attributes:[{name:$t,location:0,type:"vec4<f32>",stepMode:"instance"},{name:Wt,location:1,type:"vec4<f32>",stepMode:"instance"},{name:Yt,location:2,type:"u32",stepMode:"instance"},{name:zt,location:3,type:"u32",stepMode:"instance"},{name:vt,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},lr=`#version 300 es
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
`,ur=`#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0);
}
`;class ge extends Co{static gpuInputSchema=sr;segmentLayout;expandedPathVertexData;pathViewOriginData;renderBatches;pathProps;pathShaderLayout;pathTable;ownsPathTable;constructor(e,n){const o=Ge(n);super(e,o.modelProps),this.pathTable=n.table,this.ownsPathTable=n.ownsTable??!1,this.pathProps=n,this.pathShaderLayout=o.modelProps.shaderLayout,this.segmentLayout=o.segmentLayout,this.expandedPathVertexData=o.expandedPathVertexData,this.pathViewOriginData=o.pathViewOriginData,this.renderBatches=o.renderBatches}setProps(e){const n={...this.pathProps,...e},o=e.pathState!==void 0||e.table!==void 0||e.ownsTable!==void 0;if(this.pathProps=n,!o){super.setProps({});return}const r=Ge(n);this.segmentLayout=r.segmentLayout,this.expandedPathVertexData=r.expandedPathVertexData,this.pathViewOriginData=r.pathViewOriginData,this.renderBatches=r.renderBatches,this.pathShaderLayout=r.modelProps.shaderLayout;const a=this.pathTable,i=this.ownsPathTable;this.pathTable=n.table,this.ownsPathTable=n.ownsTable??!1,super.setProps({table:this.pathTable}),i&&a!==this.pathTable&&a.destroy(),this.setAttributes(Ht(r.modelProps.shaderLayout,r)),this.setInstanceCount(r.segmentLayout.segmentCount),this.setNeedsRedraw("Path segment state updated")}draw(e,n){return n?.parameters?this._withDrawParameters(e,n.parameters,()=>this.drawPathAttributeModelBatches(e)):this.drawPathAttributeModelBatches(e)}drawPathAttributeModelBatches(e){const n=this.table?.batches||[];if(n.length>0&&n.length!==this.renderBatches.length)throw new Error("PathAttributeModel draw batches must align with generated path render batches");let o=!0;try{for(const[r,a]of this.renderBatches.entries()){const i=n[r];this.setAttributes({...i?un(i.bufferLayout,i.gpuData):{},..._n(this.pathShaderLayout,a)},{byteOffsets:i?_e(i.bufferLayout,i.gpuData):{}}),this.setInstanceCount(a.segmentCount),o=super.draw(e)&&o}}finally{const r=this.table?.batches[0];this.setAttributes({...dr(this.table),...Ht(this.pathShaderLayout,{expandedPathVertexData:this.expandedPathVertexData,pathViewOriginData:this.pathViewOriginData})},{byteOffsets:r?_e(r.bufferLayout,r.gpuData):{}}),this.setInstanceCount(this.segmentLayout.segmentCount)}return o}destroy(){super.destroy(),this.ownsPathTable&&(this.pathTable.destroy(),this.ownsPathTable=!1)}}function dr(t){const e=t?.batches[0];return e?un(e.bufferLayout,e.gpuData):{}}function Ge(t){hr(t),fr(t),mr(t);const e=t.shaderLayout??cr,n=t.pathState.renderBatches[0];if(!n)throw new Error("PathAttributeModel requires at least one prepared path render batch");const o=yr(t);return{modelProps:{...t,vs:t.vs??lr,fs:t.fs??ur,shaderLayout:e,attributes:{...t.attributes||{},..._n(e,n)},bufferLayout:[...t.bufferLayout||[],...Sr(e,o)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:t.pathState.segmentLayout.segmentCount,table:t.table,tableCount:"none"},segmentLayout:t.pathState.segmentLayout,expandedPathVertexData:n.expandedPathVertexData,pathViewOriginData:n.pathViewOriginData,renderBatches:t.pathState.renderBatches}}function hr(t){de("PathAttributeModel",ge.gpuInputSchema,{paths:t.paths,colors:t.colors,widths:t.widths,viewOrigins:t.viewOrigins})}function fr(t){const e=gr(t),[n,o]=e[0];for(const[r,a]of e.slice(1)){if(a.length!==o.length)throw new Error(`PathAttributeModel ${r} rows must match ${n} rows (${a.length} !== ${o.length})`);if(a.data.length!==o.data.length)throw new Error(`PathAttributeModel ${r} batch count must match ${n} batch count`);for(let i=0;i<a.data.length;i++)if(a.data[i].length!==o.data[i].length)throw new Error(`PathAttributeModel ${r} batch ${i} rows must match ${n}`)}t.colors&&pr(t.colors)&&wr(t.paths,t.colors)}function gr(t){return[["paths",t.paths],["colors",t.colors],["widths",t.widths],["viewOrigins",t.viewOrigins]].filter(([,e])=>e!==void 0)}function pr(t){return t.format!==void 0&&dn(t.format)}function mr(t){if(!t.pathState)throw new Error("PathAttributeModel requires prepared pathState");const e=t.pathState.segmentLayout.startIndices.length-1;if(e!==t.paths.length)throw new Error(`PathAttributeModel prepared path rows must match path GPU rows (${e} !== ${t.paths.length})`)}function wr(t,e){for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,r=e.data[n]?.valueOffsets;if(!o||!r||!Pr(o,r))throw new Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function Pr(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function yr(t){const e=new Set(Object.keys(t.constantAttributes||{}));for(const n of t.bufferLayout||[])if(n.attributes)for(const o of n.attributes)e.add(o.attribute);else e.add(n.name);return e}function Sr(t,e){const n=new Set(t.attributes.map(a=>a.name).filter(a=>!e.has(a))),o=[];n.has($t)&&o.push({attribute:$t,format:"float32x4",byteOffset:0}),n.has(Wt)&&o.push({attribute:Wt,format:"float32x4",byteOffset:or}),n.has(Ve)&&o.push({attribute:Ve,format:"float32x4",byteOffset:rr}),n.has(Ne)&&o.push({attribute:Ne,format:"float32x4",byteOffset:ar}),n.has(Fe)&&o.push({attribute:Fe,format:"uint32",byteOffset:bn}),n.has(Ue)&&o.push({attribute:Ue,format:"uint32",byteOffset:Tn}),n.has(Yt)&&o.push({attribute:Yt,format:"uint32",byteOffset:An}),n.has(zt)&&o.push({attribute:zt,format:"uint32",byteOffset:ir});const r=[{name:Cn,byteStride:nr,stepMode:"instance",attributes:o}];return n.has(vt)&&r.push({name:vn,byteStride:Float32Array.BYTES_PER_ELEMENT*4,stepMode:"instance",attributes:[{attribute:vt,format:"float32x4",byteOffset:0}]}),r}function Ht(t,e){const n=new Set(t.attributes.map(o=>o.name));return{[Cn]:e.expandedPathVertexData,...n.has(vt)?{[vn]:e.pathViewOriginData}:{}}}function _n(t,e){return Ht(t,e)}function Ln(t,e){xr(t,e),Er(t);const n=[],o=Tr(t.paths);let r=t.rowIndexBase??0;for(let a=0;a<t.paths.data.length;a++){const i=t.paths.data[a],s=pe(i),c=br(s,i.length),u=c[c.length-1]??0,l=t.colors?.data[a],d=t.widths?.data[a],f=t.timestamps?.data[a],h=t.viewOrigins?.data[a];n.push({batchRowIndexBase:r,rowCount:i.length,componentCount:o,valueOffsets:s,recordOffsets:c,segmentCount:u,pathValuesBinding:Z(i,Nt(i,t.paths.byteStride)),viewOriginsBinding:h?Z(h,h.length*t.viewOrigins.byteStride):void 0,colorsBinding:l?Z(l,Nt(l,t.colors.byteStride)):void 0,widthsBinding:d?Z(d,d.length*t.widths.byteStride):void 0,timestampsBinding:f?Z(f,Nt(f,t.timestamps.byteStride)):void 0}),r+=i.length}return{batches:n}}function xr(t,e){de("PathStorageModel",e,{paths:t.paths,colors:t.colors,widths:t.widths,timestamps:t.timestamps,viewOrigins:t.viewOrigins})}function Er(t){const e=[["paths",t.paths],["colors",t.colors],["widths",t.widths],["timestamps",t.timestamps],["viewOrigins",t.viewOrigins]].filter(([,r])=>r!==void 0),[n,o]=e[0];for(const[r,a]of e.slice(1)){if(a.length!==o.length)throw new Error(`PathStorageModel ${r} rows must match ${n} rows (${a.length} !== ${o.length})`);if(a.data.length!==o.data.length)throw new Error(`PathStorageModel ${r} batch count must match ${n} batch count`);for(let i=0;i<a.data.length;i++)if(a.data[i].length!==o.data[i].length)throw new Error(`PathStorageModel ${r} batch ${i} rows must match ${n}`)}t.timestamps&&Cr(t.paths,t.timestamps),t.colors&&Ar(t.colors)&&vr(t.paths,t.colors)}function Cr(t,e){for(let n=0;n<t.data.length;n++){const o=pe(t.data[n]),r=e.data[n].valueOffsets;if(!r)throw new Error("PathStorageModel timestamps require copied variable-length offsets");if(!On(o,r))throw new Error("PathStorageModel timestamps must align with path vertex offsets")}}function vr(t,e){for(let n=0;n<t.data.length;n++){const o=pe(t.data[n]),r=e.data[n].valueOffsets;if(!r)throw new Error("PathStorageModel vertex colors require copied variable-length offsets");if(!On(o,r))throw new Error("PathStorageModel vertex colors must align with path vertex offsets")}}function On(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function pe(t){if(!t.valueOffsets)throw new Error("PathStorageModel paths require copied variable-length offset metadata");return t.valueOffsets}function br(t,e){const n=[0];for(let o=0;o<e;o++){const r=t[o]??0,a=t[o+1]??r,i=Math.max(0,a-r-1);n.push((n[n.length-1]??0)+i)}return n}function Tr(t){const e=t.format;if(!e)throw new Error("PathStorageModel paths require GPUVector.format");return uo(e).components}function Ar(t){return t.format!==void 0&&dn(t.format)}function Z(t,e){return{buffer:_r(t),offset:t.byteOffset,...e&&e>0?{size:e}:{}}}function _r(t){return t.buffer instanceof N?t.buffer.buffer:t.buffer}function Nt(t,e){return t.valueByteLength??t.valueLength*e}function Lr(t,e){const{bindings:n={},...o}=e;return{kernel:new ho(t,o),bindings:{...n}}}const ke=4,at=3,bt=6,Or=`
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
`,Ir={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"pathExpansionConfig",type:"read-only-storage",group:0,location:2},{name:"generatedPathVertices",type:"storage",group:0,location:3}],attributes:[]};function Rr(t,e,n){const{valueOffsets:o,recordOffsets:r,batchRowIndexBase:a,rowCount:i}=n,s=new Uint32Array(Math.max(i,1)*ke);for(let u=0;u<i;u++){const l=u*ke;s[l]=Math.max(0,o[u]??0),s[l+1]=Math.max(s[l],o[u+1]??s[l]),s[l+2]=Math.max(0,r[u]??0),s[l+3]=a+u}const c=t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-path-ranges`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:s});return{pathRangesBuffer:c,byteLength:s.byteLength,destroy:()=>c.destroy()}}function Br(t,e,n){const{generatedBufferBatch:o,componentCount:r,recordWordCount:a}=n,i=o.rowEnd-o.rowStart;if(a!==at&&a!==bt)throw new Error(`Unsupported GPU path record word count ${a}; expected ${at} or ${bt}`);const s=new Uint32Array([i,r,o.rowStart,o.recordStart,a]);return{expansionConfigBuffer:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-expansion-config`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:s}),byteLength:s.byteLength}}function Dr(t,e,n,o){if(o!==at&&o!==bt)throw new Error(`Unsupported GPU path record word count ${o}; expected ${at} or ${bt}`);const r=Math.max(n,1),a=n*Uint32Array.BYTES_PER_ELEMENT*o;return{compactPathVertexData:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-generated-path-vertices`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(r*o)}),byteLength:a}}function Mr(t,e,n){const o=Lr(t,{id:`${e.id||"gpu-expanded-path-model"}-compute`,source:Or,shaderLayout:Ir,bindings:{pathValues:n.pathValues,pathRanges:n.pathRanges,pathExpansionConfig:n.expansionInput.expansionConfigBuffer,generatedPathVertices:n.generated.compactPathVertexData}});if(n.rowCount>0&&n.segmentCount>0){const r=t.beginComputePass({});o.kernel.dispatch(r,{bindings:o.bindings,x:Math.ceil(n.rowCount/64)}),r.end(),t.submit()}o.kernel.destroy()}const jt="segmentStartPointIndices",qt="segmentEndPointIndices",Kt="segmentPreviousPointIndices",Xt="segmentNextPointIndices",Zt="segmentFlags",Jt="rowIndices",tt="compactPathVertexData",Vr="pathRanges",Nr="pathViewOrigins",Fr=Uint32Array.BYTES_PER_ELEMENT*3,In=Uint32Array.BYTES_PER_ELEMENT*6,Ur=Uint32Array.BYTES_PER_ELEMENT,Gr=Uint32Array.BYTES_PER_ELEMENT*2,kr=Uint32Array.BYTES_PER_ELEMENT*3,$r=Uint32Array.BYTES_PER_ELEMENT*4,Wr=Uint32Array.BYTES_PER_ELEMENT*5,Yr=Uint32Array.BYTES_PER_ELEMENT,zr=Uint32Array.BYTES_PER_ELEMENT*2,Rn=[255,255,255,255],Bn=1,Hr=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!1,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],Dn={attributes:[{name:jt,location:0,type:"u32",stepMode:"instance"},{name:Zt,location:1,type:"u32",stepMode:"instance"},{name:Jt,location:2,type:"u32",stepMode:"instance"}],bindings:[]},jr=`
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
`;class X extends fo{static gpuInputSchema=Hr;segmentCount;pathRangeBuildTimeMs;pathRangeByteLength;pathRecordByteStride;compactPathVertexByteLength;generatedRenderBufferByteLength;rowStorageByteLength;transientComputeInputByteLength;batches;renderBatches;rowColorsBinding;vertexColorsBinding;rowWidthsBinding;styleConfigBuffer;compactPathVertexData;storageState;pathProps;ownsStorageState;constructor(e,n){if(e.type!=="webgpu")throw new Error("PathStorageModel is WebGPU-only");const o=!We(n),r=o?$e(e,n):n.storageState;super(e,Xr(n,r)),this.pathProps=n,this.storageState=r,this.ownsStorageState=o,this.applyStorageState(r)}setProps(e){const n={...this.pathProps,...e},o=We(n),r=e,i="storageState"in e&&e.storageState!==void 0||r.paths!==void 0||r.shaderLayout!==void 0||r.rowIndexBase!==void 0,s=!o&&(r.colors!==void 0||r.widths!==void 0||r.timestamps!==void 0||r.viewOrigins!==void 0||r.color!==void 0||r.width!==void 0);if(this.pathProps=n,!i){if(s){Qr(this.device,n,this.storageState),this.applyStorageState(this.storageState);const d=H(this.storageState);this.setBindings(J(n,d)),this.setNeedsRedraw("Storage path row bindings updated")}return}const c=o?n.storageState:$e(this.device,n);this.ownsStorageState&&this.storageState.destroy(),this.storageState=c,this.ownsStorageState=!o,this.applyStorageState(c);const u=H(c),l=it(c);this.setAttributes({[tt]:l.compactPathVertexData}),this.setBindings(J(n,u)),this.setInstanceCount(l.segmentCount),this.setNeedsRedraw("Storage path state updated")}draw(e,n){return n?.parameters?this._withDrawParameters(e,n.parameters,()=>this.drawPathStorageModelBatches(e)):this.drawPathStorageModelBatches(e)}drawPathStorageModelBatches(e){let n=!0;for(const a of this.storageState.renderBatches){if(a.segmentCount===0)continue;const i=this.storageState.batches[a.rowBindingBatchIndex];if(!i)throw new Error("PathStorageModel render batch is missing its row-binding batch");this.setAttributes({[tt]:a.compactPathVertexData}),this.setBindings(J(this.pathProps,i)),this.setInstanceCount(a.segmentCount),n=super.draw(e)&&n}const o=H(this.storageState),r=it(this.storageState);return this.setAttributes({[tt]:r.compactPathVertexData}),this.setBindings(J(this.pathProps,o)),this.setInstanceCount(this.storageState.segmentCount),n}destroy(){this.ownsStorageState&&this.storageState.destroy(),super.destroy()}applyStorageState(e){this.segmentCount=e.segmentCount,this.pathRangeBuildTimeMs=e.pathRangeBuildTimeMs,this.pathRangeByteLength=e.pathRangeByteLength,this.pathRecordByteStride=e.pathRecordByteStride,this.compactPathVertexByteLength=e.compactPathVertexByteLength,this.generatedRenderBufferByteLength=e.generatedRenderBufferByteLength,this.rowStorageByteLength=e.rowStorageByteLength,this.transientComputeInputByteLength=e.transientComputeInputByteLength,this.batches=e.batches,this.renderBatches=e.renderBatches,this.rowColorsBinding=e.rowColorsBinding,this.vertexColorsBinding=e.vertexColorsBinding,this.rowWidthsBinding=e.rowWidthsBinding,this.styleConfigBuffer=e.styleConfigBuffer,this.compactPathVertexData=e.compactPathVertexData}}function qr(t){const e=new Set(t.attributes.map(n=>n.name));return Mn(e)?"legacy":"compact"}function Mn(t){return t.has(qt)||t.has(Kt)||t.has(Xt)}function Kr(t){return t==="legacy"?In:Fr}function $e(t,e){if(t.type!=="webgpu")throw new Error("createPathStorageState requires a WebGPU device");const n=Ye(),o=e.shaderLayout??Dn,r=qr(o),a=Kr(r),i=a/Uint32Array.BYTES_PER_ELEMENT,s=Ln(e,X.gpuInputSchema),c=Vn(t,e),u=[...c.ownedResources],l=[],d=[],f=[];let h=0,g=0,m=0,p=c.byteLength,S=0;for(const[A,y]of s.batches.entries()){const C=Rr(t,{id:e.id},{valueOffsets:y.valueOffsets,recordOffsets:y.recordOffsets,batchRowIndexBase:y.batchRowIndexBase,rowCount:y.rowCount});l.push(C),g+=C.byteLength;const x=Nn(t,e,y,c),I=xn({device:t,recordOffsets:y.recordOffsets,recordByteStride:a,maxBatchByteLength:t.limits.maxStorageBufferBindingSize,resourceLabel:"PathStorageModel indexed generated path vertex data"});for(const b of I){const O=Br(t,{id:e.id},{generatedBufferBatch:b,componentCount:y.componentCount,recordWordCount:i}),B=Dr(t,{id:e.id},b.recordCount,i);Mr(t,{id:e.id},{pathValues:y.pathValuesBinding,pathRanges:C.pathRangesBuffer,expansionInput:O,generated:B,rowCount:b.rowEnd-b.rowStart,segmentCount:b.recordCount}),f.push({rowBindingBatchIndex:A,rowStart:b.rowStart,rowEnd:b.rowEnd,segmentCount:b.recordCount,compactPathVertexData:B.compactPathVertexData}),m+=B.byteLength,S+=O.byteLength,O.expansionConfigBuffer.destroy()}d.push({...x,batchRowIndexBase:y.batchRowIndexBase,rowCount:y.rowCount,segmentCount:y.segmentCount,pathValuesBinding:y.pathValuesBinding,pathRangesBinding:C.pathRangesBuffer,...y.timestampsBinding?{pathTimestampsBinding:y.timestampsBinding}:{},pathViewOriginsBinding:x.pathViewOriginsBinding}),u.push(...x.ownedResources),p+=x.ownedByteLength,h+=y.segmentCount}const E=H({batches:d}),P=it({renderBatches:f});let v=!1;return{segmentCount:h,pathRangeBuildTimeMs:Ye()-n,pathRangeByteLength:g,pathRecordByteStride:a,compactPathVertexByteLength:m,generatedRenderBufferByteLength:m,rowStorageByteLength:p,transientComputeInputByteLength:S,batches:d,renderBatches:f,ownedRowBindingResources:u,rowColorsBinding:E.rowColorsBinding,vertexColorsBinding:E.vertexColorsBinding,rowWidthsBinding:E.rowWidthsBinding,styleConfigBuffer:E.styleConfigBuffer,compactPathVertexData:P.compactPathVertexData,destroy:()=>{if(!v){v=!0,Qt(u),Qt(l);for(const A of f)A.compactPathVertexData.destroy()}}}}function Xr(t,e){const n=t.shaderLayout??Dn,o=H(e),r=it(e);return{...t,source:t.source??jr,shaderLayout:n,bindings:J(t,o),attributes:{...t.attributes||{},[tt]:r.compactPathVertexData},bufferLayout:[...t.bufferLayout||[],Zr(n,e.pathRecordByteStride)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:r.segmentCount}}function J(t,e){return{...t.bindings||{},pathValues:e.pathValuesBinding,[Vr]:e.pathRangesBinding,[Nr]:e.pathViewOriginsBinding,pathRowColors:e.rowColorsBinding,pathVertexColors:e.vertexColorsBinding,pathRowWidths:e.rowWidthsBinding,...e.pathTimestampsBinding?{pathTimestamps:e.pathTimestampsBinding}:{},pathStorageStyleConfig:e.styleConfigBuffer}}function Zr(t,e){const n=new Set(t.attributes.map(a=>a.name)),o=e===In,r=[];if(n.has(jt)&&r.push({attribute:jt,format:"uint32",byteOffset:0}),!o&&Mn(n))throw new Error("PathStorageModel storageState uses compact path records, but the shader layout requests legacy segment neighbor attributes");return o&&n.has(qt)&&r.push({attribute:qt,format:"uint32",byteOffset:Ur}),o&&n.has(Kt)&&r.push({attribute:Kt,format:"uint32",byteOffset:Gr}),o&&n.has(Xt)&&r.push({attribute:Xt,format:"uint32",byteOffset:kr}),n.has(Zt)&&r.push({attribute:Zt,format:"uint32",byteOffset:o?$r:Yr}),n.has(Jt)&&r.push({attribute:Jt,format:"uint32",byteOffset:o?Wr:zr}),{name:tt,stepMode:"instance",byteStride:e,attributes:r}}function Vn(t,e){const n=e.id||"path-storage-model",o=Ft(t,`${n}-default-row-colors`,"unorm8x4",new Uint8Array(e.color??Rn)),r=Ft(t,`${n}-default-row-widths`,"float32",new Float32Array([e.width??Bn])),a=Ft(t,`${n}-default-view-origins`,"float32x4",new Float32Array(4));return{colorsBinding:ft(o),vertexColorsBinding:ft(o),widthsBinding:ft(r),viewOriginsBinding:ft(a),byteLength:Uint8Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*4,ownedResources:[o,r,a]}}function Nn(t,e,n,o){const r=Jr(e,n.batchRowIndexBase,n.componentCount),a=new N(t,{id:`${e.id||"path-storage-model"}-style-config-${n.batchRowIndexBase}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:r});return{pathViewOriginsBinding:n.viewOriginsBinding??o.viewOriginsBinding,rowColorsBinding:e.colors&&Fn(e.colors)&&n.colorsBinding?n.colorsBinding:o.colorsBinding,vertexColorsBinding:e.colors&&Un(e.colors)&&n.colorsBinding?n.colorsBinding:o.vertexColorsBinding,rowWidthsBinding:n.widthsBinding??o.widthsBinding,styleConfigBuffer:a,ownedResources:[a],ownedByteLength:r.byteLength}}function Ft(t,e,n,o){return new U({type:"buffer",name:e,buffer:t.createBuffer({id:e,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:o}),format:n,length:1,ownsBuffer:!0})}function ft(t){const[e,...n]=t.data;if(!e||n.length>0)throw new Error(`Storage path vector "${t.name}" requires exactly one GPUData chunk`);const o=e.buffer;return o instanceof N?o.buffer:o}function Fn(t){return t.format==="unorm8x4"}function Un(t){return t.format==="vertex-list<unorm8x4>"}function Jr(t,e,n){const o=new ArrayBuffer(48),r=new Float32Array(o),a=new Uint32Array(o),i=t.color??Rn;return r[0]=i[0]/255,r[1]=i[1]/255,r[2]=i[2]/255,r[3]=i[3]/255,r[4]=t.width??Bn,a[5]=t.colors&&Fn(t.colors)?1:0,a[6]=t.widths?1:0,a[7]=e,a[8]=n,a[9]=t.viewOrigins?1:0,a[10]=t.colors&&Un(t.colors)?1:0,a}function Qr(t,e,n){const o=Ln(e,X.gpuInputSchema);ta(n,o.batches);const r=[],a=Vn(t,e);r.push(...a.ownedResources);let i=a.byteLength;const s=o.batches.map((c,u)=>{const l=n.batches[u],d=Nn(t,e,c,a);return r.push(...d.ownedResources),i+=d.ownedByteLength,{...d,batchRowIndexBase:l.batchRowIndexBase,rowCount:l.rowCount,segmentCount:l.segmentCount,pathValuesBinding:l.pathValuesBinding,pathRangesBinding:l.pathRangesBinding,...c.timestampsBinding?{pathTimestampsBinding:c.timestampsBinding}:{},pathViewOriginsBinding:d.pathViewOriginsBinding}});na(n.ownedRowBindingResources,r),n.batches=s,n.rowStorageByteLength=i,ea(n)}function ta(t,e){if(e.length!==t.batches.length)throw new Error("PathStorageModel row-binding updates must preserve path batch count");for(const[n,o]of e.entries()){const r=t.batches[n];if(!r||r.batchRowIndexBase!==o.batchRowIndexBase||r.rowCount!==o.rowCount||r.segmentCount!==o.segmentCount)throw new Error("PathStorageModel row-binding updates must preserve path batch rows")}}function ea(t){const e=H(t),n=it(t);t.rowColorsBinding=e.rowColorsBinding,t.vertexColorsBinding=e.vertexColorsBinding,t.rowWidthsBinding=e.rowWidthsBinding,t.styleConfigBuffer=e.styleConfigBuffer,t.compactPathVertexData=n.compactPathVertexData}function Qt(t){for(const e of t)e.destroy()}function na(t,e){Qt(t),t.splice(0,t.length,...e)}function H(t){const e=t.batches[0];if(!e)throw new Error("PathStorageState requires at least one row-binding batch");return e}function it(t){const e=t.renderBatches[0];if(!e)throw new Error("PathStorageState requires at least one render batch");return e}function We(t){return"storageState"in t&&t.storageState!==void 0}function Ye(){return typeof performance>"u"?Date.now():performance.now()}const oa=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!0,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],ra=`
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
`;class me extends X{static gpuInputSchema=oa;tripProps;tripConfigBuffer;constructor(e,n){aa(n)&&de("PathTripsStorageModel",me.gpuInputSchema,{paths:n.paths,colors:n.colors,widths:n.widths,timestamps:n.timestamps,viewOrigins:n.viewOrigins});const o=ia(e,n);super(e,{...n,source:n.source??ra,bindings:{...n.bindings||{},tripPathConfig:o}}),this.tripProps=n,this.tripConfigBuffer=o}setProps(e){const n={...this.tripProps,...e};(e.currentTime!==void 0||e.trailLength!==void 0||e.fadeTrail!==void 0)&&this.tripConfigBuffer.write(Gn(n)),this.tripProps=n,super.setProps({...e,bindings:{...e.bindings||this.tripProps.bindings||{},tripPathConfig:this.tripConfigBuffer}})}destroy(){this.tripConfigBuffer.destroy(),super.destroy()}}function aa(t){return"paths"in t}function ia(t,e){return new N(t,{id:`${e.id||"path-trips-storage-model"}-trip-config`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:Gn(e)})}function Gn(t){const e=new ArrayBuffer(16),n=new Float32Array(e),o=new Uint32Array(e);return n[0]=t.currentTime,n[1]=t.trailLength,o[2]=t.fadeTrail===!1?0:1,o}const sa=`
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
`,ca={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"closedFlags",type:"read-only-storage",group:0,location:2},{name:"pathClosureConfig",type:"uniform",group:0,location:3},{name:"needsInjection",type:"storage",group:0,location:4}],attributes:[]},la=`
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
`,ua={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathScatterRanges",type:"read-only-storage",group:0,location:1},{name:"pathScatterConfig",type:"uniform",group:0,location:2},{name:"outputPathValues",type:"storage",group:0,location:3}],attributes:[]};async function kn(t,e){const n=da(e),o=Dt(e.paths),r=fa(e.paths,e.closed);if(t.type!=="webgpu")return Ta(t,e,r,n);const a=await Promise.all(r.map((i,s)=>ma(t,e,i,s,n)));return new U({type:"data",name:e.paths.name,dataType:o,format:e.paths.format,data:a,stride:e.paths.stride,byteStride:e.paths.byteStride,rowByteLength:e.paths.rowByteLength,ownsData:!0})}function da(t){if(ha(Dt(t.paths)),!(t.closed.type instanceof fe))throw new Error("closeArrowPaths closed flags must be Vector<Bool>");if(t.closed.length!==t.paths.length)throw new Error(`closeArrowPaths closed flag rows must match path rows (${t.closed.length} !== ${t.paths.length})`);if(t.closed.data.some(e=>e.nullCount>0))throw new Error("closeArrowPaths closed flags cannot contain null rows");if(!Number.isFinite(t.epsilon)||t.epsilon<0)throw new Error("closeArrowPaths epsilon must be a finite non-negative number");return Math.fround(t.epsilon)}function ha(t){if(!Rt(t)||!_.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<1||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof T))throw new Error("closeArrowPaths paths must be GPUVector<List<FixedSizeList<Float32>[1..4]>>")}function fa(t,e){const n=ga(e),o=[];let r=0;for(const a of t.data){if(!a.valueOffsets||a.valueByteLength===void 0)throw new Error("closeArrowPaths paths require copied variable-length Arrow offset metadata");pa(a.valueOffsets,a.length),o.push({pathData:a,valueOffsets:a.valueOffsets,valueByteLength:a.valueByteLength,closedFlags:n.subarray(r,r+a.length),rowIndexBase:r}),r+=a.length}return o}function ga(t){const e=new Uint32Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.get(n)?1:0;return e}function pa(t,e){if(t.length!==e+1)throw new Error("closeArrowPaths path offsets must contain one trailing entry per path chunk");let n=t[0]??0;if(n!==0)throw new Error("closeArrowPaths path offsets must be normalized to start at zero");for(let o=1;o<t.length;o++){const r=t[o]??n;if(r<n)throw new Error("closeArrowPaths path offsets must be monotonically non-decreasing");n=r}}async function ma(t,e,n,o,r){const a=Dt(e.paths),i=Yn(a),s=wa(t,e,n,o,i,r);let c;try{Pa(t,e,n,s),c=await ya(s.needsInjectionBuffer,n.pathData.length)}finally{s.pathRangesBuffer.destroy(),s.closedFlagsBuffer.destroy(),s.pathClosureConfigBuffer.destroy(),s.needsInjectionBuffer.destroy()}const u=Wn(n.valueOffsets,c,n.pathData.length),l=Sa(t,e,n,o,i,u,c);try{xa(t,e,n,l)}finally{l.pathScatterRangesBuffer.destroy(),l.pathScatterConfigBuffer.destroy()}const d=(u[u.length-1]??0)*i*Float32Array.BYTES_PER_ELEMENT;return new hn({buffer:l.outputPathValuesBuffer,dataType:a,format:n.pathData.format,length:n.pathData.length,stride:n.pathData.stride,byteStride:n.pathData.byteStride,rowByteLength:n.pathData.rowByteLength,ownsBuffer:!0,readbackMetadata:ba(u,d),valueOffsets:u,valueByteLength:d})}function wa(t,e,n,o,r,a){const i=n.pathData.length,s=new Uint32Array(Math.max(i,1)*2);for(let l=0;l<i;l++){const d=l*2,f=n.valueOffsets[l]??0,h=n.valueOffsets[l+1]??f;s[d]=f,s[d+1]=Math.max(f,h)}const c=Ca(a,i,r),u=e.id||"closed-arrow-paths";return{pathRangesBuffer:t.createBuffer({id:`${u}-ranges-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:s}),closedFlagsBuffer:t.createBuffer({id:`${u}-closed-flags-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:va(n.closedFlags)}),pathClosureConfigBuffer:new N(t,{id:`${u}-closure-config-${o}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:c}),needsInjectionBuffer:t.createBuffer({id:`${u}-needs-injection-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(Math.max(i,1))})}}function Pa(t,e,n,o){const r={pathValues:$n(n),pathRanges:o.pathRangesBuffer,closedFlags:o.closedFlagsBuffer,pathClosureConfig:o.pathClosureConfigBuffer.buffer,needsInjection:o.needsInjectionBuffer},a=he(t,{id:`${e.id||"closed-arrow-paths"}-classify`,source:sa,shaderLayout:ca});if(n.pathData.length>0){const i=t.beginComputePass({});a.dispatch(i,{x:Math.ceil(n.pathData.length/64),bindings:r}),i.end(),t.submit()}a.destroy()}async function ya(t,e){if(e===0)return new Uint32Array(0);const n=await t.readAsync(0,e*Uint32Array.BYTES_PER_ELEMENT);return new Uint32Array(n.buffer,n.byteOffset,e).slice()}function Sa(t,e,n,o,r,a,i){const s=n.pathData.length,c=new Uint32Array(Math.max(s,1)*4);for(let h=0;h<s;h++){const g=h*4,m=n.valueOffsets[h]??0,p=n.valueOffsets[h+1]??m;c[g]=m,c[g+1]=Math.max(m,p),c[g+2]=a[h]??0,c[g+3]=i[h]??0}const d=(a[a.length-1]??0)*r*Float32Array.BYTES_PER_ELEMENT,f=e.id||"closed-arrow-paths";return{pathScatterRangesBuffer:t.createBuffer({id:`${f}-scatter-ranges-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:c}),pathScatterConfigBuffer:new N(t,{id:`${f}-scatter-config-${o}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:new Uint32Array([s,r,0,0])}),outputPathValuesBuffer:new N(t,{id:`${f}-closed-values-${o}`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,byteLength:Math.max(d,Float32Array.BYTES_PER_ELEMENT)})}}function xa(t,e,n,o){const r={pathValues:$n(n),pathScatterRanges:o.pathScatterRangesBuffer,pathScatterConfig:o.pathScatterConfigBuffer.buffer,outputPathValues:o.outputPathValuesBuffer.buffer},a=he(t,{id:`${e.id||"closed-arrow-paths"}-scatter`,source:la,shaderLayout:ua});if(n.pathData.length>0){const i=t.beginComputePass({});a.dispatch(i,{x:Math.ceil(n.pathData.length/64),bindings:r}),i.end(),t.submit()}a.destroy()}function $n(t){return{buffer:Ea(t.pathData),offset:t.pathData.byteOffset,...t.valueByteLength>0?{size:t.valueByteLength}:{}}}function Ea(t){return t.buffer instanceof N?t.buffer.buffer:t.buffer}function Ca(t,e,n){const o=new ArrayBuffer(16),r=new Float32Array(o),a=new Uint32Array(o);return r[0]=t,a[1]=e,a[2]=n,a}function va(t){return t.length>0?t:new Uint32Array(1)}function Wn(t,e,n){const o=new Int32Array(n+1);for(let r=0;r<n;r++){const a=t[r]??0,i=t[r+1]??a,s=Math.max(0,i-a);o[r+1]=o[r]+s+(e[r]?1:0)}return o}function ba(t,e){return{kind:"variable-length-attribute",valueOffsets:t,nullCount:0,valueByteLength:e}}async function Ta(t,e,n,o){const r=await gn(e.paths),a=Yn(Dt(e.paths)),i=r.data.map((u,l)=>Aa(u,n[l],a,o)),s=new M(i);return e.paths.format?V(t,s,{name:e.paths.name,format:e.paths.format,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}}):V(t,s,{name:e.paths.name,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}})}function Aa(t,e,n,o){if(!e)throw new Error("closeArrowPaths CPU fallback requires path chunk metadata");const r=ct(t),a=_a(r,e.valueOffsets,e.closedFlags,n,o,t.length),i=Wn(e.valueOffsets,a,t.length),s=La(r,e.valueOffsets,i,a,n,t.length);return Oa(t.type,i,s)}function _a(t,e,n,o,r,a){const i=new Uint32Array(a);for(let s=0;s<a;s++){if(!n[s])continue;const c=e[s]??0,u=e[s+1]??c,l=Math.max(0,u-c);if(l<=1)continue;const d=c+l-1;for(let f=0;f<o;f++){const h=t[c*o+f]??0,g=t[d*o+f]??0;if(!(Math.abs(h-g)<=r)){i[s]=1;break}}}return i}function La(t,e,n,o,r,a){const i=n[n.length-1]??0,s=new Float32Array(i*r);for(let c=0;c<a;c++){const u=e[c]??0,l=e[c+1]??u,d=n[c]??0,f=Math.max(0,l-u),h=u*r,g=l*r;if(s.set(t.subarray(h,g),d*r),o[c]&&f>0){const m=t.subarray(h,h+r);s.set(m,(d+f)*r)}}return s}function Oa(t,e,n){const o=t.children[0].type,r=new R(new T,0,n.length,0,{[D.DATA]:n}),a=new R(o,0,o.listSize===0?0:n.length/o.listSize,0,{},[r]);return new R(t,0,e.length-1,0,{[D.OFFSET]:e},[a])}function Yn(t){const e=t.children[0]?.type;if(!e||!_.isFixedSizeList(e))throw new Error("closeArrowPaths paths require FixedSizeList coordinate elements");return e.listSize}function Dt(t){return vo(t)}function zn(t,e){if(!e)return $(new T,4,t);const n=[];let o=0;for(const r of e){const a=o+r;n.push($(new T,4,t.slice(o*4,a*4)).data[0]),o=a}if(o*4!==t.length)throw new Error("Arrow path view-origin chunk rows must cover every source row");return new M(n)}function Tt(t,e){let n=0;for(const o of t.data){const r=n+o.length;o.buffer.write(e.subarray(n*4,r*4),o.byteOffset),n=r}if(n*4!==e.length)throw new Error("Arrow path view-origin GPU chunks must cover every source row")}function At(t,e,n){if(n.length<16)throw new Error("convertArrowPathToGPUVectors updateViewOrigins requires a 4x4 modelViewMatrix");for(let o=0;o<e.length/4;o++){const r=o*4,a=e[r]??0,i=e[r+1]??0,s=e[r+2]??0;t[r]=(n[0]??0)*a+(n[4]??0)*i+(n[8]??0)*s+(n[12]??0),t[r+1]=(n[1]??0)*a+(n[5]??0)*i+(n[9]??0)*s+(n[13]??0),t[r+2]=(n[2]??0)*a+(n[6]??0)*i+(n[10]??0)*s+(n[14]??0),t[r+3]=e[r+3]??0}}const et="segmentStartPositions",nt="segmentEndPositions",wt="segmentPreviousPositions",Pt="segmentNextPositions",we="segmentStartColors",Pe="segmentEndColors",yt="segmentFlags",St="rowIndices",ye="pathViewOrigins",Ia=1,Ra=2,Ba=4,Q=Float32Array.BYTES_PER_ELEMENT*16+Uint32Array.BYTES_PER_ELEMENT*4,Da=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),Ma={attributes:[{name:et,location:0,type:"vec4<f32>",stepMode:"instance"},{name:nt,location:1,type:"vec4<f32>",stepMode:"instance"},{name:we,location:2,type:"u32",stepMode:"instance"},{name:Pe,location:3,type:"u32",stepMode:"instance"},{name:ye,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]};function Va(t){if(t.rowTable.schema.fields.length>0&&t.rowTable.numRows!==t.paths.length)throw new Error("PathAttributeModel requires rowTable rows to match path rows");F(t.rowTable,et),F(t.rowTable,nt),F(t.rowTable,wt),F(t.rowTable,Pt),F(t.rowTable,we),F(t.rowTable,Pe),F(t.rowTable,yt),F(t.rowTable,St),F(t.rowTable,ye);const e=je(),n=Wa(t.rowTable),o=Ya(t.paths,t.viewOrigins,n),r=te(o.startIndices,t.rowIndexBase),a=te(o.startIndices),i=[],s={};for(const l of t.rowTable.schema.fields){const d=t.rowTable.getChild(l.name);!d||!pn(d.type)||(i.push(l),s[l.name]=bo(d,a))}i.push(pt(et,4)),i.push(pt(nt,4)),i.push(pt(wt,4)),i.push(pt(Pt,4)),i.push(new L(yt,new ht,!1)),i.push(new L(St,new ht,!1)),s[et]=$(new T,4,o.segmentStartPositions),s[nt]=$(new T,4,o.segmentEndPositions),s[wt]=$(new T,4,o.segmentPreviousPositions),s[Pt]=$(new T,4,o.segmentNextPositions),s[yt]=He(new ht,o.segmentFlags),s[St]=He(new ht,r);const c=je()-e,u=ui(s);return{table:new Y(new Pn(i,t.rowTable.schema.metadata),s),segmentLayout:o,segmentAttributeBuildTimeMs:c,attributeByteLength:u}}function Na(t,e){const n=Va({rowTable:e.rowTable,paths:e.paths,viewOrigins:e.viewOrigins,rowIndexBase:e.rowIndexBase}),o=xn({device:t,recordOffsets:n.segmentLayout.startIndices,recordByteStride:Q,resourceLabel:"PathAttributeModel expanded path vertex data"}),r=o.map(l=>ci(t,{id:e.id},{segmentTable:n,generatedBufferBatch:l})),a=o.map(l=>li(t,{id:e.id},n,l)),i=r[0],s=a[0];if(!i||!s)throw new Error("PathAttributeModel requires at least one generated path render batch");const c=o.map((l,d)=>({rowStart:l.rowStart,rowEnd:l.rowEnd,segmentCount:l.recordCount,expandedPathVertexData:r[d].buffer,pathViewOriginData:a[d].buffer}));let u=!1;return{segmentTable:n,segmentLayout:n.segmentLayout,expandedPathVertexData:i.buffer,pathViewOriginData:s.buffer,renderBatches:c,generatedBufferBatches:o,destroy:()=>{u||(u=!0,di(c))}}}function ze(t,e){if(!e.pathState)throw new Error("makePathAttributeModelProps requires pathState prepared by convertArrowPathToGPUVectors()");const{allowWebGLOnlyFormats:n,...o}=e,r=e.shaderLayout??Ma;return{...o,shaderLayout:r,ownsTable:!0,table:Go(t,si(e.pathState.segmentTable.table,e.pathState.generatedBufferBatches),{shaderLayout:r,allowWebGLOnlyFormats:n})}}async function Fa(t,e,n={}){Ua(e),Ga(e);const o=n.id||"arrow-path-model",r=Xa(e.paths),a=r.sourceOrigins,i=r.paths.data.map(P=>P.length),s=za(r.paths.type);let c=V(t,r.paths,{name:"paths",id:`${o}-paths`,format:s}),u=r.paths;if(e.closed){const P=await kn(t,{paths:c,closed:e.closed,epsilon:n.closeEpsilon??0,id:`${o}-closed`});c.destroy(),c=P,u=await gn(c)}const l=e.colors?V(t,e.colors,{name:"colors",id:`${o}-colors`,format:Ha(e.colors.type),preserveDataChunks:!0}):void 0,d=e.widths?V(t,e.widths,{name:"widths",id:`${o}-widths`,format:"float32",preserveDataChunks:!0}):void 0,f=new Float32Array(e.paths.length*4),h=a?zn(f,i):void 0,g=a?V(t,h,{name:ye,id:`${o}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;a&&(At(f,a,Da),Tt(g,f));const m={};e.colors&&(m.colors=e.colors),e.widths&&(m.widths=e.widths);const p=Na(t,{id:o,rowTable:new Y(m),paths:u,viewOrigins:h,rowIndexBase:n.rowIndexBase});let S=!1;return{id:o,paths:c,...l?{colors:l}:{},...d?{widths:d}:{},...g?{viewOrigins:g}:{},pathState:p,...a?{sourceOrigins:a}:{},updateViewOrigins:({modelViewMatrix:P})=>{!a||!g||(At(f,a,P),Tt(g,f),Qa(p,f))},destroy:()=>{S||(S=!0,p.destroy(),c.destroy(),l?.destroy(),d?.destroy(),g?.destroy())}}}function Ua(t){if($a(t.paths.type,"paths"),t.colors&&!Se(t.colors.type))throw new Error("convertArrowPathToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof T))throw new Error("convertArrowPathToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof fe))throw new Error("convertArrowPathToGPUVectors closed flags must be Vector<Bool>")}function Ga(t){const e=[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]];for(const[n,o]of e)if(o&&o.length!==t.paths.length)throw new Error(`convertArrowPathToGPUVectors ${n} rows must match paths rows (${o.length} !== ${t.paths.length})`);t.colors&&lt(t.colors.type)&&qn(t.paths,t.colors)}function ka(t,e){if(!Rt(t)||!_.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof T))throw new Error(`PathAttributeModel ${e} must be GPUVector<List<FixedSizeList<Float32>[2..4]>>`)}function $a(t,e){const n=Hn(t);if(!Rt(t)||!_.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(n instanceof T)&&!(n instanceof G))throw new Error(`convertArrowPathToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}function Hn(t){const e=t.children[0]?.type;return _.isFixedSizeList(e)?e.children[0]?.type:void 0}function Wa(t){const e=t.getChild("colors");if(e)return Se(e.type)?e:void 0}function Ya(t,e,n){ka(t.type,"paths"),e&&Ka(e,t.length),n&&ja(n,t);const o=xe(t.type),r=[0];for(const E of t.data){const P=E.valueOffsets;if(!P)throw new Error("PathAttributeModel source path chunks require Arrow list offsets");for(let v=0;v<E.length;v++){const A=P[v]??0,y=P[v+1]??A,C=Math.max(0,y-A-1);r.push((r[r.length-1]??0)+C)}}const a=r[r.length-1]??0,i=new Float32Array(a*4),s=new Float32Array(a*4),c=new Float32Array(a*4),u=new Float32Array(a*4),l=new Float32Array(a*4),d=new Uint32Array(a),f=new Uint32Array(a),h=new Uint32Array(a);f.fill(4294967295),h.fill(4294967295);const g=ei(e),m=ni(n);let p=0,S=0;for(const E of t.data){const P=E.valueOffsets;if(!P)throw new Error("PathAttributeModel source path chunks require Arrow list offsets");const v=ct(E),A=P[0]??0;for(let y=0;y<E.length;y++){const C=(P[y]??A)-A,x=(P[y+1]??C)-A,I=Math.max(0,x-C),b=Math.max(0,I-1),O=ti(v,o,C,I);oi(l,r[S]??p,b,g,S),ai(f,h,r[S]??p,b,m,S);for(let B=0;B<b;B++){const ut=C+B,Mt=ut+1,oo=B===0?O?x-2:ut:ut-1,ro=B===b-1?O?C+1:Mt:Mt+1;gt(i,p,v,ut,o),gt(s,p,v,Mt,o),gt(c,p,v,oo,o),gt(u,p,v,ro,o);let Vt=O?Ba:0;B===0&&(Vt|=Ia),B===b-1&&(Vt|=Ra),d[p]=Vt,p++}S++}}return{startIndices:r,segmentCount:a,segmentStartPositions:i,segmentEndPositions:s,segmentPreviousPositions:c,segmentNextPositions:u,segmentViewOrigins:l,segmentFlags:d,segmentStartColors:f,segmentEndColors:h}}function jn(t){return _.isFixedSizeList(t)&&t.listSize===4&&t.children[0]?.type instanceof rt}function lt(t){return _.isList(t)&&jn(t.children[0]?.type)}function Se(t){return jn(t)||lt(t)}function za(t){switch(xe(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("PathAttributeModel paths require 2, 3, or 4 coordinate components")}}function Ha(t){return lt(t)?"vertex-list<unorm8x4>":"unorm8x4"}function ja(t,e){if(!Se(t.type))throw new Error("PathAttributeModel colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.length!==e.length)throw new Error(`PathAttributeModel color rows must match path rows (${t.length} !== ${e.length})`);lt(t.type)&&qn(e,t)}function qn(t,e){if(t.data.length!==e.data.length)throw new Error("PathAttributeModel vertex color batch count must match path batch count");for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,r=e.data[n]?.valueOffsets;if(!o||!r||!qa(o,r))throw new Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function qa(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function Ka(t,e){if(!_.isFixedSizeList(t.type)||t.type.listSize!==4||!(t.type.children[0]?.type instanceof T))throw new Error("PathAttributeModel view origins must be Vector<FixedSizeList<Float32>[4]>");if(t.length!==e)throw new Error(`PathAttributeModel view origin rows must match path rows (${t.length} !== ${e})`)}function xe(t){const e=t.children[0]?.type;if(!e||!_.isFixedSizeList(e))throw new Error("PathAttributeModel paths require FixedSizeList coordinate elements");return e.listSize}function Xa(t){const e=Hn(t.type);if(e instanceof T)return{paths:t};if(!(e instanceof G))throw new Error("convertArrowPathToGPUVectors paths must contain Float32 or Float64 coordinates");const n=xe(t.type),o=Za(n),r=new Float64Array(t.length*4),a=[];let i=0;for(const s of t.data){const c=s.valueOffsets;if(!c)throw new Error("convertArrowPathToGPUVectors Float64 paths require Arrow list offsets");const u=ct(s),l=c[0]??0,d=new Int32Array(c.length),f=new Float32Array(u.length);for(let h=0;h<c.length;h++)d[h]=(c[h]??l)-l;for(let h=0;h<s.length;h++){const g=i+h,m=(c[h]??l)-l,p=(c[h+1]??l)-l,S=Math.max(0,p-m);let E=0,P=0,v=0,A=0;if(S>0){const C=m*n;E=u[C]??0,P=u[C+1]??0,n>2&&(v=u[C+2]??0),n>3&&(A=u[C+3]??0)}const y=g*4;r[y]=E,r[y+1]=P,r[y+2]=v,r[y+3]=A;for(let C=m;C<p;C++){const x=C*n;f[x]=(u[x]??0)-E,f[x+1]=(u[x+1]??0)-P,n>2&&(f[x+2]=(u[x+2]??0)-v),n>3&&(f[x+3]=(u[x+3]??0)-A)}}a.push(Ja(o,d,f)),i+=s.length}return{paths:new M(a),sourceOrigins:r}}function Za(t){const e=new q(t,new L("values",new T,!1));return new K(new L("coordinates",e,!1))}function Ja(t,e,n){const o=t.children[0].type,r=new R(new T,0,n.length,0,{[D.DATA]:n}),a=new R(o,0,o.listSize===0?0:n.length/o.listSize,0,{},[r]);return new R(t,0,e.length-1,0,{[D.OFFSET]:e},[a])}function Qa(t,e){const{segmentLayout:n}=t.segmentTable;for(let o=0;o<n.startIndices.length-1;o++){const r=n.startIndices[o]??0,a=n.startIndices[o+1]??r,i=o*4;for(let s=r;s<a;s++)n.segmentViewOrigins.set(e.subarray(i,i+4),s*4)}for(const[o,r]of t.generatedBufferBatches.entries()){const a=t.renderBatches[o];if(!a)continue;const i=new Float32Array(Math.max(r.recordCount*4,4));i.set(n.segmentViewOrigins.subarray(r.recordStart*4,r.recordEnd*4)),a.pathViewOriginData.write(i)}}function ti(t,e,n,o){if(o<3)return!1;const r=n*e,a=(n+o-1)*e;for(let i=0;i<e;i++)if(t[r+i]!==t[a+i])return!1;return!0}function ei(t){if(!t)return;const e=[];let n=0;for(const o of t.data){const r=n+o.length;e.push({rowStart:n,rowEnd:r,values:mn(o)}),n=r}return{chunks:e,currentChunkIndex:0}}function ni(t){if(!t)return;const e=[];let n=0;for(const o of t.data){const r=n+o.length;if(lt(o.type)){const a=o.valueOffsets;if(!a)throw new Error("PathAttributeModel vertex colors require Arrow list offsets");e.push({kind:"vertex",rowStart:n,rowEnd:r,valueOffsets:a,values:ct(o)})}else e.push({kind:"row",rowStart:n,rowEnd:r,values:mn(o)});n=r}return{chunks:e,currentChunkIndex:0}}function oi(t,e,n,o,r){if(!o||n===0)return;const a=ri(o,r),i=(r-a.rowStart)*4,s=a.values,c=s[i]??0,u=s[i+1]??0,l=s[i+2]??0,d=s[i+3]??0;for(let f=0;f<n;f++){const h=(e+f)*4;t[h]=c,t[h+1]=u,t[h+2]=l,t[h+3]=d}}function ri(t,e){let n=t.chunks[t.currentChunkIndex];for(;n&&e>=n.rowEnd;)t.currentChunkIndex++,n=t.chunks[t.currentChunkIndex];if(n&&e>=n.rowStart&&e<n.rowEnd)return n;throw new Error(`PathAttributeModel view origin row ${e} is missing`)}function ai(t,e,n,o,r,a){if(!r||o===0)return;const i=ii(r,a),s=a-i.rowStart;if(i.kind==="row"){const d=s*4,f=Ut(i.values,d);t.fill(f,n,n+o),e.fill(f,n,n+o);return}const c=i.valueOffsets[0]??0,u=(i.valueOffsets[s]??c)-c;if((i.valueOffsets[s+1]??u)-c-u<o+1)throw new Error("PathAttributeModel vertex colors must provide one color per path vertex");for(let d=0;d<o;d++){const f=n+d;t[f]=Ut(i.values,(u+d)*4),e[f]=Ut(i.values,(u+d+1)*4)}}function ii(t,e){let n=t.chunks[t.currentChunkIndex];for(;n&&e>=n.rowEnd;)t.currentChunkIndex++,n=t.chunks[t.currentChunkIndex];if(n&&e>=n.rowStart&&e<n.rowEnd)return n;throw new Error(`PathAttributeModel color row ${e} is missing`)}function Ut(t,e){return((t[e]??255)|(t[e+1]??255)<<8|(t[e+2]??255)<<16|(t[e+3]??255)<<24)>>>0}function gt(t,e,n,o,r){const a=e*4,i=o*r;for(let s=0;s<r;s++)t[a+s]=n[i+s]??0}function si(t,e){const n=new Set([et,nt,wt,Pt,we,Pe,yt,St]),o=[],r={};for(const s of t.schema.fields){if(n.has(s.name))continue;const c=t.getChild(s.name);c&&(o.push(s),r[s.name]=c)}const a=new Y(new Pn(o,new Map(t.schema.metadata)),r);if(!e||e.length<=1||o.length===0)return a;const i=e.flatMap(s=>a.slice(s.recordStart,s.recordEnd).batches);return new Y(a.schema,i)}function ci(t,e,{segmentTable:n,generatedBufferBatch:o}){const{segmentLayout:r}=n,a=o.byteLength,i=new ArrayBuffer(Math.max(a,Q)),s=new Float32Array(i),c=new Uint32Array(i),u=te(r.startIndices);for(let l=o.recordStart;l<o.recordEnd;l++){const d=l-o.recordStart,f=d*Q/Float32Array.BYTES_PER_ELEMENT,h=d*Q/Uint32Array.BYTES_PER_ELEMENT,g=l*4;s.set(r.segmentStartPositions.subarray(g,g+4),f),s.set(r.segmentEndPositions.subarray(g,g+4),f+4),s.set(r.segmentPreviousPositions.subarray(g,g+4),f+8),s.set(r.segmentNextPositions.subarray(g,g+4),f+12),c[h+16]=r.segmentFlags[l],c[h+17]=u[l],c[h+18]=r.segmentStartColors[l],c[h+19]=r.segmentEndColors[l]}return{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-expanded-path-vertex-data-${o.rowStart}`,usage:w.VERTEX|w.COPY_DST|w.COPY_SRC,data:new Uint8Array(i,0,Math.max(a,Q))}),byteLength:a}}function li(t,e,n,o){const r=Float32Array.BYTES_PER_ELEMENT*4,a=o.recordCount*r,i=new Float32Array(Math.max(o.recordCount*4,4)),s=o.recordStart*4,c=o.recordEnd*4;return i.set(n.segmentLayout.segmentViewOrigins.subarray(s,c)),{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-path-view-origin-data-${o.rowStart}`,usage:w.VERTEX|w.COPY_DST|w.COPY_SRC,data:i}),byteLength:a}}function te(t,e=0){const n=t[t.length-1]??0,o=new Uint32Array(n);for(let r=0;r<t.length-1;r++)o.fill(e+r,t[r],t[r+1]);return o}function F(t,e){if(t.getChild(e))throw new Error(`PathAttributeModel rowTable column "${e}" is reserved`)}function pt(t,e){return new L(t,new q(e,new L("value",new T,!1)),!1)}function He(t,e){return Fo(Bt({type:t,length:e.length,data:e}))}function ui(t){let e=0;for(const n of Object.values(t))pn(n.type)&&(e+=To(n).byteLength);return e}function di(t){const e=new Set(t.flatMap(n=>[n.expandedPathVertexData,n.pathViewOriginData]));for(const n of e)n.destroy()}function je(){return typeof performance>"u"?Date.now():performance.now()}const hi=`
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
`,fi={bindings:[{name:"sourcePathValues",type:"read-only-storage",group:0,location:0},{name:"sourcePathValueOffsets",type:"read-only-storage",group:0,location:1},{name:"pathDeltaConfig",type:"read-only-storage",group:0,location:2},{name:"pathDeltaValues",type:"storage",group:0,location:3}],attributes:[]};async function gi(t,e,n={}){if(t.type!=="webgpu")throw new Error("convertArrowPathFloat64ToGPUVector requires a WebGPU device");const o=mi(e.type),r=Pi(o),a=wi(o),i=[],s=new Float64Array(e.length*4),c=[];let u=0;for(const[l,d]of e.data.entries()){const f=ct(d),h=yi(d);Si(s,u,f,h,o);const g=new N(t,{id:`${n.id||"arrow-path-storage-model"}-source-path-values-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,...f.length>0?{data:f}:{byteLength:Float64Array.BYTES_PER_ELEMENT}}),m=t.createBuffer({id:`${n.id||"arrow-path-storage-model"}-source-path-value-offsets-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(h)}),p=t.createBuffer({id:`${n.id||"arrow-path-storage-model"}-path-delta-config-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array([d.length,o])}),S=new N(t,{id:`${n.id||"arrow-path-storage-model"}-path-delta-values-${l}`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,f.length*Float32Array.BYTES_PER_ELEMENT)});pi(t,n,{chunkIndex:l,rowCount:d.length,sourcePathValues:g,sourcePathValueOffsets:m,pathDeltaConfig:p,pathDeltaValues:S}),i.push(new hn({buffer:S,dataType:r,format:a,length:d.length,valueLength:f.length/o,stride:o,byteStride:o*Float32Array.BYTES_PER_ELEMENT,rowByteLength:o*Float32Array.BYTES_PER_ELEMENT,ownsBuffer:!0,valueOffsets:h,readbackMetadata:{kind:"variable-length-attribute",valueOffsets:h,nullCount:0,valueByteLength:f.length*Float32Array.BYTES_PER_ELEMENT}})),c.push(g,m,p),u+=d.length}await xi(t);for(const l of c)l.destroy();return{paths:new U({type:"data",name:"paths",dataType:r,format:a,data:i,stride:o,byteStride:o*Float32Array.BYTES_PER_ELEMENT,rowByteLength:o*Float32Array.BYTES_PER_ELEMENT,ownsData:!0}),sourceOrigins:s}}function pi(t,e,n){const o={sourcePathValues:n.sourcePathValues,sourcePathValueOffsets:n.sourcePathValueOffsets,pathDeltaConfig:n.pathDeltaConfig,pathDeltaValues:n.pathDeltaValues},r=he(t,{id:`${e.id||"arrow-path-storage-model"}-path-delta-compute-${n.chunkIndex}`,source:hi,modules:[go],shaderLayout:fi});if(n.rowCount>0){const a=t.beginComputePass({});r.dispatch(a,{x:Math.ceil(n.rowCount/64),bindings:o}),a.end(),t.submit()}r.destroy()}function mi(t){const e=t.children[0]?.type;if(!e||!_.isFixedSizeList(e))throw new Error("Float64 path conversion requires FixedSizeList coordinate elements");return e.listSize}function wi(t){switch(t){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("convertArrowPathFloat64ToGPUVector paths require 2, 3, or 4 components")}}function Pi(t){const e=new q(t,new L("values",new T,!1));return new K(new L("coordinates",e,!1))}function yi(t){const e=t.valueOffsets;if(!e)throw new Error("Float64 path conversion requires Arrow list offsets");const n=e[0]??0;return Int32Array.from(e,o=>o-n)}function Si(t,e,n,o,r){for(let a=0;a<o.length-1;a++){const i=o[a]??0,s=o[a+1]??i,c=Math.max(0,s-i),u=(e+a)*4;if(c===0)continue;const l=i*r;t[u]=n[l]??0,t[u+1]=n[l+1]??0,r>2&&(t[u+2]=n[l+2]??0),r>3&&(t[u+3]=n[l+3]??0)}}async function xi(t){await t.handle?.queue?.onSubmittedWorkDone?.()}async function Kn(t,e,n={}){if(t.type!=="webgpu")throw new Error("convertArrowPathStorageToGPUVectors requires a WebGPU device");vi(e),bi(e);const o=n.id||"arrow-path-storage-model",r=await Li(t,e.paths,{id:o});let a=r.paths;if(e.closed){const p=await kn(t,{paths:a,closed:e.closed,epsilon:n.closeEpsilon??0,id:`${o}-closed`});a.destroy(),a=p}const i=e.colors?V(t,e.colors,{name:"colors",id:`${o}-colors`,format:Ci(e.colors.type),preserveDataChunks:!0}):void 0,s=e.widths?V(t,e.widths,{name:"widths",id:`${o}-widths`,preserveDataChunks:!0}):void 0,c=e.timestamps?await Ao(t,e.timestamps,{name:"timestamps",id:`${o}-timestamps`}):void 0,u=c?.temporal,l=r.sourceOrigins,d=new Float32Array(e.paths.length*4),f=l?zn(d,r.paths.data.map(p=>p.length)):void 0,h=l?V(t,f,{name:"pathViewOrigins",id:`${o}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;l&&h&&(At(d,l,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),Tt(h,d));let g=!1;const m=({modelViewMatrix:p})=>{!l||!h||(At(d,l,p),Tt(h,d))};return{id:o,paths:a,...i?{colors:i}:{},...s?{widths:s}:{},...u?{timestamps:u}:{},...h?{viewOrigins:h}:{},rowIndexBase:n.rowIndexBase,...l?{sourceOrigins:l}:{},updateViewOrigins:m,destroy:()=>{g||(g=!0,a.destroy(),i?.destroy(),s?.destroy(),c?.destroy(),h?.destroy())}}}function Xn(t){return _.isFixedSizeList(t)&&t.listSize===4&&t.children[0]?.type instanceof rt}function Ee(t){return _.isList(t)&&Xn(t.children[0]?.type)}function Ei(t){return Xn(t)||Ee(t)}function Ci(t){return Ee(t)?"vertex-list<unorm8x4>":"unorm8x4"}function vi(t){if(Ti(t.paths.type,"paths"),t.colors&&!Ei(t.colors.type))throw new Error("convertArrowPathStorageToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof T))throw new Error("convertArrowPathStorageToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof fe))throw new Error("convertArrowPathStorageToGPUVectors closed flags must be Vector<Bool>");if(t.timestamps&&!(_.isList(t.timestamps.type)&&t.timestamps.type.children[0]?.type&&(_.isDate(t.timestamps.type.children[0].type)||_.isTime(t.timestamps.type.children[0].type)||_.isTimestamp(t.timestamps.type.children[0].type)||_.isDuration(t.timestamps.type.children[0].type))))throw new Error("convertArrowPathStorageToGPUVectors timestamps must be Vector<List<Date|Time|Timestamp|Duration>>")}function bi(t){const e=[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]];for(const[n,o]of e)if(o&&o.length!==t.paths.length)throw new Error(`convertArrowPathStorageToGPUVectors ${n} rows must match paths rows (${o.length} !== ${t.paths.length})`);t.colors&&Ee(t.colors.type)&&Ai(t.paths,t.colors)}function Ti(t,e){const n=Zn(t);if(!Rt(t)||!_.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(n instanceof T)&&!(n instanceof G))throw new Error(`convertArrowPathStorageToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}function Ai(t,e){if(t.data.length!==e.data.length)throw new Error("convertArrowPathStorageToGPUVectors vertex color batch count must match paths");for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,r=e.data[n]?.valueOffsets;if(!o||!r||!_i(o,r))throw new Error("convertArrowPathStorageToGPUVectors vertex colors must align with paths")}}function _i(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function Zn(t){const e=t.children[0]?.type;return _.isFixedSizeList(e)?e.children[0]?.type:void 0}async function Li(t,e,n){const o=Zn(e.type);if(o instanceof T)return{paths:V(t,e,{name:"paths",id:`${n.id||"arrow-path-storage-model"}-paths`,format:Oi(e.type),preserveDataChunks:!0})};if(!(o instanceof G))throw new Error("convertArrowPathStorageToGPUVectors paths must contain Float32 or Float64");return gi(t,e,n)}function Oi(t){switch(Ii(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("convertArrowPathStorageToGPUVectors paths require 2, 3, or 4 components")}}function Ii(t){const e=t.children[0]?.type;if(!e||!_.isFixedSizeList(e))throw new Error("convertArrowPathStorageToGPUVectors paths require FixedSizeList coordinates");return e.listSize}function Ri(t,e,n={}){return Fa(t,e,n)}function Bi(t,e,n={}){return Kn(t,e,n)}function Di(t,e,n={}){if(!e.timestamps)throw new Error("convertArrowTripsToStorage requires a timestamps column");return Kn(t,e,n)}class Gt{static async convertToGPUVectors(e,n,o={}){const{model:r="attribute",...a}=o;switch(r){case"storage":return Bi(e,n,a);case"trips":return Di(e,n,a);case"attribute":return Ri(e,n,a)}}static makeModelProps(e,n){return ze(e,n)}static createModel(e,n){switch(n.model){case"storage":{const{model:o,...r}=n;return new X(e,r)}case"trips":{const{model:o,...r}=n;return new me(e,r)}case"attribute":case void 0:{const{model:o,...r}=n;return new ge(e,ze(e,r))}}throw new Error("ArrowPathRenderer received unsupported model")}}const Mi=[199,219,245,255],Vi=.0035,qe="constantPathColor",Ke="constantPathWidth",Xe="constantPathTemporal",Ni=`#version 300 es
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
`,Fi={attributes:[{name:"segmentStartPositions",location:0,type:"vec4<f32>",stepMode:"instance"},{name:"segmentEndPositions",location:1,type:"vec4<f32>",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"},{name:"segmentStartColors",location:3,type:"u32",stepMode:"instance"},{name:"segmentEndColors",location:4,type:"u32",stepMode:"instance"},{name:"widths",location:5,type:"f32",stepMode:"instance"},{name:"pathViewOrigins",location:6,type:"vec4<f32>",stepMode:"instance"},{name:"currentTime",location:7,type:"f32",stepMode:"instance"},{name:"trailLength",location:8,type:"f32",stepMode:"instance"},{name:"temporalEnabled",location:9,type:"f32",stepMode:"instance"}],bindings:[]},Ui=`#version 300 es
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
`,Gi=`
${wn}

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
`,ki={attributes:[{name:"segmentStartPointIndices",location:0,type:"u32",stepMode:"instance"},{name:"segmentFlags",location:1,type:"u32",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"},{name:"currentTime",location:3,type:"f32",stepMode:"instance"},{name:"trailLength",location:4,type:"f32",stepMode:"instance"},{name:"temporalEnabled",location:5,type:"f32",stepMode:"instance"},{name:"fadeTrail",location:6,type:"f32",stepMode:"instance"}],bindings:[]},$i=`
${wn}

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
`,Lt=class Lt extends ue{getAttributeManager(){return null}setShaderModuleProps(e){super.setShaderModuleProps(this.context.device.type==="webgpu"?{layer:e.layer,picking:e.picking}:{layer:e.layer,project:e.project,picking:e.picking})}initializeState(){this.setState({batches:[],loadVersion:0,sourceInitialized:!1,gpuVectorSourceCache:new Map})}updateState({props:e,oldProps:n,changeFlags:o}){const r=this.getLayerState(),a=!r.sourceInitialized||o.dataChanged||e.paths!==n.paths||e.model!==n.model||e.colors!==n.colors||e.widths!==n.widths,i=e.timestamps!==n.timestamps;if(a||i){r.sourceInitialized=!0,this.loadSource(e);return}if(e.currentTime!==n.currentTime||e.trailLength!==n.trailLength||e.temporalEnabled!==n.temporalEnabled||e.fadeTrail!==n.fadeTrail){for(const s of r.batches)Hi(s,e);this.setNeedsRedraw()}}getModels(){return this.state?.batches.map(e=>e.model)??[]}draw({renderPass:e,context:n}){for(const{model:o}of this.getLayerState().batches)o.device.type==="webgpu"&&Lo(o,n.viewport),o.draw(e)}getPickingInfo({info:e}){const n=e,o=n.index,r=this.getLayerState().batches.find(a=>o>=a.rowIndexOffset&&o<a.rowIndexOffset+a.rowCount);return r&&(n.arrow={rowIndex:o,batchIndex:r.batchIndex,batchRowIndex:o-r.rowIndexOffset}),n}finalizeState(e){const n=this.getLayerState();n.cancelLoad?.(),n.loadVersion++,tn(n.batches),this.setState({batches:[],loadVersion:n.loadVersion,sourceInitialized:!0,gpuVectorSourceCache:new Map}),super.finalizeState(e)}async loadSource(e){const n=this.getLayerState();n.cancelLoad?.();const o=n.loadVersion+1;n.loadVersion=o;const r=n.batches;this.setState({batches:[],loadVersion:o,sourceInitialized:!0}),tn(r),this.setNeedsRedraw();try{e.data?await this.loadRecordBatchSource(e,e.data,o):e.paths&&typeof e.paths!="string"&&await this.appendSourceBatch(e,void 0,0,0,o)}catch(a){this.isActiveLoad(o)&&(e.onDataError?e.onDataError(a):this.raiseError(Ki(a),`loading Arrow data in ${this}`))}}async loadRecordBatchSource(e,n,o){if(!this.isActiveLoad(o))return;const r=Oo(n);let a;const i=()=>(a??=(async()=>{await r.return?.()})(),a);let s;const c=new Promise(h=>{s=()=>h({done:!0,value:void 0})}),u=()=>{s(),i().catch(()=>{})},l=this.getLayerState();l.cancelLoad=u;let d=0,f=0;try{for(;this.isActiveLoad(o);){const h=await Promise.race([r.next(),c]);if(h.done||!this.isActiveLoad(o))return;await this.appendSourceBatch(e,h.value,d,f,o),f+=h.value.numRows,d++}}finally{l.cancelLoad===u&&(l.cancelLoad=void 0),await i()}}async appendSourceBatch(e,n,o,r,a){const i=ji(this.context.device,e.model),s=Oe(e.colors,Be),c=Oe(e.widths,De),u=Ie(e.colors,Mi,Be),l=Ie(e.widths,Vi,De),d=this.resolveNamedBatchStyleSource(s,n,"color",u),f=this.resolveNamedBatchStyleSource(c,n,"width",l);k(d)&&Io("ArrowPathLayer color",d),k(f)&&Ro("ArrowPathLayer width",f,["float32"]);const h=i==="storage"&&k(d)?void 0:await this.resolvePathStyleSource(d,r,n?.numRows,!0),g=i==="storage"&&k(f)?void 0:await this.resolvePathStyleSource(f,r,n?.numRows,!1);let m=Ko(i==="storage"?X:ge,{data:n,selectors:{paths:e.paths,colors:h??null,widths:g??null,...i==="storage"&&e.timestamps!==void 0?{timestamps:e.timestamps}:{}}});m.colors&&!_.isList(m.colors.type)&&(m={...m,colors:await Bo(this.context.device,m.colors,`${e.id}-batch-${o}-arrow-colors`)}),m=Wi(m,u,l);const p=await Gt.convertToGPUVectors(this.context.device,m,{model:i,id:`${e.id}-batch-${o}`,rowIndexBase:r});if(!this.isActiveLoad(a)){p.destroy();return}let S=null,E=p.colors;if(i==="storage"&&k(d)){try{const O=Qe(d,o,m.paths.length),B=await Do(this.context.device,O,`${e.id}-batch-${o}-colors`);E=B.vector,S=B.converted?B.vector:null}catch(O){throw p.destroy(),O}if(!this.isActiveLoad(a)){S?.destroy(),p.destroy();return}}const P=i==="storage"&&k(f)?Qe(f,o,m.paths.length):p.widths,v=E??new Le({format:"unorm8x4",value:new Uint8Array(u)}),A=P??new Le({format:"float32",value:new Float32Array([l])}),y=zi(this.context.device,{id:`${e.id}-batch-${o}`,hasColors:i==="storage"||!!m.colors,hasWidths:i==="storage"||!!m.widths,color:u,width:l,currentTime:e.currentTime??0,trailLength:e.trailLength??0,temporalEnabled:e.temporalEnabled??!1,timestampColumnEnabled:!!m.timestamps,fadeTrail:e.fadeTrail??!1});let C;try{i==="storage"?C=Gt.createModel(this.context.device,{...p,model:"storage",id:`${e.id}-batch-${o}`,...this.getShaders({modules:[Re,mt],source:$i}),shaderLayout:ki,bufferLayout:y.bufferLayout,attributes:y.attributes,bindings:{pathTimestamps:y.defaultTimestampBuffer},...v instanceof U?{colors:v}:{color:u},...A instanceof U?{widths:A}:{width:l},topology:"triangle-list",vertexCount:6}):C=Gt.createModel(this.context.device,{...p,model:"attribute",id:`${e.id}-batch-${o}`,...this.getShaders(this.context.device.type==="webgpu"?{modules:[Re,mt],source:Gi}:{modules:[fn,mt],vs:Ui,fs:Ni}),shaderLayout:Fi,...v instanceof U?{colors:v}:{},...A instanceof U?{widths:A}:{},bufferLayout:y.bufferLayout,attributes:y.attributes,constantAttributes:y.constantAttributes,topology:"triangle-list",vertexCount:6})}catch(O){throw ee(y.buffers),S?.destroy(),p.destroy(),O}if(!this.isActiveLoad(a)){C.destroy(),ee(y.buffers),S?.destroy(),p.destroy();return}const x=m.paths.length,I={model:C,prepared:p,constantBuffers:y.buffers,batchIndex:o,rowIndexOffset:r,rowCount:x,temporalBuffer:y.temporalBuffer,timestampColumnEnabled:!!m.timestamps,convertedColorVector:S},b=[...this.getLayerState().batches,I];this.setState({batches:b,loadVersion:a,sourceInitialized:!0}),this.setNeedsRedraw(),Mo(C,()=>{this.isActiveLoad(a)&&this.setNeedsRedraw()},O=>{this.isActiveLoad(a)&&(e.onDataError?e.onDataError(O):this.raiseError(O,`linking Arrow shaders in ${this}`))}),e.onDataBatch?.({loadedBatchCount:b.length,isFirstBatch:o===0,batchIndex:o,rowIndexOffset:r,rowCount:x})}isActiveLoad(e){return this.getLayerState().loadVersion===e}async resolvePathStyleSource(e,n,o,r){if(!k(e))return e;const a=this.getLayerState().gpuVectorSourceCache;let i=a.get(e);i||(i=Vo(this.context.device,e,`${this.id}-${r?"colors":"values"}`,r),a.set(e,i));const s=await i;return o===void 0?s:s.slice(n,n+o)}resolveNamedBatchStyleSource(e,n,o,r){if(typeof e!="string"||No(n,e))return e;po.warn(`${this.id}: ArrowPathLayer ${o} column "${e}" is missing; using ${o} default ${JSON.stringify(r)}`)()}getLayerState(){return this.state}};Lt.layerName="ArrowPathRendererLayer",Lt.defaultProps={data:{type:"object",value:null,optional:!0},parameters:_o};let j=Lt;function Wi(t,e,n){const o=t.colors,r=t.widths;return{...t,...o&&Je(o)?{colors:Yi(t.paths,o,e)}:{},...r&&Je(r)?{widths:yn(Array.from({length:r.length},(a,i)=>r.get(i)??n),r.type)}:{}}}function Yi(t,e,n){const o=Array.from({length:e.length},(r,a)=>{const i=e.get(a);if(_.isList(e.type)){const s=t.get(a),c=s?Array.from(s).length:0;return i?Array.from(i,u=>Ze(u,n)):Array.from({length:c},()=>n)}return Ze(i,n)});return yn(o,e.type)}function Ze(t,e){if(!t||typeof t!="object"||!(Symbol.iterator in t))return e;const n=Array.from(t);return[n[0]??e[0],n[1]??e[1],n[2]??e[2],n[3]??e[3]]}function Je(t){return t.data.some(e=>Jn(e))}function Jn(t){return t.nullCount>0||t.children.some(Jn)}function Qe(t,e,n){const o=t.data.length===1&&e===0&&t.length===n,r=o?t.data[0]:t.data[e];if(!r||r.length!==n)throw new Error(`ArrowPathLayer GPUVector "${t.name}" batch ${e} rows must match paths rows`);return o?t:new U({type:"data",name:`${t.name}-batch-${e}`,format:t.format,data:[r],ownsData:!1})}function zi(t,{id:e,hasColors:n,hasWidths:o,color:r,width:a,currentTime:i,trailLength:s,temporalEnabled:c,timestampColumnEnabled:u,fadeTrail:l}){const d=[],f={},h={},g=[];let m=null,p=null;if(!n){const E=new Uint32Array([qi(r),0,0,0]);if(d.push({name:qe,byteStride:0,stepMode:"instance",attributes:[{attribute:"segmentStartColors",format:"uint32",byteOffset:0},{attribute:"segmentEndColors",format:"uint32",byteOffset:0}]}),t.type==="webgl")h.segmentStartColors=E,h.segmentEndColors=E;else{const P=t.createBuffer({id:`${e}-constant-color`,data:E});f[qe]=P,g.push(P)}}if(!o){const E=new Float32Array([a]);if(d.push({name:Ke,byteStride:0,stepMode:"instance",attributes:[{attribute:"widths",format:"float32",byteOffset:0}]}),t.type==="webgl")h.widths=E;else{const P=t.createBuffer({id:`${e}-constant-width`,data:E});f[Ke]=P,g.push(P)}}const S=Qn({currentTime:i,trailLength:s,temporalEnabled:c,timestampColumnEnabled:u,fadeTrail:l});return d.push({name:Xe,byteStride:0,stepMode:"instance",attributes:[{attribute:"currentTime",format:"float32",byteOffset:0},{attribute:"trailLength",format:"float32",byteOffset:4},{attribute:"temporalEnabled",format:"float32",byteOffset:8},{attribute:"fadeTrail",format:"float32",byteOffset:12}]}),t.type==="webgl"?(h.currentTime=S.subarray(0,1),h.trailLength=S.subarray(1,2),h.temporalEnabled=S.subarray(2,3),h.fadeTrail=S.subarray(3,4)):(m=t.createBuffer({id:`${e}-constant-temporal`,data:S}),f[Xe]=m,g.push(m),p=t.createBuffer({id:`${e}-default-timestamp`,data:new Float32Array([0]),usage:w.STORAGE}),g.push(p)),{bufferLayout:d,attributes:f,constantAttributes:h,buffers:g,temporalBuffer:m,defaultTimestampBuffer:p}}function Hi(t,e){const n=Qn({currentTime:e.currentTime??0,trailLength:e.trailLength??0,temporalEnabled:e.temporalEnabled??!1,timestampColumnEnabled:t.timestampColumnEnabled,fadeTrail:e.fadeTrail??!1});t.model.device.type==="webgl"?t.model.setConstantAttributes({currentTime:n.subarray(0,1),trailLength:n.subarray(1,2),temporalEnabled:n.subarray(2,3),fadeTrail:n.subarray(3,4)}):t.temporalBuffer?.write(n)}function Qn({currentTime:t,trailLength:e,temporalEnabled:n,timestampColumnEnabled:o,fadeTrail:r}){const a=o?2:n?1:0;return new Float32Array([t,e,a,r?1:0])}function ji(t,e="auto"){if(e==="storage"&&t.type!=="webgpu")throw new Error("ArrowPathLayer storage rendering requires WebGPU");return e==="auto"?t.type==="webgpu"?"storage":"attribute":e}function qi(t){const[e,n,o,r]=t.map(a=>Math.max(0,Math.min(255,Math.round(a))));return(e|n<<8|o<<16|r<<24)>>>0}function ee(t){for(const e of t)e.destroy()}function tn(t){for(const e of t)e.model.destroy(),ee(e.constantBuffers),e.convertedColorVector?.destroy(),e.prepared.destroy()}function Ki(t){return t instanceof Error?t:new Error(String(t))}function Xi(t,e){let n=0;for(const[o,r]of t.data.entries()){if(e<n+r.length)return{rowIndex:e,batchIndex:o,batchRowIndex:e-n};n+=r.length}return{rowIndex:e,batchIndex:-1,batchRowIndex:-1}}const Ot=class Ot extends Ct{renderLayers(){const{data:e,paths:n,colors:o,widths:r,...a}=this.props;return xt(n)?new oe({...a,...this.getSubLayerProps({id:"storage"}),paths:n,colors:o,widths:r}):new j({...a,...this.getSubLayerProps({id:"arrow"}),data:e,parameters:{...j.defaultProps.parameters,...this.props.parameters},paths:n,colors:o,widths:r})}getModels(){return this.getSubLayers().flatMap(e=>e.getModels())}};Ot.layerName="StoragePathLayer",Ot.defaultProps={data:j.defaultProps.data};let ne=Ot;const Zi={attributes:[{name:"segmentStartPointIndices",location:0,type:"u32",stepMode:"instance"},{name:"segmentFlags",location:1,type:"u32",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"}],bindings:[]},Ji=`
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
`,Qi=`
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
`,ts=`
  varyings.pathPickingColor = picking_getPickingColorFromIndex(rowIndex);
  let timestamp = pathLayerStyle.temporalMode == 2u;
  varyings.measure = select(
    mix(startPoint.w, endPoint.w, corner.x),
    pathTimestamps[select(start, end, corner.x > 0.0)],
    timestamp
  );
`,es=En({vertexEntry:Ji,vertexSetup:Qi,vertexOutput:ts,pickingFilter:"",extraVaryings:"@location(9) measure: f32, @location(10) @interpolate(flat) pathPickingColor: vec3<f32>,",fragmentFilter:`
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
  `}),Te=class Te extends ue{getAttributeManager(){return null}initializeState({device:e}){if(e.type!=="webgpu")throw new Error("StoragePathLayer requires WebGPU");this.setState({model:null,temporalBuffer:null,defaultTimestampBuffer:null}),this.createModel()}updateState({props:e}){const n=this.state.model?.userData.boundInputs??[];(e.paths!==n[0]||e.colors!==n[1]||e.widths!==n[2]||e.timestamps!==n[3]||e.viewOrigins!==n[4]||!!e.antialiasing!==n[5])&&(this.destroyModel(),this.createModel())}getModels(){const e=this.state?.model;return e?[e]:[]}draw({renderPass:e}){const{model:n,temporalBuffer:o}=this.state;if(!n||!o)return;const r=new ArrayBuffer(16),a=new Float32Array(r),i=new Uint32Array(r);a.set([this.props.currentTime??0,this.props.trailLength??0]),i.set([this.props.timestamps?2:this.props.currentTime!==void 0?1:0,this.props.fadeTrail?1:0],2),n.shaderInputs.setProps({path:{widthScale:this.props.widthScale??1,widthMinPixels:this.props.widthMinPixels??0,widthMaxPixels:this.props.widthMaxPixels??Number.MAX_SAFE_INTEGER,miterLimit:this.props.miterLimit??4,widthUnits:mo[this.props.widthUnits??"pixels"],jointType:+!!this.props.jointRounded,capType:+!!this.props.capRounded,billboard:this.props.billboard??!0}}),o.write(new Uint8Array(r)),n.draw(e)}getPickingInfo({info:e}){const n=e;return n.gpuVector=Xi(this.props.paths,n.index),n}finalizeState(e){this.destroyModel(),super.finalizeState(e)}createModel(){const{device:e}=this.context,n=e.createBuffer({id:`${this.id}-temporal-style`,byteLength:16,usage:w.UNIFORM|w.COPY_DST}),o=e.createBuffer({id:`${this.id}-default-timestamp`,data:new Float32Array([0]),usage:w.STORAGE|w.COPY_DST}),r=xt(this.props.colors)?void 0:ns(this.props.colors??[0,0,0,255]),a=new X(e,{...this.getShaders({modules:[fn,Yo,mt,qo],plugins:[Ho],defines:this.props.antialiasing?{ANTIALIASING:1}:{},source:es}),id:`${this.id}-model`,shaderLayout:Zi,paths:this.props.paths,...xt(this.props.colors)?{colors:this.props.colors}:{color:r},...xt(this.props.widths)?{widths:this.props.widths}:{width:typeof this.props.widths=="number"?this.props.widths:1},...this.props.timestamps?{timestamps:this.props.timestamps}:{},...this.props.viewOrigins?{viewOrigins:this.props.viewOrigins}:{},bindings:{pathLayerStyle:n,pathTimestamps:o},topology:"triangle-list",vertexCount:12});a.userData.boundInputs=[this.props.paths,this.props.colors,this.props.widths,this.props.timestamps,this.props.viewOrigins,!!this.props.antialiasing],this.setState({model:a,temporalBuffer:n,defaultTimestampBuffer:o})}destroyModel(){const e=this.state;e.model?.destroy(),e.temporalBuffer?.destroy(),e.defaultTimestampBuffer?.destroy(),this.setState({model:null,temporalBuffer:null,defaultTimestampBuffer:null})}};Te.layerName="PreparedPathLayer";let oe=Te;function ns(t){return[t[0],t[1],t[2],t[3]??255]}function xt(t){return!!(t&&typeof t=="object"&&"data"in t&&"format"in t)}const It=class It extends Ct{renderLayers(){return new ne({...this.props,...this.getSubLayerProps({id:"path"}),data:this.props.data})}getModels(){return this.getSubLayers().flatMap(e=>e.getModels())}};It.layerName="ArrowPathLayer",It.defaultProps=j.defaultProps;let re=It;const os=1700000000000n,to=1e3,ae=1.48,rs=220,as=10,is=1e3,ss=240,en=12,nn=13,on=15,rn=3,an=6,cs=24,ie={240:{pathCount:240,pointCount:18,label:"240 paths, 4.1K segments"},960:{pathCount:960,pointCount:22,label:"960 paths, 20K segments"},2400:{pathCount:2400,pointCount:26,label:"2.4K paths, 60K segments"}};function ls(t,e,n,o,r,a=null){const i=sn(),s=n,c=o,u=r,l=c!=="vertex-colors"&&u!=="timestamps",d=fs(t.pathCount,t.pointCount,e,s,l,a),f=u==="timestamps"?Ss(t.pathCount,t.pointCount,a):void 0,h=c==="none"?void 0:c==="vertex-colors"?xs(t.pathCount,t.pointCount,a):Es(t.pathCount,a),g=Cs(t.pathCount,a),m=sn()-i,p=dt(d)+(f?dt(f):0),S=(h?dt(h):0)+dt(g);return{sourceVectors:{paths:d,...h?{colors:h}:{},widths:g,...f?{timestamps:f}:{}},pathArrowByteLength:p,styleArrowByteLength:S,arrowVectorBuildTimeMs:m}}function us(t){return new Y(t.sourceVectors).batches}async function*ds(t){for(let e=0;e<t.length;e++){e>0&&await hs();const n=t[e];n&&(yield n)}}function hs(){return new Promise(t=>{setTimeout(t,is)})}function fs(t,e,n,o,r,a=null){if(o==="dense-union")return n==="polygons"?ps(t,a):gs(t,e,r,a);const i=o==="float64"?new G:new T,s=[];return z(t,a,(c,u)=>{s.push(se(ys(c,u),t,e,i,4))}),new M(s)}function gs(t,e,n,o=null){const r=[];return z(t,o,(a,i)=>{const s=new Int8Array(i),c=new Int32Array(i),u=[],l=[],d=[];for(let p=0;p<i;p++){const S=a+p,E=n?S%3:S%2;E===0?(s[p]=en,c[p]=u.length,u.push(S)):E===1?(s[p]=nn,c[p]=l.length,l.push(S)):(s[p]=on,c[p]=d.length,d.push(S))}const f=se(u,t,e,new T,3),h=se(l,t,e,new G,4),g=ms(d,t,e,new T,3),m=new Sn([en,nn,on],[new L("LineStringXYM",f.type,!0),new L("LineStringXYZM",h.type,!0),new L("MultiLineStringXYM",g.type,!0)]);r.push(Bt({type:m,length:i,nullCount:0,typeIds:s,valueOffsets:c,children:[f,h,g]}))}),new M(r)}function ps(t,e=null){const n=[];return z(t,e,(o,r)=>{const a=new Int8Array(r),i=new Int32Array(r),s=[],c=[];for(let f=0;f<r;f++){const h=o+f;h%4===0?(a[f]=an,i[f]=c.length,c.push(h)):(a[f]=rn,i[f]=s.length,s.push(h))}const u=ws(s,t),l=Ps(c,t),d=new Sn([rn,an],[new L("Polygon",u.type,!0),new L("MultiPolygon",l.type,!0)]);n.push(Bt({type:d,length:r,nullCount:0,typeIds:a,valueOffsets:i,children:[u,l]}))}),new M(n)}function ms(t,e,n,o,r){const a=t.length*2,i=new Int32Array(t.length+1),s=new Int32Array(a+1),c=o instanceof G?new Float64Array(a*n*r):new Float32Array(a*n*r);for(let d=0;d<t.length;d++){const f=t[d];i[d]=d*2;for(let h=0;h<2;h++){const g=d*2+h;s[g]=g*n;for(let m=0;m<n;m++){const p=(g*n+m)*r;eo(c,p,f,e,m,n,r),c[p]=c[p]*.43+(h===0?-.38:.38),c[p+1]+=h===0?-.036:.036}}}i[t.length]=a,s[a]=a*n;const u=Ce(o,r,c),l=W(u,s);return W(l,i)}function ws(t,e){const n=new Int32Array(t.length+1),o=new Int32Array(vs(t)+1),r=bs(t),a=new Float32Array(r*2);let i=0,s=0;for(let l=0;l<t.length;l++){const d=t[l];n[l]=i,o[i++]=s,s=ce(a,s,d,e,0),ve(d)&&(o[i++]=s,s=ce(a,s,d,e,1))}n[t.length]=i,o[i]=s;const c=Ce(new T,2,a),u=W(c,o);return W(u,n)}function Ps(t,e){const n=new Int32Array(t.length+1),o=new Int32Array(t.length*2+1),r=new Int32Array(Ts(t)+1),a=As(t),i=new Float32Array(a*2);let s=0,c=0,u=0;for(let h=0;h<t.length;h++){const g=t[h];n[h]=s;for(let m=0;m<2;m++)o[s++]=c,r[c++]=u,u=ce(i,u,g+m*17,e,m+2)}n[t.length]=s,o[s]=c,r[c]=u;const l=Ce(new T,2,i),d=W(l,r),f=W(d,o);return W(f,n)}function se(t,e,n,o,r){const a=new q(r,new L("values",o,!1)),i=new K(new L("coordinates",a,!1)),s=new Int32Array(t.length+1),c=o instanceof G?new Float64Array(t.length*n*r):new Float32Array(t.length*n*r);for(let d=0;d<t.length;d++){const f=t[d];s[d]=d*n;for(let h=0;h<n;h++)eo(c,(d*n+h)*r,f,e,h,n,r)}s[t.length]=t.length*n;const u=new R(o,0,c.length,0,{[D.DATA]:c}),l=new R(a,0,c.length/r,0,{},[u]);return new R(i,0,t.length,0,{[D.OFFSET]:s},[l])}function Ce(t,e,n){const o=new R(t,0,n.length,0,{[D.DATA]:n}),r=new q(e,new L("values",t,!1));return new R(r,0,n.length/e,0,{},[o])}function W(t,e){const n=new K(new L("values",t.type,!1));return new R(n,0,e.length-1,0,{[D.OFFSET]:e},[t])}function ys(t,e){const n=[];for(let o=0;o<e;o++)n.push(t+o);return n}function Ss(t,e,n=null){const o=new Uo,r=new K(new L("timestamps",o,!1)),a=[];return z(t,n,(i,s)=>{const c=new Int32Array(s+1),u=new BigInt64Array(s*e);for(let d=0;d<s;d++){const f=i+d;c[d]=d*e;for(let h=0;h<e;h++){const g=d*e+h;u[g]=os+BigInt(Math.round(le(f,h,e)*to))}}c[s]=s*e;const l=new R(o,0,u.length,0,{[D.DATA]:u});a.push(new R(r,0,s,0,{[D.OFFSET]:c},[l]))}),new M(a)}function xs(t,e,n=null){const o=new q(4,new L("values",new rt,!1)),r=new K(new L("colors",o,!1)),a=[];return z(t,n,(i,s)=>{const c=new Int32Array(s+1),u=Ls(i,s,e);for(let f=0;f<s;f++)c[f]=f*e;c[s]=s*e;const l=new R(new rt,0,u.length,0,{[D.DATA]:u}),d=new R(o,0,u.length/4,0,{},[l]);a.push(new R(r,0,s,0,{[D.OFFSET]:c},[d]))}),new M(a)}function Es(t,e=null){const n=[];return z(t,e,(o,r)=>{n.push($(new rt,4,Os(o,r)).data[0])}),new M(n)}function Cs(t,e=null){const n=[];return z(t,e,(o,r)=>{const a=Is(o,r);n.push(Bt({type:new T,length:a.length,data:a}))}),new M(n)}function z(t,e,n){const o=e&&e>0&&e<t?e:t;for(let r=0;r<t;r+=o)n(r,Math.min(o,t-r))}function eo(t,e,n,o,r,a,i){const s=a<=1?0:r/(a-1),u=-.92+(o<=1?0:n/(o-1))*1.84,l=n*.13;if(t[e]=-1.24+s*2.48,t[e+1]=u+Math.sin(s*11.5+l)*.028+Math.cos(s*4.2-l*.55)*.014,i===3){t[e+2]=le(n,r,a);return}t[e+2]=0,t[e+3]=le(n,r,a)}function ce(t,e,n,o,r){const{x:a,y:i,radius:s,cellWidth:c}=_s(n,o),u=st(n,r),l=r===1,d=r>=2,f=r%2===0?-1:1,h=a+(d?f*c*.22:0),g=i+(l?s*.1:d?f*s*.16:0),m=s*(l?.38:d?.58:.92),p=-Math.PI/2+ot(n,19+r)*.42,S=.84+ot(n,31+r)*.12,E=.86+ot(n,43+r)*.12;for(let P=0;P<u;P++){const v=l?u-P:P,A=p+v/u*Math.PI*2,y=Math.sin(A*3+n*.17)*.08,C=m*(1+y),x=(e+P)*2;t[x]=h+Math.cos(A)*C*S,t[x+1]=g+Math.sin(A)*C*E}return e+u}function vs(t){return t.reduce((e,n)=>e+(ve(n)?2:1),0)}function bs(t){return t.reduce((e,n)=>e+st(n,0)+(ve(n)?st(n,1):0),0)}function Ts(t){return t.length*2}function As(t){return t.reduce((e,n)=>e+st(n,2)+st(n+17,3),0)}function st(t,e){return e===1?5+t%3:6+(t+e)%5}function ve(t){return t%5===0}function _s(t,e){const n=cs,o=Math.ceil(e/n),r=1.86/n,a=1.76/o,i=t%n,s=Math.floor(t/n),c=ot(t,61)*r*.15,u=ot(t,73)*a*.15;return{x:-.93+(i+.5)*r+c,y:.88-(s+.5)*a+u,radius:Math.min(r,a)*.46,cellWidth:r}}function ot(t,e){const n=Math.sin((t+1)*(e+29)*12.9898)*43758.5453;return n-Math.floor(n)-.5}function le(t,e,n){const o=n<=1?0:e/(n-1),a=.58+t%5*.16,i=Math.floor(t/5)%4*.08;return o*a+i}function Ls(t,e,n){const o=new Uint8Array(e*n*4);for(let r=0;r<e;r++){const a=t+r,i=Et(a),s=Et(a+2),c=Et(a+4),u=[42,116,255];for(let l=0;l<n;l++){const d=n<=1?0:l/(n-1),f=l%2===0?i:s,h=l%4===0?c:f,g=Math.min(1,Math.max(0,(d-.18)/.72)),m=l%2===0?72:-28,p=(r*n+l)*4;o[p]=kt(h[0]*(1-g)+u[0]*g+m),o[p+1]=kt(h[1]*(1-g)+u[1]*g+m),o[p+2]=kt(h[2]*(1-g)+u[2]*g+m),o[p+3]=l%2===0?242:202}}return o}function Os(t,e){const n=new Uint8Array(e*4);for(let o=0;o<e;o++){const r=t+o,a=Et(r),i=o*4;n[i]=a[0],n[i+1]=a[1],n[i+2]=a[2],n[i+3]=220}return n}function Is(t,e){return Float32Array.from({length:e},(n,o)=>.0022+(t+o)%7*72e-5)}function Et(t){switch(t%5){case 0:return[72,205,217];case 1:return[255,186,73];case 2:return[255,111,97];case 3:return[120,177,255];default:return[152,221,132]}}function kt(t){return Math.min(255,Math.max(0,Math.round(t)))}function sn(){return typeof performance>"u"?Date.now():performance.now()}class Rs{state={rowCountKind:"240-stream",coordinateKind:"float32",colorKind:"row-colors",widthKind:"row-widths",timeKind:"none",animate:!0,modelKind:"storage"};panel=null;onDataUpdated;isFinalized=!1;activeUpdate=null;constructor({onDataUpdated:e}){this.onDataUpdated=e}initialize(e){const n=e.type==="webgpu";n||(this.state.modelKind="attribute"),this.panel=new $o({id:"deck-arrow-paths",description:"Variable-length Arrow paths stream progressively from an async iterable of RecordBatch values while preserving source batch boundaries.",schema:Bs(n),initialState:this.state,onSettingsChange:o=>{const r=Object.keys(o).every(a=>a==="animate"||o[a]===this.state[a]);this.state=o,r&&this.activeUpdate?(this.activeUpdate={...this.activeUpdate,animate:o.animate},this.onDataUpdated(this.activeUpdate)):this.emitDataSource()}}),this.panel.initialize(),this.emitDataSource()}finalize(){this.isFinalized||(this.isFinalized=!0,this.panel?.finalize())}emitDataSource(){const e=this.panel;if(!e)return;const n=this.state.rowCountKind==="240-stream"?"240":"2400",o=ls(ie[n],"lines",this.state.coordinateKind,this.state.colorKind,this.state.timeKind,ss),r=us(o).slice(0,as),a=e.beginTableStream(r);this.activeUpdate={asyncIterator:ds(r),model:this.state.modelKind,currentTime:this.state.animate?ae*.25:ae,trailLength:rs/to,temporalEnabled:this.state.timeKind==="xyzm",animate:this.state.animate,colorColumn:this.state.colorKind!=="none",widthColumn:this.state.widthKind!=="constant",layerProps:{onDataBatch:i=>{this.isFinalized||a.setLoadedBatchCount(i.loadedBatchCount)}}},this.onDataUpdated(this.activeUpdate)}}function Bs(t){return{title:"Settings",sections:[{id:"data",name:"Data",initiallyCollapsed:!1,settings:[{name:"rowCountKind",label:"Rows",type:"select",persist:"none",options:[{label:ie[240].label,value:"240-stream"},{label:ie[2400].label,value:"2400-stream"}]},{name:"coordinateKind",label:"Coordinates",type:"select",persist:"none",options:[{label:"Float32 XY(ZM)",value:"float32"},{label:"Float64 XY(ZM)",value:"float64"}]},{name:"colorKind",label:"Colors",type:"select",persist:"none",options:[{label:"Constant",value:"none"},{label:"Row colors",value:"row-colors"},{label:"Vertex colors",value:"vertex-colors"}]},{name:"widthKind",label:"Widths",type:"select",persist:"none",options:[{label:"Constant",value:"constant"},{label:"Row widths",value:"row-widths"}]},{name:"timeKind",label:"Time",type:"select",persist:"none",options:[{label:"None",value:"none"},{label:"XYZM coordinate",value:"xyzm"}]},{name:"animate",label:"Animate",type:"boolean",persist:"none"}]},{id:"renderer",name:"Renderer",initiallyCollapsed:!1,settings:[{name:"modelKind",label:"Model",type:"select",persist:"none",options:[...t?[{label:"Storage (WebGPU)",value:"storage"}]:[],{label:"Attribute",value:"attribute"}]}]}]}}const Ds=[199,219,245,235],Ms={source:"colors",nullValue:[199,219,245,235]},Vs={source:"widths",nullValue:.0035};function no(t,e={}){let n=null,o=null,r=0;const a=new wo({parent:t,...Po(e),views:new So({id:"main"}),initialViewState:{target:[0,0],zoom:8},controller:!0,getTooltip:ko,layers:[],onLoad:({device:s})=>i.initialize(s),onBeforeRender:({deck:s})=>{const c=n;if(c?.animate&&c.temporalEnabled){const u=performance.now(),l=(u-(o??u))/1e3;o=u,r=(r+l*.24)%ae,cn(s,c,r)}},onFinalize:()=>i.finalize()}),i=new Rs({onDataUpdated:s=>{s.asyncIterator!==n?.asyncIterator&&(r=s.currentTime),n=s,o=null,cn(a,s,r)}});return a}function cn(t,e,n){t.setProps({layers:[new re({id:"arrow-paths",pickable:!0,model:e.model??"auto",data:e.asyncIterator,paths:"paths",colors:e.colorColumn?Ms:Ds,widths:e.widthColumn?Vs:.0035,currentTime:n,trailLength:e.trailLength,temporalEnabled:e.temporalEnabled,...e.layerProps})]})}const _t=document.querySelector("#deck-device");_t.value=await yo(new URLSearchParams(location.search).get("backend"));let ln=no(void 0,{deviceType:_t.value});_t.addEventListener("change",()=>{ln.finalize(),ln=no(void 0,{deviceType:_t.value})});
