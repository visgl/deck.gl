// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// eslint-disable-next-line
/* global document, window, global */
import {test, expect, describe, vi} from 'vitest';

import {
  AmbientLight,
  CompositeLayer,
  DirectionalLight,
  LayerExtension,
  LightingEffect,
  PointLight,
  PostProcessEffect,
  _CameraLight as CameraLight,
  _GlobeView as GlobeView,
  _SunLight as SunLight
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension, MaskExtension} from '@deck.gl/extensions';
import {NullDevice} from '@luma.gl/test-utils';
import {addCustomLibraries, jsonConverter} from '@deck.gl/jupyter-widget/playground/create-deck';
import {loadModule} from '@deck.gl/jupyter-widget/playground/utils/script-utils';

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

  test('addCustomLibraries loads ES modules', async () => {
    const LIBRARY_NAME = 'DemoEsmLibrary';
    // Stands in for the `deck` global that an externalized custom build reads its base classes from.
    (window as any).__DemoBaseLayer = CompositeLayer;
    const url = URL.createObjectURL(
      new Blob(
        [
          'export class DemoEsmLayer extends globalThis.__DemoBaseLayer { renderLayers() { return null; } }'
        ],
        {type: 'text/javascript'}
      )
    );
    try {
      await new Promise<void>(resolve =>
        addCustomLibraries([{libraryName: LIBRARY_NAME, resourceUri: url, module: true}], resolve)
      );
      const props = jsonConverter.convert({layers: [{'@@type': 'DemoEsmLayer', data: []}]});
      expect(props.layers[0]).toBeInstanceOf((window as any)[LIBRARY_NAME].DemoEsmLayer);
      expect(props.layers[0]).toBeInstanceOf(CompositeLayer);
    } finally {
      URL.revokeObjectURL(url);
      delete (window as any).__DemoBaseLayer;
    }
  });

  test('addCustomLibraries completes when a library fails to load', async () => {
    const missingModule = `blob:${window.location.origin}/00000000-0000-0000-0000-000000000000`;
    const missingScript = `${window.location.origin}/no-such-custom-library-${Date.now()}.js`;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await new Promise<void>(resolve =>
        addCustomLibraries(
          [
            {libraryName: 'MissingEsmLibrary', resourceUri: missingModule, module: true},
            {libraryName: 'MissingClassicLibrary', resourceUri: missingScript}
          ],
          resolve
        )
      );
      expect(errors).toHaveBeenCalledTimes(2);
    } finally {
      errors.mockRestore();
    }
  });

  test('addCustomLibraries completes when a module throws during evaluation', async () => {
    const url = URL.createObjectURL(
      new Blob(['throw new Error("boom");'], {type: 'text/javascript'})
    );
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await new Promise<void>(resolve =>
        addCustomLibraries(
          [{libraryName: 'ThrowingEsmLibrary', resourceUri: url, module: true}],
          resolve
        )
      );
      expect(errors).toHaveBeenCalledTimes(1);
      expect(String(errors.mock.calls[0][1])).toContain('boom');
    } finally {
      errors.mockRestore();
      URL.revokeObjectURL(url);
    }
  });

  test('a failed custom library can be retried', async () => {
    const LIBRARY_NAME = 'RetryEsmLibrary';
    const missing = `blob:${window.location.origin}/00000000-0000-0000-0000-000000000001`;
    const url = URL.createObjectURL(
      new Blob(['export class RetryEsmLayer { constructor(props) { this.props = props; } }'], {
        type: 'text/javascript'
      })
    );
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await new Promise<void>(resolve =>
        addCustomLibraries(
          [{libraryName: LIBRARY_NAME, resourceUri: missing, module: true}],
          resolve
        )
      );
      expect(errors).toHaveBeenCalledTimes(1);
      expect(
        (window as any)[LIBRARY_NAME],
        'placeholder is removed after a failure'
      ).toBeUndefined();

      await new Promise<void>(resolve =>
        addCustomLibraries([{libraryName: LIBRARY_NAME, resourceUri: url, module: true}], resolve)
      );
      const props = jsonConverter.convert({layers: [{'@@type': 'RetryEsmLayer', id: 'retry'}]});
      expect(props.layers[0]).toBeInstanceOf((window as any)[LIBRARY_NAME].RetryEsmLayer);
    } finally {
      errors.mockRestore();
      URL.revokeObjectURL(url);
    }
  });

  test('loadModule quotes the URL and global name', async () => {
    const url = 'data:text/javascript,export%20const%20Ok%3D1';
    await loadModule(url, 'Quoted"Name</script>');
    const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
    const script = scripts[scripts.length - 1];
    expect(script.textContent).toContain(`await import(${JSON.stringify(url)})`);
    expect(script.textContent).toContain(`window["Quoted\\"Name\\u003c/script>"] = m;`);
    expect(script.textContent).not.toContain('</script>');
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

describe('jupyter-widget: view aliases', () => {
  test('GlobeView canonical alias', () => {
    const props = jsonConverter.convert({
      views: [{'@@type': 'GlobeView', id: 'globe', controller: true}]
    });
    expect(
      props.views[0] instanceof GlobeView,
      'GlobeView @@type hydrates into a GlobeView instance'
    ).toBeTruthy();
  });

  test('_GlobeView experimental name still works', () => {
    const props = jsonConverter.convert({
      views: [{'@@type': '_GlobeView', id: 'globe', controller: true}]
    });
    expect(
      props.views[0] instanceof GlobeView,
      '_GlobeView @@type remains registered for back-compat'
    ).toBeTruthy();
  });
});
