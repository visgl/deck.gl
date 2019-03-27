"use strict";var module1=module;module1.export({default:()=>DrawLayersPass});var LayersPass;module1.link('./layers-pass',{default(v){LayersPass=v}},0);

class DrawLayersPass extends LayersPass {
  // PRIVATE
  getModuleParameters(layer, pixelRatio, effects, effectProps) {
    const moduleParameters = super.getModuleParameters(layer, pixelRatio);
    Object.assign(moduleParameters, this.getObjectHighlightParameters(layer), effectProps);
    for (const effect of effects) {
      Object.assign(moduleParameters, effect.getParameters(layer));
    }
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
}
