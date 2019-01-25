import View from './view';
import Viewport from '../viewports/viewport';

import {Matrix4} from 'math.gl';
import OrthographicController from '../controllers/orthographic-controller';

export default class OrthographicView extends View {
  get controller() {
    return this._getControllerProps({
      type: OrthographicController
    });
  }

  _getViewport({x, y, width, height, viewState}) {
    // Get view matrix parameters from view state
    const {offset = [0, 0], zoom = 0} = viewState;

    // Make sure Matrix4.ortho doesn't crash on 0 width/height
    width = width || 1;
    height = height || 1;

    const scale = Math.pow(2, zoom);

    // Get projection matrix parameters from the view itself
    // NOTE: automatically calculated from width and height if not provided
    const {
      // view matrix arguments
      eye = [0, 0, 1], // Defines eye position
      lookAt = [0, 0, 0], // Which point is camera looking at, default origin
      up = [0, 1, 0], // Defines up direction, default positive y axis,

      // projection matrix arguments
      left = (-width / 2 + offset[0]) / scale, // Left bound of the frustum
      top = (-height / 2 + offset[1]) / scale, // Top bound of the frustum
      right = (width / 2 + offset[0]) / scale, // Right bound of the frustum
      bottom = (height / 2 + offset[1]) / scale, // Bottom bound of the frustum

      near = 1, // Distance of near clipping plane
      far = 100 // Distance of far clipping plane
    } = this.props;

    return new Viewport({
      id: this.id,
      x,
      y,
      width,
      height,
      viewMatrix: new Matrix4().lookAt({eye, lookAt, up}),
      projectionMatrix: new Matrix4().ortho({left, right, bottom, top, near, far}),
      zoom
    });
  }
}

OrthographicView.displayName = 'OrthographicView';
