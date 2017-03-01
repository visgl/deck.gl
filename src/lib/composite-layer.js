import Layer from './layer';

export default class CompositeLayer extends Layer {
  constructor(props) {
    super(props);
  }

  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  initializeState() {}

  getPickingInfo(opts) {
    // do not call onHover/onClick on the container
    return null;
  }
}
