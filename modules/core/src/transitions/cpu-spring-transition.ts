// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Transition from './transition';

const EPSILON = 1e-5;

/*
 * Calculate the next value in the spring transition
 * @param prev {Number} - previous value
 * @param cur {Number} - current value
 * @param dest {Number} - destination value
 * @param damping {Number}
 * @param stiffness {Number}
 */
function updateSpringElement(
  prev: number,
  cur: number,
  dest: number,
  damping: number,
  stiffness: number
): number {
  const velocity = cur - prev;
  const delta = dest - cur;
  const spring = delta * stiffness;
  const damper = -velocity * damping;
  return spring + damper + velocity + cur;
}

/*
 * Calculate the next value in the spring transition
 * @param prev {Number|Array} - previous value
 * @param cur {Number|Array} - current value
 * @param dest {Number|Array} - destination value
 * @param damping {Number}
 * @param stiffness {Number}
 */
function updateSpring(prev: number, cur: number, dest: number, damping: number, stiffness: number);
function updateSpring(
  prev: number[],
  cur: number[],
  dest: number[],
  damping: number,
  stiffness: number
): number[];

function updateSpring(
  prev: number | number[],
  cur: number | number[],
  dest: number | number[],
  damping: number,
  stiffness: number
): number | number[] {
  if (Array.isArray(dest)) {
    const next: number[] = [];
    for (let i = 0; i < dest.length; i++) {
      next[i] = updateSpringElement(prev[i], cur[i], dest[i], damping, stiffness);
    }
    return next;
  }
  return updateSpringElement(prev as number, cur as number, dest, damping, stiffness);
}

/*
 * Calculate the distance between two numbers or two vectors
 */
function distance(value1, value2) {
  if (Array.isArray(value1)) {
    let distanceSquare = 0;
    for (let i = 0; i < value1.length; i++) {
      const d = value1[i] - value2[i];
      distanceSquare += d * d;
    }
    return Math.sqrt(distanceSquare);
  }
  return Math.abs(value1 - value2);
}

export default class CPUSpringTransition extends Transition {
  _prevValue;
  _currValue;

  get value() {
    return this._currValue;
  }

  _onUpdate() {
    // TODO - use timeline
    // const {time} = this;

    const {fromValue, toValue, damping, stiffness} = this.settings;
    const {_prevValue = fromValue, _currValue = fromValue} = this;
    let nextValue = updateSpring(_prevValue, _currValue, toValue, damping, stiffness);
    const delta = distance(nextValue, toValue);
    const velocity = distance(nextValue, _currValue);

    if (delta < EPSILON && velocity < EPSILON) {
      nextValue = toValue;
      this.end();
    }

    this._prevValue = _currValue;
    this._currValue = nextValue;
  }
}
