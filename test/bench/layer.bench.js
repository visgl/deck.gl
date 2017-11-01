// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl/test/data';

import {
  ScatterplotLayer,
  PolygonLayer,
  PathLayer,
  GeoJsonLayer,
  WebMercatorViewport
} from 'deck.gl';

import {COORDINATE_SYSTEM} from 'deck.gl/core/lib/constants';
import {getUniformsFromViewport} from 'deck.gl/core/shaderlib/project/viewport-uniforms';

import {testInitializeLayer} from 'deck.gl/test/test-utils';

import SolidPolygonLayer from 'deck.gl/core-layers/solid-polygon-layer/solid-polygon-layer';
import {PolygonTesselator} from 'deck.gl/core-layers/solid-polygon-layer/polygon-tesselator';
import {PolygonTesselatorExtruded}
  from 'deck.gl/core-layers/solid-polygon-layer/polygon-tesselator-extruded';

const VIEWPORT_PARAMS = {
  width: 500, height: 500,
  longitude: -122, latitude: 37, zoom: 12, pitch: 30
};

let testIdx = 0;
const testLayer = new ScatterplotLayer({data: data.points});

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

// add tests

export default function layerBench(suite) {
  return suite
    .group('UTILS')
    .add('encoding picking color', () => {
      testIdx++;
      if ((testIdx + 1) >> 24) {
        testIdx = 0;
      }
      testLayer.encodePickingColor(testIdx);
    })

    .group('VIEWPORTS')
    .add('getUniformsFromViewport#LNGLAT', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT
      });
    })
    .add('getUniformsFromViewport#METER_OFFSETS', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
      });
    })
    .add('WebMercatorViewport', () => {
      return new WebMercatorViewport(VIEWPORT_PARAMS);
    })

    .group('TESSELATOR')
    .add('polygonTesselator#flat', () => {
      const tesselator = new PolygonTesselator({polygons});
      testTesselator(tesselator);
    })
    .add('polygonTesselator#extruded', () => {
      const tesselator = new PolygonTesselatorExtruded({polygons});
      testTesselator(tesselator);
    })
    .add('polygonTesselator#wireframe', () => {
      const tesselator = new PolygonTesselatorExtruded({polygons, wireframe: true});
      testTesselator(tesselator);
    })

    .group('LAYER CONSTRUCTION')
    .add('ScatterplotLayer#construct', () => {
      return new ScatterplotLayer({data: data.points});
    })
    .add('GeoJsonLayer#construct', () => {
      return new GeoJsonLayer({data: data.choropleths});
    })
    .add('PolygonLayer#construct', () => {
      return new PolygonLayer({data: data.choropleths.features});
    })
    .add('SolidPolygonLayer#construct', () => {
      return new PolygonLayer({data: data.choropleths.features});
    })

    .group('PRIMITIVE LAYER INITIALIZATION')
    .add('ScatterplotLayer#initialize', () => {
      const layer = new ScatterplotLayer({data: data.points, getPosition: d => d.COORDINATES});
      testInitializeLayer({layer});
    })
    .add('PathLayer#initialize', () => {
      const layer = new PathLayer({data: data.lines});
      testInitializeLayer({layer});
    })
    .add('SolidPolygonLayer#initialize (flat)', () => {
      const layer = new SolidPolygonLayer({data: data.choropleths.features});
      testInitializeLayer({layer});
    })
    .add('SolidPolygonLayer#initialize (extruded)', () => {
      const layer = new SolidPolygonLayer({data: data.choropleths.features,
        extruded: true
      });
      testInitializeLayer({layer});
    })
    .add('SolidPolygonLayer#initialize (wireframe)', () => {
      const layer = new SolidPolygonLayer({data: data.choropleths.features,
        extruded: true, wireframe: true
      });
      testInitializeLayer({layer});
    })

    .group('COMPOSITE LAYER INITIALIZATION (DOES NOT INCLUDE SUBLAYERS!)')
    .add('GeoJsonLayer#initialize', () => {
      const layer = new GeoJsonLayer({data: data.choropleths});
      testInitializeLayer({layer});
    })
    .add('PolygonLayer#initialize (flat)', () => {
      const layer = new PolygonLayer({data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates
      });
      testInitializeLayer({layer});
    })
    .add('PolygonLayer#initialize (extruded)', () => {
      const layer = new PolygonLayer({data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates,
        extruded: true
      });
      testInitializeLayer({layer});
    })
    .add('PolygonLayer#initialize (wireframe)', () => {
      const layer = new PolygonLayer({data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates,
        extruded: true, wireframe: true
      });
      testInitializeLayer({layer});
    });
}
