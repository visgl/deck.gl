import {clamp} from '@math.gl/core';
import Controller from './controller';
import {OrbitState, OrbitStateProps} from './orbit-controller';

class OrthographicState extends OrbitState {
  zoomAxis: 'X' | 'Y' | 'all';

  constructor(props) {
    super(props);

    this.zoomAxis = props.zoomAxis || 'all';
  }

  applyConstraints(props: Required<OrbitStateProps>): Required<OrbitStateProps> {
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = Array.isArray(zoom)
      ? [clamp(zoom[0], minZoom, maxZoom), clamp(zoom[1], minZoom, maxZoom)]
      : clamp(zoom, minZoom, maxZoom);
    return props;
  }

  _calculateNewZoom({scale, startZoom}) {
    const {maxZoom, minZoom} = this.getViewportProps();
    if (startZoom === undefined) {
      startZoom = this.getViewportProps().zoom;
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

export default class OrthographicController extends Controller<OrbitState> {
  constructor(props) {
    props.dragMode = props.dragMode || 'pan';
    super(OrthographicState, props);
  }

  _onPanRotate() {
    // No rotation in orthographic view
    return false;
  }

  get linearTransitionProps(): string[] | null {
    return ['target', 'zoom'];
  }
}
