import View from './view';
import Viewport from '../viewports/viewport';

import {Matrix4} from 'math.gl';
import {pixelsToWorld} from '@math.gl/web-mercator';
import OrbitController from '../controllers/orbit-controller';

const DEGREES_TO_RADIANS = Math.PI / 180;

function getViewMatrix({height, fovy, orbitAxis, rotationX, rotationOrbit, zoom}) {
  // We position the camera so that one common space unit (world space unit scaled by zoom)
  // at the target maps to one screen pixel.
  // This is a similar technique to that used in web mercator projection
  // By doing so we are able to convert between common space and screen space sizes efficiently
  // in the vertex shader.
  const distance = 0.5 / Math.tan((fovy * DEGREES_TO_RADIANS) / 2);
  const up = orbitAxis === 'Z' ? [0, 0, 1] : [0, 1, 0];
  const eye = orbitAxis === 'Z' ? [0, -distance, 0] : [0, 0, distance];

  const viewMatrix = new Matrix4().lookAt({eye, up});

  viewMatrix.rotateX(rotationX * DEGREES_TO_RADIANS);
  if (orbitAxis === 'Z') {
    viewMatrix.rotateZ(rotationOrbit * DEGREES_TO_RADIANS);
  } else {
    viewMatrix.rotateY(rotationOrbit * DEGREES_TO_RADIANS);
  }

  // When height increases, we need to increase the distance from the camera to the target to
  // keep the 1:1 mapping. However, this also changes the projected depth of each position by
  // moving them further away between the near/far plane.
  // Without modifying the default near/far planes, we instead scale down the common space to
  // remove the distortion to the depth field.
  const projectionScale = Math.pow(2, zoom) / (height || 1);
  viewMatrix.scale(projectionScale);

  return viewMatrix;
}

class OrbitViewport extends Viewport {
  constructor(props) {
    const {
      height,
      fovy, // For setting camera position
      orbitAxis, // Orbit axis with 360 degrees rotating freedom, can only be 'Y' or 'Z'
      target = [0, 0, 0], // Which point is camera looking at, default origin

      rotationX = 0, // Rotating angle around X axis
      rotationOrbit = 0, // Rotating angle around orbit axis

      zoom = 0
    } = props;

    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: null,
      viewMatrix: getViewMatrix({
        height,
        fovy,
        orbitAxis,
        rotationX,
        rotationOrbit,
        zoom
      }),
      fovy,
      position: target,
      zoom
    });

    this.projectedCenter = this.project(this.center);
  }

  unproject(xyz, {topLeft = true} = {}) {
    const [x, y, z = this.projectedCenter[2]] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const [X, Y, Z] = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix);
    return [X, Y, Z];
  }

  panByPosition(coords, pixel) {
    const p0 = this.project(coords);
    const nextCenter = [
      this.width / 2 + p0[0] - pixel[0],
      this.height / 2 + p0[1] - pixel[1],
      this.projectedCenter[2]
    ];
    return {
      target: this.unproject(nextCenter)
    };
  }
}

export default class OrbitView extends View {
  constructor(props = {}) {
    const {orbitAxis = 'Z'} = props;

    super({
      ...props,
      orbitAxis,
      type: OrbitViewport
    });
  }

  get controller() {
    return this._getControllerProps({
      type: OrbitController
    });
  }
}

OrbitView.displayName = 'OrbitView';
