import Transition from './transition';
import assert from '../utils/assert';

const DEFAULT_EASING = t => t;

export default class Animation {
  constructor(startValue) {
    this._value = startValue;
    this._time = null;
    this._transition = new Transition({
      onUpdate: this._updateValue.bind(this),
      onEnd: this._next.bind(this)
    });
    this._reset();
  }

  isDone() {
    return this._done;
  }

  get value() {
    return this._value;
  }

  // {value, duration, easing}
  to(keyframe) {
    assert('value' in keyframe && keyframe.duration >= 0);

    this._keyframes.push(keyframe);
    if (this._done) {
      this._next();
    }
    return this;
  }

  loop(times = Infinity) {
    this._loop = times;
    return this;
  }

  cancel() {
    // cancel ongoing transition
    this._transition.cancel();
    this._reset();
    return this;
  }

  update(timestamp) {
    this._time = timestamp;
    if (!this._done) {
      this._transition.update(timestamp);
    }
    return this;
  }

  _reset() {
    this._done = true;
    this._keyframes = [];
    this._interpolate = null;
    this._nextKeyframe = -1;
    this._loop = 0;
  }

  _getInterpolator(startValue, endValue) {
    // Default implementation - no interpolation
    // To be overriden by subclass
    return () => endValue;
  }

  _updateValue({time, startValue, endValue}) {
    this._value = this._interpolate(startValue, endValue, time);
  }

  _next() {
    let index = this._nextKeyframe + 1;
    if (this._loop > 0 && index >= this._keyframes.length) {
      index -= this._keyframes.length;
      this._loop--;
    }
    const keyframe = this._keyframes[index];

    if (keyframe) {
      this._transition.start({
        startValue: this._value,
        endValue: keyframe.value,
        duration: keyframe.duration,
        easing: keyframe.easing || DEFAULT_EASING
      });

      this._nextKeyframe = index;
      this._done = false;
      this._interpolate = this._getInterpolator(this._value, keyframe.value);

      if (this._time !== null) {
        // Start the transition from the last ending time
        this._transition.update(this._time);
      }
    } else {
      this._done = true;
    }
  }
}
