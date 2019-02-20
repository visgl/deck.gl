import LayersPass from './layers-pass';
import {projectPosition} from '../shaderlib/project/project-functions';
import {COORDINATE_SYSTEM} from '../lib';
import {PointLight as BasePointLight} from 'luma.gl';

export default class DrawLayersPass extends LayersPass {
  // PRIVATE
  getModuleParameters(layer, pixelRatio, effectProps) {
    const moduleParameters = super.getModuleParameters(layer, pixelRatio);
    const effectParameters = this.getEffectParameters(
      layer.context.viewport,
      layer.props.coordinateSystem,
      layer.props.coordinateOrigin,
      effectProps
    );
    Object.assign(moduleParameters, this.getObjectHighlightParameters(layer), effectParameters);
    return moduleParameters;
  }

  /**
   * Returns the picking color of currenlty selected object of the given 'layer'.
   * @return {Array} - the picking color or null if layers selected object is invalid.
   */
  getObjectHighlightParameters(layer) {
    // TODO - inefficient to update settings every render?
    // TODO: Add warning if 'highlightedObjectIndex' is > numberOfInstances of the model.
    const {highlightedObjectIndex, highlightColor} = layer.props;
    const parameters = {
      pickingHighlightColor: [
        highlightColor[0],
        highlightColor[1],
        highlightColor[2],
        highlightColor[3] || 255
      ]
    };

    // Update picking module settings if highlightedObjectIndex is set.
    // This will overwrite any settings from auto highlighting.
    if (Number.isInteger(highlightedObjectIndex)) {
      parameters.pickingSelectedColor =
        highlightedObjectIndex >= 0 ? layer.encodePickingColor(highlightedObjectIndex) : null;
    }
    return parameters;
  }

  // Pre-project point light positions here
  getEffectParameters(viewport, coordinateSystem, coordinateOrigin, effectProps) {
    if (effectProps && effectProps.lightSources) {
      const {pointLights} = effectProps.lightSources;
      const projectedPointLights = [];

      for (let i = 0; i < pointLights.length; i++) {
        const pointLight = pointLights[i];
        const position = projectPosition(pointLight.position, {
          viewport,
          coordinateSystem,
          coordinateOrigin,
          fromCoordinateSystem: viewport.isGeospatial
            ? COORDINATE_SYSTEM.LNGLAT
            : COORDINATE_SYSTEM.IDENTITY,
          fromCoordinateOrigin: [0, 0, 0]
        });
        projectedPointLights.push(
          new BasePointLight({
            color: pointLight.color,
            intensity: pointLight.intensity,
            position
          })
        );
      }
      if (projectedPointLights.length > 0) {
        effectProps.lightSources.pointLights = projectedPointLights;
      }
    }
    return effectProps;
  }
}
