// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global window, Blob, URL */
import {test, expect, describe} from 'vitest';

import {CompositeLayer} from '@deck.gl/core';
import {Model} from '@luma.gl/engine';
import {addCustomLibraries} from '@deck.gl/jupyter-widget/playground/create-deck';
import {
  SHARED_MODULES,
  installSharedModuleImportMap
} from '@deck.gl/jupyter-widget/playground/shared-modules';

// A native dynamic import, so the specifier goes through the page's import map rather than Vite
// eslint-disable-next-line no-new-func
const nativeImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string
) => Promise<Record<string, unknown>>;

describe('jupyter-widget: shared modules', () => {
  test('each shared specifier re-exports the widget namespace', async () => {
    installSharedModuleImportMap();
    installSharedModuleImportMap();
    expect(document.querySelectorAll('script[type="importmap"]').length).toBe(1);

    for (const [specifier, namespace] of Object.entries(SHARED_MODULES)) {
      const shared = await nativeImport(specifier);
      for (const name of Object.keys(namespace)) {
        if (name !== 'default') {
          expect(shared[name], `${specifier} exports ${name}`).toBe(namespace[name]);
        }
      }
    }
  });

  test('ES module libraries import deck.gl and luma.gl by package name', async () => {
    const LIBRARY_NAME = 'SharedImportsLibrary';
    const url = URL.createObjectURL(
      new Blob(
        [
          "import {CompositeLayer} from '@deck.gl/core';\n" +
            "import {Model} from '@luma.gl/engine';\n" +
            'export class SharedImportsLayer extends CompositeLayer { renderLayers() { return null; } }\n' +
            'export const SharedModel = Model;\n'
        ],
        {type: 'text/javascript'}
      )
    );
    try {
      await new Promise<void>(resolve =>
        addCustomLibraries([{libraryName: LIBRARY_NAME, resourceUri: url, module: true}], resolve)
      );
      const library = (window as any)[LIBRARY_NAME];
      expect(library.SharedImportsLayer.prototype).toBeInstanceOf(CompositeLayer);
      expect(library.SharedModel).toBe(Model);
    } finally {
      URL.revokeObjectURL(url);
      delete (window as any)[LIBRARY_NAME];
    }
  });
});
