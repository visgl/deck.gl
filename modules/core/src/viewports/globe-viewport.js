import {Matrix4} from 'math.gl';
import Viewport from './viewport';
import {PROJECTION_MODE} from '../lib/constants';

import * as vec3 from 'gl-matrix/vec3';
import * as vec4 from 'gl-matrix/vec4';

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;
const EARTH_RADIUS = 6370972;
const GLOBE_RADIUS = 256;

function getDistanceScales() {
  const unitsPerMeter = GLOBE_RADIUS / EARTH_RADIUS;
  const unitsPerDegree = (Math.PI / 180) * GLOBE_RADIUS;

  return {
    unitsPerMeter: [unitsPerMeter, unitsPerMeter, unitsPerMeter],
    unitsPerMeter2: [0, 0, 0],
    metersPerUnit: [1 / unitsPerMeter, 1 / unitsPerMeter, 1 / unitsPerMeter],
    unitsPerDegree: [unitsPerDegree, unitsPerDegree, unitsPerMeter],
    unitsPerDegree2: [0, 0, 0],
    degreesPerUnit: [1 / unitsPerDegree, 1 / unitsPerDegree, 1 / unitsPerMeter]
  };
}

export default class GlobeViewport extends Viewport {
  constructor(opts = {}) {
    const {
      latitude = 0,
      longitude = 0,
      zoom = 11,
      nearZMultiplier = 0.1,
      farZMultiplier = 1,
      resolution = 10
    } = opts;

    let {width, height, altitude = 1.5} = opts;

    width = width || 1;
    height = height || 1;
    altitude = Math.max(0.75, altitude);

    // Calculate view matrix
    const viewMatrix = new Matrix4().lookAt({eye: [0, -altitude, 0], up: [0, 0, 1]});
    const scale = Math.pow(2, zoom);
    viewMatrix.rotateX(latitude * DEGREES_TO_RADIANS);
    viewMatrix.rotateZ(-longitude * DEGREES_TO_RADIANS);
    viewMatrix.scale(scale / height);

    const halfFov = Math.atan(0.5 / altitude);
    const relativeScale = (GLOBE_RADIUS * 2 * scale) / height;

    const viewportOpts = Object.assign({}, opts, {
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix,
      longitude,
      latitude,
      zoom,

      // projection matrix parameters
      fovyRadians: halfFov * 2,
      aspect: width / height,
      focalDistance: altitude,
      near: nearZMultiplier,
      far: Math.min(2, 1 / relativeScale + 1) * altitude * farZMultiplier
    });

    super(viewportOpts);

    this.resolution = resolution;
    this.distanceScales = getDistanceScales();
  }

  get projectionMode() {
    return PROJECTION_MODE.GLOBE;
  }

  getDistanceScales() {
    return this.distanceScales;
  }

  unproject(xyz, {topLeft = true, targetZ} = {}) {
    const [x, y, z] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const {pixelUnprojectionMatrix} = this;

    let coord;
    if (Number.isFinite(z)) {
      // Has depth component
      coord = transformVector(pixelUnprojectionMatrix, [x, y2, z, 1]);
    } else {
      // since we don't know the correct projected z value for the point,
      // unproject two points to get a line and then find the point on that line that intersects with the sphere
      const coord0 = transformVector(pixelUnprojectionMatrix, [x, y2, -1, 1]);
      const coord1 = transformVector(pixelUnprojectionMatrix, [x, y2, 1, 1]);

      const lt = ((targetZ || 0) / EARTH_RADIUS + 1) * GLOBE_RADIUS;
      const lSqr = vec3.sqrLen(vec3.sub([], coord0, coord1));
      const l0Sqr = vec3.sqrLen(coord0);
      const l1Sqr = vec3.sqrLen(coord1);
      const sSqr = (4 * l0Sqr * l1Sqr - (lSqr - l0Sqr - l1Sqr) ** 2) / 16;
      const dSqr = (4 * sSqr) / lSqr;
      const r0 = Math.sqrt(l0Sqr - dSqr);
      const dr = Math.sqrt(Math.max(0, lt * lt - dSqr));
      const t = (r0 - dr) / Math.sqrt(lSqr);

      coord = vec3.lerp([], coord0, coord1, t);
    }
    const [X, Y, Z] = this.unprojectPosition(coord);

    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }

  projectPosition(xyz) {
    const [lng, lat, Z = 0] = xyz;
    const lambda = lng * DEGREES_TO_RADIANS;
    const phi = lat * DEGREES_TO_RADIANS;
    const cosPhi = Math.cos(phi);
    const D = (Z / EARTH_RADIUS + 1) * GLOBE_RADIUS;

    return [Math.sin(lambda) * cosPhi * D, -Math.cos(lambda) * cosPhi * D, Math.sin(phi) * D];
  }

  unprojectPosition(xyz) {
    const [x, y, z] = xyz;
    const D = vec3.len(xyz);
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

  getMapCenterByLngLatPosition({lngLat, pos}) {
    const fromPosition = this.unproject(pos);
    return [
      lngLat[0] - fromPosition[0] + this.longitude,
      lngLat[1] - fromPosition[1] + this.latitude
    ];
  }
}

function transformVector(matrix, vector) {
  const result = vec4.transformMat4([], vector, matrix);
  vec4.scale(result, result, 1 / result[3]);
  return result;
}
