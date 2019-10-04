import LayersPass from './layers-pass';

export default class DrawLayersPass extends LayersPass {
  // PRIVATE
  getModuleParameters(layer, effects) {
    const moduleParameters = {};
    for (const effect of effects) {
      Object.assign(moduleParameters, effect.getParameters(layer));
    }
    return moduleParameters;
  }
}
