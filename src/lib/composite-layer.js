import Layer from './layer';

export default class CompositeLayer extends Layer {
  constructor(props) {
    super(props);
  }

  // initializeState is usually not needed for composite layers
  // Provide empty definition to disable check for missing definition
  initializeState() {
  }

  // No-op for the invalidateAttribute function as the composite
  // layer has no AttributeManager
  invalidateAttribute() {
  }

  getPickingInfo({info}) {
    return info;
  }
}
