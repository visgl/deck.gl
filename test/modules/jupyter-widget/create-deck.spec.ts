// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// eslint-disable-next-line
/* global document, window, global */
import {test, expect, describe} from 'vitest';

import {
  AmbientLight,
  CompositeLayer,
  DirectionalLight,
  LayerExtension,
  LightingEffect,
  PointLight,
  PostProcessEffect,
  _CameraLight as CameraLight,
  _SunLight as SunLight
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension, MaskExtension} from '@deck.gl/extensions';
import {NullDevice} from '@luma.gl/test-utils';
import {addCustomLibraries, jsonConverter} from '@deck.gl/jupyter-widget/playground/create-deck';

class DemoCompositeLayer extends CompositeLayer {
  renderLayers() {
    return new ScatterplotLayer(this.props);
  }
}

describe('jupyter-widget: dynamic-registration', () => {
  test('null customLibrares', () => {
    const returnValue = addCustomLibraries(null, () => {});
    expect(!returnValue, 'No custom libraries returns null').toBeTruthy();
  });

  test('addCustomLibraries', () => {
    const TEST_LIBRARY_NAME = 'DemoLibrary';
    window[TEST_LIBRARY_NAME] = {DemoCompositeLayer};

    const onComplete = () => {
      const props = jsonConverter.convert({
        layers: [{'@@type': 'DemoCompositeLayer', data: []}]
      });
      expect(
        props.layers[0] instanceof DemoCompositeLayer,
        'Should add new class to the converter'
      ).toBeTruthy();
      // cleanup
      delete window[TEST_LIBRARY_NAME];
    };

    addCustomLibraries(
      [
        {
          libraryName: TEST_LIBRARY_NAME,
          resourceUri: '/index.js'
        }
      ],
      onComplete
    );
  });
});

describe('jupyter-widget: extensions-registration', () => {
  test('resolves extension @@type to LayerExtension instances', () => {
    const props = jsonConverter.convert({
      dataFilter: {'@@type': 'DataFilterExtension', filterSize: 1},
      mask: {'@@type': 'MaskExtension'}
    });

    expect(
      props.dataFilter instanceof LayerExtension,
      'DataFilterExtension resolves to a LayerExtension'
    ).toBeTruthy();
    expect(
      props.dataFilter instanceof DataFilterExtension,
      'DataFilterExtension resolves to the concrete class'
    ).toBeTruthy();
    expect(
      props.mask instanceof LayerExtension,
      'MaskExtension resolves to a LayerExtension'
    ).toBeTruthy();
    expect(
      props.mask instanceof MaskExtension,
      'MaskExtension resolves to the concrete class'
    ).toBeTruthy();
  });

  test('layer survives and hydrates its extensions', () => {
    // Regression: adding an extension used to drop the whole layer because the
    // extension class was not registered in the widget's JSONConverter catalog.
    const props = jsonConverter.convert({
      layers: [
        {
          '@@type': 'ScatterplotLayer',
          data: [],
          extensions: [{'@@type': 'DataFilterExtension', filterSize: 1}]
        }
      ]
    });

    expect(props.layers[0] instanceof ScatterplotLayer, 'Layer is not dropped').toBeTruthy();
    const [extension] = props.layers[0].props.extensions;
    expect(
      extension instanceof DataFilterExtension,
      'Layer extension is hydrated into a class instance'
    ).toBeTruthy();
  });
});

describe('jupyter-widget: effects-registration', () => {
  test('hydrates lighting effects and lights', () => {
    const props = jsonConverter.convert({
      effects: [
        {
          '@@type': 'LightingEffect',
          ambient: {'@@type': 'AmbientLight', intensity: 0.5},
          directional: {'@@type': 'DirectionalLight', direction: [-1, -3, -1]},
          point: {'@@type': 'PointLight', position: [0, 0, 100]},
          sun: {'@@type': 'SunLight', timestamp: 1554927200000},
          camera: {'@@type': 'CameraLight'}
        }
      ]
    });

    const effect = props.effects[0];
    expect(effect).toBeInstanceOf(LightingEffect);
    expect(effect.props.ambient).toBeInstanceOf(AmbientLight);
    expect(effect.props.directional).toBeInstanceOf(DirectionalLight);
    expect(effect.props.point).toBeInstanceOf(PointLight);
    expect(effect.props.sun).toBeInstanceOf(SunLight);
    expect(effect.props.camera).toBeInstanceOf(CameraLight);
  });

  test('experimental light names remain registered', () => {
    const props = jsonConverter.convert({
      sun: {'@@type': '_SunLight', timestamp: 1554927200000},
      camera: {'@@type': '_CameraLight'}
    });

    expect(props.sun).toBeInstanceOf(SunLight);
    expect(props.camera).toBeInstanceOf(CameraLight);
  });

  test.each([
    'brightnessContrast',
    'bulgePinch',
    'colorHalftone',
    'denoise',
    'dotScreen',
    'edgeWork',
    'fxaa',
    'hexagonalPixelate',
    'hueSaturation',
    'ink',
    'magnify',
    'noise',
    'sepia',
    'swirl',
    'tiltShift',
    'triangleBlur',
    'vibrance',
    'vignette',
    'zoomBlur'
  ])('hydrates the %s post-processing module', module => {
    const props = jsonConverter.convert({
      effects: [{'@@type': 'PostProcessEffect', module, amount: 0.5}]
    });

    expect(props.effects[0]).toBeInstanceOf(PostProcessEffect);
    expect(props.effects[0].module.name).toBe(module);
    expect(props.effects[0].props).toEqual({amount: 0.5});
  });

  test('rejects unknown post-processing modules', () => {
    expect(() =>
      jsonConverter.convert({
        effects: [{'@@type': 'PostProcessEffect', module: 'unknown'}]
      })
    ).toThrow('Unsupported post-processing module: unknown');
  });

  test('sets up multipass post-processing modules', () => {
    const props = jsonConverter.convert({
      effects: [{'@@type': 'PostProcessEffect', module: 'tiltShift'}]
    });
    const effect = props.effects[0];
    const device = new NullDevice({});

    try {
      effect.setup({device});
      expect(effect.passes).toHaveLength(2);
    } finally {
      effect.cleanup();
      device.destroy();
    }
    expect(effect.passes).toBeUndefined();
  });
});
