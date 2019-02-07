export default class EffectPreparator {
  constructor(props) {}

  prepareEffects({effects}) {
    const effectProps = {};
    effects.forEach(effect => {
      Object.assign(effectProps, effect.prepare());
    });
  }
}
