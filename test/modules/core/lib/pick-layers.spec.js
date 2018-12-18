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

/* eslint-disable dot-notation, max-statements, no-unused-vars */

import test from 'tape-catch';
import {MapView, ScatterplotLayer, Deck, PolygonLayer, PathLayer} from 'deck.gl';
import * as DATA from '../../../../examples/layer-browser/src/data-samples';

const VIEW_STATE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

const TEST_CASES = [
  {
    id: 'scatterplotLayer',
    props: {
      width: 500,
      height: 550,
      layers: [
        new ScatterplotLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          getColor: [255, 128, 0],
          getRadius: d => d.SPACES,
          opacity: 0.3,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30
        })
      ],
      views: [new MapView()],
      viewState: VIEW_STATE,
      useDevicePixels: false
    },
    pickingMethods: {
      singlePixel: [
        {
          funcName: 'pickObject',
          positions: {
            x: 60,
            y: 160
          },
          count: 1
        },
        {
          funcName: 'pickObject',
          positions: {
            x: 90,
            y: 350
          },
          count: 0
        }
      ],
      rectangle: [
        {
          funcName: 'pickObjects',
          positions: {
            x: 300,
            y: 300,
            width: 100,
            height: 100
          },
          count: 33
        },
        {
          funcName: 'pickObjects',
          positions: {
            x: 50,
            y: 50,
            width: 10,
            height: 10
          },
          count: 0
        }
      ],
      multiDepth: [
        {
          funcName: 'pickMultipleObjects',
          positions: {
            x: 250,
            y: 273
          },
          count: 2
        },
        {
          funcName: 'pickMultipleObjects',
          positions: {
            x: 300,
            y: 300
          },
          count: 0
        }
      ]
    }
  },
  {
    id: 'polygonLayer',
    props: {
      width: 500,
      height: 550,
      layers: [
        new PolygonLayer({
          data: DATA.polygons,
          getPolygon: f => f,
          getFillColor: () => [255 * Math.random(), 0, 0],
          getLineColor: [0, 0, 0, 255],
          getLineDashArray: [20, 0],
          getWidth: 20,
          getElevation: () => Math.random() * 1000,
          opacity: 0.3,
          pickable: true,
          lineDashJustified: true,
          elevationScale: 0.6
        })
      ],
      views: [new MapView()],
      viewState: VIEW_STATE,
      useDevicePixels: false
    },
    pickingMethods: {
      singlePixel: [
        {
          funcName: 'pickObject',
          positions: {
            x: 60,
            y: 160
          },
          count: 1
        },
        {
          funcName: 'pickObject',
          positions: {
            x: 10,
            y: 10
          },
          count: 0
        }
      ],
      rectangle: [
        {
          funcName: 'pickObjects',
          positions: {
            x: 300,
            y: 300,
            width: 100,
            height: 100
          },
          count: 3
        },
        {
          funcName: 'pickObjects',
          positions: {
            x: 10,
            y: 10,
            width: 10,
            height: 10
          },
          count: 0
        }
      ],
      multiDepth: [
        {
          funcName: 'pickMultipleObjects',
          positions: {
            x: 250,
            y: 273
          },
          count: 1
        },
        {
          funcName: 'pickMultipleObjects',
          positions: {
            x: 10,
            y: 10
          },
          count: 0
        }
      ]
    }
  },
  {
    id: 'pathLayer',
    props: {
      width: 500,
      height: 550,
      layers: [
        new PathLayer({
          data: DATA.zigzag,
          opacity: 0.6,
          getPath: f => f.path,
          getColor: [128, 0, 0],
          getWidth: 10,
          getDashArray: [20, 0],
          widthMinPixels: 1,
          pickable: true
        })
      ],
      views: [new MapView()],
      viewState: VIEW_STATE,
      useDevicePixels: false
    },
    pickingMethods: {
      singlePixel: [
        {
          funcName: 'pickObject',
          positions: {
            x: 260,
            y: 300
          },
          count: 1
        },
        {
          funcName: 'pickObject',
          positions: {
            x: 10,
            y: 10
          },
          count: 0
        }
      ],
      rectangle: [
        {
          funcName: 'pickObjects',
          positions: {
            x: 0,
            y: 0,
            width: 400,
            height: 400
          },
          count: 3
        },
        {
          funcName: 'pickObjects',
          positions: {
            x: 10,
            y: 10,
            width: 10,
            height: 10
          },
          count: 0
        }
      ],
      multiDepth: [
        // {
        //   funcName: 'pickMultipleObjects',
        //   positions: {
        //     x: 260,
        //     y: 300
        //   },
        //   count: 1
        // },
        {
          funcName: 'pickMultipleObjects',
          positions: {
            x: 10,
            y: 10
          },
          count: 0
        }
      ]
    }
  },
  {
    id: 'multiLayers',
    props: {
      width: 500,
      height: 550,
      layers: [
        new ScatterplotLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          getColor: [255, 128, 0],
          getRadius: d => d.SPACES,
          opacity: 0.1,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30
        }),
        new PolygonLayer({
          data: DATA.polygons,
          getPolygon: f => f,
          getFillColor: () => [255 * Math.random(), 0, 0],
          getLineColor: [0, 0, 0, 255],
          getLineDashArray: [20, 0],
          getWidth: 20,
          getElevation: () => Math.random() * 1000,
          opacity: 0.1,
          pickable: true,
          lineDashJustified: true,
          elevationScale: 0.6
        }),
        new PathLayer({
          data: DATA.zigzag,
          opacity: 0.6,
          getPath: f => f.path,
          getColor: [128, 0, 0],
          getWidth: 10,
          getDashArray: [20, 0],
          widthMinPixels: 1,
          pickable: true
        })
      ],
      views: [new MapView()],
      viewState: VIEW_STATE,
      useDevicePixels: false
    },
    pickingMethods: {
      singlePixel: [
        {
          funcName: 'pickObject',
          positions: {
            x: 260,
            y: 300
          },
          count: 1
        },
        {
          funcName: 'pickObject',
          positions: {
            x: 10,
            y: 10
          },
          count: 0
        }
      ],
      rectangle: [
        {
          funcName: 'pickObjects',
          positions: {
            x: 0,
            y: 0,
            width: 400,
            height: 400
          },
          count: 32
        },
        {
          funcName: 'pickObjects',
          positions: {
            x: 10,
            y: 10,
            width: 10,
            height: 10
          },
          count: 0
        }
      ],
      multiDepth: [
        // {
        //   funcName: 'pickMultipleObjects',
        //   positions: {
        //     x: 260,
        //     y: 300
        //   },
        //   count: 1
        // },
        {
          funcName: 'pickMultipleObjects',
          positions: {
            x: 10,
            y: 10
          },
          count: 0
        }
      ]
    }
  }
];

for (const testCase of TEST_CASES) {
  // eslint-disable-next-line no-loop-func
  test(`picking#${testCase.id}`, t => {
    const deck = new Deck();

    t.ok(deck, 'Deck should be constructed');

    deck.setProps(Object.assign({}, testCase.props, {onAfterRender: runTests}));

    function runTests() {
      const pickingMethods = testCase.pickingMethods;

      let pickInfos;
      for (const i in pickingMethods) {
        for (const j in pickingMethods[i]) {
          const pickingMethod = pickingMethods[i][j];
          const pickingFunc = pickingMethod.funcName;
          const pickingPos = pickingMethod.positions;
          pickInfos = deck[pickingFunc](pickingPos);
          t.equal(
            !pickInfos ? 0 : !Array.isArray(pickInfos) ? 1 : pickInfos.length,
            pickingMethod.count,
            `${pickingFunc} should find expected number of objects`
          );
        }
      }
      deck.animationLoop.stop();
      t.end();
    }
  });
}
