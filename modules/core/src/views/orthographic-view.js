import View from './view';
import Viewport from '../viewports/viewport';

import {Matrix4} from 'math.gl';
import {pixelsToWorld} from '@math.gl/web-mercator';
import * as vec2 from 'gl-matrix/vec2';
import OrthographicController from '../controllers/orthographic-controller';

const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 1]});

function getProjectionMatrix({width, height, near, far}) {
  // Make sure Matrix4.ortho doesn't crash on 0 width/height
  width = width || 1;
  height = height || 1;

  return new Matrix4().ortho({
    left: -width / 2,
    right: width / 2,
    bottom: -height / 2,
    top: height / 2,
    near,
    far
  });
}

class OrthographicViewport extends Viewport {
  constructor(props) {
    const {
      width,
      height,
      near = 0.1,
      far = 1000,
      zoom = 0,
      target = [0, 0, 0],
      flipY = true
    } = props;
    const scale = Math.pow(2, zoom);
    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: null,
      position: target,
      viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
      projectionMatrix: getProjectionMatrix({width, height, near, far}),
      zoom
    });
  }

  /* Needed by LinearInterpolator */
  panByPosition(coords, pixel) {
    const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);

    const translate = vec2.add([], coords, vec2.negate([], fromLocation));
    const newCenter = vec2.add([], this.center, translate);

    return {target: newCenter};
  }
}

export default class OrthographicView extends View {
  constructor(props) {
    super({
      ...props,
      type: OrthographicViewport
    });
  }

  get controller() {
    return this._getControllerProps({
      type: OrthographicController
    });
  }
}

OrthographicView.displayName = 'OrthographicView';
