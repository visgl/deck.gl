// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  COORDINATE_SYSTEM,
  Deck,
  OrthographicView,
  OrthographicViewport,
  WebMercatorViewport,
  project,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import type {ProjectUniforms} from '@deck.gl/core';
import {PathStyleExtension} from '@deck.gl/extensions';
import {
  GeoJsonLayer,
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';
import {device, getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';
import {preprocess} from '@luma.gl/shadertools';
import {
  dashShaders,
  offsetShaders,
  pathStylePipelineShaders
} from '../../../modules/extensions/src/path-style/shaders.glsl';
import {vec3} from '@math.gl/core';

import * as FIXTURES from 'deck.gl-test/data';

import type {DashUnits, PathStyleExtensionOptions} from '@deck.gl/extensions';

const webglTest = device.type === 'webgl' ? test : test.skip;

async function waitForRender(deck: Deck): Promise<void> {
  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: () => resolve()});
  });
}

function getDashPhase(metrics: ArrayLike<number>, instanceIndex: number): number {
  return metrics[instanceIndex * 2];
}

function getDashPhases(metrics: ArrayLike<number>, instanceCount: number): number[] {
  return Array.from({length: instanceCount}, (_, index) => getDashPhase(metrics, index));
}

function modelHasAttribute(layer: PathLayer, attributeName: string): boolean {
  return layer
    .getModels()
    .every(
      model =>
        model.bufferLayout.some(
          layout =>
            layout.name === attributeName ||
            layout.attributes?.some(attribute => attribute.attribute === attributeName)
        ) &&
        model.pipeline.bufferLayout.some(
          layout =>
            layout.name === attributeName ||
            layout.attributes?.some(attribute => attribute.attribute === attributeName)
        )
    );
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

webglTest('PathStyleExtension#rounded dash shoulders use one coverage ramp', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 100;
  const webglContext = canvas.getContext('webgl2', {
    antialias: false,
    preserveDrawingBuffer: true
  });
  expect(webglContext, 'WebGL2 context is created').toBeTruthy();

  const deck = new Deck({
    gl: webglContext!,
    width: 200,
    height: 100,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    controller: false,
    layers: [
      // Half-pixel coordinates align the end of the first 40 px dash interval with the
      // reference endpoint below, so both rounded shoulders cover the same pixel centers.
      new PathLayer({
        id: 'rounded-dash-shoulder',
        data: [
          [
            [-79.5, -19.5],
            [80.5, -19.5]
          ]
        ],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPath: path => path,
        getColor: [255, 255, 255, 255],
        getWidth: 20,
        widthUnits: 'pixels',
        antialiasing: true,
        capRounded: true,
        getDashArray: [4, 4],
        extensions: [new PathStyleExtension({dash: true})]
      }),
      new PathLayer({
        id: 'rounded-cap-reference',
        data: [
          [
            [-79.5, 20.5],
            [-39.5, 20.5]
          ]
        ],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPath: path => path,
        getColor: [255, 255, 255, 255],
        getWidth: 20,
        widthUnits: 'pixels',
        antialiasing: true,
        capRounded: true
      })
    ]
  });

  try {
    await waitForRender(deck);
    const pixels = new Uint8Array(200 * 100 * 4);
    webglContext!.readPixels(
      0,
      0,
      200,
      100,
      webglContext!.RGBA,
      webglContext!.UNSIGNED_BYTE,
      pixels
    );
    const getAlpha = (pixelX: number, pixelY: number) => pixels[(pixelY * 200 + pixelX) * 4 + 3];
    // readPixels uses a bottom-left origin: world y=20.5 maps to row 19, while
    // world y=-19.5 maps to row 59.
    const referenceBody = getAlpha(60, 19);
    const dashBody = getAlpha(60, 59);
    const referenceShoulder = getAlpha(61, 19);
    const dashShoulder = getAlpha(61, 59);

    expect(
      Math.abs(dashBody - referenceBody),
      `body-edge coverage is aligned (dash=${dashBody}, reference=${referenceBody})`
    ).toBeLessThanOrEqual(8);
    expect(referenceShoulder, 'reference rounded shoulder has partial coverage').toBeGreaterThan(
      96
    );
    expect(
      dashShoulder / referenceShoulder,
      `dash shoulder is not filtered twice (dash=${dashShoulder}, ` +
        `reference=${referenceShoulder})`
    ).toBeGreaterThan(0.8);
  } finally {
    deck.finalize();
    webglContext!.getExtension('WEBGL_lose_context')?.loseContext();
  }
});

test('PathStyleExtension#constructor options', () => {
  const optionalOptions: PathStyleExtensionOptions = {};
  const extension = new PathStyleExtension(optionalOptions);
  const resolvedOptions: Required<PathStyleExtensionOptions> = extension.opts;

  expect(resolvedOptions, 'omitted public options resolve to runtime defaults').toEqual({
    dash: false,
    offset: false,
    dashMode: 'segment',
    highPrecisionDash: false
  });

  expect(
    new PathStyleExtension({highPrecisionDash: true}).opts,
    'high precision dashing continues to imply dashing'
  ).toEqual({
    dash: true,
    offset: false,
    dashMode: 'path',
    highPrecisionDash: true
  });
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
        expect(
          layer.getShaders().defines.PATH_STYLE_OFFSET,
          'offset capability selects the remapped corner envelope'
        ).toBe(true);
        const pathStyleModule = layer
          .getShaders()
          .modules.find(module => module.name === 'pathStyle')!;
        expect(pathStyleModule.uniformTypes, 'dash module retains its uniform block').toEqual({
          dashAlignMode: 'f32',
          dashGapPickable: 'i32',
          dashUnits: 'i32'
        });
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toEqual([0, 0]);
        expect(attributes.instanceOffsets.value, 'instanceOffsets attribute is populated').toEqual([
          0
        ]);

        // instanceDashOffsets packs [distance from path start, total path length] per vertex.
        const dashOffsets = attributes.instanceDashOffsets.value;
        expect(attributes.instanceDashOffsets.size, 'instanceDashOffsets is a vec2').toBe(2);

        const pointCount = FIXTURES.zigzag[0].path.length;
        let distancesAscend = true;
        for (let i = 0; i < pointCount - 2; i++) {
          distancesAscend = distancesAscend && dashOffsets[i * 2] <= dashOffsets[(i + 1) * 2];
        }
        expect(distancesAscend, 'distances accumulate along the path').toBeTruthy();

        const totalLength = dashOffsets[1];
        expect(totalLength, 'total path length is positive').toBeGreaterThan(0);
        expect(
          dashOffsets[(pointCount - 2) * 2] <= totalLength,
          'no vertex sits past the end of the path'
        ).toBeTruthy();
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
          getPath: dataPoint => dataPoint.path,
          getOffset: 1,
          extensions: [new PathStyleExtension({offset: true})]
        },
        onAfterUpdate: ({layer}) => {
          expect(
            layer.getShaders().defines.PATH_STYLE_OFFSET,
            'offset-only capability selects the remapped corner envelope'
          ).toBe(true);
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
    onError: error => expect(error).toBeFalsy()
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
        dashUnits: 'pixels',
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = getLayerUniforms(pathLayer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(0);
        expect(uniforms.dashUnits, 'PolygonLayer forwards dashUnits').toBe(1);
        expect(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toBeTruthy();
      }
    },
    {
      updateProps: {
        dashJustified: true,
        dashUnits: 'common',
        getDashArray: d => [3, 1]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = getLayerUniforms(pathLayer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(1);
        expect(uniforms.dashUnits, 'PolygonLayer updates forwarded dashUnits').toBe(3);
        expect(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#GeoJsonLayer forwards dashUnits', () => {
  testLayer({
    Layer: GeoJsonLayer,
    testCases: [
      {
        props: {
          id: 'geojson-dash-units',
          data: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [0, 0],
                  [1, 1]
                ]
              }
            }
          ],
          stroked: true,
          getDashArray: [4, 5],
          dashUnits: 'meters',
          extensions: [new PathStyleExtension({dash: true})]
        },
        onAfterUpdate: ({subLayers}) => {
          const pathLayer = subLayers.find(layer => layer.id.endsWith('linestrings'));
          expect(pathLayer, 'GeoJsonLayer creates its path sublayer').toBeTruthy();
          expect(getLayerUniforms(pathLayer).dashUnits, 'GeoJsonLayer forwards dashUnits').toBe(2);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
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
        // The shared coordinate stage guards dash-only varyings and calculations on this define.
        expect(defines.DASH_ENABLED, 'DASH_ENABLED is set when dash is enabled').toBe(true);
        expect(defines.DASH_MODE_PATH, 'DASH_MODE_PATH is off by default').toBeUndefined();
        const pathStyleModule = layer
          .getShaders()
          .modules.find(module => module.name === 'pathStyle')!;
        const fragmentStart = pathStyleModule.inject?.['fs:#main-start'];
        const fragmentEnd = pathStyleModule.inject?.['fs:#main-end'];
        expect(fragmentStart, 'rounded caps use a signed pixel-distance ramp').toContain(
          'smoothedge(0.0, capEdgePixels)'
        );
        expect(fragmentStart, 'coverage is bounded before deferred rejection').toContain(
          'dashCoverage = clamp(dashCoverage, 0.0, 1.0)'
        );
        expect(fragmentStart, 'sub-pixel rounded dashes preserve capsule area').toContain(
          'boundedSolidLength + min(effectiveGap, capSpan)'
        );
        expect(fragmentEnd, 'rounded caps intersect the PathLayer coverage ramp once').toContain(
          'min(pathCoverage, roundedDashResolvedCoverage)'
        );
        expect(fragmentEnd, 'sub-pixel capsule duty remains separable').toContain(
          'roundedDashDutyCycle'
        );
      }
    },
    {
      updateProps: {
        extensions: [new PathStyleExtension({dashMode: 'path'})]
      },
      onAfterUpdate: ({layer}) => {
        const {defines} = layer.getShaders();
        expect(defines.DASH_ENABLED, 'path mode implies dash').toBe(true);
        expect(defines.DASH_MODE_PATH, 'path mode sets DASH_MODE_PATH').toBe(true);
      }
    },
    {
      updateProps: {
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const {defines} = layer.getShaders();
        expect(defines.DASH_ENABLED, 'highPrecisionDash implies dash').toBe(true);
        expect(defines.DASH_MODE_PATH, 'legacy alias selects DASH_MODE_PATH').toBe(true);
      }
    }
  ];

  testLayer({Layer: PathLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#bounds justified dash intervals in every mode', () => {
  const injection = dashShaders.inject['fs:#main-start'];
  const segmentShader = preprocess(injection);
  const pathShader = preprocess(injection, {defines: {DASH_MODE_PATH: 1}});

  for (const [mode, shader, unitLengthAssignment] of [
    ['segment', segmentShader, 'unitLength = vDashSegment.y /'],
    ['path', pathShader, 'unitLength = vDashPathLength /']
  ] as const) {
    const assignmentIndex = shader.indexOf(unitLengthAssignment);
    const clampIndex = shader.indexOf('solidLength = min(solidLength, unitLength);');
    const offsetIndex = shader.indexOf('offset = solidLength / 2.0;');
    expect(assignmentIndex, `${mode} mode adjusts the dash period`).toBeGreaterThanOrEqual(0);
    expect(clampIndex, `${mode} mode bounds the requested solid interval`).toBeGreaterThan(
      assignmentIndex
    );
    expect(offsetIndex, `${mode} mode calculates offset after bounding`).toBeGreaterThan(
      clampIndex
    );
  }

  expect(segmentShader, 'segment mode uses its local phase').not.toContain(
    'offset += vDashOffset;'
  );
  expect(pathShader, 'path mode adds the accumulated path phase').toContain(
    'offset += vDashOffset;'
  );
});

test('PathStyleExtension#orders offset remapping before dash conversion', () => {
  const vertexInjection = pathStylePipelineShaders.inject['vs:#main-end'];
  const offsetVertexShader = preprocess(vertexInjection, {
    defines: {PATH_STYLE_OFFSET: 1}
  });
  const dashVertexShader = preprocess(vertexInjection, {
    defines: {DASH_ENABLED: 1, DASH_MODE_PATH: 1}
  });
  const combinedVertexShader = preprocess(vertexInjection, {
    defines: {DASH_ENABLED: 1, DASH_MODE_PATH: 1, PATH_STYLE_OFFSET: 1}
  });
  const remapIndex = combinedVertexShader.indexOf('vPathPosition.y *= offsetWidth');
  const widthRestoreIndex = combinedVertexShader.indexOf('strokeHalfWidth /= offsetWidth');
  const dashArrayIndex = combinedVertexShader.indexOf('vDashArray = instanceDashArrays');
  const dashOffsetIndex = combinedVertexShader.indexOf('vDashOffset = dashPeriod');

  expect(remapIndex, 'restores the along-path coordinate').toBeGreaterThanOrEqual(0);
  expect(combinedVertexShader, 'restores segment length in the same stage').toContain(
    'vPathLength *= offsetWidth'
  );
  expect(combinedVertexShader, 'restores dash arclength in the same stage').toContain(
    'vDashSegment *= offsetWidth'
  );
  expect(widthRestoreIndex, 'recovers the pre-offset stroke width after remapping').toBeGreaterThan(
    remapIndex
  );
  expect(dashArrayIndex, 'converts the dash array after restoring width').toBeGreaterThan(
    widthRestoreIndex
  );
  expect(dashOffsetIndex, 'reduces phase once after restoring width').toBeGreaterThan(
    dashArrayIndex
  );
  expect(combinedVertexShader, 'does not need a second repaired dash period').not.toContain(
    'restoredDashPeriod'
  );
  expect(
    combinedVertexShader.match(/vDashOffset = dashPeriod/g),
    'combined path mode reduces phase exactly once'
  ).toHaveLength(1);

  expect(offsetVertexShader, 'offset-only keeps the coordinate remap').toContain(
    'vPathPosition.y *= offsetWidth'
  );
  expect(offsetVertexShader, 'offset-only does not compile dash calculations').not.toContain(
    'vDashArray'
  );
  expect(offsetVertexShader, 'offset-only does not access dash arclength').not.toContain(
    'vDashSegment'
  );

  expect(dashVertexShader, 'dash-only keeps dash conversion').toContain(
    'vDashArray = instanceDashArrays'
  );
  expect(dashVertexShader, 'dash-only does not compile offset remapping').not.toContain(
    'offsetWidth'
  );
  expect(
    dashShaders.inject,
    'dash capability has no competing vertex-end injection'
  ).not.toHaveProperty('vs:#main-end');
  expect(
    offsetShaders.inject,
    'offset capability has no competing vertex-end injection'
  ).not.toHaveProperty('vs:#main-end');

  const fragmentInjection = pathStylePipelineShaders.inject['fs:#main-end'];
  const antialiasedFragmentShader = preprocess(fragmentInjection, {
    defines: {ANTIALIASING: 1, DASH_ENABLED: 1, PATH_STYLE_OFFSET: 1}
  });
  const nonAntialiasedFragmentShader = preprocess(fragmentInjection, {
    defines: {DASH_ENABLED: 1, PATH_STYLE_OFFSET: 1}
  });
  expect(antialiasedFragmentShader, 'AA keeps deferred dash coverage').toContain(
    'min(pathCoverage, roundedDashResolvedCoverage)'
  );
  expect(antialiasedFragmentShader, 'AA uses PathLayer coverage for the offset edge').not.toContain(
    'abs(vPathPosition.x) > 1.0'
  );
  expect(nonAntialiasedFragmentShader, 'non-AA rejects dash gaps before the offset edge').toMatch(
    /if \(shouldDiscardDash\)[\s\S]*if \(abs\(vPathPosition\.x\) > 1\.0\)/
  );
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
  expect(flat, 'accumulates distance along a flat path').toEqual([0, 3, 0]);

  const climbing = extension.getDashOffsets.call(layer, [
    [0, 0, 0],
    [3, 0, 4],
    [6, 0, 8]
  ]);
  // 3-4-5 triangles: each segment is 5 long in 3D, not 3.
  expect(climbing, 'accumulates 3D distance along a climbing path').toEqual([0, 5, 0]);

  // The trailing vertex is the tesselator's INVALID padding vertex and must stay zeroed.
  expect(climbing[climbing.length - 1], 'last offset is zeroed').toBe(0);
});

test('PathStyleExtension#dashMode', () => {
  // 'path' allocates the offsets attribute; 'segment' must not pay for it.
  const segmentLayer = new PathStyleExtension({dash: true});
  expect(segmentLayer.opts.dashMode, 'defaults to segment').toBe('segment');

  const pathModeLayer = new PathStyleExtension({dashMode: 'path'});
  expect(pathModeLayer.opts.dashMode, 'dashMode is respected').toBe('path');
  expect(pathModeLayer.opts.dash, 'dashMode path implies dash').toBe(true);

  // Naming either mode is a request for dashes. Resolving 'segment' to dash: false would
  // make {dashMode: 'segment'} silently draw solid lines while {dashMode: 'path'} worked.
  const segmentModeLayer = new PathStyleExtension({dashMode: 'segment'});
  expect(segmentModeLayer.opts.dashMode, 'dashMode is respected').toBe('segment');
  expect(segmentModeLayer.opts.dash, 'dashMode segment implies dash').toBe(true);

  // Omitting dashMode entirely still leaves dashing off unless asked for.
  const offsetOnly = new PathStyleExtension({offset: true});
  expect(offsetOnly.opts.dash, 'offset alone does not enable dash').toBe(false);
  expect(offsetOnly.opts.dashMode, 'defaults to segment when unset').toBe('segment');

  // highPrecisionDash is the old spelling of dashMode: 'path'.
  const legacy = new PathStyleExtension({highPrecisionDash: true});
  expect(legacy.opts.dashMode, 'highPrecisionDash maps to dashMode path').toBe('path');
  expect(legacy.opts.dash, 'highPrecisionDash implies dash').toBe(true);

  const explicitSegment = new PathStyleExtension({
    dashMode: 'segment',
    highPrecisionDash: true
  });
  expect(explicitSegment.opts.dashMode, 'explicit segment mode wins over the legacy alias').toBe(
    'segment'
  );
  expect(
    explicitSegment.opts.highPrecisionDash,
    'resolved legacy option reflects explicit segment mode'
  ).toBe(false);

  const explicitPath = new PathStyleExtension({
    dashMode: 'path',
    highPrecisionDash: false
  });
  expect(explicitPath.opts.dashMode, 'explicit path mode wins over a false legacy alias').toBe(
    'path'
  );
  expect(
    explicitPath.opts.highPrecisionDash,
    'resolved legacy option reflects explicit path mode'
  ).toBe(true);

  const testCases = [
    {
      props: {
        id: 'dash-mode-segment',
        data: FIXTURES.zigzag,
        getPath: datum => datum.path,
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        expect(
          layer.getAttributeManager().getAttributes().instanceDashOffsets,
          'segment mode allocates no offsets attribute'
        ).toBeUndefined();
      }
    }
  ];
  testLayer({Layer: PathLayer, testCases, onError: error => expect(error).toBeFalsy()});
});

test('PathStyleExtension#dashUnits', () => {
  const unitValues: Array<[DashUnits | undefined, number]> = [
    [undefined, 0],
    ['widths', 0],
    ['pixels', 1],
    ['meters', 2],
    ['common', 3]
  ];

  testLayer({
    Layer: PathLayer,
    testCases: unitValues.map(([dashUnits, expectedValue], index) => ({
      ...(index === 0
        ? {
            props: {
              id: 'dash-units-test',
              data: FIXTURES.zigzag,
              getPath: datum => datum.path,
              getDashArray: [4, 5],
              extensions: [new PathStyleExtension({dash: true})]
            }
          }
        : {updateProps: {dashUnits}}),
      onAfterUpdate: ({layer}) => {
        expect(
          getLayerUniforms(layer).dashUnits,
          dashUnits ? `${dashUnits} maps to its shader value` : 'dashUnits defaults to widths'
        ).toBe(expectedValue);
      }
    })),
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#synchronizes live dash mode changes', () => {
  const path = [
    [0, 0],
    [3, 0],
    [6, 0]
  ];
  let dashArraysAttribute;
  let offsetsAttribute;
  testLayer({
    Layer: PathLayer,
    testCases: [
      {
        props: {
          id: 'live-dash-mode',
          data: [path],
          getPath: value => value,
          getDashArray: [2, 1],
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          positionFormat: 'XY',
          getOffset: 0,
          extensions: [new PathStyleExtension({dashMode: 'segment', offset: true})]
        },
        onAfterUpdate: ({layer}) => {
          const attributes = layer.getAttributeManager().getAttributes();
          expect(attributes.instanceDashArrays, 'segment mode has dash arrays').toBeTruthy();
          expect(attributes.instanceOffsets, 'segment mode has offsets').toBeTruthy();
          dashArraysAttribute = attributes.instanceDashArrays;
          offsetsAttribute = attributes.instanceOffsets;
          expect(attributes.instanceDashOffsets, 'segment mode omits path metrics').toBeUndefined();
          expect(modelHasAttribute(layer, 'instanceDashOffsets'), 'model omits path metrics').toBe(
            false
          );
        }
      },
      {
        updateProps: {
          extensions: [new PathStyleExtension({dashMode: 'path', offset: true})]
        },
        onAfterUpdate: ({layer}) => {
          const attributes = layer.getAttributeManager().getAttributes();
          expect(attributes.instanceDashArrays, 'dash array attribute is preserved').toBe(
            dashArraysAttribute
          );
          expect(attributes.instanceOffsets, 'offset attribute is preserved').toBe(
            offsetsAttribute
          );
          const metrics = attributes.instanceDashOffsets;
          expect(metrics, 'path mode adds path metrics').toBeTruthy();
          expect(metrics.size, 'path metrics contain offset and total').toBe(2);
          expect(Array.from(metrics.value.slice(0, 6)), 'path metrics are populated').toEqual([
            0, 6, 3, 6, 0, 6
          ]);
          expect(modelHasAttribute(layer, 'instanceDashOffsets'), 'model binds path metrics').toBe(
            true
          );
        }
      },
      {
        updateProps: {
          extensions: [new PathStyleExtension({dashMode: 'segment', offset: true})]
        },
        onAfterUpdate: ({layer}) => {
          const attributes = layer.getAttributeManager().getAttributes();
          expect(attributes.instanceDashArrays, 'segment mode keeps the dash array attribute').toBe(
            dashArraysAttribute
          );
          expect(attributes.instanceOffsets, 'segment mode keeps the offset attribute').toBe(
            offsetsAttribute
          );
          expect(
            attributes.instanceDashOffsets,
            'segment mode removes path metrics'
          ).toBeUndefined();
          expect(modelHasAttribute(layer, 'instanceDashOffsets'), 'model drops path metrics').toBe(
            false
          );
        }
      },
      {
        updateProps: {
          extensions: [new PathStyleExtension({dashMode: 'path', offset: true})]
        },
        onAfterUpdate: ({layer}) => {
          const attributes = layer.getAttributeManager().getAttributes();
          expect(attributes.instanceDashArrays, 'dash array remains idempotent').toBe(
            dashArraysAttribute
          );
          expect(attributes.instanceOffsets, 'offset remains idempotent').toBe(offsetsAttribute);
          expect(attributes.instanceDashOffsets, 'path metrics can be re-added').toBeTruthy();
          expect(
            modelHasAttribute(layer, 'instanceDashOffsets'),
            'model rebinds path metrics'
          ).toBe(true);
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase follows normalized path geometry', () => {
  const antimeridianViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: 180,
    latitude: 0,
    zoom: 14
  });
  testLayer({
    Layer: PathLayer,
    viewport: antimeridianViewport,
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
          expect(getDashPhase(offsets, 0), 'first rendered subpath starts at phase zero').toBe(0);
          expect(getDashPhase(offsets, 1), 'invalid antimeridian separator remains zero').toBe(0);
          expect(
            getDashPhase(offsets, 2),
            'second subpath carries the short crossing phase'
          ).toBeCloseTo(5120 / 360, 5);
          expect(getDashPhase(offsets, 3), 'trailing invalid instance remains zero').toBe(0);
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
          expect(
            getDashPhases(offsets, 6),
            'closed phase is anchored at the first source point'
          ).toEqual([0, 3, 7, 0, 0, 0]);
          expect(offsets[1], 'closed path total includes every rendered segment').toBe(12);
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
              validOffsets.push(getDashPhase(offsets, index));
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
          expect(getDashPhase(metrics, 1), 'isotropic common-space distance').toBe(5);
        }
      },
      {
        viewport: stretchedViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(getDashPhase(metrics, 1), 'anisotropic common-space distance').toBeCloseTo(
            Math.sqrt(52)
          );
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

test('PathLayer#projection mode changes preserve tessellated geometry', () => {
  const lowZoomViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 11.99
  });
  const autoOffsetViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 12
  });
  let vertexStarts: number[] | null = null;

  expect(
    autoOffsetViewport.projectionMode,
    'test viewports cross the auto-offset projection boundary'
  ).not.toBe(lowZoomViewport.projectionMode);

  testLayer({
    Layer: PathLayer,
    viewport: lowZoomViewport,
    testCases: [
      {
        viewport: lowZoomViewport,
        props: {
          id: 'path-projection-mode-tessellation',
          data: [
            [
              [-122.46, 37.9, 0],
              [-122.45, 37.91, 1e8],
              [-122.44, 37.92, 0]
            ]
          ],
          getPath: path => path
        },
        onAfterUpdate: ({layer}) => {
          vertexStarts = layer.state.pathTesselator.vertexStarts;
        }
      },
      {
        viewport: autoOffsetViewport,
        spies: ['updateState'],
        onAfterUpdate: ({layer, spies}) => {
          expect(
            layer.state.pathTesselator.vertexStarts,
            'projection mode does not rebuild undashed path geometry'
          ).toBe(vertexStarts);
          expect(
            spies.updateState,
            'projection mode alone does not update an undashed PathLayer'
          ).not.toHaveBeenCalled();
        }
      }
    ],
    onError: error => expect(error, error?.message).toBeFalsy()
  });
});

test('PathStyleExtension#dash phase tracks Web Mercator auto-offset scale', () => {
  const path = [
    [-122.46, 37.9, 0],
    [-122.45, 37.91, 1e8],
    [-122.44, 37.92, 0]
  ];
  const lowZoomViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 11.99
  });
  const baseViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 14
  });
  const latitudePannedViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.45,
    latitude: 38,
    zoom: 14
  });
  const longitudePannedViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.2,
    latitude: 38,
    zoom: 14
  });
  const zoomedViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122.2,
    latitude: 38,
    zoom: 15
  });
  const getExpectedSegmentLength = (viewport: WebMercatorViewport): number => {
    const uniforms = project.getUniforms({
      viewport,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    }) as ProjectUniforms;
    const projectPosition = (position: number[]): [number, number, number] => {
      const offset = vec3.sub([], position, uniforms.coordinateOrigin);
      const scale = vec3.scaleAndAdd(
        [],
        uniforms.commonUnitsPerWorldUnit,
        uniforms.commonUnitsPerWorldUnit2,
        offset[1]
      );
      return vec3.multiply([], offset, scale) as [number, number, number];
    };
    return vec3.dist(projectPosition(path[0]), projectPosition(path[1]));
  };

  let lowZoomLength = 0;
  let baseLength = 0;
  let vertexStarts: number[] | null = null;
  let stableMetrics: Float32Array | null = null;
  let stableProjectionScale: number[] | null = null;

  testLayer({
    Layer: PathLayer,
    viewport: lowZoomViewport,
    testCases: [
      {
        viewport: lowZoomViewport,
        props: {
          id: 'web-mercator-projection-dash-metrics',
          data: [path],
          getPath: pathData => pathData,
          coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          lowZoomLength = getDashPhase(metrics, 1);
          vertexStarts = layer.state.pathTesselator.vertexStarts;
        }
      },
      {
        viewport: baseViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          baseLength = getDashPhase(metrics, 1);
          expect(baseLength, 'base phase matches shader auto-offset projection').toBeCloseTo(
            getExpectedSegmentLength(baseViewport),
            3
          );
          expect(baseLength, 'projection-mode change refreshes dash phase').not.toBe(lowZoomLength);
          expect(
            layer.state.pathTesselator.vertexStarts,
            'projection-mode change preserves normalized path geometry'
          ).toBe(vertexStarts);
        }
      },
      {
        viewport: latitudePannedViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(getDashPhase(metrics, 1), 'latitude pan refreshes shader-scale phase').toBeCloseTo(
            getExpectedSegmentLength(latitudePannedViewport),
            3
          );
          expect(getDashPhase(metrics, 1), 'latitude pan changes elevated phase').not.toBe(
            baseLength
          );
          stableMetrics = metrics;
          stableProjectionScale = layer.state.pathProjectionScale;
        }
      },
      {
        viewport: longitudePannedViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics, 'longitude-only pan preserves dash metrics').toBe(stableMetrics);
          expect(layer.state.pathProjectionScale, 'longitude-only pan avoids layer updates').toBe(
            stableProjectionScale
          );
        }
      },
      {
        viewport: zoomedViewport,
        onAfterUpdate: ({layer}) => {
          const metrics = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(metrics, 'same-mode zoom preserves common-space dash metrics').toBe(stableMetrics);
          expect(layer.state.pathProjectionScale, 'same-mode zoom avoids layer updates').toBe(
            stableProjectionScale
          );
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
          expect(getDashPhase(offsets, 1), 'identity projection distance').toBe(10);
        }
      },
      {
        updateProps: {modelMatrix: scaleX2},
        onAfterUpdate: ({layer}) => {
          const offsets = layer.getAttributeManager().getAttributes().instanceDashOffsets.value;
          expect(getDashPhase(offsets, 1), 'model matrix change invalidates dash phase').toBe(20);
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
          expect(getDashPhases(offsets, 3), 'binary positions use size and byte stride').toEqual([
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
          expect(getDashPhases(metrics, 6), 'initial rows receive independent phase').toEqual([
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
          expect(getDashPhases(metrics, 3), 'unchanged row retains its metrics').toEqual([0, 1, 0]);
          expect(
            getDashPhases(metrics, 7).slice(3),
            'resized partial row receives updated phase'
          ).toEqual([0, 3, 7, 0]);
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
            data: createData(new Float32Array([0, 6, 3, 6, 0, 6])),
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
