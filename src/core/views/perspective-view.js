import View from './view';

import mat4_lookAt from 'gl-mat4/lookAt';

export default class PerspectiveView extends View {
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
}
