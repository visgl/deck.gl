import View from './view';
import Viewport from '../viewports/viewport';

import {Matrix4} from 'math.gl';
import OrbitController from '../controllers/orbit-controller';

const DEGREES_TO_RADIANS = Math.PI / 180;

function getViewMatrix({height, fovy, orbitAxis, rotationX, rotationOrbit, zoom}) {
  // Distance from camera to target that projects common space 1 unit = 1 screen pixel
  const distance = 0.5 / Math.tan((fovy * DEGREES_TO_RADIANS) / 2);

  const viewMatrix = new Matrix4().lookAt({eye: [0, 0, distance]});

  const projectionScale = 1 / (height || 1);

  viewMatrix.rotateX(rotationX * DEGREES_TO_RADIANS);
  if (orbitAxis === 'Z') {
    viewMatrix.rotateZ(rotationOrbit * DEGREES_TO_RADIANS);
  } else {
    viewMatrix.rotateY(rotationOrbit * DEGREES_TO_RADIANS);
  }
  // Remove the distortion to the depth field
  viewMatrix.scale([projectionScale, projectionScale, projectionScale]);

  return viewMatrix;
}

class OrbitViewport extends Viewport {
  constructor(props) {
    const {
      id,
      x,
      y,
      width,
      height,

      fovy = 50, // From eye position to lookAt
      near,
      far,
      orbitAxis = 'Z', // Orbit axis with 360 degrees rotating freedom, can only be 'Y' or 'Z'
      target = [0, 0, 0], // Which point is camera looking at, default origin

      rotationX = 0, // Rotating angle around X axis
      rotationOrbit = 0, // Rotating angle around orbit axis

      zoom = 0
    } = props;

    super({
      id,
      viewMatrix: getViewMatrix({
        height,
        fovy,
        orbitAxis,
        rotationX,
        rotationOrbit,
        zoom
      }),
      fovy,
      near,
      far,
      x,
      y,
      position: target,
      width,
      height,
      zoom
    });
  }
}

export default class OrbitView extends View {
  get controller() {
    return this._getControllerProps({
      type: OrbitController,
      ViewportType: OrbitViewport
    });
  }

  _getViewport({x, y, width, height, viewState}) {
    return new OrbitViewport(
      Object.assign(
        {
          id: this.id,
          x,
          y,
          width,
          height
        },
        this.props,
        viewState
      )
    );
  }
}

OrbitView.displayName = 'OrbitView';
