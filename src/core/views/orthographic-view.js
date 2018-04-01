import View from './view';
import Viewport from '../viewports/viewport';

import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_ortho from 'gl-mat4/ortho';

function ORTHO_PROJECTION({left, right, bottom, top, near, far, width, height}) {
  right = Number.isFinite(right) ? right : left + width;
  bottom = Number.isFinite(bottom) ? bottom : top + height;

  return mat4_ortho([], left, right, bottom, top, near, far);
}

export default class OrthographicView extends View {
  constructor(props = {}) {
    super(
      Object.assign(
        {
          projection: props.projection || ORTHO_PROJECTION
        },
        props
      )
    );
  }

  _getViewport({x, y, width, height, viewState}) {
    const {
      // view matrix arguments
      eye = [0, 0, 1], // Defines eye position
      lookAt = [0, 0, 0], // Which point is camera looking at, default origin
      up = [0, 1, 0] // Defines up direction, default positive y axis
    } = viewState;

    return new Viewport({
      x,
      y,
      width,
      height,
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: this._getProjectionMatrix({width, height})
    });
  }
}

OrthographicView.displayName = 'OrthographicView';
