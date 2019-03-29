import View from './view';
import Viewport from '../viewports/viewport';

import {Matrix4} from 'math.gl';
import OrbitController from '../controllers/orbit-controller';

const DEGREES_TO_RADIANS = Math.PI / 180;

export default class OrbitView extends View {
  get controller() {
    return this._getControllerProps({
      type: OrbitController
    });
  }

  /* eslint-disable complexity, max-statements */
  _getViewport({x, y, width, height, viewState}) {
    const {fovy, near, far} = this.props;
    const {zoom = 0} = viewState;

    return new Viewport({
      id: this.id,
      viewMatrix: this._getViewMatrix(viewState, height),
      fovy,
      near,
      far,
      x,
      y,
      width,
      height,
      zoom
    });
  }
  /* eslint-enable complexity, max-statements */

  _getViewMatrix(viewState, height) {
    const {
      fovy, // From eye position to lookAt
      orbitAxis = 'Z', // Orbit axis with 360 degrees rotating freedom, can only be 'Y' or 'Z'

      center = [0, 0, 0] // Which point is camera looking at, default origin
    } = this.props;
    const {
      rotationX = 0, // Rotating angle around X axis
      rotationOrbit = 0, // Rotating angle around orbit axis

      pixelOffset = [0, 0],
      zoom = 0
    } = viewState;

    // Distance from camera to center that projects common space 1 unit = 1 screen pixel
    const distance = 0.5 / Math.tan((fovy * DEGREES_TO_RADIANS) / 2);

    const viewMatrix = new Matrix4().lookAt({eye: [0, 0, distance]});

    const scale = Math.pow(2, zoom);
    const projectionScale = 1 / (height || 1);

    viewMatrix.rotateX(rotationX * DEGREES_TO_RADIANS);
    if (orbitAxis === 'Z') {
      viewMatrix.rotateZ(rotationOrbit * DEGREES_TO_RADIANS);
    } else {
      viewMatrix.rotateY(rotationOrbit * DEGREES_TO_RADIANS);
    }
    viewMatrix.scale([projectionScale, projectionScale, projectionScale]);
    viewMatrix.translate([-center[0] * scale, -center[1] * scale, -center[2] * scale]);

    return new Matrix4()
      .translate([-pixelOffset[0] * projectionScale, pixelOffset[1] * projectionScale, 0])
      .multiplyRight(viewMatrix);
  }
}

OrbitView.displayName = 'OrbitView';
