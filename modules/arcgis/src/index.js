import { loadModules } from "esri-loader";
import loadArcGISDeckLayer from './arcgis-deck-layer';
import loadArcGISDeckLayerView2D from './arcgis-deck-layer-view-2d';

export let loaded;
export let ArcGISDeckLayer;
export let ArcGISDeckLayerView2D;

loaded = new Promise((resolve) => {
  loadModules(["esri/layers/Layer", "esri/core/Collection", "esri/views/2d/layers/BaseLayerViewGL2D"]).then(([Layer, Collection, BaseLayerViewGL2D]) => {
    ArcGISDeckLayerView2D = loadArcGISDeckLayerView2D(BaseLayerViewGL2D);
    ArcGISDeckLayer = loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D);
    resolve();
  });
});