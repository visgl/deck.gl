// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable dot-notation, max-statements, no-unused-vars */

import {test, expect, vi} from 'vitest';
import {Deck, OrthographicView, log} from '@deck.gl/core';
import {
  ScatterplotLayer,
  ColumnLayer,
  PolygonLayer,
  PathLayer,
  GeoJsonLayer,
  SolidPolygonLayer
} from '@deck.gl/layers';
import {GridLayer} from '@deck.gl/aggregation-layers';

import {MaskExtension} from '@deck.gl/extensions';
import * as DATA from '../../../../examples/layer-browser/src/data-samples';
import type {DeckProps} from '@deck.gl/core';
import {equals} from '@math.gl/core/matrix';

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
        x: 120,
        y: 120
      },
      results: {
        count: 1,
        // point count in the aggregated cell for each pickInfo object
        cellCounts: [7]
      }
    }
  ],
  pickObjects: [
    {
      parameters: {
        x: 300,
        y: 300,
        width: 50,
        height: 50
      },
      results: {
        count: 8,
        cellCounts: [1, 2, 11, 2, 1, 4, 4, 1]
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
        x: 350,
        y: 60,
        radius: 1
      },
      results: {
        count: 2,
        cellCounts: [43, 26]
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

test(`pickingTest`, async () => {
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
        let count = pickInfos.length;
        // @ts-expect-error
        if (deck.device.info.gpu === 'apple') {
          count = count === 32 ? 33 : pickInfos.length;
        }
        expect(
          count,
          `${testCase.id}: ${pickingMethod} should find expected number of objects`
        ).toBe(pickingCase.results.count);

        if (pickInfos.length > 1) {
          expect(
            new Set(pickInfos.map(x => x.object ?? x.index)).size,
            'Returned distinct picked objects'
          ).toBe(pickInfos.length);
        }

        if (pickingCase.results.cellCounts) {
          const cellCounts = pickInfos.map(x => x.object.count);
          expect(cellCounts, 'Aggregation count for individual cells should match').toEqual(
            pickingCase.results.cellCounts
          );
        }
      }
    }
  }
  deck.finalize();
});

test('pickingTest#unproject3D', async () => {
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
  expect(pickInfo?.object, 'object is picked').toBe(VIEW_STATE);
  console.log(`pickInfo.coordinate: ${pickInfo?.coordinate}`);
  expect(
    equals(pickInfo?.coordinate, [VIEW_STATE.longitude, VIEW_STATE.latitude, 1000], 0.0001),
    'unprojects to 3D coordinate'
  ).toBeTruthy();

  deck.finalize();
});

test('pickingTest#mask layers', async () => {
  // At zoom 0 with a 500x550 canvas, world [x, 0] draws at screen [250 + x, 275]
  const deck = new Deck({
    width: 500,
    height: 550,
    useDevicePixels: false,
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  const logError = vi.spyOn(log, 'error');
  const square = [
    [-150, -50],
    [-50, -50],
    [-50, 50],
    [-150, 50]
  ];
  // Each mask layer covers world x from -150 to -50 along the x axis
  const maskLayers = [
    new SolidPolygonLayer({
      id: 'polygon-mask',
      operation: 'mask',
      pickable: true,
      data: [square],
      getPolygon: d => d
    }),
    new ScatterplotLayer({
      id: 'scatterplot-mask',
      operation: 'mask',
      pickable: false,
      data: [[-100, 0]],
      getPosition: d => d,
      getRadius: 50
    })
  ];

  for (const maskLayer of maskLayers) {
    await new Promise<void>(resolve => {
      deck.setProps({
        onAfterRender: () => {
          // @ts-expect-error private member
          if (!deck.layerManager.needsUpdate()) {
            resolve();
          }
        },
        layers: [
          new ScatterplotLayer({
            id: 'under-mask',
            data: [[-70, 0]],
            getPosition: d => d,
            getRadius: 10,
            pickable: true
          }),
          maskLayer,
          new ScatterplotLayer({
            id: 'masked',
            data: [
              [-120, 0],
              [100, 0]
            ],
            getPosition: d => d,
            getRadius: 10,
            pickable: true,
            extensions: [new MaskExtension()],
            maskId: maskLayer.id,
            maskInverted: true
          })
        ]
      });
    });
    const name = maskLayer.id;

    expect(deck.pickObject({x: 155, y: 275}), `${name}: mask area picks nothing`).toBeNull();
    expect(
      deck.pickObject({x: 180, y: 275})?.layer?.id,
      `${name}: mask layer does not cover a pickable layer drawn before it`
    ).toBe('under-mask');
    expect(
      deck.pickObject({x: 350, y: 275})?.layer?.id,
      `${name}: object outside the mask is picked`
    ).toBe('masked');
    if (maskLayer instanceof SolidPolygonLayer) {
      // ScatterplotLayer bounds do not include the radius, so only the polygon mask covers [-120, 0]
      expect(
        deck.pickObject({x: 130, y: 275}),
        `${name}: object hidden by the mask is not picked`
      ).toBeNull();
    }
    expect(logError, `${name}: picking buffer decodes without errors`).not.toHaveBeenCalled();
  }

  logError.mockRestore();
  deck.finalize();
});

function updateDeckProps(deck: Deck, props: DeckProps): Promise<void> {
  return new Promise(resolve => {
    deck.setProps({
      ...DECK_PROPS,
      ...props,
      onAfterRender: () => {
        // @ts-expect-error private member
        if (!deck.layerManager.needsUpdate()) {
          resolve();
        }
      }
    });
  });
}
