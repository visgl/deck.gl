import {Viewport} from 'deck.gl';

import mat4_multiply from 'gl-mat4/multiply';
import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_scale from 'gl-mat4/scale';
import mat4_perspective from 'gl-mat4/perspective';
import mat4_translate from 'gl-mat4/translate';
import vec3_add from 'gl-vec3/add';
import vec3_rotateX from 'gl-vec3/rotateX';
import vec3_rotateY from 'gl-vec3/rotateY';

const DEGREES_TO_RADIANS = Math.PI / 180;

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/*
 * A deck.gl Viewport class used by OrbitController
 * Adds zoom and pixel translation on top of the PerspectiveViewport
 */
export default class OrbitViewport extends Viewport {
  constructor({
    // viewport arguments
    width, // Width of viewport
    height, // Height of viewport
    // view matrix arguments
    distance, // From eye position to lookAt
    rotationX = 0,
    rotationY = 0,
    lookAt = [0, 0, 0], // Which point is camera looking at, default origin
    up = [0, 1, 0], // Defines up direction, default positive y axis
    // projection matrix arguments
    fov = 75, // Field of view covered by camera
    near = 1, // Distance of near clipping plane
    far = 100, // Distance of far clipping plane

    // after projection
    translationX = 0, // in pixels
    translationY = 0, // in pixels
    zoom = 1
  }) {
    const eye = vec3_add([], lookAt, [0, 0, distance]);
    vec3_rotateX(eye, eye, lookAt, rotationX / 180 * Math.PI);
    vec3_rotateY(eye, eye, lookAt, rotationY / 180 * Math.PI);

    const fovyRadians = fov * DEGREES_TO_RADIANS;
    const aspect = width / height;
    const perspectiveMatrix = mat4_perspective([], fovyRadians, aspect, near, far);
    const transformMatrix = createMat4();
    mat4_translate(transformMatrix, transformMatrix,
      [translationX / width * 2, translationY / height * 2, 0]);
    mat4_scale(transformMatrix, transformMatrix, [zoom, zoom, 1]);

    super({
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_multiply(transformMatrix, transformMatrix, perspectiveMatrix),
      width,
      height
    });

    this.width = width;
    this.height = height;
    this.distance = distance;
    this.rotationX = rotationX;
    this.rotationY = rotationY;
    this.lookAt = lookAt;
    this.up = up;
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.translationX = translationX;
    this.translationY = translationY;
    this.zoom = zoom;
  }

  project(xyz, {topLeft = false} = {}) {
    const v = this.transformVector(this.pixelProjectionMatrix, [...xyz, 1]);

    const [x, y, z] = v;
    const y2 = topLeft ? this.height - y : y;
    return [x, y2, z];
  }

  unproject(xyz, {topLeft = false} = {}) {
    const [x, y, z] = xyz;
    const y2 = topLeft ? this.height - y : y;

    return this.transformVector(this.pixelUnprojectionMatrix, [x, y2, z, 1]);
  }

  /** Move camera to get a bounding box fit in the viewport.
   * @param {Array} bounds - [[minX, minY, minZ], [maxX, maxY, maxZ]]
   * @returns a new OrbitViewport object
   */
  fitBounds([min, max]) {
    const {
      width,
      height,
      rotationX,
      rotationY,
      up,
      fov,
      near,
      far,
      translationX,
      translationY,
      zoom
    } = this;
    const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
    const newDistance = size / Math.tan(fov / 180 * Math.PI / 2);

    return new OrbitViewport({
      width,
      height,
      rotationX,
      rotationY,
      up,
      fov,
      near,
      far,
      translationX,
      translationY,
      zoom,
      lookAt: [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
      ],
      distance: newDistance
    });
  }
}
