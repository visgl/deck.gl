import loadArcGISDeckLayer from './arcgis-deck-layer';
import loadArcGISDeckLayerView2D from './arcgis-deck-layer-view-2d';
import loadArcGISDeckExternalRenderer from './arcgis-deck-external-renderer';

export let ArcGISDeckLayer;
export let ArcGISDeckExternalRenderer;

export function initialize(Layer, Collection, BaseLayerViewGL2D, externalRenderers, SpatialReference) {
  const ArcGISDeckLayerView2D = loadArcGISDeckLayerView2D(BaseLayerViewGL2D);
  ArcGISDeckLayer = loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D);
  ArcGISDeckExternalRenderer = loadArcGISDeckExternalRenderer(externalRenderers, SpatialReference);
}
