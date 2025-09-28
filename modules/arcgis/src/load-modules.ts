// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import createDeckProps from './deck-props';
import createDeckLayer from './deck-layer';
import createDeckLayerView2D from './deck-layer-view-2d';
import createDeckRenderer from './deck-renderer';
import {loadModules as esriLoaderLoadModules, ILoadScriptOptions} from 'esri-loader';

type LoadedModules = {
  DeckLayer: any;
  DeckRenderer: any;
  modules?: unknown[];
};

let arcGIS: LoadedModules;

export async function loadArcGISModules(
  modules: string[],
  loadScriptOptions: ILoadScriptOptions
): Promise<LoadedModules> {
  const namespace = Array.isArray(modules) ? null : modules;
  await loadArcGISModule(namespace, loadScriptOptions);

  if (Array.isArray(modules)) {
    return esriLoaderLoadModules(modules, loadScriptOptions).then(array => {
      return {...arcGIS, modules: array};
    });
  }
  return arcGIS;
}

async function loadArcGISModule(
  esri,
  loadScriptOptions: ILoadScriptOptions
): Promise<LoadedModules> {
  if (arcGIS) {
    // Already loaded
    return arcGIS;
  }
  if (esri) {
    // Using user-provided dependencies
    // Right now this object has to be manually assembled - let @arcgis/webpack-plugin handle this?
    const Layer = esri.layers.Layer;
    const Accessor = esri.core.Accessor;
    const BaseLayerViewGL2D = esri.views['2d'].layers.BaseLayerViewGL2D;
    const externalRenderers = esri.views['3d'].externalRenderers;

    return initialize(Layer, Accessor, BaseLayerViewGL2D, externalRenderers);
  }

  const [Layer, Accessor, BaseLayerViewGL2D, externalRenderers] = await esriLoaderLoadModules(
    [
      'esri/layers/Layer',
      'esri/core/Accessor',
      'esri/views/2d/layers/BaseLayerViewGL2D',
      'esri/views/3d/externalRenderers'
    ],
    loadScriptOptions
  );
  return initialize(Layer, Accessor, BaseLayerViewGL2D, externalRenderers);
}

function initialize(Layer, Accessor, BaseLayerViewGL2D, externalRenderers): LoadedModules {
  const DeckProps = createDeckProps(Accessor);
  const DeckLayerView2D = createDeckLayerView2D(BaseLayerViewGL2D);
  const DeckLayer = createDeckLayer(DeckProps, Layer, DeckLayerView2D);
  const DeckRenderer = createDeckRenderer(DeckProps, externalRenderers);

  arcGIS = {DeckLayer, DeckRenderer};
  return arcGIS;
}
