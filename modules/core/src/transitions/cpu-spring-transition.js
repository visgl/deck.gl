import Transition from './transition';

const EPSILON = 1e-5;

function updateSpringElement(prev, cur, dest, damping, stiffness) {
  const velocity = cur - prev;
  const delta = dest - cur;
  const spring = delta * stiffness;
  const damper = -velocity * damping;
  return spring + damper + velocity + cur;
}

function distance(vector1, vector2) {
  if (Array.isArray(vector1)) {
    let distanceSquare = 0;
    for (let i = 0; i < vector1.length; i++) {
      const d = vector1[i] - vector2[i];
      distanceSquare += d * d;
    }
    return Math.sqrt(distanceSquare);
  }
  return Math.abs(vector1 - vector2);
}

export default class CPUSpringTransition extends Transition {
  get value() {
    return this._currValue;
  }

  update() {
    if (!this._inProgress) {
      return false;
    }

    const {fromValue, toValue, damping, stiffness} = this;
    const {_prevValue = fromValue, _currValue = fromValue} = this;
    let nextValue;

    if (Array.isArray(toValue)) {
      nextValue = [];
      for (let i = 0; i < toValue.length; i++) {
        nextValue[i] = updateSpringElement(
          _prevValue[i],
          _currValue[i],
          toValue[i],
          damping,
          stiffness
        );
      }
    } else {
      nextValue = updateSpringElement(_prevValue, _currValue, toValue, damping, stiffness);
    }

    const delta = distance(nextValue, toValue);
    const velocity = distance(nextValue, _currValue);

    if (delta < EPSILON && velocity < EPSILON) {
      nextValue = toValue;
      this._inProgress = false;
      this.onEnd(this);
    }

    this._prevValue = _currValue;
    this._currValue = nextValue;
    return true;
  }
}
