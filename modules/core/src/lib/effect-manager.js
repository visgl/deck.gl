import {deepEqual} from '../utils/deep-equal';

export default class EffectManager {
  constructor() {
    this.effects = [];
    this._needsRedraw = 'Initial render';
  }

  setProps(props) {
    if ('effects' in props) {
      if (props.effects.length !== this.effects.length || !deepEqual(props.effects, this.effects)) {
        this.setEffects(props.effects);
        this._needsRedraw = 'effects changed';
      }
    }
  }

  needsRedraw(clearRedrawFlags) {
    const redraw = this._needsRedraw;
    if (clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  setEffects(effects = []) {
    this.effects = effects;
  }

  getEffects() {
    return this.effects;
  }
}
