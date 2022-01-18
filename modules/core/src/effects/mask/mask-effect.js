import {Texture2D, ProgramManager} from '@luma.gl/core';
import Effect from '../../lib/effect';
import {Matrix4, Vector3} from '@math.gl/core';

// Class to manage mask effect
export default class MaskEffect extends Effect {
  constructor(props) {
    super(props);
  }

  preRender(gl, {layers, layerFilter, viewports, onViewportActive, views}) {}

  getModuleParameters(layer) {
    return {};
  }

  cleanup() {}
}
