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
    const zoomX = Array.isArray(zoom) ? zoom[0] : zoom;
    const zoomY = Array.isArray(zoom) ? zoom[1] : zoom;
    const zoom_ = Math.min(zoomX, zoomY);
    const scale = Math.pow(2, zoom_);

    super({
      ...props,
      // in case viewState contains longitude/latitude values,
      // make sure that the base Viewport class does not treat this as a geospatial viewport
      longitude: null,
      position: target,
      viewMatrix: viewMatrix.clone().scale([scale, scale * (flipY ? -1 : 1), scale]),
      projectionMatrix: getProjectionMatrix({width, height, near, far}),
      zoom: zoom_
    });

    if (zoomX !== zoomY) {
      const scaleX = Math.pow(2, zoomX);
      const scaleY = Math.pow(2, zoomY);

      this.distanceScales = {
        unitsPerMeter: [scaleX / scale, scaleY / scale, 1],
        metersPerUnit: [scale / scaleX, scale / scaleY, 1]
      };
    }
  }

  projectFlat([X, Y]) {
    const {unitsPerMeter} = this.distanceScales;
    return [X * unitsPerMeter[0], Y * unitsPerMeter[1]];
  }

  unprojectFlat([x, y]) {
    const {metersPerUnit} = this.distanceScales;
    return [x * metersPerUnit[0], y * metersPerUnit[1]];
  }

  /* Needed by LinearInterpolator */
  panByPosition(coords, pixel) {
    const fromLocation = pixelsToWorld(pixel, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(coords);

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
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
