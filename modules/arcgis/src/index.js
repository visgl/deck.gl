import { loadModules } from 'esri-loader';
import loadArcGISDeckLayer from './arcgis-deck-layer';
import loadArcGISDeckLayerView2D from './arcgis-deck-layer-view-2d';
import loadArcGISDeckExternalRenderer from './arcgis-deck-external-renderer';

export let loaded;
export let ArcGISDeckLayer;
export let ArcGISDeckExternalRenderer;

loaded = new Promise((resolve) => {
  loadModules(["esri/layers/Layer", "esri/core/Collection", "esri/views/2d/layers/BaseLayerViewGL2D", "esri/views/3d/externalRenderers", "esri/geometry/SpatialReference"]).then(([Layer, Collection, BaseLayerViewGL2D, externalRenderers, SpatialReference]) => {
    const ArcGISDeckLayerView2D = loadArcGISDeckLayerView2D(BaseLayerViewGL2D);
    ArcGISDeckLayer = loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D);
    ArcGISDeckExternalRenderer = loadArcGISDeckExternalRenderer(externalRenderers, SpatialReference);
    resolve();
  });
});