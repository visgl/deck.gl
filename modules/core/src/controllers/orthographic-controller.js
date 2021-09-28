import {clamp} from 'math.gl';
import Controller from './controller';
import {OrbitState} from './orbit-controller';

class OrthographicState extends OrbitState {
  constructor(props) {
    super(props);

    this.zoomAxis = props.zoomAxis || 'all';
  }

  _applyConstraints(props) {
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = Array.isArray(zoom)
      ? [clamp(zoom[0], minZoom, maxZoom), clamp(zoom[1], minZoom, maxZoom)]
      : clamp(zoom, minZoom, maxZoom);
    return props;
  }

  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this._viewportProps;
    if (!startZoom && startZoom !== 0) {
      startZoom = this._viewportProps.zoom;
    }
    let deltaZoom = Math.log2(scale);
    if (Array.isArray(startZoom)) {
      let [newZoomX, newZoomY] = startZoom;
      switch (this.zoomAxis) {
        case 'X':
          // Scale x only
          newZoomX = clamp(newZoomX + deltaZoom, minZoom, maxZoom);
          break;
        case 'Y':
          // Scale y only
          newZoomY = clamp(newZoomY + deltaZoom, minZoom, maxZoom);
          break;
        default:
          // Lock aspect ratio
          let z = Math.min(newZoomX + deltaZoom, newZoomY + deltaZoom);
          if (z < minZoom) {
            deltaZoom += minZoom - z;
          }
          z = Math.max(newZoomX + deltaZoom, newZoomY + deltaZoom);
          if (z > maxZoom) {
            deltaZoom += maxZoom - z;
          }
          newZoomX += deltaZoom;
          newZoomY += deltaZoom;
      }
      return [newZoomX, newZoomY];
    }
    // Ignore `zoomAxis`
    // `LinearTransitionInterpolator` does not support interpolation between a number and an array
    // So if zoom is a number (legacy use case), new zoom still has to be a number
    return clamp(startZoom + deltaZoom, minZoom, maxZoom);
  }
}

export default class OrthographicController extends Controller {
  constructor(props) {
    props.dragMode = props.dragMode || 'pan';
    super(OrthographicState, props);
  }

  _onPanRotate(event) {
    // No rotation in orthographic view
    return false;
  }

  get linearTransitionProps() {
    return ['target', 'zoom'];
  }
}
