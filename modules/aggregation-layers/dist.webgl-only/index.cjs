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
  CPUAggregator: () => CPUAggregator,
  ContourLayer: () => contour_layer_default,
  GridLayer: () => grid_layer_default,
  HeatmapLayer: () => heatmap_layer_default,
  HexagonLayer: () => hexagon_layer_default,
  ScreenGridLayer: () => screen_grid_layer_default,
  WebGLAggregator: () => WebGLAggregator,
  _AggregationLayer: () => aggregation_layer_default
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
  modelMatrix = null,
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
  uniforms.modelMatrix = modelMatrix || IDENTITY_MATRIX;
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
    const EARTH_RADIUS = 6370972;
    const GLOBE_RADIUS = 256;
    const lambda = coordinateOrigin[0] * Math.PI / 180;
    const phi = coordinateOrigin[1] * Math.PI / 180;
    const cosPhi = Math.cos(phi);
    const D = ((coordinateOrigin[2] || 0) / EARTH_RADIUS + 1) * GLOBE_RADIUS;
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
function addPickingUniformsGLSL(source3) {
  return source3.replace(
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
  allocate(typedArray, count3, {
    size = 1,
    type,
    padding = 0,
    copy = false,
    initialize = false,
    maxCount
  }) {
    const Type = type || typedArray && typedArray.constructor || Float32Array;
    const newSize = count3 * size + padding;
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
  const count3 = (endIndex - startIndex) / size;
  scratchArray = typed_array_manager_default.allocate(scratchArray, count3, {
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
  return scratchArray.subarray(0, count3 * size * 2);
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
    const { position, modelMatrix } = opts;
    let meterOffset = ZERO_VECTOR2;
    if (position) {
      meterOffset = modelMatrix ? new import_core3.Matrix4(modelMatrix).transformAsVector(position, []) : position;
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
  const { viewport, modelMatrix, coordinateOrigin } = opts;
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
    modelMatrix,
    fromCoordinateSystem,
    fromCoordinateOrigin
  };
}
function getWorldPosition(position, {
  viewport,
  modelMatrix,
  coordinateSystem,
  coordinateOrigin,
  offsetMode
}) {
  let [x, y, z = 0] = position;
  if (modelMatrix) {
    [x, y, z] = import_core5.vec4.transformMat4([], [x, y, z, 1], modelMatrix);
  }
  switch (coordinateSystem) {
    case "default":
      return getWorldPosition(position, {
        viewport,
        modelMatrix,
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
    modelMatrix,
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
    modelMatrix,
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
function fillArray({ target, source: source3, start = 0, count: count3 = 1 }) {
  const length = source3.length;
  const total = count3 * length;
  let copied = 0;
  for (let i = start; copied < length; copied++) {
    target[i++] = source3[copied];
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
var import_core7 = require("@luma.gl/core");

// ../core/src/lib/attribute/gl-utils.ts
var import_core6 = require("@luma.gl/core");
function typedArrayFromDataType(type) {
  switch (type) {
    case "float64":
      return Float64Array;
    case "uint8":
    case "unorm8":
      return Uint8ClampedArray;
    default:
      return (0, import_core6.getTypedArrayConstructor)(type);
  }
}
var dataTypeFromTypedArray = import_core6.dataTypeDecoder.getDataType.bind(import_core6.dataTypeDecoder);
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
      const min2 = Array.from(this.value);
      result = [min2, min2];
    } else {
      const { value, numInstances, size } = this;
      const len = numInstances * size;
      if (value && len && value.length >= len) {
        const min2 = new Array(size).fill(Infinity);
        const max2 = new Array(size).fill(-Infinity);
        for (let i = 0; i < len; ) {
          for (let j = 0; j < size; j++) {
            const v = value[i++];
            if (v < min2[j]) min2[j] = v;
            if (v > max2[j]) max2[j] = v;
          }
        }
        result = [min2, max2];
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
    } else if (data instanceof import_core7.Buffer) {
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
    const usage = this.device.type === "webgpu" && !isIndexed ? import_core7.Buffer.VERTEX | import_core7.Buffer.STORAGE | import_core7.Buffer.COPY_DST | import_core7.Buffer.COPY_SRC : (isIndexed ? import_core7.Buffer.INDEX : import_core7.Buffer.VERTEX) | import_core7.Buffer.COPY_DST;
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
    const { accessor, transform } = settings;
    const accessorFunc = state.binaryAccessor || // @ts-ignore
    (typeof accessor === "function" ? accessor : props[accessor]);
    assert(typeof accessorFunc === "function", `accessor "${accessor}" is not a function`);
    let i = attribute.getVertexOffset(startRow);
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      let objectValue = accessorFunc(object, objectInfo);
      if (transform) {
        objectValue = transform.call(this, objectValue);
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
  const source3 = (
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
    source: source3,
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
function preprocess(source3, defines2) {
  for (const key in defines2) {
    source3 = source3.replaceAll(`{${key}}`, defines2[key]);
  }
  return source3;
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
  const source3 = `fn interleave(${argumentList}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${assignments}
  return out;
}
`;
  runRowComputation({
    module: { name: "interleave", source: source3 },
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
  const { source: source3, target, start = 0, size, getData } = options;
  const end = options.end || target.length;
  const sourceLength = source3.length;
  const targetLength = end - start;
  if (sourceLength > targetLength) {
    target.set(source3.subarray(0, targetLength), start);
    return;
  }
  target.set(source3, start);
  if (!getData) {
    return;
  }
  let i = sourceLength;
  while (i < targetLength) {
    const datum = getData(i, source3);
    for (let j = 0; j < size; j++) {
      target[start + i] = datum[j] || 0;
      i++;
    }
  }
}
function padArray({
  source: source3,
  target,
  size,
  getData,
  sourceStartIndices,
  targetStartIndices
}) {
  if (!sourceStartIndices || !targetStartIndices) {
    padArrayChunk({
      source: source3,
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
      source: source3.subarray(sourceIndex, nextSourceIndex),
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
  source: source3,
  target
}) {
  if (!target || target.byteLength < source3.byteLength) {
    target == null ? void 0 : target.destroy();
    target = device.createBuffer({
      byteLength: source3.byteLength,
      usage: source3.usage
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
  const source3 = buffer ? new Float32Array(buffer.readSyncWebGL(targetByteOffset, fromLength * 4).buffer) : new Float32Array(0);
  const target = new Float32Array(toLength);
  padArray({
    source: source3,
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
    const { transform } = this;
    const model = transform.model;
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
    transform.transformFeedback.setBuffers({ vCurrent: buffers[1] });
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
    const { buffers, transform, framebuffer, transition } = this;
    const settings = this.settings;
    transform.model.setAttributes({
      aPrev: buffers[0],
      aCur: buffers[1]
    });
    transform.transformFeedback.setBuffers({ vNext: buffers[2] });
    const springProps = {
      stiffness: settings.stiffness,
      damping: settings.damping
    };
    transform.model.shaderInputs.setProps({ spring: springProps });
    transform.run({
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
var import_core10 = require("@luma.gl/core");
var import_webgl = require("@luma.gl/webgl");

// ../core/src/transitions/cpu-interpolation-transition.ts
var import_core8 = require("@math.gl/core");
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
    this._value = (0, import_core8.lerp)(fromValue, toValue, t);
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
function mergeShaders(target, source3) {
  if (!source3) {
    return target;
  }
  const result = { ...target, ...source3 };
  if ("defines" in source3) {
    result.defines = { ...target.defines, ...source3.defines };
  }
  if ("modules" in source3) {
    result.modules = (target.modules || []).concat(source3.modules);
    if (source3.modules.some((module2) => module2.name === "project64")) {
      const index = result.modules.findIndex((module2) => module2.name === "project32");
      if (index >= 0) {
        result.modules.splice(index, 1);
      }
    }
  }
  if ("inject" in source3) {
    if (!target.inject) {
      result.inject = source3.inject;
    } else {
      const mergedInjection = { ...target.inject };
      for (const key in source3.inject) {
        mergedInjection[key] = (mergedInjection[key] || "") + source3.inject[key];
      }
      result.inject = mergedInjection;
    }
  }
  return result;
}

// ../core/src/utils/texture.ts
var import_core9 = require("@luma.gl/core");
var DEFAULT_TEXTURE_PARAMETERS = {
  minFilter: "linear",
  mipmapFilter: "linear",
  magFilter: "linear",
  addressModeU: "clamp-to-edge",
  addressModeV: "clamp-to-edge"
};
var internalTextures = {};
function createTexture(owner, device, image, sampler) {
  if (image instanceof import_core9.Texture) {
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
  if (!texture || !(texture instanceof import_core9.Texture)) {
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
  const defaultProps10 = {};
  const deprecatedProps = {};
  for (const [propName, propDef] of Object.entries(propDefs)) {
    const deprecated = propDef == null ? void 0 : propDef.deprecatedFor;
    if (deprecated) {
      deprecatedProps[propName] = Array.isArray(deprecated) ? deprecated : [deprecated];
    } else {
      const propType = parsePropType(propName, propDef);
      propTypes[propName] = propType;
      defaultProps10[propName] = propType.value;
    }
  }
  return { propTypes, defaultProps: defaultProps10, deprecatedProps };
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
  const defaultProps10 = getOwnProperty(componentClass, cacheKey);
  if (!defaultProps10) {
    return componentClass[cacheKey] = createPropsPrototypeAndTypes(
      componentClass,
      extensions || []
    );
  }
  return defaultProps10;
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
  const defaultProps10 = Object.assign(
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
      Object.assign(defaultProps10, extensionDefaultProps);
      Object.assign(propTypes, extensionDefaultProps[PROP_TYPES_SYMBOL]);
      Object.assign(deprecatedProps, extensionDefaultProps[DEPRECATED_PROPS_SYMBOL]);
    }
  }
  createPropsPrototype(defaultProps10, componentClass);
  addAsyncPropsToPropPrototype(defaultProps10, propTypes);
  addDeprecatedPropsToPropPrototype(defaultProps10, deprecatedProps);
  defaultProps10[PROP_TYPES_SYMBOL] = propTypes;
  defaultProps10[DEPRECATED_PROPS_SYMBOL] = deprecatedProps;
  if (extensions.length === 0 && !hasOwnProperty(componentClass, "_propTypes")) {
    componentClass._propTypes = propTypes;
  }
  return defaultProps10;
}
function createPropsPrototype(defaultProps10, componentClass) {
  const id = getComponentName(componentClass);
  Object.defineProperties(defaultProps10, {
    // `id` is treated specially because layer might need to override it
    id: {
      writable: true,
      value: id
    }
  });
}
function addDeprecatedPropsToPropPrototype(defaultProps10, deprecatedProps) {
  for (const propName in deprecatedProps) {
    Object.defineProperty(defaultProps10, propName, {
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
function addAsyncPropsToPropPrototype(defaultProps10, propTypes) {
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
  defaultProps10[ASYNC_DEFAULTS_SYMBOL] = defaultValues;
  defaultProps10[ASYNC_ORIGINAL_SYMBOL] = {};
  Object.defineProperties(defaultProps10, descriptors);
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
    let count3 = 0;
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
        value: [{ startRow: count3, endRow: data.length }]
      });
      count3 = data.length;
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
var import_web_mercator4 = require("@math.gl/web-mercator");
var import_core11 = require("@loaders.gl/core");
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
        resourceManager.add({ resourceId: url, data: (0, import_core11.load)(url, loaders), persistent: false });
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
      return (0, import_core11.load)(url, loaders, loadOptions);
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
    const [x, y, z] = (0, import_web_mercator4.worldToPixels)(worldPosition, viewport.pixelProjectionMatrix);
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
        if (value instanceof import_core10.Buffer) {
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
        if (value instanceof import_core10.Buffer) {
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
      modelMatrix,
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
      modelMatrix,
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

// ../core/src/utils/tesselator.ts
var import_core12 = require("@luma.gl/core");
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
      getGeometry,
      geometryBuffer,
      positionFormat,
      dataChanged,
      normalize: normalize2 = true
    } = this.opts;
    this.data = data;
    this.getGeometry = getGeometry;
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
    const { data, getGeometry } = this;
    const { iterable, objectInfo } = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const geometry = getGeometry ? getGeometry(object, objectInfo) : null;
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
      } else if (geometryBuffer instanceof import_core12.Buffer) {
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

// dist/common/aggregator/cpu-aggregator/sort-bins.js
function sortBins({ pointCount, getBinId }) {
  const binsById = /* @__PURE__ */ new Map();
  for (let i = 0; i < pointCount; i++) {
    const id = getBinId(i);
    if (id === null) {
      continue;
    }
    let bin = binsById.get(String(id));
    if (bin) {
      bin.points.push(i);
    } else {
      bin = {
        id,
        index: binsById.size,
        points: [i]
      };
      binsById.set(String(id), bin);
    }
  }
  return Array.from(binsById.values());
}
function packBinIds({ bins, dimensions, target }) {
  const targetLength = bins.length * dimensions;
  if (!target || target.length < targetLength) {
    target = new Float32Array(targetLength);
  }
  for (let i = 0; i < bins.length; i++) {
    const { id } = bins[i];
    if (Array.isArray(id)) {
      target.set(id, i * dimensions);
    } else {
      target[i] = id;
    }
  }
  return target;
}

// dist/common/aggregator/cpu-aggregator/aggregate.js
var count2 = (pointIndices) => {
  return pointIndices.length;
};
var sum = (pointIndices, getValue) => {
  let result = 0;
  for (const i of pointIndices) {
    result += getValue(i);
  }
  return result;
};
var mean = (pointIndices, getValue) => {
  if (pointIndices.length === 0) {
    return NaN;
  }
  return sum(pointIndices, getValue) / pointIndices.length;
};
var min = (pointIndices, getValue) => {
  let result = Infinity;
  for (const i of pointIndices) {
    const value = getValue(i);
    if (value < result) {
      result = value;
    }
  }
  return result;
};
var max = (pointIndices, getValue) => {
  let result = -Infinity;
  for (const i of pointIndices) {
    const value = getValue(i);
    if (value > result) {
      result = value;
    }
  }
  return result;
};
var BUILT_IN_OPERATIONS = {
  COUNT: count2,
  SUM: sum,
  MEAN: mean,
  MIN: min,
  MAX: max
};
function aggregate({ bins, getValue, operation, target }) {
  if (!target || target.length < bins.length) {
    target = new Float32Array(bins.length);
  }
  let min2 = Infinity;
  let max2 = -Infinity;
  for (let j = 0; j < bins.length; j++) {
    const { points } = bins[j];
    target[j] = operation(points, getValue);
    if (target[j] < min2)
      min2 = target[j];
    if (target[j] > max2)
      max2 = target[j];
  }
  return { value: target, domain: [min2, max2] };
}

// dist/common/aggregator/cpu-aggregator/vertex-accessor.js
function evaluateVertexAccessor(accessor, attributes, options) {
  const vertexReaders = {};
  for (const id of accessor.sources || []) {
    const attribute = attributes[id];
    if (attribute) {
      vertexReaders[id] = getVertexReader(attribute);
    } else {
      throw new Error(`Cannot find attribute ${id}`);
    }
  }
  const data = {};
  return (vertexIndex) => {
    for (const id in vertexReaders) {
      data[id] = vertexReaders[id](vertexIndex);
    }
    return accessor.getValue(data, vertexIndex, options);
  };
}
function getVertexReader(attribute) {
  const value = attribute.value;
  const { offset = 0, stride, size } = attribute.getAccessor();
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementOffset = offset / bytesPerElement;
  const elementStride = stride ? stride / bytesPerElement : size;
  if (size === 1) {
    if (attribute.isConstant) {
      return () => value[0];
    }
    return (vertexIndex) => {
      const i = elementOffset + elementStride * vertexIndex;
      return value[i];
    };
  }
  let result;
  if (attribute.isConstant) {
    result = Array.from(value);
    return () => result;
  }
  result = new Array(size);
  return (vertexIndex) => {
    const i = elementOffset + elementStride * vertexIndex;
    for (let j = 0; j < size; j++) {
      result[j] = value[i + j];
    }
    return result;
  };
}

// dist/common/aggregator/cpu-aggregator/cpu-aggregator.js
var CPUAggregator = class {
  constructor(props) {
    this.bins = [];
    this.binIds = null;
    this.results = [];
    this.dimensions = props.dimensions;
    this.channelCount = props.getValue.length;
    this.props = {
      ...props,
      binOptions: {},
      pointCount: 0,
      operations: [],
      customOperations: [],
      attributes: {}
    };
    this.needsUpdate = true;
    this.setProps(props);
  }
  destroy() {
  }
  get binCount() {
    return this.bins.length;
  }
  /** Update aggregation props */
  // eslint-disable-next-line complexity
  setProps(props) {
    const oldProps = this.props;
    if (props.binOptions) {
      if (!deepEqual(props.binOptions, oldProps.binOptions, 2)) {
        this.setNeedsUpdate();
      }
    }
    if (props.operations) {
      for (let channel = 0; channel < this.channelCount; channel++) {
        if (props.operations[channel] !== oldProps.operations[channel]) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.customOperations) {
      for (let channel = 0; channel < this.channelCount; channel++) {
        if (Boolean(props.customOperations[channel]) !== Boolean(oldProps.customOperations[channel])) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.pointCount !== void 0 && props.pointCount !== oldProps.pointCount) {
      this.setNeedsUpdate();
    }
    if (props.attributes) {
      props.attributes = { ...oldProps.attributes, ...props.attributes };
    }
    Object.assign(this.props, props);
  }
  /** Flags a channel to need update
   * This is called internally by setProps() if certain props change
   * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
   * the underlying buffers could have been updated and require rerunning the aggregation
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel) {
    if (channel === void 0) {
      this.needsUpdate = true;
    } else if (this.needsUpdate !== true) {
      this.needsUpdate = this.needsUpdate || [];
      this.needsUpdate[channel] = true;
    }
  }
  /** Run aggregation */
  update() {
    var _a, _b, _c, _d;
    if (this.needsUpdate === true) {
      this.bins = sortBins({
        pointCount: this.props.pointCount,
        getBinId: evaluateVertexAccessor(this.props.getBin, this.props.attributes, this.props.binOptions)
      });
      const value = packBinIds({
        bins: this.bins,
        dimensions: this.dimensions,
        // Reuse allocated typed array
        target: (_a = this.binIds) == null ? void 0 : _a.value
      });
      this.binIds = { value, type: "float32", size: this.dimensions };
    }
    for (let channel = 0; channel < this.channelCount; channel++) {
      if (this.needsUpdate === true || this.needsUpdate[channel]) {
        const operation = this.props.customOperations[channel] || BUILT_IN_OPERATIONS[this.props.operations[channel]];
        const { value, domain } = aggregate({
          bins: this.bins,
          getValue: evaluateVertexAccessor(this.props.getValue[channel], this.props.attributes, void 0),
          operation,
          // Reuse allocated typed array
          target: (_b = this.results[channel]) == null ? void 0 : _b.value
        });
        this.results[channel] = { value, domain, type: "float32", size: 1 };
        (_d = (_c = this.props).onUpdate) == null ? void 0 : _d.call(_c, { channel });
      }
    }
    this.needsUpdate = false;
  }
  preDraw() {
  }
  /** Returns an accessor to the bins. */
  getBins() {
    return this.binIds;
  }
  /** Returns an accessor to the output for a given channel. */
  getResult(channel) {
    return this.results[channel];
  }
  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel) {
    var _a;
    return ((_a = this.results[channel]) == null ? void 0 : _a.domain) ?? [Infinity, -Infinity];
  }
  /** Returns the information for a given bin. */
  getBin(index) {
    const bin = this.bins[index];
    if (!bin) {
      return null;
    }
    const value = new Array(this.channelCount);
    for (let i = 0; i < value.length; i++) {
      const result = this.results[i];
      value[i] = result == null ? void 0 : result.value[index];
    }
    return {
      id: bin.id,
      value,
      count: bin.points.length,
      pointIndices: bin.points
    };
  }
};

// dist/common/aggregator/gpu-aggregator/webgl-bin-sorter.js
var import_engine4 = require("@luma.gl/engine");

// dist/common/aggregator/gpu-aggregator/utils.js
function createRenderTarget(device, width, height) {
  return device.createFramebuffer({
    width,
    height,
    colorAttachments: [
      device.createTexture({
        width,
        height,
        format: "rgba32float",
        sampler: {
          minFilter: "nearest",
          magFilter: "nearest"
        }
      })
    ]
  });
}

// dist/common/aggregator/gpu-aggregator/bin-sorter-uniforms.js
var uniformBlock3 = (
  /* glsl */
  `layout(std140) uniform binSorterUniforms {
  ivec4 binIdRange;
  ivec2 targetSize;
} binSorter;
`
);
var binSorterUniforms = {
  name: "binSorter",
  vs: uniformBlock3,
  uniformTypes: {
    binIdRange: "vec4<i32>",
    targetSize: "vec2<i32>"
  }
};

// dist/common/aggregator/gpu-aggregator/webgl-bin-sorter.js
var COLOR_CHANNELS = [1, 2, 4, 8];
var MAX_FLOAT32 = 3e38;
var EMPTY_MASKS = { SUM: 0, MEAN: 0, MIN: 0, MAX: 0, COUNT: 0 };
var TEXTURE_WIDTH = 1024;
var WebGLBinSorter = class {
  constructor(device, props) {
    this.binsFBO = null;
    this.device = device;
    this.model = createModel(device, props);
  }
  get texture() {
    return this.binsFBO ? this.binsFBO.colorAttachments[0].texture : null;
  }
  destroy() {
    var _a, _b;
    this.model.destroy();
    (_a = this.binsFBO) == null ? void 0 : _a.colorAttachments[0].texture.destroy();
    (_b = this.binsFBO) == null ? void 0 : _b.destroy();
  }
  getBinValues(index) {
    if (!this.binsFBO) {
      return null;
    }
    const x = index % TEXTURE_WIDTH;
    const y = Math.floor(index / TEXTURE_WIDTH);
    const buffer = this.device.readPixelsToArrayWebGL(this.binsFBO, {
      sourceX: x,
      sourceY: y,
      sourceWidth: 1,
      sourceHeight: 1
    }).buffer;
    return new Float32Array(buffer);
  }
  setDimensions(binCount, binIdRange) {
    var _a, _b;
    const width = TEXTURE_WIDTH;
    const height = Math.ceil(binCount / width);
    if (!this.binsFBO) {
      this.binsFBO = createRenderTarget(this.device, width, height);
    } else if (this.binsFBO.height < height) {
      this.binsFBO.resize({ width, height });
    }
    const binSorterProps = {
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        ((_a = binIdRange[1]) == null ? void 0 : _a[0]) || 0,
        ((_b = binIdRange[1]) == null ? void 0 : _b[1]) || 0
      ],
      targetSize: [this.binsFBO.width, this.binsFBO.height]
    };
    this.model.shaderInputs.setProps({ binSorter: binSorterProps });
  }
  setModelProps(props) {
    const model = this.model;
    if (props.attributes) {
      model.setAttributes(props.attributes);
    }
    if (props.constantAttributes) {
      model.setConstantAttributes(props.constantAttributes);
    }
    if (props.vertexCount !== void 0) {
      model.setVertexCount(props.vertexCount);
    }
    if (props.shaderModuleProps) {
      model.shaderInputs.setProps(props.shaderModuleProps);
    }
  }
  /** Update aggregation */
  update(operations) {
    if (!this.binsFBO) {
      return;
    }
    const masks = getMaskByOperation(operations);
    this._updateBins("SUM", masks.SUM + masks.MEAN);
    this._updateBins("MIN", masks.MIN);
    this._updateBins("MAX", masks.MAX);
  }
  /** Recalculate aggregation on the given channels using the given operation */
  _updateBins(operation, colorMask) {
    if (colorMask === 0) {
      return;
    }
    colorMask |= COLOR_CHANNELS[3];
    const model = this.model;
    const target = this.binsFBO;
    const initialValue = operation === "MAX" ? -MAX_FLOAT32 : operation === "MIN" ? MAX_FLOAT32 : 0;
    const renderPass = this.device.beginRenderPass({
      id: `gpu-aggregation-${operation}`,
      framebuffer: target,
      parameters: {
        viewport: [0, 0, target.width, target.height],
        colorMask
      },
      clearColor: [initialValue, initialValue, initialValue, 0],
      clearDepth: false,
      clearStencil: false
    });
    model.setParameters({
      blend: true,
      blendColorSrcFactor: "one",
      blendColorDstFactor: "one",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one",
      blendColorOperation: operation === "MAX" ? "max" : operation === "MIN" ? "min" : "add",
      blendAlphaOperation: "add"
    });
    model.draw(renderPass);
    renderPass.end();
  }
};
function getMaskByOperation(operations) {
  const result = { ...EMPTY_MASKS };
  for (let channel = 0; channel < operations.length; channel++) {
    const op = operations[channel];
    if (op) {
      result[op] += COLOR_CHANNELS[channel];
    }
  }
  return result;
}
function createModel(device, props) {
  let userVs = props.vs;
  if (props.dimensions === 2) {
    userVs += /* glsl */
    `
void getBin(out int binId) {
  ivec2 binId2;
  getBin(binId2);
  if (binId2.x < binSorter.binIdRange.x || binId2.x >= binSorter.binIdRange.y) {
    binId = -1;
  } else {
    binId = (binId2.y - binSorter.binIdRange.z) * (binSorter.binIdRange.y - binSorter.binIdRange.x) + binId2.x;
  }
}
`;
  }
  const vs5 = `#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-vertex

${userVs}

out vec3 v_Value;

void main() {
  int binIndex;
  getBin(binIndex);
  binIndex = binIndex - binSorter.binIdRange.x;
  if (binIndex < 0) {
    gl_Position = vec4(0.);
    return;
  }
  int row = binIndex / binSorter.targetSize.x;
  int col = binIndex - row * binSorter.targetSize.x;
  vec2 position = (vec2(col, row) + 0.5) / vec2(binSorter.targetSize) * 2.0 - 1.0;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 1.0;

#if NUM_CHANNELS == 3
  getValue(v_Value);
#elif NUM_CHANNELS == 2
  getValue(v_Value.xy);
#else
  getValue(v_Value.x);
#endif
}
`;
  const fs3 = (
    /* glsl */
    `#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-fragment

precision highp float;

in vec3 v_Value;
out vec4 fragColor;

void main() {
  fragColor.xyz = v_Value;

  #ifdef MODULE_GEOMETRY
  geometry.uv = vec2(0.);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  #endif

  fragColor.w = 1.0;
}
`
  );
  const model = new import_engine4.Model(device, {
    bufferLayout: props.bufferLayout,
    modules: [...props.modules || [], binSorterUniforms],
    defines: { ...props.defines, NON_INSTANCED_MODEL: 1, NUM_CHANNELS: props.channelCount },
    isInstanced: false,
    vs: vs5,
    fs: fs3,
    topology: "point-list",
    disableWarnings: true
  });
  return model;
}

// dist/common/aggregator/gpu-aggregator/webgl-aggregation-transform.js
var import_engine5 = require("@luma.gl/engine");

// dist/common/aggregator/gpu-aggregator/aggregation-transform-uniforms.js
var uniformBlock4 = (
  /* glsl */
  `layout(std140) uniform aggregatorTransformUniforms {
  ivec4 binIdRange;
  bvec3 isCount;
  bvec3 isMean;
  float naN;
} aggregatorTransform;
`
);
var aggregatorTransformUniforms = {
  name: "aggregatorTransform",
  vs: uniformBlock4,
  uniformTypes: {
    binIdRange: "vec4<i32>",
    isCount: "vec3<f32>",
    isMean: "vec3<f32>",
    naN: "f32"
  }
};

// dist/common/aggregator/gpu-aggregator/webgl-aggregation-transform.js
var MAX_FLOAT322 = 3e38;
var WebGLAggregationTransform = class {
  constructor(device, props) {
    this.binBuffer = null;
    this.valueBuffer = null;
    this._domains = null;
    this.device = device;
    this.channelCount = props.channelCount;
    this.transform = createTransform(device, props);
    this.domainFBO = createRenderTarget(device, 2, 1);
  }
  destroy() {
    var _a, _b;
    this.transform.destroy();
    (_a = this.binBuffer) == null ? void 0 : _a.destroy();
    (_b = this.valueBuffer) == null ? void 0 : _b.destroy();
    this.domainFBO.colorAttachments[0].texture.destroy();
    this.domainFBO.destroy();
  }
  get domains() {
    if (!this._domains) {
      const buffer = this.device.readPixelsToArrayWebGL(this.domainFBO).buffer;
      const domain = new Float32Array(buffer);
      this._domains = [
        [-domain[4], domain[0]],
        [-domain[5], domain[1]],
        [-domain[6], domain[2]]
      ].slice(0, this.channelCount);
    }
    return this._domains;
  }
  setDimensions(binCount, binIdRange) {
    var _a, _b, _c, _d;
    const { model, transformFeedback } = this.transform;
    model.setVertexCount(binCount);
    const aggregatorTransformProps = {
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        ((_a = binIdRange[1]) == null ? void 0 : _a[0]) || 0,
        ((_b = binIdRange[1]) == null ? void 0 : _b[1]) || 0
      ]
    };
    model.shaderInputs.setProps({ aggregatorTransform: aggregatorTransformProps });
    const binBufferByteLength = binCount * binIdRange.length * 4;
    if (!this.binBuffer || this.binBuffer.byteLength < binBufferByteLength) {
      (_c = this.binBuffer) == null ? void 0 : _c.destroy();
      this.binBuffer = this.device.createBuffer({ byteLength: binBufferByteLength });
      transformFeedback.setBuffer("binIds", this.binBuffer);
    }
    const valueBufferByteLength = binCount * this.channelCount * 4;
    if (!this.valueBuffer || this.valueBuffer.byteLength < valueBufferByteLength) {
      (_d = this.valueBuffer) == null ? void 0 : _d.destroy();
      this.valueBuffer = this.device.createBuffer({ byteLength: valueBufferByteLength });
      transformFeedback.setBuffer("values", this.valueBuffer);
    }
  }
  update(bins, operations) {
    if (!bins) {
      return;
    }
    const transform = this.transform;
    const target = this.domainFBO;
    const isCount = [0, 1, 2].map((i) => operations[i] === "COUNT" ? 1 : 0);
    const isMean = [0, 1, 2].map((i) => operations[i] === "MEAN" ? 1 : 0);
    const aggregatorTransformProps = {
      isCount,
      isMean,
      bins
    };
    transform.model.shaderInputs.setProps({ aggregatorTransform: aggregatorTransformProps });
    transform.run({
      id: "gpu-aggregation-domain",
      framebuffer: target,
      discard: false,
      parameters: {
        viewport: [0, 0, 2, 1]
      },
      clearColor: [-MAX_FLOAT322, -MAX_FLOAT322, -MAX_FLOAT322, 0],
      clearDepth: false,
      clearStencil: false
    });
    this._domains = null;
  }
};
function createTransform(device, props) {
  const vs5 = (
    /* glsl */
    `#version 300 es
#define SHADER_NAME gpu-aggregation-domain-vertex

uniform sampler2D bins;

#if NUM_DIMS == 1
out float binIds;
#else
out vec2 binIds;
#endif

#if NUM_CHANNELS == 1
flat out float values;
#elif NUM_CHANNELS == 2
flat out vec2 values;
#else
flat out vec3 values;
#endif

const float NAN = intBitsToFloat(-1);

void main() {
  int row = gl_VertexID / SAMPLER_WIDTH;
  int col = gl_VertexID - row * SAMPLER_WIDTH;
  vec4 weights = texelFetch(bins, ivec2(col, row), 0);
  vec3 value3 = mix(
    mix(weights.rgb, vec3(weights.a), aggregatorTransform.isCount),
    weights.rgb / max(weights.a, 1.0),
    aggregatorTransform.isMean
  );
  if (weights.a == 0.0) {
    value3 = vec3(NAN);
  }

#if NUM_DIMS == 1
  binIds = float(gl_VertexID + aggregatorTransform.binIdRange.x);
#else
  int y = gl_VertexID / (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  int x = gl_VertexID - y * (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  binIds.y = float(y + aggregatorTransform.binIdRange.z);
  binIds.x = float(x + aggregatorTransform.binIdRange.x);
#endif

#if NUM_CHANNELS == 3
  values = value3;
#elif NUM_CHANNELS == 2
  values = value3.xy;
#else
  values = value3.x;
#endif

  gl_Position = vec4(0., 0., 0., 1.);
  // This model renders into a 2x1 texture to obtain min and max simultaneously.
  // See comments in fragment shader
  gl_PointSize = 2.0;
}
`
  );
  const fs3 = (
    /* glsl */
    `#version 300 es
#define SHADER_NAME gpu-aggregation-domain-fragment

precision highp float;

#if NUM_CHANNELS == 1
flat in float values;
#elif NUM_CHANNELS == 2
flat in vec2 values;
#else
flat in vec3 values;
#endif

out vec4 fragColor;

void main() {
  vec3 value3;
#if NUM_CHANNELS == 3
  value3 = values;
#elif NUM_CHANNELS == 2
  value3.xy = values;
#else
  value3.x = values;
#endif
  if (isnan(value3.x)) discard;
  // This shader renders into a 2x1 texture with blending=max
  // The left pixel yields the max value of each channel
  // The right pixel yields the min value of each channel
  if (gl_FragCoord.x < 1.0) {
    fragColor = vec4(value3, 1.0);
  } else {
    fragColor = vec4(-value3, 1.0);
  }
}
`
  );
  if (device.type === "webgl") {
    device.getExtension("GL_ARB_shader_bit_encoding");
  }
  return new import_engine5.BufferTransform(device, {
    vs: vs5,
    fs: fs3,
    topology: "point-list",
    modules: [aggregatorTransformUniforms],
    parameters: {
      blend: true,
      blendColorSrcFactor: "one",
      blendColorDstFactor: "one",
      blendColorOperation: "max",
      blendAlphaSrcFactor: "one",
      blendAlphaDstFactor: "one",
      blendAlphaOperation: "max"
    },
    defines: {
      NUM_DIMS: props.dimensions,
      NUM_CHANNELS: props.channelCount,
      SAMPLER_WIDTH: TEXTURE_WIDTH
    },
    varyings: ["binIds", "values"],
    disableWarnings: true
  });
}

// dist/common/aggregator/gpu-aggregator/webgl-aggregator.js
var WebGLAggregator = class {
  /** Checks if the current device supports GPU aggregation */
  static isSupported(device) {
    return device.features.has("float32-renderable-webgl") && device.features.has("texture-blend-float-webgl");
  }
  constructor(device, props) {
    this.binCount = 0;
    this.binIds = null;
    this.results = [];
    this.device = device;
    this.dimensions = props.dimensions;
    this.channelCount = props.channelCount;
    this.props = {
      ...props,
      pointCount: 0,
      binIdRange: [[0, 0]],
      operations: [],
      attributes: {},
      binOptions: {}
    };
    this.needsUpdate = new Array(this.channelCount).fill(true);
    this.binSorter = new WebGLBinSorter(device, props);
    this.aggregationTransform = new WebGLAggregationTransform(device, props);
    this.setProps(props);
  }
  getBins() {
    var _a;
    const buffer = this.aggregationTransform.binBuffer;
    if (!buffer) {
      return null;
    }
    if (((_a = this.binIds) == null ? void 0 : _a.buffer) !== buffer) {
      this.binIds = { buffer, type: "float32", size: this.dimensions };
    }
    return this.binIds;
  }
  /** Returns an accessor to the output for a given channel. */
  getResult(channel) {
    var _a;
    const buffer = this.aggregationTransform.valueBuffer;
    if (!buffer || channel >= this.channelCount) {
      return null;
    }
    if (((_a = this.results[channel]) == null ? void 0 : _a.buffer) !== buffer) {
      this.results[channel] = {
        buffer,
        type: "float32",
        size: 1,
        stride: this.channelCount * 4,
        offset: channel * 4
      };
    }
    return this.results[channel];
  }
  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel) {
    return this.aggregationTransform.domains[channel];
  }
  /** Returns the information for a given bin. */
  getBin(index) {
    if (index < 0 || index >= this.binCount) {
      return null;
    }
    const { binIdRange } = this.props;
    let id;
    if (this.dimensions === 1) {
      id = [index + binIdRange[0][0]];
    } else {
      const [[x0, x1], [y0]] = binIdRange;
      const width = x1 - x0;
      id = [index % width + x0, Math.floor(index / width) + y0];
    }
    const pixel = this.binSorter.getBinValues(index);
    if (!pixel) {
      return null;
    }
    const count3 = pixel[3];
    const value = [];
    for (let channel = 0; channel < this.channelCount; channel++) {
      const operation = this.props.operations[channel];
      if (operation === "COUNT") {
        value[channel] = count3;
      } else if (count3 === 0) {
        value[channel] = NaN;
      } else {
        value[channel] = operation === "MEAN" ? pixel[channel] / count3 : pixel[channel];
      }
    }
    return { id, value, count: count3 };
  }
  /** Release GPU resources */
  destroy() {
    this.binSorter.destroy();
    this.aggregationTransform.destroy();
  }
  /** Update aggregation props. Normalize prop values and set change flags. */
  // eslint-disable-next-line complexity, max-statements
  setProps(props) {
    const oldProps = this.props;
    if ("binIdRange" in props && !deepEqual(props.binIdRange, oldProps.binIdRange, 2)) {
      const binIdRange = props.binIdRange;
      log_default.assert(binIdRange.length === this.dimensions);
      if (this.dimensions === 1) {
        const [[x0, x1]] = binIdRange;
        this.binCount = x1 - x0;
      } else {
        const [[x0, x1], [y0, y1]] = binIdRange;
        this.binCount = (x1 - x0) * (y1 - y0);
      }
      this.binSorter.setDimensions(this.binCount, binIdRange);
      this.aggregationTransform.setDimensions(this.binCount, binIdRange);
      this.setNeedsUpdate();
    }
    if (props.operations) {
      for (let channel = 0; channel < this.channelCount; channel++) {
        if (props.operations[channel] !== oldProps.operations[channel]) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.pointCount !== void 0 && props.pointCount !== oldProps.pointCount) {
      this.binSorter.setModelProps({ vertexCount: props.pointCount });
      this.setNeedsUpdate();
    }
    if (props.binOptions) {
      if (!deepEqual(props.binOptions, oldProps.binOptions, 2)) {
        this.setNeedsUpdate();
      }
      this.binSorter.model.shaderInputs.setProps({ binOptions: props.binOptions });
    }
    if (props.attributes) {
      const attributeBuffers = {};
      const constantAttributes = {};
      for (const attribute of Object.values(props.attributes)) {
        for (const [attributeName, value] of Object.entries(attribute.getValue())) {
          if (ArrayBuffer.isView(value)) {
            constantAttributes[attributeName] = value;
          } else if (value) {
            attributeBuffers[attributeName] = value;
          }
        }
      }
      this.binSorter.setModelProps({ attributes: attributeBuffers, constantAttributes });
    }
    if (props.shaderModuleProps) {
      this.binSorter.setModelProps({ shaderModuleProps: props.shaderModuleProps });
    }
    Object.assign(this.props, props);
  }
  /** Flags a channel to need update.
   * This is called internally by setProps() if certain props change
   * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
   * the underlying buffers could have been updated and require rerunning the aggregation
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel) {
    if (channel === void 0) {
      this.needsUpdate.fill(true);
    } else {
      this.needsUpdate[channel] = true;
    }
  }
  update() {
  }
  /** Run aggregation */
  preDraw() {
    var _a, _b;
    if (!this.needsUpdate.some(Boolean)) {
      return;
    }
    const { operations } = this.props;
    const operationsToUpdate = this.needsUpdate.map((needsUpdate, i) => needsUpdate ? operations[i] : null);
    this.binSorter.update(operationsToUpdate);
    this.aggregationTransform.update(this.binSorter.texture, operations);
    for (let i = 0; i < this.channelCount; i++) {
      if (this.needsUpdate[i]) {
        this.needsUpdate[i] = false;
        (_b = (_a = this.props).onUpdate) == null ? void 0 : _b.call(_a, { channel: i });
      }
    }
  }
};

// dist/common/aggregation-layer.js
var AggregationLayer = class extends CompositeLayer {
  /** Allow this layer to participates in the draw cycle */
  get isDrawable() {
    return true;
  }
  initializeState() {
  }
  // Extend Layer.updateState to update the Aggregator instance
  // returns true if aggregator is changed
  updateState(params) {
    var _a, _b;
    super.updateState(params);
    const aggregatorType = this.getAggregatorType();
    if (params.changeFlags.extensionsChanged || this.state.aggregatorType !== aggregatorType) {
      (_a = this.state.aggregator) == null ? void 0 : _a.destroy();
      const aggregator = this.createAggregator(aggregatorType);
      aggregator.setProps({
        attributes: (_b = this.getAttributeManager()) == null ? void 0 : _b.attributes
      });
      this.setState({ aggregator, aggregatorType });
      return true;
    }
    return false;
  }
  // Override Layer.finalizeState to dispose the Aggregator instance
  finalizeState(context) {
    super.finalizeState(context);
    this.state.aggregator.destroy();
  }
  // Override Layer.updateAttributes to update the aggregator
  updateAttributes(changedAttributes) {
    const { aggregator } = this.state;
    aggregator.setProps({
      attributes: changedAttributes
    });
    for (const id in changedAttributes) {
      this.onAttributeChange(id);
    }
    aggregator.update();
  }
  draw({ shaderModuleProps }) {
    const { aggregator } = this.state;
    aggregator.setProps({ shaderModuleProps });
    aggregator.preDraw();
  }
  // override CompositeLayer._getAttributeManager to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
};
AggregationLayer.layerName = "AggregationLayer";
var aggregation_layer_default = AggregationLayer;

// dist/screen-grid-layer/screen-grid-cell-layer.js
var import_engine6 = require("@luma.gl/engine");

// dist/common/utils/color-utils.js
var defaultColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];
function colorRangeToFlatArray(colorRange, normalize2 = false, ArrayType = Float32Array) {
  let flatArray;
  if (Number.isFinite(colorRange[0])) {
    flatArray = new ArrayType(colorRange);
  } else {
    flatArray = new ArrayType(colorRange.length * 4);
    let index = 0;
    for (let i = 0; i < colorRange.length; i++) {
      const color = colorRange[i];
      flatArray[index++] = color[0];
      flatArray[index++] = color[1];
      flatArray[index++] = color[2];
      flatArray[index++] = Number.isFinite(color[3]) ? color[3] : 255;
    }
  }
  if (normalize2) {
    for (let i = 0; i < flatArray.length; i++) {
      flatArray[i] /= 255;
    }
  }
  return flatArray;
}
var COLOR_RANGE_FILTER = {
  linear: "linear",
  quantile: "nearest",
  quantize: "nearest",
  ordinal: "nearest"
};
function updateColorRangeTexture(texture, type) {
  texture.setSampler({
    minFilter: COLOR_RANGE_FILTER[type],
    magFilter: COLOR_RANGE_FILTER[type]
  });
}
function createColorRangeTexture(device, colorRange, type = "linear") {
  const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);
  return device.createTexture({
    format: "rgba8unorm",
    sampler: {
      minFilter: COLOR_RANGE_FILTER[type],
      magFilter: COLOR_RANGE_FILTER[type],
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge"
    },
    data: colors,
    width: colors.length / 4,
    height: 1
  });
}

// dist/screen-grid-layer/screen-grid-cell-layer.wgsl.js
var screen_grid_cell_layer_wgsl_default = (
  /* wgsl */
  null
);

// dist/screen-grid-layer/screen-grid-layer-vertex.glsl.js
var screen_grid_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6
in vec2 positions;
in vec2 instancePositions;
in float instanceWeights;
uniform sampler2D colorRange;
out vec4 vColor;
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
if (isnan(instanceWeights)) {
gl_Position = vec4(0.);
return;
}
vec2 pos = instancePositions * screenGrid.gridSizeClipspace + positions * screenGrid.cellSizeClipspace;
pos.x = pos.x - 1.0;
pos.y = 1.0 - pos.y;
gl_Position = vec4(pos, 0., 1.);
vColor = interp(instanceWeights, screenGrid.colorDomain, colorRange);
vColor.a *= layer.opacity;
picking_setPickingColorFromInstanceID();
}
`
);

// dist/screen-grid-layer/screen-grid-layer-fragment.glsl.js
var screen_grid_layer_fragment_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME screen-grid-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`
);

// dist/screen-grid-layer/screen-grid-layer-uniforms.js
var uniformBlockWGSL = null;
var uniformBlock5 = (
  /* glsl */
  `layout(std140) uniform screenGridUniforms {
  vec2 cellSizeClipspace;
  vec2 gridSizeClipspace;
  vec2 colorDomain;
} screenGrid;
`
);
var screenGridUniforms = {
  name: "screenGrid",
  source: uniformBlockWGSL,
  vs: uniformBlock5,
  uniformTypes: {
    cellSizeClipspace: "vec2<f32>",
    gridSizeClipspace: "vec2<f32>",
    colorDomain: "vec2<f32>"
  }
};

// dist/screen-grid-layer/screen-grid-cell-layer.js
var ScreenGridCellLayer = class extends Layer {
  getShaders() {
    return super.getShaders({ source: screen_grid_cell_layer_wgsl_default, vs: screen_grid_layer_vertex_glsl_default, fs: screen_grid_layer_fragment_glsl_default, modules: [color_default, picking_default, screenGridUniforms] });
  }
  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 2,
        type: "float32",
        accessor: "getBin"
      },
      instanceWeights: {
        size: 1,
        type: "float32",
        accessor: "getWeight"
      }
    });
    this.state.model = this._getModel();
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const model = this.state.model;
    if (oldProps.colorRange !== props.colorRange) {
      (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
      this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
      const screenGridProps = { colorRange: this.state.colorTexture };
      model.shaderInputs.setProps({ screenGrid: screenGridProps });
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }
    if (oldProps.cellMarginPixels !== props.cellMarginPixels || oldProps.cellSizePixels !== props.cellSizePixels || changeFlags.viewportChanged) {
      const { width, height } = this.context.viewport;
      const { cellSizePixels: gridSize, cellMarginPixels } = this.props;
      const cellSize = Math.max(gridSize - cellMarginPixels, 0);
      const screenGridProps = {
        gridSizeClipspace: [gridSize / width * 2, gridSize / height * 2],
        cellSizeClipspace: [cellSize / width * 2, cellSize / height * 2]
      };
      model.shaderInputs.setProps({ screenGrid: screenGridProps });
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
  }
  draw({ uniforms }) {
    const colorDomain = this.props.colorDomain();
    const model = this.state.model;
    const screenGridProps = { colorDomain };
    model.shaderInputs.setProps({ screenGrid: screenGridProps });
    model.draw(this.context.renderPass);
  }
  // Private Methods
  _getModel() {
    return new import_engine6.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine6.Geometry({
        topology: "triangle-strip",
        attributes: {
          positions: {
            value: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]),
            size: 2
          }
        }
      }),
      isInstanced: true
    });
  }
};
ScreenGridCellLayer.layerName = "ScreenGridCellLayer";
var screen_grid_cell_layer_default = ScreenGridCellLayer;

// dist/screen-grid-layer/bin-options-uniforms.js
var uniformBlock6 = (
  /* glsl */
  `layout(std140) uniform binOptionsUniforms {
  float cellSizePixels;
} binOptions;
`
);
var binOptionsUniforms = {
  name: "binOptions",
  vs: uniformBlock6,
  uniformTypes: {
    cellSizePixels: "f32"
  }
};

// dist/screen-grid-layer/screen-grid-layer.js
var defaultProps2 = {
  cellSizePixels: { type: "number", value: 100, min: 1 },
  cellMarginPixels: { type: "number", value: 2, min: 0 },
  colorRange: defaultColorRange,
  colorScaleType: "linear",
  getPosition: { type: "accessor", value: (d) => d.position },
  getWeight: { type: "accessor", value: 1 },
  gpuAggregation: true,
  aggregation: "SUM"
};
var ScreenGridLayer = class extends aggregation_layer_default {
  getAggregatorType() {
    return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device) ? "gpu" : "cpu";
  }
  createAggregator(type) {
    if (type === "cpu" || !WebGLAggregator.isSupported(this.context.device)) {
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            const viewport = this.context.viewport;
            const p = viewport.project(positions);
            const cellSizePixels = opts.cellSizePixels;
            if (p[0] < 0 || p[0] >= viewport.width || p[1] < 0 || p[1] >= viewport.height) {
              return null;
            }
            return [Math.floor(p[0] / cellSizePixels), Math.floor(p[1] / cellSizePixels)];
          }
        },
        getValue: [{ sources: ["counts"], getValue: ({ counts }) => counts }]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 1,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [project32_default, binOptionsUniforms],
        vs: `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;
  
  void getBin(out ivec2 binId) {
    vec4 pos = project_position_to_clipspace(positions, positions64Low, vec3(0.0));
    vec2 screenCoords = vec2(pos.x / pos.w + 1.0, 1.0 - pos.y / pos.w) / 2.0 * project.viewportSize.xy / project.devicePixelRatio;
    vec2 gridCoords = floor(screenCoords / binOptions.cellSizePixels);
    binId = ivec2(gridCoords);
  }
  void getValue(out float weight) {
    weight = counts;
  }
  `
      })
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      // this attribute is used in gpu aggregation path only
      counts: { size: 1, accessor: "getWeight" }
    });
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { cellSizePixels, aggregation } = props;
    if (aggregatorChanged || changeFlags.dataChanged || changeFlags.updateTriggersChanged || changeFlags.viewportChanged || aggregation !== oldProps.aggregation || cellSizePixels !== oldProps.cellSizePixels) {
      const { width, height } = this.context.viewport;
      const { aggregator } = this.state;
      if (aggregator instanceof WebGLAggregator) {
        aggregator.setProps({
          binIdRange: [
            [0, Math.ceil(width / cellSizePixels)],
            [0, Math.ceil(height / cellSizePixels)]
          ]
        });
      }
      aggregator.setProps({
        pointCount: this.getNumInstances(),
        operations: [aggregation],
        binOptions: {
          cellSizePixels
        }
      });
    }
    if (changeFlags.viewportChanged) {
      this.state.aggregator.setNeedsUpdate();
    }
    return aggregatorChanged;
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        break;
      case "counts":
        aggregator.setNeedsUpdate(0);
        break;
      default:
    }
  }
  renderLayers() {
    const { aggregator } = this.state;
    const CellLayerClass = this.getSubLayerClass("cells", screen_grid_cell_layer_default);
    const binAttribute = aggregator.getBins();
    const weightAttribute = aggregator.getResult(0);
    return new CellLayerClass(this.props, this.getSubLayerProps({
      id: "cell-layer"
    }), {
      data: {
        length: aggregator.binCount,
        attributes: {
          getBin: binAttribute,
          getWeight: weightAttribute
        }
      },
      // Data has changed shallowly, but we likely don't need to update the attributes
      dataComparator: (data, oldData) => data.length === oldData.length,
      updateTriggers: {
        getBin: [binAttribute],
        getWeight: [weightAttribute]
      },
      parameters: {
        depthWriteEnabled: false,
        ...this.props.parameters
      },
      // Evaluate domain at draw() time
      colorDomain: () => this.props.colorDomain || aggregator.getResultDomain(0),
      // Extensions are already handled by the GPUAggregator, do not pass it down
      extensions: []
    });
  }
  getPickingInfo(params) {
    const info = params.info;
    const { index } = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object;
      if (bin) {
        object = {
          col: bin.id[0],
          row: bin.id[1],
          value: bin.value[0],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data) ? bin.pointIndices.map((i) => this.props.data[i]) : [];
        }
      }
      info.object = object;
    }
    return info;
  }
};
ScreenGridLayer.layerName = "ScreenGridLayer";
ScreenGridLayer.defaultProps = defaultProps2;
var screen_grid_layer_default = ScreenGridLayer;

// dist/common/utils/scale-utils.js
var AttributeWithScale = class {
  constructor(input, inputLength) {
    this.props = {
      scaleType: "linear",
      lowerPercentile: 0,
      upperPercentile: 100
    };
    this.domain = null;
    this.cutoff = null;
    this.input = input;
    this.inputLength = inputLength;
    this.attribute = input;
  }
  getScalePercentile() {
    if (!this._percentile) {
      const value = getAttributeValue(this.input, this.inputLength);
      this._percentile = applyScaleQuantile(value);
    }
    return this._percentile;
  }
  getScaleOrdinal() {
    if (!this._ordinal) {
      const value = getAttributeValue(this.input, this.inputLength);
      this._ordinal = applyScaleOrdinal(value);
    }
    return this._ordinal;
  }
  /** Returns the [lowerCutoff, upperCutoff] of scaled values, or null if not applicable */
  getCutoff({ scaleType, lowerPercentile, upperPercentile }) {
    if (scaleType === "quantile") {
      return [lowerPercentile, upperPercentile - 1];
    }
    if (lowerPercentile > 0 || upperPercentile < 100) {
      const { domain: thresholds } = this.getScalePercentile();
      let lowValue = thresholds[Math.floor(lowerPercentile) - 1] ?? -Infinity;
      let highValue = thresholds[Math.floor(upperPercentile) - 1] ?? Infinity;
      if (scaleType === "ordinal") {
        const { domain: sortedUniqueValues } = this.getScaleOrdinal();
        lowValue = sortedUniqueValues.findIndex((x) => x >= lowValue);
        highValue = sortedUniqueValues.findIndex((x) => x > highValue) - 1;
        if (highValue === -2) {
          highValue = sortedUniqueValues.length - 1;
        }
      }
      return [lowValue, highValue];
    }
    return null;
  }
  update(props) {
    const oldProps = this.props;
    if (props.scaleType !== oldProps.scaleType) {
      switch (props.scaleType) {
        case "quantile": {
          const { attribute } = this.getScalePercentile();
          this.attribute = attribute;
          this.domain = [0, 99];
          break;
        }
        case "ordinal": {
          const { attribute, domain } = this.getScaleOrdinal();
          this.attribute = attribute;
          this.domain = [0, domain.length - 1];
          break;
        }
        default:
          this.attribute = this.input;
          this.domain = null;
      }
    }
    if (props.scaleType !== oldProps.scaleType || props.lowerPercentile !== oldProps.lowerPercentile || props.upperPercentile !== oldProps.upperPercentile) {
      this.cutoff = this.getCutoff(props);
    }
    this.props = props;
    return this;
  }
};
function applyScaleOrdinal(values) {
  const uniqueValues = /* @__PURE__ */ new Set();
  for (const x of values) {
    if (Number.isFinite(x)) {
      uniqueValues.add(x);
    }
  }
  const sortedUniqueValues = Array.from(uniqueValues).sort();
  const domainMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < sortedUniqueValues.length; i++) {
    domainMap.set(sortedUniqueValues[i], i);
  }
  return {
    attribute: {
      value: values.map((x) => Number.isFinite(x) ? domainMap.get(x) : NaN),
      type: "float32",
      size: 1
    },
    domain: sortedUniqueValues
  };
}
function applyScaleQuantile(values, rangeLength = 100) {
  const sortedValues = Array.from(values).filter(Number.isFinite).sort(ascending);
  let i = 0;
  const n = Math.max(1, rangeLength);
  const thresholds = new Array(n - 1);
  while (++i < n) {
    thresholds[i - 1] = threshold(sortedValues, i / n);
  }
  return {
    attribute: {
      value: values.map((x) => Number.isFinite(x) ? bisectRight(thresholds, x) : NaN),
      type: "float32",
      size: 1
    },
    domain: thresholds
  };
}
function getAttributeValue(attribute, length) {
  var _a;
  const elementStride = (attribute.stride ?? 4) / 4;
  const elementOffset = (attribute.offset ?? 0) / 4;
  let value = attribute.value;
  if (!value) {
    const bytes = (_a = attribute.buffer) == null ? void 0 : _a.readSyncWebGL(0, elementStride * 4 * length);
    if (bytes) {
      value = new Float32Array(bytes.buffer);
      attribute.value = value;
    }
  }
  if (elementStride === 1) {
    return value.subarray(0, length);
  }
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = value[i * elementStride + elementOffset];
  }
  return result;
}
function ascending(a, b) {
  return a - b;
}
function threshold(domain, fraction) {
  const domainLength = domain.length;
  if (fraction <= 0 || domainLength < 2) {
    return domain[0];
  }
  if (fraction >= 1) {
    return domain[domainLength - 1];
  }
  const domainFraction = (domainLength - 1) * fraction;
  const lowIndex = Math.floor(domainFraction);
  const low = domain[lowIndex];
  const high = domain[lowIndex + 1];
  return low + (high - low) * (domainFraction - lowIndex);
}
function bisectRight(a, x) {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    if (a[mid] > x) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

// dist/common/utils/bounds-utils.js
function getBinIdRange({ dataBounds, getBinId, padding = 0 }) {
  const corners = [
    dataBounds[0],
    dataBounds[1],
    [dataBounds[0][0], dataBounds[1][1]],
    [dataBounds[1][0], dataBounds[0][1]]
  ].map((p) => getBinId(p));
  const minX = Math.min(...corners.map((p) => p[0])) - padding;
  const minY = Math.min(...corners.map((p) => p[1])) - padding;
  const maxX = Math.max(...corners.map((p) => p[0])) + padding + 1;
  const maxY = Math.max(...corners.map((p) => p[1])) + padding + 1;
  return [
    [minX, maxX],
    [minY, maxY]
  ];
}

// ../layers/src/column-layer/column-layer.ts
var import_engine8 = require("@luma.gl/engine");

// ../layers/src/column-layer/column-geometry.ts
var import_engine7 = require("@luma.gl/engine");
var import_polygon = require("@math.gl/polygon");
var ColumnGeometry = class extends import_engine7.Geometry {
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
var uniformBlockWGSL2 = (
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
var uniformBlock7 = `layout(std140) uniform columnUniforms {
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
  source: uniformBlockWGSL2,
  vs: uniformBlock7,
  fs: uniformBlock7,
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
var DEFAULT_COLOR = [0, 0, 0, 255];
var GEOMETRY_BUFFER_LAYOUT = {
  name: "geometry",
  stepMode: "vertex",
  byteStride: 24,
  attributes: [
    { attribute: "positions", format: "float32x3", byteOffset: 0 },
    { attribute: "normals", format: "float32x3", byteOffset: 12 }
  ]
};
var defaultProps3 = {
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
  getFillColor: { type: "accessor", value: DEFAULT_COLOR },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR },
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
        defaultValue: DEFAULT_COLOR
      },
      instanceLineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        transition: true,
        accessor: "getLineColor",
        defaultValue: DEFAULT_COLOR
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
    const fillModel = new import_engine8.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-fill`,
      bufferLayout,
      isInstanced: true
    });
    const strokeModel = new import_engine8.Model(this.context.device, {
      ...shaders,
      id: `${this.props.id}-stroke`,
      bufferLayout,
      isInstanced: true
    });
    const wireframeModel = new import_engine8.Model(this.context.device, {
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
      new import_engine8.Geometry({
        topology: "triangle-strip",
        attributes: { POSITION: positionAttribute, NORMAL: normalAttribute }
      })
    );
    if (!extruded && stroked) {
      const fillVertexCount = positionAttribute.value.length / 3;
      this._setStrokeGeometry(
        new import_engine8.Geometry({
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
    const fillGeometry = (0, import_engine8.makeInterleavedGeometry)(geometry, {
      attributes: ["POSITION", "NORMAL"]
    });
    const fillModel = this.state.fillModel;
    fillModel.setGeometry(fillGeometry);
  }
  _setStrokeGeometry(geometry) {
    const strokeGeometry = (0, import_engine8.makeInterleavedGeometry)(geometry, {
      attributes: ["POSITION", "NORMAL"]
    });
    const strokeModel = this.state.strokeModel;
    strokeModel.setGeometry(strokeGeometry);
  }
  _setWireframeGeometry(geometry) {
    const wireframeGeometry = (0, import_engine8.makeInterleavedGeometry)(geometry, {
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
ColumnLayer.defaultProps = defaultProps3;

// ../layers/src/path-layer/path-layer.ts
var import_engine9 = require("@luma.gl/engine");
var import_engine10 = require("@luma.gl/engine");

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
var uniformBlockWGSL3 = (
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
var uniformBlockGLSL = `layout(std140) uniform pathUniforms {
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
  source: uniformBlockWGSL3,
  vs: uniformBlockGLSL,
  fs: uniformBlockGLSL,
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
var shaderWGSL = (
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
var DEFAULT_COLOR2 = [0, 0, 0, 255];
var defaultProps4 = {
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
  getColor: { type: "accessor", value: DEFAULT_COLOR2 },
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
      source: shaderWGSL,
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
        defaultValue: DEFAULT_COLOR2,
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
    return new import_engine10.Model(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout: this.getAttributeManager().getBufferLayouts(),
      geometry: new import_engine9.Geometry({
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
PathLayer.defaultProps = defaultProps4;
PathLayer.layerName = "PathLayer";

// ../layers/src/solid-polygon-layer/solid-polygon-layer.ts
var import_engine11 = require("@luma.gl/engine");

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
var uniformBlockWGSL4 = (
  /* wgsl */
  `struct SolidPolygonUniforms {
  extruded: f32,
  isWireframe: f32,
  elevationScale: f32,
};

@group(0) @binding(auto) var<uniform> solidPolygon: SolidPolygonUniforms;
`
);
var uniformBlock8 = `layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`;
var solidPolygonUniforms = {
  name: "solidPolygon",
  source: uniformBlockWGSL4,
  vs: uniformBlock8,
  fs: uniformBlock8,
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
var DEFAULT_COLOR3 = [0, 0, 0, 255];
var defaultProps5 = {
  filled: true,
  extruded: false,
  wireframe: false,
  _normalize: true,
  _windingOrder: "CW",
  _full3d: false,
  elevationScale: { type: "number", min: 0, value: 1 },
  getPolygon: { type: "accessor", value: (f) => f.polygon },
  getElevation: { type: "accessor", value: 1e3 },
  getFillColor: { type: "accessor", value: DEFAULT_COLOR3 },
  getLineColor: { type: "accessor", value: DEFAULT_COLOR3 },
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
        defaultValue: DEFAULT_COLOR3,
        bufferGroup: "solid-polygon-instance-data"
      },
      lineColors: {
        size: this.props.colorFormat.length,
        type: "unorm8",
        stepMode: "dynamic",
        transition: ATTRIBUTE_TRANSITION2,
        accessor: "getLineColor",
        defaultValue: DEFAULT_COLOR3,
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
      topModel = new import_engine11.Model(this.context.device, {
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
      sideModel = new import_engine11.Model(this.context.device, {
        ...this.getShaders("side"),
        id: `${id}-side`,
        bufferLayout,
        geometry: new import_engine11.Geometry({
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
      wireframeModel = new import_engine11.Model(this.context.device, {
        ...this.getShaders("side"),
        id: `${id}-wireframe`,
        bufferLayout,
        geometry: new import_engine11.Geometry({
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
SolidPolygonLayer.defaultProps = defaultProps5;
SolidPolygonLayer.layerName = "SolidPolygonLayer";

// dist/hexagon-layer/hexagon-cell-layer.wgsl.js
var hexagon_cell_layer_wgsl_default = (
  /* wgsl */
  null
);

// dist/hexagon-layer/hexbin.js
var THIRD_PI = Math.PI / 3;
var DIST_X = 2 * Math.sin(THIRD_PI);
var DIST_Y = 1.5;
var HexbinVertices = Array.from({ length: 6 }, (_, i) => {
  const angle = i * THIRD_PI;
  return [Math.sin(angle), -Math.cos(angle)];
});
function pointToHexbin([px, py], radius) {
  let pj = Math.round(py = py / radius / DIST_Y);
  let pi = Math.round(px = px / radius / DIST_X - (pj & 1) / 2);
  const py1 = py - pj;
  if (Math.abs(py1) * 3 > 1) {
    const px1 = px - pi;
    const pi2 = pi + (px < pi ? -1 : 1) / 2;
    const pj2 = pj + (py < pj ? -1 : 1);
    const px2 = px - pi2;
    const py2 = py - pj2;
    if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) {
      pi = pi2 + (pj & 1 ? 1 : -1) / 2;
      pj = pj2;
    }
  }
  return [pi, pj];
}
var pointToHexbinGLSL = (
  /* glsl */
  `
const vec2 DIST = vec2(${DIST_X}, ${DIST_Y});

ivec2 pointToHexbin(vec2 p, float radius) {
  p /= radius * DIST;
  float pj = round(p.y);
  float pjm2 = mod(pj, 2.0);
  p.x -= pjm2 * 0.5;
  float pi = round(p.x);
  vec2 d1 = p - vec2(pi, pj);

  if (abs(d1.y) * 3. > 1.) {
    vec2 v2 = step(0.0, d1) - 0.5;
    v2.y *= 2.0;
    vec2 d2 = d1 - v2;
    if (dot(d1, d1) > dot(d2, d2)) {
      pi += v2.x + pjm2 - 0.5;
      pj += v2.y;
    }
  }
  return ivec2(pi, pj);
}
`
);
function getHexbinCentroid([i, j], radius) {
  return [(i + (j & 1) / 2) * radius * DIST_X, j * radius * DIST_Y];
}
var getHexbinCentroidGLSL = `
const vec2 DIST = vec2(${DIST_X}, ${DIST_Y});

vec2 hexbinCentroid(vec2 binId, float radius) {
  binId.x += fract(binId.y * 0.5);
  return binId * DIST * radius;
}
`;

// dist/hexagon-layer/hexagon-cell-layer-vertex.glsl.js
var hexagon_cell_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME hexagon-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
uniform sampler2D colorRange;
out vec4 vColor;
${getHexbinCentroidGLSL}
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = picking_getPickingColorFromInstanceID();
if (isnan(instanceColorValues) ||
instanceColorValues < hexagon.colorDomain.z ||
instanceColorValues > hexagon.colorDomain.w ||
instanceElevationValues < hexagon.elevationDomain.z ||
instanceElevationValues > hexagon.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = hexbinCentroid(instancePositions, column.radius) + (hexagon.originCommon - project.commonOrigin.xy);
commonPosition += positions.xy * column.radius * column.coverage;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, hexagon.elevationDomain.xy, hexagon.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, hexagon.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`
);

// dist/hexagon-layer/hexagon-layer-uniforms.js
var uniformBlockWGSL5 = null;
var uniformBlock9 = (
  /* glsl */
  `layout(std140) uniform hexagonUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
} hexagon;
`
);
var hexagonUniforms = {
  name: "hexagon",
  source: uniformBlockWGSL5,
  vs: uniformBlock9,
  uniformTypes: {
    colorDomain: "vec4<f32>",
    elevationDomain: "vec4<f32>",
    elevationRange: "vec2<f32>",
    originCommon: "vec2<f32>"
  }
};

// dist/hexagon-layer/hexagon-cell-layer.js
var HexagonCellLayer = class extends ColumnLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.modules.push(hexagonUniforms);
    return { ...shaders, source: hexagon_cell_layer_wgsl_default, vs: hexagon_cell_layer_vertex_glsl_default };
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.remove([
      "instanceElevations",
      "instanceFillColors",
      "instanceLineColors",
      "instanceStrokeWidths"
    ]);
    attributeManager.addInstanced({
      instancePositions: {
        size: 2,
        type: "float32",
        accessor: "getBin"
      },
      instanceColorValues: {
        size: 1,
        type: "float32",
        accessor: "getColorValue"
      },
      instanceElevationValues: {
        size: 1,
        type: "float32",
        accessor: "getElevationValue"
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps } = params;
    const model = this.state.fillModel;
    if (oldProps.colorRange !== props.colorRange) {
      (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
      this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
      const hexagonProps = { colorRange: this.state.colorTexture };
      model.shaderInputs.setProps({ hexagon: hexagonProps });
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
  }
  draw({ uniforms }) {
    const { radius, hexOriginCommon, elevationRange, elevationScale, extruded, coverage, colorDomain, elevationDomain } = this.props;
    const colorCutoff = this.props.colorCutoff || [-Infinity, Infinity];
    const elevationCutoff = this.props.elevationCutoff || [-Infinity, Infinity];
    const fillModel = this.state.fillModel;
    const hexagonProps = {
      colorDomain: [
        Math.max(colorDomain[0], colorCutoff[0]),
        // instanceColorValue that maps to colorRange[0]
        Math.min(colorDomain[1], colorCutoff[1]),
        // instanceColorValue that maps to colorRange[colorRange.length - 1]
        Math.max(colorDomain[0] - 1, colorCutoff[0]),
        // hide cell if instanceColorValue is less than this
        Math.min(colorDomain[1] + 1, colorCutoff[1])
        // hide cell if instanceColorValue is greater than this
      ],
      elevationDomain: [
        Math.max(elevationDomain[0], elevationCutoff[0]),
        // instanceElevationValue that maps to elevationRange[0]
        Math.min(elevationDomain[1], elevationCutoff[1]),
        // instanceElevationValue that maps to elevationRange[elevationRange.length - 1]
        Math.max(elevationDomain[0] - 1, elevationCutoff[0]),
        // hide cell if instanceElevationValue is less than this
        Math.min(elevationDomain[1] + 1, elevationCutoff[1])
        // hide cell if instanceElevationValue is greater than this
      ],
      elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale],
      originCommon: hexOriginCommon
    };
    fillModel.shaderInputs.setProps({
      column: { extruded, coverage, radius },
      hexagon: hexagonProps
    });
    fillModel.draw(this.context.renderPass);
  }
};
HexagonCellLayer.layerName = "HexagonCellLayer";
var hexagon_cell_layer_default = HexagonCellLayer;

// dist/hexagon-layer/bin-options-uniforms.js
var uniformBlock10 = (
  /* glsl */
  `layout(std140) uniform binOptionsUniforms {
  vec2 hexOriginCommon;
  float radiusCommon;
} binOptions;
`
);
var binOptionsUniforms2 = {
  name: "binOptions",
  vs: uniformBlock10,
  uniformTypes: {
    hexOriginCommon: "vec2<f32>",
    radiusCommon: "f32"
  }
};

// dist/hexagon-layer/hexagon-layer.js
function noop() {
}
var defaultProps6 = {
  gpuAggregation: true,
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: { type: "accessor", value: null },
  // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  lowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  upperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  colorScaleType: "quantize",
  onSetColorDomain: noop,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationValue: { type: "accessor", value: null },
  // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationScale: { type: "number", min: 0, value: 1 },
  elevationLowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  elevationUpperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  elevationScaleType: "linear",
  onSetElevationDomain: noop,
  // hexbin
  radius: { type: "number", min: 1, value: 1e3 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  getPosition: { type: "accessor", value: (x) => x.position },
  hexagonAggregator: { type: "function", optional: true, value: null },
  extruded: false,
  // Optional material for 'lighting' shader module
  material: true
};
var HexagonLayer = class extends aggregation_layer_default {
  getAggregatorType() {
    const { gpuAggregation, hexagonAggregator, getColorValue, getElevationValue } = this.props;
    if (gpuAggregation && (hexagonAggregator || getColorValue || getElevationValue)) {
      log_default.warn("Features not supported by GPU aggregation, falling back to CPU")();
      return "cpu";
    }
    if (
      // GPU aggregation is requested
      gpuAggregation && // GPU aggregation is supported by the device
      WebGLAggregator.isSupported(this.context.device)
    ) {
      return "gpu";
    }
    return "cpu";
  }
  createAggregator(type) {
    if (type === "cpu") {
      const { hexagonAggregator, radius } = this.props;
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            if (hexagonAggregator) {
              return hexagonAggregator(positions, radius);
            }
            const viewport = this.state.aggregatorViewport;
            const p = viewport.projectPosition(positions);
            const { radiusCommon, hexOriginCommon } = opts;
            return pointToHexbin([p[0] - hexOriginCommon[0], p[1] - hexOriginCommon[1]], radiusCommon);
          }
        },
        getValue: [
          { sources: ["colorWeights"], getValue: ({ colorWeights }) => colorWeights },
          { sources: ["elevationWeights"], getValue: ({ elevationWeights }) => elevationWeights }
        ]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 2,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [project32_default, binOptionsUniforms2],
        vs: (
          /* glsl */
          `
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;
  
  ${pointToHexbinGLSL}

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    binId = pointToHexbin(positionCommon.xy, binOptions.radiusCommon);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `
        )
      })
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      colorWeights: { size: 1, accessor: "getColorWeight" },
      elevationWeights: { size: 1, accessor: "getElevationWeight" }
    });
  }
  // eslint-disable-next-line complexity
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { aggregator } = this.state;
    if ((changeFlags.dataChanged || !this.state.dataAsArray) && (props.getColorValue || props.getElevationValue)) {
      this.state.dataAsArray = Array.from(createIterable(props.data).iterable);
    }
    if (aggregatorChanged || changeFlags.dataChanged || props.radius !== oldProps.radius || props.getColorValue !== oldProps.getColorValue || props.getElevationValue !== oldProps.getElevationValue || props.colorAggregation !== oldProps.colorAggregation || props.elevationAggregation !== oldProps.elevationAggregation) {
      this._updateBinOptions();
      const { radiusCommon, hexOriginCommon, binIdRange, dataAsArray } = this.state;
      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.colorAggregation, props.elevationAggregation],
        binOptions: {
          radiusCommon,
          hexOriginCommon
        },
        onUpdate: this._onAggregationUpdate.bind(this)
      });
      if (dataAsArray) {
        const { getColorValue, getElevationValue } = this.props;
        aggregator.setProps({
          // @ts-expect-error only used by CPUAggregator
          customOperations: [
            getColorValue && ((indices) => getColorValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data })),
            getElevationValue && ((indices) => getElevationValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data }))
          ]
        });
      }
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getColorValue) {
      aggregator.setNeedsUpdate(0);
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getElevationValue) {
      aggregator.setNeedsUpdate(1);
    }
    return aggregatorChanged;
  }
  _updateBinOptions() {
    const bounds = this.getBounds();
    let radiusCommon = 1;
    let hexOriginCommon = [0, 0];
    let binIdRange = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;
    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const { radius } = this.props;
      const { unitsPerMeter: unitsPerMeter2 } = viewport.getDistanceScales(centroid);
      radiusCommon = unitsPerMeter2[0] * radius;
      const centerHex = pointToHexbin(viewport.projectFlat(centroid), radiusCommon);
      centroid = viewport.unprojectFlat(getHexbinCentroid(centerHex, radiusCommon));
      const ViewportType = viewport.constructor;
      viewport = viewport.isGeospatial ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 }) : new Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
      hexOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p) => {
          const positionCommon = viewport.projectFlat(p);
          positionCommon[0] -= hexOriginCommon[0];
          positionCommon[1] -= hexOriginCommon[1];
          return pointToHexbin(positionCommon, radiusCommon);
        },
        padding: 1
      });
    }
    this.setState({ radiusCommon, hexOriginCommon, binIdRange, aggregatorViewport: viewport });
  }
  draw(opts) {
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }
  _onAggregationUpdate({ channel }) {
    const props = this.getCurrentLayer().props;
    const { aggregator } = this.state;
    if (channel === 0) {
      const result = aggregator.getResult(0);
      this.setState({
        colors: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetColorDomain(aggregator.getResultDomain(0));
    } else if (channel === 1) {
      const result = aggregator.getResult(1);
      this.setState({
        elevations: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetElevationDomain(aggregator.getResultDomain(1));
    }
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        this._updateBinOptions();
        const { radiusCommon, hexOriginCommon, binIdRange } = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            radiusCommon,
            hexOriginCommon
          }
        });
        break;
      case "colorWeights":
        aggregator.setNeedsUpdate(0);
        break;
      case "elevationWeights":
        aggregator.setNeedsUpdate(1);
        break;
      default:
    }
  }
  renderLayers() {
    var _a, _b;
    const { aggregator, radiusCommon, hexOriginCommon } = this.state;
    const { elevationScale, colorRange, elevationRange, extruded, coverage, material, transitions, colorScaleType, lowerPercentile, upperPercentile, colorDomain, elevationScaleType, elevationLowerPercentile, elevationUpperPercentile, elevationDomain } = this.props;
    const CellLayerClass = this.getSubLayerClass("cells", hexagon_cell_layer_default);
    const binAttribute = aggregator.getBins();
    const colors = (_a = this.state.colors) == null ? void 0 : _a.update({
      scaleType: colorScaleType,
      lowerPercentile,
      upperPercentile
    });
    const elevations = (_b = this.state.elevations) == null ? void 0 : _b.update({
      scaleType: elevationScaleType,
      lowerPercentile: elevationLowerPercentile,
      upperPercentile: elevationUpperPercentile
    });
    if (!colors || !elevations) {
      return null;
    }
    return new CellLayerClass(this.getSubLayerProps({
      id: "cells"
    }), {
      data: {
        length: aggregator.binCount,
        attributes: {
          getBin: binAttribute,
          getColorValue: colors.attribute,
          getElevationValue: elevations.attribute
        }
      },
      // Data has changed shallowly, but we likely don't need to update the attributes
      dataComparator: (data, oldData) => data.length === oldData.length,
      updateTriggers: {
        getBin: [binAttribute],
        getColorValue: [colors.attribute],
        getElevationValue: [elevations.attribute]
      },
      diskResolution: 6,
      vertices: HexbinVertices,
      radius: radiusCommon,
      hexOriginCommon,
      elevationScale,
      colorRange,
      colorScaleType,
      elevationRange,
      extruded,
      coverage,
      material,
      colorDomain: colors.domain || colorDomain || aggregator.getResultDomain(0),
      elevationDomain: elevations.domain || elevationDomain || aggregator.getResultDomain(1),
      colorCutoff: colors.cutoff,
      elevationCutoff: elevations.cutoff,
      transitions: transitions && {
        getFillColor: transitions.getColorValue || transitions.getColorWeight,
        getElevation: transitions.getElevationValue || transitions.getElevationWeight
      },
      // Extensions are already handled by the GPUAggregator, do not pass it down
      extensions: []
    });
  }
  getPickingInfo(params) {
    const info = params.info;
    const { index } = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object;
      if (bin) {
        const centroidCommon = getHexbinCentroid(bin.id, this.state.radiusCommon);
        const centroid = this.context.viewport.unprojectFlat(centroidCommon);
        object = {
          col: bin.id[0],
          row: bin.id[1],
          position: centroid,
          colorValue: bin.value[0],
          elevationValue: bin.value[1],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data) ? bin.pointIndices.map((i) => this.props.data[i]) : [];
        }
      }
      info.object = object;
    }
    return info;
  }
};
HexagonLayer.layerName = "HexagonLayer";
HexagonLayer.defaultProps = defaultProps6;
var hexagon_layer_default = HexagonLayer;

// dist/contour-layer/marching-squares-codes.js
var HALF = 0.5;
var ONE6TH = 1 / 6;
var OFFSET = {
  N: [0, HALF],
  // NORTH
  E: [HALF, 0],
  // EAST
  S: [0, -HALF],
  // SOUTH
  W: [-HALF, 0],
  // WEST
  // CORNERS
  NE: [HALF, HALF],
  NW: [-HALF, HALF],
  SE: [HALF, -HALF],
  SW: [-HALF, -HALF]
};
var SW_TRIANGLE = [OFFSET.W, OFFSET.SW, OFFSET.S];
var SE_TRIANGLE = [OFFSET.S, OFFSET.SE, OFFSET.E];
var NE_TRIANGLE = [OFFSET.E, OFFSET.NE, OFFSET.N];
var NW_TRIANGLE = [OFFSET.NW, OFFSET.W, OFFSET.N];
var SW_TRAPEZOID = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF]
];
var SE_TRAPEZOID = [
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH]
];
var NE_TRAPEZOID = [
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var NW_TRAPEZOID = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var S_RECTANGLE = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E];
var E_RECTANGLE = [OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
var N_RECTANGLE = [OFFSET.NW, OFFSET.W, OFFSET.E, OFFSET.NE];
var W_RECTANGLE = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.N];
var EW_RECTANGEL = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [HALF, -ONE6TH],
  [HALF, ONE6TH]
];
var SN_RECTANGEL = [
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var SQUARE = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.NE];
var SW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.SE, OFFSET.E, OFFSET.N];
var SE_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.NE, OFFSET.N];
var NE_PENTAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.NE];
var NW_PENTAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE];
var NW_N_PENTAGON = [OFFSET.NW, OFFSET.W, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
var NE_E_PENTAGON = [[-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE, OFFSET.N];
var SE_S_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.E];
var SW_W_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [ONE6TH, HALF], [-ONE6TH, HALF]];
var NW_W_PENTAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.N];
var NE_N_PENTAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.E, OFFSET.NE, OFFSET.N];
var SE_E_PENTAGON = [OFFSET.S, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
var SW_S_PENTAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH]];
var S_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.SE, OFFSET.E, [ONE6TH, HALF], [-ONE6TH, HALF]];
var E_HEXAGON = [[-HALF, ONE6TH], [-HALF, -ONE6TH], OFFSET.S, OFFSET.SE, OFFSET.NE, OFFSET.N];
var N_HEXAGON = [OFFSET.NW, OFFSET.W, [-ONE6TH, -HALF], [ONE6TH, -HALF], OFFSET.E, OFFSET.NE];
var W_HEXAGON = [OFFSET.NW, OFFSET.SW, OFFSET.S, [HALF, -ONE6TH], [HALF, ONE6TH], OFFSET.N];
var SW_NE_HEXAGON = [OFFSET.W, OFFSET.SW, OFFSET.S, OFFSET.E, OFFSET.NE, OFFSET.N];
var NW_SE_HEXAGON = [OFFSET.NW, OFFSET.W, OFFSET.S, OFFSET.SE, OFFSET.E, OFFSET.N];
var NE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  OFFSET.E,
  OFFSET.NE,
  OFFSET.N
];
var SW_HEPTAGON = [
  OFFSET.W,
  OFFSET.SW,
  OFFSET.S,
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var NW_HEPTAGON = [
  OFFSET.NW,
  OFFSET.W,
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  OFFSET.N
];
var SE_HEPTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  OFFSET.S,
  OFFSET.SE,
  OFFSET.E,
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var OCTAGON = [
  [-HALF, ONE6TH],
  [-HALF, -ONE6TH],
  [-ONE6TH, -HALF],
  [ONE6TH, -HALF],
  [HALF, -ONE6TH],
  [HALF, ONE6TH],
  [ONE6TH, HALF],
  [-ONE6TH, HALF]
];
var ISOLINES_CODE_OFFSET_MAP = {
  // key is equal to the code of 4 vertices (invert the code specified in wiki)
  // value can be an array or an Object
  // Array : [line] or [line, line], where each line is [start-point, end-point], and each point is [x, y]
  // Object : to handle saddle cases, whos output depends on mean value of all 4 corners
  //  key: code of mean value (0 or 1)
  //  value: Array , as above defines one or two line segments
  0: [],
  1: [[OFFSET.W, OFFSET.S]],
  2: [[OFFSET.S, OFFSET.E]],
  3: [[OFFSET.W, OFFSET.E]],
  4: [[OFFSET.N, OFFSET.E]],
  5: {
    0: [
      [OFFSET.W, OFFSET.S],
      [OFFSET.N, OFFSET.E]
    ],
    1: [
      [OFFSET.W, OFFSET.N],
      [OFFSET.S, OFFSET.E]
    ]
  },
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.W, OFFSET.N]],
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.N, OFFSET.S]],
  10: {
    0: [
      [OFFSET.W, OFFSET.N],
      [OFFSET.S, OFFSET.E]
    ],
    1: [
      [OFFSET.W, OFFSET.S],
      [OFFSET.N, OFFSET.E]
    ]
  },
  11: [[OFFSET.N, OFFSET.E]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};
function ternaryToIndex(ternary) {
  return parseInt(ternary, 4);
}
var ISOBANDS_CODE_OFFSET_MAP = {
  // Below list of cases, follow the same order as in above mentioned wiki page.
  // Each case has its code on first commented line // T,TR,R,C
  // where T: Top, TR: Top-right, R: Right and C: current, each will be either 0, 1 or 2
  // final code is binary representation of above code , where takes 2 digits
  // for example:  code 2-2-2-1 => 10-10-10-01 => 10101001 => 169
  // no contours
  [ternaryToIndex("0000")]: [],
  [ternaryToIndex("2222")]: [],
  // single triangle
  [ternaryToIndex("2221")]: [SW_TRIANGLE],
  [ternaryToIndex("2212")]: [SE_TRIANGLE],
  [ternaryToIndex("2122")]: [NE_TRIANGLE],
  [ternaryToIndex("1222")]: [NW_TRIANGLE],
  [ternaryToIndex("0001")]: [SW_TRIANGLE],
  [ternaryToIndex("0010")]: [SE_TRIANGLE],
  [ternaryToIndex("0100")]: [NE_TRIANGLE],
  [ternaryToIndex("1000")]: [NW_TRIANGLE],
  // single trapezoid
  [ternaryToIndex("2220")]: [SW_TRAPEZOID],
  [ternaryToIndex("2202")]: [SE_TRAPEZOID],
  [ternaryToIndex("2022")]: [NE_TRAPEZOID],
  [ternaryToIndex("0222")]: [NW_TRAPEZOID],
  [ternaryToIndex("0002")]: [SW_TRAPEZOID],
  [ternaryToIndex("0020")]: [SE_TRAPEZOID],
  [ternaryToIndex("0200")]: [NE_TRAPEZOID],
  [ternaryToIndex("2000")]: [NW_TRAPEZOID],
  // single rectangle
  [ternaryToIndex("0011")]: [S_RECTANGLE],
  [ternaryToIndex("0110")]: [E_RECTANGLE],
  [ternaryToIndex("1100")]: [N_RECTANGLE],
  [ternaryToIndex("1001")]: [W_RECTANGLE],
  [ternaryToIndex("2211")]: [S_RECTANGLE],
  [ternaryToIndex("2112")]: [E_RECTANGLE],
  [ternaryToIndex("1122")]: [N_RECTANGLE],
  [ternaryToIndex("1221")]: [W_RECTANGLE],
  [ternaryToIndex("2200")]: [EW_RECTANGEL],
  [ternaryToIndex("2002")]: [SN_RECTANGEL],
  [ternaryToIndex("0022")]: [EW_RECTANGEL],
  [ternaryToIndex("0220")]: [SN_RECTANGEL],
  // single square
  // 1111
  [ternaryToIndex("1111")]: [SQUARE],
  // single pentagon
  [ternaryToIndex("1211")]: [SW_PENTAGON],
  [ternaryToIndex("2111")]: [SE_PENTAGON],
  [ternaryToIndex("1112")]: [NE_PENTAGON],
  [ternaryToIndex("1121")]: [NW_PENTAGON],
  [ternaryToIndex("1011")]: [SW_PENTAGON],
  [ternaryToIndex("0111")]: [SE_PENTAGON],
  [ternaryToIndex("1110")]: [NE_PENTAGON],
  [ternaryToIndex("1101")]: [NW_PENTAGON],
  [ternaryToIndex("1200")]: [NW_N_PENTAGON],
  [ternaryToIndex("0120")]: [NE_E_PENTAGON],
  [ternaryToIndex("0012")]: [SE_S_PENTAGON],
  [ternaryToIndex("2001")]: [SW_W_PENTAGON],
  [ternaryToIndex("1022")]: [NW_N_PENTAGON],
  [ternaryToIndex("2102")]: [NE_E_PENTAGON],
  [ternaryToIndex("2210")]: [SE_S_PENTAGON],
  [ternaryToIndex("0221")]: [SW_W_PENTAGON],
  [ternaryToIndex("1002")]: [NW_W_PENTAGON],
  [ternaryToIndex("2100")]: [NE_N_PENTAGON],
  [ternaryToIndex("0210")]: [SE_E_PENTAGON],
  [ternaryToIndex("0021")]: [SW_S_PENTAGON],
  [ternaryToIndex("1220")]: [NW_W_PENTAGON],
  [ternaryToIndex("0122")]: [NE_N_PENTAGON],
  [ternaryToIndex("2012")]: [SE_E_PENTAGON],
  [ternaryToIndex("2201")]: [SW_S_PENTAGON],
  // single hexagon
  [ternaryToIndex("0211")]: [S_HEXAGON],
  [ternaryToIndex("2110")]: [E_HEXAGON],
  [ternaryToIndex("1102")]: [N_HEXAGON],
  [ternaryToIndex("1021")]: [W_HEXAGON],
  [ternaryToIndex("2011")]: [S_HEXAGON],
  [ternaryToIndex("0112")]: [E_HEXAGON],
  [ternaryToIndex("1120")]: [N_HEXAGON],
  [ternaryToIndex("1201")]: [W_HEXAGON],
  [ternaryToIndex("2101")]: [SW_NE_HEXAGON],
  [ternaryToIndex("0121")]: [SW_NE_HEXAGON],
  [ternaryToIndex("1012")]: [NW_SE_HEXAGON],
  [ternaryToIndex("1210")]: [NW_SE_HEXAGON],
  // 6-sided polygons based on mean weight
  // NOTE: merges mean value codes for extreme changes (as per above Wiki doc)
  [ternaryToIndex("0101")]: {
    0: [SW_TRIANGLE, NE_TRIANGLE],
    1: [SW_NE_HEXAGON],
    2: [SW_NE_HEXAGON]
  },
  [ternaryToIndex("1010")]: {
    0: [NW_TRIANGLE, SE_TRIANGLE],
    1: [NW_SE_HEXAGON],
    2: [NW_SE_HEXAGON]
  },
  [ternaryToIndex("2121")]: {
    0: [SW_NE_HEXAGON],
    1: [SW_NE_HEXAGON],
    2: [SW_TRIANGLE, NE_TRIANGLE]
  },
  [ternaryToIndex("1212")]: {
    0: [NW_SE_HEXAGON],
    1: [NW_SE_HEXAGON],
    2: [NW_TRIANGLE, SE_TRIANGLE]
  },
  // 7-sided polygons based on mean weight
  [ternaryToIndex("2120")]: {
    0: [NE_HEPTAGON],
    1: [NE_HEPTAGON],
    2: [SW_TRAPEZOID, NE_TRIANGLE]
  },
  [ternaryToIndex("2021")]: {
    0: [SW_HEPTAGON],
    1: [SW_HEPTAGON],
    2: [SW_TRIANGLE, NE_TRAPEZOID]
  },
  [ternaryToIndex("1202")]: {
    0: [NW_HEPTAGON],
    1: [NW_HEPTAGON],
    2: [NW_TRIANGLE, SE_TRAPEZOID]
  },
  [ternaryToIndex("0212")]: {
    0: [SE_HEPTAGON],
    1: [SE_HEPTAGON],
    2: [SE_TRIANGLE, NW_TRAPEZOID]
  },
  [ternaryToIndex("0102")]: {
    0: [SW_TRAPEZOID, NE_TRIANGLE],
    1: [NE_HEPTAGON],
    2: [NE_HEPTAGON]
  },
  [ternaryToIndex("0201")]: {
    0: [SW_TRIANGLE, NE_TRAPEZOID],
    1: [SW_HEPTAGON],
    2: [SW_HEPTAGON]
  },
  [ternaryToIndex("1020")]: {
    0: [NW_TRIANGLE, SE_TRAPEZOID],
    1: [NW_HEPTAGON],
    2: [NW_HEPTAGON]
  },
  [ternaryToIndex("2010")]: {
    0: [SE_TRIANGLE, NW_TRAPEZOID],
    1: [SE_HEPTAGON],
    2: [SE_HEPTAGON]
  },
  // 8-sided polygons based on mean weight
  [ternaryToIndex("2020")]: {
    0: [NW_TRAPEZOID, SE_TRAPEZOID],
    1: [OCTAGON],
    2: [SW_TRAPEZOID, NE_TRAPEZOID]
  },
  [ternaryToIndex("0202")]: {
    0: [NE_TRAPEZOID, SW_TRAPEZOID],
    1: [OCTAGON],
    2: [NW_TRAPEZOID, SE_TRAPEZOID]
  }
};

// dist/contour-layer/marching-squares.js
function getVertexCode(weight, threshold2) {
  if (Number.isNaN(weight)) {
    return 0;
  }
  if (Array.isArray(threshold2)) {
    if (weight < threshold2[0]) {
      return 0;
    }
    return weight < threshold2[1] ? 1 : 2;
  }
  return weight >= threshold2 ? 1 : 0;
}
function getCode(opts) {
  const { x, y, xRange, yRange, getValue, threshold: threshold2 } = opts;
  const isLeftBoundary = x < xRange[0];
  const isRightBoundary = x >= xRange[1] - 1;
  const isBottomBoundary = y < yRange[0];
  const isTopBoundary = y >= yRange[1] - 1;
  const isBoundary = isLeftBoundary || isRightBoundary || isBottomBoundary || isTopBoundary;
  let weights = 0;
  let current;
  let right;
  let top;
  let topRight;
  if (isLeftBoundary || isTopBoundary) {
    top = 0;
  } else {
    const w = getValue(x, y + 1);
    top = getVertexCode(w, threshold2);
    weights += w;
  }
  if (isRightBoundary || isTopBoundary) {
    topRight = 0;
  } else {
    const w = getValue(x + 1, y + 1);
    topRight = getVertexCode(w, threshold2);
    weights += w;
  }
  if (isRightBoundary || isBottomBoundary) {
    right = 0;
  } else {
    const w = getValue(x + 1, y);
    right = getVertexCode(w, threshold2);
    weights += w;
  }
  if (isLeftBoundary || isBottomBoundary) {
    current = 0;
  } else {
    const w = getValue(x, y);
    current = getVertexCode(w, threshold2);
    weights += w;
  }
  let code = -1;
  if (Number.isFinite(threshold2)) {
    code = top << 3 | topRight << 2 | right << 1 | current;
  }
  if (Array.isArray(threshold2)) {
    code = top << 6 | topRight << 4 | right << 2 | current;
  }
  let meanCode = 0;
  if (!isBoundary) {
    meanCode = getVertexCode(weights / 4, threshold2);
  }
  return { code, meanCode };
}
function getPolygons(opts) {
  const { x, y, z, code, meanCode } = opts;
  let offsets = ISOBANDS_CODE_OFFSET_MAP[code];
  if (!Array.isArray(offsets)) {
    offsets = offsets[meanCode];
  }
  const rX = x + 1;
  const rY = y + 1;
  const polygons = [];
  offsets.forEach((polygonOffsets) => {
    const polygon = [];
    polygonOffsets.forEach((xyOffset) => {
      const vX = rX + xyOffset[0];
      const vY = rY + xyOffset[1];
      polygon.push([vX, vY, z]);
    });
    polygons.push(polygon);
  });
  return polygons;
}
function getLines(opts) {
  const { x, y, z, code, meanCode } = opts;
  let offsets = ISOLINES_CODE_OFFSET_MAP[code];
  if (!Array.isArray(offsets)) {
    offsets = offsets[meanCode];
  }
  const rX = x + 1;
  const rY = y + 1;
  const lines = [];
  offsets.forEach((xyOffsets) => {
    xyOffsets.forEach((offset) => {
      const vX = rX + offset[0];
      const vY = rY + offset[1];
      lines.push([vX, vY, z]);
    });
  });
  return lines;
}

// dist/contour-layer/contour-utils.js
function generateContours({ contours, getValue, xRange, yRange }) {
  const contourLines = [];
  const contourPolygons = [];
  let segmentIndex = 0;
  let polygonIndex = 0;
  for (let i = 0; i < contours.length; i++) {
    const contour = contours[i];
    const z = contour.zIndex ?? i;
    const { threshold: threshold2 } = contour;
    for (let x = xRange[0] - 1; x < xRange[1]; x++) {
      for (let y = yRange[0] - 1; y < yRange[1]; y++) {
        const { code, meanCode } = getCode({
          getValue,
          threshold: threshold2,
          x,
          y,
          xRange,
          yRange
        });
        const opts = {
          x,
          y,
          z,
          code,
          meanCode
        };
        if (Array.isArray(threshold2)) {
          const polygons = getPolygons(opts);
          for (const polygon of polygons) {
            contourPolygons[polygonIndex++] = {
              vertices: polygon,
              contour
            };
          }
        } else {
          const path = getLines(opts);
          if (path.length > 0) {
            contourLines[segmentIndex++] = {
              vertices: path,
              contour
            };
          }
        }
      }
    }
  }
  return { lines: contourLines, polygons: contourPolygons };
}

// dist/contour-layer/value-reader.js
function getAggregatorValueReader(opts) {
  var _a, _b, _c;
  const { aggregator, binIdRange, channel } = opts;
  if (aggregator instanceof WebGLAggregator) {
    const buffer = (_a = aggregator.getResult(channel)) == null ? void 0 : _a.buffer;
    if (buffer) {
      const values = new Float32Array(buffer.readSyncWebGL().buffer);
      return getWebGLAggregatorValueReader(values, binIdRange);
    }
  }
  if (aggregator instanceof CPUAggregator) {
    const values = (_b = aggregator.getResult(channel)) == null ? void 0 : _b.value;
    const ids = (_c = aggregator.getBins()) == null ? void 0 : _c.value;
    if (ids && values) {
      return getCPUAggregatorValueReader(values, ids, aggregator.binCount);
    }
  }
  return null;
}
function getWebGLAggregatorValueReader(values, binIdRange) {
  const [[minX, maxX], [minY, maxY]] = binIdRange;
  const width = maxX - minX;
  const height = maxY - minY;
  return (x, y) => {
    x -= minX;
    y -= minY;
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return NaN;
    }
    return values[y * width + x];
  };
}
function getCPUAggregatorValueReader(values, ids, count3) {
  const idMap = {};
  for (let i = 0; i < count3; i++) {
    const x = ids[i * 2];
    const y = ids[i * 2 + 1];
    idMap[x] = idMap[x] || {};
    idMap[x][y] = values[i];
  }
  return (x, y) => {
    var _a;
    return ((_a = idMap[x]) == null ? void 0 : _a[y]) ?? NaN;
  };
}

// dist/contour-layer/contour-layer.js
var import_core26 = require("@math.gl/core");

// dist/contour-layer/bin-options-uniforms.js
var uniformBlock11 = (
  /* glsl */
  `layout(std140) uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`
);
var binOptionsUniforms3 = {
  name: "binOptions",
  vs: uniformBlock11,
  uniformTypes: {
    cellOriginCommon: "vec2<f32>",
    cellSizeCommon: "vec2<f32>"
  }
};

// dist/contour-layer/contour-layer.js
var DEFAULT_COLOR4 = [255, 255, 255, 255];
var DEFAULT_STROKE_WIDTH = 1;
var defaultProps7 = {
  // grid aggregation
  cellSize: { type: "number", min: 1, value: 1e3 },
  gridOrigin: { type: "array", compare: true, value: [0, 0] },
  getPosition: { type: "accessor", value: (x) => x.position },
  getWeight: { type: "accessor", value: 1 },
  gpuAggregation: true,
  aggregation: "SUM",
  // contour lines
  contours: {
    type: "object",
    value: [{ threshold: 1 }],
    optional: true,
    compare: 3
  },
  zOffset: 5e-3
};
var GridLayer = class extends aggregation_layer_default {
  getAggregatorType() {
    return this.props.gpuAggregation && WebGLAggregator.isSupported(this.context.device) ? "gpu" : "cpu";
  }
  createAggregator(type) {
    if (type === "cpu") {
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            const viewport = this.state.aggregatorViewport;
            const p = viewport.projectPosition(positions);
            const { cellSizeCommon, cellOriginCommon } = opts;
            return [
              Math.floor((p[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
              Math.floor((p[1] - cellOriginCommon[1]) / cellSizeCommon[1])
            ];
          }
        },
        getValue: [{ sources: ["counts"], getValue: ({ counts }) => counts }],
        onUpdate: this._onAggregationUpdate.bind(this)
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 1,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [project32_default, binOptionsUniforms3],
        vs: (
          /* glsl */
          `
  in vec3 positions;
  in vec3 positions64Low;
  in float counts;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out float value) {
    value = counts;
  }
  `
        )
      }),
      onUpdate: this._onAggregationUpdate.bind(this)
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      counts: { size: 1, accessor: "getWeight" }
    });
  }
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { aggregator } = this.state;
    if (aggregatorChanged || changeFlags.dataChanged || props.cellSize !== oldProps.cellSize || !deepEqual(props.gridOrigin, oldProps.gridOrigin, 1) || props.aggregation !== oldProps.aggregation) {
      this._updateBinOptions();
      const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.aggregation],
        binOptions: {
          cellSizeCommon,
          cellOriginCommon
        }
      });
    }
    if (!deepEqual(oldProps.contours, props.contours, 2)) {
      this.setState({ contourData: null });
    }
    return aggregatorChanged;
  }
  _updateBinOptions() {
    const bounds = this.getBounds();
    const cellSizeCommon = [1, 1];
    let cellOriginCommon = [0, 0];
    let binIdRange = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;
    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const { cellSize, gridOrigin } = this.props;
      const { unitsPerMeter: unitsPerMeter2 } = viewport.getDistanceScales(centroid);
      cellSizeCommon[0] = unitsPerMeter2[0] * cellSize;
      cellSizeCommon[1] = unitsPerMeter2[1] * cellSize;
      const centroidCommon = viewport.projectFlat(centroid);
      cellOriginCommon = [
        Math.floor((centroidCommon[0] - gridOrigin[0]) / cellSizeCommon[0]) * cellSizeCommon[0] + gridOrigin[0],
        Math.floor((centroidCommon[1] - gridOrigin[1]) / cellSizeCommon[1]) * cellSizeCommon[1] + gridOrigin[1]
      ];
      centroid = viewport.unprojectFlat(cellOriginCommon);
      const ViewportType = viewport.constructor;
      viewport = viewport.isGeospatial ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 }) : new Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
      cellOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p) => {
          const positionCommon = viewport.projectFlat(p);
          return [
            Math.floor((positionCommon[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
            Math.floor((positionCommon[1] - cellOriginCommon[1]) / cellSizeCommon[1])
          ];
        }
      });
    }
    this.setState({ cellSizeCommon, cellOriginCommon, binIdRange, aggregatorViewport: viewport });
  }
  draw(opts) {
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }
  _onAggregationUpdate() {
    const { aggregator, binIdRange } = this.state;
    this.setState({
      aggregatedValueReader: getAggregatorValueReader({ aggregator, binIdRange, channel: 0 }),
      contourData: null
    });
  }
  _getContours() {
    const { aggregatedValueReader } = this.state;
    if (!aggregatedValueReader) {
      return null;
    }
    if (!this.state.contourData) {
      const { binIdRange } = this.state;
      const { contours } = this.props;
      const contourData = generateContours({
        contours,
        getValue: aggregatedValueReader,
        xRange: binIdRange[0],
        yRange: binIdRange[1]
      });
      this.state.contourData = contourData;
    }
    return this.state.contourData;
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        this._updateBinOptions();
        const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            cellSizeCommon,
            cellOriginCommon
          }
        });
        break;
      case "counts":
        aggregator.setNeedsUpdate(0);
        break;
      default:
    }
  }
  renderLayers() {
    const contourData = this._getContours();
    if (!contourData) {
      return null;
    }
    const { lines, polygons } = contourData;
    const { zOffset } = this.props;
    const { cellOriginCommon, cellSizeCommon } = this.state;
    const LinesSubLayerClass = this.getSubLayerClass("lines", PathLayer);
    const BandsSubLayerClass = this.getSubLayerClass("bands", SolidPolygonLayer);
    const modelMatrix = new import_core26.Matrix4().translate([cellOriginCommon[0], cellOriginCommon[1], 0]).scale([cellSizeCommon[0], cellSizeCommon[1], zOffset]);
    const lineLayer = lines && lines.length > 0 && new LinesSubLayerClass(this.getSubLayerProps({
      id: "lines"
    }), {
      data: lines,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      modelMatrix,
      getPath: (d) => d.vertices,
      getColor: (d) => d.contour.color ?? DEFAULT_COLOR4,
      getWidth: (d) => d.contour.strokeWidth ?? DEFAULT_STROKE_WIDTH,
      widthUnits: "pixels"
    });
    const bandsLayer = polygons && polygons.length > 0 && new BandsSubLayerClass(this.getSubLayerProps({
      id: "bands"
    }), {
      data: polygons,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      modelMatrix,
      getPolygon: (d) => d.vertices,
      getFillColor: (d) => d.contour.color ?? DEFAULT_COLOR4
    });
    return [lineLayer, bandsLayer];
  }
  getPickingInfo(params) {
    const info = params.info;
    const { object } = info;
    if (object) {
      info.object = {
        contour: object.contour
      };
    }
    return info;
  }
};
GridLayer.layerName = "ContourLayer";
GridLayer.defaultProps = defaultProps7;
var contour_layer_default = GridLayer;

// dist/grid-layer/grid-cell-layer.js
var import_engine12 = require("@luma.gl/engine");

// dist/grid-layer/grid-cell-layer.wgsl.js
var grid_cell_layer_wgsl_default = (
  /* wgsl */
  null
);

// dist/grid-layer/grid-cell-layer-vertex.glsl.js
var grid_cell_layer_vertex_glsl_default = (
  /* glsl */
  `#version 300 es
#define SHADER_NAME grid-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
uniform sampler2D colorRange;
out vec4 vColor;
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = picking_getPickingColorFromInstanceID();
if (isnan(instanceColorValues) ||
instanceColorValues < grid.colorDomain.z ||
instanceColorValues > grid.colorDomain.w ||
instanceElevationValues < grid.elevationDomain.z ||
instanceElevationValues > grid.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = (instancePositions + (positions.xy + 1.0) / 2.0 * column.coverage) * grid.sizeCommon + grid.originCommon - project.commonOrigin.xy;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, grid.elevationDomain.xy, grid.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, grid.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`
);

// dist/grid-layer/grid-layer-uniforms.js
var uniformBlockWGSL6 = null;
var uniformBlock12 = (
  /* glsl */
  `layout(std140) uniform gridUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
  vec2 sizeCommon;
} grid;
`
);
var gridUniforms = {
  name: "grid",
  source: uniformBlockWGSL6,
  vs: uniformBlock12,
  uniformTypes: {
    colorDomain: "vec4<f32>",
    elevationDomain: "vec4<f32>",
    elevationRange: "vec2<f32>",
    originCommon: "vec2<f32>",
    sizeCommon: "vec2<f32>"
  }
};

// dist/grid-layer/grid-cell-layer.js
var GridCellLayer = class extends ColumnLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.modules.push(gridUniforms);
    return { ...shaders, source: grid_cell_layer_wgsl_default, vs: grid_cell_layer_vertex_glsl_default };
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.remove([
      "instanceElevations",
      "instanceFillColors",
      "instanceLineColors",
      "instanceStrokeWidths"
    ]);
    attributeManager.addInstanced({
      instancePositions: {
        size: 2,
        type: "float32",
        accessor: "getBin"
      },
      instanceColorValues: {
        size: 1,
        type: "float32",
        accessor: "getColorValue"
      },
      instanceElevationValues: {
        size: 1,
        type: "float32",
        accessor: "getElevationValue"
      }
    });
  }
  updateState(params) {
    var _a;
    super.updateState(params);
    const { props, oldProps } = params;
    const model = this.state.fillModel;
    if (oldProps.colorRange !== props.colorRange) {
      (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
      this.state.colorTexture = createColorRangeTexture(this.context.device, props.colorRange, props.colorScaleType);
      const gridProps = { colorRange: this.state.colorTexture };
      model.shaderInputs.setProps({ grid: gridProps });
    } else if (oldProps.colorScaleType !== props.colorScaleType) {
      updateColorRangeTexture(this.state.colorTexture, props.colorScaleType);
    }
  }
  finalizeState(context) {
    var _a;
    super.finalizeState(context);
    (_a = this.state.colorTexture) == null ? void 0 : _a.destroy();
  }
  _updateGeometry() {
    const geometry = new import_engine12.CubeGeometry();
    this._setFillGeometry(geometry);
  }
  draw({ uniforms }) {
    const { cellOriginCommon, cellSizeCommon, elevationRange, elevationScale, extruded, coverage, colorDomain, elevationDomain } = this.props;
    const colorCutoff = this.props.colorCutoff || [-Infinity, Infinity];
    const elevationCutoff = this.props.elevationCutoff || [-Infinity, Infinity];
    const fillModel = this.state.fillModel;
    const gridProps = {
      colorDomain: [
        Math.max(colorDomain[0], colorCutoff[0]),
        // instanceColorValue that maps to colorRange[0]
        Math.min(colorDomain[1], colorCutoff[1]),
        // instanceColorValue that maps to colorRange[colorRange.length - 1]
        Math.max(colorDomain[0] - 1, colorCutoff[0]),
        // hide cell if instanceColorValue is less than this
        Math.min(colorDomain[1] + 1, colorCutoff[1])
        // hide cell if instanceColorValue is greater than this
      ],
      elevationDomain: [
        Math.max(elevationDomain[0], elevationCutoff[0]),
        // instanceElevationValue that maps to elevationRange[0]
        Math.min(elevationDomain[1], elevationCutoff[1]),
        // instanceElevationValue that maps to elevationRange[elevationRange.length - 1]
        Math.max(elevationDomain[0] - 1, elevationCutoff[0]),
        // hide cell if instanceElevationValue is less than this
        Math.min(elevationDomain[1] + 1, elevationCutoff[1])
        // hide cell if instanceElevationValue is greater than this
      ],
      elevationRange: [elevationRange[0] * elevationScale, elevationRange[1] * elevationScale],
      originCommon: cellOriginCommon,
      sizeCommon: cellSizeCommon
    };
    fillModel.shaderInputs.setProps({
      column: { extruded, coverage },
      grid: gridProps
    });
    fillModel.draw(this.context.renderPass);
  }
};
GridCellLayer.layerName = "GridCellLayer";

// dist/grid-layer/bin-options-uniforms.js
var uniformBlock13 = (
  /* glsl */
  `layout(std140) uniform binOptionsUniforms {
  vec2 cellOriginCommon;
  vec2 cellSizeCommon;
} binOptions;
`
);
var binOptionsUniforms4 = {
  name: "binOptions",
  vs: uniformBlock13,
  uniformTypes: {
    cellOriginCommon: "vec2<f32>",
    cellSizeCommon: "vec2<f32>"
  }
};

// dist/grid-layer/grid-layer.js
function noop2() {
}
var defaultProps8 = {
  gpuAggregation: true,
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: { type: "accessor", value: null },
  // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: { type: "accessor", value: 1 },
  colorAggregation: "SUM",
  lowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  upperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  colorScaleType: "quantize",
  onSetColorDomain: noop2,
  // elevation
  elevationDomain: null,
  elevationRange: [0, 1e3],
  getElevationValue: { type: "accessor", value: null },
  // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: { type: "accessor", value: 1 },
  elevationAggregation: "SUM",
  elevationScale: { type: "number", min: 0, value: 1 },
  elevationLowerPercentile: { type: "number", min: 0, max: 100, value: 0 },
  elevationUpperPercentile: { type: "number", min: 0, max: 100, value: 100 },
  elevationScaleType: "linear",
  onSetElevationDomain: noop2,
  // grid
  cellSize: { type: "number", min: 0, value: 1e3 },
  coverage: { type: "number", min: 0, max: 1, value: 1 },
  getPosition: { type: "accessor", value: (x) => x.position },
  gridAggregator: { type: "function", optional: true, value: null },
  extruded: false,
  // Optional material for 'lighting' shader module
  material: true
};
var GridLayer2 = class extends aggregation_layer_default {
  getAggregatorType() {
    const { gpuAggregation, gridAggregator, getColorValue, getElevationValue } = this.props;
    if (gpuAggregation && (gridAggregator || getColorValue || getElevationValue)) {
      log_default.warn("Features not supported by GPU aggregation, falling back to CPU")();
      return "cpu";
    }
    if (
      // GPU aggregation is requested
      gpuAggregation && // GPU aggregation is supported by the device
      WebGLAggregator.isSupported(this.context.device)
    ) {
      return "gpu";
    }
    return "cpu";
  }
  createAggregator(type) {
    if (type === "cpu") {
      const { gridAggregator, cellSize } = this.props;
      return new CPUAggregator({
        dimensions: 2,
        getBin: {
          sources: ["positions"],
          getValue: ({ positions }, index, opts) => {
            if (gridAggregator) {
              return gridAggregator(positions, cellSize);
            }
            const viewport = this.state.aggregatorViewport;
            const p = viewport.projectPosition(positions);
            const { cellSizeCommon, cellOriginCommon } = opts;
            return [
              Math.floor((p[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
              Math.floor((p[1] - cellOriginCommon[1]) / cellSizeCommon[1])
            ];
          }
        },
        getValue: [
          { sources: ["colorWeights"], getValue: ({ colorWeights }) => colorWeights },
          { sources: ["elevationWeights"], getValue: ({ elevationWeights }) => elevationWeights }
        ]
      });
    }
    return new WebGLAggregator(this.context.device, {
      dimensions: 2,
      channelCount: 2,
      bufferLayout: this.getAttributeManager().getBufferLayouts({ isInstanced: false }),
      ...super.getShaders({
        modules: [project32_default, binOptionsUniforms4],
        vs: (
          /* glsl */
          `
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    vec2 gridCoords = floor(positionCommon.xy / binOptions.cellSizeCommon);
    binId = ivec2(gridCoords);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `
        )
      })
    });
  }
  initializeState() {
    super.initializeState();
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        accessor: "getPosition",
        type: "float64",
        fp64: this.use64bitPositions()
      },
      colorWeights: { size: 1, accessor: "getColorWeight" },
      elevationWeights: { size: 1, accessor: "getElevationWeight" }
    });
  }
  // eslint-disable-next-line complexity
  updateState(params) {
    const aggregatorChanged = super.updateState(params);
    const { props, oldProps, changeFlags } = params;
    const { aggregator } = this.state;
    if ((changeFlags.dataChanged || !this.state.dataAsArray) && (props.getColorValue || props.getElevationValue)) {
      this.state.dataAsArray = Array.from(createIterable(props.data).iterable);
    }
    if (aggregatorChanged || changeFlags.dataChanged || props.cellSize !== oldProps.cellSize || props.getColorValue !== oldProps.getColorValue || props.getElevationValue !== oldProps.getElevationValue || props.colorAggregation !== oldProps.colorAggregation || props.elevationAggregation !== oldProps.elevationAggregation) {
      this._updateBinOptions();
      const { cellSizeCommon, cellOriginCommon, binIdRange, dataAsArray } = this.state;
      aggregator.setProps({
        // @ts-expect-error only used by GPUAggregator
        binIdRange,
        pointCount: this.getNumInstances(),
        operations: [props.colorAggregation, props.elevationAggregation],
        binOptions: {
          cellSizeCommon,
          cellOriginCommon
        },
        onUpdate: this._onAggregationUpdate.bind(this)
      });
      if (dataAsArray) {
        const { getColorValue, getElevationValue } = this.props;
        aggregator.setProps({
          // @ts-expect-error only used by CPUAggregator
          customOperations: [
            getColorValue && ((indices) => getColorValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data })),
            getElevationValue && ((indices) => getElevationValue(indices.map((i) => dataAsArray[i]), { indices, data: props.data }))
          ]
        });
      }
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getColorValue) {
      aggregator.setNeedsUpdate(0);
    }
    if (changeFlags.updateTriggersChanged && changeFlags.updateTriggersChanged.getElevationValue) {
      aggregator.setNeedsUpdate(1);
    }
    return aggregatorChanged;
  }
  _updateBinOptions() {
    const bounds = this.getBounds();
    const cellSizeCommon = [1, 1];
    let cellOriginCommon = [0, 0];
    let binIdRange = [
      [0, 1],
      [0, 1]
    ];
    let viewport = this.context.viewport;
    if (bounds && Number.isFinite(bounds[0][0])) {
      let centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];
      const { cellSize } = this.props;
      const { unitsPerMeter: unitsPerMeter2 } = viewport.getDistanceScales(centroid);
      cellSizeCommon[0] = unitsPerMeter2[0] * cellSize;
      cellSizeCommon[1] = unitsPerMeter2[1] * cellSize;
      const centroidCommon = viewport.projectFlat(centroid);
      cellOriginCommon = [
        Math.floor(centroidCommon[0] / cellSizeCommon[0]) * cellSizeCommon[0],
        Math.floor(centroidCommon[1] / cellSizeCommon[1]) * cellSizeCommon[1]
      ];
      centroid = viewport.unprojectFlat(cellOriginCommon);
      const ViewportType = viewport.constructor;
      viewport = viewport.isGeospatial ? new ViewportType({ longitude: centroid[0], latitude: centroid[1], zoom: 12 }) : new Viewport({ position: [centroid[0], centroid[1], 0], zoom: 12 });
      cellOriginCommon = [Math.fround(viewport.center[0]), Math.fround(viewport.center[1])];
      binIdRange = getBinIdRange({
        dataBounds: bounds,
        getBinId: (p) => {
          const positionCommon = viewport.projectFlat(p);
          return [
            Math.floor((positionCommon[0] - cellOriginCommon[0]) / cellSizeCommon[0]),
            Math.floor((positionCommon[1] - cellOriginCommon[1]) / cellSizeCommon[1])
          ];
        }
      });
    }
    this.setState({ cellSizeCommon, cellOriginCommon, binIdRange, aggregatorViewport: viewport });
  }
  draw(opts) {
    if (opts.shaderModuleProps.project) {
      opts.shaderModuleProps.project.viewport = this.state.aggregatorViewport;
    }
    super.draw(opts);
  }
  _onAggregationUpdate({ channel }) {
    const props = this.getCurrentLayer().props;
    const { aggregator } = this.state;
    if (channel === 0) {
      const result = aggregator.getResult(0);
      this.setState({
        colors: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetColorDomain(aggregator.getResultDomain(0));
    } else if (channel === 1) {
      const result = aggregator.getResult(1);
      this.setState({
        elevations: new AttributeWithScale(result, aggregator.binCount)
      });
      props.onSetElevationDomain(aggregator.getResultDomain(1));
    }
  }
  onAttributeChange(id) {
    const { aggregator } = this.state;
    switch (id) {
      case "positions":
        aggregator.setNeedsUpdate();
        this._updateBinOptions();
        const { cellSizeCommon, cellOriginCommon, binIdRange } = this.state;
        aggregator.setProps({
          // @ts-expect-error only used by GPUAggregator
          binIdRange,
          binOptions: {
            cellSizeCommon,
            cellOriginCommon
          }
        });
        break;
      case "colorWeights":
        aggregator.setNeedsUpdate(0);
        break;
      case "elevationWeights":
        aggregator.setNeedsUpdate(1);
        break;
      default:
    }
  }
  renderLayers() {
    var _a, _b;
    const { aggregator, cellOriginCommon, cellSizeCommon } = this.state;
    const { elevationScale, colorRange, elevationRange, extruded, coverage, material, transitions, colorScaleType, lowerPercentile, upperPercentile, colorDomain, elevationScaleType, elevationLowerPercentile, elevationUpperPercentile, elevationDomain } = this.props;
    const CellLayerClass = this.getSubLayerClass("cells", GridCellLayer);
    const binAttribute = aggregator.getBins();
    const colors = (_a = this.state.colors) == null ? void 0 : _a.update({
      scaleType: colorScaleType,
      lowerPercentile,
      upperPercentile
    });
    const elevations = (_b = this.state.elevations) == null ? void 0 : _b.update({
      scaleType: elevationScaleType,
      lowerPercentile: elevationLowerPercentile,
      upperPercentile: elevationUpperPercentile
    });
    if (!colors || !elevations) {
      return null;
    }
    return new CellLayerClass(this.getSubLayerProps({
      id: "cells"
    }), {
      data: {
        length: aggregator.binCount,
        attributes: {
          getBin: binAttribute,
          getColorValue: colors.attribute,
          getElevationValue: elevations.attribute
        }
      },
      // Data has changed shallowly, but we likely don't need to update the attributes
      dataComparator: (data, oldData) => data.length === oldData.length,
      updateTriggers: {
        getBin: [binAttribute],
        getColorValue: [colors.attribute],
        getElevationValue: [elevations.attribute]
      },
      cellOriginCommon,
      cellSizeCommon,
      elevationScale,
      colorRange,
      colorScaleType,
      elevationRange,
      extruded,
      coverage,
      material,
      colorDomain: colors.domain || colorDomain || aggregator.getResultDomain(0),
      elevationDomain: elevations.domain || elevationDomain || aggregator.getResultDomain(1),
      colorCutoff: colors.cutoff,
      elevationCutoff: elevations.cutoff,
      transitions: transitions && {
        getFillColor: transitions.getColorValue || transitions.getColorWeight,
        getElevation: transitions.getElevationValue || transitions.getElevationWeight
      },
      // Extensions are already handled by the GPUAggregator, do not pass it down
      extensions: []
    });
  }
  getPickingInfo(params) {
    const info = params.info;
    const { index } = info;
    if (index >= 0) {
      const bin = this.state.aggregator.getBin(index);
      let object;
      if (bin) {
        object = {
          col: bin.id[0],
          row: bin.id[1],
          colorValue: bin.value[0],
          elevationValue: bin.value[1],
          count: bin.count
        };
        if (bin.pointIndices) {
          object.pointIndices = bin.pointIndices;
          object.points = Array.isArray(this.props.data) ? bin.pointIndices.map((i) => this.props.data[i]) : [];
        }
      }
      info.object = object;
    }
    return info;
  }
};
GridLayer2.layerName = "GridLayer";
GridLayer2.defaultProps = defaultProps8;
var grid_layer_default = GridLayer2;

// dist/heatmap-layer/heatmap-layer-utils.js
function getBounds2(points) {
  const x = points.map((p) => p[0]);
  const y = points.map((p) => p[1]);
  const xMin = Math.min.apply(null, x);
  const xMax = Math.max.apply(null, x);
  const yMin = Math.min.apply(null, y);
  const yMax = Math.max.apply(null, y);
  return [xMin, yMin, xMax, yMax];
}
function boundsContain(currentBounds, targetBounds) {
  if (targetBounds[0] >= currentBounds[0] && targetBounds[2] <= currentBounds[2] && targetBounds[1] >= currentBounds[1] && targetBounds[3] <= currentBounds[3]) {
    return true;
  }
  return false;
}
var scratchArray2 = new Float32Array(12);
function packVertices(points, dimensions = 2) {
  let index = 0;
  for (const point of points) {
    for (let i = 0; i < dimensions; i++) {
      scratchArray2[index++] = point[i] || 0;
    }
  }
  return scratchArray2;
}
function scaleToAspectRatio(boundingBox, width, height) {
  const [xMin, yMin, xMax, yMax] = boundingBox;
  const currentWidth = xMax - xMin;
  const currentHeight = yMax - yMin;
  let newWidth = currentWidth;
  let newHeight = currentHeight;
  if (currentWidth / currentHeight < width / height) {
    newWidth = width / height * currentHeight;
  } else {
    newHeight = height / width * currentWidth;
  }
  if (newWidth < width) {
    newWidth = width;
    newHeight = height;
  }
  const xCenter = (xMax + xMin) / 2;
  const yCenter = (yMax + yMin) / 2;
  return [
    xCenter - newWidth / 2,
    yCenter - newHeight / 2,
    xCenter + newWidth / 2,
    yCenter + newHeight / 2
  ];
}
function getTextureCoordinates(point, bounds) {
  const [xMin, yMin, xMax, yMax] = bounds;
  return [(point[0] - xMin) / (xMax - xMin), (point[1] - yMin) / (yMax - yMin)];
}

// dist/heatmap-layer/heatmap-layer.js
var import_engine14 = require("@luma.gl/engine");

// dist/heatmap-layer/triangle-layer.js
var import_engine13 = require("@luma.gl/engine");

// dist/heatmap-layer/triangle-layer.wgsl.js
var triangle_layer_wgsl_default = (
  /* wgsl */
  null
);

// dist/heatmap-layer/triangle-layer-vertex.glsl.js
var triangle_layer_vertex_glsl_default = `#version 300 es
#define SHADER_NAME heatp-map-layer-vertex-shader
uniform sampler2D maxTexture;
in vec3 positions;
in vec2 texCoords;
out vec2 vTexCoords;
out float vIntensityMin;
out float vIntensityMax;
void main(void) {
gl_Position = project_position_to_clipspace(positions, vec3(0.0), vec3(0.0));
vTexCoords = texCoords;
vec4 maxTexture = texture(maxTexture, vec2(0.5));
float maxValue = triangle.aggregationMode < 0.5 ? maxTexture.r : maxTexture.g;
float minValue = maxValue * triangle.threshold;
if (triangle.colorDomain[1] > 0.) {
maxValue = triangle.colorDomain[1];
minValue = triangle.colorDomain[0];
}
vIntensityMax = triangle.intensity / maxValue;
vIntensityMin = triangle.intensity / minValue;
}
`;

// dist/heatmap-layer/triangle-layer-fragment.glsl.js
var triangle_layer_fragment_glsl_default = `#version 300 es
#define SHADER_NAME triangle-layer-fragment-shader
precision highp float;
uniform sampler2D weightsTexture;
uniform sampler2D colorTexture;
in vec2 vTexCoords;
in float vIntensityMin;
in float vIntensityMax;
out vec4 fragColor;
vec4 getLinearColor(float value) {
float factor = clamp(value * vIntensityMax, 0., 1.);
vec4 color = texture(colorTexture, vec2(factor, 0.5));
color.a *= min(value * vIntensityMin, 1.0);
return color;
}
void main(void) {
vec4 weights = texture(weightsTexture, vTexCoords);
float weight = weights.r;
if (triangle.aggregationMode > 0.5) {
weight /= max(1.0, weights.a);
}
if (weight <= 0.) {
discard;
}
vec4 linearColor = getLinearColor(weight);
linearColor.a *= layer.opacity;
fragColor = linearColor;
}
`;

// dist/heatmap-layer/triangle-layer-uniforms.js
var uniformBlockWGSL7 = null;
var uniformBlock14 = `layout(std140) uniform triangleUniforms {
  float aggregationMode;
  vec2 colorDomain;
  float intensity;
  float threshold;
} triangle;
`;
var triangleUniforms = {
  name: "triangle",
  source: uniformBlockWGSL7,
  vs: uniformBlock14,
  fs: uniformBlock14,
  uniformTypes: {
    aggregationMode: "f32",
    colorDomain: "vec2<f32>",
    intensity: "f32",
    threshold: "f32"
  }
};

// dist/heatmap-layer/triangle-layer.js
var TriangleLayer = class extends Layer {
  getShaders() {
    return super.getShaders({ source: triangle_layer_wgsl_default, vs: triangle_layer_vertex_glsl_default, fs: triangle_layer_fragment_glsl_default, modules: [project32_default, color_default, triangleUniforms] });
  }
  initializeState({ device }) {
    this.setState({ model: this._getModel(device) });
  }
  _getModel(device) {
    const { vertexCount, data } = this.props;
    return new import_engine13.Model(device, {
      ...this.getShaders(),
      id: this.props.id,
      attributes: data.attributes,
      bufferLayout: [
        { name: "positions", format: "float32x3" },
        { name: "texCoords", format: "float32x2" }
      ],
      topology: "triangle-strip",
      vertexCount
    });
  }
  draw() {
    const { model } = this.state;
    const { aggregationMode, colorDomain, intensity, threshold: threshold2, colorTexture, maxTexture, weightsTexture } = this.props;
    const triangleProps = {
      aggregationMode,
      colorDomain,
      intensity,
      threshold: threshold2,
      colorTexture,
      maxTexture,
      weightsTexture
    };
    model.shaderInputs.setProps({ triangle: triangleProps });
    model.draw(this.context.renderPass);
  }
};
TriangleLayer.layerName = "TriangleLayer";
var triangle_layer_default = TriangleLayer;

// dist/common/utils/prop-utils.js
function filterProps(props, filterKeys) {
  const filteredProps = {};
  for (const key in props) {
    if (!filterKeys.includes(key)) {
      filteredProps[key] = props[key];
    }
  }
  return filteredProps;
}

// dist/heatmap-layer/aggregation-layer.js
var AggregationLayer2 = class extends CompositeLayer {
  initializeAggregationLayer(dimensions) {
    super.initializeState(this.context);
    this.setState({
      // Layer props , when changed doesn't require updating aggregation
      ignoreProps: filterProps(this.constructor._propTypes, dimensions.data.props),
      dimensions
    });
  }
  updateState(opts) {
    super.updateState(opts);
    const { changeFlags } = opts;
    if (changeFlags.extensionsChanged) {
      const shaders = this.getShaders({});
      if (shaders && shaders.defines) {
        shaders.defines.NON_INSTANCED_MODEL = 1;
      }
      this.updateShaders(shaders);
    }
    this._updateAttributes();
  }
  updateAttributes(changedAttributes) {
    this.setState({ changedAttributes });
  }
  getAttributes() {
    return this.getAttributeManager().getAttributes();
  }
  getModuleSettings() {
    const { viewport, mousePosition, device } = this.context;
    const moduleSettings = Object.assign(Object.create(this.props), {
      viewport,
      mousePosition,
      picking: {
        isActive: 0
      },
      // @ts-expect-error TODO - assuming WebGL context
      devicePixelRatio: device.canvasContext.cssToDeviceRatio()
    });
    return moduleSettings;
  }
  updateShaders(shaders) {
  }
  /**
   * Checks if aggregation is dirty
   * @param {Object} updateOpts - object {props, oldProps, changeFlags}
   * @param {Object} params - object {dimension, compareAll}
   * @param {Object} params.dimension - {props, accessors} array of props and/or accessors
   * @param {Boolean} params.compareAll - when `true` it will include non layer props for comparision
   * @returns {Boolean} - returns true if dimensions' prop or accessor is changed
   **/
  isAggregationDirty(updateOpts, params = {}) {
    const { props, oldProps, changeFlags } = updateOpts;
    const { compareAll = false, dimension } = params;
    const { ignoreProps } = this.state;
    const { props: dataProps, accessors = [] } = dimension;
    const { updateTriggersChanged } = changeFlags;
    if (changeFlags.dataChanged) {
      return true;
    }
    if (updateTriggersChanged) {
      if (updateTriggersChanged.all) {
        return true;
      }
      for (const accessor of accessors) {
        if (updateTriggersChanged[accessor]) {
          return true;
        }
      }
    }
    if (compareAll) {
      if (changeFlags.extensionsChanged) {
        return true;
      }
      return compareProps({
        oldProps,
        newProps: props,
        ignoreProps,
        propTypes: this.constructor._propTypes
      });
    }
    for (const name of dataProps) {
      if (props[name] !== oldProps[name]) {
        return true;
      }
    }
    return false;
  }
  /**
   * Checks if an attribute is changed
   * @param {String} name - name of the attribute
   * @returns {Boolean} - `true` if attribute `name` is changed, `false` otherwise,
   *                       If `name` is not passed or `undefiend`, `true` if any attribute is changed, `false` otherwise
   **/
  isAttributeChanged(name) {
    const { changedAttributes } = this.state;
    if (!name) {
      return !isObjectEmpty(changedAttributes);
    }
    return changedAttributes && changedAttributes[name] !== void 0;
  }
  // Private
  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
};
AggregationLayer2.layerName = "AggregationLayer";
var aggregation_layer_default2 = AggregationLayer2;
function isObjectEmpty(obj) {
  let isEmpty = true;
  for (const key in obj) {
    isEmpty = false;
    break;
  }
  return isEmpty;
}

// dist/heatmap-layer/weights-vs.glsl.js
var weights_vs_glsl_default = `#version 300 es
in vec3 positions;
in vec3 positions64Low;
in float weights;
out vec4 weightsTexture;
void main()
{
weightsTexture = vec4(weights * weight.weightsScale, 0., 0., 1.);
float radiusTexels = project_pixel_size(weight.radiusPixels) * weight.textureWidth / (weight.commonBounds.z - weight.commonBounds.x);
gl_PointSize = radiusTexels * 2.;
vec3 commonPosition = project_position(positions, positions64Low);
gl_Position.xy = (commonPosition.xy - weight.commonBounds.xy) / (weight.commonBounds.zw - weight.commonBounds.xy) ;
gl_Position.xy = (gl_Position.xy * 2.) - (1.);
gl_Position.w = 1.0;
}
`;

// dist/heatmap-layer/weights-fs.glsl.js
var weights_fs_glsl_default = `#version 300 es
in vec4 weightsTexture;
out vec4 fragColor;
float gaussianKDE(float u){
return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);
}
void main()
{
float dist = length(gl_PointCoord - vec2(0.5, 0.5));
if (dist > 0.5) {
discard;
}
fragColor = weightsTexture * gaussianKDE(2. * dist);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

// dist/heatmap-layer/max-vs.glsl.js
var max_vs_glsl_default = `#version 300 es
uniform sampler2D inTexture;
out vec4 outTexture;
void main()
{
int yIndex = gl_VertexID / int(maxWeight.textureSize);
int xIndex = gl_VertexID - (yIndex * int(maxWeight.textureSize));
vec2 uv = (0.5 + vec2(float(xIndex), float(yIndex))) / maxWeight.textureSize;
outTexture = texture(inTexture, uv);
gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
gl_PointSize = 1.0;
}
`;

// dist/heatmap-layer/max-fs.glsl.js
var max_fs_glsl_default = `#version 300 es
in vec4 outTexture;
out vec4 fragColor;
void main() {
fragColor = outTexture;
fragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`;

// dist/heatmap-layer/max.wgsl.js
var max_wgsl_default = (
  /* wgsl */
  null
);

// dist/heatmap-layer/weights.wgsl.js
var weights_wgsl_default = (
  /* wgsl */
  null
);

// dist/heatmap-layer/heatmap-layer-uniforms.js
var uniformBlockWGSL8 = null;
var uniformBlock15 = `layout(std140) uniform weightUniforms {
  vec4 commonBounds;
  float radiusPixels;
  float textureWidth;
  float weightsScale;
} weight;
`;
var weightUniforms = {
  name: "weight",
  source: uniformBlockWGSL8,
  vs: uniformBlock15,
  uniformTypes: {
    commonBounds: "vec4<f32>",
    radiusPixels: "f32",
    textureWidth: "f32",
    weightsScale: "f32"
  }
};
var maxWeightUniforms = {
  name: "maxWeight",
  source: null,
  vs: `layout(std140) uniform maxWeightUniforms {
  float textureSize;
} maxWeight;
`,
  uniformTypes: {
    textureSize: "f32"
  }
};

// dist/heatmap-layer/heatmap-layer.js
var RESOLUTION = 2;
var TEXTURE_PROPS = {
  format: "rgba8unorm",
  dimension: "2d",
  width: 1,
  height: 1,
  sampler: {
    minFilter: "linear",
    magFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  }
};
var DEFAULT_COLOR_DOMAIN = [0, 0];
var AGGREGATION_MODE = {
  SUM: 0,
  MEAN: 1
};
var defaultProps9 = {
  getPosition: { type: "accessor", value: (x) => x.position },
  getWeight: { type: "accessor", value: 1 },
  intensity: { type: "number", min: 0, value: 1 },
  radiusPixels: { type: "number", min: 1, max: 100, value: 50 },
  colorRange: defaultColorRange,
  threshold: { type: "number", min: 0, max: 1, value: 0.05 },
  colorDomain: { type: "array", value: null, optional: true },
  // 'SUM' or 'MEAN'
  aggregation: "SUM",
  weightsTextureSize: { type: "number", min: 128, max: 2048, value: 2048 },
  debounceTimeout: { type: "number", min: 0, max: 1e3, value: 500 }
};
var FLOAT_TARGET_FEATURES = [
  "float32-renderable-webgl",
  // ability to render to float texture
  "texture-blend-float-webgl"
  // ability to blend when rendering to float texture
];
var DIMENSIONS = {
  data: {
    props: ["radiusPixels"]
  }
};
var HeatmapLayer = class extends aggregation_layer_default2 {
  getShaders(shaders) {
    let modules = [project32_default];
    if (shaders.modules) {
      modules = [...modules, ...shaders.modules];
    }
    return super.getShaders({ ...shaders, modules });
  }
  initializeState() {
    super.initializeAggregationLayer(DIMENSIONS);
    this.setState({ colorDomain: DEFAULT_COLOR_DOMAIN });
    this._setupTextureParams();
    this._setupAttributes();
    this._setupResources();
  }
  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }
  /* eslint-disable max-statements,complexity */
  updateState(opts) {
    super.updateState(opts);
    this._updateHeatmapState(opts);
  }
  _updateHeatmapState(opts) {
    const { props, oldProps } = opts;
    const changeFlags = this._getChangeFlags(opts);
    if (changeFlags.dataChanged || changeFlags.viewportChanged) {
      changeFlags.boundsChanged = this._updateBounds(changeFlags.dataChanged);
      this._updateTextureRenderingBounds();
    }
    if (changeFlags.dataChanged || changeFlags.boundsChanged) {
      clearTimeout(this.state.updateTimer);
      this.setState({ isWeightMapDirty: true });
      if (changeFlags.dataChanged) {
        const weightsTransformShaders = this.getShaders({ vs: weights_vs_glsl_default, fs: weights_fs_glsl_default });
        this._createWeightsTransform(weightsTransformShaders);
      }
    } else if (changeFlags.viewportZoomChanged) {
      this._debouncedUpdateWeightmap();
    }
    if (props.colorRange !== oldProps.colorRange) {
      this._updateColorTexture(opts);
    }
    if (this.state.isWeightMapDirty) {
      this._updateWeightmap();
    }
    this.setState({ zoom: opts.context.viewport.zoom });
  }
  renderLayers() {
    const { weightsTexture, triPositionBuffer, triTexCoordBuffer, maxWeightsTexture, colorTexture, colorDomain } = this.state;
    const { updateTriggers, intensity, threshold: threshold2, aggregation } = this.props;
    const TriangleLayerClass = this.getSubLayerClass("triangle", triangle_layer_default);
    return new TriangleLayerClass(this.getSubLayerProps({
      id: "triangle-layer",
      updateTriggers
    }), {
      // position buffer is filled with world coordinates generated from viewport.unproject
      // i.e. LNGLAT if geospatial, CARTESIAN otherwise
      coordinateSystem: "default",
      data: {
        attributes: {
          positions: triPositionBuffer,
          texCoords: triTexCoordBuffer
        }
      },
      vertexCount: 4,
      maxTexture: maxWeightsTexture,
      colorTexture,
      aggregationMode: AGGREGATION_MODE[aggregation] || 0,
      weightsTexture,
      intensity,
      threshold: threshold2,
      colorDomain
    });
  }
  finalizeState(context) {
    super.finalizeState(context);
    const { weightsTransform, weightsTexture, maxWeightTransform, maxWeightsTexture, triPositionBuffer, triTexCoordBuffer, colorTexture, updateTimer } = this.state;
    weightsTransform == null ? void 0 : weightsTransform.destroy();
    weightsTexture == null ? void 0 : weightsTexture.destroy();
    maxWeightTransform == null ? void 0 : maxWeightTransform.destroy();
    maxWeightsTexture == null ? void 0 : maxWeightsTexture.destroy();
    triPositionBuffer == null ? void 0 : triPositionBuffer.destroy();
    triTexCoordBuffer == null ? void 0 : triTexCoordBuffer.destroy();
    colorTexture == null ? void 0 : colorTexture.destroy();
    if (updateTimer) {
      clearTimeout(updateTimer);
    }
  }
  // PRIVATE
  // override Composite layer private method to create AttributeManager instance
  _getAttributeManager() {
    return new AttributeManager(this.context.device, {
      id: this.props.id,
      stats: this.context.stats
    });
  }
  _getChangeFlags(opts) {
    const changeFlags = {};
    const { dimensions } = this.state;
    changeFlags.dataChanged = this.isAttributeChanged() && "attribute changed" || // if any attribute is changed
    this.isAggregationDirty(opts, {
      compareAll: true,
      dimension: dimensions.data
    }) && "aggregation is dirty";
    changeFlags.viewportChanged = opts.changeFlags.viewportChanged;
    const { zoom } = this.state;
    if (!opts.context.viewport || opts.context.viewport.zoom !== zoom) {
      changeFlags.viewportZoomChanged = true;
    }
    return changeFlags;
  }
  _createTextures() {
    const { textureSize, format } = this.state;
    this.setState({
      weightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: textureSize,
        height: textureSize,
        format
      }),
      maxWeightsTexture: this.context.device.createTexture({
        ...TEXTURE_PROPS,
        width: 1,
        height: 1,
        format
      })
    });
  }
  _setupAttributes() {
    const attributeManager = this.getAttributeManager();
    if (false) {
      attributeManager.addInstanced({
        instancePositions: {
          size: 3,
          type: "float64",
          accessor: "getPosition",
          // Normalize binary XY positions into the packed XYZ high/low layout WebGPU requires.
          transform: (position) => [position[0], position[1], position[2] ?? 0]
        },
        instanceWeights: { size: 1, accessor: "getWeight" }
      });
      this.setState({ positionAttributeName: "instancePositions" });
    } else {
      attributeManager.add({
        positions: { size: 3, type: "float64", accessor: "getPosition" },
        weights: { size: 1, accessor: "getWeight" }
      });
      this.setState({ positionAttributeName: "positions" });
    }
  }
  _setupTextureParams() {
    const { device } = this.context;
    const { weightsTextureSize } = this.props;
    const textureSize = Math.min(weightsTextureSize, device.limits.maxTextureDimension2D);
    const isWebGPU = false;
    const floatTargetSupport = isWebGPU ? device.getTextureFormatCapabilities("rgba16float").blend : FLOAT_TARGET_FEATURES.every((feature) => device.features.has(feature));
    const format = floatTargetSupport ? isWebGPU ? "rgba16float" : "rgba32float" : "rgba8unorm";
    const weightsScale = floatTargetSupport ? 1 : 1 / 255;
    this.setState({ textureSize, format, weightsScale });
    if (!floatTargetSupport) {
      log_default.warn(`HeatmapLayer: ${this.id} rendering to float texture not supported, falling back to low precision format`)();
    }
  }
  _createWeightsTransform(shaders) {
    let { weightsTransform } = this.state;
    const { weightsTexture } = this.state;
    const isWebGPU = false;
    const attributeManager = this.getAttributeManager();
    weightsTransform == null ? void 0 : weightsTransform.destroy();
    weightsTransform = new import_engine14.TextureTransform(this.context.device, {
      id: `${this.id}-weights-transform`,
      ...shaders,
      source: weights_wgsl_default,
      bufferLayout: attributeManager.getBufferLayouts({ isInstanced: isWebGPU }),
      vertexCount: isWebGPU ? 6 : 1,
      ...isWebGPU ? {
        colorAttachmentFormats: [weightsTexture.format],
        isInstanced: true,
        instanceCount: this.getNumInstances()
      } : {},
      targetTexture: weightsTexture,
      parameters: {
        depthWriteEnabled: false,
        blend: true,
        blendColorOperation: "add",
        blendColorSrcFactor: "one",
        blendColorDstFactor: "one",
        blendAlphaSrcFactor: "one",
        blendAlphaDstFactor: "one"
      },
      topology: isWebGPU ? "triangle-list" : "point-list",
      modules: [...shaders.modules, weightUniforms]
    });
    this.setState({ weightsTransform });
  }
  _setupResources() {
    this._createTextures();
    const { device } = this.context;
    const { textureSize, weightsTexture, maxWeightsTexture } = this.state;
    const weightsTransformShaders = this.getShaders({
      vs: weights_vs_glsl_default,
      fs: weights_fs_glsl_default
    });
    this._createWeightsTransform(weightsTransformShaders);
    const maxWeightsTransformShaders = this.getShaders({
      source: max_wgsl_default,
      vs: max_vs_glsl_default,
      fs: max_fs_glsl_default,
      modules: [maxWeightUniforms]
    });
    const maxWeightTransform = new import_engine14.TextureTransform(device, {
      id: `${this.id}-max-weights-transform`,
      targetTexture: maxWeightsTexture,
      ...maxWeightsTransformShaders,
      ...{},
      vertexCount: textureSize * textureSize,
      topology: "point-list",
      parameters: {
        depthWriteEnabled: false,
        blend: true,
        blendColorOperation: "max",
        blendAlphaOperation: "max",
        blendColorSrcFactor: "one",
        blendColorDstFactor: "one",
        blendAlphaSrcFactor: "one",
        blendAlphaDstFactor: "one"
      }
    });
    const maxWeightProps = { inTexture: weightsTexture, textureSize };
    maxWeightTransform.model.shaderInputs.setProps({
      maxWeight: maxWeightProps
    });
    this.setState({
      weightsTexture,
      maxWeightsTexture,
      maxWeightTransform,
      zoom: null,
      triPositionBuffer: device.createBuffer({ byteLength: 48 }),
      triTexCoordBuffer: device.createBuffer({ byteLength: 48 })
    });
  }
  // overwrite super class method to update transform model
  updateShaders(shaderOptions) {
    this._createWeightsTransform({
      vs: weights_vs_glsl_default,
      fs: weights_fs_glsl_default,
      ...shaderOptions
    });
  }
  _updateMaxWeightValue() {
    const { maxWeightTransform } = this.state;
    maxWeightTransform.run({
      parameters: { viewport: [0, 0, 1, 1] },
      clearColor: [0, 0, 0, 0]
    });
  }
  // Computes world bounds area that needs to be processed for generate heatmap
  _updateBounds(forceUpdate = false) {
    const { viewport } = this.context;
    const viewportCorners = [
      viewport.unproject([0, 0]),
      viewport.unproject([viewport.width, 0]),
      viewport.unproject([0, viewport.height]),
      viewport.unproject([viewport.width, viewport.height])
    ].map((p) => p.map(Math.fround));
    const visibleWorldBounds = getBounds2(viewportCorners);
    const newState = { visibleWorldBounds, viewportCorners };
    let boundsChanged = false;
    if (forceUpdate || !this.state.worldBounds || !boundsContain(this.state.worldBounds, visibleWorldBounds)) {
      const scaledCommonBounds = this._worldToCommonBounds(visibleWorldBounds);
      const worldBounds = this._commonToWorldBounds(scaledCommonBounds);
      if (this.props.coordinateSystem === "lnglat") {
        worldBounds[1] = Math.max(worldBounds[1], -85.051129);
        worldBounds[3] = Math.min(worldBounds[3], 85.051129);
        worldBounds[0] = Math.max(worldBounds[0], -360);
        worldBounds[2] = Math.min(worldBounds[2], 360);
      }
      const normalizedCommonBounds = this._worldToCommonBounds(worldBounds);
      newState.worldBounds = worldBounds;
      newState.normalizedCommonBounds = normalizedCommonBounds;
      boundsChanged = true;
    }
    this.setState(newState);
    return boundsChanged;
  }
  _updateTextureRenderingBounds() {
    const { triPositionBuffer, triTexCoordBuffer, normalizedCommonBounds, viewportCorners } = this.state;
    const { viewport } = this.context;
    triPositionBuffer.write(packVertices(viewportCorners, 3));
    const textureBounds = viewportCorners.map((p) => getTextureCoordinates(viewport.projectPosition(p), normalizedCommonBounds));
    triTexCoordBuffer.write(packVertices(textureBounds, 2));
  }
  _updateColorTexture(opts) {
    const { colorRange } = opts.props;
    let { colorTexture } = this.state;
    const colors = colorRangeToFlatArray(colorRange, false, Uint8Array);
    colorTexture == null ? void 0 : colorTexture.destroy();
    colorTexture = this.context.device.createTexture({
      ...TEXTURE_PROPS,
      data: colors,
      width: colorRange.length,
      height: 1
    });
    this.setState({ colorTexture });
  }
  _updateWeightmap() {
    const { radiusPixels, colorDomain, aggregation } = this.props;
    const { worldBounds, textureSize, weightsScale, weightsTexture } = this.state;
    const weightsTransform = this.state.weightsTransform;
    this.state.isWeightMapDirty = false;
    const commonBounds = this._worldToCommonBounds(worldBounds, {
      useLayerCoordinateSystem: true
    });
    if (colorDomain && aggregation === "SUM") {
      const { viewport: viewport2 } = this.context;
      const metersPerPixel = viewport2.distanceScales.metersPerUnit[2] * (commonBounds[2] - commonBounds[0]) / textureSize;
      this.state.colorDomain = [
        colorDomain[0] * metersPerPixel * weightsScale,
        colorDomain[1] * metersPerPixel * weightsScale
      ];
    } else {
      this.state.colorDomain = colorDomain || DEFAULT_COLOR_DOMAIN;
    }
    const attributeManager = this.getAttributeManager();
    const attributes = attributeManager.getAttributes();
    const moduleSettings = this.getModuleSettings();
    this._setModelAttributes(weightsTransform.model, attributes);
    if (false) {
      const instanceCount = this.getNumInstances();
      weightsTransform.model.setVertexCount(instanceCount > 0 ? 6 : 0);
      weightsTransform.model.setInstanceCount(instanceCount);
    } else {
      weightsTransform.model.setVertexCount(this.getNumInstances());
    }
    const weightProps = {
      radiusPixels,
      commonBounds,
      textureWidth: textureSize,
      weightsScale,
      weightsTexture
    };
    const { viewport, devicePixelRatio, coordinateSystem, coordinateOrigin } = moduleSettings;
    const { modelMatrix } = this.props;
    weightsTransform.model.shaderInputs.setProps({
      project: { viewport, devicePixelRatio, modelMatrix, coordinateSystem, coordinateOrigin },
      weight: weightProps
    });
    weightsTransform.run({
      parameters: { viewport: [0, 0, textureSize, textureSize] },
      clearColor: [0, 0, 0, 0]
    });
    this._updateMaxWeightValue();
  }
  _debouncedUpdateWeightmap(fromTimer = false) {
    let { updateTimer } = this.state;
    const { debounceTimeout } = this.props;
    if (fromTimer) {
      updateTimer = null;
      this._updateBounds(true);
      this._updateTextureRenderingBounds();
      this.setState({ isWeightMapDirty: true });
    } else {
      this.setState({ isWeightMapDirty: false });
      clearTimeout(updateTimer);
      updateTimer = setTimeout(this._debouncedUpdateWeightmap.bind(this, true), debounceTimeout);
    }
    this.setState({ updateTimer });
  }
  // input: worldBounds: [minLong, minLat, maxLong, maxLat]
  // input: opts.useLayerCoordinateSystem : layers coordiante system is used
  // optput: commonBounds: [minX, minY, maxX, maxY] scaled to fit the current texture
  _worldToCommonBounds(worldBounds, opts = {}) {
    const { useLayerCoordinateSystem = false } = opts;
    const [minLong, minLat, maxLong, maxLat] = worldBounds;
    const { viewport } = this.context;
    const { textureSize } = this.state;
    const { coordinateSystem } = this.props;
    const offsetMode = useLayerCoordinateSystem && (coordinateSystem === "lnglat-offsets" || coordinateSystem === "meter-offsets");
    const offsetOriginCommon = offsetMode ? viewport.projectPosition(this.props.coordinateOrigin) : [0, 0];
    const size = textureSize * RESOLUTION / viewport.scale;
    let bottomLeftCommon;
    let topRightCommon;
    if (useLayerCoordinateSystem && !offsetMode) {
      bottomLeftCommon = this.projectPosition([minLong, minLat, 0]);
      topRightCommon = this.projectPosition([maxLong, maxLat, 0]);
    } else {
      bottomLeftCommon = viewport.projectPosition([minLong, minLat, 0]);
      topRightCommon = viewport.projectPosition([maxLong, maxLat, 0]);
    }
    return scaleToAspectRatio([
      bottomLeftCommon[0] - offsetOriginCommon[0],
      bottomLeftCommon[1] - offsetOriginCommon[1],
      topRightCommon[0] - offsetOriginCommon[0],
      topRightCommon[1] - offsetOriginCommon[1]
    ], size, size);
  }
  // input commonBounds: [xMin, yMin, xMax, yMax]
  // output worldBounds: [minLong, minLat, maxLong, maxLat]
  _commonToWorldBounds(commonBounds) {
    const [xMin, yMin, xMax, yMax] = commonBounds;
    const { viewport } = this.context;
    const bottomLeftWorld = viewport.unprojectPosition([xMin, yMin]);
    const topRightWorld = viewport.unprojectPosition([xMax, yMax]);
    return bottomLeftWorld.slice(0, 2).concat(topRightWorld.slice(0, 2));
  }
};
HeatmapLayer.layerName = "HeatmapLayer";
HeatmapLayer.defaultProps = defaultProps9;
var heatmap_layer_default = HeatmapLayer;
//# sourceMappingURL=index.cjs.map
