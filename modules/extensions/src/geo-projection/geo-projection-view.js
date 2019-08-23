import {View, WebMercatorViewport} from '@deck.gl/core';
import MapController from './geo-controller';

const TILE_SIZE = 512;
const EARTH_CIRCOMFERENCE = 40075017;
const ZERO_VECTOR = [0, 0, 0];
const WORLD = {
  type: 'Polygon',
  coordinates: [[[-180, -85], [-180, 85], [180, 85], [180, -85], [-180, -85]]]
};

/*
 * @param projection - d3 projection
 */
function normalizeProjection(projection) {
  return projection
    .fitSize([1, 1], WORLD) // fit world in a 1x1 box
    .rotate([0, 0, 0]); // reset
}

function createViewportClass(projection) {
  normalizeProjection(projection);

  class CustomViewport extends WebMercatorViewport {
    static isValid(lngLatZ) {
      const p = projection(lngLatZ);
      return p.every(Number.isFinite);
    }

    constructor(opts) {
      projection.rotate([opts.bearing || 0, -opts.pitch || 0, 0]);
      super(Object.assign({}, opts, {pitch: 0, bearing: 0}));
    }

    getRawProjection() {
      return projection;
    }

    projectFlat(lngLatZ, scale = this.scale) {
      scale *= TILE_SIZE;
      const p = projection(lngLatZ);
      return [p[0] * scale, p[1] * scale];
    }

    unprojectFlat(xyz, scale = this.scale) {
      scale *= TILE_SIZE;
      const p = [xyz[0] / scale, xyz[1] / scale];
      return projection.invert(p);
    }

    getDistanceScales() {
      const scale = this.scale * TILE_SIZE;
      const commonUnitsPerWorldUnit = [scale, scale, scale / EARTH_CIRCOMFERENCE];
      const worldUnitsPerCommonUnit = [1 / scale, 1 / scale, EARTH_CIRCOMFERENCE / scale];
      return {
        pixelsPerMeter: commonUnitsPerWorldUnit,
        metersPerPixel: worldUnitsPerCommonUnit,
        pixelsPerDegree: commonUnitsPerWorldUnit,
        pixelsPerDegree2: ZERO_VECTOR
      };
    }
  }

  return CustomViewport;
}

export default class GeoProjectionView extends View {
  constructor(props) {
    const {projection} = props;
    super(
      Object.assign({}, props, {
        type: createViewportClass(projection)
      })
    );
  }

  get controller() {
    return this._getControllerProps({
      type: MapController
    });
  }
}
