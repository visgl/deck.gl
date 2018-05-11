import assert from '../utils/assert';

export default class LayerState {
  constructor({attributeManager}) {
    assert(attributeManager);
    this.attributeManager = attributeManager;
    this.model = null;
    this.needsRedraw = true;
    this.subLayers = null; // reference to sublayers rendered in a previous cycle
  }
}
