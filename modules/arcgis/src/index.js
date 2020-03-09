import createDeckProps from './deck-props';
import createDeckLayer from './deck-layer';
import createDeckLayerView2D from './deck-layer-view-2d';
import createDeckRenderer from './deck-renderer';
import {loadModules as esriLoaderLoadModules} from 'esri-loader';

let arcGIS = null;

export async function loadArcGISModules(modules, loadScriptOptions) {
  const namespace = Array.isArray(modules) ? null : modules;
  await loadArcGISModule(namespace, loadScriptOptions);

  if (Array.isArray(modules)) {
    return esriLoaderLoadModules(modules, loadScriptOptions).then(array => {
      return {...arcGIS, modules: array};
    });
  }
  return arcGIS;
}

function loadArcGISModule(esri, loadScriptOptions) {
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

  return esriLoaderLoadModules(
    [
      'esri/layers/Layer',
      'esri/core/Accessor',
      'esri/views/2d/layers/BaseLayerViewGL2D',
      'esri/views/3d/externalRenderers'
    ],
    loadScriptOptions
  ).then(([Layer, Accessor, BaseLayerViewGL2D, externalRenderers]) => {
    return initialize(Layer, Accessor, BaseLayerViewGL2D, externalRenderers);
  });
}

function initialize(Layer, Accessor, BaseLayerViewGL2D, externalRenderers) {
  const DeckProps = createDeckProps(Accessor);
  const DeckLayerView2D = createDeckLayerView2D(BaseLayerViewGL2D);
  const DeckLayer = createDeckLayer(DeckProps, Layer, DeckLayerView2D);
  const DeckRenderer = createDeckRenderer(DeckProps, externalRenderers);

  arcGIS = {DeckLayer, DeckRenderer};
  return arcGIS;
}
