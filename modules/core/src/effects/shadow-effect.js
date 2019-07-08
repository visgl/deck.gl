import Effect from '../lib/effect';
import ShadowPass from '../passes/shadow-pass';
import {Matrix4, Vector3} from 'math.gl';

export default class ShadowEffect extends Effect {
  constructor(props) {
    super(props);
    const {shadowColor = [2, 0, 5, 200], light = null} = props;
    this.shadowPass = null;
    this.shadowColor = shadowColor;
    this.light = light;
    this.projectionMatrix = new Matrix4().ortho({
      left: -1,
      right: 1,
      bottom: 1,
      top: -1,
      near: 0,
      far: 2
    });
    this.viewMatrix = new Matrix4()
      .lookAt({
        eye: new Vector3(this.light.direction).negate()
      })
      // arbitrary number that covers enough grounds
      .scale(1e-3);
  }

  prepare(gl, {layers, viewports, onViewportActive, views, effects, pixelRatio}) {
    if (!this.shadowPass) {
      this.shadowPass = new ShadowPass(gl, {pixelRatio});
    }

    const shadow_viewProjectionMatrix = this.projectionMatrix
      .clone()
      .multiplyRight(this.viewMatrix);

    this.shadowPass.render({
      layers,
      viewports,
      onViewportActive,
      views,
      effects,
      effectProps: {
        shadow_viewProjectionMatrix
      }
    });

    return {
      shadowMap: this.shadowPass.shadowMap,
      shadowColor: this.shadowColor,
      shadow_viewProjectionMatrix
    };
  }

  cleanup() {
    if (this.shadowPass) {
      this.shadowPass.delete();
      this.shadowPass = null;
    }
  }
}
