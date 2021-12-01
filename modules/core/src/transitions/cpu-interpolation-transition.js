import {lerp} from '@math.gl/core';
import Transition from './transition';

export default class CPUInterpolationTransition extends Transition {
  get value() {
    return this._value;
  }

  _onUpdate() {
    const {
      time,
      settings: {fromValue, toValue, duration, easing}
    } = this;
    const t = easing(time / duration);
    this._value = lerp(fromValue, toValue, t);
  }
}
