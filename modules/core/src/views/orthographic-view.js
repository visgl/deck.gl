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
    const {zoom = 0} = viewState;

    return new Viewport({
      id: this.id,
      x,
      y,
      width,
      height,
      viewMatrix: this._getViewMatrix(viewState),
      projectionMatrix: this._getProjectionMatrix(width, height),
      zoom
    });
  }

  _getViewMatrix(viewState) {
    const {pixelOffset = [0, 0], zoom = 0} = viewState;
    const scale = Math.pow(2, zoom);

    const {
      center = [0, 0, 0] // Which point is camera looking at, default origin
    } = this.props;

    const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 1]});
    viewMatrix.translate([-center[0] * scale, -center[1] * scale, -center[2] * scale]);
    return new Matrix4().translate([-pixelOffset[0], -pixelOffset[1], 0]).multiplyRight(viewMatrix);
  }

  _getProjectionMatrix(width, height) {
    // Make sure Matrix4.ortho doesn't crash on 0 width/height
    width = width || 1;
    height = height || 1;

    // Get projection matrix parameters from the view itself
    // NOTE: automatically calculated from width and height if not provided
    const {
      near = 1, // Distance of near clipping plane
      far = 100 // Distance of far clipping plane
    } = this.props;

    return new Matrix4().ortho({
      left: -width / 2,
      right: width / 2,
      bottom: height / 2,
      top: -height / 2,
      near,
      far
    });
  }
}

OrthographicView.displayName = 'OrthographicView';
