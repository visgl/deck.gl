import BaseLayersPass from './base-layers-pass';

export default class BaseLayerPass extends BaseLayersPass {
  constructor(gl, props) {
    super(gl, props);
  }

  getModuleParameters(layer, pixelRatio) {
    const moduleParameters = Object.assign(
      Object.create(layer.props),
      {
        viewport: layer.context.viewport,
        pickingActive: 0,
        devicePixelRatio: pixelRatio
      },
      this.getObjectHighlightParameters(layer)
    );
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
