"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/index.js
var index_exports = {};
__export(index_exports, {
  A5Layer: () => a5_layer_default,
  GeohashLayer: () => geohash_layer_default,
  GreatCircleLayer: () => great_circle_layer_default,
  H3ClusterLayer: () => h3_cluster_layer_default,
  H3HexagonLayer: () => h3_hexagon_layer_default,
  MVTLayer: () => mvt_layer_default,
  QuadkeyLayer: () => quadkey_layer_default,
  S2Layer: () => s2_layer_default,
  TerrainLayer: () => terrain_layer_default,
  Tile3DLayer: () => tile_3d_layer_default,
  TileLayer: () => tile_layer_default,
  TripsLayer: () => trips_layer_default,
  _GeoCellLayer: () => GeoCellLayer_default,
  _Tile2DHeader: () => Tile2DHeader,
  _Tileset2D: () => Tileset2D,
  _WMSLayer: () => WMSLayer,
  _getURLFromTemplate: () => getURLFromTemplate
});
module.exports = __toCommonJS(index_exports);

// ../core/src/utils/log.ts
var import_log = require("@probe.gl/log");
var defaultLogger = new import_log.Log({ id: "deck" });
var log_default = defaultLogger;

// ../core/src/debug/loggers.ts
var logState = {
  attributeUpdateStart: -1,
  attributeManagerUpdateStart: -1,
  attributeUpdateMessages: []
};
var LOG_LEVEL_MAJOR_UPDATE = 1;
var LOG_LEVEL_MINOR_UPDATE = 2;
var LOG_LEVEL_UPDATE_DETAIL = 3;
var LOG_LEVEL_INFO = 4;
var LOG_LEVEL_DRAW = 2;
var getLoggers = (log) => ({
  /* Layer events */
  "layer.changeFlag": (layer, key, flags) => {
    log.log(LOG_LEVEL_UPDATE_DETAIL, `${layer.id} ${key}: `, flags[key])();
  },
  "layer.initialize": (layer) => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, `Initializing ${layer}`)();
  },
  "layer.update": (layer, needsUpdate) => {
    if (needsUpdate) {
      const flags = layer.getChangeFlags();
      log.log(
        LOG_LEVEL_MINOR_UPDATE,
        `Updating ${layer} because: ${Object.keys(flags).filter((key) => flags[key]).join(", ")}`
      )();
    } else {
      log.log(LOG_LEVEL_INFO, `${layer} does not need update`)();
    }
  },
  "layer.matched": (layer, changed) => {
    if (changed) {
      log.log(LOG_LEVEL_INFO, `Matched ${layer}, state transfered`)();
    }
  },
  "layer.finalize": (layer) => {
    log.log(LOG_LEVEL_MAJOR_UPDATE, `Finalizing ${layer}`)();
  },
  /* CompositeLayer events */
  "compositeLayer.renderLayers": (layer, updated, subLayers) => {
    if (updated) {
      log.log(
        LOG_LEVEL_MINOR_UPDATE,
        `Composite layer rendered new subLayers ${layer}`,
        subLayers
      )();
    } else {
      log.log(LOG_LEVEL_INFO, `Composite layer reused subLayers ${layer}`, subLayers)();
    }
  },
  /* LayerManager events */
  "layerManager.setLayers": (layerManager, updated, layers) => {
    if (updated) {
      log.log(LOG_LEVEL_MINOR_UPDATE, `Updating ${layers.length} deck layers`)();
    }
  },
  "layerManager.activateViewport": (layerManager, viewport) => {
    log.log(LOG_LEVEL_UPDATE_DETAIL, "Viewport changed", viewport)();
  },
  /* AttributeManager events */
  "attributeManager.invalidate": (attributeManager, trigger, attributeNames) => {
    log.log(
      LOG_LEVEL_MAJOR_UPDATE,
      attributeNames ? `invalidated attributes ${attributeNames} (${trigger}) for ${attributeManager.id}` : `invalidated all attributes for ${attributeManager.id}`
    )();
  },
  "attributeManager.updateStart": (attributeManager) => {
    logState.attributeUpdateMessages.length = 0;
    logState.attributeManagerUpdateStart = Date.now();
  },
  "attributeManager.updateEnd": (attributeManager, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attributeManagerUpdateStart);
    log.groupCollapsed(
      LOG_LEVEL_MINOR_UPDATE,
      `Updated attributes for ${numInstances} instances in ${attributeManager.id} in ${timeMs}ms`
    )();
    for (const updateMessage of logState.attributeUpdateMessages) {
      log.log(LOG_LEVEL_UPDATE_DETAIL, updateMessage)();
    }
    log.groupEnd(LOG_LEVEL_MINOR_UPDATE)();
  },
  /* Attribute events */
  "attribute.updateStart": (attribute) => {
    logState.attributeUpdateStart = Date.now();
  },
  "attribute.allocate": (attribute, numInstances) => {
    const message = `${attribute.id} allocated ${numInstances}`;
    logState.attributeUpdateMessages.push(message);
  },
  "attribute.updateEnd": (attribute, numInstances) => {
    const timeMs = Math.round(Date.now() - logState.attributeUpdateStart);
    const message = `${attribute.id} updated ${numInstances} in ${timeMs}ms`;
    logState.attributeUpdateMessages.push(message);
  },
  /* Render events */
  "deckRenderer.renderLayers": (deckRenderer, renderStats, opts) => {
    const { pass, redrawReason } = opts;
    for (const status of renderStats) {
      const { totalCount, visibleCount, compositeCount, pickableCount } = status;
      const primitiveCount = totalCount - compositeCount;
      const hiddenCount = primitiveCount - visibleCount;
      log.log(
        LOG_LEVEL_DRAW,
        `RENDER #${deckRenderer.renderCount}   ${visibleCount} (of ${totalCount} layers) to ${pass} because ${redrawReason}   (${hiddenCount} hidden, ${compositeCount} composite ${pickableCount} pickable)`
      )();
    }
  }
});

// ../core/src/debug/index.ts
var loggers = {};
if (true) {
  loggers = getLoggers(log_default);
}
function debug(eventType, arg1, arg2, arg3) {
  if (log_default.level > 0 && loggers[eventType]) {
    loggers[eventType].call(null, arg1, arg2, arg3);
  }
}

// ../core/src/shaderlib/index.ts
var import_shadertools3 = require("@luma.gl/shadertools");

// ../core/src/shaderlib/color/color.ts
var colorWGSL = (
  /* WGSL */
  `

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`
);
var color_default = {
  name: "color",
  dependencies: [],
  // Intentionally WGSL-only. Layers can include this module unconditionally because
  // the GLSL assembler treats modules without vs/fs source as no-ops.
  source: colorWGSL,
  getUniforms: (_props) => {
    return {};
  }
  // @ts-ignore TODO v9.1
};

// ../core/src/shaderlib/misc/geometry.ts
var source = (
  /* wgsl */
  `const SMOOTH_EDGE_RADIUS: f32 = 0.5;

struct VertexGeometry {
  position: vec4<f32>,
  worldPosition: vec3<f32>,
  worldPositionAlt: vec3<f32>,
  normal: vec3<f32>,
  uv: vec2<f32>,
  pickingColor: vec3<f32>,
};

var<private> geometry_: VertexGeometry = VertexGeometry(
  vec4<f32>(0.0, 0.0, 1.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0),
  vec2<f32>(0.0, 0.0),
  vec3<f32>(0.0, 0.0, 0.0)
);

struct FragmentGeometry {
  uv: vec2<f32>,
};

var<private> fragmentGeometry: FragmentGeometry;

fn smoothedge(edge: f32, x: f32) -> f32 {
  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);
}
`
);
var defines = "#define SMOOTH_EDGE_RADIUS 0.5";
var vs = (
  /* glsl */
  `${defines}

struct VertexGeometry {
  vec4 position;
  vec3 worldPosition;
  vec3 worldPositionAlt;
  vec3 normal;
  vec2 uv;
  vec3 pickingColor;
} geometry = VertexGeometry(
  vec4(0.0, 0.0, 1.0, 0.0),
  vec3(0.0),
  vec3(0.0),
  vec3(0.0),
  vec2(0.0),
  vec3(0.0)
);
`
);
var fs = (
  /* glsl */
  `${defines}

struct FragmentGeometry {
  vec2 uv;
};
FragmentGeometry geometry;

float smoothedge(float edge, float x) {
  return smoothstep(edge - SMOOTH_EDGE_RADIUS, edge + SMOOTH_EDGE_RADIUS, x);
}
`
);
var geometry_default = {
  name: "geometry",
  source,
  vs,
  fs
};

// ../core/src/shaderlib/project/project.ts
var import_shadertools = require("@luma.gl/shadertools");

// ../core/src/shaderlib/project/viewport-uniforms.ts
var import_core = require("@math.gl/core");

// ../core/src/lib/constants.ts
var import_mjolnir = require("mjolnir.js");
var COORDINATE_SYSTEM = {
  /**
   * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
   */
  DEFAULT: "default",
  /**
   * Positions are interpreted as [longitude, latitude, elevation]
   * longitude/latitude are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT: "lnglat",
  /**
   * Positions are interpreted as [x, y, z] in meter offsets from the coordinate origin.
   * Dimensions are in meters.
   */
  METER_OFFSETS: "meter-offsets",
  /**
   * Positions are interpreted as [deltaLng, deltaLat, elevation] from the coordinate origin.
   * deltaLng/deltaLat are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT_OFFSETS: "lnglat-offsets",
  /**
   * Positions and dimensions are in the common units of the viewport.
   */
  CARTESIAN: "cartesian"
};
Object.defineProperty(COORDINATE_SYSTEM, "IDENTITY", {
  get: () => {
    log_default.deprecated("COORDINATE_SYSTEM.IDENTITY", "COORDINATE_SYSTEM.CARTESIAN")();
    return COORDINATE_SYSTEM.CARTESIAN;
  }
});
var PROJECTION_MODE = {
  /**
   * Render geospatial data in Web Mercator projection
   */
  WEB_MERCATOR: 1,
  /**
   * Render geospatial data as a 3D globe
   */
  GLOBE: 2,
  /**
   * (Internal use only) Web Mercator projection at high zoom
   */
  WEB_MERCATOR_AUTO_OFFSET: 4,
  /**
   * No transformation
   */
  IDENTITY: 0
};
var UNIT = {
  common: 0,
  meters: 1,
  pixels: 2
};

// ../core/src/utils/memoize.ts
function isEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a)) {
    const len = a.length;
    if (!b || b.length !== len) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}
function memoize(compute) {
  let cachedArgs = {};
  let cachedResult;
  return (args) => {
    for (const key in args) {
      if (!isEqual(args[key], cachedArgs[key])) {
        cachedResult = compute(args);
        cachedArgs = args;
        break;
      }
    }
    return cachedResult;
  };
}

// ../core/src/shaderlib/project/viewport-uniforms.ts
var ZERO_VECTOR = [0, 0, 0, 0];
var VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
var IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var DEFAULT_PIXELS_PER_UNIT2 = [0, 0, 0];
var DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];
var COORDINATE_SYSTEM_NUMBERS = {
  default: -1,
  cartesian: 0,
  lnglat: 1,
  "meter-offsets": 2,
  "lnglat-offsets": 3
};
function getShaderCoordinateSystem(coordinateSystem) {
  const shaderCoordinateSystem = COORDINATE_SYSTEM_NUMBERS[coordinateSystem];
  if (shaderCoordinateSystem === void 0) {
    throw new Error(`Invalid coordinateSystem: ${coordinateSystem}`);
  }
  return shaderCoordinateSystem;
}
var getMemoizedViewportUniforms = memoize(calculateViewportUniforms);
function getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin = DEFAULT_COORDINATE_ORIGIN) {
  if (coordinateOrigin.length < 3) {
    coordinateOrigin = [coordinateOrigin[0], coordinateOrigin[1], 0];
  }
  let shaderCoordinateOrigin = coordinateOrigin;
  let geospatialOrigin;
  let offsetMode = true;
  if (coordinateSystem === "lnglat-offsets" || coordinateSystem === "meter-offsets") {
    geospatialOrigin = coordinateOrigin;
  } else {
    geospatialOrigin = viewport.isGeospatial ? (
      // @ts-expect-error longitude and latitude are not defined on the base Viewport, but is expected on geospatial viewports
      [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0]
    ) : null;
  }
  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      if (coordinateSystem === "lnglat" || coordinateSystem === "cartesian") {
        geospatialOrigin = [0, 0, 0];
        offsetMode = false;
      }
      break;
    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      if (coordinateSystem === "lnglat") {
        shaderCoordinateOrigin = geospatialOrigin;
      } else if (coordinateSystem === "cartesian") {
        shaderCoordinateOrigin = [
          Math.fround(viewport.center[0]),
          Math.fround(viewport.center[1]),
          0
        ];
        geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
        shaderCoordinateOrigin[0] -= coordinateOrigin[0];
        shaderCoordinateOrigin[1] -= coordinateOrigin[1];
        shaderCoordinateOrigin[2] -= coordinateOrigin[2];
      }
      break;
    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround);
      shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;
      break;
    case PROJECTION_MODE.GLOBE:
      offsetMode = false;
      geospatialOrigin = null;
      break;
    default:
      offsetMode = false;
  }
  return { geospatialOrigin, shaderCoordinateOrigin, offsetMode };
}
function calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin) {
  const { viewMatrixUncentered, projectionMatrix } = viewport;
  let { viewMatrix, viewProjectionMatrix } = viewport;
  let projectionCenter = ZERO_VECTOR;
  let originCommon = ZERO_VECTOR;
  let cameraPosCommon = viewport.cameraPosition;
  const { geospatialOrigin, shaderCoordinateOrigin, offsetMode } = getOffsetOrigin(
    viewport,
    coordinateSystem,
    coordinateOrigin
  );
  if (offsetMode) {
    originCommon = viewport.projectPosition(geospatialOrigin || shaderCoordinateOrigin);
    cameraPosCommon = [
      cameraPosCommon[0] - originCommon[0],
      cameraPosCommon[1] - originCommon[1],
      cameraPosCommon[2] - originCommon[2]
    ];
    originCommon[3] = 1;
    projectionCenter = import_core.vec4.transformMat4([], originCommon, viewProjectionMatrix);
    viewMatrix = viewMatrixUncentered || viewMatrix;
    viewProjectionMatrix = import_core.mat4.multiply([], projectionMatrix, viewMatrix);
    viewProjectionMatrix = import_core.mat4.multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }
  return {
    viewMatrix,
    viewProjectionMatrix,
    projectionCenter,
    originCommon,
    cameraPosCommon,
    shaderCoordinateOrigin,
    geospatialOrigin
  };
}
function getUniformsFromViewport({
  viewport,
  devicePixelRatio = 1,
  modelMatrix: modelMatrix2 = null,
  // Match Layer.defaultProps
  coordinateSystem = "default",
  coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
  autoWrapLongitude = false
}) {
  if (coordinateSystem === "default") {
    coordinateSystem = viewport.isGeospatial ? "lnglat" : "cartesian";
  }
  const uniforms = getMemoizedViewportUniforms({
    viewport,
    devicePixelRatio,
    coordinateSystem,
    coordinateOrigin
  });
  uniforms.wrapLongitude = autoWrapLongitude;
  uniforms.modelMatrix = modelMatrix2 || IDENTITY_MATRIX;
  return uniforms;
}
function calculateViewportUniforms({
  viewport,
  devicePixelRatio,
  coordinateSystem,
  coordinateOrigin
}) {
  const {
    projectionCenter,
    viewProjectionMatrix,
    originCommon,
    cameraPosCommon,
    shaderCoordinateOrigin,
    geospatialOrigin
  } = calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin);
  const distanceScales = viewport.getDistanceScales();
  const viewportSize = [
    viewport.width * devicePixelRatio,
    viewport.height * devicePixelRatio
  ];
  const focalDistance = import_core.vec4.transformMat4([], [0, 0, -viewport.focalDistance, 1], viewport.projectionMatrix)[3] || 1;
  const uniforms = {
    // Projection mode values
    coordinateSystem: getShaderCoordinateSystem(coordinateSystem),
    projectionMode: viewport.projectionMode,
    coordinateOrigin: shaderCoordinateOrigin,
    commonOrigin: originCommon.slice(0, 3),
    center: projectionCenter,
    // Backward compatibility
    // TODO: remove in v9
    // @ts-expect-error _pseudoMeters is only defined on WebMercator viewport
    pseudoMeters: Boolean(viewport._pseudoMeters),
    // Screen size
    viewportSize,
    devicePixelRatio,
    focalDistance,
    commonUnitsPerMeter: distanceScales.unitsPerMeter,
    commonUnitsPerWorldUnit: distanceScales.unitsPerMeter,
    commonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,
    scale: viewport.scale,
    // This is the mercator scale (2 ** zoom)
    wrapLongitude: false,
    viewProjectionMatrix,
    modelMatrix: IDENTITY_MATRIX,
    // This is for lighting calculations
    cameraPosition: cameraPosCommon
  };
  if (geospatialOrigin) {
    const distanceScalesAtOrigin = viewport.getDistanceScales(geospatialOrigin);
    switch (coordinateSystem) {
      case "meter-offsets":
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
        break;
      case "lnglat":
      case "lnglat-offsets":
        if (!viewport._pseudoMeters) {
          uniforms.commonUnitsPerMeter = distanceScalesAtOrigin.unitsPerMeter;
        }
        uniforms.commonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
        uniforms.commonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
        break;
      // a.k.a "preprojected" positions
      case "cartesian":
        uniforms.commonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
        uniforms.commonUnitsPerWorldUnit2 = [0, 0, distanceScalesAtOrigin.unitsPerMeter2[2]];
        break;
      default:
        break;
    }
  }
  if (viewport.projectionMode === PROJECTION_MODE.GLOBE && coordinateSystem === "meter-offsets") {
    const EARTH_RADIUS2 = 6370972;
    const GLOBE_RADIUS2 = 256;
    const lambda = coordinateOrigin[0] * Math.PI / 180;
    const phi = coordinateOrigin[1] * Math.PI / 180;
    const cosPhi = Math.cos(phi);
    const D = ((coordinateOrigin[2] || 0) / EARTH_RADIUS2 + 1) * GLOBE_RADIUS2;
    uniforms.commonOrigin = [
      Math.sin(lambda) * cosPhi * D,
      -Math.cos(lambda) * cosPhi * D,
      Math.sin(phi) * D
    ];
  }
  return uniforms;
}

// ../core/src/shaderlib/project/project.wgsl.ts
var SHADER_COORDINATE_SYSTEMS = [
  "default",
  "lnglat",
  "meter-offsets",
  "lnglat-offsets",
  "cartesian"
];
var COORDINATE_SYSTEM_WGSL_CONSTANTS = SHADER_COORDINATE_SYSTEMS.map(
  (coordinateSystem) => `const COORDINATE_SYSTEM_${coordinateSystem.toUpperCase().replaceAll("-", "_")}: i32 = ${getShaderCoordinateSystem(coordinateSystem)};`
).join("");
var PROJECTION_MODE_WGSL_CONSTANTS = Object.keys(PROJECTION_MODE).map((key) => `const PROJECTION_MODE_${key}: i32 = ${PROJECTION_MODE[key]};`).join("");
var UNIT_WGSL_CONSTANTS = Object.keys(UNIT).map((key) => `const UNIT_${key.toUpperCase()}: i32 = ${UNIT[key]};`).join("");
var projectWGSLHeader = (
  /* wgsl */
  `${COORDINATE_SYSTEM_WGSL_CONSTANTS}
${PROJECTION_MODE_WGSL_CONSTANTS}
${UNIT_WGSL_CONSTANTS}

const TILE_SIZE: f32 = 512.0;
const PI: f32 = 3.1415926536;
const WORLD_SCALE: f32 = TILE_SIZE / (PI * 2.0);
const ZERO_64_LOW: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
const EARTH_RADIUS: f32 = 6370972.0; // meters
const GLOBE_RADIUS: f32 = 256.0;

// -----------------------------------------------------------------------------
// Uniform block (converted from GLSL uniform block)
// -----------------------------------------------------------------------------
struct ProjectUniforms {
  wrapLongitude: i32,
  coordinateSystem: i32,
  commonUnitsPerMeter: vec3<f32>,
  projectionMode: i32,
  scale: f32,
  commonUnitsPerWorldUnit: vec3<f32>,
  commonUnitsPerWorldUnit2: vec3<f32>,
  center: vec4<f32>,
  modelMatrix: mat4x4<f32>,
  viewProjectionMatrix: mat4x4<f32>,
  viewportSize: vec2<f32>,
  devicePixelRatio: f32,
  focalDistance: f32,
  cameraPosition: vec3<f32>,
  coordinateOrigin: vec3<f32>,
  commonOrigin: vec3<f32>,
  pseudoMeters: i32,
};

@group(0) @binding(auto)
var<uniform> project: ProjectUniforms;

// -----------------------------------------------------------------------------
// Geometry data shared across the project helpers.
// The active layer shader is responsible for populating this private module
// state before calling the project functions below.
// -----------------------------------------------------------------------------

// Structure to carry additional geometry data used by deck.gl filters.
struct Geometry {
  worldPosition: vec3<f32>,
  worldPositionAlt: vec3<f32>,
  position: vec4<f32>,
  normal: vec3<f32>,
  uv: vec2<f32>,
  pickingColor: vec3<f32>,
};

var<private> geometry: Geometry;
`
);
var projectWGSL = (
  /* wgsl */
  `${projectWGSLHeader}

// -----------------------------------------------------------------------------
// Functions
// -----------------------------------------------------------------------------

// Returns an adjustment factor for commonUnitsPerMeter
fn _project_size_at_latitude(lat: f32) -> f32 {
  let y = clamp(lat, -89.9, 89.9);
  return 1.0 / cos(radians(y));
}

// Overloaded version: scales a value in meters at a given latitude.
fn _project_size_at_latitude_m(meters: f32, lat: f32) -> f32 {
  return meters * project.commonUnitsPerMeter.z * _project_size_at_latitude(lat);
}

// Computes a non-linear scale factor based on geometry.
// (Note: This function relies on "geometry" being provided.)
fn project_size() -> f32 {
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR &&
      project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT &&
      project.pseudoMeters == 0) {
    if (geometry.position.w == 0.0) {
      return _project_size_at_latitude(geometry.worldPosition.y);
    }
    let y: f32 = geometry.position.y / TILE_SIZE * 2.0 - 1.0;
    let y2 = y * y;
    let y4 = y2 * y2;
    let y6 = y4 * y2;
    return 1.0 + 4.9348 * y2 + 4.0587 * y4 + 1.5642 * y6;
  }
  return 1.0;
}

// Overloads to scale offsets (meters to world units)
fn project_size_float(meters: f32) -> f32 {
  return meters * project.commonUnitsPerMeter.z * project_size();
}

fn project_size_vec2(meters: vec2<f32>) -> vec2<f32> {
  return meters * project.commonUnitsPerMeter.xy * project_size();
}

fn project_size_vec3(meters: vec3<f32>) -> vec3<f32> {
  return meters * project.commonUnitsPerMeter * project_size();
}

fn project_size_vec4(meters: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(meters.xyz * project.commonUnitsPerMeter, meters.w);
}

// Returns a rotation matrix aligning the z\u2011axis with the given up vector.
fn project_get_orientation_matrix(up: vec3<f32>) -> mat3x3<f32> {
  let uz = normalize(up);
  let ux = select(
    vec3<f32>(1.0, 0.0, 0.0),
    normalize(vec3<f32>(uz.y, -uz.x, 0.0)),
    abs(uz.z) == 1.0
  );
  let uy = cross(uz, ux);
  return mat3x3<f32>(ux, uy, uz);
}

// Since WGSL does not support "out" parameters, we return a struct.
struct RotationResult {
  needsRotation: bool,
  transform: mat3x3<f32>,
};

fn project_needs_rotation(commonPosition: vec3<f32>) -> RotationResult {
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    return RotationResult(true, project_get_orientation_matrix(commonPosition));
  } else {
    return RotationResult(false, mat3x3<f32>());  // identity alternative if needed
  };
}

// Projects a normal vector from the current coordinate system to world space.
fn project_normal(vector: vec3<f32>) -> vec3<f32> {
  let normal_modelspace = project.modelMatrix * vec4<f32>(vector, 0.0);
  var n = normalize(normal_modelspace.xyz * project.commonUnitsPerMeter);
  let rotResult = project_needs_rotation(geometry.position.xyz);
  if (rotResult.needsRotation) {
    n = rotResult.transform * n;
  }
  return n;
}

// Applies a scale offset based on y-offset (dy)
fn project_offset_(offset: vec4<f32>) -> vec4<f32> {
  let dy: f32 = offset.y;
  let commonUnitsPerWorldUnit = project.commonUnitsPerWorldUnit + project.commonUnitsPerWorldUnit2 * dy;
  return vec4<f32>(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}

// Projects lng/lat coordinates to a unit tile [0,1]
fn project_mercator_(lnglat: vec2<f32>) -> vec2<f32> {
  var x = lnglat.x;
  if (project.wrapLongitude != 0) {
    x = ((x + 180.0) % 360.0) - 180.0;
  }
  let y = clamp(lnglat.y, -89.9, 89.9);
  return vec2<f32>(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// Projects lng/lat/z coordinates for a globe projection.
fn project_globe_(lnglatz: vec3<f32>) -> vec3<f32> {
  let lambda = radians(lnglatz.x);
  let phi = radians(lnglatz.y);
  let cosPhi = cos(phi);
  let D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;
  return vec3<f32>(
    sin(lambda) * cosPhi,
    -cos(lambda) * cosPhi,
    sin(phi)
  ) * D;
}

// Projects positions (with an optional 64-bit low part) from the input
// coordinate system to the common space.
fn project_position_vec4_f64(position: vec4<f32>, position64Low: vec3<f32>) -> vec4<f32> {
  var position_world = project.modelMatrix * position;

  // Work around for a Mac+NVIDIA bug:
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4<f32>(
        project_mercator_(position_world.xy),
        _project_size_at_latitude_m(position_world.z, position_world.y),
        position_world.w
      );
    }
    if (project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {
      position_world = vec4f(position_world.xyz + project.coordinateOrigin, position_world.w);
    }
  }
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4<f32>(
        project_globe_(position_world.xyz),
        position_world.w
      );
    }
    if (project.coordinateSystem == COORDINATE_SYSTEM_METER_OFFSETS) {
      let enuMatrix = project_get_orientation_matrix(project.commonOrigin);
      let metersToCommon = GLOBE_RADIUS / EARTH_RADIUS;
      let offsetCommon = (enuMatrix * vec3<f32>(-position_world.x, -position_world.y, position_world.z)) * metersToCommon;
      return vec4<f32>(project.commonOrigin + offsetCommon, position_world.w);
    }
  }
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      if (abs(position_world.y - project.coordinateOrigin.y) > 0.25) {
        return vec4<f32>(
          project_mercator_(position_world.xy) - project.commonOrigin.xy,
          project_size_float(position_world.z),
          position_world.w
        );
      }
    }
  }
  if (project.projectionMode == PROJECTION_MODE_IDENTITY ||
      (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
       (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
        project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
    position_world = vec4f(position_world.xyz - project.coordinateOrigin, position_world.w);
  }

  return project_offset_(position_world) +
         project_offset_(project.modelMatrix * vec4<f32>(position64Low, 0.0));
}

// Overloaded versions for different input types.
fn project_position_vec4_f32(position: vec4<f32>) -> vec4<f32> {
  return project_position_vec4_f64(position, ZERO_64_LOW);
}

fn project_position_vec3_f64(position: vec3<f32>, position64Low: vec3<f32>) -> vec3<f32> {
  let projected_position = project_position_vec4_f64(vec4<f32>(position, 1.0), position64Low);
  return projected_position.xyz;
}

fn project_position_vec3_f32(position: vec3<f32>) -> vec3<f32> {
  let projected_position = project_position_vec4_f64(vec4<f32>(position, 1.0), ZERO_64_LOW);
  return projected_position.xyz;
}

fn project_position_vec2_f32(position: vec2<f32>) -> vec2<f32> {
  let projected_position = project_position_vec4_f64(vec4<f32>(position, 0.0, 1.0), ZERO_64_LOW);
  return projected_position.xy;
}

// Transforms a common space position to clip space.
fn project_common_position_to_clipspace_with_projection(position: vec4<f32>, viewProjectionMatrix: mat4x4<f32>, center: vec4<f32>) -> vec4<f32> {
  var clipPosition = viewProjectionMatrix * position + center;
  // deck.gl projection matrices use WebGL's [-w, w] depth range; WebGPU clips z to [0, w].
  clipPosition.z = (clipPosition.z + clipPosition.w) * 0.5;
  return clipPosition;
}

// Uses the project viewProjectionMatrix and center.
fn project_common_position_to_clipspace(position: vec4<f32>) -> vec4<f32> {
  return project_common_position_to_clipspace_with_projection(position, project.viewProjectionMatrix, project.center);
}

// Returns a clip space offset corresponding to a given number of screen pixels.
fn project_pixel_size_to_clipspace(pixels: vec2<f32>) -> vec2<f32> {
  let offset = pixels / project.viewportSize * project.devicePixelRatio * 2.0;
  return offset * project.focalDistance;
}

fn project_meter_size_to_pixel(meters: f32) -> f32 {
  return project_size_float(meters) * project.scale;
}

fn project_unit_size_to_pixel(size: f32, unit: i32) -> f32 {
  if (unit == UNIT_METERS) {
    return project_meter_size_to_pixel(size);
  } else if (unit == UNIT_COMMON) {
    return size * project.scale;
  }
  // UNIT_PIXELS: no scaling applied.
  return size;
}

fn project_pixel_size_float(pixels: f32) -> f32 {
  return pixels / project.scale;
}

fn project_pixel_size_vec2(pixels: vec2<f32>) -> vec2<f32> {
  return pixels / project.scale;
}
`
);

// ../core/src/shaderlib/project/project.glsl.ts
var SHADER_COORDINATE_SYSTEMS2 = [
  "default",
  "lnglat",
  "meter-offsets",
  "lnglat-offsets",
  "cartesian"
];
var COORDINATE_SYSTEM_GLSL_CONSTANTS = SHADER_COORDINATE_SYSTEMS2.map(
  (coordinateSystem) => `const int COORDINATE_SYSTEM_${coordinateSystem.toUpperCase().replaceAll("-", "_")} = ${getShaderCoordinateSystem(coordinateSystem)};`
).join("");
var PROJECTION_MODE_GLSL_CONSTANTS = Object.keys(PROJECTION_MODE).map((key) => `const int PROJECTION_MODE_${key} = ${PROJECTION_MODE[key]};`).join("");
var UNIT_GLSL_CONSTANTS = Object.keys(UNIT).map((key) => `const int UNIT_${key.toUpperCase()} = ${UNIT[key]};`).join("");
var projectGLSL = (
  /* glsl */
  `${COORDINATE_SYSTEM_GLSL_CONSTANTS}
${PROJECTION_MODE_GLSL_CONSTANTS}
${UNIT_GLSL_CONSTANTS}

layout(std140) uniform projectUniforms {
  bool wrapLongitude;
  int coordinateSystem;
  vec3 commonUnitsPerMeter;
  int projectionMode;
  float scale;
  vec3 commonUnitsPerWorldUnit;
  vec3 commonUnitsPerWorldUnit2;
  vec4 center;
  mat4 modelMatrix;
  mat4 viewProjectionMatrix;
  vec2 viewportSize;
  float devicePixelRatio;
  float focalDistance;
  vec3 cameraPosition;
  vec3 coordinateOrigin;
  vec3 commonOrigin;
  bool pseudoMeters;
} project;


const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
const vec3 ZERO_64_LOW = vec3(0.0);
const float EARTH_RADIUS = 6370972.0; // meters
const float GLOBE_RADIUS = 256.0;

// returns an adjustment factor for uCommonUnitsPerMeter
float project_size_at_latitude(float lat) {
  float y = clamp(lat, -89.9, 89.9);
  return 1.0 / cos(radians(y));
}

float project_size() {
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR &&
    project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT &&
    project.pseudoMeters == false) {

    // uCommonUnitsPerMeter in low-zoom Web Mercator is non-linear
    // Adjust by 1 / cos(latitude)
    // If geometry.position (vertex in common space) is populated, use it
    // Otherwise use geometry.worldPosition (anchor in world space)

    if (geometry.position.w == 0.0) {
      return project_size_at_latitude(geometry.worldPosition.y);
    }

    // latitude from common y: 2.0 * (atan(exp(y / TILE_SIZE * 2.0 * PI - PI)) - PI / 4.0)
    // Taylor series of 1 / cos(latitude)
    // Max error < 0.003

    float y = geometry.position.y / TILE_SIZE * 2.0 - 1.0;
    float y2 = y * y;
    float y4 = y2 * y2;
    float y6 = y4 * y2;
    return 1.0 + 4.9348 * y2 + 4.0587 * y4 + 1.5642 * y6;
  }
  return 1.0;
}

float project_size_at_latitude(float meters, float lat) {
  return meters * project.commonUnitsPerMeter.z * project_size_at_latitude(lat);
}

//
// Scaling offsets - scales meters to "world distance"
// Note the scalar version of project_size is for scaling the z component only
//
float project_size(float meters) {
  // For scatter relevant
  return meters * project.commonUnitsPerMeter.z * project_size();
}

vec2 project_size(vec2 meters) {
  return meters * project.commonUnitsPerMeter.xy * project_size();
}

vec3 project_size(vec3 meters) {
  return meters * project.commonUnitsPerMeter * project_size();
}

vec4 project_size(vec4 meters) {
  return vec4(meters.xyz * project.commonUnitsPerMeter, meters.w);
}

// Get rotation matrix that aligns the z axis with the given up vector
// Find 3 unit vectors ux, uy, uz that are perpendicular to each other and uz == up
mat3 project_get_orientation_matrix(vec3 up) {
  vec3 uz = normalize(up);
  // Tangent on XY plane
  vec3 ux = abs(uz.z) == 1.0 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(uz.y, -uz.x, 0));
  vec3 uy = cross(uz, ux);
  return mat3(ux, uy, uz);
}

bool project_needs_rotation(vec3 commonPosition, out mat3 transform) {
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    transform = project_get_orientation_matrix(commonPosition);
    return true;
  }
  return false;
}

//
// Projecting normal - transform deltas from current coordinate system to
// normals in the worldspace
//
vec3 project_normal(vec3 vector) {
  // Apply model matrix
  vec4 normal_modelspace = project.modelMatrix * vec4(vector, 0.0);
  vec3 n = normalize(normal_modelspace.xyz * project.commonUnitsPerMeter);
  mat3 rotation;
  if (project_needs_rotation(geometry.position.xyz, rotation)) {
    n = rotation * n;
  }
  return n;
}

vec4 project_offset_(vec4 offset) {
  float dy = offset.y;
  vec3 commonUnitsPerWorldUnit = project.commonUnitsPerWorldUnit + project.commonUnitsPerWorldUnit2 * dy;
  return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}

//
// Projecting positions - non-linear projection: lnglats => unit tile [0-1, 0-1]
//
vec2 project_mercator_(vec2 lnglat) {
  float x = lnglat.x;
  if (project.wrapLongitude) {
    x = mod(x + 180., 360.0) - 180.;
  }
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + PI,
    PI + log(tan_fp32(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

vec3 project_globe_(vec3 lnglatz) {
  float lambda = radians(lnglatz.x);
  float phi = radians(lnglatz.y);
  float cosPhi = cos(phi);
  float D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;

  return vec3(
    sin(lambda) * cosPhi,
    -cos(lambda) * cosPhi,
    sin(phi)
  ) * D;
}

//
// Projects positions (defined by project.coordinateSystem) to common space (defined by project.projectionMode)
//
vec4 project_position(vec4 position, vec3 position64Low) {
  vec4 position_world = project.modelMatrix * position;

  // Work around for a Mac+NVIDIA bug https://github.com/visgl/deck.gl/issues/4145
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4(
        project_mercator_(position_world.xy),
        project_size_at_latitude(position_world.z, position_world.y),
        position_world.w
      );
    }
    if (project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {
      position_world.xyz += project.coordinateOrigin;
    }
  }
  if (project.projectionMode == PROJECTION_MODE_GLOBE) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4(
        project_globe_(position_world.xyz),
        position_world.w
      );
    }
    if (project.coordinateSystem == COORDINATE_SYSTEM_METER_OFFSETS) {
      mat3 enuMatrix = project_get_orientation_matrix(project.commonOrigin);
      float metersToCommon = GLOBE_RADIUS / EARTH_RADIUS;
      vec3 offsetCommon = (enuMatrix * vec3(-position_world.xy, position_world.z)) * metersToCommon;
      return vec4(project.commonOrigin + offsetCommon, position_world.w);
    }
  }
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
    if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      if (abs(position_world.y - project.coordinateOrigin.y) > 0.25) {
        // Too far from the projection center for offset mode to be accurate
        // Only use high parts
        return vec4(
          project_mercator_(position_world.xy) - project.commonOrigin.xy,
          project_size(position_world.z),
          position_world.w
        );
      }
    }
  }
  if (project.projectionMode == PROJECTION_MODE_IDENTITY ||
    (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
    (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
     project.coordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
    // Subtract high part of 64 bit value. Convert remainder to float32, preserving precision.
    position_world.xyz -= project.coordinateOrigin;
  }

  // Translation is already added to the high parts
  return project_offset_(position_world) + project_offset_(project.modelMatrix * vec4(position64Low, 0.0));
}

vec4 project_position(vec4 position) {
  return project_position(position, ZERO_64_LOW);
}

vec3 project_position(vec3 position, vec3 position64Low) {
  vec4 projected_position = project_position(vec4(position, 1.0), position64Low);
  return projected_position.xyz;
}

vec3 project_position(vec3 position) {
  vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_LOW);
  return projected_position.xyz;
}

vec2 project_position(vec2 position) {
  vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_LOW);
  return projected_position.xy;
}

vec4 project_common_position_to_clipspace(vec4 position, mat4 viewProjectionMatrix, vec4 center) {
  return viewProjectionMatrix * position + center;
}

//
// Projects from common space coordinates to clip space.
// Uses project.viewProjectionMatrix
//
vec4 project_common_position_to_clipspace(vec4 position) {
  return project_common_position_to_clipspace(position, project.viewProjectionMatrix, project.center);
}

// Returns a clip space offset that corresponds to a given number of screen pixels
vec2 project_pixel_size_to_clipspace(vec2 pixels) {
  vec2 offset = pixels / project.viewportSize * project.devicePixelRatio * 2.0;
  return offset * project.focalDistance;
}

float project_size_to_pixel(float meters) {
  return project_size(meters) * project.scale;
}
vec2 project_size_to_pixel(vec2 meters) {
  return project_size(meters) * project.scale;
}
float project_size_to_pixel(float size, int unit) {
  if (unit == UNIT_METERS) return project_size_to_pixel(size);
  if (unit == UNIT_COMMON) return size * project.scale;
  // UNIT_PIXELS
  return size;
}
float project_pixel_size(float pixels) {
  return pixels / project.scale;
}
vec2 project_pixel_size(vec2 pixels) {
  return pixels / project.scale;
}
`
);

// ../core/src/shaderlib/project/project.ts
var INITIAL_MODULE_OPTIONS = {};
function getUniforms(opts = INITIAL_MODULE_OPTIONS) {
  if ("viewport" in opts) {
    return getUniformsFromViewport(opts);
  }
  return {};
}
var project_default = {
  name: "project",
  dependencies: [import_shadertools.fp32, geometry_default],
  source: projectWGSL,
  vs: projectGLSL,
  getUniforms,
  uniformTypes: {
    wrapLongitude: "f32",
    coordinateSystem: "i32",
    commonUnitsPerMeter: "vec3<f32>",
    projectionMode: "i32",
    scale: "f32",
    commonUnitsPerWorldUnit: "vec3<f32>",
    commonUnitsPerWorldUnit2: "vec3<f32>",
    center: "vec4<f32>",
    modelMatrix: "mat4x4<f32>",
    viewProjectionMatrix: "mat4x4<f32>",
    viewportSize: "vec2<f32>",
    devicePixelRatio: "f32",
    focalDistance: "f32",
    cameraPosition: "vec3<f32>",
    coordinateOrigin: "vec3<f32>",
    commonOrigin: "vec3<f32>",
    pseudoMeters: "f32"
  }
  // @ts-ignore TODO v9.1
};

// ../core/src/shaderlib/project32/project32.ts
var source2 = (
  /* wgsl */
  `// Define a structure to hold both the clip-space position and the common position.
struct ProjectResult {
  clipPosition: vec4<f32>,
  commonPosition: vec4<f32>,
};

// This function mimics the GLSL version with the 'out' parameter by returning both values.
fn project_position_to_clipspace_and_commonspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> ProjectResult {
  // Compute the projected position.
  let projectedPosition: vec3<f32> = project_position_vec3_f64(position, position64Low);

  // Start with the provided offset.
  var finalOffset: vec3<f32> = offset;

  // Get whether a rotation is needed and the rotation matrix.
  let rotationResult = project_needs_rotation(projectedPosition);

  // If rotation is needed, update the offset.
  if (rotationResult.needsRotation) {
    finalOffset = rotationResult.transform * offset;
  }

  // Compute the common position.
  let commonPosition: vec4<f32> = vec4<f32>(projectedPosition + finalOffset, 1.0);

  // Convert to clip-space.
  let clipPosition: vec4<f32> = project_common_position_to_clipspace(commonPosition);

  return ProjectResult(clipPosition, commonPosition);
}

// A convenience overload that returns only the clip-space position.
fn project_position_to_clipspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> vec4<f32> {
  return project_position_to_clipspace_and_commonspace(position, position64Low, offset).clipPosition;
}
`
);
var vs2 = (
  /* glsl */
  `vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition
) {
  vec3 projectedPosition = project_position(position, position64Low);
  mat3 rotation;
  if (project_needs_rotation(projectedPosition, rotation)) {
    // offset is specified as ENU
    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe
    offset = rotation * offset;
  }
  commonPosition = vec4(projectedPosition + offset, 1.0);
  return project_common_position_to_clipspace(commonPosition);
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset
) {
  vec4 commonPosition;
  return project_position_to_clipspace(position, position64Low, offset, commonPosition);
}
`
);
var project32_default = {
  name: "project32",
  dependencies: [project_default],
  source: source2,
  vs: vs2
};

// ../core/src/shaderlib/picking/picking.ts
var import_shadertools2 = require("@luma.gl/shadertools");
var PICKING_MAX_DISABLED_INDICES = 10;
var PICKING_INVALID_INDEX = 16777215;
function disablePickingIndex(disabledPickingIndices, objectIndex) {
  if (disabledPickingIndices.length === PICKING_MAX_DISABLED_INDICES) {
    log_default.warn(
      `pickMultipleObjects can only exclude ${PICKING_MAX_DISABLED_INDICES} previously picked objects for layers without picking buffers`
    )();
  } else {
    disabledPickingIndices.push(objectIndex);
  }
}
var pickingUniformsGLSL = (
  /* glsl */
  `  float disabledPickingIndexCount;
  vec4 disabledPickingIndices0;
  vec4 disabledPickingIndices1;
  vec4 disabledPickingIndices2;
`
);
function addPickingUniformsGLSL(source6) {
  return source6.replace(
    "  vec4 highlightColor;\n} picking;",
    `  vec4 highlightColor;
${pickingUniformsGLSL}} picking;`
  );
}
function packDisabledPickingIndices(disabledPickingIndices, startIndex) {
  return [
    disabledPickingIndices[startIndex] || 0,
    disabledPickingIndices[startIndex + 1] || 0,
    disabledPickingIndices[startIndex + 2] || 0,
    disabledPickingIndices[startIndex + 3] || 0
  ];
}
var pickingHelpersGLSL = (
  /* glsl */
  `vec3 picking_getPickingColorFromIndex(float objectIndex) {
  if (objectIndex < 0.0 || objectIndex >= ${PICKING_INVALID_INDEX}.0) {
    return vec3(0.0);
  }

  for (int i = 0; i < ${PICKING_MAX_DISABLED_INDICES}; i++) {
    if (float(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    vec4 disabledIndices = i < 4
      ? picking.disabledPickingIndices0
      : (i < 8 ? picking.disabledPickingIndices1 : picking.disabledPickingIndices2);
    float disabledIndex = disabledIndices[i - (i / 4) * 4];
    if (disabledIndex == objectIndex) {
      return vec3(0.0);
    }
  }

  float encodedIndex = objectIndex + 1.0;
  return vec3(
    mod(encodedIndex, 256.0),
    mod(floor(encodedIndex / 256.0), 256.0),
    mod(floor(encodedIndex / 65536.0), 256.0)
  );
}

vec3 picking_getPickingColorFromIndex(uint objectIndex) {
  return picking_getPickingColorFromIndex(float(objectIndex));
}

vec3 picking_getPickingColorFromInstanceID() {
  return picking_getPickingColorFromIndex(float(gl_InstanceID));
}

void picking_setPickingColorFromInstanceID() {
  picking_setPickingColor(picking_getPickingColorFromInstanceID());
}
`
);
var sourceWGSL = (
  /* wgsl */
  `struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useByteColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
  disabledPickingIndexCount: f32,
  disabledPickingIndices0: vec4<f32>,
  disabledPickingIndices1: vec4<f32>,
  disabledPickingIndices2: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;

fn picking_normalizeColor(color: vec3<f32>) -> vec3<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_normalizeColor4(color: vec4<f32>) -> vec4<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_isColorZero(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) < 0.00001;
}

fn picking_isColorValid(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) > 0.00001;
}

fn picking_getPickingColorFromIndex(objectIndex: u32) -> vec3<f32> {
  if (objectIndex >= ${PICKING_INVALID_INDEX}u) {
    return vec3<f32>(0.0);
  }

  for (var i = 0; i < ${PICKING_MAX_DISABLED_INDICES}; i = i + 1) {
    if (f32(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    let disabledIndices = select(
      picking.disabledPickingIndices2,
      select(picking.disabledPickingIndices1, picking.disabledPickingIndices0, i < 4),
      i < 8
    );
    let disabledIndex = disabledIndices[i % 4];
    if (disabledIndex == f32(objectIndex)) {
      return vec3<f32>(0.0);
    }
  }

  let encodedIndex = objectIndex + 1u;
  return vec3<f32>(
    f32(encodedIndex % 256u),
    f32((encodedIndex / 256u) % 256u),
    f32((encodedIndex / 65536u) % 256u)
  ) / 255.0;
}
`
);
var picking_default = {
  ...import_shadertools2.picking,
  vs: `${addPickingUniformsGLSL(import_shadertools2.picking.vs)}
${pickingHelpersGLSL}`,
  fs: addPickingUniformsGLSL(import_shadertools2.picking.fs),
  source: sourceWGSL,
  uniformTypes: {
    ...import_shadertools2.picking.uniformTypes,
    disabledPickingIndexCount: "f32",
    disabledPickingIndices0: "vec4<f32>",
    disabledPickingIndices1: "vec4<f32>",
    disabledPickingIndices2: "vec4<f32>"
  },
  defaultUniforms: {
    ...import_shadertools2.picking.defaultUniforms,
    useByteColors: true,
    disabledPickingIndexCount: 0,
    disabledPickingIndices0: [0, 0, 0, 0],
    disabledPickingIndices1: [0, 0, 0, 0],
    disabledPickingIndices2: [0, 0, 0, 0]
  },
  getUniforms(props, prevUniforms) {
    const uniforms = import_shadertools2.picking.getUniforms(props, prevUniforms);
    const disabledPickingIndices = props.disabledPickingIndices || [];
    uniforms.disabledPickingIndexCount = disabledPickingIndices.length;
    uniforms.disabledPickingIndices0 = packDisabledPickingIndices(disabledPickingIndices, 0);
    uniforms.disabledPickingIndices1 = packDisabledPickingIndices(disabledPickingIndices, 4);
    uniforms.disabledPickingIndices2 = packDisabledPickingIndices(disabledPickingIndices, 8);
    return uniforms;
  },
  inject: {
    "vs:DECKGL_FILTER_GL_POSITION": `
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,
    "vs:DECKGL_FILTER_COLOR": `
  picking_setPickingColor(geometry.pickingColor);
  `,
    "fs:DECKGL_FILTER_COLOR": {
      order: 99,
      injection: `
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `
    }
  }
};

// ../core/src/utils/typed-array-manager.ts
var TypedArrayManager = class {
  constructor(options = {}) {
    this._pool = [];
    this.opts = { overAlloc: 2, poolSize: 100 };
    this.setOptions(options);
  }
  setOptions(options) {
    Object.assign(this.opts, options);
  }
  allocate(typedArray, count2, {
    size = 1,
    type,
    padding = 0,
    copy = false,
    initialize = false,
    maxCount
  }) {
    const Type = type || typedArray && typedArray.constructor || Float32Array;
    const newSize = count2 * size + padding;
    if (ArrayBuffer.isView(typedArray)) {
      if (newSize <= typedArray.length) {
        return typedArray;
      }
      if (newSize * typedArray.BYTES_PER_ELEMENT <= typedArray.buffer.byteLength) {
        return new Type(typedArray.buffer, 0, newSize);
      }
    }
    let maxSize = Infinity;
    if (maxCount) {
      maxSize = maxCount * size + padding;
    }
    const newArray = this._allocate(Type, newSize, initialize, maxSize);
    if (typedArray && copy) {
      newArray.set(typedArray);
    } else if (!initialize) {
      newArray.fill(0, 0, 4);
    }
    this._release(typedArray);
    return newArray;
  }
  release(typedArray) {
    this._release(typedArray);
  }
  _allocate(Type, size, initialize, maxSize) {
    let sizeToAllocate = Math.max(Math.ceil(size * this.opts.overAlloc), 1);
    if (sizeToAllocate > maxSize) {
      sizeToAllocate = maxSize;
    }
    const pool = this._pool;
    const byteLength = Type.BYTES_PER_ELEMENT * sizeToAllocate;
    const i = pool.findIndex((b) => b.byteLength >= byteLength);
    if (i >= 0) {
      const array = new Type(pool.splice(i, 1)[0], 0, sizeToAllocate);
      if (initialize) {
        array.fill(0);
      }
      return array;
    }
    return new Type(sizeToAllocate);
  }
  _release(typedArray) {
    if (!ArrayBuffer.isView(typedArray)) {
      return;
    }
    const pool = this._pool;
    const { buffer } = typedArray;
    const { byteLength } = buffer;
    const i = pool.findIndex((b) => b.byteLength >= byteLength);
    if (i < 0) {
      pool.push(buffer);
    } else if (i > 0 || pool.length < this.opts.poolSize) {
      pool.splice(i, 0, buffer);
    }
    if (pool.length > this.opts.poolSize) {
      pool.shift();
    }
  }
};
var typed_array_manager_default = new TypedArrayManager();

// ../core/src/utils/math-utils.ts
var import_core2 = require("@math.gl/core");
function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function getCameraPosition(viewMatrixInverse) {
  return [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]];
}
function getFrustumPlanes(viewProjectionMatrix) {
  return {
    left: getFrustumPlane(
      viewProjectionMatrix[3] + viewProjectionMatrix[0],
      viewProjectionMatrix[7] + viewProjectionMatrix[4],
      viewProjectionMatrix[11] + viewProjectionMatrix[8],
      viewProjectionMatrix[15] + viewProjectionMatrix[12]
    ),
    right: getFrustumPlane(
      viewProjectionMatrix[3] - viewProjectionMatrix[0],
      viewProjectionMatrix[7] - viewProjectionMatrix[4],
      viewProjectionMatrix[11] - viewProjectionMatrix[8],
      viewProjectionMatrix[15] - viewProjectionMatrix[12]
    ),
    bottom: getFrustumPlane(
      viewProjectionMatrix[3] + viewProjectionMatrix[1],
      viewProjectionMatrix[7] + viewProjectionMatrix[5],
      viewProjectionMatrix[11] + viewProjectionMatrix[9],
      viewProjectionMatrix[15] + viewProjectionMatrix[13]
    ),
    top: getFrustumPlane(
      viewProjectionMatrix[3] - viewProjectionMatrix[1],
      viewProjectionMatrix[7] - viewProjectionMatrix[5],
      viewProjectionMatrix[11] - viewProjectionMatrix[9],
      viewProjectionMatrix[15] - viewProjectionMatrix[13]
    ),
    near: getFrustumPlane(
      viewProjectionMatrix[3] + viewProjectionMatrix[2],
      viewProjectionMatrix[7] + viewProjectionMatrix[6],
      viewProjectionMatrix[11] + viewProjectionMatrix[10],
      viewProjectionMatrix[15] + viewProjectionMatrix[14]
    ),
    far: getFrustumPlane(
      viewProjectionMatrix[3] - viewProjectionMatrix[2],
      viewProjectionMatrix[7] - viewProjectionMatrix[6],
      viewProjectionMatrix[11] - viewProjectionMatrix[10],
      viewProjectionMatrix[15] - viewProjectionMatrix[14]
    )
  };
}
var scratchVector = new import_core2.Vector3();
function getFrustumPlane(a, b, c, d) {
  scratchVector.set(a, b, c);
  const L = scratchVector.len();
  return { distance: d / L, normal: new import_core2.Vector3(-a / L, -b / L, -c / L) };
}
function fp64LowPart(x) {
  return x - Math.fround(x);
}
var scratchArray;
function toDoublePrecisionArray(typedArray, options) {
  const { size = 1, startIndex = 0 } = options;
  const endIndex = options.endIndex !== void 0 ? options.endIndex : typedArray.length;
  const count2 = (endIndex - startIndex) / size;
  scratchArray = typed_array_manager_default.allocate(scratchArray, count2, {
    type: Float32Array,
    size: size * 2
  });
  let sourceIndex = startIndex;
  let targetIndex = 0;
  while (sourceIndex < endIndex) {
    for (let j = 0; j < size; j++) {
      const value = typedArray[sourceIndex++];
      scratchArray[targetIndex + j] = value;
      scratchArray[targetIndex + j + size] = fp64LowPart(value);
    }
    targetIndex += size * 2;
  }
  return scratchArray.subarray(0, count2 * size * 2);
}
function mergeBounds(boundsList) {
  let mergedBounds = null;
  let isMerged = false;
  for (const bounds of boundsList) {
    if (!bounds) continue;
    if (!mergedBounds) {
      mergedBounds = bounds;
    } else {
      if (!isMerged) {
        mergedBounds = [
          [mergedBounds[0][0], mergedBounds[0][1]],
          [mergedBounds[1][0], mergedBounds[1][1]]
        ];
        isMerged = true;
      }
      mergedBounds[0][0] = Math.min(mergedBounds[0][0], bounds[0][0]);
      mergedBounds[0][1] = Math.min(mergedBounds[0][1], bounds[0][1]);
      mergedBounds[1][0] = Math.max(mergedBounds[1][0], bounds[1][0]);
      mergedBounds[1][1] = Math.max(mergedBounds[1][1], bounds[1][1]);
    }
  }
  return mergedBounds;
}

// ../core/src/viewports/viewport.ts
var import_core3 = require("@math.gl/core");
var import_web_mercator = require("@math.gl/web-mercator");
var DEGREES_TO_RADIANS = Math.PI / 180;
var IDENTITY = createMat4();
var ZERO_VECTOR2 = [0, 0, 0];
var DEFAULT_DISTANCE_SCALES = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};
function createProjectionMatrix({
  width,
  height,
  orthographic,
  fovyRadians,
  focalDistance,
  padding,
  near,
  far
}) {
  const aspect = width / height;
  const matrix = orthographic ? new import_core3.Matrix4().orthographic({ fovy: fovyRadians, aspect, focalDistance, near, far }) : new import_core3.Matrix4().perspective({ fovy: fovyRadians, aspect, near, far });
  if (padding) {
    const { left = 0, right = 0, top = 0, bottom = 0 } = padding;
    const offsetX = (0, import_core3.clamp)((left + width - right) / 2, 0, width) - width / 2;
    const offsetY = (0, import_core3.clamp)((top + height - bottom) / 2, 0, height) - height / 2;
    matrix[8] -= offsetX * 2 / width;
    matrix[9] += offsetY * 2 / height;
  }
  return matrix;
}
var _Viewport = class _Viewport {
  // eslint-disable-next-line complexity
  constructor(opts = {}) {
    this._frustumPlanes = {};
    this.id = opts.id || this.constructor.displayName || "viewport";
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.width = opts.width || 1;
    this.height = opts.height || 1;
    this.zoom = opts.zoom || 0;
    this.padding = opts.padding;
    this.distanceScales = opts.distanceScales || DEFAULT_DISTANCE_SCALES;
    this.focalDistance = opts.focalDistance || 1;
    this.position = opts.position || ZERO_VECTOR2;
    this.modelMatrix = opts.modelMatrix || null;
    const { longitude, latitude } = opts;
    this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);
    this._initProps(opts);
    this._initMatrices(opts);
    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }
  get subViewports() {
    return null;
  }
  get metersPerPixel() {
    return this.distanceScales.metersPerUnit[2] / this.scale;
  }
  get projectionMode() {
    if (this.isGeospatial) {
      return this.zoom < 12 ? PROJECTION_MODE.WEB_MERCATOR : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
    }
    return PROJECTION_MODE.IDENTITY;
  }
  // Two viewports are equal if width and height are identical, and if
  // their view and projection matrices are (approximately) equal.
  equals(viewport) {
    if (!(viewport instanceof _Viewport)) {
      return false;
    }
    if (this === viewport) {
      return true;
    }
    return viewport.width === this.width && viewport.height === this.height && viewport.scale === this.scale && (0, import_core3.equals)(viewport.projectionMatrix, this.projectionMatrix) && (0, import_core3.equals)(viewport.viewMatrix, this.viewMatrix);
  }
  /**
   * Projects xyz (possibly latitude and longitude) to pixel coordinates in window
   * using viewport projection parameters
   * - [longitude, latitude] to [x, y]
   * - [longitude, latitude, Z] => [x, y, z]
   * Note: By default, returns top-left coordinates for canvas/SVG type render
   *
   * @param {Array} lngLatZ - [lng, lat] or [lng, lat, Z]
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether projected coords are top left
   * @return {Array} - [x, y] or [x, y, z] in top left coords
   */
  project(xyz, { topLeft = true } = {}) {
    const worldPosition = this.projectPosition(xyz);
    const coord = (0, import_web_mercator.worldToPixels)(worldPosition, this.pixelProjectionMatrix);
    const [x, y] = coord;
    const y2 = topLeft ? y : this.height - y;
    return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
  }
  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether origin is top left
   * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
   */
  unproject(xyz, { topLeft = true, targetZ } = {}) {
    const [x, y, z] = xyz;
    const y2 = topLeft ? y : this.height - y;
    const targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
    const coord = (0, import_web_mercator.pixelsToWorld)([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);
    const [X, Y, Z] = this.unprojectPosition(coord);
    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }
  // NON_LINEAR PROJECTION HOOKS
  // Used for web meractor projection
  projectPosition(xyz) {
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
    return [X, Y, Z];
  }
  unprojectPosition(xyz) {
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
    return [X, Y, Z];
  }
  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   * @param {Array} lngLat - [lng, lat] coordinates
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   */
  projectFlat(xyz) {
    if (this.isGeospatial) {
      const result = (0, import_web_mercator.lngLatToWorld)(xyz);
      result[1] = (0, import_core3.clamp)(result[1], -318, 830);
      return result;
    }
    return xyz;
  }
  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   * @param {object|Vector} xy - object with {x,y} members
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   */
  unprojectFlat(xyz) {
    if (this.isGeospatial) {
      return (0, import_web_mercator.worldToLngLat)(xyz);
    }
    return xyz;
  }
  /**
   * Get bounds of the current viewport
   * @return {Array} - [minX, minY, maxX, maxY]
   */
  getBounds(options = {}) {
    const unprojectOption = { targetZ: options.z || 0 };
    const topLeft = this.unproject([0, 0], unprojectOption);
    const topRight = this.unproject([this.width, 0], unprojectOption);
    const bottomLeft = this.unproject([0, this.height], unprojectOption);
    const bottomRight = this.unproject([this.width, this.height], unprojectOption);
    return [
      Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
      Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])
    ];
  }
  getDistanceScales(coordinateOrigin) {
    if (coordinateOrigin && this.isGeospatial) {
      return (0, import_web_mercator.getDistanceScales)({
        longitude: coordinateOrigin[0],
        latitude: coordinateOrigin[1],
        highPrecision: true
      });
    }
    return this.distanceScales;
  }
  containsPixel({
    x,
    y,
    width = 1,
    height = 1
  }) {
    return x < this.x + this.width && this.x < x + width && y < this.y + this.height && this.y < y + height;
  }
  // Extract frustum planes in common space
  getFrustumPlanes() {
    if (this._frustumPlanes.near) {
      return this._frustumPlanes;
    }
    Object.assign(this._frustumPlanes, getFrustumPlanes(this.viewProjectionMatrix));
    return this._frustumPlanes;
  }
  // EXPERIMENTAL METHODS
  /**
   * Needed by panning and linear transition
   * Pan the viewport to place a given world coordinate at screen point [x, y]
   *
   * @param {Array} coords - world coordinates
   * @param {Array} pixel - [x,y] coordinates on screen
   * @param {Array} startPixel - [x,y] screen position where pan started (optional, for delta-based panning)
   * @return {Object} props of the new viewport
   */
  panByPosition(coords, pixel, startPixel) {
    return null;
  }
  // INTERNAL METHODS
  /* eslint-disable complexity, max-statements */
  _initProps(opts) {
    const longitude = opts.longitude;
    const latitude = opts.latitude;
    if (this.isGeospatial) {
      if (!Number.isFinite(opts.zoom)) {
        this.zoom = (0, import_web_mercator.getMeterZoom)({ latitude }) + Math.log2(this.focalDistance);
      }
      this.distanceScales = opts.distanceScales || (0, import_web_mercator.getDistanceScales)({ latitude, longitude });
    }
    const scale = Math.pow(2, this.zoom);
    this.scale = scale;
    const { position, modelMatrix: modelMatrix2 } = opts;
    let meterOffset = ZERO_VECTOR2;
    if (position) {
      meterOffset = modelMatrix2 ? new import_core3.Matrix4(modelMatrix2).transformAsVector(position, []) : position;
    }
    if (this.isGeospatial) {
      const center = this.projectPosition([longitude, latitude, 0]);
      this.center = new import_core3.Vector3(meterOffset).scale(this.distanceScales.unitsPerMeter).add(center);
    } else {
      this.center = this.projectPosition(meterOffset);
    }
  }
  /* eslint-enable complexity, max-statements */
  _initMatrices(opts) {
    const {
      // View matrix
      viewMatrix = IDENTITY,
      // Projection matrix
      projectionMatrix = null,
      // Projection matrix parameters, used if projectionMatrix not supplied
      orthographic = false,
      fovyRadians,
      fovy = 75,
      near = 0.1,
      // Distance of near clipping plane
      far = 1e3,
      // Distance of far clipping plane
      padding = null,
      // Center offset in pixels
      focalDistance = 1
    } = opts;
    this.viewMatrixUncentered = viewMatrix;
    this.viewMatrix = new import_core3.Matrix4().multiplyRight(viewMatrix).translate(new import_core3.Vector3(this.center).negate());
    this.projectionMatrix = projectionMatrix || createProjectionMatrix({
      width: this.width,
      height: this.height,
      orthographic,
      fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS,
      focalDistance,
      padding,
      near,
      far
    });
    const vpm = createMat4();
    import_core3.mat4.multiply(vpm, vpm, this.projectionMatrix);
    import_core3.mat4.multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;
    this.viewMatrixInverse = import_core3.mat4.invert([], this.viewMatrix) || this.viewMatrix;
    this.cameraPosition = getCameraPosition(this.viewMatrixInverse);
    const viewportMatrix = createMat4();
    const pixelProjectionMatrix = createMat4();
    import_core3.mat4.scale(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
    import_core3.mat4.translate(viewportMatrix, viewportMatrix, [1, -1, 0]);
    import_core3.mat4.multiply(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
    this.pixelProjectionMatrix = pixelProjectionMatrix;
    this.pixelUnprojectionMatrix = import_core3.mat4.invert(createMat4(), this.pixelProjectionMatrix);
    if (!this.pixelUnprojectionMatrix) {
      log_default.warn("Pixel project matrix not invertible")();
    }
  }
};
_Viewport.displayName = "Viewport";
var Viewport = _Viewport;

// ../core/src/viewports/web-mercator-viewport.ts
var import_web_mercator2 = require("@math.gl/web-mercator");
var import_core4 = require("@math.gl/core");
var _WebMercatorViewport = class _WebMercatorViewport extends Viewport {
  /* eslint-disable complexity, max-statements */
  constructor(opts = {}) {
    const {
      latitude = 0,
      longitude = 0,
      zoom = 0,
      pitch = 0,
      bearing = 0,
      nearZMultiplier = 0.1,
      farZMultiplier = 1.01,
      nearZ,
      farZ,
      orthographic = false,
      projectionMatrix,
      repeat = false,
      worldOffset = 0,
      position,
      padding,
      // backward compatibility
      // TODO: remove in v9
      legacyMeterSizes = false
    } = opts;
    let { width, height, altitude = 1.5 } = opts;
    const scale = Math.pow(2, zoom);
    width = width || 1;
    height = height || 1;
    let fovy;
    let projectionParameters = null;
    if (projectionMatrix) {
      altitude = projectionMatrix[5] / 2;
      fovy = (0, import_web_mercator2.altitudeToFovy)(altitude);
    } else {
      if (opts.fovy) {
        fovy = opts.fovy;
        altitude = (0, import_web_mercator2.fovyToAltitude)(fovy);
      } else {
        fovy = (0, import_web_mercator2.altitudeToFovy)(altitude);
      }
      let offset;
      if (padding) {
        const { top = 0, bottom = 0 } = padding;
        offset = [0, (0, import_core4.clamp)((top + height - bottom) / 2, 0, height) - height / 2];
      }
      projectionParameters = (0, import_web_mercator2.getProjectionParameters)({
        width,
        height,
        scale,
        center: position && [0, 0, position[2] * (0, import_web_mercator2.unitsPerMeter)(latitude)],
        offset,
        pitch,
        fovy,
        nearZMultiplier,
        farZMultiplier
      });
      if (Number.isFinite(nearZ)) {
        projectionParameters.near = nearZ;
      }
      if (Number.isFinite(farZ)) {
        projectionParameters.far = farZ;
      }
    }
    let viewMatrixUncentered = (0, import_web_mercator2.getViewMatrix)({
      height,
      pitch,
      bearing,
      scale,
      altitude
    });
    if (worldOffset) {
      const viewOffset = new import_core4.Matrix4().translate([512 * worldOffset, 0, 0]);
      viewMatrixUncentered = viewOffset.multiplyLeft(viewMatrixUncentered);
    }
    super({
      ...opts,
      // x, y,
      width,
      height,
      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,
      // projection matrix parameters
      ...projectionParameters,
      fovy,
      focalDistance: altitude
    });
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.fovy = fovy;
    this.orthographic = orthographic;
    this._subViewports = repeat ? [] : null;
    this._pseudoMeters = legacyMeterSizes;
    Object.freeze(this);
  }
  /* eslint-enable complexity, max-statements */
  get subViewports() {
    if (this._subViewports && !this._subViewports.length) {
      const bounds = this.getBounds();
      const minOffset = Math.floor((bounds[0] + 180) / 360);
      const maxOffset = Math.ceil((bounds[2] - 180) / 360);
      for (let x = minOffset; x <= maxOffset; x++) {
        const offsetViewport = x ? new _WebMercatorViewport({
          ...this,
          worldOffset: x
        }) : this;
        this._subViewports.push(offsetViewport);
      }
    }
    return this._subViewports;
  }
  projectPosition(xyz) {
    if (this._pseudoMeters) {
      return super.projectPosition(xyz);
    }
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * (0, import_web_mercator2.unitsPerMeter)(xyz[1]);
    return [X, Y, Z];
  }
  unprojectPosition(xyz) {
    if (this._pseudoMeters) {
      return super.unprojectPosition(xyz);
    }
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) / (0, import_web_mercator2.unitsPerMeter)(Y);
    return [X, Y, Z];
  }
  /**
   * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @param {[Number,Number]|[Number,Number,Number]) lngLatZ - base coordinate
   * @param {[Number,Number]|[Number,Number,Number]) xyz - array of meter deltas
   * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
   */
  addMetersToLngLat(lngLatZ, xyz) {
    return (0, import_web_mercator2.addMetersToLngLat)(lngLatZ, xyz);
  }
  panByPosition(coords, pixel, startPixel) {
    const fromLocation = (0, import_web_mercator2.pixelsToWorld)(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);
    const translate = import_core4.vec2.add([], toLocation, import_core4.vec2.negate([], fromLocation));
    const newCenter = import_core4.vec2.add([], this.center, translate);
    const [longitude, latitude] = this.unprojectFlat(newCenter);
    return { longitude, latitude };
  }
  /**
   * Returns a new longitude and latitude that keeps a 3D world coordinate at a given screen pixel
   * This version handles the z-component (altitude) properly for cameras positioned above ground
   */
  panByPosition3D(coords, pixel) {
    const targetZ = coords[2] || 0;
    const deltaLngLat = import_core4.vec2.sub([], coords, this.unproject(pixel, { targetZ }));
    return { longitude: this.longitude + deltaLngLat[0], latitude: this.latitude + deltaLngLat[1] };
  }
  getBounds(options = {}) {
    const corners = (0, import_web_mercator2.getBounds)(this, options.z || 0);
    return [
      Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]),
      Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])
    ];
  }
  /**
   * Returns a new viewport that fit around the given rectangle.
   * Only supports non-perspective mode.
   */
  fitBounds(bounds, options = {}) {
    const { width, height } = this;
    const { longitude, latitude, zoom } = (0, import_web_mercator2.fitBounds)({ width, height, bounds, ...options });
    return new _WebMercatorViewport({ width, height, longitude, latitude, zoom });
  }
};
_WebMercatorViewport.displayName = "WebMercatorViewport";
var WebMercatorViewport = _WebMercatorViewport;

// ../core/src/shaderlib/project/project-functions.ts
var import_core5 = require("@math.gl/core");
var import_web_mercator3 = require("@math.gl/web-mercator");
var DEFAULT_COORDINATE_ORIGIN2 = [0, 0, 0];
function lngLatZToWorldPosition(lngLatZ, viewport, offsetMode = false) {
  const p = viewport.projectPosition(lngLatZ);
  if (offsetMode && viewport instanceof WebMercatorViewport) {
    const [longitude, latitude, z = 0] = lngLatZ;
    const distanceScales = viewport.getDistanceScales([longitude, latitude]);
    p[2] = z * distanceScales.unitsPerMeter[2];
  }
  return p;
}
function normalizeParameters(opts) {
  const { viewport, modelMatrix: modelMatrix2, coordinateOrigin } = opts;
  let { coordinateSystem, fromCoordinateSystem, fromCoordinateOrigin } = opts;
  if (coordinateSystem === "default") {
    coordinateSystem = viewport.isGeospatial ? "lnglat" : "cartesian";
  }
  if (fromCoordinateSystem === void 0) {
    fromCoordinateSystem = coordinateSystem;
  } else if (fromCoordinateSystem === "default") {
    fromCoordinateSystem = viewport.isGeospatial ? "lnglat" : "cartesian";
  }
  if (fromCoordinateOrigin === void 0) {
    fromCoordinateOrigin = coordinateOrigin;
  }
  return {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    modelMatrix: modelMatrix2,
    fromCoordinateSystem,
    fromCoordinateOrigin
  };
}
function getWorldPosition(position, {
  viewport,
  modelMatrix: modelMatrix2,
  coordinateSystem,
  coordinateOrigin,
  offsetMode
}) {
  let [x, y, z = 0] = position;
  if (modelMatrix2) {
    [x, y, z] = import_core5.vec4.transformMat4([], [x, y, z, 1], modelMatrix2);
  }
  switch (coordinateSystem) {
    case "default":
      return getWorldPosition(position, {
        viewport,
        modelMatrix: modelMatrix2,
        coordinateSystem: viewport.isGeospatial ? "lnglat" : "cartesian",
        coordinateOrigin,
        offsetMode
      });
    case "lnglat":
      return lngLatZToWorldPosition([x, y, z], viewport, offsetMode);
    case "lnglat-offsets":
      return lngLatZToWorldPosition(
        [x + coordinateOrigin[0], y + coordinateOrigin[1], z + (coordinateOrigin[2] || 0)],
        viewport,
        offsetMode
      );
    case "meter-offsets":
      return lngLatZToWorldPosition(
        (0, import_web_mercator3.addMetersToLngLat)(coordinateOrigin, [x, y, z]),
        viewport,
        offsetMode
      );
    case "cartesian":
      return viewport.isGeospatial ? [x + coordinateOrigin[0], y + coordinateOrigin[1], z + coordinateOrigin[2]] : viewport.projectPosition([x, y, z]);
    default:
      throw new Error(`Invalid coordinateSystem: ${coordinateSystem}`);
  }
}
function projectPosition(position, params) {
  const {
    viewport,
    coordinateSystem,
    coordinateOrigin,
    modelMatrix: modelMatrix2,
    fromCoordinateSystem,
    fromCoordinateOrigin
  } = normalizeParameters(params);
  const { autoOffset = true } = params;
  const {
    geospatialOrigin = DEFAULT_COORDINATE_ORIGIN2,
    shaderCoordinateOrigin = DEFAULT_COORDINATE_ORIGIN2,
    offsetMode = false
  } = autoOffset ? getOffsetOrigin(viewport, coordinateSystem, coordinateOrigin) : {};
  const worldPosition = getWorldPosition(position, {
    viewport,
    modelMatrix: modelMatrix2,
    coordinateSystem: fromCoordinateSystem,
    coordinateOrigin: fromCoordinateOrigin,
    offsetMode
  });
  if (offsetMode) {
    const positionCommonSpace = viewport.projectPosition(
      geospatialOrigin || shaderCoordinateOrigin
    );
    import_core5.vec3.sub(worldPosition, worldPosition, positionCommonSpace);
  }
  return worldPosition;
}

// ../core/src/lifecycle/constants.ts
var LIFECYCLE = {
  NO_STATE: "Awaiting state",
  MATCHED: "Matched. State transferred from previous layer",
  INITIALIZED: "Initialized",
  AWAITING_GC: "Discarded. Awaiting garbage collection",
  AWAITING_FINALIZATION: "No longer matched. Awaiting garbage collection",
  FINALIZED: "Finalized! Awaiting garbage collection"
};
var COMPONENT_SYMBOL = /* @__PURE__ */ Symbol.for("component");
var PROP_TYPES_SYMBOL = /* @__PURE__ */ Symbol.for("propTypes");
var DEPRECATED_PROPS_SYMBOL = /* @__PURE__ */ Symbol.for("deprecatedProps");
var ASYNC_DEFAULTS_SYMBOL = /* @__PURE__ */ Symbol.for("asyncPropDefaults");
var ASYNC_ORIGINAL_SYMBOL = /* @__PURE__ */ Symbol.for("asyncPropOriginal");
var ASYNC_RESOLVED_SYMBOL = /* @__PURE__ */ Symbol.for("asyncPropResolved");

// ../core/src/utils/flatten.ts
function flatten(array, filter = () => true) {
  if (!Array.isArray(array)) {
    return filter(array) ? [array] : [];
  }
  return flattenArray(array, filter, []);
}
function flattenArray(array, filter, result) {
  let index = -1;
  while (++index < array.length) {
    const value = array[index];
    if (Array.isArray(value)) {
      flattenArray(value, filter, result);
    } else if (filter(value)) {
      result.push(value);
    }
  }
  return result;
}
function fillArray({ target, source: source6, start = 0, count: count2 = 1 }) {
  const length = source6.length;
  const total = count2 * length;
  let copied = 0;
  for (let i = start; copied < length; copied++) {
    target[i++] = source6[copied];
  }
  while (copied < total) {
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }
  return target;
}

// ../core/src/utils/deep-equal.ts
function deepEqual(a, b, depth) {
  if (a === b) {
    return true;
  }
  if (!depth || !a || !b) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], depth - 1)) {
        return false;
      }
    }
    return true;
  }
  if (Array.isArray(b)) {
    return false;
  }
  if (typeof a === "object" && typeof b === "object") {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!b.hasOwnProperty(key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key], depth - 1)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

// ../core/src/transitions/transition.ts
var Transition = class {
  /**
   * @params timeline {Timeline}
   */
  constructor(timeline) {
    this._inProgress = false;
    this._handle = null;
    this.time = 0;
    // @ts-expect-error
    this.settings = {
      duration: 0
    };
    this._timeline = timeline;
  }
  /* Public API */
  get inProgress() {
    return this._inProgress;
  }
  /**
   * (re)start this transition.
   * @params props {object} - optional overriding props. see constructor
   */
  start(settings) {
    var _a, _b;
    this.cancel();
    this.settings = settings;
    this._inProgress = true;
    (_b = (_a = this.settings).onStart) == null ? void 0 : _b.call(_a, this);
  }
  /**
   * end this transition if it is in progress.
   */
  end() {
    var _a, _b;
    if (this._inProgress) {
      this._timeline.removeChannel(this._handle);
      this._handle = null;
      this._inProgress = false;
      (_b = (_a = this.settings).onEnd) == null ? void 0 : _b.call(_a, this);
    }
  }
  /**
   * cancel this transition if it is in progress.
   */
  cancel() {
    var _a, _b;
    if (this._inProgress) {
      (_b = (_a = this.settings).onInterrupt) == null ? void 0 : _b.call(_a, this);
      this._timeline.removeChannel(this._handle);
      this._handle = null;
      this._inProgress = false;
    }
  }
  /**
   * update this transition. Returns `true` if updated.
   */
  update() {
    var _a, _b;
    if (!this._inProgress) {
      return false;
    }
    if (this._handle === null) {
      const { _timeline: timeline, settings } = this;
      this._handle = timeline.addChannel({
        delay: timeline.getTime(),
        duration: settings.duration
      });
    }
    this.time = this._timeline.getTime(this._handle);
    this._onUpdate();
    (_b = (_a = this.settings).onUpdate) == null ? void 0 : _b.call(_a, this);
    if (this._timeline.isFinished(this._handle)) {
      this.end();
    }
    return true;
  }
  /* Private API */
  _onUpdate() {
  }
};

// ../core/src/utils/assert.ts
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "deck.gl: assertion failed.");
  }
}

// ../core/src/viewports/globe-viewport.ts
var import_core6 = require("@math.gl/core");
var import_web_mercator4 = require("@math.gl/web-mercator");
var import_core7 = require("@math.gl/core");
var import_web_mercator5 = require("@math.gl/web-mercator");
var DEGREES_TO_RADIANS2 = Math.PI / 180;
var RADIANS_TO_DEGREES = 180 / Math.PI;
var EARTH_RADIUS = 6370972;
var GLOBE_RADIUS = 256;
function getDistanceScales2() {
  const unitsPerMeter2 = GLOBE_RADIUS / EARTH_RADIUS;
  const unitsPerDegree = Math.PI / 180 * GLOBE_RADIUS;
  return {
    unitsPerMeter: [unitsPerMeter2, unitsPerMeter2, unitsPerMeter2],
    unitsPerMeter2: [0, 0, 0],
    metersPerUnit: [1 / unitsPerMeter2, 1 / unitsPerMeter2, 1 / unitsPerMeter2],
    unitsPerDegree: [unitsPerDegree, unitsPerDegree, unitsPerMeter2],
    unitsPerDegree2: [0, 0, 0],
    degreesPerUnit: [1 / unitsPerDegree, 1 / unitsPerDegree, 1 / unitsPerMeter2]
  };
}
var GlobeViewport = class extends Viewport {
  constructor(opts = {}) {
    const {
      longitude = 0,
      bearing = 0,
      pitch = 0,
      zoom = 0,
      // Matches Maplibre defaults
      // https://github.com/maplibre/maplibre-gl-js/blob/f8ab4b48d59ab8fe7b068b102538793bbdd4c848/src/geo/projection/globe_transform.ts#L632-L633
      nearZMultiplier = 0.5,
      farZMultiplier = 1,
      resolution = 10
    } = opts;
    let { latitude = 0, height, altitude = 1.5, fovy } = opts;
    latitude = Math.max(Math.min(latitude, 90), -90);
    height = height || 1;
    if (fovy) {
      altitude = (0, import_web_mercator4.fovyToAltitude)(fovy);
    } else {
      fovy = (0, import_web_mercator4.altitudeToFovy)(altitude);
    }
    const scaleLatitude = Math.max(Math.min(latitude, import_web_mercator5.MAX_LATITUDE), -import_web_mercator5.MAX_LATITUDE);
    const scale = Math.pow(2, zoom - zoomAdjust(scaleLatitude));
    const pitchRadians = pitch * DEGREES_TO_RADIANS2;
    const nearZ = opts.nearZ ?? nearZMultiplier;
    const farZ = opts.farZ ?? (altitude + GLOBE_RADIUS * 2 * scale / height / Math.max(Math.cos(pitchRadians), 0.1)) * farZMultiplier;
    const viewMatrix = new import_core6.Matrix4().lookAt({ eye: [0, -altitude, 0], up: [0, 0, 1] }).rotateX(-pitchRadians).rotateY(-bearing * DEGREES_TO_RADIANS2).rotateX(latitude * DEGREES_TO_RADIANS2).rotateZ(-longitude * DEGREES_TO_RADIANS2).scale(scale / height);
    super({
      ...opts,
      // x, y, width,
      height,
      // view matrix
      viewMatrix,
      longitude,
      latitude,
      zoom,
      // projection matrix parameters
      distanceScales: getDistanceScales2(),
      fovy,
      focalDistance: altitude,
      near: nearZ,
      far: farZ
    });
    this.scale = scale;
    this.latitude = latitude;
    this.longitude = longitude;
    this.bearing = bearing;
    this.pitch = pitch;
    this.fovy = fovy;
    this.resolution = resolution;
  }
  get projectionMode() {
    return PROJECTION_MODE.GLOBE;
  }
  getDistanceScales() {
    return this.distanceScales;
  }
  getBounds(options = {}) {
    const unprojectOption = { targetZ: options.z || 0 };
    const left = this.unproject([0, this.height / 2], unprojectOption);
    const top = this.unproject([this.width / 2, 0], unprojectOption);
    const right = this.unproject([this.width, this.height / 2], unprojectOption);
    const bottom = this.unproject([this.width / 2, this.height], unprojectOption);
    if (right[0] < this.longitude) right[0] += 360;
    if (left[0] > this.longitude) left[0] -= 360;
    return [
      Math.min(left[0], right[0], top[0], bottom[0]),
      Math.min(left[1], right[1], top[1], bottom[1]),
      Math.max(left[0], right[0], top[0], bottom[0]),
      Math.max(left[1], right[1], top[1], bottom[1])
    ];
  }
  unproject(xyz, { topLeft = true, targetZ } = {}) {
    const [x, y, z] = xyz;
    const y2 = topLeft ? y : this.height - y;
    const { pixelUnprojectionMatrix } = this;
    let coord;
    if (Number.isFinite(z)) {
      coord = transformVector(pixelUnprojectionMatrix, [x, y2, z, 1]);
    } else {
      const coord0 = transformVector(pixelUnprojectionMatrix, [x, y2, -1, 1]);
      const coord1 = transformVector(pixelUnprojectionMatrix, [x, y2, 1, 1]);
      const lt = ((targetZ || 0) / EARTH_RADIUS + 1) * GLOBE_RADIUS;
      const lSqr = import_core7.vec3.sqrLen(import_core7.vec3.sub([], coord0, coord1));
      const l0Sqr = import_core7.vec3.sqrLen(coord0);
      const l1Sqr = import_core7.vec3.sqrLen(coord1);
      const sSqr = (4 * l0Sqr * l1Sqr - (lSqr - l0Sqr - l1Sqr) ** 2) / 16;
      const dSqr = 4 * sSqr / lSqr;
      const r0 = Math.sqrt(l0Sqr - dSqr);
      const dr = Math.sqrt(Math.max(0, lt * lt - dSqr));
      const t = (r0 - dr) / Math.sqrt(lSqr);
      coord = import_core7.vec3.lerp([], coord0, coord1, t);
    }
    const [X, Y, Z] = this.unprojectPosition(coord);
    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }
  projectPosition(xyz) {
    const [lng, lat, Z = 0] = xyz;
    const lambda = lng * DEGREES_TO_RADIANS2;
    const phi = lat * DEGREES_TO_RADIANS2;
    const cosPhi = Math.cos(phi);
    const D = (Z / EARTH_RADIUS + 1) * GLOBE_RADIUS;
    return [Math.sin(lambda) * cosPhi * D, -Math.cos(lambda) * cosPhi * D, Math.sin(phi) * D];
  }
  unprojectPosition(xyz) {
    const [x, y, z] = xyz;
    const D = import_core7.vec3.len(xyz);
    const phi = Math.asin(z / D);
    const lambda = Math.atan2(x, -y);
    const lng = lambda * RADIANS_TO_DEGREES;
    const lat = phi * RADIANS_TO_DEGREES;
    const Z = (D / GLOBE_RADIUS - 1) * EARTH_RADIUS;
    return [lng, lat, Z];
  }
  projectFlat(xyz) {
    return xyz;
  }
  unprojectFlat(xyz) {
    return xyz;
  }
  /**
   * Pan the globe using delta-based movement
   * @param coords - the geographic coordinates where the pan started
   * @param pixel - the current screen position
   * @param startPixel - the screen position where the pan started
   * @returns updated viewport options with new longitude/latitude
   */
  panByPosition([startLng, startLat, startZoom], pixel, startPixel) {
    const scale = Math.pow(2, this.zoom - zoomAdjust(this.latitude));
    const rotationSpeed = 0.25 / scale;
    const longitude = startLng + rotationSpeed * (startPixel[0] - pixel[0]);
    let latitude = startLat - rotationSpeed * (startPixel[1] - pixel[1]);
    latitude = Math.max(Math.min(latitude, 90), -90);
    const out = { longitude, latitude, zoom: startZoom - zoomAdjust(startLat) };
    out.zoom += zoomAdjust(out.latitude);
    return out;
  }
};
GlobeViewport.displayName = "GlobeViewport";
function zoomAdjust(latitude, clampToPoles) {
  if (clampToPoles) {
    latitude = Math.max(Math.min(latitude, import_web_mercator5.MAX_LATITUDE), -import_web_mercator5.MAX_LATITUDE);
  }
  const scaleAdjust = Math.PI * Math.cos(latitude * Math.PI / 180);
  return Math.log2(scaleAdjust);
}
function transformVector(matrix, vector) {
  const result = import_core7.vec4.transformMat4([], vector, matrix);
  import_core7.vec4.scale(result, result, 1 / result[3]);
  return result;
}

// ../../node_modules/@luma.gl/webgl/dist/constants/webgl-constants.js
var GLEnum;
(function(GLEnum2) {
  GLEnum2[GLEnum2["DEPTH_BUFFER_BIT"] = 256] = "DEPTH_BUFFER_BIT";
  GLEnum2[GLEnum2["STENCIL_BUFFER_BIT"] = 1024] = "STENCIL_BUFFER_BIT";
  GLEnum2[GLEnum2["COLOR_BUFFER_BIT"] = 16384] = "COLOR_BUFFER_BIT";
  GLEnum2[GLEnum2["POINTS"] = 0] = "POINTS";
  GLEnum2[GLEnum2["LINES"] = 1] = "LINES";
  GLEnum2[GLEnum2["LINE_LOOP"] = 2] = "LINE_LOOP";
  GLEnum2[GLEnum2["LINE_STRIP"] = 3] = "LINE_STRIP";
  GLEnum2[GLEnum2["TRIANGLES"] = 4] = "TRIANGLES";
  GLEnum2[GLEnum2["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
  GLEnum2[GLEnum2["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
  GLEnum2[GLEnum2["ZERO"] = 0] = "ZERO";
  GLEnum2[GLEnum2["ONE"] = 1] = "ONE";
  GLEnum2[GLEnum2["SRC_COLOR"] = 768] = "SRC_COLOR";
  GLEnum2[GLEnum2["ONE_MINUS_SRC_COLOR"] = 769] = "ONE_MINUS_SRC_COLOR";
  GLEnum2[GLEnum2["SRC_ALPHA"] = 770] = "SRC_ALPHA";
  GLEnum2[GLEnum2["ONE_MINUS_SRC_ALPHA"] = 771] = "ONE_MINUS_SRC_ALPHA";
  GLEnum2[GLEnum2["DST_ALPHA"] = 772] = "DST_ALPHA";
  GLEnum2[GLEnum2["ONE_MINUS_DST_ALPHA"] = 773] = "ONE_MINUS_DST_ALPHA";
  GLEnum2[GLEnum2["DST_COLOR"] = 774] = "DST_COLOR";
  GLEnum2[GLEnum2["ONE_MINUS_DST_COLOR"] = 775] = "ONE_MINUS_DST_COLOR";
  GLEnum2[GLEnum2["SRC_ALPHA_SATURATE"] = 776] = "SRC_ALPHA_SATURATE";
  GLEnum2[GLEnum2["CONSTANT_COLOR"] = 32769] = "CONSTANT_COLOR";
  GLEnum2[GLEnum2["ONE_MINUS_CONSTANT_COLOR"] = 32770] = "ONE_MINUS_CONSTANT_COLOR";
  GLEnum2[GLEnum2["CONSTANT_ALPHA"] = 32771] = "CONSTANT_ALPHA";
  GLEnum2[GLEnum2["ONE_MINUS_CONSTANT_ALPHA"] = 32772] = "ONE_MINUS_CONSTANT_ALPHA";
  GLEnum2[GLEnum2["FUNC_ADD"] = 32774] = "FUNC_ADD";
  GLEnum2[GLEnum2["FUNC_SUBTRACT"] = 32778] = "FUNC_SUBTRACT";
  GLEnum2[GLEnum2["FUNC_REVERSE_SUBTRACT"] = 32779] = "FUNC_REVERSE_SUBTRACT";
  GLEnum2[GLEnum2["BLEND_EQUATION"] = 32777] = "BLEND_EQUATION";
  GLEnum2[GLEnum2["BLEND_EQUATION_RGB"] = 32777] = "BLEND_EQUATION_RGB";
  GLEnum2[GLEnum2["BLEND_EQUATION_ALPHA"] = 34877] = "BLEND_EQUATION_ALPHA";
  GLEnum2[GLEnum2["BLEND_DST_RGB"] = 32968] = "BLEND_DST_RGB";
  GLEnum2[GLEnum2["BLEND_SRC_RGB"] = 32969] = "BLEND_SRC_RGB";
  GLEnum2[GLEnum2["BLEND_DST_ALPHA"] = 32970] = "BLEND_DST_ALPHA";
  GLEnum2[GLEnum2["BLEND_SRC_ALPHA"] = 32971] = "BLEND_SRC_ALPHA";
  GLEnum2[GLEnum2["BLEND_COLOR"] = 32773] = "BLEND_COLOR";
  GLEnum2[GLEnum2["ARRAY_BUFFER_BINDING"] = 34964] = "ARRAY_BUFFER_BINDING";
  GLEnum2[GLEnum2["ELEMENT_ARRAY_BUFFER_BINDING"] = 34965] = "ELEMENT_ARRAY_BUFFER_BINDING";
  GLEnum2[GLEnum2["LINE_WIDTH"] = 2849] = "LINE_WIDTH";
  GLEnum2[GLEnum2["ALIASED_POINT_SIZE_RANGE"] = 33901] = "ALIASED_POINT_SIZE_RANGE";
  GLEnum2[GLEnum2["ALIASED_LINE_WIDTH_RANGE"] = 33902] = "ALIASED_LINE_WIDTH_RANGE";
  GLEnum2[GLEnum2["CULL_FACE_MODE"] = 2885] = "CULL_FACE_MODE";
  GLEnum2[GLEnum2["FRONT_FACE"] = 2886] = "FRONT_FACE";
  GLEnum2[GLEnum2["DEPTH_RANGE"] = 2928] = "DEPTH_RANGE";
  GLEnum2[GLEnum2["DEPTH_WRITEMASK"] = 2930] = "DEPTH_WRITEMASK";
  GLEnum2[GLEnum2["DEPTH_CLEAR_VALUE"] = 2931] = "DEPTH_CLEAR_VALUE";
  GLEnum2[GLEnum2["DEPTH_FUNC"] = 2932] = "DEPTH_FUNC";
  GLEnum2[GLEnum2["STENCIL_CLEAR_VALUE"] = 2961] = "STENCIL_CLEAR_VALUE";
  GLEnum2[GLEnum2["STENCIL_FUNC"] = 2962] = "STENCIL_FUNC";
  GLEnum2[GLEnum2["STENCIL_FAIL"] = 2964] = "STENCIL_FAIL";
  GLEnum2[GLEnum2["STENCIL_PASS_DEPTH_FAIL"] = 2965] = "STENCIL_PASS_DEPTH_FAIL";
  GLEnum2[GLEnum2["STENCIL_PASS_DEPTH_PASS"] = 2966] = "STENCIL_PASS_DEPTH_PASS";
  GLEnum2[GLEnum2["STENCIL_REF"] = 2967] = "STENCIL_REF";
  GLEnum2[GLEnum2["STENCIL_VALUE_MASK"] = 2963] = "STENCIL_VALUE_MASK";
  GLEnum2[GLEnum2["STENCIL_WRITEMASK"] = 2968] = "STENCIL_WRITEMASK";
  GLEnum2[GLEnum2["STENCIL_BACK_FUNC"] = 34816] = "STENCIL_BACK_FUNC";
  GLEnum2[GLEnum2["STENCIL_BACK_FAIL"] = 34817] = "STENCIL_BACK_FAIL";
  GLEnum2[GLEnum2["STENCIL_BACK_PASS_DEPTH_FAIL"] = 34818] = "STENCIL_BACK_PASS_DEPTH_FAIL";
  GLEnum2[GLEnum2["STENCIL_BACK_PASS_DEPTH_PASS"] = 34819] = "STENCIL_BACK_PASS_DEPTH_PASS";
  GLEnum2[GLEnum2["STENCIL_BACK_REF"] = 36003] = "STENCIL_BACK_REF";
  GLEnum2[GLEnum2["STENCIL_BACK_VALUE_MASK"] = 36004] = "STENCIL_BACK_VALUE_MASK";
  GLEnum2[GLEnum2["STENCIL_BACK_WRITEMASK"] = 36005] = "STENCIL_BACK_WRITEMASK";
  GLEnum2[GLEnum2["VIEWPORT"] = 2978] = "VIEWPORT";
  GLEnum2[GLEnum2["SCISSOR_BOX"] = 3088] = "SCISSOR_BOX";
  GLEnum2[GLEnum2["COLOR_CLEAR_VALUE"] = 3106] = "COLOR_CLEAR_VALUE";
  GLEnum2[GLEnum2["COLOR_WRITEMASK"] = 3107] = "COLOR_WRITEMASK";
  GLEnum2[GLEnum2["UNPACK_ALIGNMENT"] = 3317] = "UNPACK_ALIGNMENT";
  GLEnum2[GLEnum2["PACK_ALIGNMENT"] = 3333] = "PACK_ALIGNMENT";
  GLEnum2[GLEnum2["MAX_TEXTURE_SIZE"] = 3379] = "MAX_TEXTURE_SIZE";
  GLEnum2[GLEnum2["MAX_VIEWPORT_DIMS"] = 3386] = "MAX_VIEWPORT_DIMS";
  GLEnum2[GLEnum2["SUBPIXEL_BITS"] = 3408] = "SUBPIXEL_BITS";
  GLEnum2[GLEnum2["RED_BITS"] = 3410] = "RED_BITS";
  GLEnum2[GLEnum2["GREEN_BITS"] = 3411] = "GREEN_BITS";
  GLEnum2[GLEnum2["BLUE_BITS"] = 3412] = "BLUE_BITS";
  GLEnum2[GLEnum2["ALPHA_BITS"] = 3413] = "ALPHA_BITS";
  GLEnum2[GLEnum2["DEPTH_BITS"] = 3414] = "DEPTH_BITS";
  GLEnum2[GLEnum2["STENCIL_BITS"] = 3415] = "STENCIL_BITS";
  GLEnum2[GLEnum2["POLYGON_OFFSET_UNITS"] = 10752] = "POLYGON_OFFSET_UNITS";
  GLEnum2[GLEnum2["POLYGON_OFFSET_FACTOR"] = 32824] = "POLYGON_OFFSET_FACTOR";
  GLEnum2[GLEnum2["TEXTURE_BINDING_2D"] = 32873] = "TEXTURE_BINDING_2D";
  GLEnum2[GLEnum2["SAMPLE_BUFFERS"] = 32936] = "SAMPLE_BUFFERS";
  GLEnum2[GLEnum2["SAMPLES"] = 32937] = "SAMPLES";
  GLEnum2[GLEnum2["SAMPLE_COVERAGE_VALUE"] = 32938] = "SAMPLE_COVERAGE_VALUE";
  GLEnum2[GLEnum2["SAMPLE_COVERAGE_INVERT"] = 32939] = "SAMPLE_COVERAGE_INVERT";
  GLEnum2[GLEnum2["COMPRESSED_TEXTURE_FORMATS"] = 34467] = "COMPRESSED_TEXTURE_FORMATS";
  GLEnum2[GLEnum2["VENDOR"] = 7936] = "VENDOR";
  GLEnum2[GLEnum2["RENDERER"] = 7937] = "RENDERER";
  GLEnum2[GLEnum2["VERSION"] = 7938] = "VERSION";
  GLEnum2[GLEnum2["IMPLEMENTATION_COLOR_READ_TYPE"] = 35738] = "IMPLEMENTATION_COLOR_READ_TYPE";
  GLEnum2[GLEnum2["IMPLEMENTATION_COLOR_READ_FORMAT"] = 35739] = "IMPLEMENTATION_COLOR_READ_FORMAT";
  GLEnum2[GLEnum2["BROWSER_DEFAULT_WEBGL"] = 37444] = "BROWSER_DEFAULT_WEBGL";
  GLEnum2[GLEnum2["STATIC_DRAW"] = 35044] = "STATIC_DRAW";
  GLEnum2[GLEnum2["STREAM_DRAW"] = 35040] = "STREAM_DRAW";
  GLEnum2[GLEnum2["DYNAMIC_DRAW"] = 35048] = "DYNAMIC_DRAW";
  GLEnum2[GLEnum2["ARRAY_BUFFER"] = 34962] = "ARRAY_BUFFER";
  GLEnum2[GLEnum2["ELEMENT_ARRAY_BUFFER"] = 34963] = "ELEMENT_ARRAY_BUFFER";
  GLEnum2[GLEnum2["BUFFER_SIZE"] = 34660] = "BUFFER_SIZE";
  GLEnum2[GLEnum2["BUFFER_USAGE"] = 34661] = "BUFFER_USAGE";
  GLEnum2[GLEnum2["CURRENT_VERTEX_ATTRIB"] = 34342] = "CURRENT_VERTEX_ATTRIB";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_ENABLED"] = 34338] = "VERTEX_ATTRIB_ARRAY_ENABLED";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_SIZE"] = 34339] = "VERTEX_ATTRIB_ARRAY_SIZE";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_STRIDE"] = 34340] = "VERTEX_ATTRIB_ARRAY_STRIDE";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_TYPE"] = 34341] = "VERTEX_ATTRIB_ARRAY_TYPE";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_NORMALIZED"] = 34922] = "VERTEX_ATTRIB_ARRAY_NORMALIZED";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_POINTER"] = 34373] = "VERTEX_ATTRIB_ARRAY_POINTER";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_BUFFER_BINDING"] = 34975] = "VERTEX_ATTRIB_ARRAY_BUFFER_BINDING";
  GLEnum2[GLEnum2["CULL_FACE"] = 2884] = "CULL_FACE";
  GLEnum2[GLEnum2["FRONT"] = 1028] = "FRONT";
  GLEnum2[GLEnum2["BACK"] = 1029] = "BACK";
  GLEnum2[GLEnum2["FRONT_AND_BACK"] = 1032] = "FRONT_AND_BACK";
  GLEnum2[GLEnum2["BLEND"] = 3042] = "BLEND";
  GLEnum2[GLEnum2["DEPTH_TEST"] = 2929] = "DEPTH_TEST";
  GLEnum2[GLEnum2["DITHER"] = 3024] = "DITHER";
  GLEnum2[GLEnum2["POLYGON_OFFSET_FILL"] = 32823] = "POLYGON_OFFSET_FILL";
  GLEnum2[GLEnum2["SAMPLE_ALPHA_TO_COVERAGE"] = 32926] = "SAMPLE_ALPHA_TO_COVERAGE";
  GLEnum2[GLEnum2["SAMPLE_COVERAGE"] = 32928] = "SAMPLE_COVERAGE";
  GLEnum2[GLEnum2["SCISSOR_TEST"] = 3089] = "SCISSOR_TEST";
  GLEnum2[GLEnum2["STENCIL_TEST"] = 2960] = "STENCIL_TEST";
  GLEnum2[GLEnum2["NO_ERROR"] = 0] = "NO_ERROR";
  GLEnum2[GLEnum2["INVALID_ENUM"] = 1280] = "INVALID_ENUM";
  GLEnum2[GLEnum2["INVALID_VALUE"] = 1281] = "INVALID_VALUE";
  GLEnum2[GLEnum2["INVALID_OPERATION"] = 1282] = "INVALID_OPERATION";
  GLEnum2[GLEnum2["OUT_OF_MEMORY"] = 1285] = "OUT_OF_MEMORY";
  GLEnum2[GLEnum2["CONTEXT_LOST_WEBGL"] = 37442] = "CONTEXT_LOST_WEBGL";
  GLEnum2[GLEnum2["CW"] = 2304] = "CW";
  GLEnum2[GLEnum2["CCW"] = 2305] = "CCW";
  GLEnum2[GLEnum2["DONT_CARE"] = 4352] = "DONT_CARE";
  GLEnum2[GLEnum2["FASTEST"] = 4353] = "FASTEST";
  GLEnum2[GLEnum2["NICEST"] = 4354] = "NICEST";
  GLEnum2[GLEnum2["GENERATE_MIPMAP_HINT"] = 33170] = "GENERATE_MIPMAP_HINT";
  GLEnum2[GLEnum2["BYTE"] = 5120] = "BYTE";
  GLEnum2[GLEnum2["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
  GLEnum2[GLEnum2["SHORT"] = 5122] = "SHORT";
  GLEnum2[GLEnum2["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
  GLEnum2[GLEnum2["INT"] = 5124] = "INT";
  GLEnum2[GLEnum2["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
  GLEnum2[GLEnum2["FLOAT"] = 5126] = "FLOAT";
  GLEnum2[GLEnum2["DOUBLE"] = 5130] = "DOUBLE";
  GLEnum2[GLEnum2["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
  GLEnum2[GLEnum2["ALPHA"] = 6406] = "ALPHA";
  GLEnum2[GLEnum2["RGB"] = 6407] = "RGB";
  GLEnum2[GLEnum2["RGBA"] = 6408] = "RGBA";
  GLEnum2[GLEnum2["LUMINANCE"] = 6409] = "LUMINANCE";
  GLEnum2[GLEnum2["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
  GLEnum2[GLEnum2["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
  GLEnum2[GLEnum2["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
  GLEnum2[GLEnum2["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
  GLEnum2[GLEnum2["FRAGMENT_SHADER"] = 35632] = "FRAGMENT_SHADER";
  GLEnum2[GLEnum2["VERTEX_SHADER"] = 35633] = "VERTEX_SHADER";
  GLEnum2[GLEnum2["COMPILE_STATUS"] = 35713] = "COMPILE_STATUS";
  GLEnum2[GLEnum2["DELETE_STATUS"] = 35712] = "DELETE_STATUS";
  GLEnum2[GLEnum2["LINK_STATUS"] = 35714] = "LINK_STATUS";
  GLEnum2[GLEnum2["VALIDATE_STATUS"] = 35715] = "VALIDATE_STATUS";
  GLEnum2[GLEnum2["ATTACHED_SHADERS"] = 35717] = "ATTACHED_SHADERS";
  GLEnum2[GLEnum2["ACTIVE_ATTRIBUTES"] = 35721] = "ACTIVE_ATTRIBUTES";
  GLEnum2[GLEnum2["ACTIVE_UNIFORMS"] = 35718] = "ACTIVE_UNIFORMS";
  GLEnum2[GLEnum2["MAX_VERTEX_ATTRIBS"] = 34921] = "MAX_VERTEX_ATTRIBS";
  GLEnum2[GLEnum2["MAX_VERTEX_UNIFORM_VECTORS"] = 36347] = "MAX_VERTEX_UNIFORM_VECTORS";
  GLEnum2[GLEnum2["MAX_VARYING_VECTORS"] = 36348] = "MAX_VARYING_VECTORS";
  GLEnum2[GLEnum2["MAX_COMBINED_TEXTURE_IMAGE_UNITS"] = 35661] = "MAX_COMBINED_TEXTURE_IMAGE_UNITS";
  GLEnum2[GLEnum2["MAX_VERTEX_TEXTURE_IMAGE_UNITS"] = 35660] = "MAX_VERTEX_TEXTURE_IMAGE_UNITS";
  GLEnum2[GLEnum2["MAX_TEXTURE_IMAGE_UNITS"] = 34930] = "MAX_TEXTURE_IMAGE_UNITS";
  GLEnum2[GLEnum2["MAX_FRAGMENT_UNIFORM_VECTORS"] = 36349] = "MAX_FRAGMENT_UNIFORM_VECTORS";
  GLEnum2[GLEnum2["SHADER_TYPE"] = 35663] = "SHADER_TYPE";
  GLEnum2[GLEnum2["SHADING_LANGUAGE_VERSION"] = 35724] = "SHADING_LANGUAGE_VERSION";
  GLEnum2[GLEnum2["CURRENT_PROGRAM"] = 35725] = "CURRENT_PROGRAM";
  GLEnum2[GLEnum2["NEVER"] = 512] = "NEVER";
  GLEnum2[GLEnum2["LESS"] = 513] = "LESS";
  GLEnum2[GLEnum2["EQUAL"] = 514] = "EQUAL";
  GLEnum2[GLEnum2["LEQUAL"] = 515] = "LEQUAL";
  GLEnum2[GLEnum2["GREATER"] = 516] = "GREATER";
  GLEnum2[GLEnum2["NOTEQUAL"] = 517] = "NOTEQUAL";
  GLEnum2[GLEnum2["GEQUAL"] = 518] = "GEQUAL";
  GLEnum2[GLEnum2["ALWAYS"] = 519] = "ALWAYS";
  GLEnum2[GLEnum2["KEEP"] = 7680] = "KEEP";
  GLEnum2[GLEnum2["REPLACE"] = 7681] = "REPLACE";
  GLEnum2[GLEnum2["INCR"] = 7682] = "INCR";
  GLEnum2[GLEnum2["DECR"] = 7683] = "DECR";
  GLEnum2[GLEnum2["INVERT"] = 5386] = "INVERT";
  GLEnum2[GLEnum2["INCR_WRAP"] = 34055] = "INCR_WRAP";
  GLEnum2[GLEnum2["DECR_WRAP"] = 34056] = "DECR_WRAP";
  GLEnum2[GLEnum2["NEAREST"] = 9728] = "NEAREST";
  GLEnum2[GLEnum2["LINEAR"] = 9729] = "LINEAR";
  GLEnum2[GLEnum2["NEAREST_MIPMAP_NEAREST"] = 9984] = "NEAREST_MIPMAP_NEAREST";
  GLEnum2[GLEnum2["LINEAR_MIPMAP_NEAREST"] = 9985] = "LINEAR_MIPMAP_NEAREST";
  GLEnum2[GLEnum2["NEAREST_MIPMAP_LINEAR"] = 9986] = "NEAREST_MIPMAP_LINEAR";
  GLEnum2[GLEnum2["LINEAR_MIPMAP_LINEAR"] = 9987] = "LINEAR_MIPMAP_LINEAR";
  GLEnum2[GLEnum2["TEXTURE_MAG_FILTER"] = 10240] = "TEXTURE_MAG_FILTER";
  GLEnum2[GLEnum2["TEXTURE_MIN_FILTER"] = 10241] = "TEXTURE_MIN_FILTER";
  GLEnum2[GLEnum2["TEXTURE_WRAP_S"] = 10242] = "TEXTURE_WRAP_S";
  GLEnum2[GLEnum2["TEXTURE_WRAP_T"] = 10243] = "TEXTURE_WRAP_T";
  GLEnum2[GLEnum2["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
  GLEnum2[GLEnum2["TEXTURE"] = 5890] = "TEXTURE";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
  GLEnum2[GLEnum2["TEXTURE_BINDING_CUBE_MAP"] = 34068] = "TEXTURE_BINDING_CUBE_MAP";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
  GLEnum2[GLEnum2["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
  GLEnum2[GLEnum2["MAX_CUBE_MAP_TEXTURE_SIZE"] = 34076] = "MAX_CUBE_MAP_TEXTURE_SIZE";
  GLEnum2[GLEnum2["TEXTURE0"] = 33984] = "TEXTURE0";
  GLEnum2[GLEnum2["ACTIVE_TEXTURE"] = 34016] = "ACTIVE_TEXTURE";
  GLEnum2[GLEnum2["REPEAT"] = 10497] = "REPEAT";
  GLEnum2[GLEnum2["CLAMP_TO_EDGE"] = 33071] = "CLAMP_TO_EDGE";
  GLEnum2[GLEnum2["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
  GLEnum2[GLEnum2["TEXTURE_WIDTH"] = 4096] = "TEXTURE_WIDTH";
  GLEnum2[GLEnum2["TEXTURE_HEIGHT"] = 4097] = "TEXTURE_HEIGHT";
  GLEnum2[GLEnum2["FLOAT_VEC2"] = 35664] = "FLOAT_VEC2";
  GLEnum2[GLEnum2["FLOAT_VEC3"] = 35665] = "FLOAT_VEC3";
  GLEnum2[GLEnum2["FLOAT_VEC4"] = 35666] = "FLOAT_VEC4";
  GLEnum2[GLEnum2["INT_VEC2"] = 35667] = "INT_VEC2";
  GLEnum2[GLEnum2["INT_VEC3"] = 35668] = "INT_VEC3";
  GLEnum2[GLEnum2["INT_VEC4"] = 35669] = "INT_VEC4";
  GLEnum2[GLEnum2["BOOL"] = 35670] = "BOOL";
  GLEnum2[GLEnum2["BOOL_VEC2"] = 35671] = "BOOL_VEC2";
  GLEnum2[GLEnum2["BOOL_VEC3"] = 35672] = "BOOL_VEC3";
  GLEnum2[GLEnum2["BOOL_VEC4"] = 35673] = "BOOL_VEC4";
  GLEnum2[GLEnum2["FLOAT_MAT2"] = 35674] = "FLOAT_MAT2";
  GLEnum2[GLEnum2["FLOAT_MAT3"] = 35675] = "FLOAT_MAT3";
  GLEnum2[GLEnum2["FLOAT_MAT4"] = 35676] = "FLOAT_MAT4";
  GLEnum2[GLEnum2["SAMPLER_2D"] = 35678] = "SAMPLER_2D";
  GLEnum2[GLEnum2["SAMPLER_CUBE"] = 35680] = "SAMPLER_CUBE";
  GLEnum2[GLEnum2["LOW_FLOAT"] = 36336] = "LOW_FLOAT";
  GLEnum2[GLEnum2["MEDIUM_FLOAT"] = 36337] = "MEDIUM_FLOAT";
  GLEnum2[GLEnum2["HIGH_FLOAT"] = 36338] = "HIGH_FLOAT";
  GLEnum2[GLEnum2["LOW_INT"] = 36339] = "LOW_INT";
  GLEnum2[GLEnum2["MEDIUM_INT"] = 36340] = "MEDIUM_INT";
  GLEnum2[GLEnum2["HIGH_INT"] = 36341] = "HIGH_INT";
  GLEnum2[GLEnum2["FRAMEBUFFER"] = 36160] = "FRAMEBUFFER";
  GLEnum2[GLEnum2["RENDERBUFFER"] = 36161] = "RENDERBUFFER";
  GLEnum2[GLEnum2["RGBA4"] = 32854] = "RGBA4";
  GLEnum2[GLEnum2["RGB5_A1"] = 32855] = "RGB5_A1";
  GLEnum2[GLEnum2["RGB565"] = 36194] = "RGB565";
  GLEnum2[GLEnum2["DEPTH_COMPONENT16"] = 33189] = "DEPTH_COMPONENT16";
  GLEnum2[GLEnum2["STENCIL_INDEX"] = 6401] = "STENCIL_INDEX";
  GLEnum2[GLEnum2["STENCIL_INDEX8"] = 36168] = "STENCIL_INDEX8";
  GLEnum2[GLEnum2["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
  GLEnum2[GLEnum2["RENDERBUFFER_WIDTH"] = 36162] = "RENDERBUFFER_WIDTH";
  GLEnum2[GLEnum2["RENDERBUFFER_HEIGHT"] = 36163] = "RENDERBUFFER_HEIGHT";
  GLEnum2[GLEnum2["RENDERBUFFER_INTERNAL_FORMAT"] = 36164] = "RENDERBUFFER_INTERNAL_FORMAT";
  GLEnum2[GLEnum2["RENDERBUFFER_RED_SIZE"] = 36176] = "RENDERBUFFER_RED_SIZE";
  GLEnum2[GLEnum2["RENDERBUFFER_GREEN_SIZE"] = 36177] = "RENDERBUFFER_GREEN_SIZE";
  GLEnum2[GLEnum2["RENDERBUFFER_BLUE_SIZE"] = 36178] = "RENDERBUFFER_BLUE_SIZE";
  GLEnum2[GLEnum2["RENDERBUFFER_ALPHA_SIZE"] = 36179] = "RENDERBUFFER_ALPHA_SIZE";
  GLEnum2[GLEnum2["RENDERBUFFER_DEPTH_SIZE"] = 36180] = "RENDERBUFFER_DEPTH_SIZE";
  GLEnum2[GLEnum2["RENDERBUFFER_STENCIL_SIZE"] = 36181] = "RENDERBUFFER_STENCIL_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE"] = 36048] = "FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_OBJECT_NAME"] = 36049] = "FRAMEBUFFER_ATTACHMENT_OBJECT_NAME";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL"] = 36050] = "FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE"] = 36051] = "FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT0"] = 36064] = "COLOR_ATTACHMENT0";
  GLEnum2[GLEnum2["DEPTH_ATTACHMENT"] = 36096] = "DEPTH_ATTACHMENT";
  GLEnum2[GLEnum2["STENCIL_ATTACHMENT"] = 36128] = "STENCIL_ATTACHMENT";
  GLEnum2[GLEnum2["DEPTH_STENCIL_ATTACHMENT"] = 33306] = "DEPTH_STENCIL_ATTACHMENT";
  GLEnum2[GLEnum2["NONE"] = 0] = "NONE";
  GLEnum2[GLEnum2["FRAMEBUFFER_COMPLETE"] = 36053] = "FRAMEBUFFER_COMPLETE";
  GLEnum2[GLEnum2["FRAMEBUFFER_INCOMPLETE_ATTACHMENT"] = 36054] = "FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
  GLEnum2[GLEnum2["FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT"] = 36055] = "FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
  GLEnum2[GLEnum2["FRAMEBUFFER_INCOMPLETE_DIMENSIONS"] = 36057] = "FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
  GLEnum2[GLEnum2["FRAMEBUFFER_UNSUPPORTED"] = 36061] = "FRAMEBUFFER_UNSUPPORTED";
  GLEnum2[GLEnum2["FRAMEBUFFER_BINDING"] = 36006] = "FRAMEBUFFER_BINDING";
  GLEnum2[GLEnum2["RENDERBUFFER_BINDING"] = 36007] = "RENDERBUFFER_BINDING";
  GLEnum2[GLEnum2["READ_FRAMEBUFFER"] = 36008] = "READ_FRAMEBUFFER";
  GLEnum2[GLEnum2["DRAW_FRAMEBUFFER"] = 36009] = "DRAW_FRAMEBUFFER";
  GLEnum2[GLEnum2["MAX_RENDERBUFFER_SIZE"] = 34024] = "MAX_RENDERBUFFER_SIZE";
  GLEnum2[GLEnum2["INVALID_FRAMEBUFFER_OPERATION"] = 1286] = "INVALID_FRAMEBUFFER_OPERATION";
  GLEnum2[GLEnum2["UNPACK_FLIP_Y_WEBGL"] = 37440] = "UNPACK_FLIP_Y_WEBGL";
  GLEnum2[GLEnum2["UNPACK_PREMULTIPLY_ALPHA_WEBGL"] = 37441] = "UNPACK_PREMULTIPLY_ALPHA_WEBGL";
  GLEnum2[GLEnum2["UNPACK_COLORSPACE_CONVERSION_WEBGL"] = 37443] = "UNPACK_COLORSPACE_CONVERSION_WEBGL";
  GLEnum2[GLEnum2["READ_BUFFER"] = 3074] = "READ_BUFFER";
  GLEnum2[GLEnum2["UNPACK_ROW_LENGTH"] = 3314] = "UNPACK_ROW_LENGTH";
  GLEnum2[GLEnum2["UNPACK_SKIP_ROWS"] = 3315] = "UNPACK_SKIP_ROWS";
  GLEnum2[GLEnum2["UNPACK_SKIP_PIXELS"] = 3316] = "UNPACK_SKIP_PIXELS";
  GLEnum2[GLEnum2["PACK_ROW_LENGTH"] = 3330] = "PACK_ROW_LENGTH";
  GLEnum2[GLEnum2["PACK_SKIP_ROWS"] = 3331] = "PACK_SKIP_ROWS";
  GLEnum2[GLEnum2["PACK_SKIP_PIXELS"] = 3332] = "PACK_SKIP_PIXELS";
  GLEnum2[GLEnum2["TEXTURE_BINDING_3D"] = 32874] = "TEXTURE_BINDING_3D";
  GLEnum2[GLEnum2["UNPACK_SKIP_IMAGES"] = 32877] = "UNPACK_SKIP_IMAGES";
  GLEnum2[GLEnum2["UNPACK_IMAGE_HEIGHT"] = 32878] = "UNPACK_IMAGE_HEIGHT";
  GLEnum2[GLEnum2["MAX_3D_TEXTURE_SIZE"] = 32883] = "MAX_3D_TEXTURE_SIZE";
  GLEnum2[GLEnum2["MAX_ELEMENTS_VERTICES"] = 33e3] = "MAX_ELEMENTS_VERTICES";
  GLEnum2[GLEnum2["MAX_ELEMENTS_INDICES"] = 33001] = "MAX_ELEMENTS_INDICES";
  GLEnum2[GLEnum2["MAX_TEXTURE_LOD_BIAS"] = 34045] = "MAX_TEXTURE_LOD_BIAS";
  GLEnum2[GLEnum2["MAX_FRAGMENT_UNIFORM_COMPONENTS"] = 35657] = "MAX_FRAGMENT_UNIFORM_COMPONENTS";
  GLEnum2[GLEnum2["MAX_VERTEX_UNIFORM_COMPONENTS"] = 35658] = "MAX_VERTEX_UNIFORM_COMPONENTS";
  GLEnum2[GLEnum2["MAX_ARRAY_TEXTURE_LAYERS"] = 35071] = "MAX_ARRAY_TEXTURE_LAYERS";
  GLEnum2[GLEnum2["MIN_PROGRAM_TEXEL_OFFSET"] = 35076] = "MIN_PROGRAM_TEXEL_OFFSET";
  GLEnum2[GLEnum2["MAX_PROGRAM_TEXEL_OFFSET"] = 35077] = "MAX_PROGRAM_TEXEL_OFFSET";
  GLEnum2[GLEnum2["MAX_VARYING_COMPONENTS"] = 35659] = "MAX_VARYING_COMPONENTS";
  GLEnum2[GLEnum2["FRAGMENT_SHADER_DERIVATIVE_HINT"] = 35723] = "FRAGMENT_SHADER_DERIVATIVE_HINT";
  GLEnum2[GLEnum2["RASTERIZER_DISCARD"] = 35977] = "RASTERIZER_DISCARD";
  GLEnum2[GLEnum2["VERTEX_ARRAY_BINDING"] = 34229] = "VERTEX_ARRAY_BINDING";
  GLEnum2[GLEnum2["MAX_VERTEX_OUTPUT_COMPONENTS"] = 37154] = "MAX_VERTEX_OUTPUT_COMPONENTS";
  GLEnum2[GLEnum2["MAX_FRAGMENT_INPUT_COMPONENTS"] = 37157] = "MAX_FRAGMENT_INPUT_COMPONENTS";
  GLEnum2[GLEnum2["MAX_SERVER_WAIT_TIMEOUT"] = 37137] = "MAX_SERVER_WAIT_TIMEOUT";
  GLEnum2[GLEnum2["MAX_ELEMENT_INDEX"] = 36203] = "MAX_ELEMENT_INDEX";
  GLEnum2[GLEnum2["RED"] = 6403] = "RED";
  GLEnum2[GLEnum2["RGB8"] = 32849] = "RGB8";
  GLEnum2[GLEnum2["RGBA8"] = 32856] = "RGBA8";
  GLEnum2[GLEnum2["RGB10_A2"] = 32857] = "RGB10_A2";
  GLEnum2[GLEnum2["TEXTURE_3D"] = 32879] = "TEXTURE_3D";
  GLEnum2[GLEnum2["TEXTURE_WRAP_R"] = 32882] = "TEXTURE_WRAP_R";
  GLEnum2[GLEnum2["TEXTURE_MIN_LOD"] = 33082] = "TEXTURE_MIN_LOD";
  GLEnum2[GLEnum2["TEXTURE_MAX_LOD"] = 33083] = "TEXTURE_MAX_LOD";
  GLEnum2[GLEnum2["TEXTURE_BASE_LEVEL"] = 33084] = "TEXTURE_BASE_LEVEL";
  GLEnum2[GLEnum2["TEXTURE_MAX_LEVEL"] = 33085] = "TEXTURE_MAX_LEVEL";
  GLEnum2[GLEnum2["TEXTURE_COMPARE_MODE"] = 34892] = "TEXTURE_COMPARE_MODE";
  GLEnum2[GLEnum2["TEXTURE_COMPARE_FUNC"] = 34893] = "TEXTURE_COMPARE_FUNC";
  GLEnum2[GLEnum2["SRGB"] = 35904] = "SRGB";
  GLEnum2[GLEnum2["SRGB8"] = 35905] = "SRGB8";
  GLEnum2[GLEnum2["SRGB8_ALPHA8"] = 35907] = "SRGB8_ALPHA8";
  GLEnum2[GLEnum2["COMPARE_REF_TO_TEXTURE"] = 34894] = "COMPARE_REF_TO_TEXTURE";
  GLEnum2[GLEnum2["RGBA32F"] = 34836] = "RGBA32F";
  GLEnum2[GLEnum2["RGB32F"] = 34837] = "RGB32F";
  GLEnum2[GLEnum2["RGBA16F"] = 34842] = "RGBA16F";
  GLEnum2[GLEnum2["RGB16F"] = 34843] = "RGB16F";
  GLEnum2[GLEnum2["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
  GLEnum2[GLEnum2["TEXTURE_BINDING_2D_ARRAY"] = 35869] = "TEXTURE_BINDING_2D_ARRAY";
  GLEnum2[GLEnum2["R11F_G11F_B10F"] = 35898] = "R11F_G11F_B10F";
  GLEnum2[GLEnum2["RGB9_E5"] = 35901] = "RGB9_E5";
  GLEnum2[GLEnum2["RGBA32UI"] = 36208] = "RGBA32UI";
  GLEnum2[GLEnum2["RGB32UI"] = 36209] = "RGB32UI";
  GLEnum2[GLEnum2["RGBA16UI"] = 36214] = "RGBA16UI";
  GLEnum2[GLEnum2["RGB16UI"] = 36215] = "RGB16UI";
  GLEnum2[GLEnum2["RGBA8UI"] = 36220] = "RGBA8UI";
  GLEnum2[GLEnum2["RGB8UI"] = 36221] = "RGB8UI";
  GLEnum2[GLEnum2["RGBA32I"] = 36226] = "RGBA32I";
  GLEnum2[GLEnum2["RGB32I"] = 36227] = "RGB32I";
  GLEnum2[GLEnum2["RGBA16I"] = 36232] = "RGBA16I";
  GLEnum2[GLEnum2["RGB16I"] = 36233] = "RGB16I";
  GLEnum2[GLEnum2["RGBA8I"] = 36238] = "RGBA8I";
  GLEnum2[GLEnum2["RGB8I"] = 36239] = "RGB8I";
  GLEnum2[GLEnum2["RED_INTEGER"] = 36244] = "RED_INTEGER";
  GLEnum2[GLEnum2["RGB_INTEGER"] = 36248] = "RGB_INTEGER";
  GLEnum2[GLEnum2["RGBA_INTEGER"] = 36249] = "RGBA_INTEGER";
  GLEnum2[GLEnum2["R8"] = 33321] = "R8";
  GLEnum2[GLEnum2["RG8"] = 33323] = "RG8";
  GLEnum2[GLEnum2["R16F"] = 33325] = "R16F";
  GLEnum2[GLEnum2["R32F"] = 33326] = "R32F";
  GLEnum2[GLEnum2["RG16F"] = 33327] = "RG16F";
  GLEnum2[GLEnum2["RG32F"] = 33328] = "RG32F";
  GLEnum2[GLEnum2["R8I"] = 33329] = "R8I";
  GLEnum2[GLEnum2["R8UI"] = 33330] = "R8UI";
  GLEnum2[GLEnum2["R16I"] = 33331] = "R16I";
  GLEnum2[GLEnum2["R16UI"] = 33332] = "R16UI";
  GLEnum2[GLEnum2["R32I"] = 33333] = "R32I";
  GLEnum2[GLEnum2["R32UI"] = 33334] = "R32UI";
  GLEnum2[GLEnum2["RG8I"] = 33335] = "RG8I";
  GLEnum2[GLEnum2["RG8UI"] = 33336] = "RG8UI";
  GLEnum2[GLEnum2["RG16I"] = 33337] = "RG16I";
  GLEnum2[GLEnum2["RG16UI"] = 33338] = "RG16UI";
  GLEnum2[GLEnum2["RG32I"] = 33339] = "RG32I";
  GLEnum2[GLEnum2["RG32UI"] = 33340] = "RG32UI";
  GLEnum2[GLEnum2["R8_SNORM"] = 36756] = "R8_SNORM";
  GLEnum2[GLEnum2["RG8_SNORM"] = 36757] = "RG8_SNORM";
  GLEnum2[GLEnum2["RGB8_SNORM"] = 36758] = "RGB8_SNORM";
  GLEnum2[GLEnum2["RGBA8_SNORM"] = 36759] = "RGBA8_SNORM";
  GLEnum2[GLEnum2["RGB10_A2UI"] = 36975] = "RGB10_A2UI";
  GLEnum2[GLEnum2["TEXTURE_IMMUTABLE_FORMAT"] = 37167] = "TEXTURE_IMMUTABLE_FORMAT";
  GLEnum2[GLEnum2["TEXTURE_IMMUTABLE_LEVELS"] = 33503] = "TEXTURE_IMMUTABLE_LEVELS";
  GLEnum2[GLEnum2["UNSIGNED_INT_2_10_10_10_REV"] = 33640] = "UNSIGNED_INT_2_10_10_10_REV";
  GLEnum2[GLEnum2["UNSIGNED_INT_10F_11F_11F_REV"] = 35899] = "UNSIGNED_INT_10F_11F_11F_REV";
  GLEnum2[GLEnum2["UNSIGNED_INT_5_9_9_9_REV"] = 35902] = "UNSIGNED_INT_5_9_9_9_REV";
  GLEnum2[GLEnum2["FLOAT_32_UNSIGNED_INT_24_8_REV"] = 36269] = "FLOAT_32_UNSIGNED_INT_24_8_REV";
  GLEnum2[GLEnum2["UNSIGNED_INT_24_8"] = 34042] = "UNSIGNED_INT_24_8";
  GLEnum2[GLEnum2["HALF_FLOAT"] = 5131] = "HALF_FLOAT";
  GLEnum2[GLEnum2["RG"] = 33319] = "RG";
  GLEnum2[GLEnum2["RG_INTEGER"] = 33320] = "RG_INTEGER";
  GLEnum2[GLEnum2["INT_2_10_10_10_REV"] = 36255] = "INT_2_10_10_10_REV";
  GLEnum2[GLEnum2["CURRENT_QUERY"] = 34917] = "CURRENT_QUERY";
  GLEnum2[GLEnum2["QUERY_RESULT"] = 34918] = "QUERY_RESULT";
  GLEnum2[GLEnum2["QUERY_RESULT_AVAILABLE"] = 34919] = "QUERY_RESULT_AVAILABLE";
  GLEnum2[GLEnum2["ANY_SAMPLES_PASSED"] = 35887] = "ANY_SAMPLES_PASSED";
  GLEnum2[GLEnum2["ANY_SAMPLES_PASSED_CONSERVATIVE"] = 36202] = "ANY_SAMPLES_PASSED_CONSERVATIVE";
  GLEnum2[GLEnum2["MAX_DRAW_BUFFERS"] = 34852] = "MAX_DRAW_BUFFERS";
  GLEnum2[GLEnum2["DRAW_BUFFER0"] = 34853] = "DRAW_BUFFER0";
  GLEnum2[GLEnum2["DRAW_BUFFER1"] = 34854] = "DRAW_BUFFER1";
  GLEnum2[GLEnum2["DRAW_BUFFER2"] = 34855] = "DRAW_BUFFER2";
  GLEnum2[GLEnum2["DRAW_BUFFER3"] = 34856] = "DRAW_BUFFER3";
  GLEnum2[GLEnum2["DRAW_BUFFER4"] = 34857] = "DRAW_BUFFER4";
  GLEnum2[GLEnum2["DRAW_BUFFER5"] = 34858] = "DRAW_BUFFER5";
  GLEnum2[GLEnum2["DRAW_BUFFER6"] = 34859] = "DRAW_BUFFER6";
  GLEnum2[GLEnum2["DRAW_BUFFER7"] = 34860] = "DRAW_BUFFER7";
  GLEnum2[GLEnum2["DRAW_BUFFER8"] = 34861] = "DRAW_BUFFER8";
  GLEnum2[GLEnum2["DRAW_BUFFER9"] = 34862] = "DRAW_BUFFER9";
  GLEnum2[GLEnum2["DRAW_BUFFER10"] = 34863] = "DRAW_BUFFER10";
  GLEnum2[GLEnum2["DRAW_BUFFER11"] = 34864] = "DRAW_BUFFER11";
  GLEnum2[GLEnum2["DRAW_BUFFER12"] = 34865] = "DRAW_BUFFER12";
  GLEnum2[GLEnum2["DRAW_BUFFER13"] = 34866] = "DRAW_BUFFER13";
  GLEnum2[GLEnum2["DRAW_BUFFER14"] = 34867] = "DRAW_BUFFER14";
  GLEnum2[GLEnum2["DRAW_BUFFER15"] = 34868] = "DRAW_BUFFER15";
  GLEnum2[GLEnum2["MAX_COLOR_ATTACHMENTS"] = 36063] = "MAX_COLOR_ATTACHMENTS";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT1"] = 36065] = "COLOR_ATTACHMENT1";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT2"] = 36066] = "COLOR_ATTACHMENT2";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT3"] = 36067] = "COLOR_ATTACHMENT3";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT4"] = 36068] = "COLOR_ATTACHMENT4";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT5"] = 36069] = "COLOR_ATTACHMENT5";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT6"] = 36070] = "COLOR_ATTACHMENT6";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT7"] = 36071] = "COLOR_ATTACHMENT7";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT8"] = 36072] = "COLOR_ATTACHMENT8";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT9"] = 36073] = "COLOR_ATTACHMENT9";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT10"] = 36074] = "COLOR_ATTACHMENT10";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT11"] = 36075] = "COLOR_ATTACHMENT11";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT12"] = 36076] = "COLOR_ATTACHMENT12";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT13"] = 36077] = "COLOR_ATTACHMENT13";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT14"] = 36078] = "COLOR_ATTACHMENT14";
  GLEnum2[GLEnum2["COLOR_ATTACHMENT15"] = 36079] = "COLOR_ATTACHMENT15";
  GLEnum2[GLEnum2["SAMPLER_3D"] = 35679] = "SAMPLER_3D";
  GLEnum2[GLEnum2["SAMPLER_2D_SHADOW"] = 35682] = "SAMPLER_2D_SHADOW";
  GLEnum2[GLEnum2["SAMPLER_2D_ARRAY"] = 36289] = "SAMPLER_2D_ARRAY";
  GLEnum2[GLEnum2["SAMPLER_2D_ARRAY_SHADOW"] = 36292] = "SAMPLER_2D_ARRAY_SHADOW";
  GLEnum2[GLEnum2["SAMPLER_CUBE_SHADOW"] = 36293] = "SAMPLER_CUBE_SHADOW";
  GLEnum2[GLEnum2["INT_SAMPLER_2D"] = 36298] = "INT_SAMPLER_2D";
  GLEnum2[GLEnum2["INT_SAMPLER_3D"] = 36299] = "INT_SAMPLER_3D";
  GLEnum2[GLEnum2["INT_SAMPLER_CUBE"] = 36300] = "INT_SAMPLER_CUBE";
  GLEnum2[GLEnum2["INT_SAMPLER_2D_ARRAY"] = 36303] = "INT_SAMPLER_2D_ARRAY";
  GLEnum2[GLEnum2["UNSIGNED_INT_SAMPLER_2D"] = 36306] = "UNSIGNED_INT_SAMPLER_2D";
  GLEnum2[GLEnum2["UNSIGNED_INT_SAMPLER_3D"] = 36307] = "UNSIGNED_INT_SAMPLER_3D";
  GLEnum2[GLEnum2["UNSIGNED_INT_SAMPLER_CUBE"] = 36308] = "UNSIGNED_INT_SAMPLER_CUBE";
  GLEnum2[GLEnum2["UNSIGNED_INT_SAMPLER_2D_ARRAY"] = 36311] = "UNSIGNED_INT_SAMPLER_2D_ARRAY";
  GLEnum2[GLEnum2["MAX_SAMPLES"] = 36183] = "MAX_SAMPLES";
  GLEnum2[GLEnum2["SAMPLER_BINDING"] = 35097] = "SAMPLER_BINDING";
  GLEnum2[GLEnum2["PIXEL_PACK_BUFFER"] = 35051] = "PIXEL_PACK_BUFFER";
  GLEnum2[GLEnum2["PIXEL_UNPACK_BUFFER"] = 35052] = "PIXEL_UNPACK_BUFFER";
  GLEnum2[GLEnum2["PIXEL_PACK_BUFFER_BINDING"] = 35053] = "PIXEL_PACK_BUFFER_BINDING";
  GLEnum2[GLEnum2["PIXEL_UNPACK_BUFFER_BINDING"] = 35055] = "PIXEL_UNPACK_BUFFER_BINDING";
  GLEnum2[GLEnum2["COPY_READ_BUFFER"] = 36662] = "COPY_READ_BUFFER";
  GLEnum2[GLEnum2["COPY_WRITE_BUFFER"] = 36663] = "COPY_WRITE_BUFFER";
  GLEnum2[GLEnum2["COPY_READ_BUFFER_BINDING"] = 36662] = "COPY_READ_BUFFER_BINDING";
  GLEnum2[GLEnum2["COPY_WRITE_BUFFER_BINDING"] = 36663] = "COPY_WRITE_BUFFER_BINDING";
  GLEnum2[GLEnum2["FLOAT_MAT2x3"] = 35685] = "FLOAT_MAT2x3";
  GLEnum2[GLEnum2["FLOAT_MAT2x4"] = 35686] = "FLOAT_MAT2x4";
  GLEnum2[GLEnum2["FLOAT_MAT3x2"] = 35687] = "FLOAT_MAT3x2";
  GLEnum2[GLEnum2["FLOAT_MAT3x4"] = 35688] = "FLOAT_MAT3x4";
  GLEnum2[GLEnum2["FLOAT_MAT4x2"] = 35689] = "FLOAT_MAT4x2";
  GLEnum2[GLEnum2["FLOAT_MAT4x3"] = 35690] = "FLOAT_MAT4x3";
  GLEnum2[GLEnum2["UNSIGNED_INT_VEC2"] = 36294] = "UNSIGNED_INT_VEC2";
  GLEnum2[GLEnum2["UNSIGNED_INT_VEC3"] = 36295] = "UNSIGNED_INT_VEC3";
  GLEnum2[GLEnum2["UNSIGNED_INT_VEC4"] = 36296] = "UNSIGNED_INT_VEC4";
  GLEnum2[GLEnum2["UNSIGNED_NORMALIZED"] = 35863] = "UNSIGNED_NORMALIZED";
  GLEnum2[GLEnum2["SIGNED_NORMALIZED"] = 36764] = "SIGNED_NORMALIZED";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_INTEGER"] = 35069] = "VERTEX_ATTRIB_ARRAY_INTEGER";
  GLEnum2[GLEnum2["VERTEX_ATTRIB_ARRAY_DIVISOR"] = 35070] = "VERTEX_ATTRIB_ARRAY_DIVISOR";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_BUFFER_MODE"] = 35967] = "TRANSFORM_FEEDBACK_BUFFER_MODE";
  GLEnum2[GLEnum2["MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS"] = 35968] = "MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_VARYINGS"] = 35971] = "TRANSFORM_FEEDBACK_VARYINGS";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_BUFFER_START"] = 35972] = "TRANSFORM_FEEDBACK_BUFFER_START";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_BUFFER_SIZE"] = 35973] = "TRANSFORM_FEEDBACK_BUFFER_SIZE";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN"] = 35976] = "TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN";
  GLEnum2[GLEnum2["MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS"] = 35978] = "MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS";
  GLEnum2[GLEnum2["MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS"] = 35979] = "MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS";
  GLEnum2[GLEnum2["INTERLEAVED_ATTRIBS"] = 35980] = "INTERLEAVED_ATTRIBS";
  GLEnum2[GLEnum2["SEPARATE_ATTRIBS"] = 35981] = "SEPARATE_ATTRIBS";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_BUFFER"] = 35982] = "TRANSFORM_FEEDBACK_BUFFER";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_BUFFER_BINDING"] = 35983] = "TRANSFORM_FEEDBACK_BUFFER_BINDING";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK"] = 36386] = "TRANSFORM_FEEDBACK";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_PAUSED"] = 36387] = "TRANSFORM_FEEDBACK_PAUSED";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_ACTIVE"] = 36388] = "TRANSFORM_FEEDBACK_ACTIVE";
  GLEnum2[GLEnum2["TRANSFORM_FEEDBACK_BINDING"] = 36389] = "TRANSFORM_FEEDBACK_BINDING";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING"] = 33296] = "FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE"] = 33297] = "FRAMEBUFFER_ATTACHMENT_COMPONENT_TYPE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_RED_SIZE"] = 33298] = "FRAMEBUFFER_ATTACHMENT_RED_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_GREEN_SIZE"] = 33299] = "FRAMEBUFFER_ATTACHMENT_GREEN_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_BLUE_SIZE"] = 33300] = "FRAMEBUFFER_ATTACHMENT_BLUE_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE"] = 33301] = "FRAMEBUFFER_ATTACHMENT_ALPHA_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE"] = 33302] = "FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE"] = 33303] = "FRAMEBUFFER_ATTACHMENT_STENCIL_SIZE";
  GLEnum2[GLEnum2["FRAMEBUFFER_DEFAULT"] = 33304] = "FRAMEBUFFER_DEFAULT";
  GLEnum2[GLEnum2["DEPTH24_STENCIL8"] = 35056] = "DEPTH24_STENCIL8";
  GLEnum2[GLEnum2["DRAW_FRAMEBUFFER_BINDING"] = 36006] = "DRAW_FRAMEBUFFER_BINDING";
  GLEnum2[GLEnum2["READ_FRAMEBUFFER_BINDING"] = 36010] = "READ_FRAMEBUFFER_BINDING";
  GLEnum2[GLEnum2["RENDERBUFFER_SAMPLES"] = 36011] = "RENDERBUFFER_SAMPLES";
  GLEnum2[GLEnum2["FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER"] = 36052] = "FRAMEBUFFER_ATTACHMENT_TEXTURE_LAYER";
  GLEnum2[GLEnum2["FRAMEBUFFER_INCOMPLETE_MULTISAMPLE"] = 36182] = "FRAMEBUFFER_INCOMPLETE_MULTISAMPLE";
  GLEnum2[GLEnum2["UNIFORM_BUFFER"] = 35345] = "UNIFORM_BUFFER";
  GLEnum2[GLEnum2["UNIFORM_BUFFER_BINDING"] = 35368] = "UNIFORM_BUFFER_BINDING";
  GLEnum2[GLEnum2["UNIFORM_BUFFER_START"] = 35369] = "UNIFORM_BUFFER_START";
  GLEnum2[GLEnum2["UNIFORM_BUFFER_SIZE"] = 35370] = "UNIFORM_BUFFER_SIZE";
  GLEnum2[GLEnum2["MAX_VERTEX_UNIFORM_BLOCKS"] = 35371] = "MAX_VERTEX_UNIFORM_BLOCKS";
  GLEnum2[GLEnum2["MAX_FRAGMENT_UNIFORM_BLOCKS"] = 35373] = "MAX_FRAGMENT_UNIFORM_BLOCKS";
  GLEnum2[GLEnum2["MAX_COMBINED_UNIFORM_BLOCKS"] = 35374] = "MAX_COMBINED_UNIFORM_BLOCKS";
  GLEnum2[GLEnum2["MAX_UNIFORM_BUFFER_BINDINGS"] = 35375] = "MAX_UNIFORM_BUFFER_BINDINGS";
  GLEnum2[GLEnum2["MAX_UNIFORM_BLOCK_SIZE"] = 35376] = "MAX_UNIFORM_BLOCK_SIZE";
  GLEnum2[GLEnum2["MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS"] = 35377] = "MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS";
  GLEnum2[GLEnum2["MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS"] = 35379] = "MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS";
  GLEnum2[GLEnum2["UNIFORM_BUFFER_OFFSET_ALIGNMENT"] = 35380] = "UNIFORM_BUFFER_OFFSET_ALIGNMENT";
  GLEnum2[GLEnum2["ACTIVE_UNIFORM_BLOCKS"] = 35382] = "ACTIVE_UNIFORM_BLOCKS";
  GLEnum2[GLEnum2["UNIFORM_TYPE"] = 35383] = "UNIFORM_TYPE";
  GLEnum2[GLEnum2["UNIFORM_SIZE"] = 35384] = "UNIFORM_SIZE";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_INDEX"] = 35386] = "UNIFORM_BLOCK_INDEX";
  GLEnum2[GLEnum2["UNIFORM_OFFSET"] = 35387] = "UNIFORM_OFFSET";
  GLEnum2[GLEnum2["UNIFORM_ARRAY_STRIDE"] = 35388] = "UNIFORM_ARRAY_STRIDE";
  GLEnum2[GLEnum2["UNIFORM_MATRIX_STRIDE"] = 35389] = "UNIFORM_MATRIX_STRIDE";
  GLEnum2[GLEnum2["UNIFORM_IS_ROW_MAJOR"] = 35390] = "UNIFORM_IS_ROW_MAJOR";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_BINDING"] = 35391] = "UNIFORM_BLOCK_BINDING";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_DATA_SIZE"] = 35392] = "UNIFORM_BLOCK_DATA_SIZE";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_ACTIVE_UNIFORMS"] = 35394] = "UNIFORM_BLOCK_ACTIVE_UNIFORMS";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES"] = 35395] = "UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER"] = 35396] = "UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER";
  GLEnum2[GLEnum2["UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER"] = 35398] = "UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER";
  GLEnum2[GLEnum2["OBJECT_TYPE"] = 37138] = "OBJECT_TYPE";
  GLEnum2[GLEnum2["SYNC_CONDITION"] = 37139] = "SYNC_CONDITION";
  GLEnum2[GLEnum2["SYNC_STATUS"] = 37140] = "SYNC_STATUS";
  GLEnum2[GLEnum2["SYNC_FLAGS"] = 37141] = "SYNC_FLAGS";
  GLEnum2[GLEnum2["SYNC_FENCE"] = 37142] = "SYNC_FENCE";
  GLEnum2[GLEnum2["SYNC_GPU_COMMANDS_COMPLETE"] = 37143] = "SYNC_GPU_COMMANDS_COMPLETE";
  GLEnum2[GLEnum2["UNSIGNALED"] = 37144] = "UNSIGNALED";
  GLEnum2[GLEnum2["SIGNALED"] = 37145] = "SIGNALED";
  GLEnum2[GLEnum2["ALREADY_SIGNALED"] = 37146] = "ALREADY_SIGNALED";
  GLEnum2[GLEnum2["TIMEOUT_EXPIRED"] = 37147] = "TIMEOUT_EXPIRED";
  GLEnum2[GLEnum2["CONDITION_SATISFIED"] = 37148] = "CONDITION_SATISFIED";
  GLEnum2[GLEnum2["WAIT_FAILED"] = 37149] = "WAIT_FAILED";
  GLEnum2[GLEnum2["SYNC_FLUSH_COMMANDS_BIT"] = 1] = "SYNC_FLUSH_COMMANDS_BIT";
  GLEnum2[GLEnum2["COLOR"] = 6144] = "COLOR";
  GLEnum2[GLEnum2["DEPTH"] = 6145] = "DEPTH";
  GLEnum2[GLEnum2["STENCIL"] = 6146] = "STENCIL";
  GLEnum2[GLEnum2["MIN"] = 32775] = "MIN";
  GLEnum2[GLEnum2["MAX"] = 32776] = "MAX";
  GLEnum2[GLEnum2["DEPTH_COMPONENT24"] = 33190] = "DEPTH_COMPONENT24";
  GLEnum2[GLEnum2["STREAM_READ"] = 35041] = "STREAM_READ";
  GLEnum2[GLEnum2["STREAM_COPY"] = 35042] = "STREAM_COPY";
  GLEnum2[GLEnum2["STATIC_READ"] = 35045] = "STATIC_READ";
  GLEnum2[GLEnum2["STATIC_COPY"] = 35046] = "STATIC_COPY";
  GLEnum2[GLEnum2["DYNAMIC_READ"] = 35049] = "DYNAMIC_READ";
  GLEnum2[GLEnum2["DYNAMIC_COPY"] = 35050] = "DYNAMIC_COPY";
  GLEnum2[GLEnum2["DEPTH_COMPONENT32F"] = 36012] = "DEPTH_COMPONENT32F";
  GLEnum2[GLEnum2["DEPTH32F_STENCIL8"] = 36013] = "DEPTH32F_STENCIL8";
  GLEnum2[GLEnum2["INVALID_INDEX"] = 4294967295] = "INVALID_INDEX";
  GLEnum2[GLEnum2["TIMEOUT_IGNORED"] = -1] = "TIMEOUT_IGNORED";
  GLEnum2[GLEnum2["MAX_CLIENT_WAIT_TIMEOUT_WEBGL"] = 37447] = "MAX_CLIENT_WAIT_TIMEOUT_WEBGL";
  GLEnum2[GLEnum2["UNMASKED_VENDOR_WEBGL"] = 37445] = "UNMASKED_VENDOR_WEBGL";
  GLEnum2[GLEnum2["UNMASKED_RENDERER_WEBGL"] = 37446] = "UNMASKED_RENDERER_WEBGL";
  GLEnum2[GLEnum2["MAX_TEXTURE_MAX_ANISOTROPY_EXT"] = 34047] = "MAX_TEXTURE_MAX_ANISOTROPY_EXT";
  GLEnum2[GLEnum2["TEXTURE_MAX_ANISOTROPY_EXT"] = 34046] = "TEXTURE_MAX_ANISOTROPY_EXT";
  GLEnum2[GLEnum2["R16_EXT"] = 33322] = "R16_EXT";
  GLEnum2[GLEnum2["RG16_EXT"] = 33324] = "RG16_EXT";
  GLEnum2[GLEnum2["RGB16_EXT"] = 32852] = "RGB16_EXT";
  GLEnum2[GLEnum2["RGBA16_EXT"] = 32859] = "RGBA16_EXT";
  GLEnum2[GLEnum2["R16_SNORM_EXT"] = 36760] = "R16_SNORM_EXT";
  GLEnum2[GLEnum2["RG16_SNORM_EXT"] = 36761] = "RG16_SNORM_EXT";
  GLEnum2[GLEnum2["RGB16_SNORM_EXT"] = 36762] = "RGB16_SNORM_EXT";
  GLEnum2[GLEnum2["RGBA16_SNORM_EXT"] = 36763] = "RGBA16_SNORM_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_S3TC_DXT1_EXT"] = 33777] = "COMPRESSED_RGBA_S3TC_DXT1_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_S3TC_DXT3_EXT"] = 33778] = "COMPRESSED_RGBA_S3TC_DXT3_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SRGB_S3TC_DXT1_EXT"] = 35916] = "COMPRESSED_SRGB_S3TC_DXT1_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT"] = 35917] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT"] = 35918] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT"] = 35919] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RED_RGTC1_EXT"] = 36283] = "COMPRESSED_RED_RGTC1_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SIGNED_RED_RGTC1_EXT"] = 36284] = "COMPRESSED_SIGNED_RED_RGTC1_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RED_GREEN_RGTC2_EXT"] = 36285] = "COMPRESSED_RED_GREEN_RGTC2_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT"] = 36286] = "COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_BPTC_UNORM_EXT"] = 36492] = "COMPRESSED_RGBA_BPTC_UNORM_EXT";
  GLEnum2[GLEnum2["COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT"] = 36493] = "COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT"] = 36494] = "COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT";
  GLEnum2[GLEnum2["COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT"] = 36495] = "COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT";
  GLEnum2[GLEnum2["COMPRESSED_R11_EAC"] = 37488] = "COMPRESSED_R11_EAC";
  GLEnum2[GLEnum2["COMPRESSED_SIGNED_R11_EAC"] = 37489] = "COMPRESSED_SIGNED_R11_EAC";
  GLEnum2[GLEnum2["COMPRESSED_RG11_EAC"] = 37490] = "COMPRESSED_RG11_EAC";
  GLEnum2[GLEnum2["COMPRESSED_SIGNED_RG11_EAC"] = 37491] = "COMPRESSED_SIGNED_RG11_EAC";
  GLEnum2[GLEnum2["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
  GLEnum2[GLEnum2["COMPRESSED_RGBA8_ETC2_EAC"] = 37493] = "COMPRESSED_RGBA8_ETC2_EAC";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ETC2"] = 37494] = "COMPRESSED_SRGB8_ETC2";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ETC2_EAC"] = 37495] = "COMPRESSED_SRGB8_ALPHA8_ETC2_EAC";
  GLEnum2[GLEnum2["COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37496] = "COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37497] = "COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  GLEnum2[GLEnum2["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
  GLEnum2[GLEnum2["COMPRESSED_RGB_PVRTC_2BPPV1_IMG"] = 35841] = "COMPRESSED_RGB_PVRTC_2BPPV1_IMG";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_PVRTC_2BPPV1_IMG"] = 35843] = "COMPRESSED_RGBA_PVRTC_2BPPV1_IMG";
  GLEnum2[GLEnum2["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
  GLEnum2[GLEnum2["COMPRESSED_RGB_ATC_WEBGL"] = 35986] = "COMPRESSED_RGB_ATC_WEBGL";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL"] = 35986] = "COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL"] = 34798] = "COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_4x4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4x4_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_5x4_KHR"] = 37809] = "COMPRESSED_RGBA_ASTC_5x4_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_5x5_KHR"] = 37810] = "COMPRESSED_RGBA_ASTC_5x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_6x5_KHR"] = 37811] = "COMPRESSED_RGBA_ASTC_6x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_6x6_KHR"] = 37812] = "COMPRESSED_RGBA_ASTC_6x6_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_8x5_KHR"] = 37813] = "COMPRESSED_RGBA_ASTC_8x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_8x6_KHR"] = 37814] = "COMPRESSED_RGBA_ASTC_8x6_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_8x8_KHR"] = 37815] = "COMPRESSED_RGBA_ASTC_8x8_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_10x5_KHR"] = 37816] = "COMPRESSED_RGBA_ASTC_10x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_10x6_KHR"] = 37817] = "COMPRESSED_RGBA_ASTC_10x6_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_10x8_KHR"] = 37818] = "COMPRESSED_RGBA_ASTC_10x8_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_10x10_KHR"] = 37819] = "COMPRESSED_RGBA_ASTC_10x10_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_12x10_KHR"] = 37820] = "COMPRESSED_RGBA_ASTC_12x10_KHR";
  GLEnum2[GLEnum2["COMPRESSED_RGBA_ASTC_12x12_KHR"] = 37821] = "COMPRESSED_RGBA_ASTC_12x12_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR"] = 37840] = "COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR"] = 37841] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR"] = 37842] = "COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR"] = 37843] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR"] = 37844] = "COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR"] = 37845] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR"] = 37846] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR"] = 37847] = "COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR"] = 37848] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR"] = 37849] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR"] = 37850] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR"] = 37851] = "COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR"] = 37852] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR";
  GLEnum2[GLEnum2["COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR"] = 37853] = "COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR";
  GLEnum2[GLEnum2["QUERY_COUNTER_BITS_EXT"] = 34916] = "QUERY_COUNTER_BITS_EXT";
  GLEnum2[GLEnum2["CURRENT_QUERY_EXT"] = 34917] = "CURRENT_QUERY_EXT";
  GLEnum2[GLEnum2["QUERY_RESULT_EXT"] = 34918] = "QUERY_RESULT_EXT";
  GLEnum2[GLEnum2["QUERY_RESULT_AVAILABLE_EXT"] = 34919] = "QUERY_RESULT_AVAILABLE_EXT";
  GLEnum2[GLEnum2["TIME_ELAPSED_EXT"] = 35007] = "TIME_ELAPSED_EXT";
  GLEnum2[GLEnum2["TIMESTAMP_EXT"] = 36392] = "TIMESTAMP_EXT";
  GLEnum2[GLEnum2["GPU_DISJOINT_EXT"] = 36795] = "GPU_DISJOINT_EXT";
  GLEnum2[GLEnum2["COMPLETION_STATUS_KHR"] = 37297] = "COMPLETION_STATUS_KHR";
  GLEnum2[GLEnum2["DEPTH_CLAMP_EXT"] = 34383] = "DEPTH_CLAMP_EXT";
  GLEnum2[GLEnum2["FIRST_VERTEX_CONVENTION_WEBGL"] = 36429] = "FIRST_VERTEX_CONVENTION_WEBGL";
  GLEnum2[GLEnum2["LAST_VERTEX_CONVENTION_WEBGL"] = 36430] = "LAST_VERTEX_CONVENTION_WEBGL";
  GLEnum2[GLEnum2["PROVOKING_VERTEX_WEBL"] = 36431] = "PROVOKING_VERTEX_WEBL";
  GLEnum2[GLEnum2["POLYGON_MODE_WEBGL"] = 2880] = "POLYGON_MODE_WEBGL";
  GLEnum2[GLEnum2["POLYGON_OFFSET_LINE_WEBGL"] = 10754] = "POLYGON_OFFSET_LINE_WEBGL";
  GLEnum2[GLEnum2["LINE_WEBGL"] = 6913] = "LINE_WEBGL";
  GLEnum2[GLEnum2["FILL_WEBGL"] = 6914] = "FILL_WEBGL";
  GLEnum2[GLEnum2["MAX_CLIP_DISTANCES_WEBGL"] = 3378] = "MAX_CLIP_DISTANCES_WEBGL";
  GLEnum2[GLEnum2["MAX_CULL_DISTANCES_WEBGL"] = 33529] = "MAX_CULL_DISTANCES_WEBGL";
  GLEnum2[GLEnum2["MAX_COMBINED_CLIP_AND_CULL_DISTANCES_WEBGL"] = 33530] = "MAX_COMBINED_CLIP_AND_CULL_DISTANCES_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE0_WEBGL"] = 12288] = "CLIP_DISTANCE0_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE1_WEBGL"] = 12289] = "CLIP_DISTANCE1_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE2_WEBGL"] = 12290] = "CLIP_DISTANCE2_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE3_WEBGL"] = 12291] = "CLIP_DISTANCE3_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE4_WEBGL"] = 12292] = "CLIP_DISTANCE4_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE5_WEBGL"] = 12293] = "CLIP_DISTANCE5_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE6_WEBGL"] = 12294] = "CLIP_DISTANCE6_WEBGL";
  GLEnum2[GLEnum2["CLIP_DISTANCE7_WEBGL"] = 12295] = "CLIP_DISTANCE7_WEBGL";
  GLEnum2[GLEnum2["POLYGON_OFFSET_CLAMP_EXT"] = 36379] = "POLYGON_OFFSET_CLAMP_EXT";
  GLEnum2[GLEnum2["LOWER_LEFT_EXT"] = 36001] = "LOWER_LEFT_EXT";
  GLEnum2[GLEnum2["UPPER_LEFT_EXT"] = 36002] = "UPPER_LEFT_EXT";
  GLEnum2[GLEnum2["NEGATIVE_ONE_TO_ONE_EXT"] = 37726] = "NEGATIVE_ONE_TO_ONE_EXT";
  GLEnum2[GLEnum2["ZERO_TO_ONE_EXT"] = 37727] = "ZERO_TO_ONE_EXT";
  GLEnum2[GLEnum2["CLIP_ORIGIN_EXT"] = 37724] = "CLIP_ORIGIN_EXT";
  GLEnum2[GLEnum2["CLIP_DEPTH_MODE_EXT"] = 37725] = "CLIP_DEPTH_MODE_EXT";
  GLEnum2[GLEnum2["SRC1_COLOR_WEBGL"] = 35065] = "SRC1_COLOR_WEBGL";
  GLEnum2[GLEnum2["SRC1_ALPHA_WEBGL"] = 34185] = "SRC1_ALPHA_WEBGL";
  GLEnum2[GLEnum2["ONE_MINUS_SRC1_COLOR_WEBGL"] = 35066] = "ONE_MINUS_SRC1_COLOR_WEBGL";
  GLEnum2[GLEnum2["ONE_MINUS_SRC1_ALPHA_WEBGL"] = 35067] = "ONE_MINUS_SRC1_ALPHA_WEBGL";
  GLEnum2[GLEnum2["MAX_DUAL_SOURCE_DRAW_BUFFERS_WEBGL"] = 35068] = "MAX_DUAL_SOURCE_DRAW_BUFFERS_WEBGL";
  GLEnum2[GLEnum2["MIRROR_CLAMP_TO_EDGE_EXT"] = 34627] = "MIRROR_CLAMP_TO_EDGE_EXT";
})(GLEnum || (GLEnum = {}));

// ../core/src/lib/attribute/data-column.ts
var import_core9 = require("@luma.gl/core");

// ../core/src/lib/attribute/gl-utils.ts
var import_core8 = require("@luma.gl/core");
function typedArrayFromDataType(type) {
  switch (type) {
    case "float64":
      return Float64Array;
    case "uint8":
    case "unorm8":
      return Uint8ClampedArray;
    default:
      return (0, import_core8.getTypedArrayConstructor)(type);
  }
}
var dataTypeFromTypedArray = import_core8.dataTypeDecoder.getDataType.bind(import_core8.dataTypeDecoder);
function getBufferAttributeLayout(name, accessor, deviceType) {
  if (accessor.size > 4) {
    return null;
  }
  const type = deviceType === "webgpu" && accessor.type === "uint8" ? "unorm8" : accessor.type;
  const size = accessor.size;
  const webglOnly = Boolean(
    deviceType !== "webgpu" && size === 3 && type && ["uint8", "sint8", "unorm8", "snorm8", "uint16", "sint16", "unorm16", "snorm16"].includes(
      type
    )
  );
  return {
    attribute: name,
    // @ts-expect-error Not all combinations are valid vertex formats; it's up to DataColumn to ensure
    format: size > 1 ? `${type}x${size}${webglOnly ? "-webgl" : ""}` : accessor.type,
    byteOffset: accessor.offset || 0
    // Note stride is set on the top level
  };
}
function getStride(accessor) {
  return accessor.stride || accessor.size * accessor.bytesPerElement;
}
function bufferLayoutEqual(accessor1, accessor2) {
  return accessor1.type === accessor2.type && accessor1.size === accessor2.size && getStride(accessor1) === getStride(accessor2) && (accessor1.offset || 0) === (accessor2.offset || 0);
}

// ../core/src/lib/attribute/data-column.ts
function resolveShaderAttribute(baseAccessor, shaderAttributeOptions) {
  if (shaderAttributeOptions.offset) {
    log_default.removed("shaderAttribute.offset", "vertexOffset, elementOffset")();
  }
  const stride = getStride(baseAccessor);
  const vertexOffset = shaderAttributeOptions.vertexOffset !== void 0 ? shaderAttributeOptions.vertexOffset : baseAccessor.vertexOffset || 0;
  const elementOffset = shaderAttributeOptions.elementOffset || 0;
  const offset = (
    // offsets defined by the attribute
    vertexOffset * stride + elementOffset * baseAccessor.bytesPerElement + // offsets defined by external buffers if any
    (baseAccessor.offset || 0)
  );
  return {
    ...shaderAttributeOptions,
    offset,
    stride
  };
}
function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
  const resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);
  return {
    high: resolvedOptions,
    low: {
      ...resolvedOptions,
      offset: resolvedOptions.offset + baseAccessor.size * 4
    }
  };
}
var DataColumn = class {
  /* eslint-disable max-statements */
  constructor(device, opts, state) {
    this._buffer = null;
    this.device = device;
    this.id = opts.id || "";
    this.size = opts.size || 1;
    const logicalType = opts.logicalType || opts.type;
    const doublePrecision = logicalType === "float64";
    let { defaultValue } = opts;
    defaultValue = Number.isFinite(defaultValue) ? [defaultValue] : defaultValue || new Array(this.size).fill(0);
    let bufferType;
    if (doublePrecision) {
      bufferType = "float32";
    } else if (!logicalType && opts.isIndexed) {
      bufferType = "uint32";
    } else {
      bufferType = logicalType || "float32";
    }
    let defaultType = typedArrayFromDataType(logicalType || bufferType);
    this.doublePrecision = doublePrecision;
    if (doublePrecision && opts.fp64 === false) {
      defaultType = Float32Array;
    }
    this.value = null;
    this.settings = {
      ...opts,
      defaultType,
      defaultValue,
      logicalType,
      type: bufferType,
      normalized: bufferType.includes("norm"),
      size: this.size,
      bytesPerElement: defaultType.BYTES_PER_ELEMENT
    };
    this.state = {
      ...state,
      externalBuffer: null,
      bufferAccessor: this.settings,
      allocatedValue: null,
      numInstances: 0,
      bounds: null,
      constant: false
    };
  }
  /* eslint-enable max-statements */
  get isConstant() {
    return this.state.constant;
  }
  get buffer() {
    return this._buffer;
  }
  get byteOffset() {
    const accessor = this.getAccessor();
    if (accessor.vertexOffset) {
      return accessor.vertexOffset * getStride(accessor);
    }
    return 0;
  }
  get numInstances() {
    return this.state.numInstances;
  }
  set numInstances(n) {
    this.state.numInstances = n;
  }
  /** @internal Whether this column's GPU buffer contains interleaved high and low components. */
  get isDoublePrecisionBuffer() {
    return this._shouldSplitDoublePrecisionValue(this.value);
  }
  delete() {
    if (this._buffer) {
      this._buffer.delete();
      this._buffer = null;
    }
    typed_array_manager_default.release(this.state.allocatedValue);
  }
  getBuffer() {
    if (this.state.constant && this.device.type !== "webgpu") {
      return null;
    }
    return this.state.externalBuffer || this._buffer;
  }
  getValue(attributeName = this.id, options = null) {
    const result = {};
    if (this.state.constant) {
      const value = this.value;
      if (this.device.type === "webgpu" && this._buffer) {
        result[attributeName] = this._buffer;
      } else if (options) {
        const shaderAttributeDef = resolveShaderAttribute(this.getAccessor(), options);
        const offset = shaderAttributeDef.offset / value.BYTES_PER_ELEMENT;
        const size = shaderAttributeDef.size || this.size;
        result[attributeName] = value.subarray(offset, offset + size);
      } else {
        result[attributeName] = value;
      }
    } else {
      result[attributeName] = this.getBuffer();
    }
    if (this.doublePrecision) {
      if (this.isDoublePrecisionBuffer) {
        result[`${attributeName}64Low`] = result[attributeName];
      } else {
        result[`${attributeName}64Low`] = new Float32Array(this.size);
      }
    }
    return result;
  }
  _getBufferLayout(attributeName = this.id, options = null) {
    const accessor = this.getAccessor();
    const attributes = [];
    const result = {
      name: this.id,
      // WebGPU has no constant vertex attributes. A one-row buffer with zero stride provides
      // equivalent broadcast semantics without scaling allocation with the instance count.
      byteStride: this.device.type === "webgpu" && this.state.constant ? 0 : getStride(accessor)
    };
    if (this.doublePrecision) {
      const doubleShaderAttributeDefs = resolveDoublePrecisionShaderAttributes(
        accessor,
        options || {}
      );
      attributes.push(
        getBufferAttributeLayout(
          attributeName,
          { ...accessor, ...doubleShaderAttributeDefs.high },
          this.device.type
        ),
        getBufferAttributeLayout(
          `${attributeName}64Low`,
          {
            ...accessor,
            ...doubleShaderAttributeDefs.low
          },
          this.device.type
        )
      );
    } else if (options) {
      const shaderAttributeDef = resolveShaderAttribute(accessor, options);
      attributes.push(
        getBufferAttributeLayout(
          attributeName,
          { ...accessor, ...shaderAttributeDef },
          this.device.type
        )
      );
    } else {
      attributes.push(getBufferAttributeLayout(attributeName, accessor, this.device.type));
    }
    result.attributes = attributes.filter(Boolean);
    return result;
  }
  setAccessor(accessor) {
    this.state.bufferAccessor = accessor;
  }
  getAccessor() {
    return this.state.bufferAccessor;
  }
  // Returns [min: Array(size), max: Array(size)]
  /* eslint-disable max-depth */
  getBounds() {
    if (this.state.bounds) {
      return this.state.bounds;
    }
    let result = null;
    if (this.state.constant && this.value) {
      const min = Array.from(this.value);
      result = [min, min];
    } else {
      const { value, numInstances, size } = this;
      const len = numInstances * size;
      if (value && len && value.length >= len) {
        const min = new Array(size).fill(Infinity);
        const max = new Array(size).fill(-Infinity);
        for (let i = 0; i < len; ) {
          for (let j = 0; j < size; j++) {
            const v = value[i++];
            if (v < min[j]) min[j] = v;
            if (v > max[j]) max[j] = v;
          }
        }
        result = [min, max];
      }
    }
    this.state.bounds = result;
    return result;
  }
  // returns true if success
  // eslint-disable-next-line max-statements
  setData(data) {
    const { state } = this;
    let opts;
    if (ArrayBuffer.isView(data)) {
      opts = { value: data };
    } else if (data instanceof import_core9.Buffer) {
      opts = { buffer: data };
    } else {
      opts = data;
    }
    const accessor = { ...this.settings, ...opts };
    if (ArrayBuffer.isView(opts.value)) {
      if (!opts.type) {
        const is64Bit = this.doublePrecision && opts.value instanceof Float64Array;
        if (is64Bit) {
          accessor.type = "float32";
        } else {
          const type = dataTypeFromTypedArray(opts.value);
          accessor.type = accessor.normalized ? type.replace("int", "norm") : type;
        }
      }
      accessor.bytesPerElement = opts.value.BYTES_PER_ELEMENT;
      accessor.stride = getStride(accessor);
    }
    state.bounds = null;
    if (opts.constant) {
      let value = opts.value;
      value = this._normalizeValue(value, [], 0);
      if (this.settings.normalized) {
        value = this.normalizeConstant(value);
      }
      const hasChanged = !state.constant || !this._areValuesEqual(value, this.value);
      if (!hasChanged) {
        return false;
      }
      state.externalBuffer = null;
      state.constant = true;
      this.value = ArrayBuffer.isView(value) ? value : new Float32Array(value);
    } else if (opts.buffer) {
      const buffer = opts.buffer;
      state.externalBuffer = buffer;
      state.constant = false;
      this.value = opts.value || null;
    } else if (opts.value) {
      this._checkExternalBuffer(opts);
      const sourceValue = opts.value;
      let value = sourceValue;
      state.externalBuffer = null;
      state.constant = false;
      this.value = sourceValue;
      if (this._shouldSplitDoublePrecisionValue(value)) {
        value = toDoublePrecisionArray(value, accessor);
        if (sourceValue instanceof Float32Array) {
          accessor.stride = accessor.size * 2 * Float32Array.BYTES_PER_ELEMENT;
        }
      }
      let { buffer } = this;
      const stride = getStride(accessor);
      const byteOffset = (accessor.vertexOffset || 0) * stride;
      if (this.settings.isIndexed) {
        const ArrayType = this.settings.defaultType;
        if (value.constructor !== ArrayType) {
          value = new ArrayType(value);
        }
      }
      const requiredBufferSize = value.byteLength + byteOffset + stride * 2;
      if (!buffer || buffer.byteLength < requiredBufferSize) {
        buffer = this._createBuffer(requiredBufferSize);
      }
      buffer.write(value, byteOffset);
    }
    this.setAccessor(accessor);
    return true;
  }
  updateSubBuffer(opts = {}) {
    this.state.bounds = null;
    const value = this.value;
    const { startOffset = 0, endOffset } = opts;
    const splitDoublePrecisionValue = this._shouldSplitDoublePrecisionValue(value);
    this.buffer.write(
      splitDoublePrecisionValue ? toDoublePrecisionArray(value, {
        size: this.size,
        startIndex: startOffset,
        endIndex: endOffset
      }) : value.subarray(startOffset, endOffset),
      startOffset * (splitDoublePrecisionValue ? 8 : value.BYTES_PER_ELEMENT) + this.byteOffset
    );
  }
  allocate(numInstances, copy = false) {
    const { state } = this;
    const oldValue = state.allocatedValue;
    const value = typed_array_manager_default.allocate(oldValue, numInstances + 1, {
      size: this.size,
      type: this.settings.defaultType,
      copy
    });
    this.value = value;
    const splitDoublePrecisionValue = this._shouldSplitDoublePrecisionValue(value);
    const accessor = splitDoublePrecisionValue && value instanceof Float32Array ? { ...this.settings, stride: this.size * 2 * Float32Array.BYTES_PER_ELEMENT } : this.settings;
    this.setAccessor(accessor);
    const { byteOffset } = this;
    let { buffer } = this;
    const bufferByteLength = value.byteLength * (splitDoublePrecisionValue && value instanceof Float32Array ? 2 : 1);
    if (!buffer || buffer.byteLength < bufferByteLength + byteOffset) {
      buffer = this._createBuffer(bufferByteLength + byteOffset);
      if (copy && oldValue) {
        buffer.write(
          this._shouldSplitDoublePrecisionValue(oldValue) ? toDoublePrecisionArray(oldValue, this) : oldValue,
          byteOffset
        );
      }
    }
    state.allocatedValue = value;
    state.constant = false;
    state.externalBuffer = null;
    return true;
  }
  // PRIVATE HELPER METHODS
  _shouldSplitDoublePrecisionValue(value) {
    return Boolean(
      this.doublePrecision && (value instanceof Float64Array || this.device.type === "webgpu" && value instanceof Float32Array)
    );
  }
  _checkExternalBuffer(opts) {
    const { value } = opts;
    if (!ArrayBuffer.isView(value)) {
      throw new Error(`Attribute ${this.id} value is not TypedArray`);
    }
    const ArrayType = this.settings.defaultType;
    let illegalArrayType = false;
    if (this.doublePrecision) {
      illegalArrayType = value.BYTES_PER_ELEMENT < 4;
    }
    if (illegalArrayType) {
      throw new Error(`Attribute ${this.id} does not support ${value.constructor.name}`);
    }
    if (!(value instanceof ArrayType) && this.settings.normalized && !("normalized" in opts)) {
      log_default.warn(`Attribute ${this.id} is normalized`)();
    }
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
  normalizeConstant(value) {
    switch (this.settings.type) {
      case "snorm8":
        return new Float32Array(value).map((x) => (x + 128) / 255 * 2 - 1);
      case "snorm16":
        return new Float32Array(value).map((x) => (x + 32768) / 65535 * 2 - 1);
      case "unorm8":
        return new Float32Array(value).map((x) => x / 255);
      case "unorm16":
        return new Float32Array(value).map((x) => x / 65535);
      default:
        return value;
    }
  }
  /* check user supplied values and apply fallback */
  _normalizeValue(value, out, start) {
    const { defaultValue, size } = this.settings;
    if (Number.isFinite(value)) {
      out[start] = value;
      return out;
    }
    if (!value) {
      let i = size;
      while (--i >= 0) {
        out[start + i] = defaultValue[i];
      }
      return out;
    }
    switch (size) {
      case 4:
        out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];
      case 3:
        out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];
      case 2:
        out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];
      case 1:
        out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
        break;
      default:
        let i = size;
        while (--i >= 0) {
          out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
        }
    }
    return out;
  }
  _areValuesEqual(value1, value2) {
    if (!value1 || !value2) {
      return false;
    }
    const { size } = this;
    for (let i = 0; i < size; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
  _createBuffer(byteLength) {
    var _a;
    if (this._buffer) {
      this._buffer.destroy();
    }
    const { isIndexed, type } = this.settings;
    const usage = this.device.type === "webgpu" && !isIndexed ? import_core9.Buffer.VERTEX | import_core9.Buffer.STORAGE | import_core9.Buffer.COPY_DST | import_core9.Buffer.COPY_SRC : (isIndexed ? import_core9.Buffer.INDEX : import_core9.Buffer.VERTEX) | import_core9.Buffer.COPY_DST;
    this._buffer = this.device.createBuffer({
      ...(_a = this._buffer) == null ? void 0 : _a.props,
      id: this.id,
      // Grouped WebGPU attribute interleave binds vertex attributes as storage buffers.
      usage,
      indexType: isIndexed ? type : void 0,
      byteLength
    });
    return this._buffer;
  }
};

// ../core/src/utils/iterable-utils.ts
var EMPTY_ARRAY = [];
var placeholderArray = [];
function createIterable(data, startRow = 0, endRow = Infinity) {
  let iterable = EMPTY_ARRAY;
  const objectInfo = {
    index: -1,
    data,
    // visitor can optionally utilize this to avoid constructing a new array for every object
    target: []
  };
  if (!data) {
    iterable = EMPTY_ARRAY;
  } else if (typeof data[Symbol.iterator] === "function") {
    iterable = data;
  } else if (data.length > 0) {
    placeholderArray.length = data.length;
    iterable = placeholderArray;
  }
  if (startRow > 0 || Number.isFinite(endRow)) {
    iterable = (Array.isArray(iterable) ? iterable : Array.from(iterable)).slice(startRow, endRow);
    objectInfo.index = startRow - 1;
  }
  return { iterable, objectInfo };
}
function isAsyncIterable(data) {
  return data && data[Symbol.asyncIterator];
}
function getAccessorFromBuffer(typedArray, options) {
  const { size, stride, offset, startIndices, nested } = options;
  const bytesPerElement = typedArray.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : size;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const vertexCount = Math.floor((typedArray.length - elementOffset) / elementStride);
  return (_, { index, target }) => {
    if (!startIndices) {
      const sourceIndex = index * elementStride + elementOffset;
      for (let j = 0; j < size; j++) {
        target[j] = typedArray[sourceIndex + j];
      }
      return target;
    }
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || vertexCount;
    let result;
    if (nested) {
      result = new Array(endIndex - startIndex);
      for (let i = startIndex; i < endIndex; i++) {
        const sourceIndex = i * elementStride + elementOffset;
        target = new Array(size);
        for (let j = 0; j < size; j++) {
          target[j] = typedArray[sourceIndex + j];
        }
        result[i - startIndex] = target;
      }
    } else if (elementStride === size) {
      result = typedArray.subarray(
        startIndex * size + elementOffset,
        endIndex * size + elementOffset
      );
    } else {
      result = new typedArray.constructor((endIndex - startIndex) * size);
      let targetIndex = 0;
      for (let i = startIndex; i < endIndex; i++) {
        const sourceIndex = i * elementStride + elementOffset;
        for (let j = 0; j < size; j++) {
          result[targetIndex++] = typedArray[sourceIndex + j];
        }
      }
    }
    return result;
  };
}

// ../core/src/utils/range.ts
var EMPTY = [];
var FULL = [[0, Infinity]];
function add(rangeList, range) {
  if (rangeList === FULL) {
    return rangeList;
  }
  if (range[0] < 0) {
    range[0] = 0;
  }
  if (range[0] >= range[1]) {
    return rangeList;
  }
  const newRangeList = [];
  const len = rangeList.length;
  let insertPosition = 0;
  for (let i = 0; i < len; i++) {
    const range0 = rangeList[i];
    if (range0[1] < range[0]) {
      newRangeList.push(range0);
      insertPosition = i + 1;
    } else if (range0[0] > range[1]) {
      newRangeList.push(range0);
    } else {
      range = [Math.min(range0[0], range[0]), Math.max(range0[1], range[1])];
    }
  }
  newRangeList.splice(insertPosition, 0, range);
  return newRangeList;
}

// ../core/src/lib/attribute/transition-settings.ts
var DEFAULT_TRANSITION_SETTINGS = {
  interpolation: {
    duration: 0,
    easing: (t) => t
  },
  spring: {
    stiffness: 0.05,
    damping: 0.5
  }
};
function normalizeTransitionSettings(userSettings, layerSettings) {
  if (!userSettings) {
    return null;
  }
  if (Number.isFinite(userSettings)) {
    userSettings = { type: "interpolation", duration: userSettings };
  }
  const type = userSettings.type || "interpolation";
  return {
    ...DEFAULT_TRANSITION_SETTINGS[type],
    ...layerSettings,
    ...userSettings,
    type
  };
}

// ../core/src/lib/attribute/attribute.ts
var Attribute = class extends DataColumn {
  constructor(device, opts) {
    super(device, opts, {
      startIndices: null,
      constantValue: null,
      lastExternalBuffer: null,
      binaryValue: null,
      binaryAccessor: null,
      needsUpdate: true,
      needsRedraw: false,
      layoutChanged: false,
      updateRanges: FULL
    });
    /** Legacy approach to set attribute value - read `isConstant` instead for attribute state */
    this.constant = false;
    this.settings.update = opts.update || (opts.accessor ? this._autoUpdater : void 0);
    Object.seal(this.settings);
    Object.seal(this.state);
    this._validateAttributeUpdaters();
  }
  get startIndices() {
    return this.state.startIndices;
  }
  set startIndices(layout) {
    this.state.startIndices = layout;
  }
  needsUpdate() {
    return this.state.needsUpdate;
  }
  needsRedraw({ clearChangedFlags = false } = {}) {
    const needsRedraw = this.state.needsRedraw;
    this.state.needsRedraw = needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }
  layoutChanged() {
    return this.state.layoutChanged;
  }
  setAccessor(accessor) {
    this.state.layoutChanged ||= !bufferLayoutEqual(accessor, this.getAccessor());
    super.setAccessor(accessor);
  }
  getUpdateTriggers() {
    const { accessor } = this.settings;
    return [this.id].concat(typeof accessor !== "function" && accessor || []);
  }
  supportsTransition() {
    return Boolean(this.settings.transition);
  }
  // Resolve transition settings object if transition is enabled, otherwise `null`
  getTransitionSetting(opts) {
    if (!opts || !this.supportsTransition()) {
      return null;
    }
    const { accessor } = this.settings;
    const layerSettings = this.settings.transition;
    const userSettings = Array.isArray(accessor) ? (
      // @ts-ignore
      opts[accessor.find((a) => opts[a])]
    ) : (
      // @ts-ignore
      opts[accessor]
    );
    return normalizeTransitionSettings(userSettings, layerSettings);
  }
  setNeedsUpdate(reason = this.id, dataRange) {
    this.state.needsUpdate = this.state.needsUpdate || reason;
    this.setNeedsRedraw(reason);
    if (dataRange) {
      const { startRow = 0, endRow = Infinity } = dataRange;
      this.state.updateRanges = add(this.state.updateRanges, [startRow, endRow]);
    } else {
      this.state.updateRanges = FULL;
    }
  }
  clearNeedsUpdate() {
    this.state.needsUpdate = false;
    this.state.updateRanges = EMPTY;
  }
  setNeedsRedraw(reason = this.id) {
    this.state.needsRedraw = this.state.needsRedraw || reason;
  }
  allocate(numInstances) {
    const { state, settings } = this;
    if (settings.noAlloc) {
      return false;
    }
    if (settings.update) {
      const wasConstant = this.isConstant;
      super.allocate(numInstances, state.updateRanges !== FULL);
      state.layoutChanged ||= wasConstant && this.device.type === "webgpu";
      return true;
    }
    return false;
  }
  updateBuffer({
    numInstances,
    data,
    props,
    context
  }) {
    if (!this.needsUpdate()) {
      return false;
    }
    const {
      state: { updateRanges },
      settings: { update, noAlloc }
    } = this;
    let updated = true;
    if (update) {
      for (const [startRow, endRow] of updateRanges) {
        update.call(context, this, { data, startRow, endRow, props, numInstances });
      }
      if (!this.value) {
      } else if (this.constant || !this.buffer || this.buffer.byteLength < this.value.byteLength + this.byteOffset) {
        if (this.constant) {
          const constantValue = this.value;
          this.value = null;
          this.setConstantValue(context, constantValue);
        } else {
          this.setData({
            value: this.value,
            constant: this.constant
          });
        }
        this.constant = false;
      } else {
        for (const [startRow, endRow] of updateRanges) {
          const startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
          const endOffset = Number.isFinite(endRow) ? this.getVertexOffset(endRow) : noAlloc || !Number.isFinite(numInstances) ? this.value.length : numInstances * this.size;
          super.updateSubBuffer({ startOffset, endOffset });
        }
      }
      this._checkAttributeArray();
    } else {
      updated = false;
    }
    this.clearNeedsUpdate();
    this.setNeedsRedraw();
    return updated;
  }
  // Use generic value
  // Returns true if successful
  setConstantValue(context, value) {
    if (value === void 0 || typeof value === "function") {
      return false;
    }
    const wasConstant = this.isConstant;
    const transformedValue = this.settings.transform && context ? this.settings.transform.call(context, value) : value;
    const ArrayType = this.settings.defaultType;
    this.state.constantValue = this._normalizeValue(
      transformedValue,
      new ArrayType(this.size),
      0
    );
    const hasChanged = this.setData({ constant: true, value: transformedValue });
    if (this.device.type === "webgpu") {
      let bufferValue = this.state.constantValue;
      if (this.doublePrecision && (bufferValue instanceof Float32Array || bufferValue instanceof Float64Array)) {
        bufferValue = toDoublePrecisionArray(bufferValue, { size: this.size });
        this.setAccessor({
          ...this.getAccessor(),
          stride: this.size * 2 * Float32Array.BYTES_PER_ELEMENT
        });
      }
      let buffer = this._buffer;
      if (!buffer || buffer.byteLength < bufferValue.byteLength) {
        buffer = this._createBuffer(bufferValue.byteLength);
      }
      buffer.write(bufferValue);
      this.state.layoutChanged ||= !wasConstant;
      this.constant = false;
    }
    if (hasChanged) {
      this.setNeedsRedraw();
    }
    this.clearNeedsUpdate();
    return true;
  }
  /** Returns one row in its vertex-buffer representation for WebGPU buffer grouping. */
  getConstantValue() {
    return this.isConstant ? this.state.constantValue : null;
  }
  // Use external buffer
  // Returns true if successful
  // eslint-disable-next-line max-statements
  setExternalBuffer(buffer) {
    const { state } = this;
    if (!buffer) {
      state.lastExternalBuffer = null;
      return false;
    }
    this.clearNeedsUpdate();
    if (state.lastExternalBuffer === buffer) {
      return true;
    }
    state.lastExternalBuffer = buffer;
    this.setNeedsRedraw();
    this.setData(buffer);
    return true;
  }
  // Binary value is a typed array packed from mapping the source data with the accessor
  // If the returned value from the accessor is the same as the attribute value, set it directly
  // Otherwise use the auto updater for transform/normalization
  setBinaryValue(buffer, startIndices = null) {
    const { state, settings } = this;
    if (!buffer) {
      state.binaryValue = null;
      state.binaryAccessor = null;
      return false;
    }
    if (settings.noAlloc) {
      return false;
    }
    if (state.binaryValue === buffer) {
      this.clearNeedsUpdate();
      return true;
    }
    state.binaryValue = buffer;
    this.setNeedsRedraw();
    const needsUpdate = settings.transform || startIndices !== this.startIndices;
    if (needsUpdate) {
      if (ArrayBuffer.isView(buffer)) {
        buffer = { value: buffer };
      }
      const binaryValue = buffer;
      assert(ArrayBuffer.isView(binaryValue.value), `invalid ${settings.accessor}`);
      const needsNormalize = Boolean(binaryValue.size) && binaryValue.size !== this.size;
      state.binaryAccessor = getAccessorFromBuffer(binaryValue.value, {
        size: binaryValue.size || this.size,
        stride: binaryValue.stride,
        offset: binaryValue.offset,
        startIndices,
        nested: needsNormalize
      });
      return false;
    }
    this.clearNeedsUpdate();
    this.setData(buffer);
    return true;
  }
  getVertexOffset(row) {
    const { startIndices } = this;
    const vertexIndex = startIndices ? row < startIndices.length ? startIndices[row] : this.numInstances : row;
    return vertexIndex * this.size;
  }
  getValue() {
    const shaderAttributeDefs = this.settings.shaderAttributes;
    const result = super.getValue();
    if (!shaderAttributeDefs) {
      return result;
    }
    for (const shaderAttributeName in shaderAttributeDefs) {
      Object.assign(
        result,
        super.getValue(shaderAttributeName, shaderAttributeDefs[shaderAttributeName])
      );
    }
    return result;
  }
  /** Generate WebGPU-style buffer layout descriptor from this attribute */
  getBufferLayout(modelInfo) {
    this.state.layoutChanged = false;
    const shaderAttributeDefs = this.settings.shaderAttributes;
    const result = super._getBufferLayout();
    const { stepMode } = this.settings;
    if (stepMode === "dynamic") {
      result.stepMode = modelInfo ? modelInfo.isInstanced ? "instance" : "vertex" : "instance";
    } else {
      result.stepMode = stepMode ?? "vertex";
    }
    if (!shaderAttributeDefs) {
      return result;
    }
    for (const shaderAttributeName in shaderAttributeDefs) {
      const map = super._getBufferLayout(
        shaderAttributeName,
        shaderAttributeDefs[shaderAttributeName]
      );
      result.attributes.push(...map.attributes);
    }
    return result;
  }
  /* eslint-disable max-depth, max-statements */
  _autoUpdater(attribute, {
    data,
    startRow,
    endRow,
    props,
    numInstances
  }) {
    const { settings, state, value, size, startIndices } = attribute;
    const { accessor, transform: transform2 } = settings;
    const accessorFunc = state.binaryAccessor || // @ts-ignore
    (typeof accessor === "function" ? accessor : props[accessor]);
    assert(typeof accessorFunc === "function", `accessor "${accessor}" is not a function`);
    let i = attribute.getVertexOffset(startRow);
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      let objectValue = accessorFunc(object, objectInfo);
      if (transform2) {
        objectValue = transform2.call(this, objectValue);
      }
      if (startIndices) {
        const numVertices = (objectInfo.index < startIndices.length - 1 ? startIndices[objectInfo.index + 1] : numInstances) - startIndices[objectInfo.index];
        if (objectValue && Array.isArray(objectValue[0])) {
          let startIndex = i;
          for (const item of objectValue) {
            attribute._normalizeValue(item, value, startIndex);
            startIndex += size;
          }
        } else if (objectValue && objectValue.length > size) {
          value.set(objectValue, i);
        } else {
          attribute._normalizeValue(objectValue, objectInfo.target, 0);
          fillArray({
            target: value,
            source: objectInfo.target,
            start: i,
            count: numVertices
          });
        }
        i += numVertices * size;
      } else {
        attribute._normalizeValue(objectValue, value, i);
        i += size;
      }
    }
  }
  /* eslint-enable max-depth, max-statements */
  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const { settings } = this;
    const hasUpdater = settings.noAlloc || typeof settings.update === "function";
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }
  // check that the first few elements of the attribute are reasonable
  /* eslint-disable no-fallthrough */
  _checkAttributeArray() {
    const { value } = this;
    const limit = Math.min(4, this.size);
    if (value && value.length >= limit) {
      let valid = true;
      switch (limit) {
        case 4:
          valid = valid && Number.isFinite(value[3]);
        case 3:
          valid = valid && Number.isFinite(value[2]);
        case 2:
          valid = valid && Number.isFinite(value[1]);
        case 1:
          valid = valid && Number.isFinite(value[0]);
          break;
        default:
          valid = false;
      }
      if (!valid) {
        throw new Error(`Illegal attribute generated for ${this.id}`);
      }
    }
  }
  /* eslint-enable no-fallthrough */
};

// ../core/src/lib/attribute/attribute-buffer-groups.ts
var import_gpgpu = require("@luma.gl/gpgpu");

// ../../node_modules/@luma.gl/gpgpu/dist/operations/webgpu/common/row-transform.js
var import_engine = require("@luma.gl/engine");
var import_shadertools4 = require("@luma.gl/shadertools");

// ../../node_modules/@luma.gl/gpgpu/dist/operations/webgpu/common/dispatch.js
var WEBGPU_MINIMUM_MAX_COMPUTE_WORKGROUPS_PER_DIMENSION = 65535;
function getWebGPUDispatchLayout(workgroupCount, maxWorkgroupsPerDimension) {
  const maximumWorkgroupsPerDimension = getMaximumWorkgroupsPerDimension(maxWorkgroupsPerDimension);
  const totalWorkgroupCount = Math.max(1, Math.ceil(workgroupCount));
  const x = Math.min(totalWorkgroupCount, maximumWorkgroupsPerDimension);
  const y = Math.min(Math.ceil(totalWorkgroupCount / x), maximumWorkgroupsPerDimension);
  const z = Math.ceil(totalWorkgroupCount / x / y);
  if (z > maximumWorkgroupsPerDimension) {
    throw new Error(`WebGPU dispatch requires ${totalWorkgroupCount} workgroups, exceeding the 3D dispatch limit of ${maximumWorkgroupsPerDimension} per dimension`);
  }
  return { x, y, z };
}
function getWebGPUDispatchWorkgroupIndex(layout, workgroupId = "workgroupId") {
  return `((${workgroupId}.z * ${layout.y}u + ${workgroupId}.y) * ${layout.x}u + ${workgroupId}.x)`;
}
function getWebGPUDispatchRowIndex(layout, workgroupSize, workgroupId = "workgroupId", localId = "localId") {
  return `(${getWebGPUDispatchWorkgroupIndex(layout, workgroupId)} * ${workgroupSize}u + ${localId}.x)`;
}
function getMaximumWorkgroupsPerDimension(maxWorkgroupsPerDimension) {
  if (Number.isFinite(maxWorkgroupsPerDimension) && maxWorkgroupsPerDimension > 0) {
    return Math.floor(maxWorkgroupsPerDimension);
  }
  return WEBGPU_MINIMUM_MAX_COMPUTE_WORKGROUPS_PER_DIMENSION;
}

// ../../node_modules/@luma.gl/gpgpu/dist/operations/webgpu/common/helper.js
function getLiteralValue(type, value) {
  switch (type) {
    case "u32":
      return `${value}u`;
    case "f32":
      return Number.isInteger(value) ? `${value}.0` : `${value}`;
    default:
      return `${value}`;
  }
}
function getZeroValue(type) {
  switch (type) {
    case "uint32":
      return "0u";
    case "sint32":
      return "0";
    case "float32":
      return "0.0";
    default:
      throw new Error(`WebGPU operations only support 32-bit output types, got ${type}`);
  }
}
function getWGSLType(type) {
  switch (type) {
    case "uint32":
      return "u32";
    case "sint32":
      return "i32";
    case "float32":
      return "f32";
    default:
      throw new Error(`WebGPU operations only support 32-bit storage types, got ${type}`);
  }
}

// ../../node_modules/@luma.gl/gpgpu/dist/operations/webgpu/common/row-transform.js
var WORKGROUP_SIZE = 64;
var GPGPU_OPERATION_STATS = "GPGPU Operation Counts";
var COMPUTATION_RUNS = "Computation Runs";
var GPGPU_SHADER_ASSEMBLER = new import_shadertools4.ShaderAssembler();
function runRowComputation({ module: module2, elementWise = false, expression, inputs, output, operationType = output.type, outputBuffer }) {
  if (!module2.source) {
    throw new Error(`WebGPU computation ${module2.name} requires WGSL source`);
  }
  const inputEntries = getInputEntries(inputs);
  const bindings = inputEntries.map(([name, input]) => ({ name, input }));
  const storageBindings = bindings.filter(({ input }) => !input.isConstant).map((binding, index) => ({ ...binding, index }));
  const castToType = getWGSLType(operationType);
  const outputType = getWGSLType(output.type);
  const defines2 = {
    TYPE: castToType,
    RESULT_LEN: output.size.toString()
  };
  const dispatchLayout = getWebGPUDispatchLayout(Math.ceil(output.length / WORKGROUP_SIZE), outputBuffer.device.limits.maxComputeWorkgroupsPerDimension);
  for (const [name, input] of inputEntries) {
    defines2[`${name.toUpperCase()}_LEN`] = input.size.toString();
  }
  const source6 = (
    /* wgsl */
    `
${preprocess(module2.source, defines2)}
${storageBindings.map(({ name, input, index }) => getInputBinding(name, input, index)).join("\n")}
${bindings.map(({ name, input }) => getInputAccessor(name, input, operationType)).join("\n")}
${getOutputBinding(output, storageBindings.length)}
${getOutputWriter(output)}

@compute @workgroup_size(${WORKGROUP_SIZE}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${getWebGPUDispatchRowIndex(dispatchLayout, WORKGROUP_SIZE)};
  if (rowIndex >= ${output.length}u) {
    return;
  }

${bindings.map(({ name }) => `  let ${name} = read_${name}(rowIndex);`).join("\n")}
  var result: array<${outputType}, ${output.size}>;
${getComputeBlock(module2.name, inputEntries, output, elementWise, expression)}
  write_result(rowIndex, result);
}
`
  );
  const computation = new import_engine.Computation(outputBuffer.device, {
    source: source6,
    shaderAssembler: GPGPU_SHADER_ASSEMBLER,
    shaderLayout: {
      bindings: [
        ...storageBindings.map(({ name }, index) => ({
          name,
          type: "storage",
          group: 0,
          location: index
        })),
        { name: "result", type: "storage", group: 0, location: storageBindings.length }
      ]
    }
  });
  const computationBindings = Object.fromEntries(storageBindings.map(({ name, input }) => [name, input.buffer]));
  computationBindings["result"] = outputBuffer;
  computation.setBindings(computationBindings);
  const computePass = outputBuffer.device.beginComputePass({});
  outputBuffer.device.statsManager.getStats(GPGPU_OPERATION_STATS).get(COMPUTATION_RUNS).incrementCount();
  computation.dispatch(computePass, dispatchLayout.x, dispatchLayout.y, dispatchLayout.z);
  computePass.end();
  outputBuffer.device.submit();
  computation.destroy();
}
function getInputBinding(name, input, index) {
  if (input.isConstant) {
    return "";
  }
  const inputType = getWGSLType(input.type);
  return `@group(0) @binding(${index}) var<storage, read> ${name}: array<${inputType}>;`;
}
function getInputAccessor(name, input, asType) {
  const type = getWGSLType(asType);
  const castToType = input.type === asType ? "" : type;
  const stride = input.stride / input.ValueType.BYTES_PER_ELEMENT;
  const offset = input.offset / input.ValueType.BYTES_PER_ELEMENT;
  if (input.isConstant) {
    return `fn read_${name}(_rowIndex: u32) -> array<${type}, ${input.size}> {
  return array<${type}, ${input.size}>(${getConstantValues(input, castToType)});
}`;
  }
  return `fn read_${name}(rowIndex: u32) -> array<${type}, ${input.size}> {
  var value: array<${type}, ${input.size}>;
  let rowOffset = ${offset}u + rowIndex * ${stride}u;
${Array.from({ length: input.size }, (_, elementIndex) => castToType ? `  value[${elementIndex}] = ${castToType}(${name}[rowOffset + ${elementIndex}u]);` : `  value[${elementIndex}] = ${name}[rowOffset + ${elementIndex}u];`).join("\n")}
  return value;
}`;
}
function getOutputBinding(output, bindingIndex) {
  const type = getWGSLType(output.type);
  return `@group(0) @binding(${bindingIndex}) var<storage, read_write> result: array<${type}>;`;
}
function getOutputWriter(output) {
  const stride = output.stride / output.ValueType.BYTES_PER_ELEMENT;
  const offset = output.offset / output.ValueType.BYTES_PER_ELEMENT;
  const type = getWGSLType(output.type);
  return `fn write_result(rowIndex: u32, value: array<${type}, ${output.size}>) {
  let rowOffset = ${offset}u + rowIndex * ${stride}u;
${Array.from({ length: output.size }, (_, elementIndex) => `  result[rowOffset + ${elementIndex}u] = value[${elementIndex}];`).join("\n")}
}`;
}
function getComputeBlock(operationName, inputEntries, output, elementWise, expression) {
  let result = "";
  if (expression) {
    for (let elementIndex = 0; elementIndex < output.size; elementIndex++) {
      result += `  result[${elementIndex}] = ${expression(elementIndex)};
`;
    }
  } else if (elementWise) {
    const zero = getZeroValue(output.type);
    const outputType = getWGSLType(output.type);
    for (let elementIndex = 0; elementIndex < output.size; elementIndex++) {
      const elementInputs = inputEntries.map(([name, input]) => {
        if (elementIndex < input.size) {
          const inputType = getWGSLType(input.type);
          if (inputType === outputType) {
            return `${name}[${elementIndex}]`;
          }
          return `${outputType}(${name}[${elementIndex}])`;
        }
        return zero;
      });
      result += `  result[${elementIndex}] = ${operationName}(${elementInputs.join(", ")});
`;
    }
  } else {
    result += `result = ${operationName}(${inputEntries.map(([name]) => name).join(", ")});`;
  }
  return result.trimEnd();
}
function getInputEntries(inputs) {
  return Array.isArray(inputs) ? inputs.map((input, index) => [`x${index}`, input]) : Object.entries(inputs);
}
function getConstantValues(input, asType) {
  const values = input.value;
  if (!values) {
    throw new Error(`Constant input ${input} is missing CPU values`);
  }
  return Array.from({ length: input.size }, (_, index) => getLiteralValue(asType, values[index] ?? 0)).join(", ");
}
function preprocess(source6, defines2) {
  for (const key in defines2) {
    source6 = source6.replaceAll(`{${key}}`, defines2[key]);
  }
  return source6;
}

// ../../node_modules/@luma.gl/gpgpu/dist/operations/webgpu/interleave.js
var interleave = ({ inputs, output, target }) => {
  const inputEntries = inputs.map((input, index) => [
    `x${index}`,
    input
  ]);
  validateInterleaveBindings(target.device.limits, inputEntries);
  const argumentList = inputEntries.map(([name, input]) => `${name}: array<{TYPE}, ${input.size}>`).join(", ");
  let elementOffset = 0;
  const assignments = inputEntries.map(([name, input]) => {
    const block = Array.from({ length: input.size }, (_, elementIndex) => `  out[${elementOffset + elementIndex}] = ${name}[${elementIndex}];`).join("\n");
    elementOffset += input.size;
    return block;
  }).join("\n");
  const source6 = `fn interleave(${argumentList}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${assignments}
  return out;
}
`;
  runRowComputation({
    module: { name: "interleave", source: source6 },
    inputs,
    output,
    outputBuffer: target
  });
  return { success: true };
};
function validateInterleaveBindings(limits, inputEntries) {
  const storageInputCount = inputEntries.filter(([, input]) => !input.isConstant).length;
  const storageBindingCount = storageInputCount + 1;
  if (storageBindingCount > limits.maxStorageBuffersPerShaderStage) {
    throw new Error(`interleave() requires ${storageBindingCount} storage buffers, exceeding device limit ${limits.maxStorageBuffersPerShaderStage}`);
  }
  if (storageBindingCount > limits.maxBindingsPerBindGroup) {
    throw new Error(`interleave() requires ${storageBindingCount} bindings, exceeding bind group limit ${limits.maxBindingsPerBindGroup}`);
  }
}

// ../core/src/lib/attribute/attribute-buffer-groups.ts
var AttributeBufferGroups = class {
  constructor(device, {
    id,
    isTransitionAttribute
  }) {
    this.packedBuffers = {};
    this.device = device;
    this.id = id;
    this.isTransitionAttribute = isTransitionAttribute;
    if (this.device.type === "webgpu") {
      import_gpgpu.backendRegistry.add("webgpu", {
        interleave
      });
    }
  }
  /** Returns whether any attributes explicitly request WebGPU grouping. */
  hasGroups(attributes) {
    return this.device.type === "webgpu" && Object.values(attributes).some((attribute) => Boolean(attribute.settings.bufferGroup));
  }
  /** Deletes shared buffers created by this helper. */
  finalize() {
    for (const state of Object.values(this.packedBuffers)) {
      state.packed.destroy();
    }
    this.packedBuffers = {};
  }
  /**
   * Returns constructor-time layouts. Values may not exist yet, so runtime-only fallbacks are
   * resolved by {@link getBindings} before the first draw.
   */
  getBufferLayouts(attributes, modelInfo) {
    const groups = this._getPackedGroups(attributes, modelInfo, {
      requireValues: false,
      excludeAttributes: {}
    });
    return this._getBufferLayouts(attributes, groups, modelInfo);
  }
  /** Returns runtime layouts and shared buffers for a grouped WebGPU model update. */
  getBindings(attributes, changedAttributes, modelInfo, excludeAttributes) {
    const groups = this._getPackedGroups(attributes, modelInfo, {
      requireValues: true,
      excludeAttributes
    });
    const buffers = {};
    const groupedAttributeIds = /* @__PURE__ */ new Set();
    for (const group of groups.values()) {
      const needsUpload = !this.packedBuffers[group.id] || group.attributes.some((attribute) => Boolean(changedAttributes[attribute.id]));
      buffers[group.id] = this._getPackedBuffer(group, needsUpload);
      for (const attribute of group.attributes) {
        groupedAttributeIds.add(attribute.id);
      }
    }
    return {
      bufferLayouts: this._getBufferLayouts(attributes, groups, modelInfo).filter(
        (layout) => {
          var _a;
          return !excludeAttributes[layout.name] && !((_a = attributes[layout.name]) == null ? void 0 : _a.settings.isIndexed);
        }
      ),
      buffers,
      groupedAttributeIds
    };
  }
  _getPackedGroups(attributes, modelInfo, {
    requireValues,
    excludeAttributes
  }) {
    const groupedAttributes = /* @__PURE__ */ new Map();
    for (const attribute of Object.values(attributes)) {
      const groupId = attribute.settings.bufferGroup;
      if (!groupId) {
        continue;
      }
      const group = groupedAttributes.get(groupId) || [];
      group.push(attribute);
      groupedAttributes.set(groupId, group);
    }
    const packedGroups = /* @__PURE__ */ new Map();
    for (const [groupId, groupAttributes] of groupedAttributes) {
      const group = this._getPackedGroup(
        groupId,
        groupAttributes,
        modelInfo,
        requireValues,
        excludeAttributes
      );
      if (group) {
        packedGroups.set(groupId, group);
      }
    }
    return packedGroups;
  }
  // eslint-disable-next-line complexity
  _getPackedGroup(id, attributes, modelInfo, requireValues, excludeAttributes) {
    if (attributes.length < 2) {
      return null;
    }
    const layouts = attributes.map((attribute) => attribute.getBufferLayout(modelInfo));
    const stepMode = layouts[0].stepMode;
    const rowCount = Math.max(1, attributes[0].numInstances);
    const allConstant = requireValues && attributes.every((attribute) => attribute.isConstant);
    for (let index = 0; index < attributes.length; index++) {
      const attribute = attributes[index];
      const accessor = attribute.getAccessor();
      const naturalStride = accessor.size * accessor.bytesPerElement;
      if (excludeAttributes[attribute.id] || attribute.settings.isIndexed || attribute.settings.noAlloc || attribute.doublePrecision || this.isTransitionAttribute(attribute.id) || layouts[index].stepMode !== stepMode || attribute.numInstances !== attributes[0].numInstances || (accessor.offset || 0) !== 0 || (accessor.vertexOffset || 0) !== 0 || getStride(accessor) !== naturalStride || requireValues && (attribute.isConstant ? !attribute.getConstantValue() || attribute.getConstantValue().byteLength < naturalStride : !ArrayBuffer.isView(attribute.value) || attribute.value.byteLength < rowCount * naturalStride)) {
        return null;
      }
    }
    const byteOffsets = {};
    const layoutAttributes = [];
    let byteStride = 0;
    for (let index = 0; index < attributes.length; index++) {
      const attribute = attributes[index];
      byteStride = alignTo4(byteStride);
      byteOffsets[attribute.id] = byteStride;
      for (const layoutAttribute of layouts[index].attributes || []) {
        layoutAttributes.push({
          ...layoutAttribute,
          byteOffset: byteStride + (layoutAttribute.byteOffset || 0)
        });
      }
      byteStride += getStride(attribute.getAccessor());
    }
    byteStride = alignTo4(byteStride);
    return {
      id,
      attributes,
      byteStride,
      byteOffsets,
      rowCount,
      layout: {
        name: id,
        // Interleave emits one row when every input is constant. A zero stride broadcasts that
        // row without allocating one copy per vertex or instance.
        byteStride: allConstant ? 0 : byteStride,
        stepMode,
        attributes: layoutAttributes
      }
    };
  }
  _getBufferLayouts(attributes, groups, modelInfo) {
    const layouts = [];
    const emittedGroups = /* @__PURE__ */ new Set();
    const groupedAttributeIds = /* @__PURE__ */ new Set();
    for (const group of groups.values()) {
      for (const attribute of group.attributes) {
        groupedAttributeIds.add(attribute.id);
      }
    }
    for (const attribute of Object.values(attributes)) {
      const groupId = attribute.settings.bufferGroup;
      const group = groupId && groups.get(groupId);
      if (group && groupedAttributeIds.has(attribute.id)) {
        if (!emittedGroups.has(group.id)) {
          layouts.push(group.layout);
          emittedGroups.add(group.id);
        }
      } else {
        layouts.push(attribute.getBufferLayout(modelInfo));
      }
    }
    return layouts;
  }
  _getPackedBuffer(group, upload) {
    const layoutKey = JSON.stringify({
      byteStride: group.layout.byteStride,
      attributes: group.layout.attributes
    });
    const state = this.packedBuffers[group.id];
    if (!state || state.layoutKey !== layoutKey) {
      upload = true;
    }
    if (upload) {
      if (state) {
        state.packed.destroy();
        delete this.packedBuffers[group.id];
      }
      const packed = this._interleavePackedGroup(group);
      this.packedBuffers[group.id] = { packed, layoutKey };
      return packed.buffer;
    }
    if (!state) {
      throw new Error(`Attribute buffer group ${group.id} has no packed buffer`);
    }
    return state.packed.buffer;
  }
  _interleavePackedGroup(group) {
    const evaluators = group.attributes.map(
      (attribute) => this._getInterleaveInput(group, attribute)
    );
    const packed = (0, import_gpgpu.interleave)(...evaluators);
    (0, import_gpgpu.cleanEvaluateSync)(this.device, packed);
    return packed;
  }
  _getInterleaveInput(group, attribute) {
    const rowByteLength = getStride(attribute.getAccessor());
    const groupByteOffset = group.byteOffsets[attribute.id];
    assertU32Aligned(`${group.id}.${attribute.id} rowByteLength`, rowByteLength);
    assertU32Aligned(`${group.id}.${attribute.id} groupByteOffset`, groupByteOffset);
    if (attribute.isConstant) {
      const constantValue = attribute.getConstantValue();
      if (!constantValue) {
        throw new Error(`Attribute group ${group.id} is missing constant value ${attribute.id}`);
      }
      assertU32Aligned(`${group.id}.${attribute.id} constant byteOffset`, constantValue.byteOffset);
      return new import_gpgpu.GPUDataEvaluator({
        id: attribute.id,
        type: "uint32",
        size: rowByteLength / 4,
        isConstant: true,
        value: new Uint32Array(
          constantValue.buffer,
          constantValue.byteOffset,
          rowByteLength / Uint32Array.BYTES_PER_ELEMENT
        )
      });
    }
    const buffer = attribute.getBuffer();
    const byteOffset = attribute.byteOffset;
    const stride = attribute.getAccessor().stride || rowByteLength;
    assertU32Aligned(`${group.id}.${attribute.id} byteOffset`, byteOffset);
    assertU32Aligned(`${group.id}.${attribute.id} stride`, stride);
    if (!buffer) {
      throw new Error(
        `Attribute group ${group.id} cannot interleave missing buffer ${attribute.id}`
      );
    }
    return new import_gpgpu.GPUDataEvaluator({
      id: attribute.id,
      type: "uint32",
      size: rowByteLength / 4,
      offset: byteOffset,
      stride,
      length: group.rowCount,
      buffer
    });
  }
};
function alignTo4(value) {
  return Math.ceil(value / 4) * 4;
}
function assertU32Aligned(label, value) {
  if (value % 4 !== 0) {
    throw new Error(`Attribute buffer groups require 32-bit alignment: ${label}=${value}`);
  }
}

// ../core/src/transitions/gpu-interpolation-transition.ts
var import_engine2 = require("@luma.gl/engine");
var import_shadertools5 = require("@luma.gl/shadertools");

// ../core/src/utils/array-utils.ts
function padArrayChunk(options) {
  const { source: source6, target, start = 0, size, getData } = options;
  const end = options.end || target.length;
  const sourceLength = source6.length;
  const targetLength = end - start;
  if (sourceLength > targetLength) {
    target.set(source6.subarray(0, targetLength), start);
    return;
  }
  target.set(source6, start);
  if (!getData) {
    return;
  }
  let i = sourceLength;
  while (i < targetLength) {
    const datum = getData(i, source6);
    for (let j = 0; j < size; j++) {
      target[start + i] = datum[j] || 0;
      i++;
    }
  }
}
function padArray({
  source: source6,
  target,
  size,
  getData,
  sourceStartIndices,
  targetStartIndices
}) {
  if (!sourceStartIndices || !targetStartIndices) {
    padArrayChunk({
      source: source6,
      target,
      size,
      getData
    });
    return target;
  }
  let sourceIndex = 0;
  let targetIndex = 0;
  const getChunkData = getData && ((i, chunk) => getData(i + targetIndex, chunk));
  const n = Math.min(sourceStartIndices.length, targetStartIndices.length);
  for (let i = 1; i < n; i++) {
    const nextSourceIndex = sourceStartIndices[i] * size;
    const nextTargetIndex = targetStartIndices[i] * size;
    padArrayChunk({
      source: source6.subarray(sourceIndex, nextSourceIndex),
      target,
      start: targetIndex,
      end: nextTargetIndex,
      size,
      getData: getChunkData
    });
    sourceIndex = nextSourceIndex;
    targetIndex = nextTargetIndex;
  }
  if (targetIndex < target.length) {
    padArrayChunk({
      // @ts-ignore
      source: [],
      target,
      start: targetIndex,
      size,
      getData: getChunkData
    });
  }
  return target;
}

// ../core/src/transitions/gpu-transition-utils.ts
function cloneAttribute(attribute) {
  const { device, settings, value } = attribute;
  const newAttribute = new Attribute(device, settings);
  newAttribute.setData({
    value: value instanceof Float64Array ? new Float64Array(0) : new Float32Array(0),
    normalized: settings.normalized
  });
  return newAttribute;
}
function getAttributeTypeFromSize(size) {
  switch (size) {
    case 1:
      return "float";
    case 2:
      return "vec2";
    case 3:
      return "vec3";
    case 4:
      return "vec4";
    default:
      throw new Error(`No defined attribute type for size "${size}"`);
  }
}
function getFloat32VertexFormat(size) {
  switch (size) {
    case 1:
      return "float32";
    case 2:
      return "float32x2";
    case 3:
      return "float32x3";
    case 4:
      return "float32x4";
    default:
      throw new Error("invalid type size");
  }
}
function cycleBuffers(buffers) {
  buffers.push(buffers.shift());
}
function getAttributeBufferLength(attribute, numInstances) {
  const { settings, value, size } = attribute;
  const multiplier = attribute.isDoublePrecisionBuffer ? 2 : 1;
  let maxVertexOffset = 0;
  const { shaderAttributes } = attribute.settings;
  if (shaderAttributes) {
    for (const shaderAttribute of Object.values(shaderAttributes)) {
      maxVertexOffset = Math.max(maxVertexOffset, shaderAttribute.vertexOffset ?? 0);
    }
  }
  return (settings.noAlloc ? value.length : (numInstances + maxVertexOffset) * size) * multiplier;
}
function matchBuffer({
  device,
  source: source6,
  target
}) {
  if (!target || target.byteLength < source6.byteLength) {
    target == null ? void 0 : target.destroy();
    target = device.createBuffer({
      byteLength: source6.byteLength,
      usage: source6.usage
    });
  }
  return target;
}
function padBuffer({
  device,
  buffer,
  attribute,
  fromLength,
  toLength,
  fromStartIndices,
  getData = (x) => x
}) {
  const precisionMultiplier = attribute.isDoublePrecisionBuffer ? 2 : 1;
  const size = attribute.size * precisionMultiplier;
  const byteOffset = attribute.byteOffset;
  const targetByteOffset = attribute.settings.bytesPerElement < 4 ? byteOffset / attribute.settings.bytesPerElement * 4 : byteOffset;
  const toStartIndices = attribute.startIndices;
  const hasStartIndices = fromStartIndices && toStartIndices;
  const isConstant = attribute.isConstant;
  if (!hasStartIndices && buffer && fromLength >= toLength) {
    return buffer;
  }
  const ArrayType = attribute.value instanceof Float64Array ? Float32Array : attribute.value.constructor;
  const toData = isConstant ? attribute.value : (
    // TODO(v9.1): Avoid non-portable synchronous reads.
    new ArrayType(
      attribute.getBuffer().readSyncWebGL(byteOffset, toLength * ArrayType.BYTES_PER_ELEMENT).buffer
    )
  );
  if (attribute.settings.normalized && !isConstant) {
    const getter = getData;
    getData = (value, chunk) => attribute.normalizeConstant(getter(value, chunk));
  }
  const getMissingData = isConstant ? (i, chunk) => getData(toData, chunk) : (i, chunk) => getData(toData.subarray(i + byteOffset, i + byteOffset + size), chunk);
  const source6 = buffer ? new Float32Array(buffer.readSyncWebGL(targetByteOffset, fromLength * 4).buffer) : new Float32Array(0);
  const target = new Float32Array(toLength);
  padArray({
    source: source6,
    target,
    sourceStartIndices: fromStartIndices,
    targetStartIndices: toStartIndices,
    size,
    getData: getMissingData
  });
  if (!buffer || buffer.byteLength < target.byteLength + targetByteOffset) {
    buffer == null ? void 0 : buffer.destroy();
    buffer = device.createBuffer({
      byteLength: target.byteLength + targetByteOffset,
      usage: GLEnum.DYNAMIC_COPY
    });
  }
  buffer.write(target, targetByteOffset);
  return buffer;
}

// ../core/src/transitions/gpu-transition.ts
var GPUTransitionBase = class {
  constructor({
    device,
    attribute,
    timeline
  }) {
    this.buffers = [];
    /** The vertex count of the last buffer.
     * Buffer may be larger than the actual length we want to use
     * because we only reallocate buffers when they grow, not when they shrink,
     * due to performance costs */
    this.currentLength = 0;
    this.device = device;
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    this.attributeInTransition = cloneAttribute(attribute);
    this.currentStartIndices = attribute.startIndices;
  }
  get inProgress() {
    return this.transition.inProgress;
  }
  start(transitionSettings, numInstances, duration = Infinity) {
    this.settings = transitionSettings;
    this.currentStartIndices = this.attribute.startIndices;
    this.currentLength = getAttributeBufferLength(this.attribute, numInstances);
    this.transition.start({ ...transitionSettings, duration });
  }
  update() {
    const updated = this.transition.update();
    if (updated) {
      this.onUpdate();
    }
    return updated;
  }
  setBuffer(buffer) {
    const { stride } = this.attributeInTransition.getAccessor();
    this.attributeInTransition.setData({
      buffer,
      normalized: this.attribute.settings.normalized,
      // Retain placeholder value to generate correct shader layout
      value: this.attributeInTransition.value,
      // A WebGPU Float32-backed fp64 transition still stores interleaved high/low tuples.
      stride
    });
  }
  cancel() {
    this.transition.cancel();
  }
  delete() {
    this.cancel();
    for (const buffer of this.buffers) {
      buffer.destroy();
    }
    this.buffers.length = 0;
  }
};

// ../core/src/transitions/gpu-interpolation-transition.ts
var GPUInterpolationTransition = class extends GPUTransitionBase {
  constructor({
    device,
    attribute,
    timeline
  }) {
    super({ device, attribute, timeline });
    this.type = "interpolation";
    this.transform = getTransform(device, attribute);
  }
  start(transitionSettings, numInstances) {
    const prevLength = this.currentLength;
    const prevStartIndices = this.currentStartIndices;
    super.start(transitionSettings, numInstances, transitionSettings.duration);
    if (transitionSettings.duration <= 0) {
      this.transition.cancel();
      return;
    }
    const { buffers, attribute } = this;
    cycleBuffers(buffers);
    buffers[0] = padBuffer({
      device: this.device,
      buffer: buffers[0],
      attribute,
      fromLength: prevLength,
      toLength: this.currentLength,
      fromStartIndices: prevStartIndices,
      getData: transitionSettings.enter
    });
    buffers[1] = matchBuffer({
      device: this.device,
      source: buffers[0],
      target: buffers[1]
    });
    this.setBuffer(buffers[1]);
    const { transform: transform2 } = this;
    const model = transform2.model;
    let vertexCount = Math.floor(this.currentLength / attribute.size);
    if (useFp64(attribute)) {
      vertexCount /= 2;
    }
    model.setVertexCount(vertexCount);
    if (attribute.isConstant) {
      model.setAttributes({ aFrom: buffers[0] });
      model.setConstantAttributes({ aTo: attribute.value });
    } else {
      model.setAttributes({
        aFrom: buffers[0],
        aTo: attribute.getBuffer()
      });
    }
    transform2.transformFeedback.setBuffers({ vCurrent: buffers[1] });
  }
  onUpdate() {
    const { duration, easing } = this.settings;
    const { time } = this.transition;
    let t = time / duration;
    if (easing) {
      t = easing(t);
    }
    const { model } = this.transform;
    const interpolationProps = { time: t };
    model.shaderInputs.setProps({ interpolation: interpolationProps });
    this.transform.run({ discard: true });
  }
  delete() {
    super.delete();
    this.transform.destroy();
  }
};
var uniformBlock = `layout(std140) uniform interpolationUniforms {
  float time;
} interpolation;
`;
var interpolationUniforms = {
  name: "interpolation",
  vs: uniformBlock,
  uniformTypes: {
    time: "f32"
  }
};
var vs3 = `#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`;
var vs64 = `#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aFrom64Low;
in ATTRIBUTE_TYPE aTo;
in ATTRIBUTE_TYPE aTo64Low;
out ATTRIBUTE_TYPE vCurrent;
out ATTRIBUTE_TYPE vCurrent64Low;

vec2 mix_fp64(vec2 a, vec2 b, float x) {
  vec2 range = sub_fp64(b, a);
  return sum_fp64(a, mul_fp64(range, vec2(x, 0.0)));
}

void main(void) {
  for (int i=0; i<ATTRIBUTE_SIZE; i++) {
    vec2 value = mix_fp64(vec2(aFrom[i], aFrom64Low[i]), vec2(aTo[i], aTo64Low[i]), interpolation.time);
    vCurrent[i] = value.x;
    vCurrent64Low[i] = value.y;
  }
  gl_Position = vec4(0.0);
}
`;
function useFp64(attribute) {
  return attribute.isDoublePrecisionBuffer;
}
function getTransform(device, attribute) {
  const attributeSize = attribute.size;
  const attributeType = getAttributeTypeFromSize(attributeSize);
  const inputFormat = getFloat32VertexFormat(attributeSize);
  const bufferLayout = attribute.getBufferLayout();
  if (useFp64(attribute)) {
    return new import_engine2.BufferTransform(device, {
      vs: vs64,
      bufferLayout: [
        {
          name: "aFrom",
          byteStride: 8 * attributeSize,
          attributes: [
            { attribute: "aFrom", format: inputFormat, byteOffset: 0 },
            { attribute: "aFrom64Low", format: inputFormat, byteOffset: 4 * attributeSize }
          ]
        },
        {
          name: "aTo",
          byteStride: 8 * attributeSize,
          attributes: [
            { attribute: "aTo", format: inputFormat, byteOffset: 0 },
            { attribute: "aTo64Low", format: inputFormat, byteOffset: 4 * attributeSize }
          ]
        }
      ],
      modules: [import_shadertools5.fp64arithmetic, interpolationUniforms],
      defines: {
        // @ts-expect-error TODO fix luma type
        ATTRIBUTE_TYPE: attributeType,
        ATTRIBUTE_SIZE: attributeSize
      },
      // Default uniforms are not set without this
      moduleSettings: {},
      varyings: ["vCurrent", "vCurrent64Low"],
      bufferMode: GLEnum.INTERLEAVED_ATTRIBS,
      disableWarnings: true
    });
  }
  return new import_engine2.BufferTransform(device, {
    vs: vs3,
    bufferLayout: [
      { name: "aFrom", format: inputFormat },
      { name: "aTo", format: bufferLayout.attributes[0].format }
    ],
    modules: [interpolationUniforms],
    defines: {
      // @ts-expect-error TODO fix luma type
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ["vCurrent"],
    // TODO investigate why this is needed
    disableWarnings: true
  });
}

// ../core/src/transitions/gpu-spring-transition.ts
var import_engine3 = require("@luma.gl/engine");
var GPUSpringTransition = class extends GPUTransitionBase {
  constructor({
    device,
    attribute,
    timeline
  }) {
    super({ device, attribute, timeline });
    this.type = "spring";
    this.texture = getTexture(device);
    this.framebuffer = getFramebuffer(device, this.texture);
    this.transform = getTransform2(device, attribute);
  }
  start(transitionSettings, numInstances) {
    const prevLength = this.currentLength;
    const prevStartIndices = this.currentStartIndices;
    super.start(transitionSettings, numInstances);
    const { buffers, attribute } = this;
    for (let i = 0; i < 2; i++) {
      buffers[i] = padBuffer({
        device: this.device,
        buffer: buffers[i],
        attribute,
        fromLength: prevLength,
        toLength: this.currentLength,
        fromStartIndices: prevStartIndices,
        getData: transitionSettings.enter
      });
    }
    buffers[2] = matchBuffer({
      device: this.device,
      source: buffers[0],
      target: buffers[2]
    });
    this.setBuffer(buffers[1]);
    const { model } = this.transform;
    model.setVertexCount(Math.floor(this.currentLength / attribute.size));
    if (attribute.isConstant) {
      model.setConstantAttributes({ aTo: attribute.value });
    } else {
      model.setAttributes({ aTo: attribute.getBuffer() });
    }
  }
  onUpdate() {
    const { buffers, transform: transform2, framebuffer, transition } = this;
    const settings = this.settings;
    transform2.model.setAttributes({
      aPrev: buffers[0],
      aCur: buffers[1]
    });
    transform2.transformFeedback.setBuffers({ vNext: buffers[2] });
    const springProps = {
      stiffness: settings.stiffness,
      damping: settings.damping
    };
    transform2.model.shaderInputs.setProps({ spring: springProps });
    transform2.run({
      framebuffer,
      discard: false,
      parameters: { viewport: [0, 0, 1, 1] },
      clearColor: [0, 0, 0, 0]
    });
    cycleBuffers(buffers);
    this.setBuffer(buffers[1]);
    const isTransitioning = this.device.readPixelsToArrayWebGL(framebuffer)[0] > 0;
    if (!isTransitioning) {
      transition.end();
    }
  }
  delete() {
    super.delete();
    this.transform.destroy();
    this.texture.destroy();
    this.framebuffer.destroy();
  }
};
var uniformBlock2 = `layout(std140) uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`;
var springUniforms = {
  name: "spring",
  vs: uniformBlock2,
  uniformTypes: {
    damping: "f32",
    stiffness: "f32"
  }
};
var vs4 = `#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE force = delta * spring.stiffness;
  ATTRIBUTE_TYPE resistance = velocity * spring.damping;
  return force - resistance + velocity + cur;
}

void main(void) {
  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;
  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;

  vNext = getNextValue(aCur, aPrev, aTo);
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 100.0;
}
`;
var fs2 = `#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;
function getTransform2(device, attribute) {
  const attributeType = getAttributeTypeFromSize(attribute.size);
  const format = getFloat32VertexFormat(attribute.size);
  return new import_engine3.BufferTransform(device, {
    vs: vs4,
    fs: fs2,
    bufferLayout: [
      { name: "aPrev", format },
      { name: "aCur", format },
      { name: "aTo", format: attribute.getBufferLayout().attributes[0].format }
    ],
    varyings: ["vNext"],
    modules: [springUniforms],
    // @ts-expect-error TODO fix luma type
    defines: { ATTRIBUTE_TYPE: attributeType },
    parameters: {
      depthCompare: "always",
      blendColorOperation: "max",
      blendColorSrcFactor: "one",
      blendColorDstFactor: "one",
      blendAlphaOperation: "max",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one"
    }
  });
}
function getTexture(device) {
  return device.createTexture({
    data: new Uint8Array(4),
    format: "rgba8unorm",
    width: 1,
    height: 1
  });
}
function getFramebuffer(device, texture) {
  return device.createFramebuffer({
    id: "spring-transition-is-transitioning-framebuffer",
    width: 1,
    height: 1,
    colorAttachments: [texture]
  });
}

// ../core/src/lib/attribute/attribute-transition-manager.ts
var TRANSITION_TYPES = {
  interpolation: GPUInterpolationTransition,
  spring: GPUSpringTransition
};
var AttributeTransitionManager = class {
  constructor(device, {
    id,
    timeline
  }) {
    if (!device) throw new Error("AttributeTransitionManager is constructed without device");
    this.id = id;
    this.device = device;
    this.timeline = timeline;
    this.transitions = {};
    this.needsRedraw = false;
    this.numInstances = 1;
  }
  finalize() {
    for (const attributeName in this.transitions) {
      this._removeTransition(attributeName);
    }
  }
  /* Public methods */
  // Called when attribute manager updates
  // Check the latest attributes for updates.
  update({
    attributes,
    transitions,
    numInstances
  }) {
    this.numInstances = numInstances || 1;
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const settings = attribute.getTransitionSetting(transitions);
      if (!settings) continue;
      this._updateAttribute(attributeName, attribute, settings);
    }
    for (const attributeName in this.transitions) {
      const attribute = attributes[attributeName];
      if (!attribute || !attribute.getTransitionSetting(transitions)) {
        this._removeTransition(attributeName);
      }
    }
  }
  // Returns `true` if attribute is transition-enabled
  hasAttribute(attributeName) {
    const transition = this.transitions[attributeName];
    return transition && transition.inProgress;
  }
  // Get all the animated attributes
  getAttributes() {
    const animatedAttributes = {};
    for (const attributeName in this.transitions) {
      const transition = this.transitions[attributeName];
      if (transition.inProgress) {
        animatedAttributes[attributeName] = transition.attributeInTransition;
      }
    }
    return animatedAttributes;
  }
  /* eslint-disable max-statements */
  // Called every render cycle, run transform feedback
  // Returns `true` if anything changes
  run() {
    if (this.numInstances === 0) {
      return false;
    }
    for (const attributeName in this.transitions) {
      const updated = this.transitions[attributeName].update();
      if (updated) {
        this.needsRedraw = true;
      }
    }
    const needsRedraw = this.needsRedraw;
    this.needsRedraw = false;
    return needsRedraw;
  }
  /* eslint-enable max-statements */
  /* Private methods */
  _removeTransition(attributeName) {
    this.transitions[attributeName].delete();
    delete this.transitions[attributeName];
  }
  // Check an attributes for updates
  // Returns a transition object if a new transition is triggered.
  _updateAttribute(attributeName, attribute, settings) {
    const transition = this.transitions[attributeName];
    let isNew = !transition || transition.type !== settings.type;
    if (isNew) {
      if (transition) {
        this._removeTransition(attributeName);
      }
      const TransitionType = TRANSITION_TYPES[settings.type];
      if (TransitionType) {
        this.transitions[attributeName] = new TransitionType({
          attribute,
          timeline: this.timeline,
          device: this.device
        });
      } else {
        log_default.error(`unsupported transition type '${settings.type}'`)();
        isNew = false;
      }
    }
    if (isNew || attribute.needsRedraw()) {
      this.needsRedraw = true;
      this.transitions[attributeName].start(settings, this.numInstances);
    }
  }
};

// ../core/src/lib/attribute/attribute-manager.ts
var TRACE_INVALIDATE = "attributeManager.invalidate";
var TRACE_UPDATE_START = "attributeManager.updateStart";
var TRACE_UPDATE_END = "attributeManager.updateEnd";
var TRACE_ATTRIBUTE_UPDATE_START = "attribute.updateStart";
var TRACE_ATTRIBUTE_ALLOCATE = "attribute.allocate";
var TRACE_ATTRIBUTE_UPDATE_END = "attribute.updateEnd";
var AttributeManager = class {
  constructor(device, {
    id = "attribute-manager",
    stats,
    timeline
  } = {}) {
    this.mergeBoundsMemoized = memoize(mergeBounds);
    this.id = id;
    this.device = device;
    this.attributes = {};
    this.updateTriggers = {};
    this.needsRedraw = true;
    this.userData = {};
    this.stats = stats;
    this.attributeTransitionManager = new AttributeTransitionManager(device, {
      id: `${id}-transitions`,
      timeline
    });
    this.attributeBufferGroups = device.type === "webgpu" ? new AttributeBufferGroups(device, {
      id,
      isTransitionAttribute: (attributeName) => this.attributeTransitionManager.hasAttribute(attributeName)
    }) : null;
    Object.seal(this);
  }
  finalize() {
    var _a;
    (_a = this.attributeBufferGroups) == null ? void 0 : _a.finalize();
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].delete();
    }
    this.attributeTransitionManager.finalize();
  }
  // Returns the redraw flag, optionally clearing it.
  // Redraw flag will be set if any attributes attributes changed since
  // flag was last cleared.
  //
  // @param {String} [clearRedrawFlags=false] - whether to clear the flag
  // @return {false|String} - reason a redraw is needed.
  getNeedsRedraw(opts = { clearRedrawFlags: false }) {
    const redraw = this.needsRedraw;
    this.needsRedraw = this.needsRedraw && !opts.clearRedrawFlags;
    return redraw && this.id;
  }
  // Sets the redraw flag.
  // @param {Boolean} redraw=true
  setNeedsRedraw() {
    this.needsRedraw = true;
  }
  // Adds attributes
  add(attributes) {
    this._add(attributes);
  }
  // Adds attributes
  addInstanced(attributes) {
    this._add(attributes, { stepMode: "instance" });
  }
  /**
   * Removes attributes
   * Takes an array of attribute names and delete them from
   * the attribute map if they exists
   *
   * @example
   * attributeManager.remove(['position']);
   *
   * @param {Object} attributeNameArray - attribute name array (see above)
   */
  remove(attributeNameArray) {
    for (const name of attributeNameArray) {
      if (this.attributes[name] !== void 0) {
        this.attributes[name].delete();
        delete this.attributes[name];
      }
    }
  }
  // Marks an attribute for update
  invalidate(triggerName, dataRange) {
    const invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);
    debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
  }
  invalidateAll(dataRange) {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
    }
    debug(TRACE_INVALIDATE, this, "all");
  }
  // Ensure all attribute buffers are updated from props or data.
  // eslint-disable-next-line complexity
  update({
    data,
    numInstances,
    startIndices = null,
    transitions,
    props = {},
    buffers = {},
    context = {}
  }) {
    let updated = false;
    debug(TRACE_UPDATE_START, this);
    if (this.stats) {
      this.stats.get("Update Attributes").timeStart();
    }
    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      const accessorName = attribute.settings.accessor;
      attribute.startIndices = startIndices;
      attribute.numInstances = numInstances;
      if (props[attributeName]) {
        log_default.removed(`props.${attributeName}`, `data.attributes.${attributeName}`)();
      }
      if (attribute.setExternalBuffer(buffers[attributeName])) {
      } else if (attribute.setBinaryValue(
        typeof accessorName === "string" ? buffers[accessorName] : void 0,
        data.startIndices
      )) {
      } else if (typeof accessorName === "string" && !buffers[accessorName] && attribute.setConstantValue(context, props[accessorName])) {
      } else if (attribute.needsUpdate()) {
        updated = true;
        this._updateAttribute({
          attribute,
          numInstances,
          data,
          props,
          context
        });
      }
      this.needsRedraw = this.needsRedraw || attribute.needsRedraw();
    }
    if (updated) {
      debug(TRACE_UPDATE_END, this, numInstances);
    }
    if (this.stats) {
      this.stats.get("Update Attributes").timeEnd();
      if (updated) this.stats.get("Attributes updated").incrementCount();
    }
    this.attributeTransitionManager.update({
      attributes: this.attributes,
      numInstances,
      transitions
    });
  }
  // Update attribute transition to the current timestamp
  // Returns `true` if any transition is in progress
  updateTransition() {
    const { attributeTransitionManager } = this;
    const transitionUpdated = attributeTransitionManager.run();
    this.needsRedraw = this.needsRedraw || transitionUpdated;
    return transitionUpdated;
  }
  /**
   * Returns all attribute descriptors
   * Note: Format matches luma.gl Model/Program.setAttributes()
   * @return {Object} attributes - descriptors
   */
  getAttributes() {
    return { ...this.attributes, ...this.attributeTransitionManager.getAttributes() };
  }
  /**
   * Computes the spatial bounds of a given set of attributes
   */
  getBounds(attributeNames) {
    const bounds = attributeNames.map((attributeName) => {
      var _a;
      return (_a = this.attributes[attributeName]) == null ? void 0 : _a.getBounds();
    });
    return this.mergeBoundsMemoized(bounds);
  }
  /**
   * Returns changed attribute descriptors
   * This indicates which WebGLBuffers need to be updated
   * @return {Object} attributes - descriptors
   */
  getChangedAttributes(opts = { clearChangedFlags: false }) {
    const { attributes, attributeTransitionManager } = this;
    const changedAttributes = { ...attributeTransitionManager.getAttributes() };
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
        changedAttributes[attributeName] = attribute;
      }
    }
    return changedAttributes;
  }
  /** Generate WebGPU-style buffer layout descriptors from all attributes */
  getBufferLayouts(modelInfo) {
    if (this.hasBufferGroups()) {
      return this.attributeBufferGroups.getBufferLayouts(this.getAttributes(), modelInfo);
    }
    return Object.values(this.getAttributes()).map(
      (attribute) => attribute.getBufferLayout(modelInfo)
    );
  }
  /** @internal Returns whether this WebGPU manager has explicitly grouped attributes. */
  hasBufferGroups() {
    var _a;
    return Boolean((_a = this.attributeBufferGroups) == null ? void 0 : _a.hasGroups(this.attributes));
  }
  /**
   * @internal Resolves runtime layouts and additional shared buffers for a grouped WebGPU model.
   */
  getBufferGroupBindings(changedAttributes, modelInfo, excludeAttributes = {}) {
    if (!this.attributeBufferGroups) {
      return {
        bufferLayouts: this.getBufferLayouts(modelInfo),
        buffers: {},
        groupedAttributeIds: /* @__PURE__ */ new Set()
      };
    }
    return this.attributeBufferGroups.getBindings(
      this.getAttributes(),
      changedAttributes,
      modelInfo,
      excludeAttributes
    );
  }
  // PRIVATE METHODS
  /** Register new attributes */
  _add(attributes, overrideOptions) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const props = {
        ...attribute,
        id: attributeName,
        size: attribute.isIndexed && 1 || attribute.size || 1,
        ...overrideOptions
      };
      this.attributes[attributeName] = new Attribute(this.device, props);
    }
    this._mapUpdateTriggersToAttributes();
  }
  // build updateTrigger name to attribute name mapping
  _mapUpdateTriggersToAttributes() {
    const triggers = {};
    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      attribute.getUpdateTriggers().forEach((triggerName) => {
        if (!triggers[triggerName]) {
          triggers[triggerName] = [];
        }
        triggers[triggerName].push(attributeName);
      });
    }
    this.updateTriggers = triggers;
  }
  _invalidateTrigger(triggerName, dataRange) {
    const { attributes, updateTriggers } = this;
    const invalidatedAttributes = updateTriggers[triggerName];
    if (invalidatedAttributes) {
      invalidatedAttributes.forEach((name) => {
        const attribute = attributes[name];
        if (attribute) {
          attribute.setNeedsUpdate(attribute.id, dataRange);
        }
      });
    }
    return invalidatedAttributes;
  }
  _updateAttribute(opts) {
    const { attribute, numInstances } = opts;
    debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);
    if (attribute.constant) {
      attribute.setConstantValue(opts.context, attribute.value);
      return;
    }
    if (attribute.allocate(numInstances)) {
      debug(TRACE_ATTRIBUTE_ALLOCATE, attribute, numInstances);
    }
    const updated = attribute.updateBuffer(opts);
    if (updated) {
      this.needsRedraw = true;
      debug(TRACE_ATTRIBUTE_UPDATE_END, attribute, numInstances);
    }
  }
};

// ../core/src/lib/layer.ts
var import_core12 = require("@luma.gl/core");
var import_webgl = require("@luma.gl/webgl");

// ../core/src/transitions/cpu-interpolation-transition.ts
var import_core10 = require("@math.gl/core");
var CPUInterpolationTransition = class extends Transition {
  get value() {
    return this._value;
  }
  _onUpdate() {
    const {
      time,
      settings: { fromValue, toValue, duration, easing }
    } = this;
    const t = easing(time / duration);
    this._value = (0, import_core10.lerp)(fromValue, toValue, t);
  }
};

// ../core/src/transitions/cpu-spring-transition.ts
var EPSILON = 1e-5;
function updateSpringElement(prev, cur, dest, damping, stiffness) {
  const velocity = cur - prev;
  const delta = dest - cur;
  const spring = delta * stiffness;
  const damper = -velocity * damping;
  return spring + damper + velocity + cur;
}
function updateSpring(prev, cur, dest, damping, stiffness) {
  if (Array.isArray(dest)) {
    const next = [];
    for (let i = 0; i < dest.length; i++) {
      next[i] = updateSpringElement(prev[i], cur[i], dest[i], damping, stiffness);
    }
    return next;
  }
  return updateSpringElement(prev, cur, dest, damping, stiffness);
}
function distance(value1, value2) {
  if (Array.isArray(value1)) {
    let distanceSquare = 0;
    for (let i = 0; i < value1.length; i++) {
      const d = value1[i] - value2[i];
      distanceSquare += d * d;
    }
    return Math.sqrt(distanceSquare);
  }
  return Math.abs(value1 - value2);
}
var CPUSpringTransition = class extends Transition {
  get value() {
    return this._currValue;
  }
  _onUpdate() {
    const { fromValue, toValue, damping, stiffness } = this.settings;
    const { _prevValue = fromValue, _currValue = fromValue } = this;
    let nextValue = updateSpring(_prevValue, _currValue, toValue, damping, stiffness);
    const delta = distance(nextValue, toValue);
    const velocity = distance(nextValue, _currValue);
    if (delta < EPSILON && velocity < EPSILON) {
      nextValue = toValue;
      this.end();
    }
    this._prevValue = _currValue;
    this._currValue = nextValue;
  }
};

// ../core/src/lib/uniform-transition-manager.ts
var TRANSITION_TYPES2 = {
  interpolation: CPUInterpolationTransition,
  spring: CPUSpringTransition
};
var UniformTransitionManager = class {
  constructor(timeline) {
    this.transitions = /* @__PURE__ */ new Map();
    this.timeline = timeline;
  }
  get active() {
    return this.transitions.size > 0;
  }
  add(key, fromValue, toValue, settings) {
    const { transitions } = this;
    if (transitions.has(key)) {
      const transition2 = transitions.get(key);
      const { value = transition2.settings.fromValue } = transition2;
      fromValue = value;
      this.remove(key);
    }
    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }
    const TransitionType = TRANSITION_TYPES2[settings.type];
    if (!TransitionType) {
      log_default.error(`unsupported transition type '${settings.type}'`)();
      return;
    }
    const transition = new TransitionType(this.timeline);
    transition.start({
      ...settings,
      fromValue,
      toValue
    });
    transitions.set(key, transition);
  }
  remove(key) {
    const { transitions } = this;
    if (transitions.has(key)) {
      transitions.get(key).cancel();
      transitions.delete(key);
    }
  }
  update() {
    const propsInTransition = {};
    for (const [key, transition] of this.transitions) {
      transition.update();
      propsInTransition[key] = transition.value;
      if (!transition.inProgress) {
        this.remove(key);
      }
    }
    return propsInTransition;
  }
  clear() {
    for (const key of this.transitions.keys()) {
      this.remove(key);
    }
  }
};

// ../core/src/lifecycle/props.ts
function validateProps(props) {
  const propTypes = props[PROP_TYPES_SYMBOL];
  for (const propName in propTypes) {
    const propType = propTypes[propName];
    const { validate: validate2 } = propType;
    if (validate2 && !validate2(props[propName], propType)) {
      throw new Error(`Invalid prop ${propName}: ${props[propName]}`);
    }
  }
}
function diffProps(props, oldProps) {
  const propsChangedReason = compareProps({
    newProps: props,
    oldProps,
    propTypes: props[PROP_TYPES_SYMBOL],
    ignoreProps: { data: null, updateTriggers: null, extensions: null, transitions: null }
  });
  const dataChangedReason = diffDataProps(props, oldProps);
  let updateTriggersChangedReason = false;
  if (!dataChangedReason) {
    updateTriggersChangedReason = diffUpdateTriggers(props, oldProps);
  }
  return {
    dataChanged: dataChangedReason,
    propsChanged: propsChangedReason,
    updateTriggersChanged: updateTriggersChangedReason,
    extensionsChanged: diffExtensions(props, oldProps),
    transitionsChanged: diffTransitions(props, oldProps)
  };
}
function diffTransitions(props, oldProps) {
  if (!props.transitions) {
    return false;
  }
  const result = {};
  const propTypes = props[PROP_TYPES_SYMBOL];
  let changed = false;
  for (const key in props.transitions) {
    const propType = propTypes[key];
    const type = propType && propType.type;
    const isTransitionable = type === "number" || type === "color" || type === "array";
    if (isTransitionable && comparePropValues(props[key], oldProps[key], propType)) {
      result[key] = true;
      changed = true;
    }
  }
  return changed ? result : false;
}
function compareProps({
  newProps,
  oldProps,
  ignoreProps = {},
  propTypes = {},
  triggerName = "props"
}) {
  if (oldProps === newProps) {
    return false;
  }
  if (typeof newProps !== "object" || newProps === null) {
    return `${triggerName} changed shallowly`;
  }
  if (typeof oldProps !== "object" || oldProps === null) {
    return `${triggerName} changed shallowly`;
  }
  for (const key of Object.keys(newProps)) {
    if (!(key in ignoreProps)) {
      if (!(key in oldProps)) {
        return `${triggerName}.${key} added`;
      }
      const changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);
      if (changed) {
        return `${triggerName}.${key} ${changed}`;
      }
    }
  }
  for (const key of Object.keys(oldProps)) {
    if (!(key in ignoreProps)) {
      if (!(key in newProps)) {
        return `${triggerName}.${key} dropped`;
      }
      if (!Object.hasOwnProperty.call(newProps, key)) {
        const changed = comparePropValues(newProps[key], oldProps[key], propTypes[key]);
        if (changed) {
          return `${triggerName}.${key} ${changed}`;
        }
      }
    }
  }
  return false;
}
function comparePropValues(newProp, oldProp, propType) {
  let equal = propType && propType.equal;
  if (equal && !equal(newProp, oldProp, propType)) {
    return "changed deeply";
  }
  if (!equal) {
    equal = newProp && oldProp && newProp.equals;
    if (equal && !equal.call(newProp, oldProp)) {
      return "changed deeply";
    }
  }
  if (!equal && oldProp !== newProp) {
    return "changed shallowly";
  }
  return null;
}
function diffDataProps(props, oldProps) {
  if (oldProps === null) {
    return "oldProps is null, initial diff";
  }
  let dataChanged = false;
  const { dataComparator, _dataDiff } = props;
  if (dataComparator) {
    if (!dataComparator(props.data, oldProps.data)) {
      dataChanged = "Data comparator detected a change";
    }
  } else if (props.data !== oldProps.data) {
    dataChanged = "A new data container was supplied";
  }
  if (dataChanged && _dataDiff) {
    dataChanged = _dataDiff(props.data, oldProps.data) || dataChanged;
  }
  return dataChanged;
}
function diffUpdateTriggers(props, oldProps) {
  if (oldProps === null) {
    return { all: true };
  }
  if ("all" in props.updateTriggers) {
    const diffReason = diffUpdateTrigger(props, oldProps, "all");
    if (diffReason) {
      return { all: true };
    }
  }
  const reason = {};
  let changed = false;
  for (const triggerName in props.updateTriggers) {
    if (triggerName !== "all") {
      const diffReason = diffUpdateTrigger(props, oldProps, triggerName);
      if (diffReason) {
        reason[triggerName] = true;
        changed = true;
      }
    }
  }
  return changed ? reason : false;
}
function diffExtensions(props, oldProps) {
  if (oldProps === null) {
    return true;
  }
  const oldExtensions = oldProps.extensions;
  const { extensions } = props;
  if (extensions === oldExtensions) {
    return false;
  }
  if (!oldExtensions || !extensions) {
    return true;
  }
  if (extensions.length !== oldExtensions.length) {
    return true;
  }
  for (let i = 0; i < extensions.length; i++) {
    if (!extensions[i].equals(oldExtensions[i])) {
      return true;
    }
  }
  return false;
}
function diffUpdateTrigger(props, oldProps, triggerName) {
  let newTriggers = props.updateTriggers[triggerName];
  newTriggers = newTriggers === void 0 || newTriggers === null ? {} : newTriggers;
  let oldTriggers = oldProps.updateTriggers[triggerName];
  oldTriggers = oldTriggers === void 0 || oldTriggers === null ? {} : oldTriggers;
  const diffReason = compareProps({
    oldProps: oldTriggers,
    newProps: newTriggers,
    triggerName
  });
  return diffReason;
}

// ../core/src/utils/count.ts
var ERR_NOT_OBJECT = "count(): argument not an object";
var ERR_NOT_CONTAINER = "count(): argument not a container";
function count(container) {
  if (!isObject(container)) {
    throw new Error(ERR_NOT_OBJECT);
  }
  if (typeof container.count === "function") {
    return container.count();
  }
  if (Number.isFinite(container.size)) {
    return container.size;
  }
  if (Number.isFinite(container.length)) {
    return container.length;
  }
  if (isPlainObject(container)) {
    return Object.keys(container).length;
  }
  throw new Error(ERR_NOT_CONTAINER);
}
function isPlainObject(value) {
  return value !== null && typeof value === "object" && value.constructor === Object;
}
function isObject(value) {
  return value !== null && typeof value === "object";
}

// ../core/src/utils/shader.ts
function mergeShaders(target, source6) {
  if (!source6) {
    return target;
  }
  const result = { ...target, ...source6 };
  if ("defines" in source6) {
    result.defines = { ...target.defines, ...source6.defines };
  }
  if ("modules" in source6) {
    result.modules = (target.modules || []).concat(source6.modules);
    if (source6.modules.some((module2) => module2.name === "project64")) {
      const index = result.modules.findIndex((module2) => module2.name === "project32");
      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }
  if ("inject" in source6) {
    if (!target.inject) {
      result.inject = source6.inject;
    } else {
      const mergedInjection = { ...target.inject };
      for (const key in source6.inject) {
        mergedInjection[key] = (mergedInjection[key] || "") + source6.inject[key];
      }
      result.inject = mergedInjection;
    }
  }
  return result;
}

// ../core/src/utils/texture.ts
var import_core11 = require("@luma.gl/core");
var DEFAULT_TEXTURE_PARAMETERS = {
  minFilter: "linear",
  mipmapFilter: "linear",
  magFilter: "linear",
  addressModeU: "clamp-to-edge",
  addressModeV: "clamp-to-edge"
};
var internalTextures = {};
function createTexture(owner, device, image, sampler) {
  if (image instanceof import_core11.Texture) {
    return image;
  } else if (image.constructor && image.constructor.name !== "Object") {
    image = { data: image };
  }
  let samplerParameters = null;
  if (image.compressed) {
    samplerParameters = {
      minFilter: "linear",
      mipmapFilter: image.data.length > 1 ? "nearest" : "linear"
    };
  }
  const { width, height } = image.data;
  const texture = device.createTexture({
    ...image,
    sampler: {
      ...DEFAULT_TEXTURE_PARAMETERS,
      ...samplerParameters,
      ...sampler
    },
    mipLevels: device.getMipLevelCount(width, height)
  });
  if (device.type === "webgl") {
    texture.generateMipmapsWebGL();
  } else if (device.type === "webgpu") {
    device.generateMipmapsWebGPU(texture);
  }
  internalTextures[texture.id] = owner;
  return texture;
}
function destroyTexture(owner, texture) {
  if (!texture || !(texture instanceof import_core11.Texture)) {
    return;
  }
  if (internalTextures[texture.id] === owner) {
    texture.delete();
    delete internalTextures[texture.id];
  }
}

// ../core/src/lifecycle/prop-types.ts
var TYPE_DEFINITIONS = {
  boolean: {
    validate(value, propType) {
      return true;
    },
    equal(value1, value2, propType) {
      return Boolean(value1) === Boolean(value2);
    }
  },
  number: {
    validate(value, propType) {
      return Number.isFinite(value) && (!("max" in propType) || value <= propType.max) && (!("min" in propType) || value >= propType.min);
    }
  },
  color: {
    validate(value, propType) {
      return propType.optional && !value || isArray(value) && (value.length === 3 || value.length === 4);
    },
    equal(value1, value2, propType) {
      return deepEqual(value1, value2, 1);
    }
  },
  accessor: {
    validate(value, propType) {
      const valueType = getTypeOf(value);
      return valueType === "function" || valueType === getTypeOf(propType.value);
    },
    equal(value1, value2, propType) {
      if (typeof value2 === "function") {
        return true;
      }
      return deepEqual(value1, value2, 1);
    }
  },
  array: {
    validate(value, propType) {
      return propType.optional && !value || isArray(value);
    },
    equal(value1, value2, propType) {
      const { compare } = propType;
      const depth = Number.isInteger(compare) ? compare : compare ? 1 : 0;
      return compare ? deepEqual(value1, value2, depth) : value1 === value2;
    }
  },
  object: {
    equal(value1, value2, propType) {
      if (propType.ignore) {
        return true;
      }
      const { compare } = propType;
      const depth = Number.isInteger(compare) ? compare : compare ? 1 : 0;
      return compare ? deepEqual(value1, value2, depth) : value1 === value2;
    }
  },
  function: {
    validate(value, propType) {
      return propType.optional && !value || typeof value === "function";
    },
    equal(value1, value2, propType) {
      const shouldIgnore = !propType.compare && propType.ignore !== false;
      return shouldIgnore || value1 === value2;
    }
  },
  data: {
    transform: (value, propType, component) => {
      if (!value) {
        return value;
      }
      const { dataTransform } = component.props;
      if (dataTransform) {
        return dataTransform(value);
      }
      if (typeof value.shape === "string" && value.shape.endsWith("-table") && Array.isArray(value.data)) {
        return value.data;
      }
      return value;
    }
  },
  image: {
    transform: (value, propType, component) => {
      const context = component.context;
      if (!context || !context.device) {
        return null;
      }
      return createTexture(component.id, context.device, value, {
        ...propType.parameters,
        ...component.props.textureParameters
      });
    },
    release: (value, propType, component) => {
      destroyTexture(component.id, value);
    }
  }
};
function parsePropTypes(propDefs) {
  const propTypes = {};
  const defaultProps33 = {};
  const deprecatedProps = {};
  for (const [propName, propDef] of Object.entries(propDefs)) {
    const deprecated = propDef == null ? void 0 : propDef.deprecatedFor;
    if (deprecated) {
      deprecatedProps[propName] = Array.isArray(deprecated) ? deprecated : [deprecated];
    } else {
      const propType = parsePropType(propName, propDef);
      propTypes[propName] = propType;
      defaultProps33[propName] = propType.value;
    }
  }
  return { propTypes, defaultProps: defaultProps33, deprecatedProps };
}
function parsePropType(name, propDef) {
  switch (getTypeOf(propDef)) {
    case "object":
      return normalizePropDefinition(name, propDef);
    case "array":
      return normalizePropDefinition(name, { type: "array", value: propDef, compare: false });
    case "boolean":
      return normalizePropDefinition(name, { type: "boolean", value: propDef });
    case "number":
      return normalizePropDefinition(name, { type: "number", value: propDef });
    case "function":
      return normalizePropDefinition(name, { type: "function", value: propDef, compare: true });
    default:
      return { name, type: "unknown", value: propDef };
  }
}
function normalizePropDefinition(name, propDef) {
  if (!("type" in propDef)) {
    if (!("value" in propDef)) {
      return { name, type: "object", value: propDef };
    }
    return { name, type: getTypeOf(propDef.value), ...propDef };
  }
  return { name, ...TYPE_DEFINITIONS[propDef.type], ...propDef };
}
function isArray(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
function getTypeOf(value) {
  if (isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
}

// ../core/src/lifecycle/create-props.ts
function createProps(component, propObjects) {
  let extensions;
  for (let i = propObjects.length - 1; i >= 0; i--) {
    const props = propObjects[i];
    if ("extensions" in props) {
      extensions = props.extensions;
    }
  }
  const propsPrototype = getPropsPrototype(component.constructor, extensions);
  const propsInstance = Object.create(propsPrototype);
  propsInstance[COMPONENT_SYMBOL] = component;
  propsInstance[ASYNC_ORIGINAL_SYMBOL] = {};
  propsInstance[ASYNC_RESOLVED_SYMBOL] = {};
  for (let i = 0; i < propObjects.length; ++i) {
    const props = propObjects[i];
    for (const key in props) {
      propsInstance[key] = props[key];
    }
  }
  Object.freeze(propsInstance);
  return propsInstance;
}
var MergedDefaultPropsCacheKey = "_mergedDefaultProps";
function getPropsPrototype(componentClass, extensions) {
  if (!(componentClass instanceof Component.constructor)) return {};
  let cacheKey = MergedDefaultPropsCacheKey;
  if (extensions) {
    for (const extension of extensions) {
      const ExtensionClass = extension.constructor;
      if (ExtensionClass) {
        cacheKey += `:${ExtensionClass.extensionName || ExtensionClass.name}`;
      }
    }
  }
  const defaultProps33 = getOwnProperty(componentClass, cacheKey);
  if (!defaultProps33) {
    return componentClass[cacheKey] = createPropsPrototypeAndTypes(
      componentClass,
      extensions || []
    );
  }
  return defaultProps33;
}
function createPropsPrototypeAndTypes(componentClass, extensions) {
  const parent = componentClass.prototype;
  if (!parent) {
    return null;
  }
  const parentClass = Object.getPrototypeOf(componentClass);
  const parentDefaultProps = getPropsPrototype(parentClass);
  const componentDefaultProps = getOwnProperty(componentClass, "defaultProps") || {};
  const componentPropDefs = parsePropTypes(componentDefaultProps);
  const defaultProps33 = Object.assign(
    /* @__PURE__ */ Object.create(null),
    parentDefaultProps,
    componentPropDefs.defaultProps
  );
  const propTypes = Object.assign(
    /* @__PURE__ */ Object.create(null),
    parentDefaultProps == null ? void 0 : parentDefaultProps[PROP_TYPES_SYMBOL],
    componentPropDefs.propTypes
  );
  const deprecatedProps = Object.assign(
    /* @__PURE__ */ Object.create(null),
    parentDefaultProps == null ? void 0 : parentDefaultProps[DEPRECATED_PROPS_SYMBOL],
    componentPropDefs.deprecatedProps
  );
  for (const extension of extensions) {
    const extensionDefaultProps = getPropsPrototype(extension.constructor);
    if (extensionDefaultProps) {
      Object.assign(defaultProps33, extensionDefaultProps);
      Object.assign(propTypes, extensionDefaultProps[PROP_TYPES_SYMBOL]);
      Object.assign(deprecatedProps, extensionDefaultProps[DEPRECATED_PROPS_SYMBOL]);
    }
  }
  createPropsPrototype(defaultProps33, componentClass);
  addAsyncPropsToPropPrototype(defaultProps33, propTypes);
  addDeprecatedPropsToPropPrototype(defaultProps33, deprecatedProps);
  defaultProps33[PROP_TYPES_SYMBOL] = propTypes;
  defaultProps33[DEPRECATED_PROPS_SYMBOL] = deprecatedProps;
  if (extensions.length === 0 && !hasOwnProperty(componentClass, "_propTypes")) {
    componentClass._propTypes = propTypes;
  }
  return defaultProps33;
}
function createPropsPrototype(defaultProps33, componentClass) {
  const id = getComponentName(componentClass);
  Object.defineProperties(defaultProps33, {
    // `id` is treated specially because layer might need to override it
    id: {
      writable: true,
      value: id
    }
  });
}
function addDeprecatedPropsToPropPrototype(defaultProps33, deprecatedProps) {
  for (const propName in deprecatedProps) {
    Object.defineProperty(defaultProps33, propName, {
      enumerable: false,
      set(newValue) {
        const nameStr = `${this.id}: ${propName}`;
        for (const newPropName of deprecatedProps[propName]) {
          if (!hasOwnProperty(this, newPropName)) {
            this[newPropName] = newValue;
          }
        }
        log_default.deprecated(nameStr, deprecatedProps[propName].join("/"))();
      }
    });
  }
}
function addAsyncPropsToPropPrototype(defaultProps33, propTypes) {
  const defaultValues = {};
  const descriptors = {};
  for (const propName in propTypes) {
    const propType = propTypes[propName];
    const { name, value } = propType;
    if (propType.async) {
      defaultValues[name] = value;
      descriptors[name] = getDescriptorForAsyncProp(name);
    }
  }
  defaultProps33[ASYNC_DEFAULTS_SYMBOL] = defaultValues;
  defaultProps33[ASYNC_ORIGINAL_SYMBOL] = {};
  Object.defineProperties(defaultProps33, descriptors);
}
function getDescriptorForAsyncProp(name) {
  return {
    enumerable: true,
    // Save the provided value for async props in a special map
    set(newValue) {
      if (typeof newValue === "string" || newValue instanceof Promise || isAsyncIterable(newValue)) {
        this[ASYNC_ORIGINAL_SYMBOL][name] = newValue;
      } else {
        this[ASYNC_RESOLVED_SYMBOL][name] = newValue;
      }
    },
    // Only the component's state knows the true value of async prop
    get() {
      if (this[ASYNC_RESOLVED_SYMBOL]) {
        if (name in this[ASYNC_RESOLVED_SYMBOL]) {
          const value = this[ASYNC_RESOLVED_SYMBOL][name];
          return value || this[ASYNC_DEFAULTS_SYMBOL][name];
        }
        if (name in this[ASYNC_ORIGINAL_SYMBOL]) {
          const state = this[COMPONENT_SYMBOL] && this[COMPONENT_SYMBOL].internalState;
          if (state && state.hasAsyncProp(name)) {
            return state.getAsyncProp(name) || this[ASYNC_DEFAULTS_SYMBOL][name];
          }
        }
      }
      return this[ASYNC_DEFAULTS_SYMBOL][name];
    }
  };
}
function hasOwnProperty(object, prop) {
  return Object.prototype.hasOwnProperty.call(object, prop);
}
function getOwnProperty(object, prop) {
  return hasOwnProperty(object, prop) && object[prop];
}
function getComponentName(componentClass) {
  const componentName = componentClass.componentName;
  if (!componentName) {
    log_default.warn(`${componentClass.name}.componentName not specified`)();
  }
  return componentName || componentClass.name;
}

// ../core/src/lifecycle/component.ts
var counter = 0;
var Component = class {
  constructor(...propObjects) {
    this.props = createProps(this, propObjects);
    this.id = this.props.id;
    this.count = counter++;
  }
  // clone this layer with modified props
  clone(newProps) {
    const { props } = this;
    const asyncProps = {};
    for (const key in props[ASYNC_DEFAULTS_SYMBOL]) {
      if (key in props[ASYNC_RESOLVED_SYMBOL]) {
        asyncProps[key] = props[ASYNC_RESOLVED_SYMBOL][key];
      } else if (key in props[ASYNC_ORIGINAL_SYMBOL]) {
        asyncProps[key] = props[ASYNC_ORIGINAL_SYMBOL][key];
      }
    }
    return new this.constructor({ ...props, ...asyncProps, ...newProps });
  }
};
Component.componentName = "Component";
Component.defaultProps = {};

// ../core/src/lifecycle/component-state.ts
var EMPTY_PROPS = Object.freeze({});
var ComponentState = class {
  constructor(component) {
    this.component = component;
    this.asyncProps = {};
    this.onAsyncPropUpdated = () => {
    };
    this.oldProps = null;
    this.oldAsyncProps = null;
  }
  finalize() {
    for (const propName in this.asyncProps) {
      const asyncProp = this.asyncProps[propName];
      if (asyncProp && asyncProp.type && asyncProp.type.release) {
        asyncProp.type.release(
          asyncProp.resolvedValue,
          asyncProp.type,
          this.component
        );
      }
    }
    this.asyncProps = {};
    this.component = null;
    this.resetOldProps();
  }
  /* Layer-facing props API */
  getOldProps() {
    return this.oldAsyncProps || this.oldProps || EMPTY_PROPS;
  }
  resetOldProps() {
    this.oldAsyncProps = null;
    this.oldProps = this.component ? this.component.props : null;
  }
  // Checks if a prop is overridden
  hasAsyncProp(propName) {
    return propName in this.asyncProps;
  }
  // Returns value of an overriden prop
  getAsyncProp(propName) {
    const asyncProp = this.asyncProps[propName];
    return asyncProp && asyncProp.resolvedValue;
  }
  isAsyncPropLoading(propName) {
    if (propName) {
      const asyncProp = this.asyncProps[propName];
      return Boolean(
        asyncProp && asyncProp.pendingLoadCount > 0 && asyncProp.pendingLoadCount !== asyncProp.resolvedLoadCount
      );
    }
    for (const key in this.asyncProps) {
      if (this.isAsyncPropLoading(key)) {
        return true;
      }
    }
    return false;
  }
  // Without changing the original prop value, swap out the data resolution under the hood
  reloadAsyncProp(propName, value) {
    this._watchPromise(propName, Promise.resolve(value));
  }
  // Updates all async/overridden props (when new props come in)
  // Checks if urls have changed, starts loading, or removes override
  setAsyncProps(props) {
    this.component = props[COMPONENT_SYMBOL] || this.component;
    const resolvedValues = props[ASYNC_RESOLVED_SYMBOL] || {};
    const originalValues = props[ASYNC_ORIGINAL_SYMBOL] || props;
    const defaultValues = props[ASYNC_DEFAULTS_SYMBOL] || {};
    for (const propName in resolvedValues) {
      const value = resolvedValues[propName];
      this._createAsyncPropData(propName, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
      resolvedValues[propName] = this.getAsyncProp(propName);
    }
    for (const propName in originalValues) {
      const value = originalValues[propName];
      this._createAsyncPropData(propName, defaultValues[propName]);
      this._updateAsyncProp(propName, value);
    }
  }
  /* Placeholder methods for subclassing */
  _fetch(propName, url) {
    return null;
  }
  _onResolve(propName, value) {
  }
  // eslint-disable-line @typescript-eslint/no-empty-function
  _onError(propName, error) {
  }
  // eslint-disable-line @typescript-eslint/no-empty-function
  // Intercept strings (URLs) and Promises and activates loading and prop rewriting
  _updateAsyncProp(propName, value) {
    if (!this._didAsyncInputValueChange(propName, value)) {
      return;
    }
    if (typeof value === "string") {
      value = this._fetch(propName, value);
    }
    if (value instanceof Promise) {
      this._watchPromise(propName, value);
      return;
    }
    if (isAsyncIterable(value)) {
      this._resolveAsyncIterable(propName, value);
      return;
    }
    this._setPropValue(propName, value);
  }
  // Whenever async props are changing, we need to make a copy of oldProps
  // otherwise the prop rewriting will affect the value both in props and oldProps.
  // While the copy is relatively expensive, this only happens on load completion.
  _freezeAsyncOldProps() {
    if (!this.oldAsyncProps && this.oldProps) {
      this.oldAsyncProps = Object.create(this.oldProps);
      for (const propName in this.asyncProps) {
        Object.defineProperty(this.oldAsyncProps, propName, {
          enumerable: true,
          value: this.oldProps[propName]
        });
      }
    }
  }
  // Checks if an input value actually changed (to avoid reloading/rewatching promises/urls)
  _didAsyncInputValueChange(propName, value) {
    const asyncProp = this.asyncProps[propName];
    if (value === asyncProp.resolvedValue || value === asyncProp.lastValue) {
      return false;
    }
    asyncProp.lastValue = value;
    return true;
  }
  // Set normal, non-async value
  _setPropValue(propName, value) {
    this._freezeAsyncOldProps();
    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      value = this._postProcessValue(asyncProp, value);
      asyncProp.resolvedValue = value;
      asyncProp.pendingLoadCount++;
      asyncProp.resolvedLoadCount = asyncProp.pendingLoadCount;
    }
  }
  // Set a just resolved async value, calling onAsyncPropUpdates if value changes asynchronously
  _setAsyncPropValue(propName, value, loadCount) {
    const asyncProp = this.asyncProps[propName];
    if (asyncProp && loadCount >= asyncProp.resolvedLoadCount && value !== void 0) {
      this._freezeAsyncOldProps();
      asyncProp.resolvedValue = value;
      asyncProp.resolvedLoadCount = loadCount;
      this.onAsyncPropUpdated(propName, value);
    }
  }
  // Tracks a promise, sets the prop when loaded, handles load count
  _watchPromise(propName, promise) {
    const asyncProp = this.asyncProps[propName];
    if (asyncProp) {
      asyncProp.pendingLoadCount++;
      const loadCount = asyncProp.pendingLoadCount;
      promise.then((data) => {
        if (!this.component) {
          return;
        }
        data = this._postProcessValue(asyncProp, data);
        this._setAsyncPropValue(propName, data, loadCount);
        this._onResolve(propName, data);
      }).catch((error) => {
        this._onError(propName, error);
      });
    }
  }
  async _resolveAsyncIterable(propName, iterable) {
    if (propName !== "data") {
      this._setPropValue(propName, iterable);
      return;
    }
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      return;
    }
    asyncProp.pendingLoadCount++;
    const loadCount = asyncProp.pendingLoadCount;
    let data = [];
    let count2 = 0;
    for await (const chunk of iterable) {
      if (!this.component) {
        return;
      }
      const { dataTransform } = this.component.props;
      if (dataTransform) {
        data = dataTransform(chunk, data);
      } else {
        data = data.concat(chunk);
      }
      Object.defineProperty(data, "__diff", {
        enumerable: false,
        value: [{ startRow: count2, endRow: data.length }]
      });
      count2 = data.length;
      this._setAsyncPropValue(propName, data, loadCount);
    }
    this._onResolve(propName, data);
  }
  // Give the app a chance to post process the loaded data
  _postProcessValue(asyncProp, value) {
    const propType = asyncProp.type;
    if (propType && this.component) {
      if (propType.release) {
        propType.release(asyncProp.resolvedValue, propType, this.component);
      }
      if (propType.transform) {
        return propType.transform(value, propType, this.component);
      }
    }
    return value;
  }
  // Creating an asyncProp record if needed
  _createAsyncPropData(propName, defaultValue) {
    const asyncProp = this.asyncProps[propName];
    if (!asyncProp) {
      const propTypes = this.component && this.component.props[PROP_TYPES_SYMBOL];
      this.asyncProps[propName] = {
        type: propTypes && propTypes[propName],
        lastValue: null,
        resolvedValue: defaultValue,
        pendingLoadCount: 0,
        resolvedLoadCount: 0
      };
    }
  }
};

// ../core/src/lib/layer-state.ts
var LayerState = class extends ComponentState {
  constructor({
    attributeManager,
    layer
  }) {
    super(layer);
    this.attributeManager = attributeManager;
    this.needsRedraw = true;
    this.needsUpdate = true;
    this.subLayers = null;
    this.usesPickingColorCache = false;
    this.disabledPickingIndices = [];
  }
  get layer() {
    return this.component;
  }
  /* Override base Component methods with Layer-specific handling */
  _fetch(propName, url) {
    const layer = this.layer;
    const fetch = layer == null ? void 0 : layer.props.fetch;
    if (fetch) {
      return fetch(url, { propName, layer });
    }
    return super._fetch(propName, url);
  }
  _onResolve(propName, value) {
    const layer = this.layer;
    if (layer) {
      const onDataLoad = layer.props.onDataLoad;
      if (propName === "data" && onDataLoad) {
        onDataLoad(value, { propName, layer });
      }
    }
  }
  _onError(propName, error) {
    const layer = this.layer;
    if (layer) {
      layer.raiseError(error, `loading ${propName} of ${this.layer}`);
    }
  }
};

// ../core/src/lib/layer.ts
var import_web_mercator6 = require("@math.gl/web-mercator");
var import_core13 = require("@loaders.gl/core");
var TRACE_CHANGE_FLAG = "layer.changeFlag";
var TRACE_INITIALIZE = "layer.initialize";
var TRACE_UPDATE = "layer.update";
var TRACE_FINALIZE = "layer.finalize";
var TRACE_MATCHED = "layer.matched";
var MAX_PICKING_COLOR_CACHE_SIZE = 2 ** 24 - 1;
var EMPTY_ARRAY2 = Object.freeze([]);
var areViewportsEqual = memoize(
  ({ oldViewport, viewport }) => {
    return oldViewport.equals(viewport);
  }
);
var pickingColorCache = new Uint8ClampedArray(0);
function getPickingAttribute(attributes) {
  return attributes.rowIndexes || attributes.pickingColors || attributes.instancePickingColors;
}
function getPickingIndexAttribute(attributes) {
  return attributes.rowIndexes;
}
function getPickingColorAttribute(attributes) {
  return attributes.pickingColors || attributes.instancePickingColors;
}
var defaultProps = {
  // data: Special handling for null, see below
  data: { type: "data", value: EMPTY_ARRAY2, async: true },
  dataComparator: { type: "function", value: null, optional: true },
  _dataDiff: {
    type: "function",
    // @ts-ignore __diff is not defined on data
    value: (data) => data && data.__diff,
    optional: true
  },
  dataTransform: { type: "function", value: null, optional: true },
  onDataLoad: { type: "function", value: null, optional: true },
  onError: { type: "function", value: null, optional: true },
  fetch: {
    type: "function",
    value: (url, {
      propName,
      layer,
      loaders,
      loadOptions,
      signal
    }) => {
      var _a;
      const { resourceManager } = layer.context;
      loadOptions = loadOptions || layer.getLoadOptions();
      loaders = loaders || layer.props.loaders;
      if (signal) {
        loadOptions = {
          ...loadOptions,
          core: {
            ...loadOptions == null ? void 0 : loadOptions.core,
            fetch: {
              ...(_a = loadOptions == null ? void 0 : loadOptions.core) == null ? void 0 : _a.fetch,
              signal
            }
          }
        };
      }
      let inResourceManager = resourceManager.contains(url);
      if (!inResourceManager && !loadOptions) {
        resourceManager.add({ resourceId: url, data: (0, import_core13.load)(url, loaders), persistent: false });
        inResourceManager = true;
      }
      if (inResourceManager) {
        return resourceManager.subscribe({
          resourceId: url,
          onChange: (data) => {
            var _a2;
            return (_a2 = layer.internalState) == null ? void 0 : _a2.reloadAsyncProp(propName, data);
          },
          consumerId: layer.id,
          requestId: propName
        });
      }
      return (0, import_core13.load)(url, loaders, loadOptions);
    }
  },
  updateTriggers: {},
  // Update triggers: a core change detection mechanism in deck.gl
  visible: true,
  pickable: false,
  opacity: { type: "number", min: 0, max: 1, value: 1 },
  operation: "draw",
  onHover: { type: "function", value: null, optional: true },
  onClick: { type: "function", value: null, optional: true },
  onDragStart: { type: "function", value: null, optional: true },
  onDrag: { type: "function", value: null, optional: true },
  onDragEnd: { type: "function", value: null, optional: true },
  coordinateSystem: "default",
  coordinateOrigin: { type: "array", value: [0, 0, 0], compare: true },
  modelMatrix: { type: "array", value: null, compare: true, optional: true },
  wrapLongitude: false,
  positionFormat: "XYZ",
  colorFormat: "RGBA",
  parameters: { type: "object", value: {}, optional: true, compare: 2 },
  loadOptions: { type: "object", value: null, optional: true, ignore: true },
  transitions: null,
  extensions: [],
  loaders: { type: "array", value: [], optional: true, ignore: true },
  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: {
    type: "function",
    value: ({ layerIndex }) => [0, -layerIndex * 100]
  },
  // Selection/Highlighting
  highlightedObjectIndex: null,
  autoHighlight: false,
  highlightColor: { type: "accessor", value: [0, 0, 128, 128] }
};
var Layer = class extends Component {
  constructor() {
    super(...arguments);
    this.internalState = null;
    this.lifecycle = LIFECYCLE.NO_STATE;
    // Will be set to the shared layer state object during layer matching
    this.parent = null;
  }
  static get componentName() {
    return Object.prototype.hasOwnProperty.call(this, "layerName") ? this.layerName : "";
  }
  get root() {
    let layer = this;
    while (layer.parent) {
      layer = layer.parent;
    }
    return layer;
  }
  toString() {
    const className = this.constructor.layerName || this.constructor.name;
    return `${className}({id: '${this.props.id}'})`;
  }
  // Public API for users
  /** Projects a point with current view state from the current layer's coordinate system to screen */
  project(xyz) {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    const worldPosition = getWorldPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem
    });
    const [x, y, z] = (0, import_web_mercator6.worldToPixels)(worldPosition, viewport.pixelProjectionMatrix);
    return xyz.length === 2 ? [x, y] : [x, y, z];
  }
  /** Unprojects a screen pixel to the current view's default coordinate system
      Note: this does not reverse `project`. */
  unproject(xy) {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    return viewport.unproject(xy);
  }
  /** Projects a point with current view state from the current layer's coordinate system to the world space */
  projectPosition(xyz, params) {
    assert(this.internalState);
    const viewport = this.internalState.viewport || this.context.viewport;
    return projectPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem,
      ...params
    });
  }
  // Public API for custom layer implementation
  /** `true` if this layer renders other layers */
  get isComposite() {
    return false;
  }
  /** `true` if the layer renders to screen */
  get isDrawable() {
    return true;
  }
  /** Updates selected state members and marks the layer for redraw */
  setState(partialState) {
    this.setChangeFlags({ stateChanged: true });
    Object.assign(this.state, partialState);
    this.setNeedsRedraw();
  }
  /** Sets the redraw flag for this layer, will trigger a redraw next animation frame */
  setNeedsRedraw() {
    if (this.internalState) {
      this.internalState.needsRedraw = true;
    }
  }
  /** Mark this layer as needs a deep update */
  setNeedsUpdate() {
    if (this.internalState) {
      this.context.layerManager.setNeedsUpdate(String(this));
      this.internalState.needsUpdate = true;
    }
  }
  /** Returns true if all async resources are loaded */
  get isLoaded() {
    return this.internalState ? !this.internalState.isAsyncPropLoading() : false;
  }
  /** Returns true if using shader-based WGS84 longitude wrapping */
  get wrapLongitude() {
    return this.props.wrapLongitude;
  }
  /** @deprecated Returns true if the layer is visible in the picking pass */
  isPickable() {
    return this.props.pickable && this.props.visible;
  }
  /** Returns an array of models used by this layer, can be overriden by layer subclass */
  getModels() {
    const state = this.state;
    return state && (state.models || state.model && [state.model]) || [];
  }
  /** Update shader input parameters */
  setShaderModuleProps(...props) {
    for (const model of this.getModels()) {
      model.shaderInputs.setProps(...props);
    }
  }
  /** Returns the attribute manager of this layer */
  getAttributeManager() {
    return this.internalState && this.internalState.attributeManager;
  }
  /** Returns the most recent layer that matched to this state
    (When reacting to an async event, this layer may no longer be the latest) */
  getCurrentLayer() {
    return this.internalState && this.internalState.layer;
  }
  /** Returns the default parse options for async props */
  getLoadOptions() {
    return this.props.loadOptions;
  }
  use64bitPositions() {
    const { coordinateSystem } = this.props;
    return coordinateSystem === "default" || coordinateSystem === "lnglat" || coordinateSystem === "cartesian";
  }
  // Event handling
  onHover(info, pickingEvent) {
    if (this.props.onHover) {
      return this.props.onHover(info, pickingEvent) || false;
    }
    return false;
  }
  onClick(info, pickingEvent) {
    if (this.props.onClick) {
      return this.props.onClick(info, pickingEvent) || false;
    }
    return false;
  }
  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  // @return {Array} - a black color
  nullPickingColor() {
    return [0, 0, 0];
  }
  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  encodePickingColor(i, target = []) {
    target[0] = i + 1 & 255;
    target[1] = i + 1 >> 8 & 255;
    target[2] = i + 1 >> 8 >> 8 & 255;
    return target;
  }
  // Returns the index corresponding to a picking color that doesn't match any subfeature
  // @param {Uint8Array} color - color array to be decoded
  // @return {Array} - the decoded picking color
  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }
  /** Deduces number of instances. Intention is to support:
    - Explicit setting of numInstances
    - Auto-deduction for ES6 containers that define a size member
    - Auto-deduction for Classic Arrays via the built-in length attribute
    - Auto-deduction via arrays */
  getNumInstances() {
    if (Number.isFinite(this.props.numInstances)) {
      return this.props.numInstances;
    }
    if (this.state && this.state.numInstances !== void 0) {
      return this.state.numInstances;
    }
    return count(this.props.data);
  }
  /** Buffer layout describes how many attribute values are packed for each data object
      The default (null) is one value each object.
      Some data formats (e.g. paths, polygons) have various length. Their buffer layout
      is in the form of [L0, L1, L2, ...] */
  getStartIndices() {
    if (this.props.startIndices) {
      return this.props.startIndices;
    }
    if (this.state && this.state.startIndices) {
      return this.state.startIndices;
    }
    return null;
  }
  // Default implementation
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds(["positions", "instancePositions"]);
  }
  getShaders(shaders) {
    shaders = mergeShaders(shaders, {
      disableWarnings: true,
      modules: this.context.defaultShaderModules
    });
    for (const extension of this.props.extensions) {
      shaders = mergeShaders(shaders, extension.getShaders.call(this, extension));
    }
    return shaders;
  }
  /** Controls if updateState should be called. By default returns true if any prop has changed */
  shouldUpdateState(params) {
    return params.changeFlags.propsOrDataChanged;
  }
  /** Default implementation, all attributes will be invalidated and updated when data changes */
  // eslint-disable-next-line complexity
  updateState(params) {
    const attributeManager = this.getAttributeManager();
    const { dataChanged } = params.changeFlags;
    if (dataChanged && attributeManager) {
      if (Array.isArray(dataChanged)) {
        for (const dataRange of dataChanged) {
          attributeManager.invalidateAll(dataRange);
        }
      } else {
        attributeManager.invalidateAll();
      }
    }
    if (attributeManager) {
      const { props } = params;
      const hasPickingBuffer = this.internalState.hasPickingBuffer;
      const needsPickingBuffer = Number.isInteger(props.highlightedObjectIndex) || Boolean(props.pickable) || props.extensions.some((extension) => extension.getNeedsPickingBuffer.call(this, extension));
      if (hasPickingBuffer !== needsPickingBuffer) {
        this.internalState.hasPickingBuffer = needsPickingBuffer;
        const pickingAttribute = getPickingAttribute(attributeManager.attributes);
        if (pickingAttribute) {
          if (needsPickingBuffer && pickingAttribute.constant) {
            pickingAttribute.constant = false;
            attributeManager.invalidate(pickingAttribute.id);
          }
          if (!pickingAttribute.value && !needsPickingBuffer) {
            pickingAttribute.constant = true;
            pickingAttribute.value = getPickingIndexAttribute(attributeManager.attributes) ? [PICKING_INVALID_INDEX] : [0, 0, 0];
          }
        }
      }
    }
  }
  /** Called once when layer is no longer matched and state will be discarded. Layers can destroy WebGL resources here. */
  finalizeState(context) {
    for (const model of this.getModels()) {
      model.destroy();
    }
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.finalize();
    }
    if (this.context) {
      this.context.resourceManager.unsubscribe({ consumerId: this.id });
    }
    if (this.internalState) {
      this.internalState.uniformTransitions.clear();
      this.internalState.finalize();
    }
  }
  // If state has a model, draw it with supplied uniforms
  draw(opts) {
    for (const model of this.getModels()) {
      model.draw(opts.renderPass);
    }
  }
  // called to populate the info object that is passed to the event handler
  // @return null to cancel event
  getPickingInfo({ info, mode, sourceLayer }) {
    const { index } = info;
    if (index >= 0) {
      if (Array.isArray(this.props.data)) {
        info.object = this.props.data[index];
      }
    }
    return info;
  }
  // END LIFECYCLE METHODS
  // / INTERNAL METHODS - called by LayerManager, DeckRenderer and DeckPicker
  /** (Internal) Propagate an error event through the system */
  raiseError(error, message) {
    var _a, _b, _c, _d;
    if (message) {
      error = new Error(`${message}: ${error.message}`, { cause: error });
    }
    if (!((_b = (_a = this.props).onError) == null ? void 0 : _b.call(_a, error))) {
      (_d = (_c = this.context) == null ? void 0 : _c.onError) == null ? void 0 : _d.call(_c, error, this);
    }
  }
  /** (Internal) Checks if this layer needs redraw */
  getNeedsRedraw(opts = { clearRedrawFlags: false }) {
    return this._getNeedsRedraw(opts);
  }
  /** (Internal) Checks if this layer needs a deep update */
  needsUpdate() {
    if (!this.internalState) {
      return false;
    }
    return this.internalState.needsUpdate || this.hasUniformTransition() || this.shouldUpdateState(this._getUpdateParams());
  }
  /** Checks if this layer has ongoing uniform transition */
  hasUniformTransition() {
    var _a;
    return ((_a = this.internalState) == null ? void 0 : _a.uniformTransitions.active) || false;
  }
  /** Called when this layer is rendered into the given viewport */
  activateViewport(viewport) {
    if (!this.internalState) {
      return;
    }
    const oldViewport = this.internalState.viewport;
    this.internalState.viewport = viewport;
    if (!oldViewport || !areViewportsEqual({ oldViewport, viewport })) {
      this.setChangeFlags({ viewportChanged: true });
      if (this.isComposite) {
        if (this.needsUpdate()) {
          this.setNeedsUpdate();
        }
      } else {
        this._update();
      }
    }
  }
  /** Default implementation of attribute invalidation, can be redefined */
  invalidateAttribute(name = "all") {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }
    if (name === "all") {
      attributeManager.invalidateAll();
    } else {
      attributeManager.invalidate(name);
    }
  }
  /** Send updated attributes to the WebGL model */
  updateAttributes(changedAttributes) {
    let bufferLayoutChanged = false;
    for (const id in changedAttributes) {
      if (changedAttributes[id].layoutChanged()) {
        bufferLayoutChanged = true;
      }
    }
    for (const model of this.getModels()) {
      this._setModelAttributes(model, changedAttributes, bufferLayoutChanged);
    }
  }
  /** Recalculate any attributes if needed */
  _updateAttributes() {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }
    const props = this.props;
    const numInstances = this.getNumInstances();
    const startIndices = this.getStartIndices();
    attributeManager.update({
      data: props.data,
      numInstances,
      startIndices,
      props,
      transitions: props.transitions,
      // @ts-ignore (TS2339) property attribute is not present on some acceptable data types
      buffers: props.data.attributes,
      context: this
    });
    const changedAttributes = attributeManager.getChangedAttributes({ clearChangedFlags: true });
    this.updateAttributes(changedAttributes);
  }
  /** Update attribute transitions. This is called in drawLayer, no model updates required. */
  _updateAttributeTransition() {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.updateTransition();
    }
  }
  /** Update uniform (prop) transitions. This is called in updateState, may result in model updates. */
  _updateUniformTransition() {
    const { uniformTransitions } = this.internalState;
    if (uniformTransitions.active) {
      const propsInTransition = uniformTransitions.update();
      const props = Object.create(this.props);
      for (const key in propsInTransition) {
        Object.defineProperty(props, key, { value: propsInTransition[key] });
      }
      return props;
    }
    return this.props;
  }
  /** Updater for the automatically populated instancePickingColors attribute */
  calculateInstancePickingColors(attribute, { numInstances }) {
    if (attribute.constant) {
      return;
    }
    const cacheSize = Math.floor(pickingColorCache.length / 4);
    this.internalState.usesPickingColorCache = true;
    const isPickingColorCacheInvalid = numInstances > 0 && pickingColorCache[0] === 0;
    if (cacheSize < numInstances || isPickingColorCacheInvalid) {
      if (numInstances > MAX_PICKING_COLOR_CACHE_SIZE) {
        log_default.warn(
          "Layer has too many data objects. Picking might not be able to distinguish all objects."
        )();
      }
      pickingColorCache = typed_array_manager_default.allocate(pickingColorCache, numInstances, {
        size: 4,
        copy: true,
        maxCount: Math.max(numInstances, MAX_PICKING_COLOR_CACHE_SIZE)
      });
      const newCacheSize = Math.floor(pickingColorCache.length / 4);
      const pickingColor = [0, 0, 0];
      const startIndex = isPickingColorCacheInvalid ? 0 : cacheSize;
      for (let i = startIndex; i < newCacheSize; i++) {
        this.encodePickingColor(i, pickingColor);
        pickingColorCache[i * 4 + 0] = pickingColor[0];
        pickingColorCache[i * 4 + 1] = pickingColor[1];
        pickingColorCache[i * 4 + 2] = pickingColor[2];
        pickingColorCache[i * 4 + 3] = 0;
      }
    }
    attribute.value = pickingColorCache.subarray(0, numInstances * 4);
  }
  /** Apply changed attributes to model */
  // eslint-disable-next-line max-statements
  _setModelAttributes(model, changedAttributes, bufferLayoutChanged = false) {
    var _a;
    if (!Object.keys(changedAttributes).length) {
      return;
    }
    const attributeManager = this.getAttributeManager();
    if (attributeManager == null ? void 0 : attributeManager.hasBufferGroups()) {
      this._setGroupedModelAttributes(model, attributeManager, changedAttributes);
      return;
    }
    if (bufferLayoutChanged) {
      const manager = this.getAttributeManager();
      model.setBufferLayout(manager.getBufferLayouts(model));
      changedAttributes = manager.getAttributes();
    }
    const excludeAttributes = ((_a = model.userData) == null ? void 0 : _a.excludeAttributes) || {};
    const attributeBuffers = {};
    const constantAttributes = {};
    for (const name in changedAttributes) {
      if (excludeAttributes[name]) {
        continue;
      }
      const values = changedAttributes[name].getValue();
      for (const attributeName in values) {
        const value = values[attributeName];
        if (value instanceof import_core12.Buffer) {
          if (changedAttributes[name].settings.isIndexed) {
            model.setIndexBuffer(value);
          } else {
            attributeBuffers[attributeName] = value;
          }
        } else if (value) {
          constantAttributes[attributeName] = value;
        }
      }
    }
    model.setAttributes(attributeBuffers);
    model.setConstantAttributes(constantAttributes);
  }
  /** Apply explicit WebGPU buffer groups while preserving legacy bindings for fallbacks. */
  _setGroupedModelAttributes(model, attributeManager, changedAttributes) {
    var _a;
    const excludeAttributes = ((_a = model.userData) == null ? void 0 : _a.excludeAttributes) || {};
    const bindings = attributeManager.getBufferGroupBindings(
      changedAttributes,
      model,
      excludeAttributes
    );
    model.setBufferLayout(bindings.bufferLayouts);
    const attributeBuffers = { ...bindings.buffers };
    const constantAttributes = {};
    const attributes = attributeManager.getAttributes();
    for (const name in attributes) {
      if (excludeAttributes[name] || bindings.groupedAttributeIds.has(name)) {
        continue;
      }
      const attribute = attributes[name];
      const values = attribute.getValue();
      for (const attributeName in values) {
        const value = values[attributeName];
        if (value instanceof import_core12.Buffer) {
          if (attribute.settings.isIndexed) {
            model.setIndexBuffer(value);
          } else {
            attributeBuffers[attributeName] = value;
          }
        } else if (value) {
          constantAttributes[attributeName] = value;
        }
      }
    }
    model.setAttributes(attributeBuffers);
    model.setConstantAttributes(constantAttributes);
  }
  /** (Internal) Sets the picking color at the specified index to null picking color. Used for multi-depth picking.
     This method may be overriden by layer implementations */
  disablePickingIndex(objectIndex) {
    const data = this.props.data;
    if (!("attributes" in data)) {
      this._disablePickingIndex(objectIndex);
      return;
    }
    const attributes = this.getAttributeManager().attributes;
    const indexes = getPickingIndexAttribute(attributes);
    const colors = getPickingColorAttribute(attributes);
    const externalIndexAttribute = indexes && data.attributes && data.attributes[indexes.id];
    if (externalIndexAttribute && externalIndexAttribute.value) {
      const values = externalIndexAttribute.value;
      for (let index = 0; index < data.length; index++) {
        const i = indexes.getVertexOffset(index);
        if (values[i] === objectIndex) {
          this._disablePickingIndex(index);
        }
      }
      return;
    }
    const externalColorAttribute = colors && data.attributes && data.attributes[colors.id];
    if (externalColorAttribute && externalColorAttribute.value) {
      const values = externalColorAttribute.value;
      const objectColor = this.encodePickingColor(objectIndex);
      for (let index = 0; index < data.length; index++) {
        const i = colors.getVertexOffset(index);
        if (values[i] === objectColor[0] && values[i + 1] === objectColor[1] && values[i + 2] === objectColor[2]) {
          this._disablePickingIndex(index);
        }
      }
    } else {
      this._disablePickingIndex(objectIndex);
    }
  }
  // TODO - simplify subclassing interface
  _disablePickingIndex(objectIndex) {
    const attributes = this.getAttributeManager().attributes;
    const indexes = getPickingIndexAttribute(attributes);
    if (indexes) {
      const start2 = indexes.getVertexOffset(objectIndex);
      const end2 = indexes.getVertexOffset(objectIndex + 1);
      const invalidIndexes = new Uint32Array(end2 - start2);
      invalidIndexes.fill(PICKING_INVALID_INDEX);
      indexes.buffer.write(invalidIndexes, start2 * invalidIndexes.BYTES_PER_ELEMENT);
      return;
    }
    const colors = getPickingColorAttribute(attributes);
    if (!colors) {
      if (this.internalState) {
        disablePickingIndex(this.internalState.disabledPickingIndices, objectIndex);
      }
      return;
    }
    const start = colors.getVertexOffset(objectIndex);
    const end = colors.getVertexOffset(objectIndex + 1);
    colors.buffer.write(new Uint8Array(end - start), start);
  }
  /** (Internal) Re-enable all picking indices after multi-depth picking */
  restorePickingColors() {
    const attributes = this.getAttributeManager().attributes;
    const pickingAttribute = getPickingAttribute(attributes);
    if (!pickingAttribute) {
      if (this.internalState) {
        this.internalState.disabledPickingIndices.length = 0;
      }
      return;
    }
    const colors = getPickingColorAttribute(attributes);
    if (
      // @ts-ignore (TS2531) this method is only called internally with internalState defined
      this.internalState.usesPickingColorCache && colors && colors.value.buffer !== pickingColorCache.buffer
    ) {
      colors.value = pickingColorCache.subarray(0, colors.value.length);
    }
    pickingAttribute.updateSubBuffer({ startOffset: 0 });
  }
  /* eslint-disable max-statements */
  /* (Internal) Called by layer manager when a new layer is found */
  _initialize() {
    assert(!this.internalState);
    debug(TRACE_INITIALIZE, this);
    const attributeManager = this._getAttributeManager();
    this.internalState = new LayerState({
      attributeManager,
      layer: this
    });
    this._clearChangeFlags();
    this.state = {};
    Object.defineProperty(this.state, "attributeManager", {
      get: () => {
        log_default.deprecated("layer.state.attributeManager", "layer.getAttributeManager()")();
        return attributeManager;
      }
    });
    this.internalState.uniformTransitions = new UniformTransitionManager(this.context.timeline);
    this.internalState.onAsyncPropUpdated = this._onAsyncPropUpdated.bind(this);
    this.internalState.setAsyncProps(this.props);
    this.initializeState(this.context);
    for (const extension of this.props.extensions) {
      extension.initializeState.call(this, this.context, extension);
    }
    this.setChangeFlags({
      dataChanged: "init",
      propsChanged: "init",
      viewportChanged: true,
      extensionsChanged: true
    });
    this._update();
  }
  /** (Internal) Called by layer manager to transfer state from an old layer */
  _transferState(oldLayer) {
    debug(TRACE_MATCHED, this, this === oldLayer);
    const { state, internalState } = oldLayer;
    if (this === oldLayer) {
      return;
    }
    this.internalState = internalState;
    this.state = state;
    this.internalState.setAsyncProps(this.props);
    this._diffProps(this.props, this.internalState.getOldProps());
  }
  /** (Internal) Called by layer manager when a new layer is added or an existing layer is matched with a new instance */
  _update() {
    const stateNeedsUpdate = this.needsUpdate();
    debug(TRACE_UPDATE, this, stateNeedsUpdate);
    if (!stateNeedsUpdate) {
      return;
    }
    this.context.stats.get("Layer updates").incrementCount();
    const currentProps = this.props;
    const context = this.context;
    const internalState = this.internalState;
    const currentViewport = context.viewport;
    const propsInTransition = this._updateUniformTransition();
    internalState.propsInTransition = propsInTransition;
    context.viewport = internalState.viewport || currentViewport;
    this.props = propsInTransition;
    try {
      const updateParams = this._getUpdateParams();
      const oldModels = this.getModels();
      if (context.device) {
        this.updateState(updateParams);
      } else {
        try {
          this.updateState(updateParams);
        } catch (error) {
        }
      }
      for (const extension of this.props.extensions) {
        extension.updateState.call(this, updateParams, extension);
      }
      this.setNeedsRedraw();
      this._updateAttributes();
      const modelChanged = this.getModels()[0] !== oldModels[0];
      this._postUpdate(updateParams, modelChanged);
    } finally {
      context.viewport = currentViewport;
      this.props = currentProps;
      this._clearChangeFlags();
      internalState.needsUpdate = false;
      internalState.resetOldProps();
    }
  }
  /* eslint-enable max-statements */
  /** (Internal) Called by manager when layer is about to be disposed 
      Note: not guaranteed to be called on application shutdown */
  _finalize() {
    debug(TRACE_FINALIZE, this);
    this.finalizeState(this.context);
    for (const extension of this.props.extensions) {
      extension.finalizeState.call(this, this.context, extension);
    }
  }
  // Calculates uniforms
  _drawLayer({
    renderPass,
    shaderModuleProps = null,
    uniforms = {},
    parameters = {}
  }) {
    this._updateAttributeTransition();
    const currentProps = this.props;
    const context = this.context;
    this.props = this.internalState.propsInTransition || currentProps;
    try {
      if (shaderModuleProps) {
        this.setShaderModuleProps(shaderModuleProps);
      }
      const { getPolygonOffset } = this.props;
      const offsets = getPolygonOffset && getPolygonOffset(uniforms) || [0, 0];
      if (context.device instanceof import_webgl.WebGLDevice) {
        context.device.setParametersWebGL({ polygonOffset: offsets });
      }
      const webGPUDrawParameters = context.device instanceof import_webgl.WebGLDevice ? null : splitWebGPUDrawParameters(parameters);
      applyModelParameters(this.getModels(), renderPass, parameters, webGPUDrawParameters);
      if (context.device instanceof import_webgl.WebGLDevice) {
        context.device.withParametersWebGL(parameters, () => {
          const opts = { renderPass, shaderModuleProps, uniforms, parameters, context };
          for (const extension of this.props.extensions) {
            extension.draw.call(this, opts, extension);
          }
          this.draw(opts);
        });
      } else {
        if (webGPUDrawParameters == null ? void 0 : webGPUDrawParameters.renderPassParameters) {
          renderPass.setParameters(webGPUDrawParameters.renderPassParameters);
        }
        const opts = { renderPass, shaderModuleProps, uniforms, parameters, context };
        for (const extension of this.props.extensions) {
          extension.draw.call(this, opts, extension);
        }
        this.draw(opts);
      }
    } finally {
      this.props = currentProps;
    }
  }
  // Helper methods
  /** Returns the current change flags */
  getChangeFlags() {
    var _a;
    return (_a = this.internalState) == null ? void 0 : _a.changeFlags;
  }
  /* eslint-disable complexity */
  /** Dirty some change flags, will be handled by updateLayer */
  setChangeFlags(flags) {
    if (!this.internalState) {
      return;
    }
    const { changeFlags } = this.internalState;
    for (const key in flags) {
      if (flags[key]) {
        let flagChanged = false;
        switch (key) {
          case "dataChanged":
            const dataChangedReason = flags[key];
            const prevDataChangedReason = changeFlags[key];
            if (dataChangedReason && Array.isArray(prevDataChangedReason)) {
              changeFlags.dataChanged = Array.isArray(dataChangedReason) ? prevDataChangedReason.concat(dataChangedReason) : dataChangedReason;
              flagChanged = true;
            }
          default:
            if (!changeFlags[key]) {
              changeFlags[key] = flags[key];
              flagChanged = true;
            }
        }
        if (flagChanged) {
          debug(TRACE_CHANGE_FLAG, this, key, flags);
        }
      }
    }
    const propsOrDataChanged = Boolean(
      changeFlags.dataChanged || changeFlags.updateTriggersChanged || changeFlags.propsChanged || changeFlags.extensionsChanged
    );
    changeFlags.propsOrDataChanged = propsOrDataChanged;
    changeFlags.somethingChanged = propsOrDataChanged || changeFlags.viewportChanged || changeFlags.stateChanged;
  }
  /* eslint-enable complexity */
  /** Clear all changeFlags, typically after an update */
  _clearChangeFlags() {
    this.internalState.changeFlags = {
      dataChanged: false,
      propsChanged: false,
      updateTriggersChanged: false,
      viewportChanged: false,
      stateChanged: false,
      extensionsChanged: false,
      propsOrDataChanged: false,
      somethingChanged: false
    };
  }
  /** Compares the layers props with old props from a matched older layer
      and extracts change flags that describe what has change so that state
      can be update correctly with minimal effort */
  _diffProps(newProps, oldProps) {
    var _a;
    const changeFlags = diffProps(newProps, oldProps);
    if (changeFlags.updateTriggersChanged) {
      for (const key in changeFlags.updateTriggersChanged) {
        if (changeFlags.updateTriggersChanged[key]) {
          this.invalidateAttribute(key);
        }
      }
    }
    if (changeFlags.transitionsChanged) {
      for (const key in changeFlags.transitionsChanged) {
        this.internalState.uniformTransitions.add(
          key,
          oldProps[key],
          newProps[key],
          (_a = newProps.transitions) == null ? void 0 : _a[key]
        );
      }
    }
    return this.setChangeFlags(changeFlags);
  }
  /** (Internal) called by layer manager to perform extra props validation (in development only) */
  validateProps() {
    validateProps(this.props);
  }
  /** (Internal) Called by deck picker when the hovered object changes to update the auto highlight */
  updateAutoHighlight(info) {
    if (this.props.autoHighlight && !Number.isInteger(this.props.highlightedObjectIndex)) {
      this._updateAutoHighlight(info);
    }
  }
  // May be overriden by subclasses
  // TODO - simplify subclassing interface
  /** Update picking module parameters to highlight the hovered object */
  _updateAutoHighlight(info) {
    const picking2 = {
      // @ts-ignore
      highlightedObjectColor: info.picked ? info.color : null
    };
    const { highlightColor } = this.props;
    if (info.picked && typeof highlightColor === "function") {
      picking2.highlightColor = highlightColor(info);
    }
    this.setShaderModuleProps({ picking: picking2 });
    this.setNeedsRedraw();
  }
  /** Create new attribute manager */
  _getAttributeManager() {
    const context = this.context;
    return new AttributeManager(context.device, {
      id: this.props.id,
      stats: context.stats,
      timeline: context.timeline
    });
  }
  // Private methods
  /** Called after updateState to perform common tasks */
  // eslint-disable-next-line complexity
  _postUpdate(updateParams, forceUpdate) {
    const { props, oldProps } = updateParams;
    const model = this.state.model;
    if (model == null ? void 0 : model.isInstanced) {
      model.setInstanceCount(this.getNumInstances());
    }
    const { autoHighlight, highlightedObjectIndex, highlightColor } = props;
    if (forceUpdate || oldProps.autoHighlight !== autoHighlight || oldProps.highlightedObjectIndex !== highlightedObjectIndex || oldProps.highlightColor !== highlightColor) {
      const picking2 = {};
      if (Array.isArray(highlightColor)) {
        picking2.highlightColor = highlightColor;
      }
      if (forceUpdate || oldProps.autoHighlight !== autoHighlight || highlightedObjectIndex !== oldProps.highlightedObjectIndex) {
        picking2.highlightedObjectColor = Number.isFinite(highlightedObjectIndex) && highlightedObjectIndex >= 0 ? this.encodePickingColor(highlightedObjectIndex) : null;
      }
      this.setShaderModuleProps({ picking: picking2 });
    }
  }
  _getUpdateParams() {
    return {
      props: this.props,
      // @ts-ignore TS2531 this method can only be called internally with internalState assigned
      oldProps: this.internalState.getOldProps(),
      context: this.context,
      // @ts-ignore TS2531 this method can only be called internally with internalState assigned
      changeFlags: this.internalState.changeFlags
    };
  }
  /** Checks state of attributes and model */
  _getNeedsRedraw(opts) {
    if (!this.internalState) {
      return false;
    }
    let redraw = false;
    redraw = redraw || this.internalState.needsRedraw && this.id;
    const attributeManager = this.getAttributeManager();
    const attributeManagerNeedsRedraw = attributeManager ? attributeManager.getNeedsRedraw(opts) : false;
    redraw = redraw || attributeManagerNeedsRedraw;
    if (redraw) {
      for (const extension of this.props.extensions) {
        extension.onNeedsRedraw.call(this, extension);
      }
    }
    this.internalState.needsRedraw = this.internalState.needsRedraw && !opts.clearRedrawFlags;
    return redraw;
  }
  /** Callback when asyn prop is loaded */
  _onAsyncPropUpdated() {
    this._diffProps(this.props, this.internalState.getOldProps());
    this.setNeedsUpdate();
  }
};
Layer.defaultProps = defaultProps;
Layer.layerName = "Layer";
function splitWebGPUDrawParameters(parameters) {
  const { blendConstant, ...pipelineParameters } = parameters;
  return blendConstant ? {
    pipelineParameters,
    renderPassParameters: { blendConstant }
  } : { pipelineParameters };
}
function applyModelParameters(models, renderPass, parameters, webGPUDrawParameters) {
  for (const model of models) {
    if (model.device.type === "webgpu") {
      syncModelAttachmentFormats(model, renderPass);
      model.setParameters({
        ...model.parameters,
        ...webGPUDrawParameters == null ? void 0 : webGPUDrawParameters.pipelineParameters
      });
    } else {
      model.setParameters(parameters);
    }
  }
}
function syncModelAttachmentFormats(model, renderPass) {
  var _a, _b;
  const framebuffer = renderPass.props.framebuffer || (renderPass.framebuffer ?? null);
  if (!framebuffer) {
    return;
  }
  const colorAttachmentFormats = framebuffer.colorAttachments.map(
    (attachment) => {
      var _a2;
      return ((_a2 = attachment == null ? void 0 : attachment.texture) == null ? void 0 : _a2.format) ?? null;
    }
  );
  const depthStencilAttachmentFormat = (_b = (_a = framebuffer.depthStencilAttachment) == null ? void 0 : _a.texture) == null ? void 0 : _b.format;
  const modelWithProps = model;
  if (!equalAttachmentFormats(modelWithProps.props.colorAttachmentFormats, colorAttachmentFormats) || modelWithProps.props.depthStencilAttachmentFormat !== depthStencilAttachmentFormat) {
    modelWithProps.props.colorAttachmentFormats = colorAttachmentFormats;
    modelWithProps.props.depthStencilAttachmentFormat = depthStencilAttachmentFormat;
    modelWithProps._setPipelineNeedsUpdate("attachment formats");
  }
}
function equalAttachmentFormats(left, right) {
  if (left === right) {
    return true;
  }
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
}

// ../core/src/lib/composite-layer.ts
var TRACE_RENDER_LAYERS = "compositeLayer.renderLayers";
var CompositeLayer = class extends Layer {
  /** `true` if this layer renders other layers */
  get isComposite() {
    return true;
  }
  /** `true` if the layer renders to screen */
  get isDrawable() {
    return false;
  }
  /** Returns true if all async resources are loaded */
  get isLoaded() {
    return super.isLoaded && this.getSubLayers().every((layer) => layer.isLoaded);
  }
  /** Return last rendered sub layers */
  getSubLayers() {
    return this.internalState && this.internalState.subLayers || [];
  }
  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initializeState(context) {
  }
  /** Updates selected state members and marks the composite layer to need rerender */
  setState(updateObject) {
    super.setState(updateObject);
    this.setNeedsUpdate();
  }
  /** called to augment the info object that is bubbled up from a sublayer
      override Layer.getPickingInfo() because decoding / setting uniform do
      not apply to a composite layer. */
  getPickingInfo({ info }) {
    const { object } = info;
    const isDataWrapped = object && object.__source && object.__source.parent && object.__source.parent.id === this.id;
    if (!isDataWrapped) {
      return info;
    }
    info.object = object.__source.object;
    info.index = object.__source.index;
    return info;
  }
  /**
   * Filters sub layers at draw time. Return true if the sub layer should be drawn.
   */
  filterSubLayer(context) {
    return true;
  }
  /** Returns true if sub layer needs to be rendered */
  shouldRenderSubLayer(subLayerId, data) {
    return data && data.length;
  }
  /** Returns sub layer class for a specific sublayer */
  getSubLayerClass(subLayerId, DefaultLayerClass) {
    const { _subLayerProps: overridingProps } = this.props;
    return overridingProps && overridingProps[subLayerId] && overridingProps[subLayerId].type || DefaultLayerClass;
  }
  /** When casting user data into another format to pass to sublayers,
      add reference to the original object and object index */
  getSubLayerRow(row, sourceObject, sourceObjectIndex) {
    row.__source = {
      parent: this,
      object: sourceObject,
      index: sourceObjectIndex
    };
    return row;
  }
  /** Some composite layers cast user data into another format before passing to sublayers
    We need to unwrap them before calling the accessor so that they see the original data
    objects */
  getSubLayerAccessor(accessor) {
    if (typeof accessor === "function") {
      const objectInfo = {
        index: -1,
        // @ts-ignore accessing resolved data
        data: this.props.data,
        target: []
      };
      return (x, i) => {
        if (x && x.__source) {
          objectInfo.index = x.__source.index;
          return accessor(x.__source.object, objectInfo);
        }
        return accessor(x, i);
      };
    }
    return accessor;
  }
  /** Returns sub layer props for a specific sublayer */
  // eslint-disable-next-line complexity
  getSubLayerProps(sublayerProps = {}) {
    var _a;
    const {
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix: modelMatrix2,
      extensions,
      fetch,
      operation,
      _subLayerProps: overridingProps
    } = this.props;
    const newProps = {
      id: "",
      updateTriggers: {},
      opacity,
      pickable,
      visible,
      parameters,
      getPolygonOffset,
      highlightedObjectIndex,
      autoHighlight,
      highlightColor,
      coordinateSystem,
      coordinateOrigin,
      wrapLongitude,
      positionFormat,
      modelMatrix: modelMatrix2,
      extensions,
      fetch,
      operation
    };
    const overridingSublayerProps = overridingProps && sublayerProps.id && overridingProps[sublayerProps.id];
    const overridingSublayerTriggers = overridingSublayerProps && overridingSublayerProps.updateTriggers;
    const sublayerId = sublayerProps.id || "sublayer";
    if (overridingSublayerProps) {
      const propTypes = this.props[PROP_TYPES_SYMBOL];
      const subLayerPropTypes = sublayerProps.type ? sublayerProps.type._propTypes : {};
      for (const key in overridingSublayerProps) {
        const propType = subLayerPropTypes[key] || propTypes[key];
        if (propType && propType.type === "accessor") {
          overridingSublayerProps[key] = this.getSubLayerAccessor(overridingSublayerProps[key]);
        }
      }
    }
    Object.assign(
      newProps,
      sublayerProps,
      // experimental feature that allows users to override sublayer props via parent layer prop
      overridingSublayerProps
    );
    newProps.id = `${this.props.id}-${sublayerId}`;
    newProps.updateTriggers = {
      all: (_a = this.props.updateTriggers) == null ? void 0 : _a.all,
      ...sublayerProps.updateTriggers,
      ...overridingSublayerTriggers
    };
    for (const extension of extensions) {
      const passThroughProps = extension.getSubLayerProps.call(this, extension);
      if (passThroughProps) {
        Object.assign(newProps, passThroughProps, {
          updateTriggers: Object.assign(newProps.updateTriggers, passThroughProps.updateTriggers)
        });
      }
    }
    return newProps;
  }
  /** Update sub layers to highlight the hovered object */
  _updateAutoHighlight(info) {
    for (const layer of this.getSubLayers()) {
      layer.updateAutoHighlight(info);
    }
  }
  /** Override base Layer method */
  _getAttributeManager() {
    return null;
  }
  /** (Internal) Called after an update to rerender sub layers */
  _postUpdate(updateParams, forceUpdate) {
    let subLayers = this.internalState.subLayers;
    const shouldUpdate = !subLayers || this.needsUpdate();
    if (shouldUpdate) {
      const subLayersList = this.renderLayers();
      subLayers = flatten(subLayersList, Boolean);
      this.internalState.subLayers = subLayers;
    }
    debug(TRACE_RENDER_LAYERS, this, shouldUpdate, subLayers);
    for (const layer of subLayers) {
      layer.parent = this;
    }
  }
};
CompositeLayer.layerName = "CompositeLayer";

// ../core/src/lib/layer-extension.ts
var LayerExtension = class {
  static get componentName() {
    return Object.prototype.hasOwnProperty.call(this, "extensionName") ? this.extensionName : "";
  }
  constructor(opts) {
    if (opts) {
      this.opts = opts;
    }
  }
  /** Returns true if two extensions are equivalent */
  equals(extension) {
    if (this === extension) {
      return true;
    }
    return this.constructor === extension.constructor && deepEqual(this.opts, extension.opts, 1);
  }
  /** Only called if attached to a primitive layer */
  getShaders(extension) {
    return null;
  }
  /** Only called if attached to a CompositeLayer */
  getSubLayerProps(extension) {
    const { defaultProps: defaultProps33 } = extension.constructor;
    const newProps = {
      updateTriggers: {}
    };
    for (const key in defaultProps33) {
      if (key in this.props) {
        const propDef = defaultProps33[key];
        const propValue = this.props[key];
        newProps[key] = propValue;
        if (propDef && propDef.type === "accessor") {
          newProps.updateTriggers[key] = this.props.updateTriggers[key];
          if (typeof propValue === "function") {
            newProps[key] = this.getSubLayerAccessor(propValue);
          }
        }
      }
    }
    return newProps;
  }
  /* eslint-disable @typescript-eslint/no-empty-function */
  initializeState(context, extension) {
  }
  updateState(params, extension) {
  }
  onNeedsRedraw(extension) {
  }
  getNeedsPickingBuffer(extension) {
    return false;
  }
  draw(params, extension) {
  }
  finalizeState(context, extension) {
  }
};
LayerExtension.defaultProps = {};
LayerExtension.extensionName = "LayerExtension";

// ../core/src/utils/tesselator.ts
var import_core14 = require("@luma.gl/core");
var Tesselator = class {
  constructor(opts) {
    this.indexStarts = [0];
    this.vertexStarts = [0];
    this.vertexCount = 0;
    this.instanceCount = 0;
    const { attributes = {} } = opts;
    this.typedArrayManager = typed_array_manager_default;
    this.attributes = {};
    this._attributeDefs = attributes;
    this.opts = opts;
    this.updateGeometry(opts);
  }
  /* Public methods */
  updateGeometry(opts) {
    Object.assign(this.opts, opts);
    const {
      data,
      buffers = {},
      getGeometry: getGeometry2,
      geometryBuffer,
      positionFormat,
      dataChanged,
      normalize: normalize2 = true
    } = this.opts;
    this.data = data;
    this.getGeometry = getGeometry2;
    this.positionSize = // @ts-ignore (2339) when geometryBuffer is a luma Buffer, size falls back to positionFormat
    geometryBuffer && geometryBuffer.size || (positionFormat === "XY" ? 2 : 3);
    this.buffers = buffers;
    this.normalize = normalize2;
    if (geometryBuffer) {
      assert(data.startIndices);
      this.getGeometry = this.getGeometryFromBuffer(geometryBuffer);
      if (!normalize2) {
        buffers.vertexPositions = geometryBuffer;
      }
    }
    this.geometryBuffer = buffers.vertexPositions;
    if (Array.isArray(dataChanged)) {
      for (const dataRange of dataChanged) {
        this._rebuildGeometry(dataRange);
      }
    } else {
      this._rebuildGeometry();
    }
  }
  updatePartialGeometry({ startRow, endRow }) {
    this._rebuildGeometry({ startRow, endRow });
  }
  getGeometryFromBuffer(geometryBuffer) {
    const value = geometryBuffer.value || geometryBuffer;
    if (!ArrayBuffer.isView(value)) {
      return null;
    }
    return getAccessorFromBuffer(value, {
      size: this.positionSize,
      offset: geometryBuffer.offset,
      stride: geometryBuffer.stride,
      startIndices: this.data.startIndices
    });
  }
  /* Private utility methods */
  _allocate(instanceCount, copy) {
    const { attributes, buffers, _attributeDefs, typedArrayManager } = this;
    for (const name in _attributeDefs) {
      if (name in buffers) {
        typedArrayManager.release(attributes[name]);
        attributes[name] = null;
      } else {
        const def = _attributeDefs[name];
        def.copy = copy;
        attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
      }
    }
  }
  /**
   * Visit all objects
   * `data` is expected to be an iterable consistent with the base Layer expectation
   */
  _forEachGeometry(visitor, startRow, endRow) {
    const { data, getGeometry: getGeometry2 } = this;
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const geometry = getGeometry2 ? getGeometry2(object, objectInfo) : null;
      visitor(geometry, objectInfo.index);
    }
  }
  /* eslint-disable complexity,max-statements */
  _rebuildGeometry(dataRange) {
    if (!this.data) {
      return;
    }
    let { indexStarts, vertexStarts, instanceCount } = this;
    const { data, geometryBuffer } = this;
    const { startRow = 0, endRow = Infinity } = dataRange || {};
    const normalizedData = {};
    if (!dataRange) {
      indexStarts = [0];
      vertexStarts = [0];
    }
    if (this.normalize || !geometryBuffer) {
      this._forEachGeometry(
        (geometry, dataIndex) => {
          const normalizedGeometry = geometry && this.normalizeGeometry(geometry);
          normalizedData[dataIndex] = normalizedGeometry;
          vertexStarts[dataIndex + 1] = vertexStarts[dataIndex] + (normalizedGeometry ? this.getGeometrySize(normalizedGeometry) : 0);
        },
        startRow,
        endRow
      );
      instanceCount = vertexStarts[vertexStarts.length - 1];
    } else {
      vertexStarts = data.startIndices;
      instanceCount = vertexStarts[data.length] || 0;
      if (ArrayBuffer.isView(geometryBuffer)) {
        instanceCount = instanceCount || geometryBuffer.length / this.positionSize;
      } else if (geometryBuffer instanceof import_core14.Buffer) {
        const byteStride = this.positionSize * 4;
        instanceCount = instanceCount || geometryBuffer.byteLength / byteStride;
      } else if (geometryBuffer.buffer) {
        const byteStride = geometryBuffer.stride || this.positionSize * 4;
        instanceCount = instanceCount || geometryBuffer.buffer.byteLength / byteStride;
      } else if (geometryBuffer.value) {
        const bufferValue = geometryBuffer.value;
        const elementStride = (
          // @ts-ignore (2339) if stride is not specified, will fall through to positionSize
          geometryBuffer.stride / bufferValue.BYTES_PER_ELEMENT || this.positionSize
        );
        instanceCount = instanceCount || bufferValue.length / elementStride;
      }
    }
    this._allocate(instanceCount, Boolean(dataRange));
    this.indexStarts = indexStarts;
    this.vertexStarts = vertexStarts;
    this.instanceCount = instanceCount;
    const context = {};
    this._forEachGeometry(
      (geometry, dataIndex) => {
        const normalizedGeometry = normalizedData[dataIndex] || geometry;
        context.vertexStart = vertexStarts[dataIndex];
        context.indexStart = indexStarts[dataIndex];
        const vertexEnd = dataIndex < vertexStarts.length - 1 ? vertexStarts[dataIndex + 1] : instanceCount;
        context.geometrySize = vertexEnd - vertexStarts[dataIndex];
        context.geometryIndex = dataIndex;
        this.updateGeometryAttributes(normalizedGeometry, context);
      },
      startRow,
      endRow
    );
    this.vertexCount = indexStarts[indexStarts.length - 1];
  }
};

// ../layers/src/arc-layer/arc-layer.ts
var import_engine4 = require("@luma.gl/engine");

// ../layers/src/arc-layer/arc-layer-uniforms.ts
var uniformBlockWGSL = (
  /* wgsl */
  `struct ArcUniforms {
  greatCircle: f32,
  useShortestPath: f32,
  numSegments: f32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  widthUnits: i32,
};

@group(0) @binding(auto) var<uniform> arc: ArcUniforms;
`
);
var uniformBlock3 = `layout(std140) uniform arcUniforms {
  bool greatCircle;
  bool useShortestPath;
  float numSegments;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int widthUnits;
} arc;
`;
var arcUniforms = {
  name: "arc",
  source: uniformBlockWGSL,
  vs: uniformBlock3,
  fs: uniformBlock3,
  uniformTypes: {
    greatCircle: "f32",
    useShortestPath: "f32",
    numSegments: "f32",
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    widthUnits: "i32"
  }
};

// ../layers/src/arc-layer/arc-layer.wgsl.ts
var shaderWGSL = (
  /* wgsl */
  `const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct Attributes {
  @location(0) instanceSourcePositions: vec3<f32>,
  @location(1) instanceSourcePositions64Low: vec3<f32>,
  @location(2) instanceTargetPositions: vec3<f32>,
  @location(3) instanceTargetPositions64Low: vec3<f32>,
  @location(4) instanceSourceColors: vec4<f32>,
  @location(5) instanceTargetColors: vec4<f32>,
  @location(6) instanceWidths: f32,
  @location(7) instanceHeights: f32,
  @location(8) instanceTilts: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) pickingColor: vec3<f32>,
  @location(3) isValid: f32,
};

fn paraboloid(
  distance: f32,
  sourceZ: f32,
  targetZ: f32,
  ratio: f32,
  height: f32
) -> f32 {
  let deltaZ = targetZ - sourceZ;
  let dh = distance * height;
  if (dh == 0.0) {
    return sourceZ + deltaZ * ratio;
  }
  let unitZ = deltaZ / dh;
  let p2 = unitZ * unitZ + 1.0;
  let dir = select(0.0, 1.0, deltaZ <= 0.0);
  let z0 = mix(sourceZ, targetZ, dir);
  let r = mix(ratio, 1.0 - ratio, dir);
  return sqrt(max(r * (p2 - r), 0.0)) * dh + z0;
}

fn getExtrusionOffset(lineClipspace: vec2<f32>, side: f32, width: f32) -> vec2<f32> {
  var direction = normalize(lineClipspace * project.viewportSize);
  direction = vec2<f32>(-direction.y, direction.x);
  return direction * side * width / 2.0;
}

fn getSegmentRatio(index: f32) -> f32 {
  return smoothstep(0.0, 1.0, index / max(arc.numSegments - 1.0, 1.0));
}

fn interpolateFlat(
  source: vec3<f32>,
  targetPosition: vec3<f32>,
  ratio: f32,
  height: f32,
  tiltDegrees: f32
) -> vec3<f32> {
  let distance = length(source.xy - targetPosition.xy);
  let z = paraboloid(distance, source.z, targetPosition.z, ratio, height);
  let tiltAngle = radians(tiltDegrees);
  let tiltDirection = normalize(targetPosition.xy - source.xy);
  let tilt = vec2<f32>(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);
  return vec3<f32>(mix(source.xy, targetPosition.xy, ratio) + tilt, z * cos(tiltAngle));
}

// Great circle interpolation
// http://www.movable-type.co.uk/scripts/latlong.html
fn getAngularDistance(source: vec2<f32>, targetPosition: vec2<f32>) -> f32 {
  let sourceRadians = radians(source);
  let targetRadians = radians(targetPosition);
  let sinHalfDelta = sin((sourceRadians - targetRadians) / 2.0);
  let sinHalfDeltaSquared = sinHalfDelta * sinHalfDelta;
  let a = sinHalfDeltaSquared.y +
    cos(sourceRadians.y) * cos(targetRadians.y) * sinHalfDeltaSquared.x;
  return 2.0 * asin(sqrt(a));
}

fn interpolateGreatCircle(
  source: vec3<f32>,
  targetPosition: vec3<f32>,
  source3D: vec3<f32>,
  target3D: vec3<f32>,
  angularDistance: f32,
  ratio: f32,
  height: f32
) -> vec3<f32> {
  var longitudeLatitude: vec2<f32>;

  // If the angular distance is PI, use linear interpolation. Otherwise use spherical interpolation.
  if (abs(angularDistance - PI) < 0.001) {
    longitudeLatitude = (1.0 - ratio) * source.xy + ratio * targetPosition.xy;
  } else {
    let a = sin((1.0 - ratio) * angularDistance);
    let b = sin(ratio * angularDistance);
    let p = source3D.yxz * a + target3D.yxz * b;
    longitudeLatitude = degrees(vec2<f32>(
      atan2(p.y, -p.x),
      atan2(p.z, length(p.xy))
    ));
  }

  let z = paraboloid(
    angularDistance * EARTH_RADIUS,
    source.z,
    targetPosition.z,
    ratio,
    height
  );
  return vec3<f32>(longitudeLatitude, z);
}

@vertex
fn vertexMain(
  attributes: Attributes,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> Varyings {
  geometry.worldPosition = attributes.instanceSourcePositions;
  geometry.worldPositionAlt = attributes.instanceTargetPositions;

  let segmentIndex = f32(vertexIndex / 2u);
  let segmentSide = select(-1.0, 1.0, vertexIndex % 2u == 1u);
  var segmentRatio = getSegmentRatio(segmentIndex);
  let previousRatio = getSegmentRatio(max(0.0, segmentIndex - 1.0));
  var nextRatio = getSegmentRatio(min(arc.numSegments - 1.0, segmentIndex + 1.0));
  // If this is the first point, use next - current as direction.
  var indexDirection = select(-1.0, 1.0, segmentIndex <= 0.0);
  var isValid = 1.0;

  var currentClip: vec4<f32>;
  var nextClip: vec4<f32>;

  if (
    (arc.greatCircle != 0.0 || project.projectionMode == PROJECTION_MODE_GLOBE) &&
    project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT
  ) {
    let source = project_globe_(vec3<f32>(attributes.instanceSourcePositions.xy, 0.0));
    let targetPosition = project_globe_(vec3<f32>(attributes.instanceTargetPositions.xy, 0.0));
    let angularDistance = getAngularDistance(
      attributes.instanceSourcePositions.xy,
      attributes.instanceTargetPositions.xy
    );

    let previousPosition = interpolateGreatCircle(
      attributes.instanceSourcePositions,
      attributes.instanceTargetPositions,
      source,
      targetPosition,
      angularDistance,
      previousRatio,
      attributes.instanceHeights
    );
    var currentPosition = interpolateGreatCircle(
      attributes.instanceSourcePositions,
      attributes.instanceTargetPositions,
      source,
      targetPosition,
      angularDistance,
      segmentRatio,
      attributes.instanceHeights
    );
    var nextPosition = interpolateGreatCircle(
      attributes.instanceSourcePositions,
      attributes.instanceTargetPositions,
      source,
      targetPosition,
      angularDistance,
      nextRatio,
      attributes.instanceHeights
    );

    if (abs(currentPosition.x - previousPosition.x) > 180.0) {
      indexDirection = -1.0;
      isValid = 0.0;
    } else if (abs(currentPosition.x - nextPosition.x) > 180.0) {
      indexDirection = 1.0;
      isValid = 0.0;
    }
    nextPosition = select(nextPosition, previousPosition, indexDirection < 0.0);
    nextRatio = select(nextRatio, previousRatio, indexDirection < 0.0);

    if (isValid == 0.0) {
      // Split at the antimeridian.
      nextPosition.x += select(360.0, -360.0, nextPosition.x > 0.0);
      let ratio = (
        select(-180.0, 180.0, currentPosition.x > 0.0) - currentPosition.x
      ) / (nextPosition.x - currentPosition.x);
      currentPosition = mix(currentPosition, nextPosition, ratio);
      segmentRatio = mix(segmentRatio, nextRatio, ratio);
    }

    let currentPosition64Low = mix(
      attributes.instanceSourcePositions64Low,
      attributes.instanceTargetPositions64Low,
      segmentRatio
    );
    let nextPosition64Low = mix(
      attributes.instanceSourcePositions64Low,
      attributes.instanceTargetPositions64Low,
      nextRatio
    );
    let currentProjection = project_position_to_clipspace_and_commonspace(
      currentPosition,
      currentPosition64Low,
      ZERO_OFFSET
    );
    currentClip = currentProjection.clipPosition;
    nextClip = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);
    geometry.position = currentProjection.commonPosition;
  } else {
    var sourceWorld = attributes.instanceSourcePositions;
    var targetWorld = attributes.instanceTargetPositions;
    if (arc.useShortestPath != 0.0) {
      sourceWorld.x = ((sourceWorld.x + 180.0) % 360.0) - 180.0;
      targetWorld.x = ((targetWorld.x + 180.0) % 360.0) - 180.0;
      let deltaLongitude = targetWorld.x - sourceWorld.x;
      if (deltaLongitude > 180.0) {
        targetWorld.x -= 360.0;
      }
      if (deltaLongitude < -180.0) {
        sourceWorld.x -= 360.0;
      }
    }

    let source = project_position_vec3_f64(
      sourceWorld,
      attributes.instanceSourcePositions64Low
    );
    let targetPosition = project_position_vec3_f64(
      targetWorld,
      attributes.instanceTargetPositions64Low
    );

    // Common x at longitude=-180.
    var antimeridianX = 0.0;
    if (arc.useShortestPath != 0.0) {
      if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
        antimeridianX = -(project.coordinateOrigin.x + 180.0) / 360.0 * TILE_SIZE;
      }
      let thresholdRatio = (antimeridianX - source.x) / (targetPosition.x - source.x);
      if (previousRatio <= thresholdRatio && nextRatio > thresholdRatio) {
        isValid = 0.0;
        indexDirection = sign(segmentRatio - thresholdRatio);
        segmentRatio = thresholdRatio;
      }
    }

    nextRatio = select(nextRatio, previousRatio, indexDirection < 0.0);
    var currentPosition = interpolateFlat(
      source,
      targetPosition,
      segmentRatio,
      attributes.instanceHeights,
      attributes.instanceTilts
    );
    var nextPosition = interpolateFlat(
      source,
      targetPosition,
      nextRatio,
      attributes.instanceHeights,
      attributes.instanceTilts
    );

    if (arc.useShortestPath != 0.0 && nextPosition.x < antimeridianX) {
      currentPosition.x += TILE_SIZE;
      nextPosition.x += TILE_SIZE;
    }

    currentClip = project_common_position_to_clipspace(vec4<f32>(currentPosition, 1.0));
    nextClip = project_common_position_to_clipspace(vec4<f32>(nextPosition, 1.0));
    geometry.position = vec4<f32>(currentPosition, 1.0);
  }

  geometry.uv = vec2<f32>(segmentRatio, segmentSide);
  geometry.pickingColor = picking_getPickingColorFromIndex(instanceIndex);

  let widthPixels = clamp(
    project_unit_size_to_pixel(attributes.instanceWidths * arc.widthScale, arc.widthUnits),
    arc.widthMinPixels,
    arc.widthMaxPixels
  );
#ifdef ANTIALIASING
  var offset = getExtrusionOffset(
#else
  let offset = getExtrusionOffset(
#endif
    (nextClip.xy - currentClip.xy) * indexDirection,
    segmentSide,
    widthPixels
  );
#ifdef ANTIALIASING
  let halfWidthPixels = length(offset);
  if (halfWidthPixels > 0.0) {
    // Keep the declared edge at abs(uv.y) == 1 while rasterizing the outer half of the centered
    // one-device-pixel coverage ramp.
    let coverageScale = 1.0 + 0.5 / project.devicePixelRatio / halfWidthPixels;
    offset *= coverageScale;
    geometry.uv.y *= coverageScale;
  }
#endif

  var output: Varyings;
  output.position = currentClip + vec4<f32>(project_pixel_size_to_clipspace(offset), 0.0, 0.0);
  let color = mix(attributes.instanceSourceColors, attributes.instanceTargetColors, segmentRatio);
  output.color = vec4<f32>(color.rgb, color.a * layer.opacity);
  output.uv = geometry.uv;
  output.pickingColor = geometry.pickingColor;
  output.isValid = isValid;
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
#ifdef ANTIALIASING
  let edgeCoord = abs(varyings.uv.y);
  let edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
#endif

  if (varyings.isValid == 0.0) {
    discard;
  }

#ifdef ANTIALIASING
  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }
#endif
  var color = varyings.color;
#ifdef ANTIALIASING
  // Feather one device pixel across the width. Arc segments meet lengthwise, so only soften the
  // two outer edges of the strip.
  color.a *= smoothedge(0.0, edgePixels);
#endif
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + color.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      }
    }
  }
  return deckgl_premultiplied_alpha(color);
}
`
);

// ../layers/src/arc-layer/arc-layer-vertex.glsl.ts
var arc_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME arc-layer-vertex-shader

in vec4 instanceSourceColors;
in vec4 instanceTargetColors;
in vec3 instanceSourcePositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions;
in vec3 instanceTargetPositions64Low;
in float instanceWidths;
in float instanceHeights;
in float instanceTilts;

out vec4 vColor;
out vec2 uv;
out float isValid;

float paraboloid(float distance, float sourceZ, float targetZ, float ratio) {
  // d: distance on the xy plane
  // r: ratio of the current point
  // p: ratio of the peak of the arc
  // h: height multiplier
  // z = f(r) = sqrt(r * (p * 2 - r)) * d * h
  // f(0) = 0
  // f(1) = dz

  float deltaZ = targetZ - sourceZ;
  float dh = distance * instanceHeights;
  if (dh == 0.0) {
    return sourceZ + deltaZ * ratio;
  }
  float unitZ = deltaZ / dh;
  float p2 = unitZ * unitZ + 1.0;

  // sqrt does not deal with negative values, manually flip source and target if delta.z < 0
  float dir = step(deltaZ, 0.0);
  float z0 = mix(sourceZ, targetZ, dir);
  float r = mix(ratio, 1.0 - ratio, dir);
  return sqrt(r * (p2 - r)) * dh + z0;
}

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  return dir_screenspace * offset_direction * width / 2.0;
}

float getSegmentRatio(float index) {
  return smoothstep(0.0, 1.0, index / (arc.numSegments - 1.0));
}

vec3 interpolateFlat(vec3 source, vec3 target, float segmentRatio) {
  float distance = length(source.xy - target.xy);
  float z = paraboloid(distance, source.z, target.z, segmentRatio);

  float tiltAngle = radians(instanceTilts);
  vec2 tiltDirection = normalize(target.xy - source.xy);
  vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);

  return vec3(
    mix(source.xy, target.xy, segmentRatio) + tilt,
    z * cos(tiltAngle)
  );
}

/* Great circle interpolation
 * http://www.movable-type.co.uk/scripts/latlong.html
 */
float getAngularDist (vec2 source, vec2 target) {
  vec2 sourceRadians = radians(source);
  vec2 targetRadians = radians(target);
  vec2 sin_half_delta = sin((sourceRadians - targetRadians) / 2.0);
  vec2 shd_sq = sin_half_delta * sin_half_delta;

  float a = shd_sq.y + cos(sourceRadians.y) * cos(targetRadians.y) * shd_sq.x;
  return 2.0 * asin(sqrt(a));
}

vec3 interpolateGreatCircle(vec3 source, vec3 target, vec3 source3D, vec3 target3D, float angularDist, float t) {
  vec2 lngLat;

  // if the angularDist is PI, linear interpolation is applied. otherwise, use spherical interpolation
  if(abs(angularDist - PI) < 0.001) {
    lngLat = (1.0 - t) * source.xy + t * target.xy;
  } else {
    float a = sin((1.0 - t) * angularDist);
    float b = sin(t * angularDist);
    vec3 p = source3D.yxz * a + target3D.yxz * b;
    lngLat = degrees(vec2(atan(p.y, -p.x), atan(p.z, length(p.xy))));
  }

  float z = paraboloid(angularDist * EARTH_RADIUS, source.z, target.z, t);

  return vec3(lngLat, z);
}

/* END GREAT CIRCLE */

void main(void) {
  geometry.worldPosition = instanceSourcePositions;
  geometry.worldPositionAlt = instanceTargetPositions;

  /*
  *  --(i, -1)-----------_(i+1, -1)--
  *       |          _,-"  |
  *       o      _,-"      o
  *       |  _,-"          |
  *  --(i, 1)"-------------(i+1, 1)--
  */
  float segmentIndex = float(gl_VertexID / 2);
  float segmentSide = mod(float(gl_VertexID), 2.) == 0. ? -1. : 1.;
  float segmentRatio = getSegmentRatio(segmentIndex);
  float prevSegmentRatio = getSegmentRatio(max(0.0, segmentIndex - 1.0));
  float nextSegmentRatio = getSegmentRatio(min(arc.numSegments - 1.0, segmentIndex + 1.0));

  // if it's the first point, use next - current as direction
  // otherwise use current - prev
  float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
  isValid = 1.0;

  uv = vec2(segmentRatio, segmentSide);
  geometry.uv = uv;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  vec4 curr;
  vec4 next;
  vec3 source;
  vec3 target;

  if ((arc.greatCircle || project.projectionMode == PROJECTION_MODE_GLOBE) && project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
    source = project_globe_(vec3(instanceSourcePositions.xy, 0.0));
    target = project_globe_(vec3(instanceTargetPositions.xy, 0.0));
    float angularDist = getAngularDist(instanceSourcePositions.xy, instanceTargetPositions.xy);

    vec3 prevPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, prevSegmentRatio);
    vec3 currPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, segmentRatio);
    vec3 nextPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, nextSegmentRatio);

    if (abs(currPos.x - prevPos.x) > 180.0) {
      indexDir = -1.0;
      isValid = 0.0;
    } else if (abs(currPos.x - nextPos.x) > 180.0) {
      indexDir = 1.0;
      isValid = 0.0;
    }
    nextPos = indexDir < 0.0 ? prevPos : nextPos;
    nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;

    if (isValid == 0.0) {
      // split at the 180th meridian
      nextPos.x += nextPos.x > 0.0 ? -360.0 : 360.0;
      float t = ((currPos.x > 0.0 ? 180.0 : -180.0) - currPos.x) / (nextPos.x - currPos.x);
      currPos = mix(currPos, nextPos, t);
      segmentRatio = mix(segmentRatio, nextSegmentRatio, t);
    }

    vec3 currPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, segmentRatio);
    vec3 nextPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, nextSegmentRatio);
  
    curr = project_position_to_clipspace(currPos, currPos64Low, vec3(0.0), geometry.position);
    next = project_position_to_clipspace(nextPos, nextPos64Low, vec3(0.0));
  
  } else {
    vec3 source_world = instanceSourcePositions;
    vec3 target_world = instanceTargetPositions;
    if (arc.useShortestPath) {
      source_world.x = mod(source_world.x + 180., 360.0) - 180.;
      target_world.x = mod(target_world.x + 180., 360.0) - 180.;

      float deltaLng = target_world.x - source_world.x;
      if (deltaLng > 180.) target_world.x -= 360.;
      if (deltaLng < -180.) source_world.x -= 360.;
    }
    source = project_position(source_world, instanceSourcePositions64Low);
    target = project_position(target_world, instanceTargetPositions64Low);

    // common x at longitude=-180
    float antiMeridianX = 0.0;

    if (arc.useShortestPath) {
      if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
        antiMeridianX = -(project.coordinateOrigin.x + 180.) / 360. * TILE_SIZE;
      }
      float thresholdRatio = (antiMeridianX - source.x) / (target.x - source.x);

      if (prevSegmentRatio <= thresholdRatio && nextSegmentRatio > thresholdRatio) {
        isValid = 0.0;
        indexDir = sign(segmentRatio - thresholdRatio);
        segmentRatio = thresholdRatio;
      }
    }

    nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
    vec3 currPos = interpolateFlat(source, target, segmentRatio);
    vec3 nextPos = interpolateFlat(source, target, nextSegmentRatio);

    if (arc.useShortestPath) {
      if (nextPos.x < antiMeridianX) {
        currPos.x += TILE_SIZE;
        nextPos.x += TILE_SIZE;
      }
    }

    curr = project_common_position_to_clipspace(vec4(currPos, 1.0));
    next = project_common_position_to_clipspace(vec4(nextPos, 1.0));
    geometry.position = vec4(currPos, 1.0);
  }

  // Multiply out width and clamp to limits
  // mercator pixels are interpreted as screen pixels
  float widthPixels = clamp(
    project_size_to_pixel(instanceWidths * arc.widthScale, arc.widthUnits),
    arc.widthMinPixels, arc.widthMaxPixels
  );

  // extrude
  vec3 offset = vec3(
    getExtrusionOffset((next.xy - curr.xy) * indexDir, segmentSide, widthPixels),
    0.0);
  DECKGL_FILTER_SIZE(offset, geometry);
#ifdef ANTIALIASING
  float halfWidthPixels = length(offset.xy);
  if (halfWidthPixels > 0.0) {
    // The coverage ramp is centered on the declared edge. Extend the rasterized envelope by half
    // a device pixel so fragments on the outside half of the ramp are generated too.
    float coverageScale = 1.0 + 0.5 / project.devicePixelRatio / halfWidthPixels;
    offset.xy *= coverageScale;
    uv.y *= coverageScale;
  }
  geometry.uv = uv;
#endif
  DECKGL_FILTER_GL_POSITION(curr, geometry);
  gl_Position = curr + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);

  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio);
  vColor = vec4(color.rgb, color.a * layer.opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// ../layers/src/arc-layer/arc-layer-fragment.glsl.ts
var arc_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME arc-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 uv;
in float isValid;

out vec4 fragColor;

void main(void) {
#ifdef ANTIALIASING
  float edgeCoord = abs(uv.y);
  float edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
#endif

  if (isValid == 0.0) {
    discard;
  }

#ifdef ANTIALIASING
  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }
#endif

  fragColor = vColor;
  geometry.uv = uv;

#ifdef ANTIALIASING
  // Feather one device pixel across the width. Arc segments meet lengthwise, so only soften the
  // two outer edges of the strip.
  fragColor.a *= smoothedge(0.0, edgePixels);
#endif

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/arc-layer/arc-layer.ts
var DEFAULT_COLOR = [0, 0, 0, 255];
var defaultProps2 = {
  getSourcePosition: { type: "accessor", value: (x) => x.sourcePosition },
  getTargetPosition: { type: "accessor", value: (x) => x.targetPosition },
  getSourceColor: { type: "accessor", value: DEFAULT_COLOR },
  getTargetColor: { type: "accessor", value: DEFAULT_COLOR },
  getWidth: { type: "accessor", value: 1 },
  getHeight: { type: "accessor", value: 1 },
  getTilt: { type: "accessor", value: 0 },
  greatCircle: false,
  numSegments: { type: "number", value: 50, min: 1 },
  widthUnits: "pixels",
  widthScale: { type: "number", value: 1, min: 0 },
  widthMinPixels: { type: "number", value: 0, min: 0 },
  widthMaxPixels: { type: "number", value: Number.MAX_SAFE_INTEGER, min: 0 },
  antialiasing: false
};
var ArcLayer = class extends Layer {
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds([
      "instanceSourcePositions",
      "instanceTargetPositions"
    ]);
  }
  getShaders() {
    const { antialiasing } = this.props;
    return super.getShaders({
      vs: arc_layer_vertex_glsl_default,
      fs: arc_layer_fragment_glsl_default,
      source: shaderWGSL,
      defines: antialiasing ? { ANTIALIASING: 1 } : {},
      modules: [project32_default, color_default, picking_default, arcUniforms]
    });
  }
  // This layer has its own wrapLongitude logic
  get wrapLongitude() {
    return false;
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getSourcePosition"
      },
      instanceTargetPositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getTargetPosition"
      },
      instanceSourceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getSourceColor",
        defaultValue: DEFAULT_COLOR
      },
      instanceTargetColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getTargetColor",
        defaultValue: DEFAULT_COLOR
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: "getWidth",
        defaultValue: 1
      },
      instanceHeights: {
        size: 1,
        transition: true,
        accessor: "getHeight",
        defaultValue: 1
      },
      instanceTilts: {
        size: 1,
        transition: true,
        accessor: "getTilt",
        defaultValue: 0
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const {
      widthUnits,
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      greatCircle,
      wrapLongitude,
      numSegments
    } = this.props;
    const arcProps = {
      numSegments,
      widthUnits: UNIT[widthUnits],
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      greatCircle,
      useShortestPath: wrapLongitude
    };
    const model = this.state.model;
    model.shaderInputs.setProps({ arc: arcProps });
    model.setVertexCount(numSegments * 2);
    model.draw(this.context.renderPass);
  }
  _getModel() {
    return new import_engine4.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      topology: "triangle-strip",
      isInstanced: true
    });
  }
};
ArcLayer.layerName = "ArcLayer";
ArcLayer.defaultProps = defaultProps2;

// ../layers/src/bitmap-layer/bitmap-layer.ts
var import_engine5 = require("@luma.gl/engine");
var import_web_mercator7 = require("@math.gl/web-mercator");

// ../layers/src/bitmap-layer/create-mesh.ts
var import_core16 = require("@math.gl/core");
var DEFAULT_INDICES = new Uint32Array([0, 2, 1, 0, 3, 2]);
var DEFAULT_TEX_COORDS = new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]);
function createMesh(bounds, resolution) {
  if (!resolution) {
    return createQuad(bounds);
  }
  const maxXSpan = Math.max(
    Math.abs(bounds[0][0] - bounds[3][0]),
    Math.abs(bounds[1][0] - bounds[2][0])
  );
  const maxYSpan = Math.max(
    Math.abs(bounds[1][1] - bounds[0][1]),
    Math.abs(bounds[2][1] - bounds[3][1])
  );
  const uCount = Math.ceil(maxXSpan / resolution) + 1;
  const vCount = Math.ceil(maxYSpan / resolution) + 1;
  const vertexCount = (uCount - 1) * (vCount - 1) * 6;
  const indices = new Uint32Array(vertexCount);
  const texCoords = new Float32Array(uCount * vCount * 2);
  const positions = new Float64Array(uCount * vCount * 3);
  let vertex = 0;
  let index = 0;
  for (let u = 0; u < uCount; u++) {
    const ut = u / (uCount - 1);
    for (let v = 0; v < vCount; v++) {
      const vt = v / (vCount - 1);
      const p = interpolateQuad(bounds, ut, vt);
      positions[vertex * 3 + 0] = p[0];
      positions[vertex * 3 + 1] = p[1];
      positions[vertex * 3 + 2] = p[2] || 0;
      texCoords[vertex * 2 + 0] = ut;
      texCoords[vertex * 2 + 1] = 1 - vt;
      if (u > 0 && v > 0) {
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - vCount - 1;
        indices[index++] = vertex - 1;
        indices[index++] = vertex - vCount;
        indices[index++] = vertex - 1;
        indices[index++] = vertex;
      }
      vertex++;
    }
  }
  return {
    vertexCount,
    positions,
    indices,
    texCoords
  };
}
function createQuad(bounds) {
  const positions = new Float64Array(12);
  for (let i = 0; i < bounds.length; i++) {
    positions[i * 3 + 0] = bounds[i][0];
    positions[i * 3 + 1] = bounds[i][1];
    positions[i * 3 + 2] = bounds[i][2] || 0;
  }
  return {
    vertexCount: 6,
    positions,
    indices: DEFAULT_INDICES,
    texCoords: DEFAULT_TEX_COORDS
  };
}
function interpolateQuad(quad, ut, vt) {
  return (0, import_core16.lerp)((0, import_core16.lerp)(quad[0], quad[1], vt), (0, import_core16.lerp)(quad[3], quad[2], vt), ut);
}

// ../layers/src/bitmap-layer/bitmap-layer-uniforms.ts
var uniformBlockWGSL2 = (
  /* wgsl */
  `
struct BitmapUniforms {
  bounds: vec4<f32>,
  coordinateConversion: f32,
  desaturate: f32,
  tintColor: vec3<f32>,
  transparentColor: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> bitmap: BitmapUniforms;
@group(0) @binding(auto) var bitmapTexture: texture_2d<f32>;
@group(0) @binding(auto) var bitmapTextureSampler: sampler;
`
);
var uniformBlockGLSL = `layout(std140) uniform bitmapUniforms {
  vec4 bounds;
  float coordinateConversion;
  float desaturate;
  vec3 tintColor;
  vec4 transparentColor;
} bitmap;
`;
var bitmapUniforms = {
  name: "bitmap",
  source: uniformBlockWGSL2,
  vs: uniformBlockGLSL,
  fs: uniformBlockGLSL,
  uniformTypes: {
    bounds: "vec4<f32>",
    coordinateConversion: "f32",
    desaturate: "f32",
    tintColor: "vec3<f32>",
    transparentColor: "vec4<f32>"
  }
};

// ../layers/src/bitmap-layer/bitmap-layer.wgsl.ts
var bitmap_layer_wgsl_default = (
  /* wgsl */
  `struct Attributes {
  @location(0) positions: vec3<f32>,
  @location(1) positions64Low: vec3<f32>,
  @location(2) texCoords: vec2<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vTexCoord: vec2<f32>,
  @location(1) vTexPos: vec2<f32>,
  @location(2) pickingColor: vec3<f32>,
  @location(3) pickingDepth: f32,
};

// from degrees to Web Mercator
fn lnglat_to_mercator(lnglat: vec2<f32>) -> vec2<f32> {
  let x = lnglat.x;
  let y = clamp(lnglat.y, -89.9, 89.9);
  return vec2<f32>(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// from Web Mercator to degrees
fn mercator_to_lnglat(xy: vec2<f32>) -> vec2<f32> {
  let position = xy / WORLD_SCALE;
  return degrees(vec2<f32>(
    position.x - PI,
    atan(exp(position.y - PI)) * 2.0 - PI * 0.5
  ));
}

fn color_desaturate(colorValue: vec3<f32>) -> vec3<f32> {
  let luminance = (colorValue.r + colorValue.g + colorValue.b) * 0.333333333;
  return mix(colorValue, vec3<f32>(luminance), bitmap.desaturate);
}

fn color_tint(colorValue: vec3<f32>) -> vec3<f32> {
  return colorValue * bitmap.tintColor;
}

fn apply_opacity(colorValue: vec3<f32>, alpha: f32) -> vec4<f32> {
  if (bitmap.transparentColor.a == 0.0) {
    return vec4<f32>(colorValue, alpha);
  }
  let blendedAlpha = alpha + bitmap.transparentColor.a * (1.0 - alpha);
  let highLightRatio = alpha / blendedAlpha;
  let blendedRGB = mix(bitmap.transparentColor.rgb, colorValue, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn getUV(position: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    (position.x - bitmap.bounds[0]) / (bitmap.bounds[2] - bitmap.bounds[0]),
    (position.y - bitmap.bounds[3]) / (bitmap.bounds[1] - bitmap.bounds[3])
  );
}

// Pack the top 12 bits of two normalized floats into three 8-bit values.
fn packUVsIntoRGB(uv: vec2<f32>) -> vec3<f32> {
  let uv8bit = floor(uv * 256.0);
  let uvFraction = fract(uv * 256.0);
  let uvFraction4bit = floor(uvFraction * 16.0);
  let fractions = uvFraction4bit.x + uvFraction4bit.y * 16.0;
  return vec3<f32>(uv8bit, fractions) / 255.0;
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  geometry.worldPosition = attributes.positions;
  geometry.uv = attributes.texCoords;
  geometry.pickingColor = picking_getPickingColorFromIndex(0u);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    attributes.positions,
    attributes.positions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  output.position = projectedPosition.clipPosition;
  output.vTexCoord = attributes.texCoords;
  output.vTexPos = vec2<f32>(0.0);
  output.pickingColor = geometry.pickingColor;
  output.pickingDepth = output.position.z / output.position.w;

  if (bitmap.coordinateConversion < -0.5) {
    output.vTexPos = geometry.position.xy + project.commonOrigin.xy;
  } else if (bitmap.coordinateConversion > 0.5) {
    output.vTexPos = geometry.worldPosition.xy;
  }

  return output;
}

@fragment
fn fragmentMain(input: Varyings) -> @location(0) vec4<f32> {
  var uv = input.vTexCoord;
  if (bitmap.coordinateConversion < -0.5) {
    uv = getUV(mercator_to_lnglat(input.vTexPos));
  } else if (bitmap.coordinateConversion > 0.5) {
    uv = getUV(lnglat_to_mercator(input.vTexPos));
  }

  let bitmapColor = textureSample(bitmapTexture, bitmapTextureSampler, uv);
  var fragColor = apply_opacity(
    color_tint(color_desaturate(bitmapColor.rgb)),
    bitmapColor.a * layer.opacity
  );

  geometry.uv = uv;

  if (picking.isActive > 0.5) {
    if (picking.isAttribute > 0.5) {
      return vec4<f32>(input.pickingDepth, 0.0, 0.0, 1.0);
    }
    return vec4<f32>(packUVsIntoRGB(uv), 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(input.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`
);

// ../layers/src/bitmap-layer/bitmap-layer-vertex.ts
var bitmap_layer_vertex_default = `#version 300 es
#define SHADER_NAME bitmap-layer-vertex-shader

in vec2 texCoords;
in vec3 positions;
in vec3 positions64Low;

out vec2 vTexCoord;
out vec2 vTexPos;

const vec3 pickingColor = vec3(1.0, 0.0, 0.0);

void main(void) {
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  geometry.pickingColor = pickingColor;

  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vTexCoord = texCoords;

  if (bitmap.coordinateConversion < -0.5) {
    vTexPos = geometry.position.xy + project.commonOrigin.xy;
  } else if (bitmap.coordinateConversion > 0.5) {
    vTexPos = geometry.worldPosition.xy;
  }

  vec4 color = vec4(0.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`;

// ../layers/src/bitmap-layer/bitmap-layer-fragment.ts
var packUVsIntoRGB = `
vec3 packUVsIntoRGB(vec2 uv) {
  // Extract the top 8 bits. We want values to be truncated down so we can add a fraction
  vec2 uv8bit = floor(uv * 256.);

  // Calculate the normalized remainders of u and v parts that do not fit into 8 bits
  // Scale and clamp to 0-1 range
  vec2 uvFraction = fract(uv * 256.);
  vec2 uvFraction4bit = floor(uvFraction * 16.);

  // Remainder can be encoded in blue channel, encode as 4 bits for pixel coordinates
  float fractions = uvFraction4bit.x + uvFraction4bit.y * 16.;

  return vec3(uv8bit, fractions) / 255.;
}
`;
var bitmap_layer_fragment_default = `#version 300 es
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;

in vec2 vTexCoord;
in vec2 vTexPos;

out vec4 fragColor;

/* projection utils */
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / PI / 2.0;

// from degrees to Web Mercator
vec2 lnglat_to_mercator(vec2 lnglat) {
  float x = lnglat.x;
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + PI,
    PI + log(tan(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

// from Web Mercator to degrees
vec2 mercator_to_lnglat(vec2 xy) {
  xy /= WORLD_SCALE;
  return degrees(vec2(
    xy.x - PI,
    atan(exp(xy.y - PI)) * 2.0 - PI * 0.5
  ));
}
/* End projection utils */

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), bitmap.desaturate);
}

// apply tint
vec3 color_tint(vec3 color) {
  return color * bitmap.tintColor;
}

// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  if (bitmap.transparentColor.a == 0.0) {
    return vec4(color, alpha);
  }
  float blendedAlpha = alpha + bitmap.transparentColor.a * (1.0 - alpha);
  float highLightRatio = alpha / blendedAlpha;
  vec3 blendedRGB = mix(bitmap.transparentColor.rgb, color, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

vec2 getUV(vec2 pos) {
  return vec2(
    (pos.x - bitmap.bounds[0]) / (bitmap.bounds[2] - bitmap.bounds[0]),
    (pos.y - bitmap.bounds[3]) / (bitmap.bounds[1] - bitmap.bounds[3])
  );
}

${packUVsIntoRGB}

void main(void) {
  vec2 uv = vTexCoord;
  if (bitmap.coordinateConversion < -0.5) {
    vec2 lnglat = mercator_to_lnglat(vTexPos);
    uv = getUV(lnglat);
  } else if (bitmap.coordinateConversion > 0.5) {
    vec2 commonPos = lnglat_to_mercator(vTexPos);
    uv = getUV(commonPos);
  }
  vec4 bitmapColor = texture(bitmapTexture, uv);

  fragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * layer.opacity);

  geometry.uv = uv;
  DECKGL_FILTER_COLOR(fragColor, geometry);

  if (bool(picking.isActive) && !bool(picking.isAttribute)) {
    // Since instance information is not used, we can use picking color for pixel index
    fragColor.rgb = packUVsIntoRGB(uv);
  }
}
`;

// ../layers/src/bitmap-layer/bitmap-layer.ts
var defaultProps3 = {
  image: { type: "image", value: null, async: true },
  bounds: { type: "array", value: [1, 0, 0, 1], compare: true },
  _imageCoordinateSystem: "default",
  desaturate: { type: "number", min: 0, max: 1, value: 0 },
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: { type: "color", value: [0, 0, 0, 0] },
  tintColor: { type: "color", value: [255, 255, 255] },
  textureParameters: { type: "object", ignore: true, value: null }
};
var BitmapLayer = class extends Layer {
  getShaders() {
    return super.getShaders({
      vs: bitmap_layer_vertex_default,
      fs: bitmap_layer_fragment_default,
      source: bitmap_layer_wgsl_default,
      modules: [color_default, project32_default, picking_default, bitmapUniforms]
    });
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    const noAlloc = true;
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        update: (attribute) => attribute.value = this.state.mesh.indices,
        noAlloc
      },
      positions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        update: (attribute) => attribute.value = this.state.mesh.positions,
        noAlloc
      },
      texCoords: {
        size: 2,
        update: (attribute) => attribute.value = this.state.mesh.texCoords,
        noAlloc
      }
    });
  }
  updateState({ props, oldProps, changeFlags }) {
    var _a;
    const attributeManager = this.getAttributeManager();
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
    if (props.bounds !== oldProps.bounds) {
      const oldMesh = this.state.mesh;
      const mesh = this._createMesh();
      this.state.model.setVertexCount(mesh.vertexCount);
      for (const key in mesh) {
        if (oldMesh && oldMesh[key] !== mesh[key]) {
          attributeManager.invalidate(key);
        }
      }
      this.setState({ mesh, ...this._getCoordinateUniforms() });
    } else if (props._imageCoordinateSystem !== oldProps._imageCoordinateSystem) {
      this.setState(this._getCoordinateUniforms());
    }
  }
  getPickingInfo(params) {
    const { image } = this.props;
    const info = params.info;
    if (!info.color || !image) {
      info.bitmap = null;
      return info;
    }
    const { width, height } = image;
    info.index = 0;
    const uv = unpackUVsFromRGB(info.color);
    info.bitmap = {
      size: { width, height },
      uv,
      pixel: [Math.floor(uv[0] * width), Math.floor(uv[1] * height)]
    };
    return info;
  }
  // Override base Layer multi-depth picking logic
  disablePickingIndex() {
    this.setState({ disablePicking: true });
  }
  restorePickingColors() {
    this.setState({ disablePicking: false });
  }
  _updateAutoHighlight(info) {
    super._updateAutoHighlight({
      ...info,
      color: this.encodePickingColor(0)
    });
  }
  _createMesh() {
    const { bounds } = this.props;
    let normalizedBounds = bounds;
    if (isRectangularBounds(bounds)) {
      normalizedBounds = [
        [bounds[0], bounds[1]],
        [bounds[0], bounds[3]],
        [bounds[2], bounds[3]],
        [bounds[2], bounds[1]]
      ];
    }
    return createMesh(normalizedBounds, this.context.viewport.resolution);
  }
  _getModel() {
    const bufferLayout = this.context.device.type === "webgpu" ? this.getAttributeManager().getBufferLayouts({ isInstanced: false }).filter((layout) => layout.name !== "indices") : this.getAttributeManager().getBufferLayouts();
    return new import_engine5.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout,
      topology: "triangle-list",
      isInstanced: false
    });
  }
  draw(opts) {
    const { shaderModuleProps } = opts;
    const { model, coordinateConversion, bounds, disablePicking } = this.state;
    const { image, desaturate, transparentColor, tintColor } = this.props;
    if (shaderModuleProps.picking.isActive && disablePicking) {
      return;
    }
    if (image && model) {
      const bitmapProps = {
        bitmapTexture: image,
        bounds,
        coordinateConversion,
        desaturate,
        tintColor: tintColor.slice(0, 3).map((x) => x / 255),
        transparentColor: transparentColor.map((x) => x / 255)
      };
      model.shaderInputs.setProps({ bitmap: bitmapProps });
      model.draw(this.context.renderPass);
    }
  }
  _getCoordinateUniforms() {
    let { _imageCoordinateSystem: imageCoordinateSystem } = this.props;
    if (imageCoordinateSystem !== "default") {
      const { bounds } = this.props;
      if (!isRectangularBounds(bounds)) {
        throw new Error("_imageCoordinateSystem only supports rectangular bounds");
      }
      const defaultImageCoordinateSystem = this.context.viewport.resolution ? "lnglat" : "cartesian";
      imageCoordinateSystem = imageCoordinateSystem === "lnglat" ? "lnglat" : "cartesian";
      if (imageCoordinateSystem === "lnglat" && defaultImageCoordinateSystem === "cartesian") {
        return { coordinateConversion: -1, bounds };
      }
      if (imageCoordinateSystem === "cartesian" && defaultImageCoordinateSystem === "lnglat") {
        const bottomLeft = (0, import_web_mercator7.lngLatToWorld)([bounds[0], bounds[1]]);
        const topRight = (0, import_web_mercator7.lngLatToWorld)([bounds[2], bounds[3]]);
        return {
          coordinateConversion: 1,
          bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
        };
      }
    }
    return {
      coordinateConversion: 0,
      bounds: [0, 0, 0, 0]
    };
  }
};
BitmapLayer.layerName = "BitmapLayer";
BitmapLayer.defaultProps = defaultProps3;
function unpackUVsFromRGB(color) {
  const [u, v, fracUV] = color;
  const vFrac = (fracUV & 240) / 256;
  const uFrac = (fracUV & 15) / 16;
  return [(u + uFrac) / 256, (v + vFrac) / 256];
}
function isRectangularBounds(bounds) {
  return Number.isFinite(bounds[0]);
}

// ../layers/src/icon-layer/icon-layer.ts
var import_engine6 = require("@luma.gl/engine");

// ../layers/src/icon-layer/icon-layer-uniforms.ts
var uniformBlock4 = `layout(std140) uniform iconUniforms {
  float sizeScale;
  vec2 iconsTextureDim;
  float sizeBasis;
  float sizeMinPixels;
  float sizeMaxPixels;
  bool billboard;
  highp int sizeUnits;
  float alphaCutoff;
} icon;
`;
var iconUniforms = {
  name: "icon",
  vs: uniformBlock4,
  fs: uniformBlock4,
  uniformTypes: {
    sizeScale: "f32",
    iconsTextureDim: "vec2<f32>",
    sizeBasis: "f32",
    sizeMinPixels: "f32",
    sizeMaxPixels: "f32",
    billboard: "f32",
    sizeUnits: "i32",
    alphaCutoff: "f32"
  }
};

// ../layers/src/icon-layer/icon-layer-vertex.glsl.ts
var icon_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME icon-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;

out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = angle * PI / 180.0;
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
#ifdef USE_ROW_INDEXES
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
  geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif
  uv = positions;

  vec2 iconSize = instanceIconFrames.zw;
  // convert size in meters to pixels, then scaled and clamp
 
  // project meters to pixels and clamp to limits 
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  // Choose correct constraint based on the 'sizeBasis' value (0.0 = width, 1.0 = height)
  float iconConstraint = icon.sizeBasis == 0.0 ? iconSize.x : iconSize.y;
  float instanceScale = iconConstraint == 0.0 ? 0.0 : sizePixels / iconConstraint;

  // scale and rotate vertex in "pixel" value and convert back to fraction in clipspace
  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
  pixelOffset += instancePixelOffset;
  pixelOffset.y *= -1.0;

  if (icon.billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position); 
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / icon.iconsTextureDim;

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);

  vColorMode = instanceColorModes;
}
`;

// ../layers/src/icon-layer/icon-layer-fragment.glsl.ts
var icon_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME icon-layer-fragment-shader

precision highp float;

uniform sampler2D iconsTexture;

in float vColorMode;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  vec4 texColor = texture(iconsTexture, vTextureCoords);

  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 or rendering picking buffer, use texture as transparency mask
  vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);
  // Take the global opacity and the alpha from vColor into account for the alpha component
  float a = texColor.a * layer.opacity * vColor.a;

  if (a < icon.alphaCutoff) {
    discard;
  }

  fragColor = vec4(color, a);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/icon-layer/icon-layer.wgsl.ts
var shaderWGSL2 = (
  /* wgsl */
  `struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, s), vec2<f32>(-s, c));
  return rotation * vertex;
}

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instanceIconFrames: vec4<f32>,
  @location(7) instanceColorModes: f32,
  @location(8) instanceOffsets: vec2<f32>,
  @location(9) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vColorMode: f32,
  @location(1) vColor: vec4<f32>,
  @location(2) vTextureCoords: vec2<f32>,
  @location(3) uv: vec2<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  // write geometry fields used by filters + FS
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = PICKING_COLOR_VALUE;

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  // convert size in meters to pixels, then clamp
  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  // scale icon height to match instanceSize
  let iconConstraint = select(iconSize.y, iconSize.x, icon.sizeBasis == 0.0);
  let instanceScale = select(sizePixels / iconConstraint, 0.0, iconConstraint == 0.0);

  // scale and rotate vertex in "pixel" units; then add per-instance pixel offset
  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  if (icon.billboard != 0) {
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0)); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);

    var offset = vec3<f32>(pixelOffset, 0.0);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipOffset = project_pixel_size_to_clipspace(offset.xy);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
    outp.position = pos;
  } else {
    var offset_common = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    // DECKGL_FILTER_SIZE(offset_common, geometry);
    var pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offset_common); // TODO, &geometry.position);
    // DECKGL_FILTER_GL_POSITION(pos, geometry);
    outp.position = pos;
  }

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.vColor = inp.instanceColors;
  // DECKGL_FILTER_COLOR(outp.vColor, geometry);

  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = geometry.pickingColor;

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  // expose to deck.gl filter hooks
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);

  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 (or picking), use texture as transparency mask
  let rgb = mix(texColor.rgb, inp.vColor.rgb, inp.vColorMode);
  let a = texColor.a * layer.opacity * inp.vColor.a;

  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(rgb, a));

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return fragColor;
}
`
);
function getShaderWGSL(useRowIndexes) {
  return shaderWGSL2.replace("PICKING_COLOR_ATTRIBUTE", useRowIndexes ? "@location(10) rowIndexes: u32," : "").replace(
    "PICKING_COLOR_VALUE",
    useRowIndexes ? "picking_getPickingColorFromIndex(inp.rowIndexes)" : "picking_getPickingColorFromIndex(inp.instanceIndex)"
  );
}

// ../layers/src/icon-layer/icon-manager.ts
var import_core18 = require("@loaders.gl/core");
var DEFAULT_CANVAS_WIDTH = 1024;
var DEFAULT_BUFFER = 4;
var noop = () => {
};
var DEFAULT_SAMPLER_PARAMETERS = {
  minFilter: "linear",
  mipmapFilter: "linear",
  // LINEAR is the default value but explicitly set it here
  magFilter: "linear",
  // minimize texture boundary artifacts
  addressModeU: "clamp-to-edge",
  addressModeV: "clamp-to-edge"
};
var MISSING_ICON = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
function nextPowOfTwo(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}
function resizeImage(ctx, imageData, maxWidth, maxHeight) {
  const resizeRatio = Math.min(maxWidth / imageData.width, maxHeight / imageData.height);
  const width = Math.floor(imageData.width * resizeRatio);
  const height = Math.floor(imageData.height * resizeRatio);
  if (resizeRatio === 1) {
    return { image: imageData, width, height };
  }
  ctx.canvas.height = height;
  ctx.canvas.width = width;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(imageData, 0, 0, imageData.width, imageData.height, 0, 0, width, height);
  return { image: ctx.canvas, width, height };
}
function getIconId(icon) {
  return icon && (icon.id || icon.url);
}
function regenerateMipmaps(texture) {
  const { device } = texture;
  if (device.type === "webgl") {
    texture.generateMipmapsWebGL();
  } else if (device.type === "webgpu") {
    device.generateMipmapsWebGPU(texture);
  }
}
function resizeTexture(texture, width, height, sampler) {
  const { width: oldWidth, height: oldHeight, device } = texture;
  const newTexture = device.createTexture({
    format: "rgba8unorm",
    width,
    height,
    sampler,
    mipLevels: device.getMipLevelCount(width, height)
  });
  const commandEncoder = device.createCommandEncoder();
  commandEncoder.copyTextureToTexture({
    sourceTexture: texture,
    destinationTexture: newTexture,
    width: oldWidth,
    height: oldHeight
  });
  const commandBuffer = commandEncoder.finish();
  device.submit(commandBuffer);
  regenerateMipmaps(newTexture);
  texture.destroy();
  return newTexture;
}
function buildRowMapping(mapping, columns, yOffset) {
  for (let i = 0; i < columns.length; i++) {
    const { icon, xOffset } = columns[i];
    const id = getIconId(icon);
    mapping[id] = {
      ...icon,
      x: xOffset,
      y: yOffset
    };
  }
}
function buildMapping({
  icons,
  buffer,
  mapping = {},
  xOffset = 0,
  yOffset = 0,
  rowHeight = 0,
  canvasWidth
}) {
  let columns = [];
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const id = getIconId(icon);
    if (!mapping[id]) {
      const { height, width } = icon;
      if (xOffset + width + buffer > canvasWidth) {
        buildRowMapping(mapping, columns, yOffset);
        xOffset = 0;
        yOffset = rowHeight + yOffset + buffer;
        rowHeight = 0;
        columns = [];
      }
      columns.push({
        icon,
        xOffset
      });
      xOffset = xOffset + width + buffer;
      rowHeight = Math.max(rowHeight, height);
    }
  }
  if (columns.length > 0) {
    buildRowMapping(mapping, columns, yOffset);
  }
  return {
    mapping,
    rowHeight,
    xOffset,
    yOffset,
    canvasWidth,
    canvasHeight: nextPowOfTwo(rowHeight + yOffset + buffer)
  };
}
function getDiffIcons(data, getIcon, cachedIcons) {
  if (!data || !getIcon) {
    return null;
  }
  cachedIcons = cachedIcons || {};
  const icons = {};
  const { iterable, objectInfo } = createIterable(data);
  for (const object of iterable) {
    objectInfo.index++;
    const icon = getIcon(object, objectInfo);
    const id = getIconId(icon);
    if (!icon) {
      throw new Error("Icon is missing.");
    }
    if (!icon.url) {
      throw new Error("Icon url is missing.");
    }
    if (!icons[id] && (!cachedIcons[id] || icon.url !== cachedIcons[id].url)) {
      icons[id] = { ...icon, source: object, sourceIndex: objectInfo.index };
    }
  }
  return icons;
}
var IconManager = class {
  constructor(device, {
    onUpdate = noop,
    onError = noop
  }) {
    this._loadOptions = null;
    this._texture = null;
    this._externalTexture = null;
    this._mapping = {};
    this._samplerParameters = null;
    /** count of pending requests to fetch icons */
    this._pendingCount = 0;
    this._autoPacking = false;
    // / internal state used for autoPacking
    this._xOffset = 0;
    this._yOffset = 0;
    this._rowHeight = 0;
    this._buffer = DEFAULT_BUFFER;
    this._canvasWidth = DEFAULT_CANVAS_WIDTH;
    this._canvasHeight = 0;
    this._canvas = null;
    this.device = device;
    this.onUpdate = onUpdate;
    this.onError = onError;
  }
  finalize() {
    var _a;
    (_a = this._texture) == null ? void 0 : _a.delete();
  }
  getTexture() {
    return this._texture || this._externalTexture;
  }
  getIconMapping(icon) {
    const id = this._autoPacking ? getIconId(icon) : icon;
    return this._mapping[id] || MISSING_ICON;
  }
  setProps({
    loadOptions,
    autoPacking,
    iconAtlas,
    iconMapping,
    textureParameters
  }) {
    var _a;
    if (loadOptions) {
      this._loadOptions = loadOptions;
    }
    if (autoPacking !== void 0) {
      this._autoPacking = autoPacking;
    }
    if (iconMapping) {
      this._mapping = iconMapping;
    }
    if (iconAtlas) {
      (_a = this._texture) == null ? void 0 : _a.delete();
      this._texture = null;
      this._externalTexture = iconAtlas;
    }
    if (textureParameters) {
      this._samplerParameters = textureParameters;
    }
  }
  get isLoaded() {
    return this._pendingCount === 0;
  }
  packIcons(data, getIcon) {
    if (!this._autoPacking || typeof document === "undefined") {
      return;
    }
    const icons = Object.values(getDiffIcons(data, getIcon, this._mapping) || {});
    if (icons.length > 0) {
      const { mapping, xOffset, yOffset, rowHeight, canvasHeight } = buildMapping({
        icons,
        buffer: this._buffer,
        canvasWidth: this._canvasWidth,
        mapping: this._mapping,
        rowHeight: this._rowHeight,
        xOffset: this._xOffset,
        yOffset: this._yOffset
      });
      this._rowHeight = rowHeight;
      this._mapping = mapping;
      this._xOffset = xOffset;
      this._yOffset = yOffset;
      this._canvasHeight = canvasHeight;
      if (!this._texture) {
        this._texture = this.device.createTexture({
          format: "rgba8unorm",
          data: null,
          width: this._canvasWidth,
          height: this._canvasHeight,
          sampler: this._samplerParameters || DEFAULT_SAMPLER_PARAMETERS,
          mipLevels: this.device.getMipLevelCount(this._canvasWidth, this._canvasHeight)
        });
      }
      if (this._texture.height !== this._canvasHeight) {
        this._texture = resizeTexture(
          this._texture,
          this._canvasWidth,
          this._canvasHeight,
          this._samplerParameters || DEFAULT_SAMPLER_PARAMETERS
        );
      }
      this.onUpdate(true);
      this._canvas = this._canvas || document.createElement("canvas");
      this._loadIcons(icons);
    }
  }
  _loadIcons(icons) {
    const ctx = this._canvas.getContext("2d", {
      willReadFrequently: true
    });
    for (const icon of icons) {
      this._pendingCount++;
      (0, import_core18.load)(icon.url, this._loadOptions).then((imageData) => {
        var _a;
        const id = getIconId(icon);
        const iconDef = this._mapping[id];
        const { x: initialX, y: initialY, width: maxWidth, height: maxHeight } = iconDef;
        const { image, width, height } = resizeImage(
          ctx,
          imageData,
          maxWidth,
          maxHeight
        );
        const x = initialX + (maxWidth - width) / 2;
        const y = initialY + (maxHeight - height) / 2;
        (_a = this._texture) == null ? void 0 : _a.copyExternalImage({
          image,
          x,
          y,
          width,
          height
        });
        iconDef.x = x;
        iconDef.y = y;
        iconDef.width = width;
        iconDef.height = height;
        if (this._texture) {
          regenerateMipmaps(this._texture);
        }
        this.onUpdate(width !== maxWidth || height !== maxHeight);
      }).catch((error) => {
        this.onError({
          url: icon.url,
          source: icon.source,
          sourceIndex: icon.sourceIndex,
          loadOptions: this._loadOptions,
          error
        });
      }).finally(() => {
        this._pendingCount--;
      });
    }
  }
};

// ../layers/src/icon-layer/icon-layer.ts
var DEFAULT_COLOR2 = [0, 0, 0, 255];
var defaultProps4 = {
  iconAtlas: { type: "image", value: null, async: true },
  iconMapping: { type: "object", value: {}, async: true },
  sizeScale: { type: "number", value: 1, min: 0 },
  billboard: true,
  sizeUnits: "pixels",
  sizeBasis: "height",
  sizeMinPixels: { type: "number", min: 0, value: 0 },
  //  min point radius in pixels
  sizeMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  // max point radius in pixels
  alphaCutoff: { type: "number", value: 0.05, min: 0, max: 1 },
  getPosition: { type: "accessor", value: (x) => x.position },
  getIcon: { type: "accessor", value: (x) => x.icon },
  getColor: { type: "accessor", value: DEFAULT_COLOR2 },
  getSize: { type: "accessor", value: 1 },
  getAngle: { type: "accessor", value: 0 },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  onIconError: { type: "function", value: null, optional: true },
  textureParameters: { type: "object", ignore: true, value: null }
};
var IconLayer = class extends Layer {
  getShaders() {
    var _a, _b;
    const useRowIndexes = Boolean((_b = (_a = this.props.data) == null ? void 0 : _a.attributes) == null ? void 0 : _b.rowIndexes);
    return super.getShaders({
      vs: icon_layer_vertex_glsl_default,
      fs: icon_layer_fragment_glsl_default,
      source: getShaderWGSL(useRowIndexes),
      defines: useRowIndexes ? { USE_ROW_INDEXES: true } : {},
      modules: [project32_default, color_default, picking_default, iconUniforms]
    });
  }
  initializeState() {
    var _a, _b;
    this.state = {
      iconManager: new IconManager(this.context.device, {
        onUpdate: this._onUpdate.bind(this),
        onError: this._onError.bind(this)
      })
    };
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceSizes: {
        size: 1,
        transition: true,
        bufferGroup: "icon-instance-data",
        accessor: "getSize",
        defaultValue: 1
      },
      instanceIconDefs: {
        size: 7,
        bufferGroup: "icon-instance-data",
        accessor: "getIcon",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        transform: this.getInstanceIconDef,
        shaderAttributes: {
          instanceOffsets: {
            size: 2,
            elementOffset: 0
          },
          instanceIconFrames: {
            size: 4,
            elementOffset: 2
          },
          instanceColorModes: {
            size: 1,
            elementOffset: 6
          }
        }
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        bufferGroup: "icon-instance-data",
        accessor: "getColor",
        defaultValue: DEFAULT_COLOR2
      },
      instanceAngles: {
        size: 1,
        transition: true,
        bufferGroup: "icon-instance-data",
        accessor: "getAngle"
      },
      instancePixelOffset: {
        size: 2,
        transition: true,
        bufferGroup: "icon-instance-data",
        accessor: "getPixelOffset"
      },
      ...((_b = (_a = this.props.data) == null ? void 0 : _a.attributes) == null ? void 0 : _b.rowIndexes) ? {
        /** Caller-provided logical picking index per icon instance. */
        rowIndexes: {
          size: 1,
          type: "uint32",
          noAlloc: true
        }
      } : {}
    });
  }
  /* eslint-disable max-statements, complexity */
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const attributeManager = this.getAttributeManager();
    const { iconAtlas, iconMapping, data, getIcon, textureParameters } = props;
    const { iconManager } = this.state;
    if (typeof iconAtlas === "string") {
      return;
    }
    const prePacked = iconAtlas || this.internalState.isAsyncPropLoading("iconAtlas");
    iconManager.setProps({
      loadOptions: props.loadOptions,
      autoPacking: !prePacked,
      iconAtlas,
      iconMapping: prePacked ? iconMapping : null,
      textureParameters
    });
    if (prePacked) {
      if (oldProps.iconMapping !== props.iconMapping) {
        attributeManager.invalidate("getIcon");
      }
    } else if (changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getIcon)) {
      iconManager.packIcons(data, getIcon);
    }
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
  }
  /* eslint-enable max-statements, complexity */
  get isLoaded() {
    return super.isLoaded && this.state.iconManager.isLoaded;
  }
  finalizeState(context) {
    super.finalizeState(context);
    this.state.iconManager.finalize();
  }
  draw({ uniforms }) {
    const { sizeScale, sizeBasis, sizeMinPixels, sizeMaxPixels, sizeUnits, billboard, alphaCutoff } = this.props;
    const { iconManager } = this.state;
    const iconsTexture = iconManager.getTexture();
    if (iconsTexture) {
      const model = this.state.model;
      const iconProps = {
        iconsTexture,
        iconsTextureDim: [iconsTexture.width, iconsTexture.height],
        sizeUnits: UNIT[sizeUnits],
        sizeScale,
        sizeBasis: sizeBasis === "height" ? 1 : 0,
        sizeMinPixels,
        sizeMaxPixels,
        billboard,
        alphaCutoff
      };
      model.shaderInputs.setProps({ icon: iconProps });
      model.draw(this.context.renderPass);
    }
  }
  _getModel() {
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
    return new import_engine6.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine6.Geometry({
        topology: "triangle-strip",
        attributes: {
          // The size must be explicitly passed here otherwise luma.gl
          // will default to assuming that positions are 3D (x,y,z)
          positions: {
            size: 2,
            value: new Float32Array(positions)
          }
        }
      }),
      isInstanced: true
    });
  }
  _onUpdate(didFrameChange) {
    var _a;
    if (didFrameChange) {
      (_a = this.getAttributeManager()) == null ? void 0 : _a.invalidate("getIcon");
      this.setNeedsUpdate();
    } else {
      this.setNeedsRedraw();
    }
  }
  _onError(evt) {
    var _a;
    const onIconError = (_a = this.getCurrentLayer()) == null ? void 0 : _a.props.onIconError;
    if (onIconError) {
      onIconError(evt);
    } else {
      log_default.error(evt.error.message)();
    }
  }
  getInstanceIconDef(icon) {
    const {
      x,
      y,
      width,
      height,
      mask,
      anchorX = width / 2,
      anchorY = height / 2
    } = this.state.iconManager.getIconMapping(icon);
    return [width / 2 - anchorX, height / 2 - anchorY, x, y, width, height, mask ? 1 : 0];
  }
};
IconLayer.defaultProps = defaultProps4;
IconLayer.layerName = "IconLayer";

// ../layers/src/point-cloud-layer/point-cloud-layer.ts
var import_engine7 = require("@luma.gl/engine");

// ../layers/src/point-cloud-layer/point-cloud-layer-uniforms.ts
var glslUniformBlock = `layout(std140) uniform pointCloudUniforms {
  float radiusPixels;
  highp int sizeUnits;
} pointCloud;
`;
var pointCloudUniforms = {
  name: "pointCloud",
  source: "",
  vs: glslUniformBlock,
  fs: glslUniformBlock,
  uniformTypes: {
    radiusPixels: "f32",
    sizeUnits: "i32"
  }
};

// ../layers/src/point-cloud-layer/point-cloud-layer-vertex.glsl.ts
var point_cloud_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME point-cloud-layer-vertex-shader

in vec3 positions;
in vec3 instanceNormals;
in vec4 instanceColors;
in vec3 instancePositions;
in vec3 instancePositions64Low;

out vec4 vColor;
out vec2 unitPosition;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.normal = project_normal(instanceNormals);

  // Position on the enclosing triangle. Its edges are tangent to the unit circle.
  unitPosition = positions.xy;
  geometry.uv = unitPosition;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  // Find the center of the point and add the current vertex
  vec3 offset = vec3(positions.xy * project_size_to_pixel(pointCloud.radiusPixels, pointCloud.sizeUnits), 0.0);
  DECKGL_FILTER_SIZE(offset, geometry);
#ifdef ANTIALIASING
  float triangleRadiusPixels = length(offset.xy);
  if (triangleRadiusPixels > 0.0) {
    // The triangle's inradius is half its vertex radius. Scaling its vertex radius by one device
    // pixel therefore adds half a device pixel around all three tangent points.
    float coverageScale = 1.0 + 1.0 / project.devicePixelRatio / triangleRadiusPixels;
    offset.xy *= coverageScale;
    unitPosition *= coverageScale;
    geometry.uv = unitPosition;
  }
#endif

  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);

  // Apply lighting
  vec3 lightColor = lighting_getLightColor(instanceColors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);

  // Apply opacity to instance color, or return instance picking color
  vColor = vec4(lightColor, instanceColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// ../layers/src/point-cloud-layer/point-cloud-layer-fragment.glsl.ts
var point_cloud_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME point-cloud-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 unitPosition;

out vec4 fragColor;

void main(void) {
  geometry.uv = unitPosition.xy;

  float distToCenter = length(unitPosition);

#ifdef ANTIALIASING
  float edgePixels = (1.0 - distToCenter) / max(fwidth(distToCenter), 1e-6);
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
#else
  if (distToCenter > 1.0) {
#endif
    discard;
  }

  fragColor = vColor;
#ifdef ANTIALIASING
  fragColor.a *= smoothedge(0.0, edgePixels);
#endif
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/point-cloud-layer/point-cloud-layer.wgsl.ts
var shaderWGSL3 = (
  /* wgsl */
  `struct PointCloudUniforms {
  radiusPixels: f32,
  sizeUnits: i32,
};

@group(0) @binding(0)
var<uniform> pointCloudUniforms: PointCloudUniforms;

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceNormals: vec3<f32>,
  @location(4) instanceColors: vec4<f32>
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) unitPosition: vec2<f32>,
  @location(2) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;

  let centerResult = project_position_to_clipspace_and_commonspace(
    attributes.instancePositions,
    attributes.instancePositions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = centerResult.commonPosition;
  geometry.normal = project_normal(attributes.instanceNormals);

  // Position on the enclosing triangle. Its edges are tangent to the unit circle.
  varyings.unitPosition = attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  // Find the center of the point and add the current vertex
#ifdef ANTIALIASING
  var offset = vec3<f32>(
#else
  let offset = vec3<f32>(
#endif
    attributes.positions.xy *
      project_unit_size_to_pixel(pointCloudUniforms.radiusPixels, pointCloudUniforms.sizeUnits),
    0.0
  );
  // DECKGL_FILTER_SIZE(offset, geometry);
#ifdef ANTIALIASING
  let triangleRadiusPixels = length(offset.xy);
  if (triangleRadiusPixels > 0.0) {
    // The triangle's inradius is half its vertex radius. Scaling its vertex radius by one device
    // pixel therefore adds half a device pixel around all three tangent points.
    let coverageScale = 1.0 + 1.0 / project.devicePixelRatio / triangleRadiusPixels;
    offset *= coverageScale;
    varyings.unitPosition *= coverageScale;
    geometry.uv = varyings.unitPosition;
  }
#endif

  varyings.position = centerResult.clipPosition;
  // DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  let clipPixels = project_pixel_size_to_clipspace(offset.xy);
  varyings.position.x += clipPixels.x;
  varyings.position.y += clipPixels.y;

  // Apply lighting
  let lightColor = lighting_getLightColor2(attributes.instanceColors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);

  // Apply opacity to instance color, or return instance picking color
  varyings.vColor = vec4(lightColor, attributes.instanceColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(vColor, geometry);
  varyings.pickingColor = geometry.pickingColor;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition.xy;

  let distToCenter = length(varyings.unitPosition);
#ifdef ANTIALIASING
  let edgePixels = (1.0 - distToCenter) / max(fwidth(distToCenter), 1e-6);
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
#else
  if (distToCenter > 1.0) {
#endif
    discard;
  }

  var fragColor: vec4<f32>;

  fragColor = varyings.vColor;

#ifdef ANTIALIASING
  fragColor.a *= smoothedge(0.0, edgePixels);
#endif

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
}
`
);

// ../layers/src/point-cloud-layer/point-cloud-layer.ts
var DEFAULT_COLOR3 = [0, 0, 0, 255];
var DEFAULT_NORMAL = [0, 0, 1];
var defaultProps5 = {
  sizeUnits: "pixels",
  pointSize: { type: "number", min: 0, value: 10 },
  //  point radius in pixels
  antialiasing: false,
  getPosition: { type: "accessor", value: (x) => x.position },
  getNormal: { type: "accessor", value: DEFAULT_NORMAL },
  getColor: { type: "accessor", value: DEFAULT_COLOR3 },
  material: true,
  // Depreated
  radiusPixels: { deprecatedFor: "pointSize" }
};
function normalizeData(data) {
  const { header, attributes } = data;
  if (!header || !attributes) {
    return;
  }
  data.length = header.vertexCount;
  if (attributes.POSITION) {
    attributes.instancePositions = attributes.POSITION;
  }
  if (attributes.NORMAL) {
    attributes.instanceNormals = attributes.NORMAL;
  }
  if (attributes.COLOR_0) {
    const { size, value } = attributes.COLOR_0;
    attributes.instanceColors = { size, type: "unorm8", value };
  }
}
var PointCloudLayer = class extends Layer {
  getShaders() {
    const { antialiasing } = this.props;
    return super.getShaders({
      vs: point_cloud_layer_vertex_glsl_default,
      fs: point_cloud_layer_fragment_glsl_default,
      source: shaderWGSL3,
      defines: antialiasing ? { ANTIALIASING: 1 } : {},
      modules: [project32_default, color_default, import_shadertools3.gouraudMaterial, picking_default, pointCloudUniforms]
    });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceNormals: {
        size: 3,
        transition: true,
        accessor: "getNormal",
        defaultValue: DEFAULT_NORMAL
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getColor",
        defaultValue: DEFAULT_COLOR3
      }
    });
  }
  updateState(params) {
    var _a;
    const { changeFlags, props, oldProps } = params;
    super.updateState(params);
    if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
    if (changeFlags.dataChanged) {
      normalizeData(props.data);
    }
  }
  draw({ uniforms }) {
    const { pointSize, sizeUnits } = this.props;
    const model = this.state.model;
    const pointCloudProps = {
      sizeUnits: UNIT[sizeUnits],
      radiusPixels: pointSize
    };
    model.shaderInputs.setProps({ pointCloud: pointCloudProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const positions = [];
    for (let i = 0; i < 3; i++) {
      const angle = i / 3 * Math.PI * 2;
      positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
    }
    return new import_engine7.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine7.Geometry({
        topology: "triangle-list",
        attributes: {
          positions: new Float32Array(positions)
        }
      }),
      isInstanced: true
    });
  }
};
PointCloudLayer.layerName = "PointCloudLayer";
PointCloudLayer.defaultProps = defaultProps5;

// ../layers/src/scatterplot-layer/scatterplot-layer.ts
var import_engine8 = require("@luma.gl/engine");

// ../layers/src/scatterplot-layer/scatterplot-layer-uniforms.ts
var glslUniformBlock2 = `layout(std140) uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  float filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`;
var scatterplotUniforms = {
  name: "scatterplot",
  vs: glslUniformBlock2,
  fs: glslUniformBlock2,
  source: "",
  uniformTypes: {
    radiusScale: "f32",
    radiusMinPixels: "f32",
    radiusMaxPixels: "f32",
    lineWidthScale: "f32",
    lineWidthMinPixels: "f32",
    lineWidthMaxPixels: "f32",
    stroked: "f32",
    filled: "f32",
    antialiasing: "f32",
    billboard: "f32",
    radiusUnits: "i32",
    lineWidthUnits: "i32"
  }
};

// ../layers/src/scatterplot-layer/scatterplot-layer-vertex.glsl.ts
var scatterplot_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader

in vec3 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
in vec2 instancePixelOffset;

out vec4 vFillColor;
out vec4 vLineColor;
out vec2 unitPosition;
out float innerUnitRadius;
out float outerRadiusPixels;


void main(void) {
  geometry.worldPosition = instancePositions;

  // Multiply out radius and clamp to limits
  outerRadiusPixels = clamp(
    project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );
  
  // Multiply out line width and clamp to limits
  float lineWidthPixels = clamp(
    project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accomodate edge smoothing
  float edgePadding = scatterplot.antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;

  // position on the containing square in [-1, 1] space
  unitPosition = edgePadding * positions.xy;
  geometry.uv = unitPosition;
#ifdef USE_ROW_INDEXES
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
  geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif

  innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / outerRadiusPixels;
  
  if (scatterplot.billboard) {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = edgePadding * positions * outerRadiusPixels;
    offset.xy += instancePixelOffset;
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
    offset.xy += project_pixel_size(instancePixelOffset);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`
);

// ../layers/src/scatterplot-layer/scatterplot-layer-fragment.glsl.ts
var scatterplot_layer_fragment_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader

precision highp float;

in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;

out vec4 fragColor;

void main(void) {
  geometry.uv = unitPosition;

  float distToCenter = length(unitPosition) * outerRadiusPixels;
  float inCircle = scatterplot.antialiasing ?
    smoothedge(distToCenter, outerRadiusPixels) :
    step(distToCenter, outerRadiusPixels);

  if (inCircle == 0.0) {
    discard;
  }

  if (scatterplot.stroked > 0.5) {
    float isLine = scatterplot.antialiasing ?
      smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
      step(innerUnitRadius * outerRadiusPixels, distToCenter);

    if (scatterplot.filled > 0.5) {
      fragColor = mix(vFillColor, vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
    }
  } else if (scatterplot.filled < 0.5) {
    discard;
  } else {
    fragColor = vFillColor;
  }

  fragColor.a *= inCircle;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`
);

// ../layers/src/scatterplot-layer/scatterplot-layer.wgsl.ts
var shaderWGSL4 = (
  /* wgsl */
  `// Main shaders

struct ScatterplotUniforms {
  radiusScale: f32,
  radiusMinPixels: f32,
  radiusMaxPixels: f32,
  lineWidthScale: f32,
  lineWidthMinPixels: f32,
  lineWidthMaxPixels: f32,
  stroked: f32,
  filled: i32,
  antialiasing: i32,
  billboard: i32,
  radiusUnits: i32,
  lineWidthUnits: i32,
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceRadius: f32,
  @location(4) instanceLineWidths: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  // Draw an inline geometry constant array clip space triangle to verify that rendering works.
  // var positions = array<vec2<f32>, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
  // if (attributes.instanceIndex == 0) {
  //   varyings.position = vec4<f32>(positions[attributes.vertexIndex], 0.0, 1.0);
  //   return varyings;
  // }

  geometry.worldPosition = attributes.instancePositions;

  // Multiply out radius and clamp to limits
  varyings.outerRadiusPixels = clamp(
    project_unit_size_to_pixel(scatterplot.radiusScale * attributes.instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );

  // Multiply out line width and clamp to limits
  let lineWidthPixels = clamp(
    project_unit_size_to_pixel(scatterplot.lineWidthScale * attributes.instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  varyings.outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accommodate edge smoothing
  let edgePadding = select(
    (varyings.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / varyings.outerRadiusPixels,
    1.0,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = edgePadding * attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = PICKING_COLOR_VALUE;

  varyings.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / varyings.outerRadiusPixels;

  if (scatterplot.billboard != 0) {
    varyings.position = project_position_to_clipspace(attributes.instancePositions, attributes.instancePositions64Low, vec3<f32>(0.0)); // TODO , geometry.position);
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
    var offset = edgePadding * attributes.positions * varyings.outerRadiusPixels;
    offset = vec3<f32>(offset.xy + attributes.instancePixelOffset, offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position = vec4<f32>(varyings.position.x + clipPixels.x, varyings.position.y + clipPixels.y, varyings.position.z, varyings.position.w);
  } else {
    var offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    offset = vec3<f32>(offset.xy + project_pixel_size_vec2(attributes.instancePixelOffset), offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    varyings.position = project_position_to_clipspace(attributes.instancePositions, attributes.instancePositions64Low, offset); // TODO , geometry.position);
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  varyings.vFillColor = vec4<f32>(attributes.instanceFillColors.rgb, attributes.instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vFillColor, geometry);
  varyings.vLineColor = vec4<f32>(attributes.instanceLineColors.rgb, attributes.instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vLineColor, geometry);
  varyings.pickingColor = geometry.pickingColor;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition;

  let distToCenter = length(varyings.unitPosition) * varyings.outerRadiusPixels;
  let inCircle = select(
    smoothedge(distToCenter, varyings.outerRadiusPixels),
    step(distToCenter, varyings.outerRadiusPixels),
    scatterplot.antialiasing != 0
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked != 0) {
    let isLine = select(
      smoothedge(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      step(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      scatterplot.antialiasing != 0
    );

    if (scatterplot.filled != 0) {
      fragColor = mix(varyings.vFillColor, varyings.vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4<f32>(varyings.vLineColor.rgb, varyings.vLineColor.a * isLine);
    }
  } else if (scatterplot.filled == 0) {
    discard;
  } else {
    fragColor = varyings.vFillColor;
  }

  fragColor.a *= inCircle;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
  // return vec4<f32>(0, 0, 1, 1);
}
`
);
function getShaderWGSL2(useRowIndexes) {
  return shaderWGSL4.replace("PICKING_COLOR_ATTRIBUTE", useRowIndexes ? "@location(8) rowIndexes: u32," : "").replace(
    "PICKING_COLOR_VALUE",
    useRowIndexes ? "picking_getPickingColorFromIndex(attributes.rowIndexes)" : "picking_getPickingColorFromIndex(attributes.instanceIndex)"
  );
}

// ../layers/src/scatterplot-layer/scatterplot-layer.ts
var DEFAULT_COLOR4 = [0, 0, 0, 255];
var defaultProps6 = {
  radiusUnits: "meters",
  radiusScale: { type: "number", min: 0, value: 1 },
  radiusMinPixels: { type: "number", min: 0, value: 0 },
  //  min point radius in pixels
  radiusMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  // max point radius in pixels
  lineWidthUnits: "meters",
  lineWidthScale: { type: "number", min: 0, value: 1 },
  lineWidthMinPixels: { type: "number", min: 0, value: 0 },
  lineWidthMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  stroked: false,
  filled: true,
  billboard: false,
  antialiasing: true,
  getPosition: { type: "accessor", value: (x) => x.position },
  getRadius: { type: "accessor", value: 1 },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR4 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR4 },
  getLineWidth: { type: "accessor", value: 1 },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  // deprecated
  strokeWidth: { deprecatedFor: "getLineWidth" },
  outline: { deprecatedFor: "stroked" },
  getColor: { deprecatedFor: ["getFillColor", "getLineColor"] }
};
var ScatterplotLayer = class extends Layer {
  getShaders() {
    var _a, _b;
    const useRowIndexes = Boolean((_b = (_a = this.props.data) == null ? void 0 : _a.attributes) == null ? void 0 : _b.rowIndexes);
    return super.getShaders({
      vs: scatterplot_layer_vertex_glsl_default,
      fs: scatterplot_layer_fragment_glsl_default,
      source: getShaderWGSL2(useRowIndexes),
      defines: useRowIndexes ? { USE_ROW_INDEXES: true } : {},
      modules: [project32_default, color_default, picking_default, scatterplotUniforms]
    });
  }
  initializeState() {
    var _a, _b;
    const attributes = ((_b = (_a = this.props.data) == null ? void 0 : _a.attributes) == null ? void 0 : _b.rowIndexes) ? {
      /** Caller-provided logical picking index per point instance. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        noAlloc: true
      }
    } : {};
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceRadius: {
        size: 1,
        transition: true,
        accessor: "getRadius",
        defaultValue: 1
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: "unorm8",
        accessor: "getFillColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        transition: true,
        type: "unorm8",
        accessor: "getLineColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: "getLineWidth",
        defaultValue: 1
      },
      instancePixelOffset: {
        size: 2,
        transition: true,
        accessor: "getPixelOffset"
      },
      ...attributes
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    if (params.changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const {
      radiusUnits,
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      stroked,
      filled,
      billboard,
      antialiasing,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    } = this.props;
    const scatterplotProps = {
      stroked,
      filled,
      billboard,
      antialiasing,
      radiusUnits: UNIT[radiusUnits],
      radiusScale,
      radiusMinPixels,
      radiusMaxPixels,
      lineWidthUnits: UNIT[lineWidthUnits],
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels
    };
    const model = this.state.model;
    model.shaderInputs.setProps({ scatterplot: scatterplotProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const positions = [-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0];
    return new import_engine8.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine8.Geometry({
        topology: "triangle-strip",
        attributes: {
          positions: { size: 3, value: new Float32Array(positions) }
        }
      }),
      isInstanced: true
    });
  }
};
ScatterplotLayer.defaultProps = defaultProps6;
ScatterplotLayer.layerName = "ScatterplotLayer";

// ../layers/src/column-layer/column-layer.ts
var import_engine10 = require("@luma.gl/engine");

// ../layers/src/column-layer/column-geometry.ts
var import_engine9 = require("@luma.gl/engine");
var import_polygon = require("@math.gl/polygon");
var ColumnGeometry = class extends import_engine9.Geometry {
  constructor(props) {
    const { indices, attributes } = tesselateColumn(props);
    super({
      ...props,
      topology: "line-list",
      indices,
      attributes
    });
  }
};
function tesselateColumn(props) {
  const { radius, height = 1, nradial = 10 } = props;
  let { vertices } = props;
  if (vertices) {
    log_default.assert(vertices.length >= nradial);
    vertices = vertices.flatMap((v) => [v[0], v[1]]);
    (0, import_polygon.modifyPolygonWindingDirection)(vertices, import_polygon.WINDING.COUNTER_CLOCKWISE);
  }
  const isExtruded = height > 0;
  const vertsAroundEdge = nradial + 1;
  const numVertices = isExtruded ? vertsAroundEdge * 3 + 1 : nradial;
  const stepAngle = Math.PI * 2 / nradial;
  const indices = new Uint16Array(isExtruded ? nradial * 3 * 2 : 0);
  const positions = new Float32Array(numVertices * 3);
  const normals = new Float32Array(numVertices * 3);
  let i = 0;
  if (isExtruded) {
    for (let j = 0; j < vertsAroundEdge; j++) {
      const a = j * stepAngle;
      const vertexIndex = j % nradial;
      const sin = Math.sin(a);
      const cos = Math.cos(a);
      for (let k = 0; k < 2; k++) {
        positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
        positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
        positions[i + 2] = (1 / 2 - k) * height;
        normals[i + 0] = vertices ? vertices[vertexIndex * 2] : cos;
        normals[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin;
        i += 3;
      }
    }
    positions[i + 0] = positions[i - 3];
    positions[i + 1] = positions[i - 2];
    positions[i + 2] = positions[i - 1];
    i += 3;
  }
  for (let j = isExtruded ? 0 : 1; j < vertsAroundEdge; j++) {
    const v = Math.floor(j / 2) * Math.sign(0.5 - j % 2);
    const a = v * stepAngle;
    const vertexIndex = (v + nradial) % nradial;
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    positions[i + 0] = vertices ? vertices[vertexIndex * 2] : cos * radius;
    positions[i + 1] = vertices ? vertices[vertexIndex * 2 + 1] : sin * radius;
    positions[i + 2] = height / 2;
    normals[i + 2] = 1;
    i += 3;
  }
  if (isExtruded) {
    let index = 0;
    for (let j = 0; j < nradial; j++) {
      indices[index++] = j * 2 + 0;
      indices[index++] = j * 2 + 2;
      indices[index++] = j * 2 + 0;
      indices[index++] = j * 2 + 1;
      indices[index++] = j * 2 + 1;
      indices[index++] = j * 2 + 3;
    }
  }
  return {
    indices,
    attributes: {
      POSITION: { size: 3, value: positions },
      NORMAL: { size: 3, value: normals }
    }
  };
}

// ../layers/src/column-layer/column-layer-uniforms.ts
var uniformBlockWGSL3 = (
  /* wgsl */
  `struct ColumnUniforms {
  radius: f32,
  angle: f32,
  offset: vec2<f32>,
  extruded: f32,
  stroked: f32,
  isStroke: f32,
  coverage: f32,
  elevationScale: f32,
  edgeDistance: f32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  radiusUnits: i32,
  widthUnits: i32,
};

@group(0) @binding(auto) var<uniform> column: ColumnUniforms;
`
);
var uniformBlock5 = `layout(std140) uniform columnUniforms {
  float radius;
  float angle;
  vec2 offset;
  bool extruded;
  bool stroked;
  bool isStroke;
  float coverage;
  float elevationScale;
  float edgeDistance;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int radiusUnits;
  highp int widthUnits;
} column;
`;
var columnUniforms = {
  name: "column",
  source: uniformBlockWGSL3,
  vs: uniformBlock5,
  fs: uniformBlock5,
  uniformTypes: {
    radius: "f32",
    angle: "f32",
    offset: "vec2<f32>",
    extruded: "f32",
    stroked: "f32",
    isStroke: "f32",
    coverage: "f32",
    elevationScale: "f32",
    edgeDistance: "f32",
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    radiusUnits: "i32",
    widthUnits: "i32"
  }
};

// ../layers/src/column-layer/column-layer.wgsl.ts
var sharedSource = (
  /* wgsl */
  `struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) instancePositions: vec3<f32>,
  @location(3) instancePositions64Low: vec3<f32>,
  @location(4) instanceElevations: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instanceStrokeWidths: f32
};

fn getRotationMatrix(angle: f32) -> mat2x2<f32> {
  let s = sin(angle);
  let c = cos(angle);
  return mat2x2<f32>(
    vec2<f32>(c, s),
    vec2<f32>(-s, c)
  );
}

fn getOffset(
  positions: vec3<f32>,
  strokeOffsetRatio: f32,
  dotRadius: f32,
  rotationMatrix: mat2x2<f32>
) -> vec3<f32> {
  var offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
  if (column.radiusUnits == UNIT_METERS) {
    offset = project_size_vec2(offset);
  } else if (column.radiusUnits == UNIT_PIXELS) {
    offset = project_pixel_size_vec2(offset);
  }
  return vec3<f32>(offset, 0.0);
}
`
);
var smoothSource = (
  /* wgsl */
  `${sharedSource}

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  let isStroke = column.isStroke > 0.5;
  let baseColor = select(attributes.instanceFillColors, attributes.instanceLineColors, isStroke);
  let rotationMatrix = getRotationMatrix(column.angle);

  var elevation = 0.0;
  var strokeOffsetRatio = 1.0;

  if (column.extruded > 0.5) {
    elevation =
      attributes.instanceElevations * (attributes.positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked > 0.5) {
    let widthPixels = clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels,
      column.widthMaxPixels
    ) / 2.0;
    let halfOffset =
      project_pixel_size_float(widthPixels) /
      project_size_float(column.edgeDistance * column.coverage * column.radius);
    if (isStroke) {
      strokeOffsetRatio -= sign(attributes.positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  let shouldRender = select(0.0, 1.0, baseColor.a > 0.0 && attributes.instanceElevations >= 0.0);
  let dotRadius = column.radius * column.coverage * shouldRender;
  let centroidPosition =
    vec3<f32>(
      attributes.instancePositions.xy,
      attributes.instancePositions.z + elevation
    );
  let offset = getOffset(attributes.positions, strokeOffsetRatio, dotRadius, rotationMatrix);
  let projected = project_position_to_clipspace_and_commonspace(
    centroidPosition,
    attributes.instancePositions64Low,
    offset
  );

  geometry.position = projected.commonPosition;
  geometry.normal = project_normal(vec3<f32>(rotationMatrix * attributes.normals.xy, attributes.normals.z));

  let lightColor = lighting_getLightColor2(
    baseColor.rgb,
    project.cameraPosition,
    geometry.position.xyz,
    geometry.normal
  );

  varyings.position = projected.clipPosition;
  varyings.color = vec4<f32>(
    select(baseColor.rgb, lightColor, column.extruded > 0.5 && !isStroke),
    baseColor.a * layer.opacity
  );

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0);
  return deckgl_premultiplied_alpha(varyings.color);
}
`
);
var flatSource = (
  /* wgsl */
  `${sharedSource}

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) cameraPosition: vec3<f32>,
  @location(2) positionCommonspace: vec4<f32>
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  let isStroke = column.isStroke > 0.5;
  let baseColor = select(attributes.instanceFillColors, attributes.instanceLineColors, isStroke);
  let rotationMatrix = getRotationMatrix(column.angle);

  var elevation = 0.0;
  var strokeOffsetRatio = 1.0;

  if (column.extruded > 0.5) {
    elevation =
      attributes.instanceElevations * (attributes.positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked > 0.5) {
    let widthPixels = clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels,
      column.widthMaxPixels
    ) / 2.0;
    let halfOffset =
      project_pixel_size_float(widthPixels) /
      project_size_float(column.edgeDistance * column.coverage * column.radius);
    if (isStroke) {
      strokeOffsetRatio -= sign(attributes.positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  let shouldRender = select(0.0, 1.0, baseColor.a > 0.0 && attributes.instanceElevations >= 0.0);
  let dotRadius = column.radius * column.coverage * shouldRender;
  let centroidPosition =
    vec3<f32>(
      attributes.instancePositions.xy,
      attributes.instancePositions.z + elevation
    );
  let offset = getOffset(attributes.positions, strokeOffsetRatio, dotRadius, rotationMatrix);
  let projected = project_position_to_clipspace_and_commonspace(
    centroidPosition,
    attributes.instancePositions64Low,
    offset
  );

  geometry.position = projected.commonPosition;
  geometry.normal = project_normal(vec3<f32>(rotationMatrix * attributes.normals.xy, attributes.normals.z));

  varyings.position = projected.clipPosition;
  varyings.color = vec4<f32>(baseColor.rgb, baseColor.a * layer.opacity);
  varyings.cameraPosition = project.cameraPosition;
  varyings.positionCommonspace = projected.commonPosition;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0);

  var fragColor = varyings.color;
  if (column.extruded > 0.5 && column.isStroke < 0.5) {
    // WebGPU's screen-space Y axis reverses the derivative orientation used by GLSL flat shading.
    let normal = normalize(cross(dpdy(varyings.positionCommonspace.xyz), dpdx(varyings.positionCommonspace.xyz)));
    fragColor = vec4<f32>(
      lighting_getLightColor2(
        varyings.color.rgb,
        varyings.cameraPosition,
        varyings.positionCommonspace.xyz,
        normal
      ),
      varyings.color.a
    );
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`
);
function getColumnLayerWGSL(flatShading) {
  return flatShading ? flatSource : smoothSource;
}

// ../layers/src/column-layer/column-layer-vertex.glsl.ts
var column_layer_vertex_glsl_default = `#version 300 es

#define SHADER_NAME column-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in vec3 instancePositions;
in float instanceElevations;
in vec3 instancePositions64Low;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in float instanceStrokeWidths;

// Result
out vec4 vColor;
#ifdef FLAT_SHADING
out vec3 cameraPosition;
out vec4 position_commonspace;
#endif

void main(void) {
  geometry.worldPosition = instancePositions;

  vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));

  // calculate elevation, if 3d not enabled set to 0
  // cylindar gemoetry height are between -1.0 to 1.0, transform it to between 0, 1
  float elevation = 0.0;
  // calculate stroke offset
  float strokeOffsetRatio = 1.0;

  if (column.extruded) {
    elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked) {
    float widthPixels = clamp(
      project_size_to_pixel(instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels, column.widthMaxPixels) / 2.0;
    float halfOffset = project_pixel_size(widthPixels) / project_size(column.edgeDistance * column.coverage * column.radius);
    if (column.isStroke) {
      strokeOffsetRatio -= sign(positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  // if alpha == 0.0 or z < 0.0, do not render element
  float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
  float dotRadius = column.radius * column.coverage * shouldRender;

  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  // project center of column
  vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
  vec3 centroidPosition64Low = instancePositions64Low;
  vec2 offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
  if (column.radiusUnits == UNIT_METERS) {
    offset = project_size(offset);
  } else if (column.radiusUnits == UNIT_PIXELS) {
    offset = project_pixel_size(offset);
  }
  vec3 pos = vec3(offset, 0.);
  DECKGL_FILTER_SIZE(pos, geometry);

  gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
  geometry.normal = project_normal(vec3(rotationMatrix * normals.xy, normals.z));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  // Light calculations
  if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
    cameraPosition = project.cameraPosition;
    position_commonspace = geometry.position;
    vColor = vec4(color.rgb, color.a * layer.opacity);
#else
    vec3 lightColor = lighting_getLightColor(color.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
    vColor = vec4(lightColor, color.a * layer.opacity);
#endif
  } else {
    vColor = vec4(color.rgb, color.a * layer.opacity);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// ../layers/src/column-layer/column-layer-fragment.glsl.ts
var column_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME column-layer-fragment-shader

precision highp float;

out vec4 fragColor;

in vec4 vColor;
#ifdef FLAT_SHADING
in vec3 cameraPosition;
in vec4 position_commonspace;
#endif

void main(void) {
  fragColor = vColor;
  // Fails to compile on some Android devices if geometry is never assigned (#8411)
  geometry.uv = vec2(0.);
#ifdef FLAT_SHADING
  if (column.extruded && !column.isStroke && !bool(picking.isActive)) {
    vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
    fragColor.rgb = lighting_getLightColor(vColor.rgb, cameraPosition, position_commonspace.xyz, normal);
  }
#endif
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/column-layer/column-layer.ts
var DEFAULT_COLOR5 = [0, 0, 0, 255];
var GEOMETRY_BUFFER_LAYOUT = {
  name: "geometry",
  stepMode: "vertex",
  byteStride: 24,
  attributes: [
    { attribute: "positions", format: "float32x3", byteOffset: 0 },
    { attribute: "normals", format: "float32x3", byteOffset: 12 }
  ]
};
var defaultProps7 = {
  diskResolution: { type: "number", min: 4, value: 20 },
  vertices: null,
  radius: { type: "number", min: 0, value: 1e3 },
  angle: { type: "number", value: 0 },
  offset: { type: "array", value: [0, 0] },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  elevationScale: { type: "number", min: 0, value: 1 },
  radiusUnits: "meters",
  lineWidthUnits: "meters",
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  extruded: true,
  wireframe: false,
  filled: true,
  stroked: false,
  flatShading: false,
  getPosition: { type: "accessor", value: (x) => x.position },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR5 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR5 },
  getLineWidth: { type: "accessor", value: 1 },
  getElevation: { type: "accessor", value: 1e3 },
  material: true,
  getColor: { deprecatedFor: ["getFillColor", "getLineColor"] }
};
var ColumnLayer = class extends Layer {
  getShaders() {
    const defines2 = {};
    const { flatShading } = this.props;
    if (flatShading) {
      defines2.FLAT_SHADING = 1;
    }
    return super.getShaders({
      vs: column_layer_vertex_glsl_default,
      fs: column_layer_fragment_glsl_default,
      source: getColumnLayerWGSL(flatShading),
      defines: defines2,
      modules: [
        project32_default,
        color_default,
        flatShading ? import_shadertools3.phongMaterial : import_shadertools3.gouraudMaterial,
        picking_default,
        columnUniforms
      ]
    });
  }
  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: "getElevation"
      },
      instanceFillColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getFillColor",
        defaultValue: DEFAULT_COLOR5
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getLineColor",
        defaultValue: DEFAULT_COLOR5
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: "getLineWidth",
        transition: true
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const regenerateModels = changeFlags.extensionsChanged || props.flatShading !== oldProps.flatShading;
    if (regenerateModels) {
      (_a = this.state.models) == null ? void 0 : _a.forEach((model) => model.destroy());
      this.setState(this._getModels());
      this.getAttributeManager().invalidateAll();
    }
    const instanceCount = this.getNumInstances();
    this.state.fillModel.setInstanceCount(instanceCount);
    this.state.strokeModel.setInstanceCount(instanceCount);
    this.state.wireframeModel.setInstanceCount(instanceCount);
    if (regenerateModels || props.diskResolution !== oldProps.diskResolution || props.vertices !== oldProps.vertices || props.extruded !== oldProps.extruded || props.stroked !== oldProps.stroked) {
      this._updateGeometry(props);
    }
  }
  getGeometry(diskResolution, vertices, hasThinkness) {
    const geometry = new ColumnGeometry({
      radius: 1,
      height: hasThinkness ? 2 : 0,
      vertices,
      nradial: diskResolution
    });
    let meanVertexDistance = 0;
    if (vertices) {
      for (let i = 0; i < diskResolution; i++) {
        const p = vertices[i];
        const d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
        meanVertexDistance += d / diskResolution;
      }
    } else {
      meanVertexDistance = 1;
    }
    this.setState({
      edgeDistance: Math.cos(Math.PI / diskResolution) * meanVertexDistance
    });
    return geometry;
  }
  _getModels() {
    const shaders = this.getShaders();
    const bufferLayout = [
      ...this.getAttributeManager().getBufferLayouts(),
      GEOMETRY_BUFFER_LAYOUT
    ];
    const fillModel = new import_engine10.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-fill`,
      bufferLayout,
      isInstanced: true
    });
    const strokeModel = new import_engine10.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-stroke`,
      bufferLayout,
      isInstanced: true
    });
    const wireframeModel = new import_engine10.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-wireframe`,
      bufferLayout,
      isInstanced: true
    });
    return {
      fillModel,
      strokeModel,
      wireframeModel,
      models: [wireframeModel, fillModel, strokeModel]
    };
  }
  _updateGeometry({ diskResolution, vertices, extruded, stroked }) {
    const geometry = this.getGeometry(diskResolution, vertices, extruded || stroked);
    const positionAttribute = geometry.attributes.POSITION;
    const normalAttribute = geometry.attributes.NORMAL;
    this._setFillGeometry(
      new import_engine10.Geometry({
        topology: "triangle-strip",
        attributes: { POSITION: positionAttribute, NORMAL: normalAttribute }
      })
    );
    if (!extruded && stroked) {
      const fillVertexCount = positionAttribute.value.length / 3;
      this._setStrokeGeometry(
        new import_engine10.Geometry({
          topology: "triangle-strip",
          // remove the cap
          vertexCount: fillVertexCount - diskResolution - 1,
          attributes: { POSITION: positionAttribute, NORMAL: normalAttribute }
        })
      );
    }
    if (extruded) {
      this._setWireframeGeometry(geometry);
    }
  }
  _setFillGeometry(geometry) {
    const fillGeometry = (0, import_engine10.makeInterleavedGeometry)(geometry, {
      attributes: ["POSITION", "NORMAL"]
    });
    const fillModel = this.state.fillModel;
    fillModel.setGeometry(fillGeometry);
  }
  _setStrokeGeometry(geometry) {
    const strokeGeometry = (0, import_engine10.makeInterleavedGeometry)(geometry, {
      attributes: ["POSITION", "NORMAL"]
    });
    const strokeModel = this.state.strokeModel;
    strokeModel.setGeometry(strokeGeometry);
  }
  _setWireframeGeometry(geometry) {
    const wireframeGeometry = (0, import_engine10.makeInterleavedGeometry)(geometry, {
      attributes: ["POSITION", "NORMAL"]
    });
    const wireframeModel = this.state.wireframeModel;
    wireframeModel.setGeometry(wireframeGeometry);
    wireframeModel.setTopology("line-list");
  }
  draw({ uniforms }) {
    const {
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      radiusUnits,
      elevationScale,
      extruded,
      filled,
      stroked,
      wireframe,
      offset,
      coverage,
      radius,
      angle
    } = this.props;
    const fillModel = this.state.fillModel;
    const strokeModel = this.state.strokeModel;
    const wireframeModel = this.state.wireframeModel;
    const { edgeDistance } = this.state;
    const columnProps = {
      radius,
      angle: angle / 180 * Math.PI,
      offset,
      extruded,
      stroked,
      coverage,
      elevationScale,
      edgeDistance,
      radiusUnits: UNIT[radiusUnits],
      widthUnits: UNIT[lineWidthUnits],
      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels
    };
    if (extruded && wireframe) {
      wireframeModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      wireframeModel.draw(this.context.renderPass);
    }
    if (filled) {
      fillModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: false
        }
      });
      fillModel.draw(this.context.renderPass);
    }
    if (!extruded && stroked) {
      strokeModel.shaderInputs.setProps({
        column: {
          ...columnProps,
          isStroke: true
        }
      });
      strokeModel.draw(this.context.renderPass);
    }
  }
};
ColumnLayer.layerName = "ColumnLayer";
ColumnLayer.defaultProps = defaultProps7;

// ../layers/src/path-layer/path-layer.ts
var import_engine11 = require("@luma.gl/engine");
var import_engine12 = require("@luma.gl/engine");

// ../layers/src/path-layer/path.ts
var import_polygon2 = require("@math.gl/polygon");
function normalizePath(path, size, gridResolution, wrapLongitude) {
  let flatPath;
  if (Array.isArray(path[0])) {
    const length = path.length * size;
    flatPath = new Array(length);
    for (let i = 0; i < path.length; i++) {
      for (let j = 0; j < size; j++) {
        flatPath[i * size + j] = path[i][j] || 0;
      }
    }
  } else {
    flatPath = path;
  }
  if (gridResolution) {
    return (0, import_polygon2.cutPolylineByGrid)(flatPath, { size, gridResolution });
  }
  if (wrapLongitude) {
    return (0, import_polygon2.cutPolylineByMercatorBounds)(flatPath, { size });
  }
  return flatPath;
}

// ../layers/src/path-layer/path-tesselator.ts
var START_CAP = 1;
var END_CAP = 2;
var INVALID = 4;
var PathTesselator = class extends Tesselator {
  constructor(opts) {
    super({
      ...opts,
      attributes: {
        // Padding covers shaderAttributes for last segment in largest case fp64
        // additional vertex + hi & low parts, 3 * 6
        positions: {
          size: 3,
          padding: 18,
          initialize: true,
          type: opts.fp64 ? Float64Array : Float32Array
        },
        // WebGPU vertex inputs use a 4-byte scalar; keep WebGL's compact uint8 buffer unchanged.
        segmentTypes: { size: 1, type: opts.isWebGPU ? Float32Array : Uint8ClampedArray }
      }
    });
  }
  /** Get packed attribute by name */
  get(attributeName) {
    return this.attributes[attributeName];
  }
  /* Implement base Tesselator interface */
  getGeometryFromBuffer(buffer) {
    if (this.normalize) {
      return super.getGeometryFromBuffer(buffer);
    }
    return null;
  }
  /* Implement base Tesselator interface */
  normalizeGeometry(path) {
    if (this.normalize) {
      return normalizePath(path, this.positionSize, this.opts.resolution, this.opts.wrapLongitude);
    }
    return path;
  }
  /* Implement base Tesselator interface */
  getGeometrySize(path) {
    if (isCut(path)) {
      let size = 0;
      for (const subPath of path) {
        size += this.getGeometrySize(subPath);
      }
      return size;
    }
    const numPoints = this.getPathLength(path);
    if (numPoints < 2) {
      return 0;
    }
    if (this.isClosed(path)) {
      return numPoints < 3 ? 0 : numPoints + 2;
    }
    return numPoints;
  }
  /* Implement base Tesselator interface */
  updateGeometryAttributes(path, context) {
    if (context.geometrySize === 0) {
      return;
    }
    if (path && isCut(path)) {
      for (const subPath of path) {
        const geometrySize = this.getGeometrySize(subPath);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPath, context);
        context.vertexStart += geometrySize;
      }
    } else {
      this._updateSegmentTypes(path, context);
      this._updatePositions(path, context);
    }
  }
  _updateSegmentTypes(path, context) {
    const segmentTypes = this.attributes.segmentTypes;
    const isPathClosed = path ? this.isClosed(path) : false;
    const { vertexStart, geometrySize } = context;
    segmentTypes.fill(0, vertexStart, vertexStart + geometrySize);
    if (isPathClosed) {
      segmentTypes[vertexStart] = INVALID;
      segmentTypes[vertexStart + geometrySize - 2] = INVALID;
    } else {
      segmentTypes[vertexStart] += START_CAP;
      segmentTypes[vertexStart + geometrySize - 2] += END_CAP;
    }
    segmentTypes[vertexStart + geometrySize - 1] = INVALID;
  }
  _updatePositions(path, context) {
    const { positions } = this.attributes;
    if (!positions || !path) {
      return;
    }
    const { vertexStart, geometrySize } = context;
    const p = new Array(3);
    for (let i = vertexStart, ptIndex = 0; ptIndex < geometrySize; i++, ptIndex++) {
      this.getPointOnPath(path, ptIndex, p);
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1];
      positions[i * 3 + 2] = p[2];
    }
  }
  // Utilities
  /** Returns the number of points in the path */
  getPathLength(path) {
    return path.length / this.positionSize;
  }
  /** Returns a point on the path at the specified index */
  getPointOnPath(path, index, target = []) {
    const { positionSize } = this;
    if (index * positionSize >= path.length) {
      index += 1 - path.length / positionSize;
    }
    const i = index * positionSize;
    target[0] = path[i];
    target[1] = path[i + 1];
    target[2] = positionSize === 3 && path[i + 2] || 0;
    return target;
  }
  // Returns true if the first and last points are identical
  isClosed(path) {
    if (!this.normalize) {
      return Boolean(this.opts.loop);
    }
    const { positionSize } = this;
    const lastPointIndex = path.length - positionSize;
    return path[0] === path[lastPointIndex] && path[1] === path[lastPointIndex + 1] && (positionSize === 2 || path[2] === path[lastPointIndex + 2]);
  }
};
function isCut(path) {
  return Array.isArray(path[0]);
}

// ../layers/src/path-layer/path-layer-uniforms.ts
var uniformBlockWGSL4 = (
  /* wgsl */
  `struct PathUniforms {
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
`
);
var uniformBlockGLSL2 = `layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`;
var pathUniforms = {
  name: "path",
  source: uniformBlockWGSL4,
  vs: uniformBlockGLSL2,
  fs: uniformBlockGLSL2,
  uniformTypes: {
    widthScale: "f32",
    widthMinPixels: "f32",
    widthMaxPixels: "f32",
    jointType: "f32",
    capType: "f32",
    miterLimit: "f32",
    billboard: "f32",
    widthUnits: "i32"
  }
};

// ../layers/src/path-layer/path-layer.wgsl.ts
var shaderWGSL5 = (
  /* wgsl */
  `const EPSILON: f32 = 0.001;
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
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) vCornerOffset: vec2<f32>,
  @location(2) vMiterLength: f32,
  @location(3) vPathPosition: vec2<f32>,
  @location(4) vPathLength: f32,
  @location(5) vJointType: f32,
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

fn getLineJoinOffset(
  prevPoint: vec3<f32>,
  currPoint: vec3<f32>,
  nextPoint: vec3<f32>,
  width: vec2<f32>,
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
    dot(offsetFromStartOfPath, dir)
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

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
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

  let widthPixels =
    clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * path.widthScale, path.widthUnits),
      path.widthMinPixels,
      path.widthMaxPixels
    ) / 2.0;

  if (path.billboard != 0.0) {
    var prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);
    var currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET);
    var nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);

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
    let join = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(vec2<f32>(widthPixels, widthPixels)),
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );

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
    varyings.vJointType = join.jointType;
  }

  varyings.vColor = vec4<f32>(
    attributes.instanceColors.rgb,
    attributes.instanceColors.a * layer.opacity
  );
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.vPathPosition;

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
  let edgePixels = select(bodyPixels, cornerPixels, isRound && isCorner);

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
  color.a *= smoothedge(0.0, edgePixels);
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
  // DECKGL_FILTER_COLOR
#ifdef ANTIALIASING
  return deckgl_premultiplied_alpha(color);
#else
  return deckgl_premultiplied_alpha(varyings.vColor);
#endif
}
`
);

// ../layers/src/path-layer/path-layer-vertex.glsl.ts
var path_layer_vertex_glsl_default = `#version 300 es
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

const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);

float flipIfTrue(bool flag) {
  return -(float(flag) * 2. - 1.);
}

// calculate line join positions
vec3 getLineJoinOffset(
  vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
  vec2 width
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
  vPathPosition = vec2(
    dot(offsetFromStartOfPath, perp),
    dot(offsetFromStartOfPath, dir)
  );
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
  vPathPosition = vec2(
    dot(offsetFromStartOfPath, perp),
    dot(offsetFromStartOfPath, dir)
  );
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
    vec4 prevPositionScreen = project_position_to_clipspace(prevPosition, prevPosition64Low, ZERO_OFFSET);
    vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
    vec4 nextPositionScreen = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);

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

    vec3 offset = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(width.xy)
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

// ../layers/src/path-layer/path-layer-fragment.glsl.ts
var path_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME path-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
/*
 * vPathPosition represents the relative coordinates of the current fragment on the path segment.
 * vPathPosition.x - position along the width of the path, between [-1, 1]. 0 is the center line.
 * vPathPosition.y - position along the length of the path, between [0, L / width].
 */
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;

out vec4 fragColor;

void main(void) {
  geometry.uv = vPathPosition;

#ifdef ANTIALIASING
  bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
  bool isRound = vJointType > 0.5;

  // Distance to the silhouette in device pixels, from the derivative of the coordinate that
  // bounds it. Computed before the discards below: derivatives are undefined once an invocation
  // in the quad has been discarded. See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
  float bodyCoord = abs(vPathPosition.x);
  float cornerCoord = length(vCornerOffset);
  // Both evaluated so each derivative stays on one field across the corner/body boundary
  float bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
  float cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
  float edgePixels = isRound && isCorner ? cornerPixels : bodyPixels;

  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }

  if (isCorner) {
    // trim miter
    if (!isRound && vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }
  fragColor = vColor;

  // Feather one device pixel across the width only - segments abut lengthwise, which would seam.
  // edgePixels is a signed device-pixel distance, and SMOOTH_EDGE_RADIUS is 0.5, so smoothedge
  // ramps across exactly one pixel centered on the edge.
  fragColor.a *= smoothedge(0.0, edgePixels);
#else
  if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
    // if joint is rounded, test distance from the corner
    if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
      discard;
    }
    // trim miter
    if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }
  fragColor = vColor;
#endif

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/path-layer/path-layer.ts
var DEFAULT_COLOR6 = [0, 0, 0, 255];
var defaultProps8 = {
  widthUnits: "meters",
  widthScale: { type: "number", min: 0, value: 1 },
  widthMinPixels: { type: "number", min: 0, value: 0 },
  widthMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  jointRounded: false,
  capRounded: false,
  miterLimit: { type: "number", min: 0, value: 4 },
  antialiasing: false,
  billboard: false,
  _pathType: null,
  getPath: { type: "accessor", value: (object) => object.path },
  getColor: { type: "accessor", value: DEFAULT_COLOR6 },
  getWidth: { type: "accessor", value: 1 },
  // deprecated props
  rounded: { deprecatedFor: ["jointRounded", "capRounded"] }
};
var ATTRIBUTE_TRANSITION = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};
var PathLayer = class extends Layer {
  getShaders() {
    const { antialiasing } = this.props;
    return super.getShaders({
      vs: path_layer_vertex_glsl_default,
      fs: path_layer_fragment_glsl_default,
      source: shaderWGSL5,
      defines: antialiasing ? { ANTIALIASING: 1 } : {},
      modules: [project32_default, color_default, picking_default, pathUniforms]
    });
  }
  get wrapLongitude() {
    return false;
  }
  getBounds() {
    var _a;
    if (this.context.device.type === "webgpu") {
      return null;
    }
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds(["vertexPositions"]);
  }
  initializeState() {
    const noAlloc = true;
    const isWebGPU = this.context.device.type === "webgpu";
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      ...isWebGPU ? {
        // WebGPU cannot express WebGL's vertexOffset window in one vertex buffer layout.
        // Pack each segment's [left, start, end, right] high and low position parts instead.
        instancePositions: {
          size: 24,
          type: "float32",
          transition: false,
          accessor: "getPath",
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculateWebGPUPositions,
          shaderAttributes: {
            instanceLeftPositions: { size: 3, elementOffset: 0 },
            instanceStartPositions: { size: 3, elementOffset: 3 },
            instanceEndPositions: { size: 3, elementOffset: 6 },
            instanceRightPositions: { size: 3, elementOffset: 9 },
            instanceLeftPositions64Low: { size: 3, elementOffset: 12 },
            instanceStartPositions64Low: { size: 3, elementOffset: 15 },
            instanceEndPositions64Low: { size: 3, elementOffset: 18 },
            instanceRightPositions64Low: { size: 3, elementOffset: 21 }
          },
          noAlloc
        }
      } : {
        vertexPositions: {
          size: 3,
          // Start filling buffer from 1 vertex in
          vertexOffset: 1,
          type: "float64",
          fp64: this.use64bitPositions(),
          transition: ATTRIBUTE_TRANSITION,
          accessor: "getPath",
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculatePositions,
          noAlloc,
          shaderAttributes: {
            instanceLeftPositions: {
              vertexOffset: 0
            },
            instanceStartPositions: {
              vertexOffset: 1
            },
            instanceEndPositions: {
              vertexOffset: 2
            },
            instanceRightPositions: {
              vertexOffset: 3
            }
          }
        }
      },
      instanceTypes: {
        size: 1,
        type: isWebGPU ? "float32" : "uint8",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateSegmentTypes,
        noAlloc
      },
      instanceStrokeWidths: {
        size: 1,
        accessor: "getWidth",
        transition: isWebGPU ? false : ATTRIBUTE_TRANSITION,
        defaultValue: 1,
        bufferGroup: "path-instance-data"
      },
      instanceColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        accessor: "getColor",
        transition: isWebGPU ? false : ATTRIBUTE_TRANSITION,
        defaultValue: DEFAULT_COLOR6,
        bufferGroup: "path-instance-data"
      },
      /** Source path row for each generated segment/joint instance. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        accessor: (object, { index }) => object && object.__source ? object.__source.index : index,
        // AttributeManager only materializes buffer groups on WebGPU, so WebGL keeps its layout.
        bufferGroup: "path-instance-data"
      }
    });
    this.setState({
      pathTesselator: new PathTesselator({
        fp64: this.use64bitPositions(),
        isWebGPU
      })
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const attributeManager = this.getAttributeManager();
    const geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPath);
    if (geometryChanged) {
      const { pathTesselator } = this.state;
      const buffers = props.data.attributes || {};
      pathTesselator.updateGeometry({
        data: props.data,
        geometryBuffer: buffers.getPath,
        buffers,
        normalize: !props._pathType,
        loop: props._pathType === "loop",
        getGeometry: props.getPath,
        positionFormat: props.positionFormat,
        wrapLongitude: props.wrapLongitude,
        // TODO - move the flag out of the viewport
        resolution: this.context.viewport.resolution,
        dataChanged: changeFlags.dataChanged
      });
      this.setState({
        numInstances: pathTesselator.instanceCount,
        startIndices: pathTesselator.vertexStarts
      });
      if (!changeFlags.dataChanged) {
        attributeManager.invalidateAll();
      }
    }
    if (changeFlags.extensionsChanged || props.antialiasing !== oldProps.antialiasing) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    const { index } = info;
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      info.object = data.find((d) => d.__source.index === index);
    }
    return info;
  }
  /** Override base Layer method */
  disablePickingIndex(objectIndex) {
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].__source.index === objectIndex) {
          this._disablePickingIndex(i);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }
  draw({ uniforms }) {
    const {
      jointRounded,
      capRounded,
      billboard,
      miterLimit,
      widthUnits,
      widthScale,
      widthMinPixels,
      widthMaxPixels
    } = this.props;
    const model = this.state.model;
    const pathProps = {
      jointType: Number(jointRounded),
      capType: Number(capRounded),
      billboard,
      widthUnits: UNIT[widthUnits],
      widthScale,
      miterLimit,
      widthMinPixels,
      widthMaxPixels
    };
    model.shaderInputs.setProps({ path: pathProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const SEGMENT_INDICES = [
      // start corner
      0,
      1,
      2,
      // body
      1,
      4,
      2,
      1,
      3,
      4,
      // end corner
      3,
      5,
      4
    ];
    const SEGMENT_POSITIONS = [
      // bevel start corner
      0,
      0,
      // start inner corner
      0,
      -1,
      // start outer corner
      0,
      1,
      // end inner corner
      1,
      -1,
      // end outer corner
      1,
      1,
      // bevel end corner
      1,
      0
    ];
    return new import_engine12.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine11.Geometry({
        topology: "triangle-list",
        attributes: {
          indices: new Uint16Array(SEGMENT_INDICES),
          positions: { value: new Float32Array(SEGMENT_POSITIONS), size: 2 }
        }
      }),
      isInstanced: true
    });
  }
  calculatePositions(attribute) {
    const { pathTesselator } = this.state;
    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = pathTesselator.get("positions");
  }
  calculateSegmentTypes(attribute) {
    const { pathTesselator } = this.state;
    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = pathTesselator.get("segmentTypes");
  }
  calculateWebGPUPositions(attribute) {
    const { pathTesselator } = this.state;
    const value = pathTesselator.get("positions");
    if (!value) {
      attribute.value = null;
      return;
    }
    const numInstances = pathTesselator.instanceCount;
    const result = new Float32Array(numInstances * 24);
    const neighborOffsets = [-1, 0, 1, 2];
    for (let i = 0; i < numInstances; i++) {
      const targetIndex = i * 24;
      for (let vertexOffset = 0; vertexOffset < 4; vertexOffset++) {
        const sourceVertex = i + neighborOffsets[vertexOffset];
        const targetOffset = targetIndex + vertexOffset * 3;
        for (let j = 0; j < 3; j++) {
          const position = sourceVertex >= 0 && sourceVertex < numInstances ? value[sourceVertex * 3 + j] : 0;
          const highPart = Math.fround(position);
          result[targetOffset + j] = highPart;
          result[targetOffset + j + 12] = position - highPart;
        }
      }
    }
    attribute.startIndices = pathTesselator.vertexStarts;
    attribute.value = result;
  }
};
PathLayer.defaultProps = defaultProps8;
PathLayer.layerName = "PathLayer";

// ../layers/src/solid-polygon-layer/solid-polygon-layer.ts
var import_engine13 = require("@luma.gl/engine");

// ../layers/src/solid-polygon-layer/polygon.ts
var import_earcut = __toESM(require("earcut"), 1);
var import_polygon3 = require("@math.gl/polygon");
var OUTER_POLYGON_WINDING = import_polygon3.WINDING.CLOCKWISE;
var HOLE_POLYGON_WINDING = import_polygon3.WINDING.COUNTER_CLOCKWISE;
var windingOptions = {
  isClosed: true
};
function validate(polygon) {
  polygon = polygon && polygon.positions || polygon;
  if (!Array.isArray(polygon) && !ArrayBuffer.isView(polygon)) {
    throw new Error("invalid polygon");
  }
}
function getPositions(polygon) {
  return "positions" in polygon ? polygon.positions : polygon;
}
function getHoleIndices(polygon) {
  return "holeIndices" in polygon ? polygon.holeIndices : null;
}
function isNested(polygon) {
  return Array.isArray(polygon[0]);
}
function isSimple(polygon) {
  return polygon.length >= 1 && polygon[0].length >= 2 && Number.isFinite(polygon[0][0]);
}
function isNestedRingClosed(simplePolygon) {
  const p0 = simplePolygon[0];
  const p1 = simplePolygon[simplePolygon.length - 1];
  return p0[0] === p1[0] && p0[1] === p1[1] && p0[2] === p1[2];
}
function isFlatRingClosed(positions, size, startIndex, endIndex) {
  for (let i = 0; i < size; i++) {
    if (positions[startIndex + i] !== positions[endIndex - size + i]) {
      return false;
    }
  }
  return true;
}
function copyNestedRing(target, targetStartIndex, simplePolygon, size, windingDirection) {
  let targetIndex = targetStartIndex;
  const len = simplePolygon.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[i][j] || 0;
    }
  }
  if (!isNestedRingClosed(simplePolygon)) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[0][j] || 0;
    }
  }
  windingOptions.start = targetStartIndex;
  windingOptions.end = targetIndex;
  windingOptions.size = size;
  (0, import_polygon3.modifyPolygonWindingDirection)(target, windingDirection, windingOptions);
  return targetIndex;
}
function copyFlatRing(target, targetStartIndex, positions, size, srcStartIndex = 0, srcEndIndex, windingDirection) {
  srcEndIndex = srcEndIndex || positions.length;
  const srcLength = srcEndIndex - srcStartIndex;
  if (srcLength <= 0) {
    return targetStartIndex;
  }
  let targetIndex = targetStartIndex;
  for (let i = 0; i < srcLength; i++) {
    target[targetIndex++] = positions[srcStartIndex + i];
  }
  if (!isFlatRingClosed(positions, size, srcStartIndex, srcEndIndex)) {
    for (let i = 0; i < size; i++) {
      target[targetIndex++] = positions[srcStartIndex + i];
    }
  }
  windingOptions.start = targetStartIndex;
  windingOptions.end = targetIndex;
  windingOptions.size = size;
  (0, import_polygon3.modifyPolygonWindingDirection)(target, windingDirection, windingOptions);
  return targetIndex;
}
function normalize(polygon, positionSize) {
  validate(polygon);
  const positions = [];
  const holeIndices = [];
  if ("positions" in polygon) {
    const { positions: srcPositions, holeIndices: srcHoleIndices } = polygon;
    if (srcHoleIndices) {
      let targetIndex = 0;
      for (let i = 0; i <= srcHoleIndices.length; i++) {
        targetIndex = copyFlatRing(
          positions,
          targetIndex,
          srcPositions,
          positionSize,
          srcHoleIndices[i - 1],
          srcHoleIndices[i],
          i === 0 ? OUTER_POLYGON_WINDING : HOLE_POLYGON_WINDING
        );
        holeIndices.push(targetIndex);
      }
      holeIndices.pop();
      return { positions, holeIndices };
    }
    polygon = srcPositions;
  }
  if (!isNested(polygon)) {
    copyFlatRing(positions, 0, polygon, positionSize, 0, positions.length, OUTER_POLYGON_WINDING);
    return positions;
  }
  if (!isSimple(polygon)) {
    let targetIndex = 0;
    for (const [polygonIndex, simplePolygon] of polygon.entries()) {
      targetIndex = copyNestedRing(
        positions,
        targetIndex,
        simplePolygon,
        positionSize,
        polygonIndex === 0 ? OUTER_POLYGON_WINDING : HOLE_POLYGON_WINDING
      );
      holeIndices.push(targetIndex);
    }
    holeIndices.pop();
    return { positions, holeIndices };
  }
  copyNestedRing(positions, 0, polygon, positionSize, OUTER_POLYGON_WINDING);
  return positions;
}
function getPlaneArea(positions, xIndex, yIndex) {
  const numVerts = positions.length / 3;
  let area = 0;
  for (let i = 0; i < numVerts; i++) {
    const j = (i + 1) % numVerts;
    area += positions[i * 3 + xIndex] * positions[j * 3 + yIndex];
    area -= positions[j * 3 + xIndex] * positions[i * 3 + yIndex];
  }
  return Math.abs(area / 2);
}
function permutePositions(positions, xIndex, yIndex, zIndex) {
  const numVerts = positions.length / 3;
  for (let i = 0; i < numVerts; i++) {
    const o = i * 3;
    const x = positions[o + 0];
    const y = positions[o + 1];
    const z = positions[o + 2];
    positions[o + xIndex] = x;
    positions[o + yIndex] = y;
    positions[o + zIndex] = z;
  }
}
function getSurfaceIndices(polygon, positionSize, preproject, full3d) {
  let holeIndices = getHoleIndices(polygon);
  if (holeIndices) {
    holeIndices = holeIndices.map((positionIndex) => positionIndex / positionSize);
  }
  let positions = getPositions(polygon);
  const is3d = full3d && positionSize === 3;
  if (preproject) {
    const n = positions.length;
    positions = positions.slice();
    const p = [];
    for (let i = 0; i < n; i += positionSize) {
      p[0] = positions[i];
      p[1] = positions[i + 1];
      if (is3d) {
        p[2] = positions[i + 2];
      }
      const xy = preproject(p);
      positions[i] = xy[0];
      positions[i + 1] = xy[1];
      if (is3d) {
        positions[i + 2] = xy[2];
      }
    }
  }
  if (is3d) {
    const xyArea = getPlaneArea(positions, 0, 1);
    const xzArea = getPlaneArea(positions, 0, 2);
    const yzArea = getPlaneArea(positions, 1, 2);
    if (!xyArea && !xzArea && !yzArea) {
      return [];
    }
    if (xyArea > xzArea && xyArea > yzArea) {
    } else if (xzArea > yzArea) {
      if (!preproject) {
        positions = positions.slice();
      }
      permutePositions(positions, 0, 2, 1);
    } else {
      if (!preproject) {
        positions = positions.slice();
      }
      permutePositions(positions, 2, 0, 1);
    }
  }
  return (0, import_earcut.default)(positions, holeIndices, positionSize);
}

// ../layers/src/solid-polygon-layer/polygon-tesselator.ts
var import_polygon4 = require("@math.gl/polygon");
var PolygonTesselator = class extends Tesselator {
  constructor(opts) {
    const { fp64, IndexType = Uint32Array } = opts;
    super({
      ...opts,
      attributes: {
        positions: { size: 3, type: fp64 ? Float64Array : Float32Array },
        vertexValid: { type: Uint16Array, size: 1 },
        indices: { type: IndexType, size: 1 }
      }
    });
  }
  /** Get attribute by name */
  get(attributeName) {
    const { attributes } = this;
    if (attributeName === "indices") {
      return attributes.indices && attributes.indices.subarray(0, this.vertexCount);
    }
    return attributes[attributeName];
  }
  /** Override base Tesselator method */
  updateGeometry(opts) {
    super.updateGeometry(opts);
    const externalIndices = this.buffers.indices;
    if (externalIndices) {
      this.vertexCount = (externalIndices.value || externalIndices).length;
    } else if (this.data && !this.getGeometry) {
      throw new Error("missing indices buffer");
    }
  }
  /** Implement base Tesselator interface */
  normalizeGeometry(polygon) {
    if (this.normalize) {
      const normalizedPolygon = normalize(polygon, this.positionSize);
      if (this.opts.resolution) {
        return (0, import_polygon4.cutPolygonByGrid)(
          getPositions(normalizedPolygon),
          getHoleIndices(normalizedPolygon),
          {
            size: this.positionSize,
            gridResolution: this.opts.resolution,
            edgeTypes: true
          }
        );
      }
      if (this.opts.wrapLongitude) {
        return (0, import_polygon4.cutPolygonByMercatorBounds)(
          getPositions(normalizedPolygon),
          getHoleIndices(normalizedPolygon),
          {
            size: this.positionSize,
            maxLatitude: 86,
            edgeTypes: true
          }
        );
      }
      return normalizedPolygon;
    }
    return polygon;
  }
  /** Implement base Tesselator interface */
  getGeometrySize(polygon) {
    if (isCut2(polygon)) {
      let size = 0;
      for (const subPolygon of polygon) {
        size += this.getGeometrySize(subPolygon);
      }
      return size;
    }
    return getPositions(polygon).length / this.positionSize;
  }
  /** Override base Tesselator method */
  getGeometryFromBuffer(buffer) {
    if (this.normalize || !this.buffers.indices) {
      return super.getGeometryFromBuffer(buffer);
    }
    return null;
  }
  /** Implement base Tesselator interface */
  updateGeometryAttributes(polygon, context) {
    if (polygon && isCut2(polygon)) {
      for (const subPolygon of polygon) {
        const geometrySize = this.getGeometrySize(subPolygon);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPolygon, context);
        context.vertexStart += geometrySize;
        context.indexStart = this.indexStarts[context.geometryIndex + 1];
      }
    } else {
      const normalizedPolygon = polygon;
      this._updateIndices(normalizedPolygon, context);
      this._updatePositions(normalizedPolygon, context);
      this._updateVertexValid(normalizedPolygon, context);
    }
  }
  // Flatten the indices array
  _updateIndices(polygon, { geometryIndex, vertexStart: offset, indexStart }) {
    const { attributes, indexStarts, typedArrayManager } = this;
    let target = attributes.indices;
    if (!target || !polygon) {
      return;
    }
    let i = indexStart;
    const indices = getSurfaceIndices(
      polygon,
      this.positionSize,
      this.opts.preproject,
      this.opts.full3d
    );
    target = typedArrayManager.allocate(target, indexStart + indices.length, {
      copy: true
    });
    for (let j = 0; j < indices.length; j++) {
      target[i++] = indices[j] + offset;
    }
    indexStarts[geometryIndex + 1] = indexStart + indices.length;
    attributes.indices = target;
  }
  // Flatten out all the vertices of all the sub subPolygons
  _updatePositions(polygon, { vertexStart, geometrySize }) {
    const {
      attributes: { positions },
      positionSize
    } = this;
    if (!positions || !polygon) {
      return;
    }
    const polygonPositions = getPositions(polygon);
    for (let i = vertexStart, j = 0; j < geometrySize; i++, j++) {
      const x = polygonPositions[j * positionSize];
      const y = polygonPositions[j * positionSize + 1];
      const z = positionSize > 2 ? polygonPositions[j * positionSize + 2] : 0;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
  }
  _updateVertexValid(polygon, { vertexStart, geometrySize }) {
    const { positionSize } = this;
    const vertexValid = this.attributes.vertexValid;
    const holeIndices = polygon && getHoleIndices(polygon);
    if (polygon && polygon.edgeTypes) {
      vertexValid.set(polygon.edgeTypes, vertexStart);
    } else {
      vertexValid.fill(1, vertexStart, vertexStart + geometrySize);
    }
    if (holeIndices) {
      for (let j = 0; j < holeIndices.length; j++) {
        vertexValid[vertexStart + holeIndices[j] / positionSize - 1] = 0;
      }
    }
    vertexValid[vertexStart + geometrySize - 1] = 0;
  }
};
function isCut2(polygon) {
  return Array.isArray(polygon) && polygon.length > 0 && !Number.isFinite(polygon[0]);
}

// ../layers/src/solid-polygon-layer/solid-polygon-layer-uniforms.ts
var uniformBlockWGSL5 = (
  /* wgsl */
  `struct SolidPolygonUniforms {
  extruded: f32,
  isWireframe: f32,
  elevationScale: f32,
};

@group(0) @binding(auto) var<uniform> solidPolygon: SolidPolygonUniforms;
`
);
var uniformBlock6 = `layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`;
var solidPolygonUniforms = {
  name: "solidPolygon",
  source: uniformBlockWGSL5,
  vs: uniformBlock6,
  fs: uniformBlock6,
  uniformTypes: {
    extruded: "f32",
    isWireframe: "f32",
    elevationScale: "f32"
  }
};

// ../layers/src/solid-polygon-layer/solid-polygon-layer-vertex-main.glsl.ts
var solid_polygon_layer_vertex_main_glsl_default = `
in vec4 fillColors;
in vec4 lineColors;
in float rowIndexes;

out vec4 vColor;

struct PolygonProps {
  vec3 positions;
  vec3 positions64Low;
  vec3 normal;
  float elevations;
};

vec3 project_offset_normal(vec3 vector) {
  if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
    project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    // normals generated by the polygon tesselator are in lnglat offsets instead of meters
    return normalize(vector * project.commonUnitsPerWorldUnit);
  }
  return project_normal(vector);
}

void calculatePosition(PolygonProps props) {
  vec3 pos = props.positions;
  vec3 pos64Low = props.positions64Low;
  vec3 normal = props.normal;
  vec4 colors = solidPolygon.isWireframe ? lineColors : fillColors;

  geometry.worldPosition = props.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);

  if (solidPolygon.extruded) {
    pos.z += props.elevations * solidPolygon.elevationScale;
  }
  gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  if (solidPolygon.extruded) {
  #ifdef IS_SIDE_VERTEX
    normal = project_offset_normal(normal);
  #else
    normal = project_normal(normal);
  #endif
    geometry.normal = normal;
    vec3 lightColor = lighting_getLightColor(colors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
    vColor = vec4(lightColor, colors.a * layer.opacity);
  } else {
    vColor = vec4(colors.rgb, colors.a * layer.opacity);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// ../layers/src/solid-polygon-layer/solid-polygon-layer-vertex-top.glsl.ts
var solid_polygon_layer_vertex_top_glsl_default = `#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader

in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;

${solid_polygon_layer_vertex_main_glsl_default}

void main(void) {
  PolygonProps props;

  props.positions = vertexPositions;
  props.positions64Low = vertexPositions64Low;
  props.elevations = elevations;
  props.normal = vec3(0.0, 0.0, 1.0);

  calculatePosition(props);
}
`;

// ../layers/src/solid-polygon-layer/solid-polygon-layer-vertex-side.glsl.ts
var solid_polygon_layer_vertex_side_glsl_default = `#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX

in vec2 positions;

in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;

${solid_polygon_layer_vertex_main_glsl_default}

void main(void) {
  if(instanceVertexValid < 0.5){
    gl_Position = vec4(0.);
    return;
  }

  PolygonProps props;

  vec3 pos;
  vec3 pos64Low;
  vec3 nextPos;
  vec3 nextPos64Low;

  #if RING_WINDING_ORDER_CW == 1
    pos = vertexPositions;
    pos64Low = vertexPositions64Low;
    nextPos = nextVertexPositions;
    nextPos64Low = nextVertexPositions64Low;
  #else
    pos = nextVertexPositions;
    pos64Low = nextVertexPositions64Low;
    nextPos = vertexPositions;
    nextPos64Low = vertexPositions64Low;
  #endif

  props.positions = mix(pos, nextPos, positions.x);
  props.positions64Low = mix(pos64Low, nextPos64Low, positions.x);

  props.normal = vec3(
    pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
    nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
    0.0);

  props.elevations = elevations * positions.y;

  calculatePosition(props);
}
`;

// ../layers/src/solid-polygon-layer/solid-polygon-layer-fragment.glsl.ts
var solid_polygon_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader

precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main(void) {
  fragColor = vColor;
  // Fails to compile on some Android devices if geometry is never assigned (#8411)
  geometry.uv = vec2(0.);

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/solid-polygon-layer/solid-polygon-layer.wgsl.ts
function getSolidPolygonVertexHelpers() {
  return (
    /* wgsl */
    `fn project_offset_normal(vector: vec3<f32>) -> vec3<f32> {
  if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
      project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    return normalize(vector * project.commonUnitsPerWorldUnit);
  }
  return project_normal(vector);
}

fn apply_polygon_color(
  colors: vec4<f32>,
  normal: vec3<f32>,
  position: vec4<f32>
) -> vec4<f32> {
  if (solidPolygon.extruded > 0.5) {
    let lightColor = lighting_getLightColor2(
      colors.rgb,
      project.cameraPosition,
      position.xyz,
      normal
    );
    return vec4<f32>(lightColor, colors.a * layer.opacity);
  }
  return vec4<f32>(colors.rgb, colors.a * layer.opacity);
}
`
  );
}
function getSolidPolygonFragmentMain() {
  return (
    /* wgsl */
    `@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0, 0.0);

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = inp.vColor;

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`
  );
}
function getTopShaderWGSL() {
  return (
    /* wgsl */
    `${getSolidPolygonVertexHelpers()}

struct Attributes {
  @location(0) vertexPositions: vec3<f32>,
  @location(1) vertexPositions64Low: vec3<f32>,
  @location(2) elevations: f32,
  @location(3) fillColors: vec4<f32>,
  @location(4) lineColors: vec4<f32>,
  @location(5) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var outp: Varyings;

  var pos = attributes.vertexPositions;
  if (solidPolygon.extruded > 0.5) {
    pos.z += attributes.elevations * solidPolygon.elevationScale;
  }

  geometry.worldPosition = attributes.vertexPositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    pos,
    attributes.vertexPositions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  outp.position = projectedPosition.clipPosition;

  let normal = project_normal(vec3<f32>(0.0, 0.0, 1.0));
  geometry.normal = normal;

  let colors = select(
    attributes.fillColors,
    attributes.lineColors,
    solidPolygon.isWireframe > 0.5
  );
  outp.vColor = apply_polygon_color(colors, normal, geometry.position);
  outp.pickingColor = geometry.pickingColor;

  return outp;
}

${getSolidPolygonFragmentMain()}
`
  );
}
function getSideShaderWGSL(ringWindingOrderCW) {
  return (
    /* wgsl */
    `const RING_WINDING_ORDER_CW: bool = ${ringWindingOrderCW ? "true" : "false"};

${getSolidPolygonVertexHelpers()}

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) vertexPositions: vec3<f32>,
  @location(2) vertexPositions64Low: vec3<f32>,
  @location(3) nextVertexPositions: vec3<f32>,
  @location(4) nextVertexPositions64Low: vec3<f32>,
  @location(5) vertexValid: f32,
  @location(6) elevations: f32,
  @location(7) fillColors: vec4<f32>,
  @location(8) lineColors: vec4<f32>,
  @location(9) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var outp: Varyings;
  outp.position = vec4<f32>(0.0);
  outp.vColor = vec4<f32>(0.0);
  outp.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  if (attributes.vertexValid < 0.5) {
    return outp;
  }

  let pos = select(attributes.nextVertexPositions, attributes.vertexPositions, RING_WINDING_ORDER_CW);
  let pos64Low = select(
    attributes.nextVertexPositions64Low,
    attributes.vertexPositions64Low,
    RING_WINDING_ORDER_CW
  );
  let nextPos = select(attributes.vertexPositions, attributes.nextVertexPositions, RING_WINDING_ORDER_CW);
  let nextPos64Low = select(
    attributes.vertexPositions64Low,
    attributes.nextVertexPositions64Low,
    RING_WINDING_ORDER_CW
  );

  let position = mix(pos, nextPos, attributes.positions.x);
  let position64Low = mix(pos64Low, nextPos64Low, attributes.positions.x);

  var worldPosition = position;
  if (solidPolygon.extruded > 0.5) {
    worldPosition.z += attributes.elevations * attributes.positions.y * solidPolygon.elevationScale;
  }

  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    worldPosition,
    position64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  outp.position = projectedPosition.clipPosition;

  let normal = project_offset_normal(vec3<f32>(
    pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
    nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
    0.0
  ));
  geometry.normal = normal;

  let colors = select(
    attributes.fillColors,
    attributes.lineColors,
    solidPolygon.isWireframe > 0.5
  );
  outp.vColor = apply_polygon_color(colors, normal, geometry.position);
  outp.pickingColor = geometry.pickingColor;

  return outp;
}

${getSolidPolygonFragmentMain()}
`
  );
}
function getSolidPolygonShaderWGSL(type, ringWindingOrderCW) {
  return type === "top" ? getTopShaderWGSL() : getSideShaderWGSL(ringWindingOrderCW);
}

// ../layers/src/solid-polygon-layer/solid-polygon-layer.ts
var DEFAULT_COLOR7 = [0, 0, 0, 255];
var defaultProps9 = {
  filled: true,
  extruded: false,
  wireframe: false,
  _normalize: true,
  _windingOrder: "CW",
  _full3d: false,
  elevationScale: { type: "number", min: 0, value: 1 },
  getPolygon: { type: "accessor", value: (f) => f.polygon },
  getElevation: { type: "accessor", value: 1e3 },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR7 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR7 },
  material: true
};
var ATTRIBUTE_TRANSITION2 = {
  enter: (value, chunk) => {
    return chunk.length ? chunk.subarray(chunk.length - value.length) : value;
  }
};
var SolidPolygonLayer = class extends Layer {
  getShaders(type) {
    const ringWindingOrderCW = !this.props._normalize && this.props._windingOrder === "CCW" ? 0 : 1;
    return super.getShaders({
      vs: type === "top" ? solid_polygon_layer_vertex_top_glsl_default : solid_polygon_layer_vertex_side_glsl_default,
      fs: solid_polygon_layer_fragment_glsl_default,
      source: getSolidPolygonShaderWGSL(type, Boolean(ringWindingOrderCW)),
      defines: {
        RING_WINDING_ORDER_CW: ringWindingOrderCW
      },
      modules: [project32_default, color_default, import_shadertools3.gouraudMaterial, picking_default, solidPolygonUniforms]
    });
  }
  get wrapLongitude() {
    return false;
  }
  getBounds() {
    var _a;
    return (_a = this.getAttributeManager()) == null ? void 0 : _a.getBounds(["vertexPositions"]);
  }
  initializeState() {
    const { viewport } = this.context;
    let { coordinateSystem } = this.props;
    const { _full3d } = this.props;
    if (viewport.isGeospatial && coordinateSystem === "default") {
      coordinateSystem = "lnglat";
    }
    let preproject;
    if (coordinateSystem === "lnglat") {
      if (_full3d) {
        preproject = viewport.projectPosition.bind(viewport);
      } else {
        preproject = viewport.projectFlat.bind(viewport);
      }
    }
    this.setState({
      numInstances: 0,
      polygonTesselator: new PolygonTesselator({
        // Lnglat coordinates are usually projected non-linearly, which affects tesselation results
        // Provide a preproject function if the coordinates are in lnglat
        preproject,
        fp64: this.use64bitPositions(),
        IndexType: Uint32Array
      })
    });
    const attributeManager = this.getAttributeManager();
    const noAlloc = true;
    const isWebGPU = this.context.device.type === "webgpu";
    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateIndices,
        noAlloc
      },
      vertexPositions: {
        size: 3,
        type: "float64",
        stepMode: "dynamic",
        fp64: this.use64bitPositions(),
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getPolygon",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculatePositions,
        noAlloc,
        ...isWebGPU ? {} : {
          shaderAttributes: {
            nextVertexPositions: {
              vertexOffset: 1
            }
          }
        }
      },
      ...isWebGPU ? {
        // WebGPU cannot express WebGL's one-vertex offset view in a buffer layout.
        nextVertexPositions: {
          size: 3,
          type: "float64",
          stepMode: "dynamic",
          fp64: this.use64bitPositions(),
          transition: false,
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculateNextPositions,
          noAlloc
        }
      } : {},
      [isWebGPU ? "vertexValid" : "instanceVertexValid"]: {
        size: 1,
        type: isWebGPU ? "float32" : "uint16",
        stepMode: "instance",
        // eslint-disable-next-line @typescript-eslint/unbound-method
        update: this.calculateVertexValid,
        noAlloc
      },
      elevations: {
        size: 1,
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getElevation",
        bufferGroup: "solid-polygon-instance-data"
      },
      fillColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getFillColor",
        defaultValue: DEFAULT_COLOR7,
        bufferGroup: "solid-polygon-instance-data"
      },
      lineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getLineColor",
        defaultValue: DEFAULT_COLOR7,
        bufferGroup: "solid-polygon-instance-data"
      },
      /** Source polygon row, including __source.index for composite data. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        stepMode: "dynamic",
        accessor: (object, { index }) => object && object.__source ? object.__source.index : index,
        bufferGroup: "solid-polygon-instance-data"
      }
    });
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    const { index } = info;
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      info.object = data.find((d) => d.__source.index === index);
    }
    return info;
  }
  disablePickingIndex(objectIndex) {
    const data = this.props.data;
    if (data[0] && data[0].__source) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].__source.index === objectIndex) {
          this._disablePickingIndex(i);
        }
      }
    } else {
      super.disablePickingIndex(objectIndex);
    }
  }
  draw({ uniforms }) {
    const { extruded, filled, wireframe, elevationScale } = this.props;
    const { topModel, sideModel, wireframeModel, polygonTesselator } = this.state;
    const renderUniforms = {
      extruded: Boolean(extruded),
      elevationScale,
      isWireframe: false
    };
    if (wireframeModel && wireframe) {
      wireframeModel.setInstanceCount(polygonTesselator.instanceCount - 1);
      wireframeModel.shaderInputs.setProps({ solidPolygon: { ...renderUniforms, isWireframe: true } });
      wireframeModel.draw(this.context.renderPass);
    }
    if (sideModel && filled) {
      sideModel.setInstanceCount(polygonTesselator.instanceCount - 1);
      sideModel.shaderInputs.setProps({ solidPolygon: renderUniforms });
      sideModel.draw(this.context.renderPass);
    }
    if (topModel && filled) {
      topModel.setVertexCount(polygonTesselator.vertexCount);
      topModel.shaderInputs.setProps({ solidPolygon: renderUniforms });
      topModel.draw(this.context.renderPass);
    }
  }
  updateState(updateParams) {
    var _a;
    super.updateState(updateParams);
    this.updateGeometry(updateParams);
    const { props, oldProps, changeFlags } = updateParams;
    const attributeManager = this.getAttributeManager();
    const regenerateModels = changeFlags.extensionsChanged || props.filled !== oldProps.filled || props.extruded !== oldProps.extruded;
    if (regenerateModels) {
      (_a = this.state.models) == null ? void 0 : _a.forEach((model) => model.destroy());
      this.setState(this._getModels());
      attributeManager.invalidateAll();
    }
  }
  updateGeometry({ props, oldProps, changeFlags }) {
    const geometryConfigChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);
    if (geometryConfigChanged) {
      const { polygonTesselator } = this.state;
      const buffers = props.data.attributes || {};
      polygonTesselator.updateGeometry({
        data: props.data,
        normalize: props._normalize,
        geometryBuffer: buffers.getPolygon,
        // Keep derived WebGPU attributes independent of external binary accessor buffers.
        buffers: this.context.device.type === "webgpu" ? { ...buffers } : buffers,
        getGeometry: props.getPolygon,
        positionFormat: props.positionFormat,
        wrapLongitude: props.wrapLongitude,
        // TODO - move the flag out of the viewport
        resolution: this.context.viewport.resolution,
        fp64: this.use64bitPositions(),
        dataChanged: changeFlags.dataChanged,
        full3d: props._full3d
      });
      this.setState({
        numInstances: polygonTesselator.instanceCount,
        startIndices: polygonTesselator.vertexStarts
      });
      if (!changeFlags.dataChanged) {
        this.getAttributeManager().invalidateAll();
      }
    }
  }
  _getModels() {
    const { id, filled, extruded } = this.props;
    let topModel;
    let sideModel;
    let wireframeModel;
    if (filled) {
      const shaders = this.getShaders("top");
      shaders.defines = { ...shaders.defines, NON_INSTANCED_MODEL: 1 };
      let bufferLayout = this.getAttributeManager().getBufferLayouts({ isInstanced: false });
      if (this.context.device.type === "webgpu") {
        bufferLayout = bufferLayout.filter(
          (layout) => layout.name !== "indices" && layout.name !== "vertexValid" && layout.name !== "instanceVertexValid" && layout.name !== "nextVertexPositions"
        );
      }
      topModel = new import_engine13.Model(this.context.device, {
        ...shaders,
        id: `${id}-top`,
        topology: "triangle-list",
        bufferLayout,
        isIndexed: true,
        userData: {
          excludeAttributes: {
            vertexValid: true,
            instanceVertexValid: true,
            nextVertexPositions: true
          }
        }
      });
    }
    if (extruded) {
      let bufferLayout = this.getAttributeManager().getBufferLayouts({ isInstanced: true });
      if (this.context.device.type === "webgpu") {
        bufferLayout = bufferLayout.filter((layout) => layout.name !== "indices");
      }
      sideModel = new import_engine13.Model(this.context.device, {
        ...this.getShaders("side"),
        id: `${id}-side`,
        bufferLayout,
        geometry: new import_engine13.Geometry({
          topology: "triangle-strip",
          attributes: {
            // top right - top left - bottom right - bottom left
            positions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 1, 1, 0, 1])
            }
          }
        }),
        isInstanced: true,
        userData: {
          excludeAttributes: { indices: true }
        }
      });
      wireframeModel = new import_engine13.Model(this.context.device, {
        ...this.getShaders("side"),
        id: `${id}-wireframe`,
        bufferLayout,
        geometry: new import_engine13.Geometry({
          topology: "line-strip",
          attributes: {
            // top right - top left - bottom left - bottom right
            positions: {
              size: 2,
              value: new Float32Array([1, 0, 0, 0, 0, 1, 1, 1])
            }
          }
        }),
        isInstanced: true,
        userData: {
          excludeAttributes: { indices: true }
        }
      });
    }
    return {
      models: [sideModel, wireframeModel, topModel].filter(Boolean),
      topModel,
      sideModel,
      wireframeModel
    };
  }
  calculateIndices(attribute) {
    const { polygonTesselator } = this.state;
    attribute.startIndices = polygonTesselator.indexStarts;
    attribute.value = polygonTesselator.get("indices");
  }
  calculatePositions(attribute) {
    var _a;
    const { polygonTesselator } = this.state;
    attribute.startIndices = polygonTesselator.vertexStarts;
    const binaryPositions = (_a = this.props.data.attributes) == null ? void 0 : _a.getPolygon;
    if (this.context.device.type === "webgpu" && ArrayBuffer.isView(binaryPositions == null ? void 0 : binaryPositions.value)) {
      const { value, size = 3, offset = 0, stride } = binaryPositions;
      const elementOffset = offset / value.BYTES_PER_ELEMENT;
      const elementStride = stride ? stride / value.BYTES_PER_ELEMENT : size;
      const positions = new Float64Array(polygonTesselator.instanceCount * 3);
      for (let vertexIndex = 0; vertexIndex < polygonTesselator.instanceCount; vertexIndex++) {
        const sourceIndex = elementOffset + vertexIndex * elementStride;
        const targetIndex = vertexIndex * 3;
        positions[targetIndex] = value[sourceIndex];
        positions[targetIndex + 1] = value[sourceIndex + 1];
        positions[targetIndex + 2] = size > 2 ? value[sourceIndex + 2] : 0;
      }
      attribute.value = positions;
      return;
    }
    attribute.value = polygonTesselator.get("positions");
  }
  calculateVertexValid(attribute) {
    var _a, _b;
    const binaryVertexValid = (_b = (_a = this.props.data.attributes) == null ? void 0 : _a.instanceVertexValid) == null ? void 0 : _b.value;
    const vertexValid = this.context.device.type === "webgpu" && binaryVertexValid ? binaryVertexValid : this.state.polygonTesselator.get("vertexValid");
    attribute.value = this.context.device.type === "webgpu" && vertexValid ? Float32Array.from(vertexValid) : vertexValid;
  }
  calculateNextPositions(attribute) {
    var _a, _b, _c;
    const { polygonTesselator } = this.state;
    const attributes = this.getAttributeManager().getAttributes();
    const positions = attributes.vertexPositions.value;
    const vertexValid = ((_b = (_a = this.props.data.attributes) == null ? void 0 : _a.instanceVertexValid) == null ? void 0 : _b.value) || ((_c = attributes.vertexValid) == null ? void 0 : _c.value) || polygonTesselator.get("vertexValid");
    attribute.startIndices = polygonTesselator.vertexStarts;
    if (!positions) {
      attribute.value = positions;
      return;
    }
    const vertexCount = positions.length / 3;
    const nextPositions = new positions.constructor(positions.length);
    for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex++) {
      const sourceIndex = vertexIndex * 3;
      const nextSourceIndex = (vertexValid == null ? void 0 : vertexValid[vertexIndex]) && vertexIndex + 1 < vertexCount ? sourceIndex + 3 : sourceIndex;
      for (let componentIndex = 0; componentIndex < 3; componentIndex++) {
        nextPositions[sourceIndex + componentIndex] = positions[nextSourceIndex + componentIndex];
      }
    }
    attribute.value = nextPositions;
  }
};
SolidPolygonLayer.defaultProps = defaultProps9;
SolidPolygonLayer.layerName = "SolidPolygonLayer";

// ../layers/src/utils.ts
function replaceInRange({
  data,
  getIndex,
  dataRange,
  replace
}) {
  const { startRow = 0, endRow = Infinity } = dataRange;
  const count2 = data.length;
  let replaceStart = count2;
  let replaceEnd = count2;
  for (let i = 0; i < count2; i++) {
    const row = getIndex(data[i]);
    if (replaceStart > i && row >= startRow) {
      replaceStart = i;
    }
    if (row >= endRow) {
      replaceEnd = i;
      break;
    }
  }
  let index = replaceStart;
  const dataLengthChanged = replaceEnd - replaceStart !== replace.length;
  const endChunk = dataLengthChanged ? data.slice(replaceEnd) : void 0;
  for (let i = 0; i < replace.length; i++) {
    data[index++] = replace[i];
  }
  if (endChunk) {
    for (let i = 0; i < endChunk.length; i++) {
      data[index++] = endChunk[i];
    }
    data.length = index;
  }
  return {
    startRow: replaceStart,
    endRow: replaceStart + replace.length
  };
}

// ../layers/src/polygon-layer/polygon-layer.ts
var defaultLineColor = [0, 0, 0, 255];
var defaultFillColor = [0, 0, 0, 255];
var defaultProps10 = {
  stroked: true,
  filled: true,
  extruded: false,
  elevationScale: 1,
  wireframe: false,
  _normalize: true,
  _windingOrder: "CW",
  lineWidthUnits: "meters",
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,
  lineAntialiasing: false,
  getPolygon: { type: "accessor", value: (f) => f.polygon },
  // Polygon fill color
  getFillColor: { type: "accessor", value: defaultFillColor },
  // Point, line and polygon outline color
  getLineColor: { type: "accessor", value: defaultLineColor },
  // Line and polygon outline accessors
  getLineWidth: { type: "accessor", value: 1 },
  // Polygon extrusion accessor
  getElevation: { type: "accessor", value: 1e3 },
  // Optional material for 'lighting' shader module
  material: true
};
var PolygonLayer = class extends CompositeLayer {
  initializeState() {
    this.state = {
      paths: [],
      pathsDiff: null
    };
    if (this.props.getLineDashArray) {
      log_default.removed("getLineDashArray", "PathStyleExtension")();
    }
  }
  updateState({ changeFlags }) {
    const geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);
    if (geometryChanged && Array.isArray(changeFlags.dataChanged)) {
      const paths = this.state.paths.slice();
      const pathsDiff = changeFlags.dataChanged.map(
        (dataRange) => replaceInRange({
          data: paths,
          getIndex: (p) => p.__source.index,
          dataRange,
          replace: this._getPaths(dataRange)
        })
      );
      this.setState({ paths, pathsDiff });
    } else if (geometryChanged) {
      this.setState({
        paths: this._getPaths(),
        pathsDiff: null
      });
    }
  }
  _getPaths(dataRange = {}) {
    const { data, getPolygon, positionFormat, _normalize } = this.props;
    const paths = [];
    const positionSize = positionFormat === "XY" ? 2 : 3;
    const { startRow, endRow } = dataRange;
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      let polygon = getPolygon(object, objectInfo);
      if (_normalize) {
        polygon = normalize(polygon, positionSize);
      }
      const { holeIndices } = polygon;
      const positions = polygon.positions || polygon;
      if (holeIndices) {
        for (let i = 0; i <= holeIndices.length; i++) {
          const path = positions.slice(holeIndices[i - 1] || 0, holeIndices[i] || positions.length);
          paths.push(this.getSubLayerRow({ path }, object, objectInfo.index));
        }
      } else {
        paths.push(this.getSubLayerRow({ path: positions }, object, objectInfo.index));
      }
    }
    return paths;
  }
  /* eslint-disable complexity */
  renderLayers() {
    const {
      data,
      _dataDiff,
      stroked,
      filled,
      extruded,
      wireframe,
      _normalize,
      _windingOrder,
      elevationScale,
      transitions,
      positionFormat
    } = this.props;
    const {
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      lineAntialiasing,
      lineDashJustified
    } = this.props;
    const {
      getFillColor,
      getLineColor,
      getLineWidth,
      getLineDashArray,
      getElevation,
      getPolygon,
      updateTriggers,
      material
    } = this.props;
    const { paths, pathsDiff } = this.state;
    const FillLayer = this.getSubLayerClass("fill", SolidPolygonLayer);
    const StrokeLayer = this.getSubLayerClass("stroke", PathLayer);
    const polygonLayer = this.shouldRenderSubLayer("fill", paths) && new FillLayer(
      {
        _dataDiff,
        extruded,
        elevationScale,
        filled,
        wireframe,
        _normalize,
        _windingOrder,
        getElevation,
        getFillColor,
        getLineColor: extruded && wireframe ? getLineColor : defaultLineColor,
        material,
        transitions
      },
      this.getSubLayerProps({
        id: "fill",
        updateTriggers: updateTriggers && {
          getPolygon: updateTriggers.getPolygon,
          getElevation: updateTriggers.getElevation,
          getFillColor: updateTriggers.getFillColor,
          // using a legacy API to invalid lineColor attributes
          // if (extruded && wireframe) has changed
          lineColors: extruded && wireframe,
          getLineColor: updateTriggers.getLineColor
        }
      }),
      {
        data,
        positionFormat,
        getPolygon
      }
    );
    const polygonLineLayer = !extruded && stroked && this.shouldRenderSubLayer("stroke", paths) && new StrokeLayer(
      {
        _dataDiff: pathsDiff && (() => pathsDiff),
        widthUnits: lineWidthUnits,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        jointRounded: lineJointRounded,
        miterLimit: lineMiterLimit,
        antialiasing: lineAntialiasing,
        dashJustified: lineDashJustified,
        // Already normalized
        _pathType: "loop",
        transitions: transitions && {
          getWidth: transitions.getLineWidth,
          getColor: transitions.getLineColor,
          getPath: transitions.getPolygon
        },
        getColor: this.getSubLayerAccessor(getLineColor),
        getWidth: this.getSubLayerAccessor(getLineWidth),
        getDashArray: this.getSubLayerAccessor(getLineDashArray)
      },
      this.getSubLayerProps({
        id: "stroke",
        updateTriggers: updateTriggers && {
          getWidth: updateTriggers.getLineWidth,
          getColor: updateTriggers.getLineColor,
          getDashArray: updateTriggers.getLineDashArray
        }
      }),
      {
        data: paths,
        positionFormat,
        getPath: (x) => x.path
      }
    );
    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonLayer,
      polygonLineLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonLayer
    ];
  }
  /* eslint-enable complexity */
};
PolygonLayer.layerName = "PolygonLayer";
PolygonLayer.defaultProps = defaultProps10;

// ../layers/src/geojson-layer/geojson-binary.ts
function binaryToFeatureForAccesor(data, index) {
  if (!data) {
    return null;
  }
  const featureIndex = "startIndices" in data ? data.startIndices[index] : index;
  const geometryIndex = data.featureIds.value[featureIndex];
  if (featureIndex !== -1) {
    return getPropertiesForIndex(data, geometryIndex, featureIndex);
  }
  return null;
}
function getPropertiesForIndex(data, propertiesIndex, numericPropsIndex) {
  const feature = {
    properties: { ...data.properties[propertiesIndex] }
  };
  for (const prop in data.numericProps) {
    feature.properties[prop] = data.numericProps[prop].value[numericPropsIndex];
  }
  return feature;
}
function calculatePickingIndexes(geojsonBinary) {
  const pickingIndexes = {
    points: null,
    lines: null,
    polygons: null
  };
  for (const key in pickingIndexes) {
    const featureIds = geojsonBinary[key].globalFeatureIds.value;
    pickingIndexes[key] = new Uint32Array(featureIds);
  }
  return pickingIndexes;
}

// ../layers/src/text-layer/multi-icon-layer/sdf-uniforms.ts
var uniformBlock7 = `layout(std140) uniform sdfUniforms {
  float gamma;
  bool enabled;
  float buffer;
  float outlineBuffer;
  vec4 outlineColor;
} sdf;
`;
var sdfUniforms = {
  name: "sdf",
  vs: uniformBlock7,
  fs: uniformBlock7,
  uniformTypes: {
    gamma: "f32",
    enabled: "f32",
    buffer: "f32",
    outlineBuffer: "f32",
    outlineColor: "vec4<f32>"
  }
};

// ../layers/src/text-layer/text-uniforms.ts
var CONTENT_ALIGN = {
  none: 0,
  start: 1,
  center: 2,
  end: 3
};
var glslUniformBlock3 = `layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${CONTENT_ALIGN.start}
#define ALIGN_MODE_CENTER ${CONTENT_ALIGN.center}
#define ALIGN_MODE_END ${CONTENT_ALIGN.end}
`;
var textUniforms = {
  name: "text",
  vs: glslUniformBlock3,
  getUniforms: ({
    contentCutoffPixels = [0, 0],
    contentAlignHorizontal = "none",
    contentAlignVertical = "none",
    fontSize,
    viewport
  }) => ({
    cutoffPixels: contentCutoffPixels,
    align: [CONTENT_ALIGN[contentAlignHorizontal], CONTENT_ALIGN[contentAlignVertical]],
    fontSize,
    flipY: (viewport == null ? void 0 : viewport.flipY) ?? false
  }),
  uniformTypes: {
    cutoffPixels: "vec2<f32>",
    align: "vec2<i32>",
    fontSize: "f32",
    flipY: "f32"
  }
};

// ../layers/src/text-layer/multi-icon-layer/multi-icon-layer-vertex.glsl.ts
var multi_icon_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME multi-icon-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in float rowIndexes;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
in vec4 instanceClipRect;

out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = angle * PI / 180.0;
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

float getPixelOffsetFromAlignment(float anchor, float extent, float clipStart, float clipEnd, int mode) {
  if (clipEnd < clipStart) return 0.0;
  if (mode == ALIGN_MODE_START) {
    return max(- (anchor + clipStart), 0.0);
  }
  if (mode == ALIGN_MODE_CENTER) {
    float _min = max(0., anchor + clipStart);
    float _max = min(extent, anchor + clipEnd);
    return _min < _max ? (_min + _max) / 2.0 - anchor : 0.0;
  }
  if (mode == ALIGN_MODE_END) {
    return min(extent - (anchor + clipEnd), 0.);
  }
  return 0.0;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
  uv = positions;

  vec2 iconSize = instanceIconFrames.zw;
  // convert size in meters to pixels, then scaled and clamp
 
  // project meters to pixels and clamp to limits 
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  float instanceScale = sizePixels / text.fontSize;

  // scale and rotate vertex in "pixel" value and convert back to fraction in clipspace
  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
  pixelOffset += instancePixelOffset;
  pixelOffset.y *= -1.0;

  vec2 anchorPosScreen;
  if (icon.billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    anchorPosScreen = gl_Position.xy / gl_Position.w;
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    if (text.flipY) {
      offset_common.y *= -1.;
    }
    DECKGL_FILTER_SIZE(offset_common, geometry);
    vec4 anchorPos = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0));
    anchorPosScreen = anchorPos.xy / anchorPos.w;
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position); 
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  anchorPosScreen = vec2(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 * project.viewportSize / project.devicePixelRatio;
  vec2 xy = project_size_to_pixel(instanceClipRect.xy);
  vec2 wh = project_size_to_pixel(instanceClipRect.zw);
  if (text.flipY) {
    xy.y = -xy.y - wh.y;
  }
  if (text.align.x > 0 || text.align.y > 0) {
    vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
    vec2 scrollPixels = vec2(
      getPixelOffsetFromAlignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
      -getPixelOffsetFromAlignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
    );
    pixelOffset += scrollPixels;
    gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels);
  }

  if (instanceClipRect.z >= 0.) {
    if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
      gl_Position = vec4(0.0);
    }
    else if (text.cutoffPixels.x > 0.) {
      float vpWidth = project.viewportSize.x / project.devicePixelRatio;
      float l = max(anchorPosScreen.x + xy.x, 0.0);
      float r = min(anchorPosScreen.x + xy.x + wh.x, vpWidth);
      if (r - l < text.cutoffPixels.x) {
        gl_Position = vec4(0.0);
      }
    }
  }
  if (instanceClipRect.w >= 0.) {
    if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
      gl_Position = vec4(0.0);
    }
    else if (text.cutoffPixels.y > 0.) {
      float vpHeight = project.viewportSize.y / project.devicePixelRatio;
      float t = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
      float b = min(anchorPosScreen.y - xy.y, vpHeight);
      if (b - t < text.cutoffPixels.y) {
        gl_Position = vec4(0.0);
      }
    }
  }

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / icon.iconsTextureDim;

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);

  vColorMode = instanceColorModes;
}
`
);

// ../layers/src/text-layer/multi-icon-layer/multi-icon-layer-fragment.glsl.ts
var multi_icon_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME multi-icon-layer-fragment-shader

precision highp float;

uniform sampler2D iconsTexture;

in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  if (!bool(picking.isActive)) {
    float alpha = texture(iconsTexture, vTextureCoords).a;
    vec4 color = vColor;

    // if enable sdf (signed distance fields)
    if (sdf.enabled) {
      float distance = alpha;
      alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);

      if (sdf.outlineBuffer > 0.0) {
        float inFill = alpha;
        float inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
        color = mix(sdf.outlineColor, vColor, inFill);
        alpha = inBorder;
      }
    }

    // Take the global opacity and the alpha from color into account for the alpha component
    float a = alpha * color.a;
    
    if (a < icon.alphaCutoff) {
      discard;
    }

    fragColor = vec4(color.rgb, a * layer.opacity);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/text-layer/multi-icon-layer/multi-icon-layer.wgsl.ts
function getShaderWGSL3({ collision = false } = {}) {
  return (
    /* wgsl */
    `struct IconUniforms {
  sizeScale: f32,
  iconsTextureDim: vec2<f32>,
  sizeBasis: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  billboard: i32,
  sizeUnits: i32,
  alphaCutoff: f32
};

struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32
};

struct SdfUniforms {
  gamma: f32,
  enabled: f32,
  buffer: f32,
  outlineBuffer: f32,
  outlineColor: vec4<f32>
};

${collision ? `struct CollisionUniforms {
  sort: i32,
  enabled: i32
};
` : ""}

const ALIGN_MODE_START: i32 = 1;
const ALIGN_MODE_CENTER: i32 = 2;
const ALIGN_MODE_END: i32 = 3;

@group(0) @binding(auto) var<uniform> icon: IconUniforms;
@group(0) @binding(auto) var<uniform> text: TextUniforms;
@group(0) @binding(auto) var<uniform> sdf: SdfUniforms;
${collision ? "@group(0) @binding(auto) var<uniform> collision: CollisionUniforms;" : ""}
@group(0) @binding(auto) var iconsTexture : texture_2d<f32>;
@group(0) @binding(auto) var iconsTextureSampler : sampler;
${collision ? `@group(0) @binding(auto) var collision_texture : texture_2d<f32>;
` : ""}

fn rotate_by_angle(vertex: vec2<f32>, angle_deg: f32) -> vec2<f32> {
  let angle_radian = angle_deg * PI / 180.0;
  let c = cos(angle_radian);
  let s = sin(angle_radian);
  let rotation = mat2x2<f32>(vec2<f32>(c, -s), vec2<f32>(s, c));
  return rotation * vertex;
}

fn get_pixel_offset_from_alignment(
  anchor: f32,
  extent: f32,
  clipStart: f32,
  clipEnd: f32,
  mode: i32
) -> f32 {
  if (clipEnd < clipStart) {
    return 0.0;
  }
  if (mode == ALIGN_MODE_START) {
    return max(-(anchor + clipStart), 0.0);
  }
  if (mode == ALIGN_MODE_CENTER) {
    let minValue = max(0.0, anchor + clipStart);
    let maxValue = min(extent, anchor + clipEnd);
    if (minValue < maxValue) {
      return (minValue + maxValue) / 2.0 - anchor;
    }
    return 0.0;
  }
  if (mode == ALIGN_MODE_END) {
    return min(extent - (anchor + clipEnd), 0.0);
  }
  return 0.0;
}

${collision ? `fn collision_match(texCoords: vec2<f32>, pickingColor: vec3<f32>) -> f32 {
  let textureSize = vec2<i32>(textureDimensions(collision_texture));
  let pixelCoords = clamp(
    vec2<i32>(texCoords * vec2<f32>(textureSize)),
    vec2<i32>(0),
    textureSize - vec2<i32>(1)
  );
  let collisionPickingColor = textureLoad(collision_texture, pixelCoords, 0);
  let delta = dot(abs(collisionPickingColor.rgb - pickingColor), vec3<f32>(1.0));
  return step(delta, 0.001);
}

fn collision_is_visible(texCoords: vec2<f32>, pickingColor: vec3<f32>) -> f32 {
  if (collision.enabled == 0) {
    return 1.0;
  }

  var accumulator = 0.0;
  let stepSize = vec2<f32>(1.0) / project.viewportSize;

  for (var i: i32 = -2; i <= 2; i = i + 1) {
    for (var j: i32 = -2; j <= 2; j = j + 1) {
      let delta = vec2<f32>(f32(j), f32(i)) * stepSize;
      accumulator = accumulator + collision_match(texCoords + delta, pickingColor);
    }
  }

  return pow(accumulator / 25.0, 2.2);
}
` : ""}

struct Attributes {
  @location(0) positions: vec2<f32>,

  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceColors: vec4<f32>,
  @location(6) instanceIconFrames: vec4<f32>,
  @location(7) instanceColorModes: f32,
  @location(8) instanceOffsets: vec2<f32>,
  @location(9) instancePixelOffset: vec2<f32>,
  @location(10) rowIndexes: u32,
  @location(11) instanceClipRect: vec4<f32>,
  ${collision ? "@location(12) collisionPriorities: f32," : ""}
};

struct Varyings {
  @builtin(position) position: vec4<f32>,

  @location(0) vColorMode: f32,
  @location(1) vColor: vec4<f32>,
  @location(2) vTextureCoords: vec2<f32>,
  @location(3) uv: vec2<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inp: Attributes) -> Varyings {
  geometry.worldPosition = inp.instancePositions;
  geometry.uv = inp.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(inp.rowIndexes);

  var outp: Varyings;
  outp.uv = inp.positions;

  let iconSize = inp.instanceIconFrames.zw;

  let sizePixels = clamp(
    project_unit_size_to_pixel(inp.instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  var pixelOffset = inp.positions / 2.0 * iconSize + inp.instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, inp.instanceAngles) * instanceScale;
  pixelOffset = pixelOffset + inp.instancePixelOffset;
  pixelOffset.y = pixelOffset.y * -1.0;

  var pos: vec4<f32>;
  var anchorPosScreen: vec2<f32>;
  if (icon.billboard != 0) {
    pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    anchorPosScreen = pos.xy / pos.w;

    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    pos = vec4<f32>(pos.x + clipOffset.x, pos.y + clipOffset.y, pos.z, pos.w);
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    let anchorPos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, vec3<f32>(0.0));
    anchorPosScreen = anchorPos.xy / anchorPos.w;
    pos = project_position_to_clipspace(inp.instancePositions, inp.instancePositions64Low, offsetCommon);
  }

  anchorPosScreen = vec2<f32>(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 *
    project.viewportSize / project.devicePixelRatio;
  var xy = project_size_vec2(inp.instanceClipRect.xy) * project.scale;
  var wh = project_size_vec2(inp.instanceClipRect.zw) * project.scale;

  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (text.align.x > 0 || text.align.y > 0) {
    let viewportPixels = project.viewportSize / project.devicePixelRatio;
    let scrollPixels = vec2<f32>(
      get_pixel_offset_from_alignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
      -get_pixel_offset_from_alignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
    );
    pixelOffset = pixelOffset + scrollPixels;
    let scrollClipOffset = project_pixel_size_to_clipspace(scrollPixels);
    pos.x = pos.x + scrollClipOffset.x;
    pos.y = pos.y + scrollClipOffset.y;
  }

  if (inp.instanceClipRect.z >= 0.0) {
    if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
      pos = vec4<f32>(0.0);
    } else if (text.cutoffPixels.x > 0.0) {
      let viewportWidth = project.viewportSize.x / project.devicePixelRatio;
      let left = max(anchorPosScreen.x + xy.x, 0.0);
      let right = min(anchorPosScreen.x + xy.x + wh.x, viewportWidth);
      if (right - left < text.cutoffPixels.x) {
        pos = vec4<f32>(0.0);
      }
    }
  }
  if (inp.instanceClipRect.w >= 0.0) {
    if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
      pos = vec4<f32>(0.0);
    } else if (text.cutoffPixels.y > 0.0) {
      let viewportHeight = project.viewportSize.y / project.devicePixelRatio;
      let top = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
      let bottom = min(anchorPosScreen.y - xy.y, viewportHeight);
      if (bottom - top < text.cutoffPixels.y) {
        pos = vec4<f32>(0.0);
      }
    }
  }

  ${collision ? `  if (collision.sort != 0) {
    pos.z = -0.001 * inp.collisionPriorities * pos.w;
  }
  ` : ""}

  let uvMix = (inp.positions.xy + vec2<f32>(1.0, 1.0)) * 0.5;
  outp.vTextureCoords = mix(inp.instanceIconFrames.xy, inp.instanceIconFrames.xy + iconSize, uvMix) / icon.iconsTextureDim;

  outp.position = pos;
  outp.vColor = inp.instanceColors;
  outp.vColorMode = inp.instanceColorModes;
  outp.pickingColor = picking_getPickingColorFromIndex(inp.rowIndexes);

  return outp;
}

@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = inp.uv;

  let texColor = textureSample(iconsTexture, iconsTextureSampler, inp.vTextureCoords);
  var alpha = texColor.a;
  var color = inp.vColor;

  if (sdf.enabled > 0.5) {
    let distance = alpha;
    alpha = smoothstep(sdf.buffer - sdf.gamma, sdf.buffer + sdf.gamma, distance);

    if (sdf.outlineBuffer > 0.0) {
      let inFill = alpha;
      let inBorder = smoothstep(sdf.outlineBuffer - sdf.gamma, sdf.outlineBuffer + sdf.gamma, distance);
      color = mix(sdf.outlineColor, inp.vColor, inFill);
      alpha = inBorder;
    }
  } else if (inp.vColorMode == 0.0) {
    color = texColor;
  }

  var a = alpha * color.a * layer.opacity;
  if (a < icon.alphaCutoff) {
    discard;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  ${collision ? `  let collisionFade = collision_is_visible(inp.position.xy / project.viewportSize, inp.pickingColor);
  a = a * collisionFade;
  if (a <= 0.0001) {
    discard;
  }
  ` : ""}

  var fragColor = deckgl_premultiplied_alpha(vec4<f32>(color.rgb, a));

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return fragColor;
}
`
  );
}
var shaderWGSL6 = getShaderWGSL3();

// ../layers/src/text-layer/multi-icon-layer/multi-icon-layer.ts
var DEFAULT_BUFFER2 = 192 / 256;
var defaultProps11 = {
  getIconOffsets: { type: "accessor", value: (x) => x.offsets },
  getContentBox: { type: "accessor", value: [0, 0, -1, -1] },
  fontSize: 1,
  alphaCutoff: 1e-3,
  smoothing: 0.1,
  outlineWidth: 0,
  outlineColor: { type: "color", value: [0, 0, 0, 255] },
  contentCutoffPixels: { type: "array", value: [0, 0] },
  contentAlignHorizontal: "none",
  contentAlignVertical: "none"
};
var MultiIconLayer = class extends IconLayer {
  getShaders() {
    const shaders = super.getShaders();
    return {
      ...shaders,
      modules: [...shaders.modules, textUniforms, sdfUniforms],
      vs: multi_icon_layer_vertex_glsl_default,
      fs: multi_icon_layer_fragment_glsl_default,
      source: shaderWGSL6
    };
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    const instanceIconDefs = attributeManager.attributes.instanceIconDefs;
    instanceIconDefs.settings.update = this.calculateInstanceIconDefs;
    attributeManager.addInstanced({
      /** Source text row for each generated character instance. */
      rowIndexes: {
        type: "uint32",
        size: 1,
        bufferGroup: "icon-instance-data",
        accessor: (object, { index }) => index
      },
      instanceClipRect: {
        size: 4,
        bufferGroup: "icon-instance-data",
        accessor: "getContentBox",
        defaultValue: [0, 0, -1, -1]
      }
    });
  }
  updateState(params) {
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { outlineColor } = props;
    if (changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.getIcon || changeFlags.updateTriggersChanged.getIconOffsets)) {
      this.getAttributeManager().invalidate("instanceIconDefs");
    }
    if (outlineColor !== oldProps.outlineColor) {
      const normalizedOutlineColor = [
        outlineColor[0] / 255,
        outlineColor[1] / 255,
        outlineColor[2] / 255,
        (outlineColor[3] ?? 255) / 255
      ];
      this.setState({
        outlineColor: normalizedOutlineColor
      });
    }
    if (!props.sdf && props.outlineWidth) {
      log_default.warn(`${this.id}: fontSettings.sdf is required to render outline`)();
    }
  }
  draw(params) {
    const {
      sdf,
      smoothing,
      fontSize,
      outlineWidth,
      contentCutoffPixels,
      contentAlignHorizontal,
      contentAlignVertical
    } = this.props;
    const { outlineColor } = this.state;
    const outlineBuffer = outlineWidth ? Math.max(smoothing, DEFAULT_BUFFER2 * (1 - outlineWidth)) : -1;
    const model = this.state.model;
    const sdfProps = {
      buffer: DEFAULT_BUFFER2,
      outlineBuffer,
      gamma: smoothing,
      enabled: Boolean(sdf),
      outlineColor
    };
    const textProps = {
      contentCutoffPixels,
      contentAlignHorizontal,
      contentAlignVertical,
      fontSize,
      viewport: this.context.viewport
    };
    model.shaderInputs.setProps({ sdf: sdfProps, text: textProps });
    super.draw(params);
    if (sdf && outlineWidth) {
      const { iconManager } = this.state;
      const iconsTexture = iconManager.getTexture();
      if (iconsTexture) {
        model.shaderInputs.setProps({ sdf: { ...sdfProps, outlineBuffer: DEFAULT_BUFFER2 } });
        model.draw(this.context.renderPass);
      }
    }
  }
  calculateInstanceIconDefs(attribute, { startRow, endRow }) {
    const { data, getIcon, getIconOffsets } = this.props;
    let i = attribute.getVertexOffset(startRow);
    const output = attribute.value;
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const text = getIcon(object, objectInfo);
      const offsets = getIconOffsets(object, objectInfo);
      if (text) {
        let j = 0;
        for (const char of Array.from(text)) {
          const def = super.getInstanceIconDef(char);
          def[0] = offsets[j * 2];
          def[1] += offsets[j * 2 + 1];
          def[6] = 1;
          output.set(def, i);
          i += attribute.size;
          j++;
        }
      }
    }
  }
};
MultiIconLayer.defaultProps = defaultProps11;
MultiIconLayer.layerName = "MultiIconLayer";

// ../layers/src/text-layer/font-atlas-manager.ts
var import_tiny_sdf = __toESM(require("@mapbox/tiny-sdf"), 1);

// ../layers/src/text-layer/utils.ts
var MISSING_CHAR_WIDTH = 32;
var SINGLE_LINE = [];
function nextPowOfTwo2(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}
function buildMapping2({
  characterSet,
  measureText: measureText2,
  buffer,
  maxCanvasWidth,
  mapping = {},
  xOffset = 0,
  yOffsetMin = 0,
  yOffsetMax = 0
}) {
  const row = 0;
  let x = xOffset;
  let yMin = yOffsetMin;
  let yMax = yOffsetMax;
  for (const char of characterSet) {
    if (!mapping[char]) {
      const { advance, width, ascent, descent } = measureText2(char);
      const height = ascent + descent;
      if (x + width + buffer * 2 > maxCanvasWidth) {
        x = 0;
        yMin = yMax;
      }
      mapping[char] = {
        x: x + buffer,
        y: yMin + buffer,
        width,
        height,
        advance,
        anchorX: width / 2,
        anchorY: ascent
      };
      x += width + buffer * 2;
      yMax = Math.max(yMax, yMin + height + buffer * 2);
    }
  }
  return {
    mapping,
    xOffset: x,
    yOffsetMin: yMin,
    yOffsetMax: yMax,
    canvasHeight: nextPowOfTwo2(yMax)
  };
}
function getTextWidth(text, startIndex, endIndex, mapping) {
  var _a;
  let width = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const character = text[i];
    width += ((_a = mapping[character]) == null ? void 0 : _a.advance) || 0;
  }
  return width;
}
function breakAll(text, startIndex, endIndex, maxWidth, iconMapping, target) {
  let rowStartCharIndex = startIndex;
  let rowOffsetLeft = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const textWidth = getTextWidth(text, i, i + 1, iconMapping);
    if (rowOffsetLeft + textWidth > maxWidth) {
      if (rowStartCharIndex < i) {
        target.push(i);
      }
      rowStartCharIndex = i;
      rowOffsetLeft = 0;
    }
    rowOffsetLeft += textWidth;
  }
  return rowOffsetLeft;
}
function breakWord(text, startIndex, endIndex, maxWidth, iconMapping, target) {
  let rowStartCharIndex = startIndex;
  let groupStartCharIndex = startIndex;
  let groupEndCharIndex = startIndex;
  let rowOffsetLeft = 0;
  for (let i = startIndex; i < endIndex; i++) {
    if (text[i] === " ") {
      groupEndCharIndex = i + 1;
    } else if (text[i + 1] === " " || i + 1 === endIndex) {
      groupEndCharIndex = i + 1;
    }
    if (groupEndCharIndex > groupStartCharIndex) {
      let groupWidth = getTextWidth(text, groupStartCharIndex, groupEndCharIndex, iconMapping);
      if (rowOffsetLeft + groupWidth > maxWidth) {
        if (rowStartCharIndex < groupStartCharIndex) {
          target.push(groupStartCharIndex);
          rowStartCharIndex = groupStartCharIndex;
          rowOffsetLeft = 0;
        }
        if (groupWidth > maxWidth) {
          groupWidth = breakAll(
            text,
            groupStartCharIndex,
            groupEndCharIndex,
            maxWidth,
            iconMapping,
            target
          );
          rowStartCharIndex = target[target.length - 1];
        }
      }
      groupStartCharIndex = groupEndCharIndex;
      rowOffsetLeft += groupWidth;
    }
  }
  return rowOffsetLeft;
}
function autoWrapping(text, wordBreak, maxWidth, iconMapping, startIndex = 0, endIndex) {
  if (endIndex === void 0) {
    endIndex = text.length;
  }
  const result = [];
  if (wordBreak === "break-all") {
    breakAll(text, startIndex, endIndex, maxWidth, iconMapping, result);
  } else {
    breakWord(text, startIndex, endIndex, maxWidth, iconMapping, result);
  }
  return result;
}
function transformRow(line, startIndex, endIndex, iconMapping, leftOffsets, rowSize) {
  let x = 0;
  let rowHeight = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const character = line[i];
    const frame = iconMapping[character];
    if (frame) {
      rowHeight = Math.max(rowHeight, frame.height);
    }
  }
  for (let i = startIndex; i < endIndex; i++) {
    const character = line[i];
    const frame = iconMapping[character];
    if (frame) {
      leftOffsets[i] = x + frame.anchorX;
      x += frame.advance;
    } else {
      log_default.warn(`Missing character: ${character} (${character.codePointAt(0)})`)();
      leftOffsets[i] = x;
      x += MISSING_CHAR_WIDTH;
    }
  }
  rowSize[0] = x;
  rowSize[1] = rowHeight;
}
function transformParagraph(paragraph, baselineOffset, lineHeight, wordBreak, maxWidth, iconMapping) {
  const characters = Array.from(paragraph);
  const numCharacters = characters.length;
  const x = new Array(numCharacters);
  const y = new Array(numCharacters);
  const rowWidth = new Array(numCharacters);
  const autoWrappingEnabled = (wordBreak === "break-word" || wordBreak === "break-all") && isFinite(maxWidth) && maxWidth > 0;
  const size = [0, 0];
  const rowSize = [0, 0];
  let rowCount = 0;
  let rowOffsetTop = baselineOffset + lineHeight / 2;
  let lineStartIndex = 0;
  let lineEndIndex = 0;
  for (let i = 0; i <= numCharacters; i++) {
    const char = characters[i];
    if (char === "\n" || i === numCharacters) {
      lineEndIndex = i;
    }
    if (lineEndIndex > lineStartIndex) {
      const rows = autoWrappingEnabled ? autoWrapping(characters, wordBreak, maxWidth, iconMapping, lineStartIndex, lineEndIndex) : SINGLE_LINE;
      for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        const rowStart = rowIndex === 0 ? lineStartIndex : rows[rowIndex - 1];
        const rowEnd = rowIndex < rows.length ? rows[rowIndex] : lineEndIndex;
        transformRow(characters, rowStart, rowEnd, iconMapping, x, rowSize);
        for (let j = rowStart; j < rowEnd; j++) {
          y[j] = rowOffsetTop;
          rowWidth[j] = rowSize[0];
        }
        rowCount++;
        rowOffsetTop += lineHeight;
        size[0] = Math.max(size[0], rowSize[0]);
      }
      lineStartIndex = lineEndIndex;
    }
    if (char === "\n") {
      x[lineStartIndex] = 0;
      y[lineStartIndex] = 0;
      rowWidth[lineStartIndex] = 0;
      lineStartIndex++;
    }
  }
  size[1] = rowCount * lineHeight;
  return { x, y, rowWidth, size };
}
function getTextFromBuffer({
  value,
  length,
  stride,
  offset,
  startIndices,
  characterSet
}) {
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : 1;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const characterCount = startIndices[length] || Math.ceil((value.length - elementOffset) / elementStride);
  const autoCharacterSet = characterSet && /* @__PURE__ */ new Set();
  const texts = new Array(length);
  let codes = value;
  if (elementStride > 1 || elementOffset > 0) {
    const ArrayType = value.constructor;
    codes = new ArrayType(characterCount);
    for (let i = 0; i < characterCount; i++) {
      codes[i] = value[i * elementStride + elementOffset];
    }
  }
  for (let index = 0; index < length; index++) {
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || characterCount;
    const codesAtIndex = codes.subarray(startIndex, endIndex);
    texts[index] = String.fromCodePoint.apply(null, codesAtIndex);
    if (autoCharacterSet) {
      codesAtIndex.forEach(autoCharacterSet.add, autoCharacterSet);
    }
  }
  if (autoCharacterSet) {
    for (const charCode of autoCharacterSet) {
      characterSet.add(String.fromCodePoint(charCode));
    }
  }
  return { texts, characterCount };
}

// ../layers/src/text-layer/lru-cache.ts
var LRUCache = class {
  constructor(limit = 5) {
    this._cache = {};
    /** access/update order, first item is oldest, last item is newest */
    this._order = [];
    this.limit = limit;
  }
  get(key) {
    const value = this._cache[key];
    if (value) {
      this._deleteOrder(key);
      this._appendOrder(key);
    }
    return value;
  }
  set(key, value) {
    if (!this._cache[key]) {
      if (Object.keys(this._cache).length === this.limit) {
        this.delete(this._order[0]);
      }
      this._cache[key] = value;
      this._appendOrder(key);
    } else {
      this.delete(key);
      this._cache[key] = value;
      this._appendOrder(key);
    }
  }
  delete(key) {
    const value = this._cache[key];
    if (value) {
      delete this._cache[key];
      this._deleteOrder(key);
    }
  }
  _deleteOrder(key) {
    const index = this._order.indexOf(key);
    if (index >= 0) {
      this._order.splice(index, 1);
    }
  }
  _appendOrder(key) {
    this._order.push(key);
  }
};

// ../layers/src/text-layer/font-atlas-manager.ts
function getDefaultCharacterSet() {
  const charSet = [];
  for (let i = 32; i < 128; i++) {
    charSet.push(String.fromCharCode(i));
  }
  return charSet;
}
var DEFAULT_FONT_SETTINGS = {
  fontFamily: "Monaco, monospace",
  fontWeight: "normal",
  characterSet: getDefaultCharacterSet(),
  fontSize: 64,
  buffer: 4,
  sdf: false,
  cutoff: 0.25,
  radius: 12,
  smoothing: 0.1
};
var MAX_CANVAS_WIDTH = 1024;
var DEFAULT_ASCENT = 0.9;
var DEFAULT_DESCENT = 0.3;
var CACHE_LIMIT = 3;
var cache = new LRUCache(CACHE_LIMIT);
function getNewChars(cacheKey, characterSet) {
  let newCharSet;
  if (typeof characterSet === "string") {
    newCharSet = new Set(Array.from(characterSet));
  } else {
    newCharSet = new Set(characterSet);
  }
  const cachedFontAtlas = cache.get(cacheKey);
  if (!cachedFontAtlas) {
    return newCharSet;
  }
  for (const char in cachedFontAtlas.mapping) {
    if (newCharSet.has(char)) {
      newCharSet.delete(char);
    }
  }
  return newCharSet;
}
function populateAlphaChannel(alphaChannel, imageData) {
  for (let i = 0; i < alphaChannel.length; i++) {
    imageData.data[4 * i + 3] = alphaChannel[i];
  }
}
function setTextStyle(ctx, fontFamily, fontSize, fontWeight) {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
}
function measureText(ctx, fontSize, char) {
  if (char === void 0) {
    const fontMetrics = ctx.measureText("A");
    if (fontMetrics.fontBoundingBoxAscent) {
      return {
        advance: 0,
        width: 0,
        ascent: Math.ceil(fontMetrics.fontBoundingBoxAscent),
        descent: Math.ceil(fontMetrics.fontBoundingBoxDescent)
      };
    }
    return {
      advance: 0,
      width: 0,
      ascent: fontSize * DEFAULT_ASCENT,
      descent: fontSize * DEFAULT_DESCENT
    };
  }
  const metrics = ctx.measureText(char);
  if (!metrics.actualBoundingBoxAscent) {
    return {
      advance: metrics.width,
      width: metrics.width,
      ascent: fontSize * DEFAULT_ASCENT,
      descent: fontSize * DEFAULT_DESCENT
    };
  }
  return {
    advance: metrics.width,
    width: Math.ceil(metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft),
    ascent: Math.ceil(metrics.actualBoundingBoxAscent),
    descent: Math.ceil(metrics.actualBoundingBoxDescent)
  };
}
function setFontAtlasCacheLimit(limit) {
  log_default.assert(Number.isFinite(limit) && limit >= CACHE_LIMIT, "Invalid cache limit");
  cache = new LRUCache(limit);
}
var FontAtlasManager = class {
  constructor() {
    /** Font settings */
    this.props = { ...DEFAULT_FONT_SETTINGS };
  }
  get atlas() {
    return this._atlas;
  }
  // TODO - cut during v9 porting as types reveal this is not correct
  // get texture(): Texture | undefined {
  //   return this._atlas;
  // }
  get mapping() {
    return this._atlas && this._atlas.mapping;
  }
  setProps(props = {}) {
    Object.assign(this.props, props);
    if (props._getFontRenderer) {
      this._getFontRenderer = props._getFontRenderer;
    }
    this._key = this._getKey();
    const charSet = getNewChars(this._key, this.props.characterSet);
    const cachedFontAtlas = cache.get(this._key);
    if (cachedFontAtlas && charSet.size === 0) {
      if (this._atlas !== cachedFontAtlas) {
        this._atlas = cachedFontAtlas;
      }
      return;
    }
    const fontAtlas = this._generateFontAtlas(charSet, cachedFontAtlas);
    this._atlas = fontAtlas;
    cache.set(this._key, fontAtlas);
  }
  // eslint-disable-next-line max-statements
  _generateFontAtlas(characterSet, cachedFontAtlas) {
    const { fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff } = this.props;
    let canvas = cachedFontAtlas && cachedFontAtlas.data;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = MAX_CANVAS_WIDTH;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    setTextStyle(ctx, fontFamily, fontSize, fontWeight);
    const defaultMeasure = (char) => measureText(ctx, fontSize, char);
    let renderer;
    if (this._getFontRenderer) {
      renderer = this._getFontRenderer(this.props);
    } else if (sdf) {
      renderer = {
        measure: defaultMeasure,
        draw: getSdfFontRenderer(this.props)
      };
    }
    const { mapping, canvasHeight, xOffset, yOffsetMin, yOffsetMax } = buildMapping2({
      measureText: (char) => renderer ? renderer.measure(char) : defaultMeasure(char),
      buffer,
      characterSet,
      maxCanvasWidth: MAX_CANVAS_WIDTH,
      ...cachedFontAtlas && {
        mapping: cachedFontAtlas.mapping,
        xOffset: cachedFontAtlas.xOffset,
        yOffsetMin: cachedFontAtlas.yOffsetMin,
        yOffsetMax: cachedFontAtlas.yOffsetMax
      }
    });
    if (canvas.height !== canvasHeight) {
      const imageData = canvas.height > 0 ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.height = canvasHeight;
      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    }
    setTextStyle(ctx, fontFamily, fontSize, fontWeight);
    if (renderer) {
      for (const char of characterSet) {
        const frame = mapping[char];
        const measuredWidth = frame.width;
        const { data, left = 0, top = 0 } = renderer.draw(char);
        const x = frame.x - left;
        const y = frame.y - top;
        const x0 = Math.max(0, Math.round(x));
        const y0 = Math.max(0, Math.round(y));
        const w = Math.min(data.width, canvas.width - x0);
        const h = Math.min(data.height, canvas.height - y0);
        ctx.putImageData(data, x0, y0, 0, 0, w, h);
        frame.x = x0;
        frame.y = y0;
        frame.width = w;
        frame.height = h;
        frame.anchorX += w / 2 - left - measuredWidth / 2;
        frame.anchorY += top;
      }
    } else {
      for (const char of characterSet) {
        const frame = mapping[char];
        ctx.fillText(char, frame.x, frame.y + frame.anchorY);
      }
    }
    const fontMetrics = renderer ? renderer.measure() : defaultMeasure();
    return {
      baselineOffset: (fontMetrics.ascent - fontMetrics.descent) / 2,
      xOffset,
      yOffsetMin,
      yOffsetMax,
      mapping,
      data: canvas,
      width: canvas.width,
      height: canvas.height
    };
  }
  _getKey() {
    const { fontFamily, fontWeight, fontSize, buffer, sdf, radius, cutoff } = this.props;
    if (sdf) {
      return `${fontFamily} ${fontWeight} ${fontSize} ${buffer} ${radius} ${cutoff}`;
    }
    return `${fontFamily} ${fontWeight} ${fontSize} ${buffer}`;
  }
};
function getSdfFontRenderer({
  fontSize,
  buffer,
  radius,
  cutoff,
  fontFamily,
  fontWeight
}) {
  const tinySDF = new import_tiny_sdf.default({
    fontSize,
    buffer,
    radius,
    cutoff,
    fontFamily,
    fontWeight: `${fontWeight}`
  });
  return (char) => {
    const { data, width, height } = tinySDF.draw(char);
    const imageData = new ImageData(width, height);
    populateAlphaChannel(data, imageData);
    return { data: imageData, left: buffer, top: buffer };
  };
}

// ../layers/src/text-layer/text-background-layer/text-background-layer.ts
var import_engine14 = require("@luma.gl/engine");
var import_engine15 = require("@luma.gl/engine");

// ../layers/src/text-layer/text-background-layer/text-background-layer-uniforms.ts
var uniformBlockWGSL6 = (
  /* wgsl */
  `struct TextBackgroundUniforms {
  billboard: f32,
  sizeScale: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  borderRadius: vec4<f32>,
  padding: vec4<f32>,
  sizeUnits: i32,
  stroked: f32,
};

@group(0) @binding(auto) var<uniform> textBackground: TextBackgroundUniforms;
`
);
var uniformBlock8 = `layout(std140) uniform textBackgroundUniforms {
  bool billboard;
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  vec4 borderRadius;
  vec4 padding;
  highp int sizeUnits;
  bool stroked;
} textBackground;
`;
var textBackgroundUniforms = {
  name: "textBackground",
  source: uniformBlockWGSL6,
  vs: uniformBlock8,
  fs: uniformBlock8,
  uniformTypes: {
    billboard: "f32",
    sizeScale: "f32",
    sizeMinPixels: "f32",
    sizeMaxPixels: "f32",
    borderRadius: "vec4<f32>",
    padding: "vec4<f32>",
    sizeUnits: "i32",
    stroked: "f32"
  }
};

// ../layers/src/text-layer/text-background-layer/text-background-layer-vertex.glsl.ts
var text_background_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in vec4 instanceClipRect;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;

out vec4 vFillColor;
out vec4 vLineColor;
out float vLineWidth;
out vec2 uv;
out vec2 dimensions;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = radians(angle);
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();
  uv = positions;
  vLineWidth = instanceLineWidths;

  // convert size in meters to pixels, then scaled and clamp

  // project meters to pixels and clamp to limits
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
    textBackground.sizeMinPixels, textBackground.sizeMaxPixels
  );
  float instanceScale = sizePixels / text.fontSize;

  dimensions = instanceRects.zw * instanceScale + textBackground.padding.xy + textBackground.padding.zw;

  vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * instanceScale + mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
  pixelOffset += instancePixelOffsets;
  pixelOffset.y *= -1.0;

  // apply clipping
  vec2 xy = project_size_to_pixel(instanceClipRect.xy);
  vec2 wh = project_size_to_pixel(instanceClipRect.zw);
  if (text.flipY) {
    xy.y = -xy.y - wh.y;
  }
  if (instanceClipRect.z >= 0.0) {
    dimensions.x = wh.x;
    pixelOffset.x = xy.x + uv.x * wh.x + mix(-textBackground.padding.x, textBackground.padding.z, uv.x);
  }
  if (instanceClipRect.w >= 0.0) {
    dimensions.y = wh.y;
    pixelOffset.y = xy.y + uv.y * wh.y + mix(-textBackground.padding.y, textBackground.padding.w, uv.y);
  }

  if (textBackground.billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    if (text.flipY) {
      offset_common.y *= -1.;
    }
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`
);

// ../layers/src/text-layer/text-background-layer/text-background-layer-fragment.glsl.ts
var text_background_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader

precision highp float;

in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;

out vec4 fragColor;

float round_rect(vec2 p, vec2 size, vec4 radii) {
  // Convert p and size to center-based coordinates [-0.5, 0.5]
  vec2 pixelPositionCB = (p - 0.5) * size;
  vec2 sizeCB = size * 0.5;

  float maxBorderRadius = min(size.x, size.y) * 0.5;
  vec4 borderRadius = vec4(min(radii, maxBorderRadius));

  // from https://www.shadertoy.com/view/4llXD7
  borderRadius.xy =
      (pixelPositionCB.x > 0.0) ? borderRadius.xy : borderRadius.zw;
  borderRadius.x = (pixelPositionCB.y > 0.0) ? borderRadius.x : borderRadius.y;
  vec2 q = abs(pixelPositionCB) - sizeCB + borderRadius.x;
  return -(min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - borderRadius.x);
}

float rect(vec2 p, vec2 size) {
  vec2 pixelPosition = p * size;
  return min(min(pixelPosition.x, size.x - pixelPosition.x),
             min(pixelPosition.y, size.y - pixelPosition.y));
}

vec4 get_stroked_fragColor(float dist) {
  float isBorder = smoothedge(dist, vLineWidth);
  return mix(vFillColor, vLineColor, isBorder);
}

void main(void) {
  geometry.uv = uv;

  if (textBackground.borderRadius != vec4(0.0)) {
    float distToEdge = round_rect(uv, dimensions, textBackground.borderRadius);
    float shapeAlpha = smoothedge(-distToEdge, 0.0);
    if (shapeAlpha == 0.0) {
      discard;
    }
    if (textBackground.stroked) {
      fragColor = get_stroked_fragColor(distToEdge);
    } else {
      fragColor = vFillColor;
    }
    fragColor.a *= shapeAlpha;
  } else {
    if (textBackground.stroked) {
      float distToEdge = rect(uv, dimensions);
      fragColor = get_stroked_fragColor(distToEdge);
    } else {
      fragColor = vFillColor;
    }
  }
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../layers/src/text-layer/text-background-layer/text-background-layer.wgsl.ts
var text_background_layer_wgsl_default = (
  /* wgsl */
  `struct TextUniforms {
  cutoffPixels: vec2<f32>,
  align: vec2<i32>,
  fontSize: f32,
  flipY: f32,
};

@group(0) @binding(auto) var<uniform> text: TextUniforms;

fn rotate_by_angle(vertex: vec2<f32>, angle: f32) -> vec2<f32> {
  let angleRadian = radians(angle);
  let cosine = cos(angleRadian);
  let sine = sin(angleRadian);
  let rotationMatrix = mat2x2<f32>(
    vec2<f32>(cosine, -sine),
    vec2<f32>(sine, cosine)
  );
  return rotationMatrix * vertex;
}

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec2<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceSizes: f32,
  @location(4) instanceAngles: f32,
  @location(5) instanceRects: vec4<f32>,
  @location(6) instanceClipRect: vec4<f32>,
  @location(7) instancePixelOffsets: vec2<f32>,
  @location(8) instanceFillColors: vec4<f32>,
  @location(9) instanceLineColors: vec4<f32>,
  @location(10) instanceLineWidths: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) vLineWidth: f32,
  @location(3) uv: vec2<f32>,
  @location(4) dimensions: vec2<f32>,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  geometry.worldPosition = attributes.instancePositions;
  geometry.uv = attributes.positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  var varyings: Varyings;
  varyings.uv = attributes.positions;
  varyings.vLineWidth = attributes.instanceLineWidths;

  let sizePixels = clamp(
    project_unit_size_to_pixel(
      attributes.instanceSizes * textBackground.sizeScale,
      textBackground.sizeUnits
    ),
    textBackground.sizeMinPixels,
    textBackground.sizeMaxPixels
  );
  let instanceScale = sizePixels / text.fontSize;

  varyings.dimensions = attributes.instanceRects.zw * instanceScale +
    textBackground.padding.xy + textBackground.padding.zw;

  var pixelOffset =
    (attributes.positions * attributes.instanceRects.zw + attributes.instanceRects.xy) *
      instanceScale +
    mix(-textBackground.padding.xy, textBackground.padding.zw, attributes.positions);
  pixelOffset = rotate_by_angle(pixelOffset, attributes.instanceAngles);
  pixelOffset = pixelOffset + attributes.instancePixelOffsets;
  pixelOffset.y = pixelOffset.y * -1.0;

  var xy = project_size_vec2(attributes.instanceClipRect.xy) * project.scale;
  let wh = project_size_vec2(attributes.instanceClipRect.zw) * project.scale;
  if (text.flipY > 0.5) {
    xy.y = -xy.y - wh.y;
  }
  if (attributes.instanceClipRect.z >= 0.0) {
    varyings.dimensions.x = wh.x;
    pixelOffset.x = xy.x + varyings.uv.x * wh.x + mix(
      -textBackground.padding.x,
      textBackground.padding.z,
      varyings.uv.x
    );
  }
  if (attributes.instanceClipRect.w >= 0.0) {
    varyings.dimensions.y = wh.y;
    pixelOffset.y = xy.y + varyings.uv.y * wh.y + mix(
      -textBackground.padding.y,
      textBackground.padding.w,
      varyings.uv.y
    );
  }

  if (textBackground.billboard > 0.5) {
    var position = project_position_to_clipspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    let clipOffset = project_pixel_size_to_clipspace(pixelOffset);
    position = vec4<f32>(
      position.x + clipOffset.x,
      position.y + clipOffset.y,
      position.z,
      position.w
    );
    varyings.position = position;
  } else {
    var offsetCommon = vec3<f32>(project_pixel_size_vec2(pixelOffset), 0.0);
    if (text.flipY > 0.5) {
      offsetCommon.y = offsetCommon.y * -1.0;
    }
    varyings.position = project_position_to_clipspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      offsetCommon
    );
  }

  varyings.vFillColor = vec4<f32>(
    attributes.instanceFillColors.rgb,
    attributes.instanceFillColors.a * layer.opacity
  );
  varyings.vLineColor = vec4<f32>(
    attributes.instanceLineColors.rgb,
    attributes.instanceLineColors.a * layer.opacity
  );
  varyings.pickingColor = geometry.pickingColor;
  return varyings;
}

fn round_rect(point: vec2<f32>, size: vec2<f32>, radii: vec4<f32>) -> f32 {
  let pixelPosition = (point - 0.5) * size;
  let halfSize = size * 0.5;
  let maxBorderRadius = min(size.x, size.y) * 0.5;
  var borderRadius = min(radii, vec4<f32>(maxBorderRadius));

  borderRadius = select(borderRadius.zwxy, borderRadius, pixelPosition.x > 0.0);
  let radius = select(borderRadius.y, borderRadius.x, pixelPosition.y > 0.0);
  let q = abs(pixelPosition) - halfSize + radius;
  return -(min(max(q.x, q.y), 0.0) + length(max(q, vec2<f32>(0.0))) - radius);
}

fn rect(point: vec2<f32>, size: vec2<f32>) -> f32 {
  let pixelPosition = point * size;
  return min(
    min(pixelPosition.x, size.x - pixelPosition.x),
    min(pixelPosition.y, size.y - pixelPosition.y)
  );
}

fn get_stroked_frag_color(
  distanceToEdge: f32,
  lineWidth: f32,
  fillColor: vec4<f32>,
  lineColor: vec4<f32>
) -> vec4<f32> {
  let isBorder = smoothedge(distanceToEdge, lineWidth);
  return mix(fillColor, lineColor, isBorder);
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.uv;
  var fragColor: vec4<f32>;

  if (any(textBackground.borderRadius != vec4<f32>(0.0))) {
    let distanceToEdge = round_rect(
      varyings.uv,
      varyings.dimensions,
      textBackground.borderRadius
    );
    let shapeAlpha = smoothedge(-distanceToEdge, 0.0);
    if (shapeAlpha == 0.0) {
      discard;
    }
    if (textBackground.stroked > 0.5) {
      fragColor = get_stroked_frag_color(
        distanceToEdge,
        varyings.vLineWidth,
        varyings.vFillColor,
        varyings.vLineColor
      );
    } else {
      fragColor = varyings.vFillColor;
    }
    fragColor.a = fragColor.a * shapeAlpha;
  } else if (textBackground.stroked > 0.5) {
    let distanceToEdge = rect(varyings.uv, varyings.dimensions);
    fragColor = get_stroked_frag_color(
      distanceToEdge,
      varyings.vLineWidth,
      varyings.vFillColor,
      varyings.vLineColor
    );
  } else {
    fragColor = varyings.vFillColor;
  }

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + fragColor.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`
);

// ../layers/src/text-layer/text-background-layer/text-background-layer.ts
var defaultProps12 = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: "pixels",
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,
  fontSize: 1,
  borderRadius: { type: "object", value: 0 },
  padding: { type: "array", value: [0, 0, 0, 0] },
  getPosition: { type: "accessor", value: (x) => x.position },
  getSize: { type: "accessor", value: 1 },
  getAngle: { type: "accessor", value: 0 },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  getBoundingRect: { type: "accessor", value: [0, 0, 0, 0] },
  getClipRect: { type: "accessor", value: [0, 0, -1, -1] },
  getFillColor: { type: "accessor", value: [0, 0, 0, 255] },
  getLineColor: { type: "accessor", value: [0, 0, 0, 255] },
  getLineWidth: { type: "accessor", value: 1 }
};
var TextBackgroundLayer = class extends Layer {
  getShaders() {
    return super.getShaders({
      vs: text_background_layer_vertex_glsl_default,
      fs: text_background_layer_fragment_glsl_default,
      source: text_background_layer_wgsl_default,
      modules: [project32_default, color_default, picking_default, textBackgroundUniforms, textUniforms]
    });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: "getPosition"
      },
      // Interleave six inputs to stay below WebGPU's portable vertex-buffer and storage-buffer limits.
      instanceSizes: {
        size: 1,
        transition: true,
        bufferGroup: "text-background-instance-data",
        accessor: "getSize",
        defaultValue: 1
      },
      instanceAngles: {
        size: 1,
        transition: true,
        bufferGroup: "text-background-instance-data",
        accessor: "getAngle"
      },
      instanceRects: {
        size: 4,
        bufferGroup: "text-background-instance-data",
        accessor: "getBoundingRect"
      },
      instanceClipRect: {
        size: 4,
        bufferGroup: "text-background-instance-data",
        accessor: "getClipRect",
        defaultValue: [0, 0, -1, -1]
      },
      instancePixelOffsets: {
        size: 2,
        transition: true,
        bufferGroup: "text-background-instance-data",
        accessor: "getPixelOffset"
      },
      instanceFillColors: {
        size: 4,
        transition: true,
        type: "unorm8",
        accessor: "getFillColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineColors: {
        size: 4,
        transition: true,
        type: "unorm8",
        accessor: "getLineColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        bufferGroup: "text-background-instance-data",
        accessor: "getLineWidth",
        defaultValue: 1
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { changeFlags } = params;
    if (changeFlags.extensionsChanged) {
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      this.state.model = this._getModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  draw({ uniforms }) {
    const { billboard, sizeScale, sizeUnits, sizeMinPixels, sizeMaxPixels, getLineWidth, fontSize } = this.props;
    let { padding, borderRadius } = this.props;
    if (padding.length < 4) {
      padding = [padding[0], padding[1], padding[0], padding[1]];
    }
    if (!Array.isArray(borderRadius)) {
      borderRadius = [
        borderRadius,
        borderRadius,
        borderRadius,
        borderRadius
      ];
    }
    const model = this.state.model;
    const textBackgroundProps = {
      billboard,
      stroked: Boolean(getLineWidth),
      borderRadius,
      padding,
      sizeUnits: UNIT[sizeUnits],
      sizeScale,
      sizeMinPixels,
      sizeMaxPixels
    };
    const textProps = {
      fontSize,
      viewport: this.context.viewport
    };
    model.shaderInputs.setProps({ textBackground: textBackgroundProps, text: textProps });
    model.draw(this.context.renderPass);
  }
  _getModel() {
    const positions = [0, 0, 1, 0, 0, 1, 1, 1];
    return new import_engine15.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine14.Geometry({
        topology: "triangle-strip",
        vertexCount: 4,
        attributes: {
          positions: { size: 2, value: new Float32Array(positions) }
        }
      }),
      isInstanced: true
    });
  }
};
TextBackgroundLayer.defaultProps = defaultProps12;
TextBackgroundLayer.layerName = "TextBackgroundLayer";

// ../layers/src/text-layer/text-layer.ts
var TEXT_ANCHOR = {
  start: 1,
  middle: 0,
  end: -1
};
var ALIGNMENT_BASELINE = {
  top: 1,
  center: 0,
  bottom: -1
};
var DEFAULT_COLOR8 = [0, 0, 0, 255];
var DEFAULT_LINE_HEIGHT = 1;
var defaultProps13 = {
  billboard: true,
  sizeScale: 1,
  sizeUnits: "pixels",
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,
  background: false,
  getBackgroundColor: { type: "accessor", value: [255, 255, 255, 255] },
  getBorderColor: { type: "accessor", value: DEFAULT_COLOR8 },
  getBorderWidth: { type: "accessor", value: 0 },
  backgroundBorderRadius: { type: "object", value: 0 },
  backgroundPadding: { type: "array", value: [0, 0, 0, 0] },
  characterSet: { type: "object", value: DEFAULT_FONT_SETTINGS.characterSet },
  fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
  fontWeight: DEFAULT_FONT_SETTINGS.fontWeight,
  lineHeight: DEFAULT_LINE_HEIGHT,
  outlineWidth: { type: "number", value: 0, min: 0 },
  outlineColor: { type: "color", value: DEFAULT_COLOR8 },
  fontSettings: { type: "object", value: {}, compare: 1 },
  // auto wrapping options
  wordBreak: "break-word",
  maxWidth: { type: "number", value: -1 },
  contentCutoffPixels: { type: "array", value: [0, 0] },
  contentAlignHorizontal: "none",
  contentAlignVertical: "none",
  getText: { type: "accessor", value: (x) => x.text },
  getPosition: { type: "accessor", value: (x) => x.position },
  getColor: { type: "accessor", value: DEFAULT_COLOR8 },
  getSize: { type: "accessor", value: 32 },
  getAngle: { type: "accessor", value: 0 },
  getTextAnchor: { type: "accessor", value: "middle" },
  getAlignmentBaseline: { type: "accessor", value: "center" },
  getPixelOffset: { type: "accessor", value: [0, 0] },
  getContentBox: { type: "accessor", value: [0, 0, -1, -1] },
  // deprecated
  backgroundColor: { deprecatedFor: ["background", "getBackgroundColor"] }
};
var TextLayer = class extends CompositeLayer {
  constructor() {
    super(...arguments);
    /** Returns the x, y, width, height of each text string, relative to pixel size.
     * Used to render the background.
     */
    this.getBoundingRect = (object, objectInfo) => {
      const {
        size: [width, height]
      } = this.transformParagraph(object, objectInfo);
      const { getTextAnchor, getAlignmentBaseline } = this.props;
      const anchorX = TEXT_ANCHOR[typeof getTextAnchor === "function" ? getTextAnchor(object, objectInfo) : getTextAnchor];
      const anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === "function" ? getAlignmentBaseline(object, objectInfo) : getAlignmentBaseline];
      return [(anchorX - 1) * width / 2, (anchorY - 1) * height / 2, width, height];
    };
    /** Returns the x, y offsets of each character in a text string, in texture size.
     * Used to layout characters in the vertex shader.
     */
    this.getIconOffsets = (object, objectInfo) => {
      const { getTextAnchor, getAlignmentBaseline } = this.props;
      const {
        x,
        y,
        rowWidth,
        size: [, height]
      } = this.transformParagraph(object, objectInfo);
      const anchorX = TEXT_ANCHOR[typeof getTextAnchor === "function" ? getTextAnchor(object, objectInfo) : getTextAnchor];
      const anchorY = ALIGNMENT_BASELINE[typeof getAlignmentBaseline === "function" ? getAlignmentBaseline(object, objectInfo) : getAlignmentBaseline];
      const numCharacters = x.length;
      const offsets = new Array(numCharacters * 2);
      let index = 0;
      for (let i = 0; i < numCharacters; i++) {
        offsets[index++] = (anchorX - 1) * rowWidth[i] / 2 + x[i];
        offsets[index++] = (anchorY - 1) * height / 2 + y[i];
      }
      return offsets;
    };
  }
  initializeState() {
    this.state = {
      styleVersion: 0,
      fontAtlasManager: new FontAtlasManager()
    };
    if (this.props.maxWidth > 0) {
      log_default.once(1, "v8.9 breaking change: TextLayer maxWidth is now relative to text size")();
    }
  }
  // eslint-disable-next-line complexity
  updateState(params) {
    const { props, oldProps, changeFlags } = params;
    const textChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getText);
    if (textChanged) {
      this._updateText();
    }
    const fontChanged = this._updateFontAtlas();
    const styleChanged = fontChanged || props.lineHeight !== oldProps.lineHeight || props.wordBreak !== oldProps.wordBreak || props.maxWidth !== oldProps.maxWidth;
    if (styleChanged) {
      this.setState({
        styleVersion: this.state.styleVersion + 1
      });
    }
  }
  getPickingInfo({ info }) {
    info.object = info.index >= 0 ? this.props.data[info.index] : null;
    return info;
  }
  /** Returns true if font has changed */
  _updateFontAtlas() {
    const { fontSettings, fontFamily, fontWeight, _getFontRenderer } = this.props;
    const { fontAtlasManager, characterSet } = this.state;
    const fontProps = {
      ...fontSettings,
      characterSet,
      fontFamily,
      fontWeight,
      _getFontRenderer
    };
    if (!fontAtlasManager.mapping) {
      fontAtlasManager.setProps(fontProps);
      return true;
    }
    for (const key in fontProps) {
      if (fontProps[key] !== fontAtlasManager.props[key]) {
        fontAtlasManager.setProps(fontProps);
        return true;
      }
    }
    return false;
  }
  // Text strings are variable width objects
  // Count characters and start offsets
  _updateText() {
    var _a;
    const { data, characterSet } = this.props;
    const textBuffer = (_a = data.attributes) == null ? void 0 : _a.getText;
    let { getText } = this.props;
    let startIndices = data.startIndices;
    let numInstances;
    const autoCharacterSet = characterSet === "auto" && /* @__PURE__ */ new Set();
    if (textBuffer && startIndices) {
      const { texts, characterCount } = getTextFromBuffer({
        ...ArrayBuffer.isView(textBuffer) ? { value: textBuffer } : textBuffer,
        // @ts-ignore if data.attribute is defined then length is expected
        length: data.length,
        startIndices,
        characterSet: autoCharacterSet
      });
      numInstances = characterCount;
      getText = (_, { index }) => texts[index];
    } else {
      const { iterable, objectInfo } = createIterable(data);
      startIndices = [0];
      numInstances = 0;
      for (const object of iterable) {
        objectInfo.index++;
        const text = Array.from(getText(object, objectInfo) || "");
        if (autoCharacterSet) {
          text.forEach(autoCharacterSet.add, autoCharacterSet);
        }
        numInstances += text.length;
        startIndices.push(numInstances);
      }
    }
    this.setState({
      getText,
      startIndices,
      numInstances,
      characterSet: autoCharacterSet || characterSet
    });
  }
  /** There are two size systems in this layer:
  
      + Pixel size: user-specified text size, via getSize, sizeScale, sizeUnits etc.
        The layer roughly matches the output of the layer to CSS pixels, e.g. getSize: 12, sizeScale: 2
        in layer props is roughly equivalent to font-size: 24px in CSS.
      + Texture size: internally, character positions in a text blob are calculated using the sizes of iconMapping,
        which depends on how large each character is drawn into the font atlas. This is controlled by
        fontSettings.fontSize (default 64) and most users do not set it manually.
        These numbers are intended to be used in the vertex shader and never to be exposed to the end user.
  
      All surfaces exposed to the user should either use the pixel size or a multiplier relative to the pixel size. */
  /** Calculate the size and position of each character in a text string.
   * Values are in texture size */
  transformParagraph(object, objectInfo) {
    const { fontAtlasManager } = this.state;
    const iconMapping = fontAtlasManager.mapping;
    const { baselineOffset } = fontAtlasManager.atlas;
    const { fontSize } = fontAtlasManager.props;
    const getText = this.state.getText;
    const { wordBreak, lineHeight, maxWidth } = this.props;
    const paragraph = getText(object, objectInfo) || "";
    return transformParagraph(
      paragraph,
      baselineOffset,
      lineHeight * fontSize,
      wordBreak,
      maxWidth * fontSize,
      iconMapping
    );
  }
  renderLayers() {
    const {
      startIndices,
      numInstances,
      getText,
      fontAtlasManager: { atlas, mapping },
      styleVersion
    } = this.state;
    const {
      data,
      _dataDiff,
      getPosition,
      getColor,
      getSize,
      getAngle,
      getPixelOffset,
      getBackgroundColor,
      getBorderColor,
      getBorderWidth,
      getContentBox,
      backgroundBorderRadius,
      backgroundPadding,
      background,
      billboard,
      fontSettings,
      outlineWidth,
      outlineColor,
      sizeScale,
      sizeUnits,
      sizeMinPixels,
      sizeMaxPixels,
      contentCutoffPixels,
      contentAlignHorizontal,
      contentAlignVertical,
      transitions,
      updateTriggers
    } = this.props;
    const CharactersLayerClass = this.getSubLayerClass("characters", MultiIconLayer);
    const BackgroundLayerClass = this.getSubLayerClass("background", TextBackgroundLayer);
    const { fontSize } = this.state.fontAtlasManager.props;
    return [
      background && new BackgroundLayerClass(
        {
          // background props
          getFillColor: getBackgroundColor,
          getLineColor: getBorderColor,
          getLineWidth: getBorderWidth,
          borderRadius: backgroundBorderRadius,
          padding: backgroundPadding,
          // props shared with characters layer
          getPosition,
          getSize,
          getAngle,
          getPixelOffset,
          getClipRect: getContentBox,
          billboard,
          sizeScale,
          sizeUnits,
          sizeMinPixels,
          sizeMaxPixels,
          fontSize,
          transitions: transitions && {
            getPosition: transitions.getPosition,
            getAngle: transitions.getAngle,
            getSize: transitions.getSize,
            getFillColor: transitions.getBackgroundColor,
            getLineColor: transitions.getBorderColor,
            getLineWidth: transitions.getBorderWidth,
            getPixelOffset: transitions.getPixelOffset
          }
        },
        this.getSubLayerProps({
          id: "background",
          updateTriggers: {
            getPosition: updateTriggers.getPosition,
            getAngle: updateTriggers.getAngle,
            getSize: updateTriggers.getSize,
            getFillColor: updateTriggers.getBackgroundColor,
            getLineColor: updateTriggers.getBorderColor,
            getLineWidth: updateTriggers.getBorderWidth,
            getPixelOffset: updateTriggers.getPixelOffset,
            getBoundingRect: {
              getText: updateTriggers.getText,
              getTextAnchor: updateTriggers.getTextAnchor,
              getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
              styleVersion
            }
          }
        }),
        {
          data: (
            // @ts-ignore (2339) attribute is not defined on all data types
            data.attributes && data.attributes.background ? (
              // @ts-ignore (2339) attribute is not defined on all data types
              { length: data.length, attributes: data.attributes.background }
            ) : data
          ),
          _dataDiff,
          // Maintain the same background behavior as <=8.3. Remove in v9?
          autoHighlight: false,
          getBoundingRect: this.getBoundingRect
        }
      ),
      new CharactersLayerClass(
        {
          sdf: fontSettings.sdf,
          smoothing: Number.isFinite(fontSettings.smoothing) ? fontSettings.smoothing : DEFAULT_FONT_SETTINGS.smoothing,
          outlineWidth: outlineWidth / (fontSettings.radius || DEFAULT_FONT_SETTINGS.radius),
          outlineColor,
          iconAtlas: atlas,
          iconMapping: mapping,
          getPosition,
          getColor,
          getSize,
          getAngle,
          getPixelOffset,
          getContentBox,
          billboard,
          sizeScale,
          sizeUnits,
          sizeMinPixels,
          sizeMaxPixels,
          fontSize,
          contentCutoffPixels,
          contentAlignHorizontal,
          contentAlignVertical,
          transitions: transitions && {
            getPosition: transitions.getPosition,
            getAngle: transitions.getAngle,
            getColor: transitions.getColor,
            getSize: transitions.getSize,
            getPixelOffset: transitions.getPixelOffset,
            getContentBox: transitions.getContentBox
          }
        },
        this.getSubLayerProps({
          id: "characters",
          updateTriggers: {
            all: updateTriggers.getText,
            getPosition: updateTriggers.getPosition,
            getAngle: updateTriggers.getAngle,
            getColor: updateTriggers.getColor,
            getSize: updateTriggers.getSize,
            getPixelOffset: updateTriggers.getPixelOffset,
            getContentBox: updateTriggers.getContentBox,
            getIconOffsets: {
              getTextAnchor: updateTriggers.getTextAnchor,
              getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
              styleVersion
            }
          }
        }),
        {
          data,
          _dataDiff,
          startIndices,
          numInstances,
          getIconOffsets: this.getIconOffsets,
          getIcon: getText
        }
      )
    ];
  }
  static set fontAtlasCacheLimit(limit) {
    setFontAtlasCacheLimit(limit);
  }
};
TextLayer.defaultProps = defaultProps13;
TextLayer.layerName = "TextLayer";

// ../layers/src/geojson-layer/sub-layer-map.ts
var POINT_LAYER = {
  circle: {
    type: ScatterplotLayer,
    props: {
      filled: "filled",
      stroked: "stroked",
      lineWidthMaxPixels: "lineWidthMaxPixels",
      lineWidthMinPixels: "lineWidthMinPixels",
      lineWidthScale: "lineWidthScale",
      lineWidthUnits: "lineWidthUnits",
      pointRadiusMaxPixels: "radiusMaxPixels",
      pointRadiusMinPixels: "radiusMinPixels",
      pointRadiusScale: "radiusScale",
      pointRadiusUnits: "radiusUnits",
      pointAntialiasing: "antialiasing",
      pointBillboard: "billboard",
      getFillColor: "getFillColor",
      getLineColor: "getLineColor",
      getLineWidth: "getLineWidth",
      getPointRadius: "getRadius"
    }
  },
  icon: {
    type: IconLayer,
    props: {
      iconAtlas: "iconAtlas",
      iconMapping: "iconMapping",
      iconSizeMaxPixels: "sizeMaxPixels",
      iconSizeMinPixels: "sizeMinPixels",
      iconSizeScale: "sizeScale",
      iconSizeUnits: "sizeUnits",
      iconAlphaCutoff: "alphaCutoff",
      iconBillboard: "billboard",
      getIcon: "getIcon",
      getIconAngle: "getAngle",
      getIconColor: "getColor",
      getIconPixelOffset: "getPixelOffset",
      getIconSize: "getSize"
    }
  },
  text: {
    type: TextLayer,
    props: {
      textSizeMaxPixels: "sizeMaxPixels",
      textSizeMinPixels: "sizeMinPixels",
      textSizeScale: "sizeScale",
      textSizeUnits: "sizeUnits",
      textBackground: "background",
      textBackgroundPadding: "backgroundPadding",
      textFontFamily: "fontFamily",
      textFontWeight: "fontWeight",
      textLineHeight: "lineHeight",
      textMaxWidth: "maxWidth",
      textOutlineColor: "outlineColor",
      textOutlineWidth: "outlineWidth",
      textWordBreak: "wordBreak",
      textCharacterSet: "characterSet",
      textBillboard: "billboard",
      textFontSettings: "fontSettings",
      getText: "getText",
      getTextAngle: "getAngle",
      getTextColor: "getColor",
      getTextPixelOffset: "getPixelOffset",
      getTextSize: "getSize",
      getTextAnchor: "getTextAnchor",
      getTextAlignmentBaseline: "getAlignmentBaseline",
      getTextBackgroundColor: "getBackgroundColor",
      getTextBorderColor: "getBorderColor",
      getTextBorderWidth: "getBorderWidth"
    }
  }
};
var LINE_LAYER = {
  type: PathLayer,
  props: {
    lineWidthUnits: "widthUnits",
    lineWidthScale: "widthScale",
    lineWidthMinPixels: "widthMinPixels",
    lineWidthMaxPixels: "widthMaxPixels",
    lineJointRounded: "jointRounded",
    lineCapRounded: "capRounded",
    lineMiterLimit: "miterLimit",
    lineBillboard: "billboard",
    lineAntialiasing: "antialiasing",
    getLineColor: "getColor",
    getLineWidth: "getWidth"
  }
};
var POLYGON_LAYER = {
  type: SolidPolygonLayer,
  props: {
    extruded: "extruded",
    filled: "filled",
    wireframe: "wireframe",
    elevationScale: "elevationScale",
    material: "material",
    _full3d: "_full3d",
    getElevation: "getElevation",
    getFillColor: "getFillColor",
    getLineColor: "getLineColor"
  }
};
function getDefaultProps({
  type,
  props
}) {
  const result = {};
  for (const key in props) {
    result[key] = type.defaultProps[props[key]];
  }
  return result;
}
function forwardProps(layer, mapping) {
  const { transitions, updateTriggers } = layer.props;
  const result = {
    updateTriggers: {},
    transitions: transitions && {
      getPosition: transitions.geometry
    }
  };
  for (const sourceKey in mapping) {
    const targetKey = mapping[sourceKey];
    let value = layer.props[sourceKey];
    if (sourceKey.startsWith("get")) {
      value = layer.getSubLayerAccessor(value);
      result.updateTriggers[targetKey] = updateTriggers[sourceKey];
      if (transitions) {
        result.transitions[targetKey] = transitions[sourceKey];
      }
    }
    result[targetKey] = value;
  }
  return result;
}

// ../layers/src/geojson-layer/geojson.ts
function getGeojsonFeatures(geojson) {
  if (Array.isArray(geojson)) {
    return geojson;
  }
  log_default.assert(geojson.type, "GeoJSON does not have type");
  switch (geojson.type) {
    case "Feature":
      return [geojson];
    case "FeatureCollection":
      log_default.assert(Array.isArray(geojson.features), "GeoJSON does not have features array");
      return geojson.features;
    default:
      return [{ geometry: geojson }];
  }
}
function separateGeojsonFeatures(features, wrapFeature, dataRange = {}) {
  const separated = {
    pointFeatures: [],
    lineFeatures: [],
    polygonFeatures: [],
    polygonOutlineFeatures: []
  };
  const { startRow = 0, endRow = features.length } = dataRange;
  for (let featureIndex = startRow; featureIndex < endRow; featureIndex++) {
    const feature = features[featureIndex];
    const { geometry } = feature;
    if (!geometry) {
      continue;
    }
    if (geometry.type === "GeometryCollection") {
      log_default.assert(Array.isArray(geometry.geometries), "GeoJSON does not have geometries array");
      const { geometries } = geometry;
      for (let i = 0; i < geometries.length; i++) {
        const subGeometry = geometries[i];
        separateGeometry(
          subGeometry,
          separated,
          wrapFeature,
          feature,
          featureIndex
        );
      }
    } else {
      separateGeometry(geometry, separated, wrapFeature, feature, featureIndex);
    }
  }
  return separated;
}
function separateGeometry(geometry, separated, wrapFeature, sourceFeature, sourceFeatureIndex) {
  const { type, coordinates } = geometry;
  const { pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures } = separated;
  if (!validateGeometry(type, coordinates)) {
    log_default.warn(`${type} coordinates are malformed`)();
    return;
  }
  switch (type) {
    case "Point":
      pointFeatures.push(
        wrapFeature(
          {
            geometry
          },
          sourceFeature,
          sourceFeatureIndex
        )
      );
      break;
    case "MultiPoint":
      coordinates.forEach((point) => {
        pointFeatures.push(
          wrapFeature(
            {
              geometry: { type: "Point", coordinates: point }
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
      });
      break;
    case "LineString":
      lineFeatures.push(
        wrapFeature(
          {
            geometry
          },
          sourceFeature,
          sourceFeatureIndex
        )
      );
      break;
    case "MultiLineString":
      coordinates.forEach((path) => {
        lineFeatures.push(
          wrapFeature(
            {
              geometry: { type: "LineString", coordinates: path }
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
      });
      break;
    case "Polygon":
      polygonFeatures.push(
        wrapFeature(
          {
            geometry
          },
          sourceFeature,
          sourceFeatureIndex
        )
      );
      coordinates.forEach((path) => {
        polygonOutlineFeatures.push(
          wrapFeature(
            {
              geometry: { type: "LineString", coordinates: path }
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
      });
      break;
    case "MultiPolygon":
      coordinates.forEach((polygon) => {
        polygonFeatures.push(
          wrapFeature(
            {
              geometry: { type: "Polygon", coordinates: polygon }
            },
            sourceFeature,
            sourceFeatureIndex
          )
        );
        polygon.forEach((path) => {
          polygonOutlineFeatures.push(
            wrapFeature(
              {
                geometry: { type: "LineString", coordinates: path }
              },
              sourceFeature,
              sourceFeatureIndex
            )
          );
        });
      });
      break;
    default:
  }
}
var COORDINATE_NEST_LEVEL = {
  Point: 1,
  MultiPoint: 2,
  LineString: 2,
  MultiLineString: 3,
  Polygon: 3,
  MultiPolygon: 4
};
function validateGeometry(type, coordinates) {
  let nestLevel = COORDINATE_NEST_LEVEL[type];
  log_default.assert(nestLevel, `Unknown GeoJSON type ${type}`);
  while (coordinates && --nestLevel > 0) {
    coordinates = coordinates[0];
  }
  return coordinates && Number.isFinite(coordinates[0]);
}

// ../layers/src/geojson-layer/geojson-layer-props.ts
function createEmptyLayerProps() {
  return {
    points: {},
    lines: {},
    polygons: {},
    polygonsOutline: {}
  };
}
function getCoordinates(f) {
  return f.geometry.coordinates;
}
function createLayerPropsFromFeatures(features, featuresDiff) {
  const layerProps = createEmptyLayerProps();
  const { pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures } = features;
  layerProps.points.data = pointFeatures;
  layerProps.points._dataDiff = featuresDiff.pointFeatures && (() => featuresDiff.pointFeatures);
  layerProps.points.getPosition = getCoordinates;
  layerProps.lines.data = lineFeatures;
  layerProps.lines._dataDiff = featuresDiff.lineFeatures && (() => featuresDiff.lineFeatures);
  layerProps.lines.getPath = getCoordinates;
  layerProps.polygons.data = polygonFeatures;
  layerProps.polygons._dataDiff = featuresDiff.polygonFeatures && (() => featuresDiff.polygonFeatures);
  layerProps.polygons.getPolygon = getCoordinates;
  layerProps.polygonsOutline.data = polygonOutlineFeatures;
  layerProps.polygonsOutline._dataDiff = featuresDiff.polygonOutlineFeatures && (() => featuresDiff.polygonOutlineFeatures);
  layerProps.polygonsOutline.getPath = getCoordinates;
  return layerProps;
}
function createLayerPropsFromBinary(geojsonBinary) {
  const layerProps = createEmptyLayerProps();
  const { points, lines, polygons } = geojsonBinary;
  const customPickingIndexes = calculatePickingIndexes(geojsonBinary);
  layerProps.points.data = {
    length: points.positions.value.length / points.positions.size,
    attributes: {
      ...points.attributes,
      getPosition: points.positions,
      /** Global feature id for the rendered point geometry. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        value: customPickingIndexes.points
      }
    },
    properties: points.properties,
    numericProps: points.numericProps,
    featureIds: points.featureIds
  };
  layerProps.lines.data = {
    length: lines.pathIndices.value.length - 1,
    startIndices: lines.pathIndices.value,
    attributes: {
      ...lines.attributes,
      getPath: lines.positions,
      /** Global feature id for the rendered path geometry. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        value: customPickingIndexes.lines
      }
    },
    properties: lines.properties,
    numericProps: lines.numericProps,
    featureIds: lines.featureIds
  };
  layerProps.lines._pathType = "open";
  const vertexCount = polygons.positions.value.length / polygons.positions.size;
  const vertexValid = Array(vertexCount).fill(1);
  for (const index of polygons.primitivePolygonIndices.value) {
    vertexValid[index - 1] = 0;
  }
  layerProps.polygons.data = {
    length: polygons.polygonIndices.value.length - 1,
    startIndices: polygons.polygonIndices.value,
    attributes: {
      ...polygons.attributes,
      getPolygon: polygons.positions,
      instanceVertexValid: {
        size: 1,
        value: new Uint16Array(vertexValid)
      },
      /** Global feature id for the rendered polygon geometry. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        value: customPickingIndexes.polygons
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  };
  layerProps.polygons._normalize = false;
  if (polygons.triangles) {
    layerProps.polygons.data.attributes.indices = polygons.triangles.value;
  }
  layerProps.polygonsOutline.data = {
    length: polygons.primitivePolygonIndices.value.length - 1,
    startIndices: polygons.primitivePolygonIndices.value,
    attributes: {
      ...polygons.attributes,
      getPath: polygons.positions,
      /** Global feature id for the rendered polygon outline geometry. */
      rowIndexes: {
        size: 1,
        type: "uint32",
        value: customPickingIndexes.polygons
      }
    },
    properties: polygons.properties,
    numericProps: polygons.numericProps,
    featureIds: polygons.featureIds
  };
  layerProps.polygonsOutline._pathType = "open";
  return layerProps;
}

// ../layers/src/geojson-layer/geojson-layer.ts
var FEATURE_TYPES = ["points", "linestrings", "polygons"];
var defaultProps14 = {
  ...getDefaultProps(POINT_LAYER.circle),
  ...getDefaultProps(POINT_LAYER.icon),
  ...getDefaultProps(POINT_LAYER.text),
  ...getDefaultProps(LINE_LAYER),
  ...getDefaultProps(POLYGON_LAYER),
  // Overwrite sub layer defaults
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  _full3d: false,
  iconAtlas: { type: "object", value: null },
  iconMapping: { type: "object", value: {} },
  getIcon: { type: "accessor", value: (f) => f.properties.icon },
  getText: { type: "accessor", value: (f) => f.properties.text },
  // Self props
  pointType: "circle",
  // TODO: deprecated, remove in v9
  getRadius: { deprecatedFor: "getPointRadius" }
};
var GeoJsonLayer = class extends CompositeLayer {
  initializeState() {
    this.state = {
      layerProps: {},
      features: {},
      featuresDiff: {}
    };
  }
  updateState({ props, changeFlags }) {
    if (!changeFlags.dataChanged) {
      return;
    }
    const { data } = this.props;
    const binary = data && "points" in data && "polygons" in data && "lines" in data;
    this.setState({ binary });
    if (binary) {
      this._updateStateBinary({ props, changeFlags });
    } else {
      this._updateStateJSON({ props, changeFlags });
    }
  }
  _updateStateBinary({ props, changeFlags }) {
    const layerProps = createLayerPropsFromBinary(props.data);
    this.setState({ layerProps });
  }
  _updateStateJSON({ props, changeFlags }) {
    const features = getGeojsonFeatures(props.data);
    const wrapFeature = this.getSubLayerRow.bind(this);
    let newFeatures = {};
    const featuresDiff = {};
    if (Array.isArray(changeFlags.dataChanged)) {
      const oldFeatures = this.state.features;
      for (const key in oldFeatures) {
        newFeatures[key] = oldFeatures[key].slice();
        featuresDiff[key] = [];
      }
      for (const dataRange of changeFlags.dataChanged) {
        const partialFeatures = separateGeojsonFeatures(features, wrapFeature, dataRange);
        for (const key in oldFeatures) {
          featuresDiff[key].push(
            replaceInRange({
              data: newFeatures[key],
              getIndex: (f) => f.__source.index,
              dataRange,
              replace: partialFeatures[key]
            })
          );
        }
      }
    } else {
      newFeatures = separateGeojsonFeatures(features, wrapFeature);
    }
    const layerProps = createLayerPropsFromFeatures(newFeatures, featuresDiff);
    this.setState({
      features: newFeatures,
      featuresDiff,
      layerProps
    });
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    const { index, sourceLayer } = info;
    info.featureType = FEATURE_TYPES.find((ft) => sourceLayer.id.startsWith(`${this.id}-${ft}-`));
    if (index >= 0 && sourceLayer.id.startsWith(`${this.id}-points-text`) && this.state.binary) {
      info.index = this.props.data.points.globalFeatureIds.value[index];
    }
    return info;
  }
  _updateAutoHighlight(info) {
    const pointLayerIdPrefix = `${this.id}-points-`;
    const sourceIsPoints = info.featureType === "points";
    for (const layer of this.getSubLayers()) {
      if (layer.id.startsWith(pointLayerIdPrefix) === sourceIsPoints) {
        layer.updateAutoHighlight(info);
      }
    }
  }
  _renderPolygonLayer() {
    var _a;
    const { extruded, wireframe } = this.props;
    const { layerProps } = this.state;
    const id = "polygons-fill";
    const PolygonFillLayer = this.shouldRenderSubLayer(id, (_a = layerProps.polygons) == null ? void 0 : _a.data) && this.getSubLayerClass(id, POLYGON_LAYER.type);
    if (PolygonFillLayer) {
      const forwardedProps = forwardProps(this, POLYGON_LAYER.props);
      const useLineColor = extruded && wireframe;
      if (!useLineColor) {
        delete forwardedProps.getLineColor;
      }
      forwardedProps.updateTriggers.lineColors = useLineColor;
      return new PolygonFillLayer(
        forwardedProps,
        this.getSubLayerProps({
          id,
          updateTriggers: forwardedProps.updateTriggers
        }),
        layerProps.polygons
      );
    }
    return null;
  }
  _renderLineLayers() {
    var _a, _b;
    const { extruded, stroked } = this.props;
    const { layerProps } = this.state;
    const polygonStrokeLayerId = "polygons-stroke";
    const lineStringsLayerId = "linestrings";
    const PolygonStrokeLayer = !extruded && stroked && this.shouldRenderSubLayer(polygonStrokeLayerId, (_a = layerProps.polygonsOutline) == null ? void 0 : _a.data) && this.getSubLayerClass(polygonStrokeLayerId, LINE_LAYER.type);
    const LineStringsLayer = this.shouldRenderSubLayer(lineStringsLayerId, (_b = layerProps.lines) == null ? void 0 : _b.data) && this.getSubLayerClass(lineStringsLayerId, LINE_LAYER.type);
    if (PolygonStrokeLayer || LineStringsLayer) {
      const forwardedProps = forwardProps(this, LINE_LAYER.props);
      return [
        PolygonStrokeLayer && new PolygonStrokeLayer(
          forwardedProps,
          this.getSubLayerProps({
            id: polygonStrokeLayerId,
            updateTriggers: forwardedProps.updateTriggers
          }),
          layerProps.polygonsOutline
        ),
        LineStringsLayer && new LineStringsLayer(
          forwardedProps,
          this.getSubLayerProps({
            id: lineStringsLayerId,
            updateTriggers: forwardedProps.updateTriggers
          }),
          layerProps.lines
        )
      ];
    }
    return null;
  }
  _renderPointLayers() {
    var _a;
    const { pointType } = this.props;
    const { layerProps, binary } = this.state;
    let { highlightedObjectIndex } = this.props;
    if (!binary && Number.isFinite(highlightedObjectIndex)) {
      highlightedObjectIndex = layerProps.points.data.findIndex(
        (d) => d.__source.index === highlightedObjectIndex
      );
    }
    const types = new Set(pointType.split("+"));
    const pointLayers = [];
    for (const type of types) {
      const id = `points-${type}`;
      const PointLayerMapping = POINT_LAYER[type];
      const PointsLayer = PointLayerMapping && this.shouldRenderSubLayer(id, (_a = layerProps.points) == null ? void 0 : _a.data) && this.getSubLayerClass(id, PointLayerMapping.type);
      if (PointsLayer) {
        const forwardedProps = forwardProps(this, PointLayerMapping.props);
        let pointsLayerProps = layerProps.points;
        if (type === "text" && binary) {
          const { rowIndexes, ...rest } = pointsLayerProps.data.attributes;
          pointsLayerProps = {
            ...pointsLayerProps,
            // @ts-expect-error TODO - type binary data
            data: { ...pointsLayerProps.data, attributes: rest }
          };
        }
        pointLayers.push(
          new PointsLayer(
            forwardedProps,
            this.getSubLayerProps({
              id,
              updateTriggers: forwardedProps.updateTriggers,
              highlightedObjectIndex
            }),
            pointsLayerProps
          )
        );
      }
    }
    return pointLayers;
  }
  renderLayers() {
    const { extruded } = this.props;
    const polygonFillLayer = this._renderPolygonLayer();
    const lineLayers = this._renderLineLayers();
    const pointLayers = this._renderPointLayers();
    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer,
      lineLayers,
      pointLayers,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer
    ];
  }
  getSubLayerAccessor(accessor) {
    const { binary } = this.state;
    if (!binary || typeof accessor !== "function") {
      return super.getSubLayerAccessor(accessor);
    }
    return (object, info) => {
      const { data, index } = info;
      const feature = binaryToFeatureForAccesor(data, index);
      return accessor(feature, info);
    };
  }
};
GeoJsonLayer.layerName = "GeoJsonLayer";
GeoJsonLayer.defaultProps = defaultProps14;

// dist/geo-cell-layer/GeoCellLayer.js
var defaultProps15 = {
  ...PolygonLayer.defaultProps
};
var GeoCellLayer = class extends CompositeLayer {
  /** Implement to generate props to create geometry. */
  indexToBounds() {
    return null;
  }
  renderLayers() {
    const { elevationScale, extruded, wireframe, filled, stroked, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, lineAntialiasing, lineJointRounded, lineMiterLimit, lineDashJustified, getElevation, getFillColor, getLineColor, getLineWidth } = this.props;
    const { updateTriggers, material, transitions } = this.props;
    const CellLayer = this.getSubLayerClass("cell", PolygonLayer);
    const { updateTriggers: boundsUpdateTriggers, ...boundsProps } = this.indexToBounds() || {};
    return new CellLayer({
      filled,
      wireframe,
      extruded,
      elevationScale,
      stroked,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineAntialiasing,
      lineJointRounded,
      lineMiterLimit,
      lineDashJustified,
      material,
      transitions,
      getElevation,
      getFillColor,
      getLineColor,
      getLineWidth
    }, this.getSubLayerProps({
      id: "cell",
      updateTriggers: updateTriggers && {
        ...boundsUpdateTriggers,
        getElevation: updateTriggers.getElevation,
        getFillColor: updateTriggers.getFillColor,
        getLineColor: updateTriggers.getLineColor,
        getLineWidth: updateTriggers.getLineWidth
      }
    }), boundsProps);
  }
};
GeoCellLayer.layerName = "GeoCellLayer";
GeoCellLayer.defaultProps = defaultProps15;
var GeoCellLayer_default = GeoCellLayer;

// dist/a5-layer/a5-layer.js
var import_a5_js = require("a5-js");

// dist/h3-layers/h3-utils.js
var import_h3_js = require("h3-js");
var import_core39 = require("@math.gl/core");
function normalizeLongitudes(vertices, refLng) {
  refLng = refLng === void 0 ? vertices[0][0] : refLng;
  for (const pt of vertices) {
    const deltaLng = pt[0] - refLng;
    if (deltaLng > 180) {
      pt[0] -= 360;
    } else if (deltaLng < -180) {
      pt[0] += 360;
    }
  }
}
function scalePolygon(hexId, vertices, factor) {
  const [lat, lng] = (0, import_h3_js.cellToLatLng)(hexId);
  const actualCount = vertices.length;
  normalizeLongitudes(vertices, lng);
  const vertexCount = vertices[0] === vertices[actualCount - 1] ? actualCount - 1 : actualCount;
  for (let i = 0; i < vertexCount; i++) {
    vertices[i][0] = (0, import_core39.lerp)(lng, vertices[i][0], factor);
    vertices[i][1] = (0, import_core39.lerp)(lat, vertices[i][1], factor);
  }
}
function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = (0, import_h3_js.cellToLatLng)(hexagonId);
  return [lng, lat];
}
function h3ToPolygon(hexId, coverage = 1) {
  const vertices = (0, import_h3_js.cellToBoundary)(hexId, true);
  if (coverage !== 1) {
    scalePolygon(hexId, vertices, coverage);
  } else {
    normalizeLongitudes(vertices);
  }
  return vertices;
}
function flattenPolygon(vertices) {
  const positions = new Float64Array(vertices.length * 2);
  let i = 0;
  for (const pt of vertices) {
    positions[i++] = pt[0];
    positions[i++] = pt[1];
  }
  return positions;
}

// dist/a5-layer/a5-layer.js
var defaultProps16 = {
  getPentagon: { type: "accessor", value: (d) => d.pentagon }
};
var A5Layer = class extends GeoCellLayer_default {
  indexToBounds() {
    const { data, getPentagon } = this.props;
    return {
      data,
      _normalize: false,
      _windingOrder: "CCW",
      positionFormat: "XY",
      getPolygon: (x, objectInfo) => {
        const pentagon = getPentagon(x, objectInfo);
        const boundary = (0, import_a5_js.cellToBoundary)(typeof pentagon === "string" ? (0, import_a5_js.hexToU64)(pentagon) : pentagon, { closedRing: true, segments: "auto" });
        return flattenPolygon(boundary);
      }
    };
  }
};
A5Layer.layerName = "A5Layer";
A5Layer.defaultProps = defaultProps16;
var a5_layer_default = A5Layer;

// dist/wms-layer/wms-layer.js
var import_core41 = require("@loaders.gl/core");
var import_wms = require("@loaders.gl/wms");

// dist/wms-layer/utils.js
var import_web_mercator8 = require("@math.gl/web-mercator");
var HALF_EARTH_CIRCUMFERENCE = 6378137 * Math.PI;
function WGS84ToPseudoMercator(coord) {
  const mercator = (0, import_web_mercator8.lngLatToWorld)(coord);
  mercator[0] = (mercator[0] / 256 - 1) * HALF_EARTH_CIRCUMFERENCE;
  mercator[1] = (mercator[1] / 256 - 1) * HALF_EARTH_CIRCUMFERENCE;
  return mercator;
}

// dist/wms-layer/wms-layer.js
var defaultProps17 = {
  id: "imagery-layer",
  data: "",
  serviceType: "auto",
  srs: "auto",
  layers: { type: "array", compare: true, value: [] },
  onMetadataLoad: { type: "function", value: () => {
  } },
  // eslint-disable-next-line
  onMetadataLoadError: { type: "function", value: console.error },
  onImageLoadStart: { type: "function", value: () => {
  } },
  onImageLoad: { type: "function", value: () => {
  } },
  onImageLoadError: {
    type: "function",
    compare: false,
    // eslint-disable-next-line
    value: (requestId, error) => console.error(error, requestId)
  }
};
var WMSLayer = class extends CompositeLayer {
  /** Returns true if all async resources are loaded */
  get isLoaded() {
    var _a;
    return ((_a = this.state) == null ? void 0 : _a.loadCounter) === 0 && super.isLoaded;
  }
  /** Lets deck.gl know that we want viewport change events */
  shouldUpdateState() {
    return true;
  }
  initializeState() {
    this.state._nextRequestId = 0;
    this.state.lastRequestId = -1;
    this.state.loadCounter = 0;
  }
  updateState({ changeFlags, props, oldProps }) {
    const { viewport } = this.context;
    if (changeFlags.dataChanged || props.serviceType !== oldProps.serviceType) {
      this.state.imageSource = this._createImageSource(props);
      this._loadMetadata();
      this.debounce(() => this.loadImage(viewport, "image source changed"), 0);
    } else if (!deepEqual(props.layers, oldProps.layers, 1)) {
      this.debounce(() => this.loadImage(viewport, "layers changed"), 0);
    } else if (changeFlags.viewportChanged) {
      this.debounce(() => this.loadImage(viewport, "viewport changed"));
    }
  }
  finalizeState() {
  }
  renderLayers() {
    const { bounds, image, lastRequestParameters } = this.state;
    return image && new BitmapLayer({
      ...this.getSubLayerProps({ id: "bitmap" }),
      _imageCoordinateSystem: lastRequestParameters.srs === "EPSG:4326" ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN,
      bounds,
      image
    });
  }
  async getFeatureInfoText(x, y) {
    var _a, _b;
    const { lastRequestParameters } = this.state;
    if (lastRequestParameters) {
      const featureInfo = await ((_b = (_a = this.state.imageSource).getFeatureInfoText) == null ? void 0 : _b.call(_a, {
        ...lastRequestParameters,
        query_layers: lastRequestParameters.layers,
        x,
        y,
        info_format: "application/vnd.ogc.gml"
      }));
      return featureInfo;
    }
    return "";
  }
  _createImageSource(props) {
    if (props.data instanceof import_wms.ImageSource) {
      return props.data;
    }
    if (typeof props.data === "string") {
      return (0, import_core41.createDataSource)(props.data, [import_wms.WMSSource], {
        core: {
          type: props.serviceType,
          loadOptions: props.loadOptions
        }
      });
    }
    throw new Error("invalid image source in props.data");
  }
  /** Run a getMetadata on the image service */
  async _loadMetadata() {
    var _a, _b;
    const { imageSource } = this.state;
    try {
      this.state.loadCounter++;
      const metadata = await imageSource.getMetadata();
      if (this.state.imageSource === imageSource) {
        (_a = this.getCurrentLayer()) == null ? void 0 : _a.props.onMetadataLoad(metadata);
      }
    } catch (error) {
      (_b = this.getCurrentLayer()) == null ? void 0 : _b.props.onMetadataLoadError(error);
    } finally {
      this.state.loadCounter--;
    }
  }
  /** Load an image */
  async loadImage(viewport, reason) {
    var _a, _b;
    const { layers, serviceType } = this.props;
    if (serviceType === "wms" && layers.length === 0) {
      return;
    }
    const bounds = viewport.getBounds();
    const { width, height } = viewport;
    const requestId = this.getRequestId();
    let { srs } = this.props;
    if (srs === "auto") {
      srs = viewport.resolution ? "EPSG:4326" : "EPSG:3857";
    }
    const requestParams = {
      width,
      height,
      boundingBox: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ],
      layers,
      crs: srs
    };
    if (srs === "EPSG:3857") {
      const min = WGS84ToPseudoMercator([bounds[0], bounds[1]]);
      const max = WGS84ToPseudoMercator([bounds[2], bounds[3]]);
      requestParams.boundingBox = [min, max];
    }
    try {
      this.state.loadCounter++;
      this.props.onImageLoadStart(requestId);
      const image = await this.state.imageSource.getImage(requestParams);
      if (this.state.lastRequestId < requestId) {
        (_a = this.getCurrentLayer()) == null ? void 0 : _a.props.onImageLoad(requestId);
        this.setState({
          image,
          bounds,
          lastRequestParameters: requestParams,
          lastRequestId: requestId
        });
      }
    } catch (error) {
      this.raiseError(error, "Load image");
      (_b = this.getCurrentLayer()) == null ? void 0 : _b.props.onImageLoadError(requestId, error);
    } finally {
      this.state.loadCounter--;
    }
  }
  // HELPERS
  /** Global counter for issuing unique request ids */
  getRequestId() {
    return this.state._nextRequestId++;
  }
  /** Runs an action in the future, cancels it if the new action is issued before it executes */
  debounce(fn, ms = 500) {
    clearTimeout(this.state._timeoutId);
    this.state._timeoutId = setTimeout(() => fn(), ms);
  }
};
WMSLayer.layerName = "WMSLayer";
WMSLayer.defaultProps = defaultProps17;

// dist/great-circle-layer/great-circle-layer.js
var defaultProps18 = {
  getHeight: { type: "accessor", value: 0 },
  greatCircle: true
};
var GreatCircleLayer = class extends ArcLayer {
};
GreatCircleLayer.layerName = "GreatCircleLayer";
GreatCircleLayer.defaultProps = defaultProps18;
var great_circle_layer_default = GreatCircleLayer;

// dist/s2-layer/s2-geometry.js
var import_long = __toESM(require("long"), 1);
var FACE_BITS = 3;
var MAX_LEVEL = 30;
var POS_BITS = 2 * MAX_LEVEL + 1;
var RADIAN_TO_DEGREE = 180 / Math.PI;
function IJToST(ij, order, offsets) {
  const maxSize = 1 << order;
  return [(ij[0] + offsets[0]) / maxSize, (ij[1] + offsets[1]) / maxSize];
}
function singleSTtoUV(st) {
  if (st >= 0.5) {
    return 1 / 3 * (4 * st * st - 1);
  }
  return 1 / 3 * (1 - 4 * (1 - st) * (1 - st));
}
function STToUV(st) {
  return [singleSTtoUV(st[0]), singleSTtoUV(st[1])];
}
function FaceUVToXYZ(face, [u, v]) {
  switch (face) {
    case 0:
      return [1, u, v];
    case 1:
      return [-u, 1, v];
    case 2:
      return [-u, -v, 1];
    case 3:
      return [-1, -v, -u];
    case 4:
      return [v, -1, -u];
    case 5:
      return [v, u, -1];
    default:
      throw new Error("Invalid face");
  }
}
function XYZToLngLat([x, y, z]) {
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lng = Math.atan2(y, x);
  return [lng * RADIAN_TO_DEGREE, lat * RADIAN_TO_DEGREE];
}
function toHilbertQuadkey(idS) {
  let bin = import_long.default.fromString(idS, true, 10).toString(2);
  while (bin.length < FACE_BITS + POS_BITS) {
    bin = "0" + bin;
  }
  const lsbIndex = bin.lastIndexOf("1");
  const faceB = bin.substring(0, 3);
  const posB = bin.substring(3, lsbIndex);
  const levelN = posB.length / 2;
  const faceS = import_long.default.fromString(faceB, true, 2).toString(10);
  let posS = import_long.default.fromString(posB, true, 2).toString(4);
  while (posS.length < levelN) {
    posS = "0" + posS;
  }
  return `${faceS}/${posS}`;
}
function rotateAndFlipQuadrant(n, point, rx, ry) {
  if (ry === 0) {
    if (rx === 1) {
      point[0] = n - 1 - point[0];
      point[1] = n - 1 - point[1];
    }
    const x = point[0];
    point[0] = point[1];
    point[1] = x;
  }
}
function FromHilbertQuadKey(hilbertQuadkey) {
  const parts = hilbertQuadkey.split("/");
  const face = parseInt(parts[0], 10);
  const position = parts[1];
  const maxLevel = position.length;
  const point = [0, 0];
  let level;
  for (let i = maxLevel - 1; i >= 0; i--) {
    level = maxLevel - i;
    const bit = position[i];
    let rx = 0;
    let ry = 0;
    if (bit === "1") {
      ry = 1;
    } else if (bit === "2") {
      rx = 1;
      ry = 1;
    } else if (bit === "3") {
      rx = 1;
    }
    const val = Math.pow(2, level - 1);
    rotateAndFlipQuadrant(val, point, rx, ry);
    point[0] += val * rx;
    point[1] += val * ry;
  }
  if (face % 2 === 1) {
    const t = point[0];
    point[0] = point[1];
    point[1] = t;
  }
  return { face, ij: point, level };
}

// dist/s2-layer/s2-utils.js
var import_long2 = __toESM(require("long"), 1);
function getIdFromToken(token) {
  const paddedToken = token.padEnd(16, "0");
  return import_long2.default.fromString(paddedToken, 16);
}
var MAX_RESOLUTION = 100;
function getGeoBounds({ face, ij, level }) {
  const offsets = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0]
  ];
  const resolution = Math.max(1, Math.ceil(MAX_RESOLUTION * Math.pow(2, -level)));
  const result = new Float64Array(4 * resolution * 2 + 2);
  let ptIndex = 0;
  let prevLng = 0;
  for (let i = 0; i < 4; i++) {
    const offset = offsets[i].slice(0);
    const nextOffset = offsets[i + 1];
    const stepI = (nextOffset[0] - offset[0]) / resolution;
    const stepJ = (nextOffset[1] - offset[1]) / resolution;
    for (let j = 0; j < resolution; j++) {
      offset[0] += stepI;
      offset[1] += stepJ;
      const st = IJToST(ij, level, offset);
      const uv = STToUV(st);
      const xyz = FaceUVToXYZ(face, uv);
      const lngLat = XYZToLngLat(xyz);
      if (Math.abs(lngLat[1]) > 89.999) {
        lngLat[0] = prevLng;
      }
      const deltaLng = lngLat[0] - prevLng;
      lngLat[0] += deltaLng > 180 ? -360 : deltaLng < -180 ? 360 : 0;
      result[ptIndex++] = lngLat[0];
      result[ptIndex++] = lngLat[1];
      prevLng = lngLat[0];
    }
  }
  result[ptIndex++] = result[0];
  result[ptIndex++] = result[1];
  return result;
}
function getS2QuadKey(token) {
  if (typeof token === "string") {
    if (token.indexOf("/") > 0) {
      return token;
    }
    token = getIdFromToken(token);
  }
  return toHilbertQuadkey(token.toString());
}
function getS2Polygon(token) {
  const key = getS2QuadKey(token);
  const s2cell = FromHilbertQuadKey(key);
  return getGeoBounds(s2cell);
}

// dist/s2-layer/s2-layer.js
var defaultProps19 = {
  getS2Token: { type: "accessor", value: (d) => d.token }
};
var S2Layer = class extends GeoCellLayer_default {
  indexToBounds() {
    const { data, getS2Token } = this.props;
    return {
      data,
      _normalize: false,
      positionFormat: "XY",
      getPolygon: (x, objectInfo) => getS2Polygon(getS2Token(x, objectInfo))
    };
  }
};
S2Layer.layerName = "S2Layer";
S2Layer.defaultProps = defaultProps19;
var s2_layer_default = S2Layer;

// dist/quadkey-layer/quadkey-utils.js
var import_web_mercator9 = require("@math.gl/web-mercator");
var TILE_SIZE = 512;
function quadkeyToWorldBounds(quadkey, coverage) {
  let x = 0;
  let y = 0;
  let mask = 1 << quadkey.length;
  const scale = mask / TILE_SIZE;
  for (let i = 0; i < quadkey.length; i++) {
    mask >>= 1;
    const q = parseInt(quadkey[i]);
    if (q % 2)
      x |= mask;
    if (q > 1)
      y |= mask;
  }
  return [
    [x / scale, TILE_SIZE - y / scale],
    [(x + coverage) / scale, TILE_SIZE - (y + coverage) / scale]
  ];
}
function getQuadkeyPolygon(quadkey, coverage = 1) {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey, coverage);
  const [w, n] = (0, import_web_mercator9.worldToLngLat)(topLeft);
  const [e, s] = (0, import_web_mercator9.worldToLngLat)(bottomRight);
  return [e, n, e, s, w, s, w, n, e, n];
}

// dist/quadkey-layer/quadkey-layer.js
var defaultProps20 = {
  getQuadkey: { type: "accessor", value: (d) => d.quadkey }
};
var QuadkeyLayer = class extends GeoCellLayer_default {
  indexToBounds() {
    const { data, extruded, getQuadkey } = this.props;
    const coverage = extruded ? 0.99 : 1;
    return {
      data,
      _normalize: false,
      positionFormat: "XY",
      getPolygon: (x, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo), coverage),
      updateTriggers: { getPolygon: coverage }
    };
  }
};
QuadkeyLayer.layerName = "QuadkeyLayer";
QuadkeyLayer.defaultProps = defaultProps20;
var quadkey_layer_default = QuadkeyLayer;

// dist/tileset-2d/tileset-2d.js
var import_loader_utils = require("@loaders.gl/loader-utils");
var import_core43 = require("@math.gl/core");

// dist/tileset-2d/tile-2d-header.js
var Tile2DHeader = class {
  constructor(index) {
    this.index = index;
    this.isVisible = false;
    this.isSelected = false;
    this.parent = null;
    this.children = [];
    this.content = null;
    this._loader = void 0;
    this._abortController = null;
    this._loaderId = 0;
    this._isLoaded = false;
    this._isCancelled = false;
    this._needsReload = false;
  }
  /** @deprecated use `boundingBox` instead */
  get bbox() {
    return this._bbox;
  }
  // TODO - remove in v9
  set bbox(value) {
    if (this._bbox)
      return;
    this._bbox = value;
    if ("west" in value) {
      this.boundingBox = [
        [value.west, value.south],
        [value.east, value.north]
      ];
    } else {
      this.boundingBox = [
        [value.left, value.top],
        [value.right, value.bottom]
      ];
    }
  }
  get data() {
    return this.isLoading && this._loader ? this._loader.then(() => this.data) : this.content;
  }
  get isLoaded() {
    return this._isLoaded && !this._needsReload;
  }
  get isLoading() {
    return Boolean(this._loader) && !this._isCancelled;
  }
  get needsReload() {
    return this._needsReload || this._isCancelled;
  }
  get byteLength() {
    const result = this.content ? this.content.byteLength : 0;
    if (!Number.isFinite(result)) {
      console.error("byteLength not defined in tile data");
    }
    return result;
  }
  /* eslint-disable max-statements */
  async _loadData({ getData, getRequestPriority, requestScheduler, onLoad, onError }) {
    const { index, id, bbox, userData, zoom } = this;
    const loaderId = this._loaderId;
    this._abortController = new AbortController();
    const { signal } = this._abortController;
    const requestToken = await requestScheduler.scheduleRequest(this, getRequestPriority);
    if (!requestToken) {
      this._isCancelled = true;
      return;
    }
    if (this._isCancelled) {
      requestToken.done();
      return;
    }
    let tileData = null;
    let error;
    try {
      tileData = await getData({ index, id, bbox, userData, zoom, signal });
    } catch (err) {
      error = err || true;
    } finally {
      requestToken.done();
    }
    if (loaderId !== this._loaderId) {
      return;
    }
    this._loader = void 0;
    this.content = tileData;
    if (this._isCancelled && !tileData) {
      this._isLoaded = false;
      return;
    }
    this._isLoaded = true;
    this._isCancelled = false;
    if (error) {
      onError(error, this);
    } else {
      onLoad(this);
    }
  }
  loadData(opts) {
    this._isLoaded = false;
    this._isCancelled = false;
    this._needsReload = false;
    this._loaderId++;
    this._loader = this._loadData(opts);
    return this._loader;
  }
  setNeedsReload() {
    if (this.isLoading) {
      this.abort();
      this._loader = void 0;
    }
    this._needsReload = true;
  }
  abort() {
    var _a;
    if (this.isLoaded) {
      return;
    }
    this._isCancelled = true;
    (_a = this._abortController) == null ? void 0 : _a.abort();
  }
};

// dist/tileset-2d/tile-2d-traversal.js
var import_culling = require("@math.gl/culling");
var import_web_mercator10 = require("@math.gl/web-mercator");
var TILE_SIZE2 = 512;
var MAX_MAPS = 3;
var REF_POINTS_5 = [
  [0.5, 0.5],
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
];
var REF_POINTS_9 = REF_POINTS_5.concat([
  [0, 0.5],
  [0.5, 0],
  [1, 0.5],
  [0.5, 1]
]);
var REF_POINTS_11 = REF_POINTS_9.concat([
  [0.25, 0.5],
  [0.75, 0.5]
]);
var OSMNode = class _OSMNode {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  get children() {
    if (!this._children) {
      const x = this.x * 2;
      const y = this.y * 2;
      const z = this.z + 1;
      this._children = [
        new _OSMNode(x, y, z),
        new _OSMNode(x, y + 1, z),
        new _OSMNode(x + 1, y, z),
        new _OSMNode(x + 1, y + 1, z)
      ];
    }
    return this._children;
  }
  // eslint-disable-next-line complexity
  update(params) {
    const { viewport, cullingVolume, elevationBounds, minZ, maxZ, bounds, offset, project } = params;
    const boundingVolume = this.getBoundingVolume(elevationBounds, offset, project);
    if (bounds && !this.insideBounds(bounds)) {
      return false;
    }
    const isInside = cullingVolume.computeVisibility(boundingVolume);
    if (isInside < 0) {
      return false;
    }
    if (project && this.beyondHorizon(viewport.cameraPosition, project, elevationBounds[1])) {
      return false;
    }
    if (!this.childVisible) {
      let { z } = this;
      if (z < maxZ && z >= minZ) {
        const distance2 = boundingVolume.distanceTo(viewport.cameraPosition) * viewport.scale / viewport.height;
        z += Math.floor(Math.log2(distance2));
      }
      if (z >= maxZ) {
        this.selected = true;
        return true;
      }
    }
    this.selected = false;
    this.childVisible = true;
    for (const child of this.children) {
      child.update(params);
    }
    return true;
  }
  getSelected(result = []) {
    if (this.selected) {
      result.push(this);
    }
    if (this._children) {
      for (const node of this._children) {
        node.getSelected(result);
      }
    }
    return result;
  }
  beyondHorizon(cameraPosition, project, elevation) {
    const cx = cameraPosition[0];
    const cy = cameraPosition[1];
    const cz = cameraPosition[2];
    const cMag = Math.sqrt(cx * cx + cy * cy + cz * cz);
    const camLng = Math.atan2(cx, -cy) * 180 / Math.PI;
    const camLat = Math.asin(cz / cMag) * 180 / Math.PI;
    const [west, north] = osmTile2lngLat(this.x, this.y, this.z);
    const [east, south] = osmTile2lngLat(this.x + 1, this.y + 1, this.z);
    const tileCenterLng = (west + east) / 2;
    const wrappedCamLng = tileCenterLng + ((camLng - tileCenterLng + 540) % 360 - 180);
    const closestLng = Math.max(west, Math.min(wrappedCamLng, east));
    const closestLat = Math.max(south, Math.min(camLat, north));
    const closest = project([closestLng, closestLat, elevation]);
    const dot = closest[0] * cx + closest[1] * cy + closest[2] * cz;
    const magSq = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
    return dot <= magSq;
  }
  insideBounds([minX, minY, maxX, maxY]) {
    const scale = Math.pow(2, this.z);
    const extent = TILE_SIZE2 / scale;
    return this.x * extent < maxX && this.y * extent < maxY && (this.x + 1) * extent > minX && (this.y + 1) * extent > minY;
  }
  getBoundingVolume(zRange, worldOffset, project) {
    if (project) {
      const refPoints = this.z < 1 ? REF_POINTS_11 : this.z < 2 ? REF_POINTS_9 : REF_POINTS_5;
      const refPointPositions = [];
      for (const p of refPoints) {
        const lngLat = osmTile2lngLat(this.x + p[0], this.y + p[1], this.z);
        lngLat[2] = zRange[0];
        refPointPositions.push(project(lngLat));
        if (zRange[0] !== zRange[1]) {
          lngLat[2] = zRange[1];
          refPointPositions.push(project(lngLat));
        }
      }
      return (0, import_culling.makeOrientedBoundingBoxFromPoints)(refPointPositions);
    }
    const scale = Math.pow(2, this.z);
    const extent = TILE_SIZE2 / scale;
    const originX = this.x * extent + worldOffset * TILE_SIZE2;
    const originY = TILE_SIZE2 - (this.y + 1) * extent;
    return new import_culling.AxisAlignedBoundingBox([originX, originY, zRange[0]], [originX + extent, originY + extent, zRange[1]]);
  }
};
function getOSMTileIndices(viewport, maxZ, zRange, bounds) {
  const project = viewport instanceof GlobeViewport ? (
    // eslint-disable-next-line @typescript-eslint/unbound-method
    viewport.projectPosition
  ) : null;
  const planes = Object.values(viewport.getFrustumPlanes()).map(({ normal, distance: distance2 }) => new import_culling.Plane(normal.clone().negate(), distance2));
  const cullingVolume = new import_culling.CullingVolume(planes);
  const unitsPerMeter2 = viewport.distanceScales.unitsPerMeter[2];
  const elevationMin = zRange && zRange[0] * unitsPerMeter2 || 0;
  const elevationMax = zRange && zRange[1] * unitsPerMeter2 || 0;
  const minZ = viewport instanceof WebMercatorViewport && viewport.pitch <= 60 ? maxZ : 0;
  if (bounds) {
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const topLeft = (0, import_web_mercator10.lngLatToWorld)([minLng, maxLat]);
    const bottomRight = (0, import_web_mercator10.lngLatToWorld)([maxLng, minLat]);
    bounds = [topLeft[0], TILE_SIZE2 - topLeft[1], bottomRight[0], TILE_SIZE2 - bottomRight[1]];
  }
  const root = new OSMNode(0, 0, 0);
  const traversalParams = {
    viewport,
    project,
    cullingVolume,
    elevationBounds: [elevationMin, elevationMax],
    minZ,
    maxZ,
    bounds,
    // num. of worlds from the center. For repeated maps
    offset: 0
  };
  root.update(traversalParams);
  if (viewport instanceof WebMercatorViewport && viewport.subViewports && viewport.subViewports.length > 1) {
    traversalParams.offset = -1;
    while (root.update(traversalParams)) {
      if (--traversalParams.offset < -MAX_MAPS) {
        break;
      }
    }
    traversalParams.offset = 1;
    while (root.update(traversalParams)) {
      if (++traversalParams.offset > MAX_MAPS) {
        break;
      }
    }
  }
  return root.getSelected();
}

// dist/tileset-2d/utils.js
var TILE_SIZE3 = 512;
var DEFAULT_EXTENT = [-Infinity, -Infinity, Infinity, Infinity];
var urlType = {
  type: "object",
  value: null,
  validate: (value, propType) => propType.optional && value === null || typeof value === "string" || Array.isArray(value) && value.every((url) => typeof url === "string"),
  equal: (value1, value2) => {
    if (value1 === value2) {
      return true;
    }
    if (!Array.isArray(value1) || !Array.isArray(value2)) {
      return false;
    }
    const len = value1.length;
    if (len !== value2.length) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
};
function transformBox(bbox, modelMatrix2) {
  const transformedCoords = [
    // top-left
    modelMatrix2.transformAsPoint([bbox[0], bbox[1]]),
    // top-right
    modelMatrix2.transformAsPoint([bbox[2], bbox[1]]),
    // bottom-left
    modelMatrix2.transformAsPoint([bbox[0], bbox[3]]),
    // bottom-right
    modelMatrix2.transformAsPoint([bbox[2], bbox[3]])
  ];
  const transformedBox = [
    // Minimum x coord
    Math.min(...transformedCoords.map((i) => i[0])),
    // Minimum y coord
    Math.min(...transformedCoords.map((i) => i[1])),
    // Max x coord
    Math.max(...transformedCoords.map((i) => i[0])),
    // Max y coord
    Math.max(...transformedCoords.map((i) => i[1]))
  ];
  return transformedBox;
}
function stringHash(s) {
  return Math.abs(s.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0));
}
function getURLFromTemplate(template, tile) {
  if (!template || !template.length) {
    return null;
  }
  const { index, id } = tile;
  if (Array.isArray(template)) {
    const i = stringHash(id) % template.length;
    template = template[i];
  }
  let url = template;
  for (const key of Object.keys(index)) {
    const regex = new RegExp(`{${key}}`, "g");
    url = url.replace(regex, String(index[key]));
  }
  if (Number.isInteger(index.y) && Number.isInteger(index.z)) {
    url = url.replace(/\{-y\}/g, String(Math.pow(2, index.z) - index.y - 1));
  }
  return url;
}
function getBoundingBox(viewport, zRange, extent) {
  let bounds;
  if (zRange && zRange.length === 2) {
    const [minZ, maxZ] = zRange;
    const bounds0 = viewport.getBounds({ z: minZ });
    const bounds1 = viewport.getBounds({ z: maxZ });
    bounds = [
      Math.min(bounds0[0], bounds1[0]),
      Math.min(bounds0[1], bounds1[1]),
      Math.max(bounds0[2], bounds1[2]),
      Math.max(bounds0[3], bounds1[3])
    ];
  } else {
    bounds = viewport.getBounds();
  }
  if (!viewport.isGeospatial) {
    return [
      // Top corner should not be more then bottom corner in either direction
      Math.max(Math.min(bounds[0], extent[2]), extent[0]),
      Math.max(Math.min(bounds[1], extent[3]), extent[1]),
      // Bottom corner should not be less then top corner in either direction
      Math.min(Math.max(bounds[2], extent[0]), extent[2]),
      Math.min(Math.max(bounds[3], extent[1]), extent[3])
    ];
  }
  return [
    Math.max(bounds[0], extent[0]),
    Math.max(bounds[1], extent[1]),
    Math.min(bounds[2], extent[2]),
    Math.min(bounds[3], extent[3])
  ];
}
function getCullBounds({ viewport, z, cullRect }) {
  const subViewports = viewport.subViewports || [viewport];
  return subViewports.map((v) => getCullBoundsInViewport(v, z || 0, cullRect));
}
function getCullBoundsInViewport(viewport, z, cullRect) {
  if (!Array.isArray(z)) {
    const x = cullRect.x - viewport.x;
    const y = cullRect.y - viewport.y;
    const { width, height } = cullRect;
    const unprojectOption = { targetZ: z };
    const topLeft = viewport.unproject([x, y], unprojectOption);
    const topRight = viewport.unproject([x + width, y], unprojectOption);
    const bottomLeft = viewport.unproject([x, y + height], unprojectOption);
    const bottomRight = viewport.unproject([x + width, y + height], unprojectOption);
    return [
      Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]),
      Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]),
      Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1])
    ];
  }
  const bounds0 = getCullBoundsInViewport(viewport, z[0], cullRect);
  const bounds1 = getCullBoundsInViewport(viewport, z[1], cullRect);
  return [
    Math.min(bounds0[0], bounds1[0]),
    Math.min(bounds0[1], bounds1[1]),
    Math.max(bounds0[2], bounds1[2]),
    Math.max(bounds0[3], bounds1[3])
  ];
}
function getIndexingCoords(bbox, scale, modelMatrixInverse) {
  if (modelMatrixInverse) {
    const transformedTileIndex = transformBox(bbox, modelMatrixInverse).map((i) => i * scale / TILE_SIZE3);
    return transformedTileIndex;
  }
  return bbox.map((i) => i * scale / TILE_SIZE3);
}
function getScale(z, tileSize) {
  return Math.pow(2, z) * TILE_SIZE3 / tileSize;
}
function osmTile2lngLat(x, y, z) {
  const scale = getScale(z, TILE_SIZE3);
  const lng = x / scale * 360 - 180;
  const n = Math.PI - 2 * Math.PI * y / scale;
  const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}
function tile2XY(x, y, z, tileSize) {
  const scale = getScale(z, tileSize);
  return [x / scale * TILE_SIZE3, y / scale * TILE_SIZE3];
}
function tileToBoundingBox(viewport, x, y, z, tileSize = TILE_SIZE3) {
  if (viewport.isGeospatial) {
    const [west, north] = osmTile2lngLat(x, y, z);
    const [east, south] = osmTile2lngLat(x + 1, y + 1, z);
    return { west, north, east, south };
  }
  const [left, top] = tile2XY(x, y, z, tileSize);
  const [right, bottom] = tile2XY(x + 1, y + 1, z, tileSize);
  return { left, top, right, bottom };
}
function getIdentityTileIndices(viewport, z, tileSize, extent, modelMatrixInverse) {
  const bbox = getBoundingBox(viewport, null, extent);
  const scale = getScale(z, tileSize);
  const [minX, minY, maxX, maxY] = getIndexingCoords(bbox, scale, modelMatrixInverse);
  const indices = [];
  for (let x = Math.floor(minX); x < maxX; x++) {
    for (let y = Math.floor(minY); y < maxY; y++) {
      indices.push({ x, y, z });
    }
  }
  return indices;
}
function getTileIndices({ viewport, maxZoom, minZoom, zRange, extent, tileSize = TILE_SIZE3, modelMatrix: modelMatrix2, modelMatrixInverse, zoomOffset = 0, visibleMinZoom, visibleMaxZoom }) {
  let z = viewport.isGeospatial ? Math.round(viewport.zoom + Math.log2(TILE_SIZE3 / tileSize) + zoomOffset) : Math.ceil(viewport.zoom + zoomOffset);
  if (typeof minZoom === "number" && Number.isFinite(minZoom) && z < minZoom) {
    if (!extent) {
      return [];
    }
    z = minZoom;
  }
  if (typeof maxZoom === "number" && Number.isFinite(maxZoom) && z > maxZoom) {
    z = maxZoom;
  }
  if (visibleMinZoom != null && viewport.zoom < visibleMinZoom) {
    return [];
  }
  if (visibleMaxZoom != null && viewport.zoom > visibleMaxZoom) {
    return [];
  }
  let transformedExtent = extent;
  if (modelMatrix2 && modelMatrixInverse && extent && !viewport.isGeospatial) {
    transformedExtent = transformBox(extent, modelMatrix2);
  }
  return viewport.isGeospatial ? getOSMTileIndices(viewport, z, zRange, extent) : getIdentityTileIndices(viewport, z, tileSize, transformedExtent || DEFAULT_EXTENT, modelMatrixInverse);
}
function isURLTemplate(s) {
  return /(?=.*{z})(?=.*{x})(?=.*({y}|{-y}))/.test(s);
}
function isGeoBoundingBox(v) {
  return Number.isFinite(v.west) && Number.isFinite(v.north) && Number.isFinite(v.east) && Number.isFinite(v.south);
}

// dist/tileset-2d/memoize.js
function memoize2(compute) {
  let cachedArgs = {};
  let cachedResult;
  return (args) => {
    for (const key in args) {
      if (!isEqual2(args[key], cachedArgs[key])) {
        cachedResult = compute(args);
        cachedArgs = args;
        break;
      }
    }
    return cachedResult;
  };
}
function isEqual2(a, b) {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a)) {
    const len = a.length;
    if (!b || b.length !== len) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

// dist/tileset-2d/tileset-2d.js
var TILE_STATE_VISITED = 1;
var TILE_STATE_VISIBLE = 2;
var STRATEGY_NEVER = "never";
var STRATEGY_REPLACE = "no-overlap";
var STRATEGY_DEFAULT = "best-available";
var DEFAULT_CACHE_SCALE = 5;
var SELECTED_TILE_PRIORITY = 0;
var VISIBLE_TILE_PRIORITY = 1e8;
var MAX_TILE_DISTANCE_PRIORITY = VISIBLE_TILE_PRIORITY - SELECTED_TILE_PRIORITY - 1;
var STRATEGIES = {
  [STRATEGY_DEFAULT]: updateTileStateDefault,
  [STRATEGY_REPLACE]: updateTileStateReplace,
  [STRATEGY_NEVER]: () => {
  }
};
var DEFAULT_TILESET2D_PROPS = {
  extent: null,
  tileSize: 512,
  maxZoom: null,
  minZoom: null,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: "best-available",
  zRange: null,
  maxRequests: 6,
  debounceTime: 0,
  zoomOffset: 0,
  visibleMinZoom: null,
  visibleMaxZoom: null,
  // onTileLoad: (tile: Tile2DHeader) => void,  // onTileUnload: (tile: Tile2DHeader) => void,  // onTileError: (error: any, tile: Tile2DHeader) => void,  /** Called when all tiles in the current viewport are loaded. */
  // onViewportLoad: ((tiles: Tile2DHeader<DataT>[]) => void) | null,
  onTileLoad: () => {
  },
  onTileUnload: () => {
  },
  onTileError: () => {
  }
};
var Tileset2D = class {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor(opts) {
    this._getCullBounds = memoize2(getCullBounds);
    this.opts = { ...DEFAULT_TILESET2D_PROPS, ...opts };
    this.setOptions(this.opts);
    this.onTileLoad = (tile) => {
      var _a, _b;
      (_b = (_a = this.opts).onTileLoad) == null ? void 0 : _b.call(_a, tile);
      if (this.opts.maxCacheByteSize !== null) {
        this._cacheByteSize += tile.byteLength;
        this._resizeCache();
      }
    };
    this._requestScheduler = new import_loader_utils.RequestScheduler({
      throttleRequests: this.opts.maxRequests > 0 || this.opts.debounceTime > 0,
      maxRequests: this.opts.maxRequests,
      debounceTime: this.opts.debounceTime
    });
    this._cache = /* @__PURE__ */ new Map();
    this._tiles = [];
    this._dirty = false;
    this._cacheByteSize = 0;
    this._viewport = null;
    this._zRange = null;
    this._selectedTiles = null;
    this._frameNumber = 0;
    this._modelMatrix = new import_core43.Matrix4();
    this._modelMatrixInverse = new import_core43.Matrix4();
  }
  /* Public API */
  get tiles() {
    return this._tiles;
  }
  get selectedTiles() {
    return this._selectedTiles;
  }
  get isLoaded() {
    return this._selectedTiles !== null && this._selectedTiles.every((tile) => tile.isLoaded);
  }
  get needsReload() {
    return this._selectedTiles !== null && this._selectedTiles.some((tile) => tile.needsReload);
  }
  setOptions(opts) {
    Object.assign(this.opts, opts);
    if (Number.isFinite(opts.maxZoom)) {
      this._maxZoom = Math.floor(opts.maxZoom);
    }
    if (Number.isFinite(opts.minZoom)) {
      this._minZoom = Math.ceil(opts.minZoom);
    }
    this._viewport = null;
  }
  // Clean up any outstanding tile requests.
  finalize() {
    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        tile.abort();
      }
    }
    this._cache.clear();
    this._tiles = [];
    this._selectedTiles = null;
  }
  reloadAll() {
    for (const id of this._cache.keys()) {
      const tile = this._cache.get(id);
      if (!this._selectedTiles || !this._selectedTiles.includes(tile)) {
        this._cache.delete(id);
      } else {
        tile.setNeedsReload();
      }
    }
  }
  /**
   * Update the cache with the given viewport and model matrix and triggers callback onUpdate.
   */
  update(viewport, { zRange, modelMatrix: modelMatrix2 } = {
    zRange: null,
    modelMatrix: null
  }) {
    const modelMatrixAsMatrix4 = modelMatrix2 ? new import_core43.Matrix4(modelMatrix2) : new import_core43.Matrix4();
    const isModelMatrixNew = !modelMatrixAsMatrix4.equals(this._modelMatrix);
    if (!this._viewport || !viewport.equals(this._viewport) || !(0, import_core43.equals)(this._zRange, zRange) || isModelMatrixNew) {
      if (isModelMatrixNew) {
        this._modelMatrixInverse = modelMatrixAsMatrix4.clone().invert();
        this._modelMatrix = modelMatrixAsMatrix4;
      }
      this._viewport = viewport;
      this._zRange = zRange;
      const tileIndices = this.getTileIndices({
        viewport,
        maxZoom: this._maxZoom,
        minZoom: this._minZoom,
        zRange,
        modelMatrix: this._modelMatrix,
        modelMatrixInverse: this._modelMatrixInverse
      });
      this._selectedTiles = tileIndices.map((index) => this._getTile(index, true));
      if (this._dirty) {
        this._rebuildTree();
      }
    } else if (this.needsReload) {
      this._selectedTiles = this._selectedTiles.map((tile) => this._getTile(tile.index, true));
    }
    const changed = this.updateTileStates();
    this._pruneRequests();
    if (this._dirty) {
      this._resizeCache();
    }
    if (changed) {
      this._frameNumber++;
    }
    return this._frameNumber;
  }
  // eslint-disable-next-line complexity
  isTileVisible(tile, cullRect, modelMatrix2) {
    if (!tile.isVisible) {
      return false;
    }
    if (cullRect && this._viewport) {
      const boundsArr = this._getCullBounds({
        viewport: this._viewport,
        z: this._zRange,
        cullRect
      });
      let { bbox } = tile;
      for (const [minX, minY, maxX, maxY] of boundsArr) {
        let overlaps;
        if ("west" in bbox) {
          overlaps = bbox.west < maxX && bbox.east > minX && bbox.south < maxY && bbox.north > minY;
        } else {
          if (modelMatrix2 && !import_core43.Matrix4.IDENTITY.equals(modelMatrix2)) {
            const [left, top, right, bottom] = transformBox([bbox.left, bbox.top, bbox.right, bbox.bottom], modelMatrix2);
            bbox = { left, top, right, bottom };
          }
          const y0 = Math.min(bbox.top, bbox.bottom);
          const y1 = Math.max(bbox.top, bbox.bottom);
          overlaps = bbox.left < maxX && bbox.right > minX && y0 < maxY && y1 > minY;
        }
        if (overlaps) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
  /* Public interface for subclassing */
  /** Returns array of tile indices in the current viewport */
  getTileIndices({ viewport, maxZoom, minZoom, zRange, modelMatrix: modelMatrix2, modelMatrixInverse }) {
    const { tileSize, extent, zoomOffset, visibleMinZoom, visibleMaxZoom } = this.opts;
    return getTileIndices({
      viewport,
      maxZoom,
      minZoom,
      zRange,
      tileSize,
      extent,
      modelMatrix: modelMatrix2,
      modelMatrixInverse,
      zoomOffset,
      visibleMinZoom,
      visibleMaxZoom
    });
  }
  /** Returns unique string key for a tile index */
  getTileId(index) {
    return `${index.x}-${index.y}-${index.z}`;
  }
  /** Returns a zoom level for a tile index */
  getTileZoom(index) {
    return index.z;
  }
  /** Returns additional metadata to add to tile, bbox by default */
  getTileMetadata(index) {
    const { tileSize } = this.opts;
    return { bbox: tileToBoundingBox(this._viewport, index.x, index.y, index.z, tileSize) };
  }
  /** Returns index of the parent tile */
  getParentIndex(index) {
    const x = Math.floor(index.x / 2);
    const y = Math.floor(index.y / 2);
    const z = index.z - 1;
    return { x, y, z };
  }
  // Returns true if any tile's visibility changed
  updateTileStates() {
    const refinementStrategy = this.opts.refinementStrategy || STRATEGY_DEFAULT;
    const visibilities = new Array(this._cache.size);
    let i = 0;
    for (const tile of this._cache.values()) {
      visibilities[i++] = tile.isVisible;
      tile.isSelected = false;
      tile.isVisible = false;
    }
    for (const tile of this._selectedTiles) {
      tile.isSelected = true;
      tile.isVisible = true;
    }
    (typeof refinementStrategy === "function" ? refinementStrategy : STRATEGIES[refinementStrategy])(Array.from(this._cache.values()));
    i = 0;
    for (const tile of this._cache.values()) {
      if (visibilities[i++] !== tile.isVisible) {
        return true;
      }
    }
    return false;
  }
  _getRequestPriority(tile) {
    if (!tile.isSelected && !tile.isVisible) {
      return -1;
    }
    const distance2 = this._getTileDistancePriority(tile);
    if (tile.isSelected) {
      return SELECTED_TILE_PRIORITY + distance2;
    }
    return VISIBLE_TILE_PRIORITY + distance2;
  }
  _getTileDistancePriority(tile) {
    const { width, height } = this._viewport || {};
    if (!this._viewport || !width || !height) {
      return 0;
    }
    try {
      const points = this._getTileScreenCorners(tile.bbox);
      const center = [width / 2, height / 2];
      if (points.length === 4) {
        if (this._isPointInPolygon(center, points)) {
          return 0;
        }
        const distance2 = points.reduce((minDistance, point, i) => {
          const nextPoint = points[(i + 1) % points.length];
          return Math.min(minDistance, this._getPointToSegmentDistanceSquared(center, point, nextPoint));
        }, Number.MAX_SAFE_INTEGER);
        return Math.min(distance2, MAX_TILE_DISTANCE_PRIORITY);
      }
    } catch {
    }
    return MAX_TILE_DISTANCE_PRIORITY;
  }
  _getTileScreenCorners(bbox) {
    const coordinates = "west" in bbox ? [
      [bbox.west, bbox.south],
      [bbox.east, bbox.south],
      [bbox.east, bbox.north],
      [bbox.west, bbox.north]
    ] : [
      [bbox.left, bbox.top],
      [bbox.right, bbox.top],
      [bbox.right, bbox.bottom],
      [bbox.left, bbox.bottom]
    ];
    return coordinates.map((coordinate) => this._viewport.project(coordinate)).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  }
  _isPointInPolygon(point, polygon) {
    let inside = false;
    const [x, y] = point;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }
  _getPointToSegmentDistanceSquared(point, segmentStart, segmentEnd) {
    const [x, y] = point;
    const [x1, y1] = segmentStart;
    const [x2, y2] = segmentEnd;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared)) : 0;
    const segmentX = x1 + t * dx;
    const segmentY = y1 + t * dy;
    const distanceX = x - segmentX;
    const distanceY = y - segmentY;
    return distanceX * distanceX + distanceY * distanceY;
  }
  _pruneRequests() {
    const { maxRequests = 0 } = this.opts;
    const abortCandidates = [];
    let ongoingRequestCount = 0;
    for (const tile of this._cache.values()) {
      if (tile.isLoading) {
        ongoingRequestCount++;
        if (!tile.isSelected && !tile.isVisible) {
          abortCandidates.push(tile);
        }
      }
    }
    while (maxRequests > 0 && ongoingRequestCount > maxRequests && abortCandidates.length > 0) {
      const tile = abortCandidates.shift();
      tile.abort();
      ongoingRequestCount--;
    }
  }
  // This needs to be called every time some tiles have been added/removed from cache
  _rebuildTree() {
    const { _cache } = this;
    for (const tile of _cache.values()) {
      tile.parent = null;
      if (tile.children) {
        tile.children.length = 0;
      }
    }
    for (const tile of _cache.values()) {
      const parent = this._getNearestAncestor(tile);
      tile.parent = parent;
      if (parent == null ? void 0 : parent.children) {
        parent.children.push(tile);
      }
    }
  }
  /**
   * Clear tiles that are not visible when the cache is full
   */
  /* eslint-disable complexity */
  _resizeCache() {
    var _a, _b;
    const { _cache, opts } = this;
    const maxCacheSize = opts.maxCacheSize ?? // @ts-expect-error called only when selectedTiles is initialized
    (opts.maxCacheByteSize !== null ? Infinity : DEFAULT_CACHE_SCALE * this.selectedTiles.length);
    const maxCacheByteSize = opts.maxCacheByteSize ?? Infinity;
    const overflown = _cache.size > maxCacheSize || this._cacheByteSize > maxCacheByteSize;
    if (overflown) {
      for (const [id, tile] of _cache) {
        if (!tile.isVisible && !tile.isSelected) {
          this._cacheByteSize -= opts.maxCacheByteSize !== null ? tile.byteLength : 0;
          _cache.delete(id);
          (_b = (_a = this.opts).onTileUnload) == null ? void 0 : _b.call(_a, tile);
        }
        if (_cache.size <= maxCacheSize && this._cacheByteSize <= maxCacheByteSize) {
          break;
        }
      }
      this._rebuildTree();
      this._dirty = true;
    }
    if (this._dirty) {
      this._tiles = Array.from(this._cache.values()).sort((t1, t2) => t1.zoom - t2.zoom);
      this._dirty = false;
    }
  }
  _getTile(index, create) {
    const id = this.getTileId(index);
    let tile = this._cache.get(id);
    let needsReload = false;
    if (!tile && create) {
      tile = new Tile2DHeader(index);
      Object.assign(tile, this.getTileMetadata(tile.index));
      Object.assign(tile, { id, zoom: this.getTileZoom(tile.index) });
      needsReload = true;
      this._cache.set(id, tile);
      this._dirty = true;
    } else if (tile && tile.needsReload) {
      needsReload = true;
    }
    if (tile && needsReload) {
      tile.loadData({
        getData: this.opts.getTileData,
        getRequestPriority: this._getRequestPriority.bind(this),
        requestScheduler: this._requestScheduler,
        onLoad: this.onTileLoad,
        onError: this.opts.onTileError
      });
    }
    return tile;
  }
  _getNearestAncestor(tile) {
    const { _minZoom = 0 } = this;
    let index = tile.index;
    while (this.getTileZoom(index) > _minZoom) {
      index = this.getParentIndex(index);
      const parent = this._getTile(index);
      if (parent) {
        return parent;
      }
    }
    return null;
  }
};
function updateTileStateDefault(allTiles) {
  for (const tile of allTiles) {
    tile.state = 0;
  }
  for (const tile of allTiles) {
    if (tile.isSelected && !getPlaceholderInAncestors(tile)) {
      getPlaceholderInChildren(tile);
    }
  }
  for (const tile of allTiles) {
    tile.isVisible = Boolean(tile.state & TILE_STATE_VISIBLE);
  }
}
function updateTileStateReplace(allTiles) {
  for (const tile of allTiles) {
    tile.state = 0;
  }
  for (const tile of allTiles) {
    if (tile.isSelected) {
      getPlaceholderInAncestors(tile);
    }
  }
  const sortedTiles = Array.from(allTiles).sort((t1, t2) => t1.zoom - t2.zoom);
  for (const tile of sortedTiles) {
    tile.isVisible = Boolean(tile.state & TILE_STATE_VISIBLE);
    if (tile.children && (tile.isVisible || tile.state & TILE_STATE_VISITED)) {
      for (const child of tile.children) {
        child.state = TILE_STATE_VISITED;
      }
    } else if (tile.isSelected) {
      getPlaceholderInChildren(tile);
    }
  }
}
function getPlaceholderInAncestors(startTile) {
  let tile = startTile;
  while (tile) {
    if (tile.isLoaded || tile.content) {
      tile.state |= TILE_STATE_VISIBLE;
      return true;
    }
    tile = tile.parent;
  }
  return false;
}
function getPlaceholderInChildren(tile) {
  for (const child of tile.children) {
    if (child.isLoaded || child.content) {
      child.state |= TILE_STATE_VISIBLE;
    } else {
      getPlaceholderInChildren(child);
    }
  }
}

// dist/tile-layer/tile-layer.js
var import_core45 = require("@math.gl/core");
var defaultProps21 = {
  TilesetClass: Tileset2D,
  data: { type: "data", value: [] },
  dataComparator: urlType.equal,
  renderSubLayers: { type: "function", value: (props) => new GeoJsonLayer(props) },
  getTileData: { type: "function", optional: true, value: null },
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoad: { type: "function", optional: true, value: null },
  onTileLoad: { type: "function", value: (tile) => {
  } },
  onTileUnload: { type: "function", value: (tile) => {
  } },
  // eslint-disable-next-line
  onTileError: { type: "function", value: (err) => console.error(err) },
  extent: { type: "array", optional: true, value: null, compare: true },
  tileSize: 512,
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
  maxCacheByteSize: null,
  refinementStrategy: STRATEGY_DEFAULT,
  zRange: null,
  maxRequests: 6,
  debounceTime: 0,
  zoomOffset: 0,
  visibleMinZoom: null,
  visibleMaxZoom: null
};
var TileLayer = class extends CompositeLayer {
  initializeState() {
    this.state = {
      tileset: null,
      isLoaded: false
    };
  }
  finalizeState() {
    var _a, _b;
    (_b = (_a = this.state) == null ? void 0 : _a.tileset) == null ? void 0 : _b.finalize();
  }
  get isLoaded() {
    var _a, _b, _c;
    return Boolean((_c = (_b = (_a = this.state) == null ? void 0 : _a.tileset) == null ? void 0 : _b.selectedTiles) == null ? void 0 : _c.every((tile) => (
      // Error / empty tiles resolve to `content === null`. Once Tile2DHeader marks those
      // requests as loaded, do not wait for generated sublayers because there is nothing to
      // render for that tile and `tile.layers` will remain null.
      tile.isLoaded && (!tile.content || !tile.layers || tile.layers.every((layer) => layer.isLoaded))
    )));
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  updateState({ changeFlags }) {
    let { tileset } = this.state;
    const propsChanged = changeFlags.propsOrDataChanged || changeFlags.updateTriggersChanged;
    const dataChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData);
    if (!tileset) {
      tileset = new this.props.TilesetClass(this._getTilesetOptions());
      this.setState({ tileset });
    } else if (propsChanged) {
      tileset.setOptions(this._getTilesetOptions());
      if (dataChanged) {
        tileset.reloadAll();
      } else {
        tileset.tiles.forEach((tile) => {
          tile.layers = null;
        });
      }
    }
    this._updateTileset();
  }
  _getTilesetOptions() {
    const { tileSize, maxCacheSize, maxCacheByteSize, refinementStrategy, extent, maxZoom, minZoom, maxRequests, debounceTime, zoomOffset, visibleMinZoom, visibleMaxZoom } = this.props;
    return {
      maxCacheSize,
      maxCacheByteSize,
      maxZoom,
      minZoom,
      tileSize,
      refinementStrategy,
      extent,
      maxRequests,
      debounceTime,
      zoomOffset,
      visibleMinZoom,
      visibleMaxZoom,
      getTileData: this.getTileData.bind(this),
      onTileLoad: this._onTileLoad.bind(this),
      onTileError: this._onTileError.bind(this),
      onTileUnload: this._onTileUnload.bind(this)
    };
  }
  _updateTileset() {
    const tileset = this.state.tileset;
    const { zRange, modelMatrix: modelMatrix2 } = this.props;
    const frameNumber = tileset.update(this.context.viewport, { zRange, modelMatrix: modelMatrix2 });
    const { isLoaded } = tileset;
    const loadingStateChanged = this.state.isLoaded !== isLoaded;
    const tilesetChanged = this.state.frameNumber !== frameNumber;
    if (isLoaded && (loadingStateChanged || tilesetChanged)) {
      this._onViewportLoad();
    }
    if (tilesetChanged) {
      this.setState({ frameNumber });
    }
    this.state.isLoaded = isLoaded;
  }
  _onViewportLoad() {
    const { tileset } = this.state;
    const { onViewportLoad } = this.props;
    if (onViewportLoad) {
      onViewportLoad(tileset.selectedTiles);
    }
  }
  _onTileLoad(tile) {
    this.props.onTileLoad(tile);
    tile.layers = null;
    this.setNeedsUpdate();
  }
  _onTileError(error, tile) {
    this.props.onTileError(error);
    tile.layers = null;
    this.setNeedsUpdate();
  }
  _onTileUnload(tile) {
    this.props.onTileUnload(tile);
  }
  // Methods for subclass to override
  getTileData(tile) {
    const { data, getTileData, fetch } = this.props;
    const { signal } = tile;
    tile.url = typeof data === "string" || Array.isArray(data) ? getURLFromTemplate(data, tile) : null;
    if (getTileData) {
      return getTileData(tile);
    }
    if (fetch && tile.url) {
      return fetch(tile.url, { propName: "data", layer: this, signal });
    }
    return null;
  }
  renderSubLayers(props) {
    return this.props.renderSubLayers(props);
  }
  getSubLayerPropsByTile(tile) {
    return null;
  }
  getPickingInfo(params) {
    const sourceLayer = params.sourceLayer;
    const sourceTile = sourceLayer.props.tile;
    const info = params.info;
    if (info.picked) {
      info.tile = sourceTile;
    }
    info.sourceTile = sourceTile;
    info.sourceTileSubLayer = sourceLayer;
    return info;
  }
  _updateAutoHighlight(info) {
    info.sourceTileSubLayer.updateAutoHighlight(info);
  }
  renderLayers() {
    const { visibleMinZoom, visibleMaxZoom, minZoom, extent } = this.props;
    const zoom = this.context.viewport.zoom;
    const hidden = visibleMinZoom != null && zoom < visibleMinZoom || visibleMaxZoom != null && zoom > visibleMaxZoom || minZoom != null && !extent && zoom < minZoom;
    if (hidden) {
      for (const tile of this.state.tileset.tiles) {
        tile.layers = null;
      }
      return [];
    }
    return this.state.tileset.tiles.map((tile) => {
      const subLayerProps = this.getSubLayerPropsByTile(tile);
      if (!tile.isLoaded && !tile.content) {
      } else if (!tile.layers) {
        const layers = this.renderSubLayers({
          ...this.props,
          ...this.getSubLayerProps({
            id: tile.id,
            updateTriggers: this.props.updateTriggers
          }),
          data: tile.content,
          _offset: 0,
          tile
        });
        tile.layers = flatten(layers, Boolean).map((layer) => layer.clone({
          tile,
          ...subLayerProps
        }));
      } else if (subLayerProps && tile.layers[0] && Object.keys(subLayerProps).some((propName) => tile.layers[0].props[propName] !== subLayerProps[propName])) {
        tile.layers = tile.layers.map((layer) => layer.clone(subLayerProps));
      }
      return tile.layers;
    });
  }
  filterSubLayer({ layer, cullRect }) {
    const { tile } = layer.props;
    const { modelMatrix: modelMatrix2 } = this.props;
    return this.state.tileset.isTileVisible(tile, cullRect, modelMatrix2 ? new import_core45.Matrix4(modelMatrix2) : null);
  }
};
TileLayer.defaultProps = defaultProps21;
TileLayer.layerName = "TileLayer";
var tile_layer_default = TileLayer;

// dist/trips-layer/trips-layer-uniforms.js
var uniformBlockWGSL7 = null;
var uniformBlockGLSL3 = `layout(std140) uniform tripsUniforms {
  bool fadeTrail;
  float trailLength;
  float currentTime;
} trips;
`;
var tripsUniforms = {
  name: "trips",
  source: uniformBlockWGSL7,
  vs: uniformBlockGLSL3,
  fs: uniformBlockGLSL3,
  uniformTypes: {
    fadeTrail: "f32",
    trailLength: "f32",
    currentTime: "f32"
  }
};

// dist/trips-layer/trips-layer.wgsl.js
var packTripTimestamps = () => null;

// dist/trips-layer/trips-layer.js
var defaultProps22 = {
  fadeTrail: true,
  trailLength: { type: "number", value: 120, min: 0 },
  currentTime: { type: "number", value: 0, min: 0 },
  getTimestamps: { type: "accessor", value: (d) => d.timestamps }
};
var tripsShaderInjectionsGLSL = {
  "vs:#decl": `in float instanceTimestamps;
in float instanceNextTimestamps;
out float vTime;
`,
  // Timestamp of the vertex
  "vs:#main-end": `vTime = instanceTimestamps + (instanceNextTimestamps - instanceTimestamps) * vPathPosition.y / vPathLength;
`,
  "fs:#decl": `in float vTime;
`,
  // Drop segments only after PathLayer evaluates analytic-coverage derivatives, then
  // fade the color (currentTime - 100%, end of trail - 0%).
  "fs:DECKGL_FILTER_COLOR": `if(vTime > trips.currentTime || (trips.fadeTrail && (vTime < trips.currentTime - trips.trailLength))) {
  discard;
}
if(trips.fadeTrail) {
  color.a *= 1.0 - (trips.currentTime - vTime) / trips.trailLength;
}
`
};
var TripsLayer = class extends PathLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.inject = tripsShaderInjectionsGLSL;
    shaders.modules = [...shaders.modules, tripsUniforms];
    return shaders;
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      ...{
        timestamps: {
          size: 1,
          accessor: "getTimestamps",
          shaderAttributes: {
            instanceTimestamps: {
              vertexOffset: 0
            },
            instanceNextTimestamps: {
              vertexOffset: 1
            }
          }
        }
      }
    });
  }
  /** Materialize timestamps in the same per-path instance layout as the path tessellator. */
  calculateWebGPUTimestamps(attribute, { data, props }) {
    var _a;
    const { pathTesselator } = this.state;
    const { instanceCount, vertexStarts } = pathTesselator;
    const packedTimestamps = new Float32Array(instanceCount * 2);
    const { iterable, objectInfo } = createIterable(data);
    for (const object of iterable) {
      objectInfo.index++;
      const vertexStart = vertexStarts[objectInfo.index];
      const vertexEnd = vertexStarts[objectInfo.index + 1] ?? instanceCount;
      if (vertexEnd <= vertexStart) {
        continue;
      }
      const timestamps = ((_a = props.getTimestamps) == null ? void 0 : _a.call(props, object, objectInfo)) ?? [];
      packedTimestamps.set(packTripTimestamps(timestamps, vertexEnd - vertexStart, props._pathType === "loop"), vertexStart * 2);
    }
    attribute.startIndices = vertexStarts;
    attribute.value = packedTimestamps;
  }
  draw(params) {
    const { fadeTrail, trailLength, currentTime } = this.props;
    const tripsProps = { fadeTrail, trailLength, currentTime };
    const model = this.state.model;
    model.shaderInputs.setProps({ trips: tripsProps });
    super.draw(params);
  }
};
TripsLayer.layerName = "TripsLayer";
TripsLayer.defaultProps = defaultProps22;
var trips_layer_default = TripsLayer;

// dist/h3-layers/h3-cluster-layer.js
var import_h3_js3 = require("h3-js");

// dist/h3-layers/h3-hexagon-layer.js
var import_h3_js2 = require("h3-js");
var UPDATE_THRESHOLD_KM = 10;
function mergeTriggers(getHexagon, coverage) {
  let trigger;
  if (getHexagon === void 0 || getHexagon === null) {
    trigger = coverage;
  } else if (typeof getHexagon === "object") {
    trigger = { ...getHexagon, coverage };
  } else {
    trigger = { getHexagon, coverage };
  }
  return trigger;
}
var defaultProps23 = {
  ...PolygonLayer.defaultProps,
  highPrecision: "auto",
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  centerHexagon: null,
  getHexagon: { type: "accessor", value: (x) => x.hexagon },
  extruded: true
};
var H3HexagonLayer = class _H3HexagonLayer extends CompositeLayer {
  initializeState() {
    _H3HexagonLayer._checkH3Lib();
    this.state = {
      edgeLengthKM: 0,
      resolution: -1
    };
  }
  shouldUpdateState({ changeFlags }) {
    return this._shouldUseHighPrecision() ? changeFlags.propsOrDataChanged : changeFlags.somethingChanged;
  }
  updateState({ props, changeFlags }) {
    if (props.highPrecision !== true && (changeFlags.dataChanged || changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagon)) {
      const dataProps = this._calculateH3DataProps();
      this.setState(dataProps);
    }
    this._updateVertices(this.context.viewport);
  }
  _calculateH3DataProps() {
    let resolution = -1;
    let hasPentagon = false;
    let hasMultipleRes = false;
    const { iterable, objectInfo } = createIterable(this.props.data);
    for (const object of iterable) {
      objectInfo.index++;
      const hexId = this.props.getHexagon(object, objectInfo);
      const hexResolution = (0, import_h3_js2.getResolution)(hexId);
      if (resolution < 0) {
        resolution = hexResolution;
        if (!this.props.highPrecision)
          break;
      } else if (resolution !== hexResolution) {
        hasMultipleRes = true;
        break;
      }
      if ((0, import_h3_js2.isPentagon)(hexId)) {
        hasPentagon = true;
        break;
      }
    }
    return {
      resolution,
      edgeLengthKM: resolution >= 0 ? (0, import_h3_js2.getHexagonEdgeLengthAvg)(resolution, "km") : 0,
      hasMultipleRes,
      hasPentagon
    };
  }
  _shouldUseHighPrecision() {
    if (this.props.highPrecision === "auto") {
      const { resolution, hasPentagon, hasMultipleRes } = this.state;
      const { viewport } = this.context;
      return Boolean(viewport == null ? void 0 : viewport.resolution) || hasMultipleRes || hasPentagon || resolution >= 0 && resolution <= 5;
    }
    return this.props.highPrecision;
  }
  _updateVertices(viewport) {
    if (this._shouldUseHighPrecision()) {
      return;
    }
    const { resolution, edgeLengthKM, centerHex } = this.state;
    if (resolution < 0) {
      return;
    }
    const hex = this.props.centerHexagon || (0, import_h3_js2.latLngToCell)(viewport.latitude, viewport.longitude, resolution);
    if (centerHex === hex) {
      return;
    }
    if (centerHex) {
      try {
        const distance2 = (0, import_h3_js2.gridDistance)(centerHex, hex);
        if (distance2 * edgeLengthKM < UPDATE_THRESHOLD_KM) {
          return;
        }
      } catch {
      }
    }
    const { unitsPerMeter: unitsPerMeter2 } = viewport.distanceScales;
    let vertices = h3ToPolygon(hex);
    const [centerLat, centerLng] = (0, import_h3_js2.cellToLatLng)(hex);
    const [centerX, centerY] = viewport.projectFlat([centerLng, centerLat]);
    vertices = vertices.map((p) => {
      const worldPosition = viewport.projectFlat(p);
      return [
        (worldPosition[0] - centerX) / unitsPerMeter2[0],
        (worldPosition[1] - centerY) / unitsPerMeter2[1]
      ];
    });
    this.setState({ centerHex: hex, vertices });
  }
  renderLayers() {
    return this._shouldUseHighPrecision() ? this._renderPolygonLayer() : this._renderColumnLayer();
  }
  _getForwardProps() {
    const { elevationScale, material, coverage, extruded, wireframe, stroked, filled, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, getFillColor, getElevation, getLineColor, getLineWidth, transitions, updateTriggers } = this.props;
    return {
      elevationScale,
      extruded,
      coverage,
      wireframe,
      stroked,
      filled,
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      material,
      getElevation,
      getFillColor,
      getLineColor,
      getLineWidth,
      transitions,
      updateTriggers: {
        getFillColor: updateTriggers.getFillColor,
        getElevation: updateTriggers.getElevation,
        getLineColor: updateTriggers.getLineColor,
        getLineWidth: updateTriggers.getLineWidth
      }
    };
  }
  _renderPolygonLayer() {
    const { data, getHexagon, updateTriggers, coverage } = this.props;
    const SubLayerClass = this.getSubLayerClass("hexagon-cell-hifi", PolygonLayer);
    const forwardProps2 = this._getForwardProps();
    forwardProps2.updateTriggers.getPolygon = mergeTriggers(updateTriggers.getHexagon, coverage);
    return new SubLayerClass(forwardProps2, this.getSubLayerProps({
      id: "hexagon-cell-hifi",
      updateTriggers: forwardProps2.updateTriggers
    }), {
      data,
      _normalize: false,
      _windingOrder: "CCW",
      positionFormat: "XY",
      getPolygon: (object, objectInfo) => {
        const hexagonId = getHexagon(object, objectInfo);
        return flattenPolygon(h3ToPolygon(hexagonId, coverage));
      }
    });
  }
  _renderColumnLayer() {
    const { data, getHexagon, updateTriggers } = this.props;
    const SubLayerClass = this.getSubLayerClass("hexagon-cell", ColumnLayer);
    const forwardProps2 = this._getForwardProps();
    forwardProps2.updateTriggers.getPosition = updateTriggers.getHexagon;
    return new SubLayerClass(forwardProps2, this.getSubLayerProps({
      id: "hexagon-cell",
      flatShading: true,
      updateTriggers: forwardProps2.updateTriggers
    }), {
      data,
      diskResolution: 6,
      // generate an extruded hexagon as the base geometry
      radius: 1,
      vertices: this.state.vertices,
      getPosition: getHexagonCentroid.bind(null, getHexagon)
    });
  }
};
H3HexagonLayer.defaultProps = defaultProps23;
H3HexagonLayer.layerName = "H3HexagonLayer";
H3HexagonLayer._checkH3Lib = () => {
};
var h3_hexagon_layer_default = H3HexagonLayer;

// dist/h3-layers/h3-cluster-layer.js
var defaultProps24 = {
  getHexagons: { type: "accessor", value: (d) => d.hexagons }
};
var H3ClusterLayer = class extends GeoCellLayer_default {
  initializeState() {
    h3_hexagon_layer_default._checkH3Lib();
  }
  updateState({ props, changeFlags }) {
    if (changeFlags.dataChanged || changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getHexagons) {
      const { data, getHexagons } = props;
      const polygons = [];
      const { iterable, objectInfo } = createIterable(data);
      for (const object of iterable) {
        objectInfo.index++;
        const hexagons = getHexagons(object, objectInfo);
        const multiPolygon = (0, import_h3_js3.cellsToMultiPolygon)(hexagons, true);
        for (const polygon of multiPolygon) {
          for (const ring of polygon) {
            normalizeLongitudes(ring);
          }
          polygons.push(this.getSubLayerRow({ polygon }, object, objectInfo.index));
        }
      }
      this.setState({ polygons });
    }
  }
  indexToBounds() {
    const { getElevation, getFillColor, getLineColor, getLineWidth } = this.props;
    return {
      data: this.state.polygons,
      getPolygon: (d) => d.polygon,
      getElevation: this.getSubLayerAccessor(getElevation),
      getFillColor: this.getSubLayerAccessor(getFillColor),
      getLineColor: this.getSubLayerAccessor(getLineColor),
      getLineWidth: this.getSubLayerAccessor(getLineWidth)
    };
  }
};
H3ClusterLayer.layerName = "H3ClusterLayer";
H3ClusterLayer.defaultProps = defaultProps24;
var h3_cluster_layer_default = H3ClusterLayer;

// dist/tile-3d-layer/tile-3d-layer.js
var import_engine19 = require("@luma.gl/engine");

// ../mesh-layers/src/simple-mesh-layer/simple-mesh-layer.ts
var import_core51 = require("@luma.gl/core");
var import_engine16 = require("@luma.gl/engine");

// ../mesh-layers/src/utils/matrix.ts
var RADIAN_PER_DEGREE = Math.PI / 180;
var modelMatrix = new Float32Array(16);
var valueArray = new Float32Array(12);
function calculateTransformMatrix(targetMatrix, orientation, scale) {
  const pitch = orientation[0] * RADIAN_PER_DEGREE;
  const yaw = orientation[1] * RADIAN_PER_DEGREE;
  const roll = orientation[2] * RADIAN_PER_DEGREE;
  const sr = Math.sin(roll);
  const sp = Math.sin(pitch);
  const sw = Math.sin(yaw);
  const cr = Math.cos(roll);
  const cp = Math.cos(pitch);
  const cw = Math.cos(yaw);
  const scx = scale[0];
  const scy = scale[1];
  const scz = scale[2];
  targetMatrix[0] = scx * cw * cp;
  targetMatrix[1] = scx * sw * cp;
  targetMatrix[2] = scx * -sp;
  targetMatrix[3] = scy * (-sw * cr + cw * sp * sr);
  targetMatrix[4] = scy * (cw * cr + sw * sp * sr);
  targetMatrix[5] = scy * cp * sr;
  targetMatrix[6] = scz * (sw * sr + cw * sp * cr);
  targetMatrix[7] = scz * (-cw * sr + sw * sp * cr);
  targetMatrix[8] = scz * cp * cr;
}
function getExtendedMat3FromMat4(mat43) {
  mat43[0] = mat43[0];
  mat43[1] = mat43[1];
  mat43[2] = mat43[2];
  mat43[3] = mat43[4];
  mat43[4] = mat43[5];
  mat43[5] = mat43[6];
  mat43[6] = mat43[8];
  mat43[7] = mat43[9];
  mat43[8] = mat43[10];
  mat43[9] = mat43[12];
  mat43[10] = mat43[13];
  mat43[11] = mat43[14];
  return mat43.subarray(0, 12);
}
var MATRIX_ATTRIBUTES = {
  size: 12,
  accessor: ["getOrientation", "getScale", "getTranslation", "getTransformMatrix"],
  shaderAttributes: {
    instanceModelMatrixCol0: {
      size: 3,
      elementOffset: 0
    },
    instanceModelMatrixCol1: {
      size: 3,
      elementOffset: 3
    },
    instanceModelMatrixCol2: {
      size: 3,
      elementOffset: 6
    },
    instanceTranslation: {
      size: 3,
      elementOffset: 9
    }
  },
  update(attribute, { startRow, endRow }) {
    const { data, getOrientation, getScale: getScale2, getTranslation, getTransformMatrix } = this.props;
    const arrayMatrix = Array.isArray(getTransformMatrix);
    const constantMatrix = arrayMatrix && getTransformMatrix.length === 16;
    const constantScale = Array.isArray(getScale2);
    const constantOrientation = Array.isArray(getOrientation);
    const constantTranslation = Array.isArray(getTranslation);
    const hasMatrix = constantMatrix || !arrayMatrix && Boolean(getTransformMatrix(data[0]));
    if (hasMatrix) {
      attribute.constant = constantMatrix;
    } else {
      attribute.constant = constantOrientation && constantScale && constantTranslation;
    }
    const instanceModelMatrixData = attribute.value;
    if (attribute.constant) {
      let matrix;
      if (hasMatrix) {
        modelMatrix.set(getTransformMatrix);
        matrix = getExtendedMat3FromMat4(modelMatrix);
      } else {
        matrix = valueArray;
        const orientation = getOrientation;
        const scale = getScale2;
        calculateTransformMatrix(matrix, orientation, scale);
        matrix.set(getTranslation, 9);
      }
      attribute.value = new Float32Array(matrix);
    } else {
      let i = startRow * attribute.size;
      const { iterable, objectInfo } = createIterable(data, startRow, endRow);
      for (const object of iterable) {
        objectInfo.index++;
        let matrix;
        if (hasMatrix) {
          modelMatrix.set(
            constantMatrix ? getTransformMatrix : getTransformMatrix(object, objectInfo)
          );
          matrix = getExtendedMat3FromMat4(modelMatrix);
        } else {
          matrix = valueArray;
          const orientation = constantOrientation ? getOrientation : getOrientation(object, objectInfo);
          const scale = constantScale ? getScale2 : getScale2(object, objectInfo);
          calculateTransformMatrix(matrix, orientation, scale);
          matrix.set(constantTranslation ? getTranslation : getTranslation(object, objectInfo), 9);
        }
        instanceModelMatrixData[i++] = matrix[0];
        instanceModelMatrixData[i++] = matrix[1];
        instanceModelMatrixData[i++] = matrix[2];
        instanceModelMatrixData[i++] = matrix[3];
        instanceModelMatrixData[i++] = matrix[4];
        instanceModelMatrixData[i++] = matrix[5];
        instanceModelMatrixData[i++] = matrix[6];
        instanceModelMatrixData[i++] = matrix[7];
        instanceModelMatrixData[i++] = matrix[8];
        instanceModelMatrixData[i++] = matrix[9];
        instanceModelMatrixData[i++] = matrix[10];
        instanceModelMatrixData[i++] = matrix[11];
      }
    }
  }
};
function shouldComposeModelMatrix(viewport, coordinateSystem) {
  return coordinateSystem === "cartesian" || coordinateSystem === "meter-offsets" || coordinateSystem === "default" && !viewport.isGeospatial;
}

// ../mesh-layers/src/simple-mesh-layer/simple-mesh-layer-uniforms.ts
var uniformBlockWGSL8 = (
  /* wgsl */
  `struct SimpleMeshUniforms {
  sizeScale: f32,
  composeModelMatrix: f32,
  hasTexture: f32,
  flatShading: f32,
};

@group(0) @binding(auto) var<uniform> simpleMesh: SimpleMeshUniforms;
@group(0) @binding(auto) var simpleMeshTexture: texture_2d<f32>;
@group(0) @binding(auto) var simpleMeshTextureSampler: sampler;
`
);
var uniformBlockGLSL4 = `layout(std140) uniform simpleMeshUniforms {
  float sizeScale;
  bool composeModelMatrix;
  bool hasTexture;
  bool flatShading;
} simpleMesh;
`;
var simpleMeshUniforms = {
  name: "simpleMesh",
  source: uniformBlockWGSL8,
  vs: uniformBlockGLSL4,
  fs: uniformBlockGLSL4,
  uniformTypes: {
    sizeScale: "f32",
    composeModelMatrix: "f32",
    hasTexture: "f32",
    flatShading: "f32"
  }
};

// ../mesh-layers/src/simple-mesh-layer/simple-mesh-layer-vertex.glsl.ts
var simple_mesh_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME simple-mesh-layer-vs

// Primitive attributes
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;

// Instance attributes
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
in vec3 instanceTranslation;

// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = texCoords;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  vTexCoord = texCoords;
  cameraPosition = project.cameraPosition;
  vColor = vec4(colors * instanceColors.rgb, instanceColors.a);

  mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);
  vec3 pos = (instanceModelMatrix * positions) * simpleMesh.sizeScale + instanceTranslation;

  if (simpleMesh.composeModelMatrix) {
    DECKGL_FILTER_SIZE(pos, geometry);
    // using instancePositions as world coordinates
    // when using globe mode, this branch does not re-orient the model to align with the surface of the earth
    // call project_normal before setting position to avoid rotation
    normals_commonspace = project_normal(instanceModelMatrix * normals);
    geometry.worldPosition += pos;
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), position_commonspace);
    geometry.position = position_commonspace;
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, position_commonspace);
    geometry.position = position_commonspace;
    normals_commonspace = project_normal(instanceModelMatrix * normals);
  }

  geometry.normal = normals_commonspace;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// ../mesh-layers/src/simple-mesh-layer/simple-mesh-layer-fragment.glsl.ts
var simple_mesh_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME simple-mesh-layer-fs

precision highp float;

uniform sampler2D sampler;

in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;

out vec4 fragColor;

void main(void) {
  geometry.uv = vTexCoord;

  vec3 normal;
  if (simpleMesh.flatShading) {

  normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
  } else {
    normal = normals_commonspace;
  }

  vec4 color = simpleMesh.hasTexture ? texture(sampler, vTexCoord) : vColor;
  DECKGL_FILTER_COLOR(color, geometry);

  vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
  fragColor = vec4(lightColor, color.a * layer.opacity);
}
`;

// ../mesh-layers/src/simple-mesh-layer/simple-mesh-layer.wgsl.ts
var simple_mesh_layer_wgsl_default = (
  /* wgsl */
  `struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) colors: vec3<f32>,
  @location(3) texCoords: vec2<f32>,
  @location(4) instancePositions: vec3<f32>,
  @location(5) instancePositions64Low: vec3<f32>,
  @location(6) instanceColors: vec4<f32>,
  @location(7) instanceModelMatrixCol0: vec3<f32>,
  @location(8) instanceModelMatrixCol1: vec3<f32>,
  @location(9) instanceModelMatrixCol2: vec3<f32>,
  @location(10) instanceTranslation: vec3<f32>,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) texCoords: vec2<f32>,
  @location(2) normal: vec3<f32>,
  @location(3) positionCommon: vec3<f32>,
  @location(4) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;
  geometry.uv = attributes.texCoords;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  let instanceModelMatrix = mat3x3<f32>(
    attributes.instanceModelMatrixCol0,
    attributes.instanceModelMatrixCol1,
    attributes.instanceModelMatrixCol2
  );
  let meshPosition =
    (instanceModelMatrix * attributes.positions) * simpleMesh.sizeScale +
    attributes.instanceTranslation;

  if (simpleMesh.composeModelMatrix > 0.5) {
    geometry.normal = project_normal(instanceModelMatrix * attributes.normals);
    geometry.worldPosition += meshPosition;
    let projected = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions + meshPosition,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    geometry.position = projected.commonPosition;
    varyings.position = projected.clipPosition;
  } else {
    let projected = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      project_size_vec3(meshPosition)
    );
    geometry.position = projected.commonPosition;
    geometry.normal = project_normal(instanceModelMatrix * attributes.normals);
    varyings.position = projected.clipPosition;
  }

  varyings.color = vec4<f32>(
    attributes.colors * attributes.instanceColors.rgb,
    attributes.instanceColors.a
  );
  varyings.texCoords = attributes.texCoords;
  varyings.normal = geometry.normal;
  varyings.positionCommon = geometry.position.xyz;
  varyings.pickingColor = geometry.pickingColor;
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.texCoords;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  var color = varyings.color;
  if (simpleMesh.hasTexture > 0.5) {
    color = textureSample(simpleMeshTexture, simpleMeshTextureSampler, varyings.texCoords);
  }

  var normal = varyings.normal;
  if (simpleMesh.flatShading > 0.5) {
    // WebGPU's screen-space Y axis reverses the derivative orientation used by GLSL flat shading.
    normal = normalize(cross(dpdy(varyings.positionCommon), dpdx(varyings.positionCommon)));
  }

  color = vec4<f32>(
    lighting_getLightColor2(color.rgb, project.cameraPosition, varyings.positionCommon, normal),
    color.a * layer.opacity
  );

  if (picking.isHighlightActive > 0.5) {
    let highlightedColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedColor))) {
      let blendedAlpha = picking.highlightColor.a + color.a * (1.0 - picking.highlightColor.a);
      if (blendedAlpha > 0.0) {
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, picking.highlightColor.a / blendedAlpha),
          blendedAlpha
        );
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`
);

// ../mesh-layers/src/simple-mesh-layer/simple-mesh-layer.ts
var import_schema = require("@loaders.gl/schema");
function normalizeGeometryAttributes(attributes) {
  const positionAttribute = attributes.positions || attributes.POSITION;
  log_default.assert(positionAttribute, 'no "postions" or "POSITION" attribute in mesh');
  const vertexCount = positionAttribute.value.length / positionAttribute.size;
  let colorAttribute = attributes.COLOR_0 || attributes.colors;
  if (!colorAttribute) {
    colorAttribute = { size: 3, value: new Float32Array(vertexCount * 3).fill(1) };
  }
  let normalAttribute = attributes.NORMAL || attributes.normals;
  if (!normalAttribute) {
    normalAttribute = { size: 3, value: new Float32Array(vertexCount * 3).fill(0) };
  }
  let texCoordAttribute = attributes.TEXCOORD_0 || attributes.texCoords;
  if (!texCoordAttribute) {
    texCoordAttribute = { size: 2, value: new Float32Array(vertexCount * 2).fill(0) };
  }
  return {
    positions: positionAttribute,
    colors: colorAttribute,
    normals: normalAttribute,
    texCoords: texCoordAttribute
  };
}
function getGeometry(data) {
  if (data instanceof import_engine16.Geometry) {
    data.attributes = normalizeGeometryAttributes(data.attributes);
    return data;
  } else if (data.attributes) {
    return new import_engine16.Geometry({
      ...data,
      topology: "triangle-list",
      attributes: normalizeGeometryAttributes(data.attributes)
    });
  } else {
    return new import_engine16.Geometry({
      topology: "triangle-list",
      attributes: normalizeGeometryAttributes(data)
    });
  }
}
var DEFAULT_COLOR9 = [0, 0, 0, 255];
var defaultProps25 = {
  mesh: { type: "object", value: null, async: true },
  texture: { type: "image", value: null, async: true },
  sizeScale: { type: "number", value: 1, min: 0 },
  // _instanced is a hack to use world position instead of meter offsets in mesh
  // TODO - formalize API
  _instanced: true,
  // NOTE(Tarek): Quick and dirty wireframe. Just draws
  // the same mesh with LINE_STRIPS. Won't follow edges
  // of the original mesh.
  wireframe: false,
  // Optional material for 'lighting' shader module
  material: true,
  getPosition: { type: "accessor", value: (x) => x.position },
  getColor: { type: "accessor", value: DEFAULT_COLOR9 },
  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: { type: "accessor", value: [0, 0, 0] },
  getScale: { type: "accessor", value: [1, 1, 1] },
  getTranslation: { type: "accessor", value: [0, 0, 0] },
  // 4x4 matrix
  getTransformMatrix: { type: "accessor", value: [] },
  textureParameters: { type: "object", ignore: true, value: null }
};
var SimpleMeshLayer = class extends Layer {
  getShaders() {
    return super.getShaders({
      vs: simple_mesh_layer_vertex_glsl_default,
      fs: simple_mesh_layer_fragment_glsl_default,
      source: simple_mesh_layer_wgsl_default,
      modules: [project32_default, color_default, import_shadertools3.phongMaterial, picking_default, simpleMeshUniforms]
    });
  }
  getBounds() {
    var _a;
    if (this.props._instanced) {
      return super.getBounds();
    }
    let result = this.state.positionBounds;
    if (result) {
      return result;
    }
    const { mesh } = this.props;
    if (!mesh) {
      return null;
    }
    result = (_a = mesh.header) == null ? void 0 : _a.boundingBox;
    if (!result) {
      const { attributes } = getGeometry(mesh);
      attributes.POSITION = attributes.POSITION || attributes.positions;
      result = (0, import_schema.getMeshBoundingBox)(attributes);
    }
    this.state.positionBounds = result;
    return result;
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        transition: true,
        type: "float64",
        fp64: this.use64bitPositions(),
        size: 3,
        accessor: "getPosition"
      },
      instanceColors: {
        type: "unorm8",
        transition: true,
        size: this.props.colorFormat.length,
        accessor: "getColor",
        defaultValue: [0, 0, 0, 255]
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: this.context.device.createTexture({
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    if (props.mesh !== oldProps.mesh || changeFlags.extensionsChanged) {
      this.state.positionBounds = null;
      (_a = this.state.model) == null ? void 0 : _a.destroy();
      if (props.mesh) {
        this.state.model = this.getModel(props.mesh);
        const attributes = props.mesh.attributes || props.mesh;
        this.setState({
          hasNormals: Boolean(attributes.NORMAL || attributes.normals)
        });
      }
      this.getAttributeManager().invalidateAll();
    }
    if (props.texture !== oldProps.texture && props.texture instanceof import_core51.Texture) {
      this.setTexture(props.texture);
    }
    if (this.state.model) {
      this.state.model.setTopology(this.props.wireframe ? "line-strip" : "triangle-list");
    }
  }
  finalizeState(context) {
    super.finalizeState(context);
    this.state.emptyTexture.delete();
  }
  draw({ uniforms }) {
    const { model } = this.state;
    if (!model) {
      return;
    }
    const { viewport, renderPass } = this.context;
    const { sizeScale, coordinateSystem, _instanced } = this.props;
    const simpleMeshProps = {
      sizeScale,
      composeModelMatrix: !_instanced || shouldComposeModelMatrix(viewport, coordinateSystem),
      flatShading: !this.state.hasNormals
    };
    model.shaderInputs.setProps({ simpleMesh: simpleMeshProps });
    model.draw(renderPass);
  }
  get isLoaded() {
    var _a;
    return Boolean(((_a = this.state) == null ? void 0 : _a.model) && super.isLoaded);
  }
  getModel(mesh) {
    const model = new import_engine16.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: getGeometry(mesh),
      isInstanced: true
    });
    model.shaderInputs.setProps({
      simpleMesh: this.getTextureProps(this.props.texture)
    });
    return model;
  }
  setTexture(texture) {
    const { model } = this.state;
    if (model) {
      model.shaderInputs.setProps({ simpleMesh: this.getTextureProps(texture) });
    }
  }
  getTextureProps(texture) {
    const meshTexture = texture || this.state.emptyTexture;
    return {
      ...this.context.device.type === "webgpu" ? { simpleMeshTexture: meshTexture } : { sampler: meshTexture },
      hasTexture: Boolean(texture)
    };
  }
};
SimpleMeshLayer.defaultProps = defaultProps25;
SimpleMeshLayer.layerName = "SimpleMeshLayer";

// ../mesh-layers/src/scenegraph-layer/scenegraph-layer.ts
var import_shadertools7 = require("@luma.gl/shadertools");
var import_engine17 = require("@luma.gl/engine");
var import_gltf = require("@luma.gl/gltf");
var import_gltf2 = require("@loaders.gl/gltf");

// ../mesh-layers/src/scenegraph-layer/gltf-utils.ts
async function waitForGLTFAssets(gltfObjects) {
  const remaining = [];
  gltfObjects.scenes.forEach((scene) => {
    scene.traverse((modelNode) => {
    });
  });
  return await waitWhileCondition(() => remaining.some((uniform) => !uniform.loaded));
}
async function waitWhileCondition(condition) {
  while (condition()) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

// ../mesh-layers/src/scenegraph-layer/scenegraph-layer-uniforms.ts
var uniformBlockWGSL9 = (
  /* wgsl */
  `struct ScenegraphUniforms {
  sizeScale: f32,
  sizeMinPixels: f32,
  sizeMaxPixels: f32,
  sceneModelMatrix: mat4x4<f32>,
  composeModelMatrix: f32,
};

@group(0) @binding(auto)
var<uniform> scenegraph: ScenegraphUniforms;
`
);
var uniformBlockGLSL5 = (
  /* glsl */
  `layout(std140) uniform scenegraphUniforms {
  float sizeScale;
  float sizeMinPixels;
  float sizeMaxPixels;
  mat4 sceneModelMatrix;
  float composeModelMatrix;
} scenegraph;
`
);
var scenegraphUniforms = {
  name: "scenegraph",
  source: uniformBlockWGSL9,
  vs: uniformBlockGLSL5,
  fs: uniformBlockGLSL5,
  uniformTypes: {
    sizeScale: "f32",
    sizeMinPixels: "f32",
    sizeMaxPixels: "f32",
    sceneModelMatrix: "mat4x4<f32>",
    composeModelMatrix: "f32"
  }
};

// ../mesh-layers/src/scenegraph-layer/scenegraph-layer-vertex.glsl.ts
var scenegraph_layer_vertex_glsl_default = `#version 300 es

#define SHADER_NAME scenegraph-layer-vertex-shader

// Instance attributes
in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
in vec3 instanceTranslation;

// Primitive attributes
in vec3 positions;
#ifdef HAS_UV
  in vec2 texCoords;
#endif
#ifdef LIGHTING_PBR
  #ifdef HAS_NORMALS
    in vec3 normals;
  #endif
#endif

// Varying
out vec4 vColor;

// pbrMaterial contains all the varying definitions needed
#ifndef LIGHTING_PBR
  #ifdef HAS_UV
    out vec2 vTEXCOORD_0;
  #endif
#endif

// Main
void main(void) {
  #if defined(HAS_UV) && !defined(LIGHTING_PBR)
    vTEXCOORD_0 = texCoords;
    geometry.uv = texCoords;
  #endif

  geometry.worldPosition = instancePositions;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);

  vec3 normal = vec3(0.0, 0.0, 1.0);
  #ifdef LIGHTING_PBR
    #ifdef HAS_NORMALS
      normal = instanceModelMatrix * (scenegraph.sceneModelMatrix * vec4(normals, 0.0)).xyz;
    #endif
  #endif

  float originalSize = project_size_to_pixel(scenegraph.sizeScale);
  float clampedSize = clamp(originalSize, scenegraph.sizeMinPixels, scenegraph.sizeMaxPixels);
  float sizeRatio = originalSize == 0.0 ? 0.0 : clampedSize / originalSize;

  vec3 pos = (instanceModelMatrix * (scenegraph.sceneModelMatrix * vec4(positions, 1.0)).xyz) * scenegraph.sizeScale * sizeRatio + instanceTranslation;
  if(scenegraph.composeModelMatrix > 0.5) {
    DECKGL_FILTER_SIZE(pos, geometry);
    // using instancePositions as world coordinates
    // when using globe mode, this branch does not re-orient the model to align with the surface of the earth
    // call project_normal before setting position to avoid rotation
    geometry.normal = project_normal(normal);
    geometry.worldPosition += pos;
    gl_Position = project_position_to_clipspace(pos + instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
  }
  else {
    pos = project_size(pos);
    DECKGL_FILTER_SIZE(pos, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, pos, geometry.position);
    geometry.normal = project_normal(normal);
  }
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  #ifdef LIGHTING_PBR
    // set PBR data
    pbr_vPosition = geometry.position.xyz;
    #ifdef HAS_NORMALS
      pbr_vNormal = geometry.normal;
    #endif

    #ifdef HAS_UV
      pbr_vUV0 = texCoords;
    #else
      pbr_vUV0 = vec2(0., 0.);
    #endif
    pbr_vUV1 = vec2(0., 0.);
    geometry.uv = pbr_vUV0;
  #endif

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// ../mesh-layers/src/scenegraph-layer/scenegraph-layer-fragment.glsl.ts
var scenegraph_layer_fragment_glsl_default = `#version 300 es

#define SHADER_NAME scenegraph-layer-fragment-shader

// Varying
in vec4 vColor;

out vec4 fragColor;

// pbrMaterial contains all the varying definitions needed
#ifndef LIGHTING_PBR
  #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
    in vec2 vTEXCOORD_0;
    uniform sampler2D pbr_baseColorSampler;
  #endif
#endif

void main(void) {
  #ifdef LIGHTING_PBR
    fragColor = vColor * pbr_filterColor(vec4(0));
    geometry.uv = pbr_vUV0;
  #else
    #if defined(HAS_UV) && defined(HAS_BASECOLORMAP)
      fragColor = vColor * texture(pbr_baseColorSampler, vTEXCOORD_0);
      geometry.uv = vTEXCOORD_0;
    #else
      fragColor = vColor;
    #endif
  #endif

  fragColor.a *= layer.opacity;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// ../mesh-layers/src/scenegraph-layer/scenegraph-layer.wgsl.ts
var scenegraph_layer_wgsl_default = (
  /* wgsl */
  `struct VertexInputs {
  @location(0) positions: vec3<f32>,
#ifdef HAS_NORMALS
  @location(1) normals: vec3<f32>,
#endif
#ifdef HAS_UV
  @location(3) texCoords: vec2<f32>,
#endif
  @location(6) instancePositions: vec3<f32>,
  @location(7) instancePositions64Low: vec3<f32>,
  @location(8) instanceColors: vec4<f32>,
  @location(10) instanceModelMatrixCol0: vec3<f32>,
  @location(11) instanceModelMatrixCol1: vec3<f32>,
  @location(12) instanceModelMatrixCol2: vec3<f32>,
  @location(13) instanceTranslation: vec3<f32>,
};

struct FragmentInputs {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) vTexCoord: vec2<f32>,
  @location(2) pbrPosition: vec3<f32>,
  @location(3) pbrUV: vec2<f32>,
  @location(4) pbrNormal: vec3<f32>,
  @location(5) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(
  inputs: VertexInputs,
  @builtin(instance_index) instanceIndex: u32
) -> FragmentInputs {
  var outputs: FragmentInputs;

  geometry.worldPosition = inputs.instancePositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(instanceIndex);

  var vertexPosition = inputs.positions;
  var texCoord = vec2<f32>(0.0, 0.0);
  var normal = vec3<f32>(0.0, 0.0, 1.0);

#ifdef HAS_UV
  texCoord = inputs.texCoords;
#endif
#ifdef HAS_NORMALS
  normal = inputs.normals;
#endif

  geometry.uv = texCoord;

  let instanceModelMatrix = mat3x3<f32>(
    inputs.instanceModelMatrixCol0,
    inputs.instanceModelMatrixCol1,
    inputs.instanceModelMatrixCol2
  );

  let scenePosition = (scenegraph.sceneModelMatrix * vec4<f32>(vertexPosition, 1.0)).xyz;
  let worldNormal = instanceModelMatrix * (scenegraph.sceneModelMatrix * vec4<f32>(normal, 0.0)).xyz;

  let originalSize = project_meter_size_to_pixel(scenegraph.sizeScale);
  let clampedSize = clamp(originalSize, scenegraph.sizeMinPixels, scenegraph.sizeMaxPixels);
  let sizeRatio = select(0.0, clampedSize / originalSize, originalSize > 0.0);

  let pos =
    (instanceModelMatrix * scenePosition) * scenegraph.sizeScale * sizeRatio +
    inputs.instanceTranslation;

  if (scenegraph.composeModelMatrix > 0.5) {
    geometry.normal = project_normal(worldNormal);
    geometry.worldPosition = inputs.instancePositions + pos;
    geometry.position = vec4<f32>(
      project_position_vec3_f64(inputs.instancePositions + pos, inputs.instancePositions64Low),
      1.0
    );
  } else {
    let sizeAdjustedPos = project_size_vec3(pos);
    // Scenegraph offsets are east/north/up in globe mode. Use project32's helper so it can
    // rotate the offset onto the local tangent plane before producing the common position.
    let projectResult = project_position_to_clipspace_and_commonspace(
      inputs.instancePositions,
      inputs.instancePositions64Low,
      sizeAdjustedPos
    );
    geometry.position = projectResult.commonPosition;
    geometry.normal = project_normal(worldNormal);
  }

  outputs.position = project_common_position_to_clipspace(geometry.position);
  outputs.vColor = inputs.instanceColors;
  outputs.vTexCoord = texCoord;
  outputs.pbrPosition = geometry.position.xyz;
  outputs.pbrUV = texCoord;
  outputs.pbrNormal = geometry.normal;
  outputs.pickingColor = geometry.pickingColor;
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  fragmentGeometry.uv = inputs.vTexCoord;

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inputs.pickingColor)) {
      discard;
    }
    return vec4<f32>(inputs.pickingColor, 1.0);
  }

  var fragColor = inputs.vColor;

#ifdef LIGHTING_PBR
  fragmentInputs.pbr_vPosition = inputs.pbrPosition;
  // scenegraphPbrMaterial uses the indexed UV fields from the current PBR module.
  fragmentInputs.pbr_vUV0 = inputs.pbrUV;
  fragmentInputs.pbr_vUV1 = vec2<f32>(0.0);
  fragmentInputs.pbr_vNormal = inputs.pbrNormal;
  fragColor = fragColor * pbr_filterColor(vec4<f32>(0.0));
#else
#ifdef HAS_BASECOLORMAP
  fragColor =
    fragColor *
    textureSample(pbr_baseColorSampler, pbr_baseColorSamplerSampler, inputs.vTexCoord);
#endif
#endif

  fragColor.a *= layer.opacity;

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inputs.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + fragColor.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`
);

// ../mesh-layers/src/scenegraph-layer/scenegraph-pbr-material.ts
var import_shadertools6 = require("@luma.gl/shadertools");
var source3 = import_shadertools6.pbrMaterial.source.replace(
  /fn pbr_setPositionNormalTangentUV\([\s\S]*?\n}\n/,
  `fn pbr_setPositionNormalTangentUV(position: vec4f, normal: vec4f, tangent: vec4f, uv: vec2f)
{
  fragmentInputs.pbr_vPosition = position.xyz;
  fragmentInputs.pbr_vNormal = normal.xyz;
  fragmentInputs.pbr_vTBN = mat3x3f(
    vec3f(1.0, 0.0, 0.0),
    vec3f(0.0, 1.0, 0.0),
    vec3f(0.0, 0.0, 1.0)
  );
  fragmentInputs.pbr_vUV0 = uv;
  fragmentInputs.pbr_vUV1 = uv;
}
`
).replace(/pbrProjection\.camera/g, "project.cameraPosition");
var scenegraphPbrMaterial = {
  ...import_shadertools6.pbrMaterial,
  dependencies: [import_shadertools6.lighting],
  source: source3
};

// ../mesh-layers/src/scenegraph-layer/scenegraph-layer.ts
var DEFAULT_COLOR10 = [255, 255, 255, 255];
var defaultProps26 = {
  scenegraph: { type: "object", value: null, async: true },
  getScene: (gltf) => {
    if (gltf && gltf.scenes) {
      return typeof gltf.scene === "object" ? gltf.scene : gltf.scenes[gltf.scene || 0];
    }
    return gltf;
  },
  getAnimator: (scenegraph) => scenegraph && scenegraph.animator,
  _animations: null,
  onFirstDraw: { type: "function", value: () => {
  } },
  sizeScale: { type: "number", value: 1, min: 0 },
  sizeMinPixels: { type: "number", min: 0, value: 0 },
  sizeMaxPixels: { type: "number", min: 0, value: Number.MAX_SAFE_INTEGER },
  getPosition: { type: "accessor", value: (x) => x.position },
  getColor: { type: "accessor", value: DEFAULT_COLOR10 },
  // flat or pbr
  _lighting: "flat",
  // _lighting must be pbr for this to work
  _imageBasedLightingEnvironment: void 0,
  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: { type: "accessor", value: [0, 0, 0] },
  getScale: { type: "accessor", value: [1, 1, 1] },
  getTranslation: { type: "accessor", value: [0, 0, 0] },
  // 4x4 matrix
  getTransformMatrix: { type: "accessor", value: [] },
  loaders: [import_gltf2.GLTFLoader]
};
var ScenegraphLayer = class extends Layer {
  getShaders() {
    var _a;
    const defines2 = {};
    let pbr;
    const isWebGPU = ((_a = this.context.device) == null ? void 0 : _a.type) === "webgpu";
    if (this.props._lighting === "pbr") {
      pbr = isWebGPU ? scenegraphPbrMaterial : import_shadertools7.pbrMaterial;
      defines2.LIGHTING_PBR = 1;
    } else if (isWebGPU) {
      pbr = scenegraphPbrMaterial;
    } else {
      pbr = { name: "pbrMaterial" };
    }
    const modules = [project32_default, color_default, picking_default, scenegraphUniforms, pbr];
    return super.getShaders({ defines: defines2, vs: scenegraph_layer_vertex_glsl_default, fs: scenegraph_layer_fragment_glsl_default, source: scenegraph_layer_wgsl_default, modules });
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();
    const supportsTransitions = this.context.device.type !== "webgpu";
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: "float64",
        fp64: this.use64bitPositions(),
        accessor: "getPosition",
        transition: supportsTransitions
      },
      instanceColors: {
        type: "unorm8",
        size: this.props.colorFormat.length,
        accessor: "getColor",
        defaultValue: DEFAULT_COLOR10,
        transition: supportsTransitions
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
  }
  updateState(params) {
    super.updateState(params);
    const { props, oldProps } = params;
    if (props.scenegraph !== oldProps.scenegraph) {
      this._updateScenegraph();
    } else if (props._animations !== oldProps._animations) {
      this._applyAnimationsProp(this.state.animator, props._animations);
    }
  }
  finalizeState(context) {
    super.finalizeState(context);
    this._destroyScenegraphAssets();
  }
  get isLoaded() {
    var _a;
    return Boolean(((_a = this.state) == null ? void 0 : _a.scenegraph) && super.isLoaded);
  }
  _updateScenegraph() {
    const props = this.props;
    const { device } = this.context;
    let scenegraphData = null;
    if (props.scenegraph instanceof import_engine17.ScenegraphNode) {
      scenegraphData = { scenes: [props.scenegraph] };
    } else if (props.scenegraph && typeof props.scenegraph === "object") {
      const gltf = props.scenegraph;
      const processedGLTF = gltf.json ? (0, import_gltf2.postProcessGLTF)(gltf) : gltf;
      const gltfObjects = (0, import_gltf.createScenegraphsFromGLTF)(device, processedGLTF, this._getModelOptions());
      scenegraphData = gltfObjects;
      waitForGLTFAssets(gltfObjects).then(() => this.setNeedsRedraw()).catch((ex) => {
        this.raiseError(ex, "loading glTF");
      });
    }
    const options = { layer: this, device: this.context.device };
    const scenegraph = props.getScene(scenegraphData, options);
    const animator = props.getAnimator(scenegraphData, options);
    if (scenegraph instanceof import_engine17.GroupNode) {
      this._destroyScenegraphAssets();
      this._applyAnimationsProp(animator, props._animations);
      const models = [];
      scenegraph.traverse((node) => {
        if (node instanceof import_engine17.ModelNode) {
          models.push(node.model);
        }
      });
      this.setState({
        scenegraph,
        animator,
        materials: (scenegraphData == null ? void 0 : scenegraphData.materials) || null,
        models,
        firstDrawSignaled: false
      });
      this.getAttributeManager().invalidateAll();
    } else if (scenegraph !== null) {
      log_default.warn("invalid scenegraph:", scenegraph)();
    }
  }
  _destroyScenegraphAssets() {
    var _a, _b;
    (_a = this.state.scenegraph) == null ? void 0 : _a.destroy();
    (_b = this.state.materials) == null ? void 0 : _b.forEach((material) => material.destroy());
    this.state.scenegraph = null;
    this.state.animator = null;
    this.state.materials = null;
    this.state.models = [];
  }
  _applyAnimationsProp(animator, animationsProp) {
    if (!animator || !animationsProp) {
      return;
    }
    const animations = animator.getAnimations();
    Object.keys(animationsProp).sort().forEach((key) => {
      const value = animationsProp[key];
      if (key === "*") {
        animations.forEach((animation) => {
          Object.assign(animation, value);
        });
      } else if (Number.isFinite(Number(key))) {
        const number = Number(key);
        if (number >= 0 && number < animations.length) {
          Object.assign(animations[number], value);
        } else {
          log_default.warn(`animation ${key} not found`)();
        }
      } else {
        const findResult = animations.find(({ animation }) => animation.name === key);
        if (findResult) {
          Object.assign(findResult, value);
        } else {
          log_default.warn(`animation ${key} not found`)();
        }
      }
    });
  }
  _getModelOptions() {
    const { _imageBasedLightingEnvironment } = this.props;
    let env;
    if (_imageBasedLightingEnvironment) {
      if (typeof _imageBasedLightingEnvironment === "function") {
        env = _imageBasedLightingEnvironment({
          device: this.context.device,
          gl: this.context.gl,
          layer: this
        });
      } else {
        env = _imageBasedLightingEnvironment;
      }
    }
    const parameters = this.context.device.type === "webgpu" ? {
      depthWriteEnabled: true,
      depthCompare: "less-equal"
    } : void 0;
    return {
      imageBasedLightingEnvironment: env,
      modelOptions: {
        id: this.props.id,
        isInstanced: true,
        bufferLayout: this.getAttributeManager().getBufferLayouts(),
        parameters,
        ...this.getShaders()
      },
      // tangents are not supported
      useTangents: false
    };
  }
  draw({ context }) {
    var _a, _b;
    if (!this.state.scenegraph) return;
    if (this.props._animations && this.state.animator) {
      this.state.animator.setTime(context.timeline.getTime());
      this.setNeedsRedraw();
    }
    const { viewport, renderPass } = this.context;
    const { sizeScale, sizeMinPixels, sizeMaxPixels, coordinateSystem } = this.props;
    const pbrProjectionProps = {
      camera: viewport.cameraPosition
    };
    const numInstances = this.getNumInstances();
    this.state.scenegraph.traverse((node, { worldMatrix }) => {
      if (node instanceof import_engine17.ModelNode) {
        const { model } = node;
        model.setInstanceCount(numInstances);
        const scenegraphProps = {
          sizeScale,
          sizeMinPixels,
          sizeMaxPixels,
          composeModelMatrix: shouldComposeModelMatrix(viewport, coordinateSystem) ? 1 : 0,
          sceneModelMatrix: worldMatrix
        };
        model.shaderInputs.setProps({
          pbrProjection: pbrProjectionProps,
          scenegraph: scenegraphProps
        });
        model.draw(renderPass);
      }
    });
    if (!this.state.firstDrawSignaled) {
      this.state.firstDrawSignaled = true;
      (_b = (_a = this.props).onFirstDraw) == null ? void 0 : _b.call(_a);
    }
  }
};
ScenegraphLayer.defaultProps = defaultProps26;
ScenegraphLayer.layerName = "ScenegraphLayer";

// dist/mesh-layer/mesh-layer.js
var import_gltf3 = require("@luma.gl/gltf");
var import_engine18 = require("@luma.gl/engine");

// dist/mesh-layer/mesh-layer-uniforms.js
var uniformBlock9 = `layout(std140) uniform meshUniforms {
  bool pickFeatureIds;
} mesh;
`;
var source4 = null;
var meshUniforms = {
  name: "mesh",
  vs: uniformBlock9,
  fs: uniformBlock9,
  source: source4,
  uniformTypes: {
    pickFeatureIds: "f32"
  }
};

// dist/mesh-layer/mesh-pbr-material.js
var import_shadertools8 = require("@luma.gl/shadertools");
var source5 = import_shadertools8.pbrMaterial.source.replace(/fn pbr_setPositionNormalTangentUV\([\s\S]*?\n}\n/, `fn pbr_setPositionNormalTangentUV(position: vec4f, normal: vec4f, tangent: vec4f, uv: vec2f)
{
  fragmentInputs.pbr_vPosition = position.xyz;
  fragmentInputs.pbr_vNormal = normal.xyz;
  fragmentInputs.pbr_vTBN = mat3x3f(
    vec3f(1.0, 0.0, 0.0),
    vec3f(0.0, 1.0, 0.0),
    vec3f(0.0, 0.0, 1.0)
  );
  fragmentInputs.pbr_vUV0 = uv;
  fragmentInputs.pbr_vUV1 = uv;
}
`).replace(/pbrProjection\.camera/g, "project.cameraPosition");
var meshPbrMaterial = {
  ...import_shadertools8.pbrMaterial,
  source: source5
};

// dist/mesh-layer/mesh-layer-vertex.glsl.js
var mesh_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME simple-mesh-layer-vs
in vec3 positions;
in vec3 normals;
in vec3 colors;
in vec2 texCoords;
in vec4 uvRegions;
in float rowIndexes;
in vec4 instanceColors;
in vec3 instanceModelMatrixCol0;
in vec3 instanceModelMatrixCol1;
in vec3 instanceModelMatrixCol2;
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
vec2 applyUVRegion(vec2 uv) {
#ifdef HAS_UV_REGIONS
return fract(uv) * (uvRegions.zw - uvRegions.xy) + uvRegions.xy;
#else
return uv;
#endif
}
void main(void) {
vec2 uv = applyUVRegion(texCoords);
geometry.uv = uv;
if (mesh.pickFeatureIds) {
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
} else {
geometry.pickingColor = picking_getPickingColorFromInstanceID();
}
mat3 instanceModelMatrix = mat3(instanceModelMatrixCol0, instanceModelMatrixCol1, instanceModelMatrixCol2);
vTexCoord = uv;
cameraPosition = project.cameraPosition;
vColor = vec4(colors * instanceColors.rgb, instanceColors.a);
vec3 pos = (instanceModelMatrix * positions) * simpleMesh.sizeScale;
vec3 projectedPosition = project_position(positions);
position_commonspace = vec4(projectedPosition, 1.0);
gl_Position = project_common_position_to_clipspace(position_commonspace);
geometry.position = position_commonspace;
normals_commonspace = project_normal(instanceModelMatrix * normals);
geometry.normal = normals_commonspace;
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
#ifdef MODULE_PBRMATERIAL
pbr_vPosition = geometry.position.xyz;
#ifdef HAS_NORMALS
pbr_vNormal = geometry.normal;
#endif
#ifdef HAS_UV
pbr_vUV0 = uv;
#else
pbr_vUV0 = vec2(0., 0.);
#endif
pbr_vUV1 = vec2(0., 0.);
geometry.uv = pbr_vUV0;
#endif
DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

// dist/mesh-layer/mesh-layer-fragment.glsl.js
var mesh_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME simple-mesh-layer-fs
precision highp float;
uniform sampler2D sampler;
in vec2 vTexCoord;
in vec3 cameraPosition;
in vec3 normals_commonspace;
in vec4 position_commonspace;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
#ifdef MODULE_PBRMATERIAL
fragColor = vColor * pbr_filterColor(vec4(0));
geometry.uv = pbr_vUV0;
fragColor.a *= layer.opacity;
#else
geometry.uv = vTexCoord;
vec3 normal;
if (simpleMesh.flatShading) {
normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
} else {
normal = normals_commonspace;
}
vec4 color = simpleMesh.hasTexture ? texture(sampler, vTexCoord) : vColor;
vec3 lightColor = lighting_getLightColor(color.rgb, cameraPosition, position_commonspace.xyz, normal);
fragColor = vec4(lightColor, color.a * layer.opacity);
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/mesh-layer/mesh-layer.wgsl.js
var mesh_layer_wgsl_default = (
  /* wgsl */
  null
);

// dist/mesh-layer/mesh-layer.js
function validateGeometryAttributes(attributes) {
  const positionAttribute = attributes.positions || attributes.POSITION;
  const vertexCount = positionAttribute.value.length / positionAttribute.size;
  const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
  if (!hasColorAttribute) {
    attributes.colors = {
      size: 4,
      value: new Uint8Array(vertexCount * 4).fill(255),
      normalized: true
    };
  }
}
var defaultProps27 = {
  pbrMaterial: { type: "object", value: null },
  featureIds: { type: "array", value: null, optional: true }
};
var MeshLayer = class extends SimpleMeshLayer {
  getShaders() {
    const shaders = super.getShaders();
    return {
      ...shaders,
      vs: mesh_layer_vertex_glsl_default,
      fs: mesh_layer_fragment_glsl_default,
      source: mesh_layer_wgsl_default,
      modules: [...shaders.modules, meshPbrMaterial, meshUniforms]
    };
  }
  initializeState() {
    const { featureIds } = this.props;
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    if (featureIds) {
      attributeManager.add({
        /** Feature id for each mesh vertex. */
        rowIndexes: {
          type: "uint32",
          size: 1,
          noAlloc: true,
          // eslint-disable-next-line @typescript-eslint/unbound-method
          update: this.calculateFeatureIdsPickingIndexes
        }
      });
    }
  }
  updateState(params) {
    super.updateState(params);
    const { props, oldProps } = params;
    if (props.pbrMaterial !== oldProps.pbrMaterial) {
      this.updatePbrMaterialUniforms(props.pbrMaterial);
    }
  }
  draw(opts) {
    const { featureIds } = this.props;
    const { model } = this.state;
    if (!model) {
      return;
    }
    const meshProps = {
      pickFeatureIds: Boolean(featureIds)
    };
    const pbrProjectionProps = {
      camera: this.context.viewport.cameraPosition
    };
    model.shaderInputs.setProps({
      pbrProjection: pbrProjectionProps,
      mesh: meshProps
    });
    super.draw(opts);
  }
  getModel(mesh) {
    const { id } = this.props;
    const parsedPBRMaterial = this.parseMaterial(this.props.pbrMaterial, mesh);
    this.setState({ parsedPBRMaterial });
    const shaders = this.getShaders();
    validateGeometryAttributes(mesh.attributes);
    const model = new import_engine18.Model(this.context.device, {
      ...this.getShaders(),
      id,
      geometry: mesh,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      defines: {
        ...shaders.defines,
        ...parsedPBRMaterial == null ? void 0 : parsedPBRMaterial.defines,
        HAS_UV_REGIONS: mesh.attributes.uvRegions ? 1 : 0,
        HAS_FEATURE_IDS: this.props.featureIds ? 1 : 0
      },
      parameters: parsedPBRMaterial == null ? void 0 : parsedPBRMaterial.parameters,
      isInstanced: true
    });
    return model;
  }
  updatePbrMaterialUniforms(material) {
    const { model } = this.state;
    if (model) {
      const { mesh } = this.props;
      const parsedPBRMaterial = this.parseMaterial(material, mesh);
      this.setState({ parsedPBRMaterial });
      const { pbr_baseColorSampler } = parsedPBRMaterial.bindings;
      const { emptyTexture } = this.state;
      const simpleMeshProps = {
        sampler: pbr_baseColorSampler || emptyTexture,
        hasTexture: Boolean(pbr_baseColorSampler)
      };
      const { camera, ...pbrMaterialProps } = {
        ...parsedPBRMaterial.bindings,
        ...parsedPBRMaterial.uniforms
      };
      model.shaderInputs.setProps({ simpleMesh: simpleMeshProps, pbrMaterial: pbrMaterialProps });
    }
  }
  parseMaterial(material, mesh) {
    const unlit = Boolean(material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture);
    return (0, import_gltf3.parsePBRMaterial)(this.context.device, { unlit, ...material }, { NORMAL: mesh.attributes.normals, TEXCOORD_0: mesh.attributes.texCoords }, {
      pbrDebug: false,
      lights: true,
      useTangents: false
    });
  }
  calculateFeatureIdsPickingIndexes(attribute) {
    const featureIds = this.props.featureIds;
    attribute.value = new Uint32Array(featureIds);
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.parsedPBRMaterial) == null ? void 0 : _a.generatedTextures.forEach((texture) => texture.destroy());
    this.setState({ parsedPBRMaterial: null });
  }
};
MeshLayer.layerName = "MeshLayer";
MeshLayer.defaultProps = defaultProps27;
var mesh_layer_default = MeshLayer;

// dist/tile-3d-layer/tile-3d-layer.js
var import_core54 = require("@loaders.gl/core");
var import_tiles = require("@loaders.gl/tiles");
var import_d_tiles = require("@loaders.gl/3d-tiles");
var SINGLE_DATA = [0];
var defaultProps28 = {
  getPointColor: { type: "accessor", value: [0, 0, 0, 255] },
  pointSize: 1,
  // Disable async data loading (handling it in _loadTileSet)
  data: "",
  loader: import_d_tiles.Tiles3DLoader,
  onTilesetLoad: { type: "function", value: (tileset3d) => {
  } },
  onTileLoad: { type: "function", value: (tileHeader) => {
  } },
  onTileUnload: { type: "function", value: (tileHeader) => {
  } },
  onTileError: { type: "function", value: (tile, message, url) => {
  } },
  _getMeshColor: { type: "function", value: (tileHeader) => [255, 255, 255] }
};
var Tile3DLayer = class extends CompositeLayer {
  initializeState() {
    if ("onTileLoadFail" in this.props) {
      log_default.removed("onTileLoadFail", "onTileError")();
    }
    this.state = {
      layerMap: {},
      tileset3d: null,
      activeViewports: {},
      lastUpdatedViewports: null
    };
  }
  get isLoaded() {
    var _a, _b;
    return Boolean(((_b = (_a = this.state) == null ? void 0 : _a.tileset3d) == null ? void 0 : _b.isLoaded()) && super.isLoaded);
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  updateState({ props, oldProps, changeFlags }) {
    if (props.data && props.data !== oldProps.data) {
      this._loadTileset(props.data);
    }
    if (changeFlags.viewportChanged) {
      const { activeViewports } = this.state;
      const viewportsNumber = Object.keys(activeViewports).length;
      if (viewportsNumber) {
        this._updateTileset(activeViewports);
        this.state.lastUpdatedViewports = activeViewports;
        this.state.activeViewports = {};
      }
    }
    if (changeFlags.propsChanged) {
      const { layerMap } = this.state;
      for (const key in layerMap) {
        layerMap[key].needsUpdate = true;
      }
    }
  }
  finalizeState(context) {
    var _a;
    (_a = this.state.tileset3d) == null ? void 0 : _a.destroy();
    this.state.tileset3d = null;
    this.state.layerMap = {};
    this.state.activeViewports = {};
    this.state.lastUpdatedViewports = null;
    super.finalizeState(context);
  }
  activateViewport(viewport) {
    const { activeViewports, lastUpdatedViewports } = this.state;
    this.internalState.viewport = viewport;
    activeViewports[viewport.id] = viewport;
    const lastViewport = lastUpdatedViewports == null ? void 0 : lastUpdatedViewports[viewport.id];
    if (!lastViewport || !viewport.equals(lastViewport)) {
      this.setChangeFlags({ viewportChanged: true });
      this.setNeedsUpdate();
    }
  }
  getPickingInfo({ info, sourceLayer }) {
    const sourceTile = sourceLayer && sourceLayer.props.tile;
    if (info.picked) {
      info.object = sourceTile;
    }
    info.sourceTile = sourceTile;
    return info;
  }
  filterSubLayer({ layer, viewport, cullRect, isPicking }) {
    var _a;
    const { tile } = layer.props;
    const { id: viewportId } = viewport;
    if (!tile.selected || !tile.viewportIds.includes(viewportId)) {
      return false;
    }
    if (isPicking && cullRect && ((_a = tile.content) == null ? void 0 : _a.cartographicOrigin)) {
      const [sx, sy] = viewport.project(tile.content.cartographicOrigin);
      const cx = cullRect.x + cullRect.width / 2;
      const cy = cullRect.y + cullRect.height / 2;
      const threshold = Math.max(viewport.width, viewport.height) / 4;
      const dx = sx - cx;
      const dy = sy - cy;
      if (dx * dx + dy * dy > threshold * threshold) {
        return false;
      }
    }
    return true;
  }
  _updateAutoHighlight(info) {
    const sourceTile = info.sourceTile;
    const layerCache = this.state.layerMap[sourceTile == null ? void 0 : sourceTile.id];
    if (layerCache && layerCache.layer) {
      layerCache.layer.updateAutoHighlight(info);
    }
  }
  async _loadTileset(tilesetUrl) {
    var _a, _b;
    const loadOptions = this.props.loadOptions || {};
    const loaders = ((_a = this.props.loaders) == null ? void 0 : _a.length) ? this.props.loaders : this.props.loader;
    const loader = Array.isArray(loaders) ? loaders[0] : loaders;
    const { tileset: tilesetOptions, ...remainingLoadOptions } = loadOptions;
    const options = { loadOptions: { ...remainingLoadOptions }, ...tilesetOptions };
    let actualTilesetUrl = tilesetUrl;
    if ("preload" in loader && typeof loader.preload === "function") {
      const preloadOptions = await loader.preload(tilesetUrl, loadOptions);
      if (preloadOptions.url) {
        actualTilesetUrl = preloadOptions.url;
      }
      if (preloadOptions.headers) {
        options.loadOptions.core = {
          ...options.loadOptions.core,
          fetch: {
            ...(_b = options.loadOptions.core) == null ? void 0 : _b.fetch,
            headers: preloadOptions.headers
          }
        };
      }
      Object.assign(options, preloadOptions);
    }
    const tilesetJson = await (0, import_core54.load)(actualTilesetUrl, loader, options.loadOptions);
    const tileset3d = new import_tiles.Tileset3D(tilesetJson, {
      onTileLoad: this._onTileLoad.bind(this),
      onTileUnload: this._onTileUnload.bind(this),
      onTileError: this.props.onTileError,
      onUpdate: () => this.setNeedsUpdate(),
      ...options
    });
    this.setState({
      tileset3d,
      layerMap: {}
    });
    this._updateTileset(this.state.activeViewports);
    this.props.onTilesetLoad(tileset3d);
  }
  _onTileLoad(tileHeader) {
    const { lastUpdatedViewports } = this.state;
    tileHeader.tileDrawn = false;
    this.props.onTileLoad(tileHeader);
    this._updateTileset(lastUpdatedViewports);
    this.setNeedsUpdate();
  }
  _onTileUnload(tileHeader) {
    delete this.state.layerMap[tileHeader.id];
    this.props.onTileUnload(tileHeader);
  }
  _updateTileset(viewports) {
    if (!viewports) {
      return;
    }
    const { tileset3d } = this.state;
    const { timeline } = this.context;
    const viewportsNumber = Object.keys(viewports).length;
    if (!timeline || !viewportsNumber || !tileset3d) {
      return;
    }
    tileset3d.selectTiles(Object.values(viewports)).then((frameNumber) => {
      const tilesetChanged = this.state.frameNumber !== frameNumber;
      if (tilesetChanged) {
        this.setState({ frameNumber });
      }
    });
  }
  _getSubLayer(tileHeader, oldLayer) {
    if (!tileHeader.content) {
      return null;
    }
    switch (tileHeader.type) {
      case import_tiles.TILE_TYPE.POINTCLOUD:
        return this._makePointCloudLayer(tileHeader, oldLayer);
      case import_tiles.TILE_TYPE.SCENEGRAPH:
        return this._make3DModelLayer(tileHeader);
      case import_tiles.TILE_TYPE.MESH:
        return this._makeSimpleMeshLayer(tileHeader, oldLayer);
      default:
        throw new Error(`Tile3DLayer: Failed to render layer of type ${tileHeader.content.type}`);
    }
  }
  _makePointCloudLayer(tileHeader, oldLayer) {
    const { attributes, pointCount, constantRGBA, cartographicOrigin, modelMatrix: modelMatrix2 } = tileHeader.content;
    const { positions, normals, colors } = attributes;
    if (!positions) {
      return null;
    }
    const data = oldLayer && oldLayer.props.data || {
      header: {
        vertexCount: pointCount
      },
      attributes: {
        POSITION: positions,
        NORMAL: normals,
        COLOR_0: colors
      }
    };
    const { pointSize, getPointColor } = this.props;
    const SubLayerClass = this.getSubLayerClass("pointcloud", PointCloudLayer);
    return new SubLayerClass({
      pointSize
    }, this.getSubLayerProps({
      id: "pointcloud"
    }), {
      id: `${this.id}-pointcloud-${tileHeader.id}`,
      tile: tileHeader,
      data,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: cartographicOrigin,
      modelMatrix: modelMatrix2,
      getColor: constantRGBA || getPointColor,
      _offset: 0
    });
  }
  _make3DModelLayer(tileHeader) {
    const { gltf, instances, cartographicOrigin, modelMatrix: modelMatrix2 } = tileHeader.content;
    const SubLayerClass = this.getSubLayerClass("scenegraph", ScenegraphLayer);
    return new SubLayerClass({
      _lighting: "pbr"
    }, this.getSubLayerProps({
      id: "scenegraph"
    }), {
      id: `${this.id}-scenegraph-${tileHeader.id}`,
      tile: tileHeader,
      data: instances || SINGLE_DATA,
      scenegraph: gltf,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: cartographicOrigin,
      modelMatrix: modelMatrix2,
      getTransformMatrix: (instance) => instance.modelMatrix,
      getPosition: [0, 0, 0],
      _offset: 0,
      onFirstDraw: () => {
        tileHeader.tileDrawn = true;
      }
    });
  }
  _makeSimpleMeshLayer(tileHeader, oldLayer) {
    const content = tileHeader.content;
    const { attributes, indices, modelMatrix: modelMatrix2, cartographicOrigin, coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS, material, featureIds } = content;
    const { _getMeshColor } = this.props;
    const geometry = oldLayer && oldLayer.props.mesh || new import_engine19.Geometry({
      topology: "triangle-list",
      attributes: getMeshGeometry(attributes),
      indices
    });
    const SubLayerClass = this.getSubLayerClass("mesh", mesh_layer_default);
    return new SubLayerClass(this.getSubLayerProps({
      id: "mesh"
    }), {
      id: `${this.id}-mesh-${tileHeader.id}`,
      tile: tileHeader,
      mesh: geometry,
      data: SINGLE_DATA,
      getColor: _getMeshColor(tileHeader),
      pbrMaterial: material,
      modelMatrix: modelMatrix2,
      coordinateOrigin: cartographicOrigin,
      coordinateSystem,
      featureIds,
      _offset: 0
    });
  }
  renderLayers() {
    const { tileset3d, layerMap } = this.state;
    if (!tileset3d) {
      return null;
    }
    return tileset3d.tiles.map((tile) => {
      const layerCache = layerMap[tile.id] = layerMap[tile.id] || { tile };
      let { layer } = layerCache;
      if (tile.selected) {
        if (!layer) {
          layer = this._getSubLayer(tile);
        } else if (layerCache.needsUpdate) {
          layer = this._getSubLayer(tile, layer);
          layerCache.needsUpdate = false;
        }
      }
      layerCache.layer = layer;
      return layer;
    }).filter(Boolean);
  }
};
Tile3DLayer.defaultProps = defaultProps28;
Tile3DLayer.layerName = "Tile3DLayer";
var tile_3d_layer_default = Tile3DLayer;
function getMeshGeometry(contentAttributes) {
  const attributes = {};
  attributes.positions = {
    ...contentAttributes.positions,
    value: new Float32Array(contentAttributes.positions.value)
  };
  if (contentAttributes.normals) {
    attributes.normals = contentAttributes.normals;
  }
  if (contentAttributes.texCoords) {
    attributes.texCoords = contentAttributes.texCoords;
  }
  if (contentAttributes.colors) {
    attributes.colors = contentAttributes.colors;
  }
  if (contentAttributes.uvRegions) {
    attributes.uvRegions = contentAttributes.uvRegions;
  }
  return attributes;
}

// dist/terrain-layer/terrain-layer.js
var import_terrain = require("@loaders.gl/terrain");
var DUMMY_DATA = [1];
var TILE_OVERLAP_PIXELS = 1;
var MIN_TERRAIN_MESH_MAX_ERROR = 1;
var MAX_LATITUDE2 = 90;
var MAX_LONGITUDE = 180;
var defaultProps29 = {
  ...tile_layer_default.defaultProps,
  // Image url that encodes height data
  elevationData: urlType,
  // Image url to use as texture
  texture: { ...urlType, optional: true },
  // Martini error tolerance in meters, smaller number -> more detailed mesh
  meshMaxError: { type: "number", value: 4 },
  // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
  bounds: { type: "array", value: null, optional: true, compare: true },
  // Color to use if texture is unavailable
  color: { type: "color", value: [255, 255, 255] },
  // Object to decode height data, from (r, g, b) to height in meters
  elevationDecoder: {
    type: "object",
    value: {
      rScaler: 1,
      gScaler: 0,
      bScaler: 0,
      offset: 0
    }
  },
  // Supply url to local terrain worker bundle. Only required if running offline and cannot access CDN.
  workerUrl: "",
  // Same as SimpleMeshLayer wireframe
  wireframe: false,
  material: true,
  loaders: [import_terrain.TerrainWorkerLoader]
};
function urlTemplateToUpdateTrigger(template) {
  if (Array.isArray(template)) {
    return template.join(";");
  }
  return template || "";
}
function getOverlappedBounds(bounds, tileSize, clampLngLat) {
  const xPad = (bounds[2] - bounds[0]) / tileSize * TILE_OVERLAP_PIXELS;
  const yPad = (bounds[3] - bounds[1]) / tileSize * TILE_OVERLAP_PIXELS;
  const overlappedBounds = [
    bounds[0] - xPad,
    bounds[1] - yPad,
    bounds[2] + xPad,
    bounds[3] + yPad
  ];
  if (!clampLngLat) {
    return overlappedBounds;
  }
  return [
    Math.max(overlappedBounds[0], -MAX_LONGITUDE),
    Math.max(overlappedBounds[1], -MAX_LATITUDE2),
    Math.min(overlappedBounds[2], MAX_LONGITUDE),
    Math.min(overlappedBounds[3], MAX_LATITUDE2)
  ];
}
function getEffectiveMeshMaxError(meshMaxError) {
  if (!Number.isFinite(meshMaxError) || meshMaxError <= 0) {
    return MIN_TERRAIN_MESH_MAX_ERROR;
  }
  return Math.max(meshMaxError, MIN_TERRAIN_MESH_MAX_ERROR);
}
var TerrainLayer = class extends CompositeLayer {
  updateState({ props, oldProps }) {
    const elevationDataChanged = props.elevationData !== oldProps.elevationData;
    if (elevationDataChanged) {
      const { elevationData } = props;
      const isTiled = elevationData && (Array.isArray(elevationData) || isTileSetURL(elevationData));
      this.setState({ isTiled });
    }
    const shouldReload = elevationDataChanged || props.meshMaxError !== oldProps.meshMaxError || props.elevationDecoder !== oldProps.elevationDecoder || props.bounds !== oldProps.bounds;
    if (!this.state.isTiled && shouldReload) {
      const terrain = this.loadTerrain(props);
      this.setState({ terrain });
    }
    if (props.workerUrl) {
      log_default.removed("workerUrl", "loadOptions.terrain.workerUrl")();
    }
  }
  loadTerrain({ elevationData, bounds, elevationDecoder, meshMaxError, signal }) {
    if (!elevationData) {
      return null;
    }
    const effectiveMeshMaxError = getEffectiveMeshMaxError(meshMaxError);
    let loadOptions = this.getLoadOptions();
    loadOptions = {
      ...loadOptions,
      terrain: {
        skirtHeight: this.state.isTiled ? effectiveMeshMaxError * 2 : 0,
        ...loadOptions == null ? void 0 : loadOptions.terrain,
        bounds,
        meshMaxError: effectiveMeshMaxError,
        elevationDecoder
      }
    };
    const { fetch } = this.props;
    return fetch(elevationData, { propName: "elevationData", layer: this, loadOptions, signal });
  }
  getTiledTerrainData(tile) {
    const { elevationData, fetch, texture, elevationDecoder, meshMaxError } = this.props;
    const { viewport } = this.context;
    const dataUrl = getURLFromTemplate(elevationData, tile);
    const textureUrl = texture && getURLFromTemplate(texture, tile);
    const { signal } = tile;
    let bottomLeft = [0, 0];
    let topRight = [0, 0];
    if (viewport.isGeospatial) {
      const bbox = tile.bbox;
      bottomLeft = viewport.projectFlat([bbox.west, bbox.south]);
      topRight = viewport.projectFlat([bbox.east, bbox.north]);
    } else {
      const bbox = tile.bbox;
      bottomLeft = [bbox.left, bbox.bottom];
      topRight = [bbox.right, bbox.top];
    }
    const bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
    const overlappedBounds = getOverlappedBounds(bounds, this.props.tileSize, viewport instanceof GlobeViewport);
    const terrain = this.loadTerrain({
      elevationData: dataUrl,
      bounds: overlappedBounds,
      elevationDecoder,
      meshMaxError,
      signal
    });
    const surface = textureUrl ? (
      // If surface image fails to load, the tile should still be displayed
      fetch(textureUrl, { propName: "texture", layer: this, loaders: [], signal }).catch((_) => null)
    ) : Promise.resolve(null);
    return Promise.all([terrain, surface]);
  }
  renderSubLayers(props) {
    var _a;
    const SubLayerClass = this.getSubLayerClass("mesh", SimpleMeshLayer);
    const { color, wireframe, material } = this.props;
    const { data } = props;
    if (!data) {
      return null;
    }
    const [mesh, texture] = data;
    const { viewport } = this.context;
    const isGlobe = viewport instanceof GlobeViewport;
    const boundingBox = (_a = mesh == null ? void 0 : mesh.header) == null ? void 0 : _a.boundingBox;
    const hasLngLatBounds = boundingBox && boundingBox.every(([x, y]) => x >= -MAX_LONGITUDE && x <= MAX_LONGITUDE && y >= -MAX_LATITUDE2 && y <= MAX_LATITUDE2);
    const coordinateSystem = isGlobe && hasLngLatBounds ? COORDINATE_SYSTEM.LNGLAT : COORDINATE_SYSTEM.CARTESIAN;
    return new SubLayerClass(props, {
      data: DUMMY_DATA,
      mesh,
      texture,
      _instanced: false,
      coordinateSystem,
      getPosition: (d) => [0, 0, 0],
      getColor: color,
      wireframe,
      material
    });
  }
  // Update zRange of viewport
  onViewportLoad(tiles) {
    if (!tiles) {
      return;
    }
    const { zRange } = this.state;
    const ranges = tiles.map((tile) => tile.content).filter(Boolean).map((arr) => {
      const bounds = arr[0].header.boundingBox;
      return bounds.map((bound) => bound[2]);
    });
    if (ranges.length === 0) {
      return;
    }
    const minZ = Math.min(...ranges.map((x) => x[0]));
    const maxZ = Math.max(...ranges.map((x) => x[1]));
    if (!zRange || minZ < zRange[0] || maxZ > zRange[1]) {
      this.setState({ zRange: [minZ, maxZ] });
    }
  }
  renderLayers() {
    const { color, material, elevationData, texture, wireframe, meshMaxError, elevationDecoder, tileSize, maxZoom, minZoom, extent, maxRequests, onTileLoad, onTileUnload, onTileError, maxCacheSize, maxCacheByteSize, refinementStrategy, zoomOffset } = this.props;
    if (this.state.isTiled) {
      return new tile_layer_default(this.getSubLayerProps({
        id: "tiles"
      }), {
        getTileData: this.getTiledTerrainData.bind(this),
        renderSubLayers: this.renderSubLayers.bind(this),
        updateTriggers: {
          getTileData: {
            elevationData: urlTemplateToUpdateTrigger(elevationData),
            texture: urlTemplateToUpdateTrigger(texture),
            meshMaxError,
            elevationDecoder,
            projectionMode: this.context.viewport.projectionMode,
            zoomOffset
          }
        },
        onViewportLoad: this.onViewportLoad.bind(this),
        zRange: this.state.zRange || null,
        tileSize,
        maxZoom,
        minZoom,
        extent,
        maxRequests,
        onTileLoad,
        onTileUnload,
        onTileError,
        maxCacheSize,
        maxCacheByteSize,
        refinementStrategy,
        zoomOffset
      });
    }
    if (!elevationData) {
      return null;
    }
    const SubLayerClass = this.getSubLayerClass("mesh", SimpleMeshLayer);
    return new SubLayerClass(this.getSubLayerProps({
      id: "mesh"
    }), {
      data: DUMMY_DATA,
      mesh: this.state.terrain,
      texture,
      _instanced: false,
      getPosition: (d) => [0, 0, 0],
      getColor: color,
      material,
      wireframe
    });
  }
};
TerrainLayer.defaultProps = defaultProps29;
TerrainLayer.layerName = "TerrainLayer";
var terrain_layer_default = TerrainLayer;
var isTileSetURL = (url) => url.includes("{x}") && (url.includes("{y}") || url.includes("{-y}"));

// ../extensions/src/clip/clip-extension.ts
var defaultProps30 = {
  clipBounds: [0, 0, 1, 1],
  clipByInstance: void 0
};
var shaderFunction = (
  /* glsl */
  `
layout(std140) uniform clipUniforms {
  vec4 bounds;
} clip;

bool clip_isInBounds(vec2 position) {
  return position.x >= clip.bounds[0] && position.y >= clip.bounds[1] && position.x < clip.bounds[2] && position.y < clip.bounds[3];
}
`
);
var shaderModuleVs = {
  name: "clip",
  vs: shaderFunction,
  uniformTypes: {
    bounds: "vec4<f32>"
  }
};
var injectionVs = {
  "vs:#decl": (
    /* glsl */
    `
out float clip_isVisible;
`
  ),
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
  clip_isVisible = float(clip_isInBounds(geometry.worldPosition.xy));
`
  ),
  "fs:#decl": (
    /* glsl */
    `
in float clip_isVisible;
`
  ),
  "fs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
  if (clip_isVisible < 0.5) discard;
`
  )
};
var shaderModuleFs = {
  name: "clip",
  fs: shaderFunction,
  uniformTypes: {
    bounds: "vec4<f32>"
  }
};
var injectionFs = {
  "vs:#decl": (
    /* glsl */
    `
out vec2 clip_commonPosition;
`
  ),
  "vs:DECKGL_FILTER_GL_POSITION": (
    /* glsl */
    `
  clip_commonPosition = geometry.position.xy;
`
  ),
  "fs:#decl": (
    /* glsl */
    `
in vec2 clip_commonPosition;
`
  ),
  "fs:DECKGL_FILTER_COLOR": (
    /* glsl */
    `
  if (!clip_isInBounds(clip_commonPosition)) discard;
`
  )
};
var ClipExtension = class extends LayerExtension {
  getShaders() {
    let clipByInstance = "instancePositions" in this.getAttributeManager().attributes;
    if (this.props.clipByInstance !== void 0) {
      clipByInstance = Boolean(this.props.clipByInstance);
    }
    this.state.clipByInstance = clipByInstance;
    return clipByInstance ? {
      modules: [shaderModuleVs],
      inject: injectionVs
    } : {
      modules: [shaderModuleFs],
      inject: injectionFs
    };
  }
  /* eslint-disable camelcase */
  draw() {
    const { clipBounds } = this.props;
    const clipProps = {};
    if (this.state.clipByInstance) {
      clipProps.bounds = clipBounds;
    } else {
      const corner0 = this.projectPosition([clipBounds[0], clipBounds[1], 0]);
      const corner1 = this.projectPosition([clipBounds[2], clipBounds[3], 0]);
      clipProps.bounds = [
        Math.min(corner0[0], corner1[0]),
        Math.min(corner0[1], corner1[1]),
        Math.max(corner0[0], corner1[0]),
        Math.max(corner0[1], corner1[1])
      ];
    }
    this.setShaderModuleProps({ clip: clipProps });
  }
};
ClipExtension.defaultProps = defaultProps30;
ClipExtension.extensionName = "ClipExtension";

// dist/mvt-layer/mvt-layer.js
var import_core59 = require("@math.gl/core");
var import_mvt = require("@loaders.gl/mvt");
var import_gis = require("@loaders.gl/gis");

// dist/mvt-layer/coordinate-transform.js
var import_core57 = require("@math.gl/core");
var availableTransformations = {
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon
};
function Point([pointX, pointY], [nw, se], viewport) {
  const x = (0, import_core57.lerp)(nw[0], se[0], pointX);
  const y = (0, import_core57.lerp)(nw[1], se[1], pointY);
  return viewport.unprojectFlat([x, y]);
}
function getPoints(geometry, bbox, viewport) {
  return geometry.map((g) => Point(g, bbox, viewport));
}
function MultiPoint(multiPoint, bbox, viewport) {
  return getPoints(multiPoint, bbox, viewport);
}
function LineString(line, bbox, viewport) {
  return getPoints(line, bbox, viewport);
}
function MultiLineString(multiLineString, bbox, viewport) {
  return multiLineString.map((lineString) => LineString(lineString, bbox, viewport));
}
function Polygon(polygon, bbox, viewport) {
  return polygon.map((polygonRing) => getPoints(polygonRing, bbox, viewport));
}
function MultiPolygon(multiPolygon, bbox, viewport) {
  return multiPolygon.map((polygon) => Polygon(polygon, bbox, viewport));
}
function transform(geometry, bbox, viewport) {
  const nw = viewport.projectFlat([bbox.west, bbox.north]);
  const se = viewport.projectFlat([bbox.east, bbox.south]);
  const projectedBbox = [nw, se];
  return {
    ...geometry,
    coordinates: availableTransformations[geometry.type](geometry.coordinates, projectedBbox, viewport)
  };
}

// dist/mvt-layer/find-index-binary.js
var GEOM_TYPES = ["points", "lines", "polygons"];
function findIndexBinary(data, uniqueIdProperty, featureId, layerName) {
  for (const gt of GEOM_TYPES) {
    const index = data[gt] && findIndexByType(data[gt], uniqueIdProperty, featureId, layerName);
    if (index >= 0) {
      return index;
    }
  }
  return -1;
}
function findIndexByType(geomData, uniqueIdProperty, featureId, layerName) {
  const featureIds = geomData.featureIds.value;
  if (!featureIds.length) {
    return -1;
  }
  let startFeatureIndex = 0;
  let endFeatureIndex = featureIds[featureIds.length - 1] + 1;
  if (layerName) {
    const layerRange = getLayerRange(geomData, layerName);
    if (layerRange) {
      startFeatureIndex = layerRange[0];
      endFeatureIndex = layerRange[1] + 1;
    } else {
      return -1;
    }
  }
  let featureIndex = -1;
  if (uniqueIdProperty in geomData.numericProps) {
    const vertexIndex = geomData.numericProps[uniqueIdProperty].value.findIndex((x, i) => x === featureId && featureIds[i] >= startFeatureIndex && featureIds[i] < endFeatureIndex);
    return vertexIndex >= 0 ? geomData.globalFeatureIds.value[vertexIndex] : -1;
  } else if (uniqueIdProperty) {
    featureIndex = findIndex(geomData.properties, (elem) => elem[uniqueIdProperty] === featureId, startFeatureIndex, endFeatureIndex);
  } else if (geomData.fields) {
    featureIndex = findIndex(geomData.fields, (elem) => elem.id === featureId, startFeatureIndex, endFeatureIndex);
  }
  return featureIndex >= 0 ? getGlobalFeatureId(geomData, featureIndex) : -1;
}
function getLayerRange(geomData, layerName) {
  if (!geomData.__layers) {
    const layerNames = {};
    const { properties } = geomData;
    for (let i = 0; i < properties.length; i++) {
      const { layerName: key } = properties[i];
      if (!key) {
      } else if (layerNames[key]) {
        layerNames[key][1] = i;
      } else {
        layerNames[key] = [i, i];
      }
    }
    geomData.__layers = layerNames;
  }
  return geomData.__layers[layerName];
}
function getGlobalFeatureId(geomData, featureIndex) {
  if (!geomData.__ids) {
    const result = [];
    const featureIds = geomData.featureIds.value;
    const globalFeatureIds = geomData.globalFeatureIds.value;
    for (let i = 0; i < featureIds.length; i++) {
      result[featureIds[i]] = globalFeatureIds[i];
    }
    geomData.__ids = result;
  }
  return geomData.__ids[featureIndex];
}
function findIndex(array, predicate, startIndex, endIndex) {
  for (let i = startIndex; i < endIndex; i++) {
    if (predicate(array[i], i)) {
      return i;
    }
  }
  return -1;
}

// dist/mvt-layer/mvt-layer.js
var WORLD_SIZE = 512;
var defaultProps31 = {
  ...GeoJsonLayer.defaultProps,
  data: urlType,
  onDataLoad: { type: "function", value: null, optional: true, compare: false },
  uniqueIdProperty: "",
  highlightedFeatureId: null,
  loaders: [import_mvt.MVTWorkerLoader],
  binary: true
};
var MVTLayer = class extends tile_layer_default {
  initializeState() {
    super.initializeState();
    const binary = this.context.viewport.resolution !== void 0 ? false : this.props.binary;
    this.setState({
      binary,
      data: null,
      tileJSON: null,
      hoveredFeatureId: null,
      hoveredFeatureLayerName: null
    });
  }
  get isLoaded() {
    var _a;
    return Boolean(((_a = this.state) == null ? void 0 : _a.data) && super.isLoaded);
  }
  updateState({ props, oldProps, context, changeFlags }) {
    var _a;
    if (changeFlags.dataChanged) {
      this._updateTileData();
    }
    if ((_a = this.state) == null ? void 0 : _a.data) {
      super.updateState({ props, oldProps, context, changeFlags });
      this._setWGS84PropertyForTiles();
    }
    const { highlightColor } = props;
    if (highlightColor !== oldProps.highlightColor && Array.isArray(highlightColor)) {
      this.setState({ highlightColor });
    }
  }
  /* eslint-disable complexity */
  async _updateTileData() {
    let data = this.props.data;
    let tileJSON = null;
    if (typeof data === "string" && !isURLTemplate(data)) {
      const { onDataLoad, fetch } = this.props;
      this.setState({ data: null, tileJSON: null });
      try {
        tileJSON = await fetch(data, { propName: "data", layer: this, loaders: [] });
      } catch (error) {
        this.raiseError(error, "loading TileJSON");
        data = null;
      }
      if (onDataLoad) {
        onDataLoad(tileJSON, { propName: "data", layer: this });
      }
    } else if (data && typeof data === "object" && "tilejson" in data) {
      tileJSON = data;
    }
    if (tileJSON) {
      data = tileJSON.tiles;
    }
    this.setState({ data, tileJSON });
  }
  _getTilesetOptions() {
    const opts = super._getTilesetOptions();
    const tileJSON = this.state.tileJSON;
    const { minZoom, maxZoom } = this.props;
    if (tileJSON) {
      if (Number.isFinite(tileJSON.minzoom) && tileJSON.minzoom > minZoom) {
        opts.minZoom = tileJSON.minzoom;
      }
      if (Number.isFinite(tileJSON.maxzoom) && (!Number.isFinite(maxZoom) || tileJSON.maxzoom < maxZoom)) {
        opts.maxZoom = tileJSON.maxzoom;
      }
    }
    return opts;
  }
  /* eslint-disable complexity */
  renderLayers() {
    var _a;
    if (!((_a = this.state) == null ? void 0 : _a.data))
      return null;
    return super.renderLayers();
  }
  getTileData(loadProps) {
    const { data, binary } = this.state;
    const { index, signal } = loadProps;
    const url = getURLFromTemplate(data, loadProps);
    if (!url) {
      return Promise.reject("Invalid URL");
    }
    let loadOptions = this.getLoadOptions();
    const { fetch } = this.props;
    loadOptions = {
      ...loadOptions,
      core: {
        ...loadOptions == null ? void 0 : loadOptions.core,
        mimeType: "application/x-protobuf"
      },
      mvt: {
        ...loadOptions == null ? void 0 : loadOptions.mvt,
        shape: binary ? "binary" : "geojson",
        coordinates: this.context.viewport.resolution ? "wgs84" : "local",
        tileIndex: index
        // Local worker debug
        // workerUrl: `modules/mvt/dist/mvt-loader.worker.js`
        // Set worker to null to skip web workers
        // workerUrl: null
      }
    };
    return fetch(url, { propName: "data", layer: this, loadOptions, signal });
  }
  renderSubLayers(props) {
    const { x, y, z } = props.tile.index;
    const worldScale = Math.pow(2, z);
    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;
    const xOffset = WORLD_SIZE * x / worldScale;
    const yOffset = WORLD_SIZE * (1 - y / worldScale);
    const modelMatrix2 = new import_core59.Matrix4().scale([xScale, yScale, 1]);
    props.autoHighlight = false;
    if (!this.context.viewport.resolution) {
      props.modelMatrix = modelMatrix2;
      props.coordinateOrigin = [xOffset, yOffset, 0];
      props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
      props.extensions = [...props.extensions || [], new ClipExtension()];
    }
    const subLayers = super.renderSubLayers(props);
    if (this.state.binary && !(subLayers instanceof GeoJsonLayer)) {
      log_default.warn("renderSubLayers() must return GeoJsonLayer when using binary:true")();
    }
    return subLayers;
  }
  _updateAutoHighlight(info) {
    const { uniqueIdProperty } = this.props;
    const { hoveredFeatureId, hoveredFeatureLayerName } = this.state;
    const hoveredFeature = info.object;
    let newHoveredFeatureId = null;
    let newHoveredFeatureLayerName = null;
    if (hoveredFeature) {
      newHoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniqueIdProperty);
      newHoveredFeatureLayerName = getFeatureLayerName(hoveredFeature);
    }
    let { highlightColor } = this.props;
    if (typeof highlightColor === "function") {
      highlightColor = highlightColor(info);
    }
    if (hoveredFeatureId !== newHoveredFeatureId || hoveredFeatureLayerName !== newHoveredFeatureLayerName) {
      this.setState({
        highlightColor,
        hoveredFeatureId: newHoveredFeatureId,
        hoveredFeatureLayerName: newHoveredFeatureLayerName
      });
    }
  }
  _isWGS84() {
    return Boolean(this.context.viewport.resolution);
  }
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);
    if (this.state.binary && info.index !== -1) {
      const { data } = params.sourceLayer.props;
      info.object = (0, import_gis.binaryToGeojson)(data, {
        globalFeatureId: info.index
      });
    }
    if (info.object && !this._isWGS84()) {
      info.object = transformTileCoordsToWGS84(
        info.object,
        info.tile.bbox,
        // eslint-disable-line
        this.context.viewport
      );
    }
    return info;
  }
  getSubLayerPropsByTile(tile) {
    return {
      highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
      highlightColor: this.state.highlightColor
    };
  }
  getHighlightedObjectIndex(tile) {
    const { hoveredFeatureId, hoveredFeatureLayerName, binary } = this.state;
    const { uniqueIdProperty, highlightedFeatureId } = this.props;
    const data = tile.content;
    const isHighlighted = isFeatureIdDefined(highlightedFeatureId);
    const isFeatureIdPresent = isFeatureIdDefined(hoveredFeatureId) || isHighlighted;
    if (!isFeatureIdPresent) {
      return -1;
    }
    const featureIdToHighlight = isHighlighted ? highlightedFeatureId : hoveredFeatureId;
    if (Array.isArray(data)) {
      return data.findIndex((feature) => {
        const isMatchingId = getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight;
        const isMatchingLayer = isHighlighted || getFeatureLayerName(feature) === hoveredFeatureLayerName;
        return isMatchingId && isMatchingLayer;
      });
    } else if (data && binary) {
      return findIndexBinary(data, uniqueIdProperty, featureIdToHighlight, isHighlighted ? "" : hoveredFeatureLayerName);
    }
    return -1;
  }
  _pickObjects(maxObjects) {
    const { deck, viewport } = this.context;
    const width = viewport.width;
    const height = viewport.height;
    const x = viewport.x;
    const y = viewport.y;
    const layerIds = [this.id];
    return deck.pickObjects({ x, y, width, height, layerIds, maxObjects });
  }
  /** Get the rendered features in the current viewport. */
  getRenderedFeatures(maxFeatures = null) {
    const features = this._pickObjects(maxFeatures);
    const featureCache = /* @__PURE__ */ new Set();
    const renderedFeatures = [];
    for (const f of features) {
      const featureId = getFeatureUniqueId(f.object, this.props.uniqueIdProperty);
      if (featureId === void 0) {
        renderedFeatures.push(f.object);
      } else if (!featureCache.has(featureId)) {
        featureCache.add(featureId);
        renderedFeatures.push(f.object);
      }
    }
    return renderedFeatures;
  }
  _setWGS84PropertyForTiles() {
    const propName = "dataInWGS84";
    const tileset = this.state.tileset;
    tileset.selectedTiles.forEach((tile) => {
      if (!tile.hasOwnProperty(propName)) {
        Object.defineProperty(tile, propName, {
          get: () => {
            if (!tile.content) {
              return null;
            }
            if (this.state.binary && Array.isArray(tile.content) && !tile.content.length) {
              return [];
            }
            const { bbox } = tile;
            if (tile._contentWGS84 === void 0 && isGeoBoundingBox(bbox)) {
              const content = this.state.binary ? (0, import_gis.binaryToGeojson)(tile.content) : tile.content;
              tile._contentWGS84 = content.map((feature) => transformTileCoordsToWGS84(feature, bbox, this.context.viewport));
            }
            return tile._contentWGS84;
          }
        });
      }
    });
  }
};
MVTLayer.layerName = "MVTLayer";
MVTLayer.defaultProps = defaultProps31;
var mvt_layer_default = MVTLayer;
function getFeatureUniqueId(feature, uniqueIdProperty) {
  if (feature.properties && uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }
  if ("id" in feature) {
    return feature.id;
  }
  return void 0;
}
function getFeatureLayerName(feature) {
  var _a;
  return ((_a = feature.properties) == null ? void 0 : _a.layerName) || null;
}
function isFeatureIdDefined(value) {
  return value !== void 0 && value !== null && value !== "";
}
function transformTileCoordsToWGS84(object, bbox, viewport) {
  const feature = {
    ...object,
    geometry: {
      type: object.geometry.type
    }
  };
  Object.defineProperty(feature.geometry, "coordinates", {
    get: () => {
      const wgs84Geom = transform(object.geometry, bbox, viewport);
      return wgs84Geom.coordinates;
    }
  });
  return feature;
}

// dist/geohash-layer/geohash-utils.js
var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
var BASE32_CODES_DICT = {};
for (let i = 0; i < BASE32_CODES.length; i++) {
  BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}
var MIN_LAT = -90;
var MAX_LAT = 90;
var MIN_LON = -180;
var MAX_LON = 180;
function getGeohashBounds(geohash) {
  let isLon = true;
  let maxLat = MAX_LAT;
  let minLat = MIN_LAT;
  let maxLon = MAX_LON;
  let minLon = MIN_LON;
  let mid;
  let hashValue = 0;
  for (let i = 0, l = geohash.length; i < l; i++) {
    const code = geohash[i].toLowerCase();
    hashValue = BASE32_CODES_DICT[code];
    for (let bits = 4; bits >= 0; bits--) {
      const bit = hashValue >> bits & 1;
      if (isLon) {
        mid = (maxLon + minLon) / 2;
        if (bit === 1) {
          minLon = mid;
        } else {
          maxLon = mid;
        }
      } else {
        mid = (maxLat + minLat) / 2;
        if (bit === 1) {
          minLat = mid;
        } else {
          maxLat = mid;
        }
      }
      isLon = !isLon;
    }
  }
  return [minLat, minLon, maxLat, maxLon];
}
function getGeohashPolygon(geohash) {
  const [s, w, n, e] = getGeohashBounds(geohash);
  return [e, n, e, s, w, s, w, n, e, n];
}

// dist/geohash-layer/geohash-layer.js
var defaultProps32 = {
  getGeohash: { type: "accessor", value: (d) => d.geohash }
};
var GeohashLayer = class extends GeoCellLayer_default {
  indexToBounds() {
    const { data, getGeohash } = this.props;
    return {
      data,
      _normalize: false,
      positionFormat: "XY",
      getPolygon: (x, objectInfo) => getGeohashPolygon(getGeohash(x, objectInfo))
    };
  }
};
GeohashLayer.layerName = "GeohashLayer";
GeohashLayer.defaultProps = defaultProps32;
var geohash_layer_default = GeohashLayer;
//# sourceMappingURL=index.cjs.map
