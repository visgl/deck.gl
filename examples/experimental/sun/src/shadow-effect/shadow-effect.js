import {Effect} from '@deck.gl/core';
import ShadowPass from './shadow-pass';

export default class ShadowEffect extends Effect {
  constructor(props) {
    super(props);
    const {shadowColor = [0, 0, 0, 255]} = props;
    this.shadowPass = null;
    this.shadowColor = shadowColor;
  }

  prepare(gl, {layers, viewports, onViewportActive, views, effects}) {
    if (!this.shadowPass) {
      this.shadowPass = new ShadowPass(gl);
    }

    this.shadowPass.render({
      layers,
      viewports,
      onViewportActive,
      views,
      effects
    });

    return {
      shadowMap: this.shadowPass.shadowMap,
      shadowColor: this.shadowColor
    };
  }

  cleanup() {
    if (this.shadowPass) {
      this.shadowPass.delete();
      this.shadowPass = null;
    }
  }
}
