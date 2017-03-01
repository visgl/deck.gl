import Layer from './layer';

export default class CompositeLayer extends Layer {
  constructor(props) {
    super(props);
  }

  // Initialize layer is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  initializeLayer(updateParams) {
    // Call subclass lifecycle methods
    this.initializeState();
    this.updateState(updateParams);
    // End subclass lifecycle methods
  }

  getPickingInfo(opts) {
    // do not call onHover/onClick on the container
    return null;
  }
}
