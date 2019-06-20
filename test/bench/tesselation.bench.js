import * as data from 'deck.gl-test/data';

import PolygonTesselator from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';

const polygons = data.choropleths.features.map(f => f.geometry.coordinates);

export default function tesselationBench(suite) {
  return suite
    .group('TESSELATOR')
    .add('polygonTesselator.buildGeometry', () => {
      // eslint-disable-next-line
      new PolygonTesselator({
        data: polygons,
        getGeometry: d => d,
        positionFormat: 'XYZ'
      });
    })
    .add('polygonTesselator.buildGeometry - fp64', () => {
      // eslint-disable-next-line
      new PolygonTesselator({
        data: polygons,
        getGeometry: d => d,
        fp64: true,
        positionFormat: 'XYZ'
      });
    });
}
