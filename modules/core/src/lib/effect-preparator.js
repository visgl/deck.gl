// EffectPreparator prepares effects to generate effect props by feeding layers
// or other resources, and sharing common rendering passes like depth map between them

export default class EffectPreparator {
  constructor(props) {}

  prepareEffects({effects}) {
    const effectProps = {};

    for (const effect of effects) {
      Object.assign(effectProps, effect.prepare());
    }
  }
}
