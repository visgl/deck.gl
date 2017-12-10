import * as data from 'deck.gl/test/data';

import {PolygonTesselator} from 'deck.gl/core-layers/solid-polygon-layer/polygon-tesselator';
import {PolygonTesselatorExtruded}
  from 'deck.gl/core-layers/solid-polygon-layer/polygon-tesselator-extruded';

const polygons = data.choropleths.features.map(f => f.geometry.coordinates);

function testTesselator(tesselator) {
  return {
    indices: tesselator.indices(),
    positions: tesselator.positions(),
    normals: tesselator.normals(),
    colors: tesselator.colors(),
    pickingColors: tesselator.pickingColors()
  };
}

export default function tesselationBench(suite) {
  return suite

    .group('TESSELATOR')
    .add('polygonTesselator#flat', () => {
      const tesselator = new PolygonTesselator({polygons});
      testTesselator(tesselator);
    })
    .add('polygonTesselator#extruded', () => {
      const tesselator = new PolygonTesselatorExtruded({polygons,
        getHeight: () => 100});
      testTesselator(tesselator);
    })
    .add('polygonTesselator#wireframe', () => {
      const tesselator = new PolygonTesselatorExtruded({polygons,
        getHeight: () => 100, wireframe: true});
      testTesselator(tesselator);
    })

    .add('polygonTesselator#flat - fp64', () => {
      const tesselator = new PolygonTesselator({polygons, fp64: true});
      testTesselator(tesselator);
    })
    .add('polygonTesselator#extruded - fp64', () => {
      const tesselator = new PolygonTesselatorExtruded({polygons,
        getHeight: () => 100, fp64: true});
      testTesselator(tesselator);
    })
    .add('polygonTesselator#wireframe - fp64', () => {
      const tesselator = new PolygonTesselatorExtruded({polygons,
        getHeight: () => 100, wireframe: true, fp64: true});
      testTesselator(tesselator);
    })

    ;
}
