import BaseLayer from './base-layer';
import flatWorld from '../flat-world';
import MercatorProjector from 'viewport-mercator-project';

export default class BaseMapLayer extends BaseLayer {
  /**
   * @classdesc
   * BaseMapLayer:
   * A map overlay that reacts to mapState: viewport, zoom level, etc.
   * The input data may include latitude & longitude coordinates, which
   * will be converted => screen coordinates using web-mercator projection
   *
   * @class
   * @param {object} opts
   * @param {string} opts.mapState - mapState from MapboxGL
   */
  constructor(opts) {
    super(opts);

    this.mapState = opts.mapState || this._throwUndefinedError('mapState');
    this.mercator = MercatorProjector({
      center: [opts.mapState.longitude, opts.mapState.latitude],
      zoom: opts.mapState.zoom,
      tileSize: 512,
      dimensions: [opts.width, opts.height]
    });
    this.cameraHeight = flatWorld.getCameraHeight();
  }

  project(latLng) {
    const pixel = this.mercator.project([latLng[1], latLng[0]]);
    return {
      x: pixel[0],
      y: pixel[1]
    };
  }

  screenToSpace(x, y) {
    return flatWorld.screenToSpace(x, y, this.width, this.height);
  }

}
