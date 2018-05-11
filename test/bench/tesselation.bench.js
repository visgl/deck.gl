import * as data from 'deck.gl/test/data';

import {PolygonTesselator} from '@deck.gl/core-layers/solid-polygon-layer/polygon-tesselator';

const polygons = data.choropleths.features.map(f => f.geometry.coordinates);

export default function tesselationBench(suite) {
  return suite
    .group('TESSELATOR')
    .add('polygonTesselator.updatePositions#flat', () => {
      const tesselator = new PolygonTesselator({polygons});
      tesselator.updatePositions({});
    })
    .add('polygonTesselator.updatePositions#extruded', () => {
      const tesselator = new PolygonTesselator({polygons});
      tesselator.updatePositions({extruded: true});
    })
    .add('polygonTesselator.updatePositions#flat - fp64', () => {
      const tesselator = new PolygonTesselator({polygons});
      tesselator.updatePositions({fp64: true});
    })
    .add('polygonTesselator.updatePositions#extruded - fp64', () => {
      const tesselator = new PolygonTesselator({polygons});
      tesselator.updatePositions({extruded: true, fp64: true});
    });
}
