import loadArcGISDeckLayer from './arcgis-deck-layer';
import loadArcGISDeckLayerView2D from './arcgis-deck-layer-view-2d';
import loadArcGISDeckExternalRenderer from './arcgis-deck-external-renderer';
import { loadModules } from 'esri-loader';

export function loadArcGISModule(esri) {
  if (esri) {
    return new Promise((resolve) => {
      const Layer = esri.layers.Layer;
      const Collection = esri.core.Collection;
      const BaseLayerViewGL2D = esri.views['2d'].layers.BaseLayerViewGL2D;
      const externalRenderers = esri.views['3d'].externalRenderers;
      const SpatialReference = esri.geometry.SpatialReference;

      const ArcGISDeckLayerView2D = loadArcGISDeckLayerView2D(BaseLayerViewGL2D);
      const ArcGISDeckLayer = loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D);
      const ArcGISDeckExternalRenderer = loadArcGISDeckExternalRenderer(externalRenderers, SpatialReference);

      resolve({
        ArcGISDeckLayerView2D,
        ArcGISDeckLayer,
        ArcGISDeckExternalRenderer
      });
    });
  } else if (window['require'] && window['require'].on) {
    return new Promise((resolve) => {
      window['require']([
        'esri/layers/Layer',
        'esri/core/Collection',
        'esri/views/2d/layers/BaseLayerViewGL2D',
        'esri/views/3d/externalRenderers',
        'esri/geometry/SpatialReference'
      ], (
        Layer,
        Collection,
        BaseLayerViewGL2D,
        externalRenderers,
        SpatialReference
      ) => {
        const ArcGISDeckLayerView2D = loadArcGISDeckLayerView2D(BaseLayerViewGL2D);
        const ArcGISDeckLayer = loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D);
        const ArcGISDeckExternalRenderer = loadArcGISDeckExternalRenderer(externalRenderers, SpatialReference);

        resolve({
          ArcGISDeckLayerView2D,
          ArcGISDeckLayer,
          ArcGISDeckExternalRenderer
        });
      });
    });
  } else {
    return loadModules([
      'esri/layers/Layer',
      'esri/core/Collection',
      'esri/views/2d/layers/BaseLayerViewGL2D',
      'esri/views/3d/externalRenderers',
      'esri/geometry/SpatialReference'
    ]).then(([
      Layer,
      Collection,
      BaseLayerViewGL2D,
      externalRenderers,
      SpatialReference
    ]) => {
      const ArcGISDeckLayerView2D = loadArcGISDeckLayerView2D(BaseLayerViewGL2D);
      const ArcGISDeckLayer = loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D);
      const ArcGISDeckExternalRenderer = loadArcGISDeckExternalRenderer(externalRenderers, SpatialReference);

      return {
        ArcGISDeckLayerView2D,
        ArcGISDeckLayer,
        ArcGISDeckExternalRenderer
      };
    });
  }
}


