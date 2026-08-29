// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  COORDINATE_SYSTEM,
  Deck,
  OrthographicView,
  OrthographicViewport,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {PathStyleExtension} from '@deck.gl/extensions';
import {
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';
import {device, getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';

import * as FIXTURES from 'deck.gl-test/data';

const webglTest = device.type === 'webgl' ? test : test.skip;

async function waitForRender(deck: Deck): Promise<void> {
  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: () => resolve()});
  });
}

webglTest('PathStyleExtension#rounded dash picking', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 100;
  const webglContext = canvas.getContext('webgl2');
  expect(webglContext, 'WebGL2 context is created').toBeTruthy();

  const deck = new Deck({
    gl: webglContext!,
    width: 200,
    height: 100,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    controller: false,
    layers: [
      new PathLayer({
        id: 'rounded-dash-picking',
        data: [
          [
            [-80, 0],
            [80, 0]
          ]
        ],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPath: path => path,
        widthUnits: 'pixels',
        getWidth: 20,
        getDashArray: [4, 4],
        capRounded: true,
        pickable: true,
        extensions: [new PathStyleExtension({dash: true})]
      })
    ]
  });

  try {
    await waitForRender(deck);
    expect(deck.pickObject({x: 40, y: 50})?.index, 'middle of a rounded dash is pickable').toBe(0);
    expect(deck.pickObject({x: 80, y: 50}), 'middle of a rounded gap is not pickable').toBeNull();
  } finally {
    deck.finalize();
    webglContext!.getExtension('WEBGL_lose_context')?.loseContext();
  }
});

test('PathStyleExtension#PathLayer', () => {
  const testCases = [
    {
      props: {
        id: 'path-extension-test',
        data: FIXTURES.zigzag,
        getPath: d => d.path,
        getDashArray: [0, 0],
        getOffset: 0,
        extensions: [new PathStyleExtension({highPrecisionDash: true, offset: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(0);
        const pathStyleModule = layer
          .getShaders()
          .modules.find(module => module.name === 'pathStyle')!;
        expect(pathStyleModule.uniformTypes, 'dash module retains its uniform block').toEqual({
          dashAlignMode: 'f32',
          dashGapPickable: 'i32'
        });
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toEqual([0, 0]);
        expect(attributes.instanceOffsets.value, 'instanceOffsets attribute is populated').toEqual([
          0
        ]);

        let dashOffsetValid = true;
        let i;
        for (i = 0; i < FIXTURES.zigzag[0].path.length - 2; i++) {
          dashOffsetValid =
            dashOffsetValid &&
            attributes.instanceDashOffsets.value[i] <= attributes.instanceDashOffsets.value[i + 1];
        }
        dashOffsetValid = dashOffsetValid && attributes.instanceDashOffsets.value[i + 1] === 0;

        expect(dashOffsetValid, 'instanceDashOffsets attribute is populated').toBeTruthy();
      }
    },
    {
      updateProps: {
        dashJustified: true,
        getDashArray: d => [3, 1],
        getOffset: d => 0.5,
        updateTriggers: {
          getDashArray: 1,
          getOffset: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(1);
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute is populated'
        ).toEqual([3, 1, 3, 1]);
        expect(
          attributes.instanceOffsets.value.slice(0, 4),
          'instanceOffsets attribute is populated'
        ).toEqual([0.5, 0.5, 0.5, 0.5]);
      }
    }
  ];

  testLayer({Layer: PathLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#offset-only shader module', () => {
  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'path-offset-only-test',
          data: FIXTURES.zigzag,
          getPath: d => d.path,
          getOffset: 1,
          extensions: [new PathStyleExtension({offset: true})]
        },
        onAfterUpdate: ({layer}) => {
          const pathStyleModule = layer
            .getShaders()
            .modules.find(module => module.name === 'pathStyle')!;
          expect(
            Object.hasOwn(pathStyleModule, 'uniformTypes'),
            'offset-only module does not declare an unused uniform block'
          ).toBe(false);
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
});

test('PathStyleExtension#PolygonLayer', () => {
  const testCases = [
    {
      props: {
        id: 'path-extension-test',
        data: FIXTURES.polygons,
        getPolygon: d => d,
        stroke: true,
        getDashArray: [0, 0],
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = getLayerUniforms(pathLayer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(0);
        expect(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toBeTruthy();
      }
    },
    {
      updateProps: {
        dashJustified: true,
        getDashArray: d => [3, 1]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = getLayerUniforms(pathLayer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(1);
        expect(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#ScatterplotLayer', () => {
  const testCases = [
    {
      props: {
        id: 'scatterplot-extension-test',
        data: FIXTURES.points.slice(0, 3),
        getPosition: d => d.COORDINATES,
        getRadius: 10,
        stroked: true,
        filled: true,
        getDashArray: d => [3, 2],
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'has dashGapPickable uniform').toBeFalsy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(attributes.instanceDashArrays, 'instanceDashArrays attribute exists').toBeTruthy();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute is populated'
        ).toEqual([3, 2, 3, 2]);
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [5, 1],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'dashGapPickable is true').toBeTruthy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute updated'
        ).toEqual([5, 1, 5, 1]);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#TextBackgroundLayer', () => {
  const TEXT_BG_DATA = [
    {position: [0, 0], bounds: [-50, -25, 100, 50], dashArray: [4, 2]},
    {position: [1, 1], bounds: [-30, -15, 60, 30], dashArray: [4, 2]}
  ];

  const testCases = [
    {
      props: {
        id: 'text-bg-extension-test',
        data: TEXT_BG_DATA,
        getPosition: d => d.position,
        getBoundingRect: d => d.bounds,
        getLineWidth: 2,
        getDashArray: d => d.dashArray,
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'has dashGapPickable uniform').toBeFalsy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(attributes.instanceDashArrays, 'instanceDashArrays attribute exists').toBeTruthy();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute is populated'
        ).toEqual([4, 2, 4, 2]);
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [2, 3],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'dashGapPickable is true').toBeTruthy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute updated'
        ).toEqual([2, 3, 2, 3]);
      }
    }
  ];

  testLayer({Layer: TextBackgroundLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#shader defines', () => {
  const testCases = [
    {
      props: {
        id: 'path-defines-test',
        data: FIXTURES.zigzag,
        getPath: d => d.path,
        extensions: [new PathStyleExtension({offset: true})]
      },
      onAfterUpdate: ({layer}) => {
        const shaders = layer.getShaders();
        expect(
          shaders.defines.DASH_ENABLED,
          'DASH_ENABLED is unset when only offset is enabled'
        ).toBeUndefined();
        const pathStyleModule = shaders.modules.find(module => module.name === 'pathStyle')!;
        expect(
          pathStyleModule.inject?.['fs:#main-start'],
          'offset does not reject fragments before PathLayer evaluates derivatives'
        ).toBeUndefined();
        expect(
          pathStyleModule.inject?.['fs:#main-end'],
          'non-AA offset retains a deferred hard clip'
        ).toContain('#ifndef ANTIALIASING');
      }
    },
    {
      updateProps: {
        extensions: [new PathStyleExtension({dash: true, offset: true})]
      },
      onAfterUpdate: ({layer}) => {
        const {defines} = layer.getShaders();
        // The offset shaders rescale vDashOffset, which only exists when the dash shaders
        // are injected too, so they are guarded on this define.
        expect(defines.DASH_ENABLED, 'DASH_ENABLED is set when dash is enabled').toBe(true);
        expect(
          defines.HIGH_PRECISION_DASH,
          'HIGH_PRECISION_DASH is off by default'
        ).toBeUndefined();
        const pathStyleModule = layer
          .getShaders()
          .modules.find(module => module.name === 'pathStyle')!;
        const fragmentStart = pathStyleModule.inject?.['fs:#main-start'];
        expect(fragmentStart, 'rounded caps use a signed pixel-distance ramp').toContain(
          'smoothedge(0.0, capEdgePixels)'
        );
        expect(fragmentStart, 'coverage is bounded before deferred rejection').toContain(
          'dashCoverage = clamp(dashCoverage, 0.0, 1.0)'
        );
        expect(fragmentStart, 'sub-pixel rounded dashes preserve capsule area').toContain(
          'boundedSolidLength + min(effectiveGap, capSpan)'
        );
      }
    },
    {
      updateProps: {
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const {defines} = layer.getShaders();
        expect(defines.DASH_ENABLED, 'highPrecisionDash implies dash').toBe(true);
        expect(defines.HIGH_PRECISION_DASH, 'HIGH_PRECISION_DASH is set').toBe(true);
      }
    }
  ];

  testLayer({Layer: PathLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#getDashOffsets measures 3D distance', () => {
  const extension = new PathStyleExtension({highPrecisionDash: true});
  // The shader now scales its along-segment coordinate by the same 3D-to-2D arclength ratio,
  // so these CPU offsets and the GPU coordinate agree on paths that move in Z.
  const layer = {
    props: {positionFormat: 'XYZ'},
    projectPosition: (p, params) => {
      expect(params.autoOffset, 'projection does not depend on viewport offset mode').toBe(false);
      return p;
    }
  };

  const flat = extension.getDashOffsets.call(layer, [
    [0, 0, 0],
    [3, 0, 0],
    [6, 0, 0]
  ]);
  expect(flat.slice(0, 2), 'accumulates distance along a flat path').toEqual([0, 3]);

  const climbing = extension.getDashOffsets.call(layer, [
    [0, 0, 0],
    [3, 0, 4],
    [6, 0, 8]
  ]);
  // 3-4-5 triangles: each segment is 5 long in 3D, not 3.
  expect(climbing.slice(0, 2), 'accumulates 3D distance along a climbing path').toEqual([0, 5]);

  // The trailing vertex is the tesselator's INVALID padding vertex and must stay zeroed.
  expect(climbing[climbing.length - 1], 'last offset is zeroed').toBe(0);
});

test('PathStyleExtension#dash phase follows normalized path geometry', () => {
  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'path-wrap-dash-metrics',
          data: [
            [
              [170, 0],
              [-170, 0]
            ]
          ],
          getPath: path => path,
          wrapLongitude: true,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const {pathTesselator} = layer.state;
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(pathTesselator.instanceCount, 'antimeridian path is cut into two segments').toBe(
            4
          );
          expect(offsets[0], 'first rendered subpath starts at phase zero').toBe(0);
          expect(offsets[1], 'invalid antimeridian separator remains zero').toBe(0);
          expect(offsets[2], 'second subpath carries phase across the cut').toBeGreaterThan(0);
          expect(offsets[3], 'trailing invalid instance remains zero').toBe(0);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });

  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'closed-path-dash-metrics',
          data: [
            [
              [0, 0],
              [3, 0],
              [3, 4],
              [0, 0]
            ]
          ],
          getPath: path => path,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          positionFormat: 'XY',
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(offsets.slice(0, 6), 'closed phase is anchored at the first source point').toEqual(
            [0, 3, 7, 0, 0, 0]
          );
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase covers globe subdivisions', () => {
  const viewport = new GlobeViewport({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    resolution: 30
  });

  testLayer({
    Layer: PathLayer,
    viewport,
    testCases: [
      {
        props: {
          id: 'globe-path-dash-metrics',
          data: [
            [
              [-120, 0],
              [120, 0]
            ]
          ],
          getPath: path => path,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const {pathTesselator} = layer.state;
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          const segmentTypes = pathTesselator.get('segmentTypes');
          const validOffsets: number[] = [];
          for (let index = 0; index < pathTesselator.instanceCount; index++) {
            if ((segmentTypes[index] & 4) === 0) {
              validOffsets.push(offsets[index]);
            }
          }
          expect(pathTesselator.instanceCount, 'globe path is subdivided').toBeGreaterThan(2);
          expect(validOffsets[0], 'first globe segment starts at zero').toBe(0);
          expect(
            validOffsets.at(-1),
            'every generated globe segment receives accumulated phase'
          ).toBeGreaterThan(0);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase tracks tessellation viewport inputs', () => {
  const globeResolution30 = new GlobeViewport({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    resolution: 30
  });
  const globeResolution10 = new GlobeViewport({
    width: 800,
    height: 600,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    resolution: 10
  });
  const globePanned = new GlobeViewport({
    width: 800,
    height: 600,
    longitude: 20,
    latitude: 10,
    zoom: 2,
    resolution: 10
  });
  let resolution30InstanceCount = 0;
  let stableMetrics: Float32Array | null = null;

  testLayer({
    Layer: PathLayer,
    viewport: globeResolution30,
    testCases: [
      {
        viewport: globeResolution30,
        props: {
          id: 'globe-viewport-dash-metrics',
          data: [
            [
              [-120, 0],
              [120, 0]
            ]
          ],
          getPath: path => path,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          resolution30InstanceCount = layer.state.pathTesselator.instanceCount;
        }
      },
      {
        viewport: globeResolution10,
        onAfterUpdate: ({layer}) => {
          expect(
            layer.state.pathTesselator.instanceCount,
            'resolution changes rebuild normalized geometry'
          ).not.toBe(resolution30InstanceCount);
          expect(layer.state.tessellationResolution, 'new resolution is recorded').toBe(10);
          stableMetrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
        }
      },
      {
        viewport: globePanned,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics, 'ordinary pan and zoom preserve viewport-independent dash metrics').toBe(
            stableMetrics
          );
          expect(layer.state.tessellationResolution, 'tessellation remains current').toBe(10);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase tracks identity projection scale', () => {
  const baseViewport = new OrthographicViewport({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoomX: 0,
    zoomY: 0
  });
  const stretchedViewport = new OrthographicViewport({
    width: 800,
    height: 600,
    target: [0, 0, 0],
    zoomX: 1,
    zoomY: 0
  });
  const pannedViewport = new OrthographicViewport({
    width: 800,
    height: 600,
    target: [100, 100, 0],
    zoomX: 1,
    zoomY: 0
  });
  let stableMetrics: Float32Array | null = null;

  testLayer({
    Layer: PathLayer,
    viewport: baseViewport,
    testCases: [
      {
        viewport: baseViewport,
        props: {
          id: 'orthographic-projection-dash-metrics',
          data: [
            [
              [0, 0],
              [3, 4],
              [6, 4]
            ]
          ],
          getPath: path => path,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          positionFormat: 'XY',
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics[1], 'isotropic common-space distance').toBe(5);
        }
      },
      {
        viewport: stretchedViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics[1], 'anisotropic common-space distance').toBeCloseTo(Math.sqrt(52));
          stableMetrics = metrics;
        }
      },
      {
        viewport: pannedViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics, 'translation does not rebuild common-space metrics').toBe(stableMetrics);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase updates with projection inputs', () => {
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const scaleX2 = [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'projected-path-dash-metrics',
          data: [
            [
              [0, 0],
              [10, 0],
              [20, 0]
            ]
          ],
          getPath: path => path,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          positionFormat: 'XY',
          modelMatrix: identity,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(offsets[1], 'identity projection distance').toBe(10);
        }
      },
      {
        updateProps: {modelMatrix: scaleX2},
        onAfterUpdate: ({layer}) => {
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(offsets[1], 'model matrix change invalidates dash phase').toBe(20);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase reads strided binary paths', () => {
  const data = {
    length: 1,
    startIndices: [0, 3],
    attributes: {
      getPath: {
        value: new Float64Array([0, 0, 99, 3, 0, 99, 6, 0, 99]),
        size: 2,
        stride: 24
      }
    }
  };

  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'binary-path-dash-metrics',
          data,
          _pathType: 'open',
          positionFormat: 'XY',
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(offsets.slice(0, 3), 'binary positions use size and byte stride').toEqual([
            0, 3, 0
          ]);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase supports partial path updates', () => {
  const initialData = [
    [
      [0, 0],
      [1, 0],
      [2, 0]
    ],
    [
      [0, 0],
      [0, 2],
      [0, 4]
    ]
  ];
  const updatedData = [
    initialData[0],
    [
      [0, 0],
      [0, 3],
      [4, 3],
      [4, 8]
    ]
  ];

  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'partial-path-dash-metrics',
          data: initialData,
          getPath: path => path,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          positionFormat: 'XY',
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics.slice(0, 6), 'initial rows receive independent phase').toEqual([
            0, 1, 0, 0, 2, 0
          ]);
        }
      },
      {
        updateProps: {
          data: updatedData,
          _dataDiff: () => [{startRow: 1, endRow: 2}]
        },
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics.slice(0, 3), 'unchanged row retains its metrics').toEqual([0, 1, 0]);
          expect(metrics.slice(3, 7), 'resized partial row receives updated phase').toEqual([
            0, 3, 7, 0
          ]);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase validates GPU-only paths', () => {
  const pathBuffer = device.createBuffer({
    data: new Float32Array([0, 0, 3, 0, 6, 0])
  });
  const createData = (instanceDashOffsets?: Float32Array) => ({
    length: 1,
    startIndices: [0, 3],
    attributes: {
      getPath: {buffer: pathBuffer, size: 2},
      ...(instanceDashOffsets ? {instanceDashOffsets} : {})
    }
  });

  try {
    const errors: Error[] = [];
    testLayer({
      Layer: PathLayer,
      testCases: [
        {
          props: {
            id: 'gpu-only-path-dash-metrics',
            data: createData(),
            _pathType: 'open',
            positionFormat: 'XY',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            extensions: [new PathStyleExtension({highPrecisionDash: true})]
          }
        }
      ],
      onError: error => errors.push(error)
    });
    expect(
      errors.some(error => error.message.includes('supply data.attributes.instanceDashOffsets')),
      'GPU-only paths produce an actionable validation error'
    ).toBe(true);

    const explicitMetricsErrors: Error[] = [];
    testLayer({
      Layer: PathLayer,
      testCases: [
        {
          props: {
            id: 'gpu-only-path-explicit-dash-metrics',
            data: createData(new Float32Array([0, 3, 0])),
            _pathType: 'open',
            positionFormat: 'XY',
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            extensions: [new PathStyleExtension({highPrecisionDash: true})]
          }
        }
      ],
      onError: error => explicitMetricsErrors.push(error)
    });
    expect(explicitMetricsErrors, 'explicit metrics are the zero-copy escape hatch').toEqual([]);
  } finally {
    pathBuffer.destroy();
  }
});
