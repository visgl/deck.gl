import Viewport from './viewport';
import {mat4} from 'gl-matrix';

export default class OrthographicViewport extends Viewport {
  constructor({
    // viewport arguments
    width, // Width of viewport
    height, // Height of viewport
    // view matrix arguments
    eye, // Defines eye position
    lookAt = [0, 0, 0], // Which point is camera looking at, default origin
    up = [0, 1, 0], // Defines up direction, default positive y axis
    // projection matrix arguments
    near = 1, // Distance of near clipping plane
    far = 100, // Distance of far clipping plane
    fovy = 75, // Field of view covered by camera
    left, // Left bound of the frustum
    top, // Top bound of the frustum
    // automatically calculated
    right = null, // Right bound of the frustum
    bottom = null // Bottom bound of the frustum
  }) {
    right = Number.isFinite(right) ? right : left + width;
    bottom = Number.isFinite(bottom) ? right : top + height;
    super({
      viewMatrix: mat4.lookAt([], eye, lookAt, up),
      projectionMatrix: mat4.ortho([], left, right, bottom, top, near, far),
      width,
      height
    });
  }
}
