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

import test from 'tape-promise/tape';
import {Deck} from '@deck.gl/core';
import {
  ScatterplotLayer,
  ColumnLayer,
  PolygonLayer,
  PathLayer,
  GeoJsonLayer
} from '@deck.gl/layers';
import {GridLayer} from '@deck.gl/aggregation-layers';

import {MaskExtension} from '@deck.gl/extensions';
import * as DATA from '../../../../examples/layer-browser/src/data-samples';
import type {DeckProps} from '@deck.gl/core';
import {equals} from '@math.gl/core';

const VIEW_STATE = {
  longitude: -122.42694203247012,
  latitude: 37.751537058389985,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

const DECK_PROPS: DeckProps = {
  width: 500,
  height: 550,
  viewState: VIEW_STATE,
  useDevicePixels: false,
  layerFilter: null
};

const GRID_LAYER_PICK_METHODS = {
  pickObject: [
    {
      parameters: {
        x: 60,
        y: 1
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
        cellCounts: [26]
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
        count: 16,
        cellCounts: [1, 3, 2, 9, 1, 3, 1, 1, 10, 2, 5, 1, 4, 1, 2, 1]
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
        y: 215,
        radius: 1
      },
      results: {
        count: 2,
        cellCounts: [34, 12]
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
    id: 'scatterplotLayer-binary',
    props: {
      layers: [
        new ScatterplotLayer({
          data: {
            length: DATA.points.length,
            attributes: {
              getPosition: {
                value: new Float64Array(DATA.points.flatMap(d => d.COORDINATES)),
                size: 2
              },
              getRadius: {value: new Float32Array(DATA.points.map(d => d.SPACES)), size: 1}
            }
          },
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
    id: 'scatterplotLayer-masked',
    props: {
      layers: [
        new ScatterplotLayer({
          id: 'mask',
          operation: 'mask',
          data: DATA.points.slice(0, 300),
          getPosition: d => d.COORDINATES,
          getRadius: d => d.SPACES,
          radiusScale: 5,
          radiusMinPixels: 1,
          radiusMaxPixels: 5
        }),
        new ScatterplotLayer({
          id: 'points',
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          getRadius: d => d.SPACES,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30,
          extensions: [new MaskExtension()],
          maskId: 'mask'
        })
      ]
    },
    pickingMethods: {
      pickObjects: [
        {
          parameters: {
            x: 300,
            y: 300,
            width: 100,
            height: 100
          },
          results: {
            count: 6
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
    id: 'geojsonLayer',
    props: {
      layers: [
        new GeoJsonLayer({
          data: DATA.geojson,
          getPointRadius: 100,
          getLineWidth: 20,
          getElevation: 500,
          lineWidthMinPixels: 1,
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
            count: 8
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
            count: 33
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
    id: 'multiLayers with filter',
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
      ],
      layerFilter: ({layer}) => layer.id === 'PathLayer'
    },
    pickingMethods: {
      pickMultipleObjects: [
        {
          parameters: {
            x: 260,
            y: 300
          },
          results: {
            count: 1
          }
        }
      ]
    }
  },
  {
    id: 'Gridlayer - cpu',
    props: {
      layers: [
        new GridLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          pickable: true,
          cellSize: 400,
          gpuAggregation: false,
          extruded: true
        })
      ]
    },
    pickingMethods: GRID_LAYER_PICK_METHODS
  },
  {
    id: 'Gridlayer - gpu',
    props: {
      layers: [
        new GridLayer({
          data: DATA.points,
          getPosition: d => d.COORDINATES,
          pickable: true,
          cellSize: 400,
          gpuAggregation: true,
          extruded: true,
          fp64: true
        })
      ]
    },
    pickingMethods: GRID_LAYER_PICK_METHODS
  }
];

test(`pickingTest`, async t => {
  const deck = new Deck(DECK_PROPS);

  for (const testCase of TEST_CASES) {
    await updateDeckProps(deck, testCase.props);
    const pickingMethods = testCase.pickingMethods;

    let pickInfos;
    for (const pickingMethod in pickingMethods) {
      for (const pickingCase of pickingMethods[pickingMethod]) {
        pickInfos = deck[pickingMethod](pickingCase.parameters);
        if (!Array.isArray(pickInfos)) {
          pickInfos = pickInfos ? [pickInfos] : [];
        }
        t.equal(
          pickInfos.length,
          pickingCase.results.count,
          `${testCase.id}: ${pickingMethod} should find expected number of objects`
        );

        if (pickInfos.length > 1) {
          t.equal(
            new Set(pickInfos.map(x => x.object ?? x.index)).size,
            pickInfos.length,
            'Returned distinct picked objects'
          );
        }

        if (pickingCase.results.cellCounts) {
          const cellCounts = pickInfos.map(x => x.object.count);
          t.deepEqual(
            cellCounts,
            pickingCase.results.cellCounts,
            'Aggregation count for individual cells should match'
          );
        }
      }
    }
  }
  deck.finalize();
  t.end();
});

test('pickingTest#unproject3D', async t => {
  const deck = new Deck(DECK_PROPS);

  await updateDeckProps(deck, {
    layers: [
      new ColumnLayer({
        data: [VIEW_STATE],
        getPosition: d => [d.longitude, d.latitude],
        radius: 100,
        extruded: true,
        getElevation: 1000,
        getFillColor: [255, 0, 0],
        pickable: true
      })
    ]
  });

  let pickInfo = deck.pickObject({x: 250, y: 275, unproject3D: true});
  t.is(pickInfo?.object, VIEW_STATE, 'object is picked');
  t.comment(`pickInfo.coordinate: ${pickInfo?.coordinate}`);
  t.ok(
    equals(pickInfo?.coordinate, [VIEW_STATE.longitude, VIEW_STATE.latitude, 1000], 0.0001),
    'unprojects to 3D coordinate'
  );

  deck.finalize();
  t.end();
});

function updateDeckProps(deck: Deck, props: DeckProps): Promise<void> {
  return new Promise(resolve => {
    deck.setProps({
      ...DECK_PROPS,
      ...props,
      onAfterRender: () => resolve()
    });
  });
}
