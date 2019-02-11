export default class EffectManager {
  constructor() {
    this.effects = [];
  }

  setEffects(effects = []) {
    this.effects = effects;
  }

  getEffects() {
    return this.effects;
  }
}
