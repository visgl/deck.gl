import {lerp} from 'math.gl';
import Transition from './transition';

export default class CPUInterpolationTransition extends Transition {
  get value() {
    return this._value;
  }

  update() {
    const updated = super.update();

    if (updated) {
      const {fromValue, toValue, time} = this;
      this._value = lerp(fromValue, toValue, time);
    }
    return updated;
  }
}
