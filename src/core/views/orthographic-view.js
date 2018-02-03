import View from './view';

import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_ortho from 'gl-mat4/ortho';

export default class OrthographicView extends View {
  constructor({
    // view matrix arguments
    eye, // Defines eye position
    lookAt = [0, 0, 0], // Which point is camera looking at, default origin
    up = [0, 1, 0] // Defines up direction, default positive y axis
  }) {
    super({
      viewMatrix: mat4_lookAt([], eye, lookAt, up)
    });
  }

  getMatrix({
    // viewport arguments
    width, // Width of viewport
    height, // Height of viewport
    // view matrix arguments
    eye = [0, 0, 1], // Defines eye position, default unit distance along z axis
    lookAt = [0, 0, 0], // Which point is camera looking at, default origin
    up = [0, 1, 0], // Defines up direction, default positive y axis
    // projection matrix arguments
    near = 1, // Distance of near clipping plane
    far = 100, // Distance of far clipping plane
    left, // Left bound of the frustum
    top, // Top bound of the frustum
    // automatically calculated
    right = null, // Right bound of the frustum
    bottom = null // Bottom bound of the frustum
  }) {
    right = Number.isFinite(right) ? right : left + width;
    bottom = Number.isFinite(bottom) ? bottom : top + height;
    return {
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_ortho([], left, right, bottom, top, near, far)
    };
  }
}
