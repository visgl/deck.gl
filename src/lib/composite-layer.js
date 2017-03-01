import Layer from './layer';

export default class CompositeLayer extends Layer {
  constructor(props) {
    super(props);
  }

  // Initialize layer is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  initializeLayer() {}

  getPickingInfo(opts) {
    // do not call onHover/onClick on the container
    return null;
  }
}
