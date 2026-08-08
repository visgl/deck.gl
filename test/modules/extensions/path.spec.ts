// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {COORDINATE_SYSTEM, Deck, OrthographicView} from '@deck.gl/core';
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
        expect(
          layer.getShaders().defines.DASH_ENABLED,
          'DASH_ENABLED is unset when only offset is enabled'
        ).toBeUndefined();
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
    projectPosition: p => p
  };

  // Each entry is [distance from the start of the path, total length of the path].
  const flat = extension.getDashOffsets.call(layer, [
    [0, 0, 0],
    [3, 0, 0],
    [6, 0, 0]
  ]);
  expect(flat, 'accumulates distance along a flat path').toEqual([0, 6, 3, 6, 0, 6]);

  const climbing = extension.getDashOffsets.call(layer, [
    [0, 0, 0],
    [3, 0, 4],
    [6, 0, 8]
  ]);
  // 3-4-5 triangles: each segment is 5 long in 3D, not 3, so the path totals 10.
  expect(climbing, 'accumulates 3D distance along a climbing path').toEqual([0, 10, 5, 10, 0, 10]);

  // The trailing vertex is the tesselator's INVALID padding vertex, so its offset stays
  // zeroed even though the total length beside it is still carried.
  expect(climbing[climbing.length - 2], 'last offset is zeroed').toBe(0);
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
