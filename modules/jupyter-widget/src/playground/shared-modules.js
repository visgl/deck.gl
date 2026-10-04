// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document, Blob, URL */

// Experimental. Packages bundled into the widget that ES module libraries may import by bare
// specifier. An import map points each specifier at a module that re-exports the widget's own copy,
// so a library built with these packages external shares the widget's deck.gl and luma.gl instead of
// loading a second copy (luma.gl refuses to run with two).
import * as deckCore from '@deck.gl/core';
import * as deckLayers from '@deck.gl/layers';
import * as deckExtensions from '@deck.gl/extensions';
import * as deckAggregationLayers from '@deck.gl/aggregation-layers';
import * as deckGeoLayers from '@deck.gl/geo-layers';
import * as deckMeshLayers from '@deck.gl/mesh-layers';
import * as deckWidgets from '@deck.gl/widgets';
import * as lumaCore from '@luma.gl/core';
import * as lumaEngine from '@luma.gl/engine';
import * as lumaShadertools from '@luma.gl/shadertools';
import * as lumaShadertoolsWgsl from '@luma.gl/shadertools/wgsl';
import * as lumaWebgl from '@luma.gl/webgl';
import * as lumaWebglConstants from '@luma.gl/webgl/constants';
import * as loadersCore from '@loaders.gl/core';
import * as mathCore from '@math.gl/core';

export const SHARED_MODULES = {
  '@deck.gl/core': deckCore,
  '@deck.gl/layers': deckLayers,
  '@deck.gl/extensions': deckExtensions,
  '@deck.gl/aggregation-layers': deckAggregationLayers,
  '@deck.gl/geo-layers': deckGeoLayers,
  '@deck.gl/mesh-layers': deckMeshLayers,
  '@deck.gl/widgets': deckWidgets,
  '@luma.gl/core': lumaCore,
  '@luma.gl/engine': lumaEngine,
  '@luma.gl/shadertools': lumaShadertools,
  '@luma.gl/shadertools/wgsl': lumaShadertoolsWgsl,
  '@luma.gl/webgl': lumaWebgl,
  '@luma.gl/webgl/constants': lumaWebglConstants,
  '@loaders.gl/core': loadersCore,
  '@math.gl/core': mathCore
};

// The re-exporting modules are blob URLs, so they read the namespaces from a global
const REGISTRY_NAME = '__deckJupyterSharedModules';
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

// Installs the import map once per page. A browser applies an import map only to specifiers that no
// module has resolved yet, and before Chrome 133 / Safari 18.4 (Firefox: not yet) only if no module has
// loaded, so this runs before the first ES module library loads. Another widget bundle on the same page
// keeps the first map and registry, since the browser would ignore its remapped specifiers anyway.
export function installSharedModuleImportMap() {
  if (globalThis[REGISTRY_NAME]) {
    return;
  }
  globalThis[REGISTRY_NAME] = SHARED_MODULES;

  const imports = {};
  for (const [specifier, namespace] of Object.entries(SHARED_MODULES)) {
    const names = Object.keys(namespace).filter(
      name => IDENTIFIER.test(name) && name !== 'default'
    );
    const source =
      `const ns = globalThis[${JSON.stringify(REGISTRY_NAME)}][${JSON.stringify(specifier)}];\n` +
      'export default ns;\n' +
      `export const {${names.join(', ')}} = ns;\n`;
    imports[specifier] = URL.createObjectURL(new Blob([source], {type: 'text/javascript'}));
  }

  const script = document.createElement('script');
  script.type = 'importmap';
  script.textContent = JSON.stringify({imports});
  document.querySelector('head').appendChild(script);
}
