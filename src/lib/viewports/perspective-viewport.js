import Viewport from './viewport';
import {mat4} from 'gl-matrix';

const DEGREES_TO_RADIANS = Math.PI / 180;

export default class PerspectiveViewport extends Viewport {
  constructor({
    // viewport arguments
    width, // Width of viewport
    height, // Height of viewport
    // view matrix arguments
    eye, // Defines eye position
    lookAt = [0, 0, 0], // Which point is camera looking at, default origin
    up = [0, 1, 0], // Defines up direction, default positive y axis
    // projection matrix arguments
    fovy = 75, // Field of view covered by camera
    near = 1, // Distance of near clipping plane
    far = 100, // Distance of far clipping plane
    // automatically calculated
    aspect = null // Aspect ratio (set to viewport widht/height)
  }) {
    const fovyRadians = fovy * DEGREES_TO_RADIANS;
    aspect = Number.isFinite(aspect) ? aspect : width / height;
    super({
      viewMatrix: mat4.lookAt([], eye, lookAt, up),
      projectionMatrix: mat4.perspective([], fovyRadians, aspect, near, far),
      width,
      height
    });
  }
}
