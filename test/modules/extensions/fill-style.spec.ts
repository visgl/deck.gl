// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {MapView} from '@deck.gl/core';
import {FillStyleExtension} from '@deck.gl/extensions';
import {PolygonLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer, device} from '@deck.gl/test-utils/vitest';

import type {Viewport} from '@deck.gl/core';

import * as FIXTURES from 'deck.gl-test/data';
const webglTest = device.type === 'webgl' ? test : test.skip;

const FILL_PATTERN_ATLAS = new Uint8Array(4);
const FILL_PATTERN_MAPPING = {
  pattern: {x: 0, y: 0, width: 1, height: 1}
};

webglTest('FillStyleExtension#PolygonLayer', () => {
  const testCases = [
    {
      props: {
        id: 'fill-style-extension-test',
        data: FIXTURES.polygons,
        getPolygon: d => d,

        fillPatternAtlas: FILL_PATTERN_ATLAS,
        fillPatternMapping: FILL_PATTERN_MAPPING,
        getFillPattern: f => 'pattern',
        getFillPatternOffset: [0.5, 0.5],
        getFillPatternScale: 2,

        extensions: [new FillStyleExtension({pattern: true})]
      },
      onAfterUpdate: ({layer, subLayers}) => {
        expect(layer.state.emptyTexture, 'should not be enabled in composite layer').toBeFalsy();

        const strokeLayer = subLayers.find(l => l.id.includes('stroke'));
        const fillLayer = subLayers.find(l => l.id.includes('fill'));

        expect(fillLayer.state.emptyTexture, 'should be enabled in composite layer').toBeTruthy();
        let uniforms = getLayerUniforms(fillLayer);
        expect(uniforms.patternMask, 'has patternMask uniform').toBeTruthy();
        expect(
          fillLayer.getAttributeManager().getAttributes().fillPatternScales.value,
          'fillPatternScales attribute is populated'
        ).toEqual([2]);
        expect(
          fillLayer.getAttributeManager().getAttributes().fillPatternFrames.value.slice(0, 4),
          'fillPatternFrames attribute is populated'
        ).toEqual([0, 0, 1, 1]);
        expect(
          fillLayer.getAttributeManager().getAttributes().fillPatternBackgroundColors.value,
          'fillPatternBackgroundColors defaults to transparent'
        ).toEqual(new Float32Array([0, 0, 0, 0]));

        // The atlas used to be pinned to mip 0, because emulating tiling with mod() breaks the
        // implicit derivatives that mip selection is based on. `textureGrad` supplies the
        // gradients instead, so the mip chain has to stay available - see #7326
        const {sampler} = layer.props.fillPatternAtlas;
        expect(sampler.props.lodMaxClamp, 'pattern atlas is not pinned to mip 0').toBeGreaterThan(
          0
        );
        expect(sampler.props.mipmapFilter, 'pattern atlas filters between mips').toBe('linear');

        uniforms = getLayerUniforms(strokeLayer);
        expect(strokeLayer.state.emptyTexture, 'should not be enabled in PathLayer').toBeFalsy();
        expect('patternMask' in uniforms, 'should not be enabled in PathLayer').toBeFalsy();
      }
    },
    {
      title: 'getFillPatternBackgroundColor',
      updateProps: {
        getFillPatternBackgroundColor: [255, 128, 0]
      },
      onAfterUpdate: ({subLayers}) => {
        const fillLayer = subLayers.find(l => l.id.includes('fill'));
        expect(
          fillLayer.getAttributeManager().getAttributes().fillPatternBackgroundColors.value,
          'a 3-element background color is opaque'
        ).toEqual(new Float32Array([255 / 255, 128 / 255, 0, 1]));
      }
    },
    {
      title: 'getFillPatternBackgroundColor as a function',
      updateProps: {
        getFillPatternBackgroundColor: (f, {index}) => [index + 1, 2, 3, 51],
        updateTriggers: {getFillPatternBackgroundColor: 1}
      },
      onAfterUpdate: ({subLayers}) => {
        const fillLayer = subLayers.find(l => l.id.includes('fill'));
        expect(
          Array.from(
            fillLayer
              .getAttributeManager()
              .getAttributes()
              .fillPatternBackgroundColors.value.slice(0, 4)
          ),
          'fillPatternBackgroundColors attribute is populated per object'
        ).toEqual([1, 2, 3, 51]);
      }
    },
    {
      title: `Finalizing a sublayer should not affect the parent layer's loaded props`,
      updateProps: {
        data: []
      },
      onAfterUpdate: ({layer}) => {
        expect(
          layer.props.fillPatternAtlas.handle,
          'fillPatternAtlas texture is not deleted'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

webglTest('FillStyleExtension#originPrecision', () => {
  // Above zoom 12 the shader coordinate origin is a large common-space value, which is what the
  // origin reduction exists for
  const viewport = new MapView({}).makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 12.3, latitude: 45.6, zoom: 14.4}
  }) as Viewport;

  // Frames of different sizes: the origin may only be reduced by a period that both tile in
  // whole - lcm(4, 6) = 12 texels, scaled by getFillPatternScale
  const METERS_PER_COMMON_UNIT = 512 / 40000000;
  const ORIGIN_PERIOD = 2 * 12 * METERS_PER_COMMON_UNIT;

  const testCases = [
    {
      props: {
        id: 'fill-style-origin-precision-test',
        data: FIXTURES.polygons,
        getPolygon: d => d,

        fillPatternAtlas: FILL_PATTERN_ATLAS,
        fillPatternMapping: {
          small: {x: 0, y: 0, width: 4, height: 4},
          large: {x: 4, y: 0, width: 6, height: 6}
        },
        getFillPattern: () => 'small',
        getFillPatternScale: 2,

        extensions: [new FillStyleExtension({pattern: true})]
      },
      viewport,
      onAfterUpdate: ({subLayers}) => {
        const fillLayer = subLayers.find(l => l.id.includes('fill'));
        const uniforms = getLayerUniforms(fillLayer);
        expect(
          Math.abs(uniforms.uvCoordinateOrigin[0]),
          'coordinate origin is reduced to within one period'
        ).toBeLessThan(ORIGIN_PERIOD);
        expect(
          Math.abs(uniforms.uvCoordinateOrigin[1]),
          'coordinate origin is reduced to within one period'
        ).toBeLessThan(ORIGIN_PERIOD);
      }
    },
    {
      title: 'data driven getFillPatternScale',
      updateProps: {
        getFillPatternScale: () => 2,
        updateTriggers: {getFillPatternScale: 1}
      },
      viewport,
      onAfterUpdate: ({subLayers}) => {
        const fillLayer = subLayers.find(l => l.id.includes('fill'));
        expect(
          Math.abs(getLayerUniforms(fillLayer).uvCoordinateOrigin[0]),
          'tile sizes are unknown, so the coordinate origin is left alone'
        ).toBeGreaterThan(1);
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
