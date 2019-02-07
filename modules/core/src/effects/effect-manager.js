export default class EffectManager {
  constructor() {
    this._effects = [];
  }

  addEffect(effect) {
    this._effects.push(effect);
  }

  removeEffect(effect) {
    const i = this._effects.indexOf(effect);
    if (i >= 0) {
      this._effects.splice(i, 1);
      return true;
    }
    return false;
  }

  getEffects() {
    return this._effects;
  }
}
