import LayersPass from './layers-pass';

export default class DrawLayersPass extends LayersPass {
  // PRIVATE
  getModuleParameters(layer, effects, effectProps) {
    const moduleParameters = super.getModuleParameters(layer, effects, effectProps);
    for (const effect of effects) {
      Object.assign(moduleParameters, effect.getParameters(layer));
    }
    return moduleParameters;
  }
}
