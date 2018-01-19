import Stats from './stats';
import assert from 'assert';

export default class LayerState {
  constructor({attributeManager}) {
    assert(attributeManager);
    this.attributeManager = attributeManager;
    this.model = null;
    this.needsRedraw = true;
    this.subLayers = null; // reference to sublayers rendered in a previous cycle
    this.stats = new Stats({id: 'draw'});
    // this.animatedProps = null, // Computing animated props requires layer manager state
  }
}
