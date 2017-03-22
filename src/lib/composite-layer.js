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

  // called to augment the info object that is bubbled up from a sublayer
  // override Layer.getPickingInfo() because decoding / setting uniform do
  // not apply to a composite layer.
  // @return null to cancel event
  getPickingInfo({info}) {
    return info;
  }
}
