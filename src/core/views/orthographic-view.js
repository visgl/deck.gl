import View from './view';
import Viewport from '../viewports/viewport';

import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_ortho from 'gl-mat4/ortho';

export default class OrthographicView extends View {
  _getViewport({x, y, width, height, viewState}) {
    const {
      // view matrix arguments
      eye = [0, 0, 1], // Defines eye position
      lookAt = [0, 0, 0], // Which point is camera looking at, default origin
      up = [0, 1, 0], // Defines up direction, default positive y axis

      // projection matrix arguments
      left, // Left bound of the frustum
      top // Top bound of the frustum
    } = viewState;

    let {
      // automatically calculated
      right = null, // Right bound of the frustum
      bottom = null // Bottom bound of the frustum
    } = viewState;

    const {
      near = 1, // Distance of near clipping plane
      far = 100 // Distance of far clipping plane
    } = this.props;

    right = Number.isFinite(right) ? right : left + width;
    bottom = Number.isFinite(bottom) ? bottom : top + height;
    return new Viewport({
      x,
      y,
      width,
      height,
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_ortho([], left, right, bottom, top, near, far)
    });
  }
}

OrthographicView.displayName = 'OrthographicView';
