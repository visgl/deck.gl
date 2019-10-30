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
import {MapView, ScatterplotLayer, Deck, PolygonLayer, PathLayer, GridLayer} from 'deck.gl';
import * as DATA from '../../../../examples/layer-browser/src/data-samples';

const VIEW_STATE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

const DECK_PROPS = {
  width: 500,
  height: 550,
  views: [new MapView()],
  viewState: VIEW_STATE,
  useDevicePixels: false
};

const NEW_GRID_LAYER_PICK_METHODS = {
  pickObject: [
    {
      parameters: {
        x: 60,
        y: 160
      },
      results: {
        count: 0
      }
    },
    {
      parameters: {
        x: 300,
        y: 209
      },
      results: {
        count: 1,
        // point count in the aggregated cell for each pickInfo object
        cellCounts: [8]
      }
    }
  ],
  pickObjects: [
    {
      parameters: {
        x: 300,
        y: 300,
        width: 100,
        height: 100
      },
      results: {
        count: 23,
        cellCounts: [1, 3, 1, 2, 3, 1, 1, 1, 1, 2, 2, 5, 1, 2, 5, 1, 3, 4, 1, 2, 1, 1, 1]
      }
    },
    {
      parameters: {
        x: 50,
        y: 50,
        width: 10,
        height: 10
      },
      results: {
        count: 0
      }
    }
  ],
  pickMultipleObjects: [
    {
      parameters: {
        x: 86,
        y: 215
      },
      results: {
        count: 4,
        cellCounts: [4, 22, 3, 4]
      }
    },
    {
      parameters: {
        x: 90,
        y: 350
      },
      results: {
        count: 0
      }
    }
  ]
};

const TEST_CASES = [
  {
    id: 'scatterplotLayer',
    props: {
      layers: [
        new ScatterplotLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          getRadius: d => d.SPACES,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30
        })
      ]
    },
    pickingMethods: {
      pickObject: [
        {
          parameters: {
            x: 60,
            y: 160
          },
          results: {
            count: 1
          }
        },
        {
          parameters: {
            x: 90,
            y: 350
          },
          results: {
            count: 0
          }
        }
      ],
      pickObjects: [
        {
          parameters: {
            x: 300,
            y: 300,
            width: 100,
            height: 100
          },
          results: {
            count: 34
          }
        },
        {
          parameters: {
            x: 50,
            y: 50,
            width: 10,
            height: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickMultipleObjects: [
        {
          parameters: {
            x: 250,
            y: 273
          },
          results: {
            count: 2
          }
        },
        {
          parameters: {
            x: 300,
            y: 300
          },
          results: {
            count: 0
          }
        }
      ]
    }
  },
  {
    id: 'polygonLayer',
    props: {
      layers: [
        new PolygonLayer({
          data: DATA.polygons,
          getPolygon: f => f,
          pickable: true
        })
      ]
    },
    pickingMethods: {
      pickObject: [
        {
          parameters: {
            x: 60,
            y: 160
          },
          results: {
            count: 1
          }
        },
        {
          parameters: {
            x: 10,
            y: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickObjects: [
        {
          parameters: {
            x: 300,
            y: 300,
            width: 100,
            height: 100
          },
          results: {
            count: 3
          }
        },
        {
          parameters: {
            x: 10,
            y: 10,
            width: 10,
            height: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickMultipleObjects: [
        {
          parameters: {
            x: 250,
            y: 273
          },
          results: {
            count: 1
          }
        },
        {
          parameters: {
            x: 10,
            y: 10
          },
          results: {
            count: 0
          }
        }
      ]
    }
  },
  {
    id: 'pathLayer',
    props: {
      layers: [
        new PathLayer({
          data: DATA.zigzag,
          getPath: f => f.path,
          getWidth: 10,
          widthMinPixels: 1,
          pickable: true
        })
      ]
    },
    pickingMethods: {
      pickObject: [
        {
          parameters: {
            x: 260,
            y: 300
          },
          results: {
            count: 1
          }
        },
        {
          parameters: {
            x: 10,
            y: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickObjects: [
        {
          parameters: {
            x: 0,
            y: 0,
            width: 400,
            height: 400
          },
          results: {
            count: 3
          }
        },
        {
          parameters: {
            x: 10,
            y: 10,
            width: 10,
            height: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickMultipleObjects: [
        {
          parameters: {
            x: 260,
            y: 300
          },
          results: {
            count: 1
          }
        },
        {
          parameters: {
            x: 10,
            y: 10
          },
          results: {
            count: 0
          }
        }
      ]
    }
  },
  {
    id: 'multiLayers',
    props: {
      layers: [
        new ScatterplotLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          getRadius: d => d.SPACES,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30
        }),
        new PolygonLayer({
          data: DATA.polygons,
          getPolygon: f => f,
          pickable: true
        }),
        new PathLayer({
          data: DATA.zigzag,
          getPath: f => f.path,
          getWidth: 10,
          widthMinPixels: 1,
          pickable: true
        })
      ]
    },
    pickingMethods: {
      pickObject: [
        {
          parameters: {
            x: 260,
            y: 300
          },
          results: {
            count: 1
          }
        },
        {
          parameters: {
            x: 10,
            y: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickObjects: [
        {
          parameters: {
            x: 0,
            y: 0,
            width: 400,
            height: 400
          },
          results: {
            count: 32
          }
        },
        {
          parameters: {
            x: 10,
            y: 10,
            width: 10,
            height: 10
          },
          results: {
            count: 0
          }
        }
      ],
      pickMultipleObjects: [
        {
          parameters: {
            x: 260,
            y: 300
          },
          results: {
            count: 2
          }
        },
        {
          parameters: {
            x: 10,
            y: 10
          },
          results: {
            count: 0
          }
        }
      ]
    }
  },
  {
    id: 'newgridlayer - cpu',
    props: {
      layers: [
        new GridLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          pickable: true,
          cellSize: 200,
          gpuAggregation: false,
          extruded: true
        })
      ]
    },
    pickingMethods: NEW_GRID_LAYER_PICK_METHODS
  },
  {
    id: 'newgridlayer - gpu',
    props: {
      layers: [
        new GridLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          pickable: true,
          cellSize: 200,
          gpuAggregation: true,
          extruded: true,
          fp64: true
        })
      ]
    },
    pickingMethods: NEW_GRID_LAYER_PICK_METHODS
  }
];

test(`pickingTest`, t => {
  const deck = new Deck();
  t.ok(deck, 'Deck should be constructed');

  const len = TEST_CASES.length;
  let index = 0;
  let testCase;

  function runTests() {
    testCase = TEST_CASES[index++];
    const pickingMethods = testCase.pickingMethods;

    let pickInfos;
    for (const pickingMethod in pickingMethods) {
      for (const pickingCase of pickingMethods[pickingMethod]) {
        pickInfos = deck[pickingMethod](pickingCase.parameters);
        t.equal(
          !pickInfos ? 0 : !Array.isArray(pickInfos) ? 1 : pickInfos.length,
          pickingCase.results.count,
          `${testCase.id}: ${pickingMethod} should find expected number of objects`
        );
        if (pickingCase.results.cellCounts) {
          const cellCounts = Array.isArray(pickInfos)
            ? pickInfos.map(x => x.object.count)
            : [pickInfos.object.count];
          t.deepEqual(
            cellCounts,
            pickingCase.results.cellCounts,
            'Aggregation count for individual cells should match'
          );
        }
      }
    }
    if (index === len) {
      deck.finalize();
      t.end();
    } else {
      deck.setProps(TEST_CASES[index].props);
    }
  }

  deck.setProps(Object.assign({}, DECK_PROPS, TEST_CASES[0].props, {onAfterRender: runTests}));
});
