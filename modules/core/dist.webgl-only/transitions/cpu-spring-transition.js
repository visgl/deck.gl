// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Transition from "./transition.js";
const EPSILON = 1e-5;
/*
 * Calculate the next value in the spring transition
 * @param prev {Number} - previous value
 * @param cur {Number} - current value
 * @param dest {Number} - destination value
 * @param damping {Number}
 * @param stiffness {Number}
 */
function updateSpringElement(prev, cur, dest, damping, stiffness) {
    const velocity = cur - prev;
    const delta = dest - cur;
    const spring = delta * stiffness;
    const damper = -velocity * damping;
    return spring + damper + velocity + cur;
}
function updateSpring(prev, cur, dest, damping, stiffness) {
    if (Array.isArray(dest)) {
        const next = [];
        for (let i = 0; i < dest.length; i++) {
            next[i] = updateSpringElement(prev[i], cur[i], dest[i], damping, stiffness);
        }
        return next;
    }
    return updateSpringElement(prev, cur, dest, damping, stiffness);
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
    get value() {
        return this._currValue;
    }
    _onUpdate() {
        // TODO - use timeline
        // const {time} = this;
        const { fromValue, toValue, damping, stiffness } = this.settings;
        const { _prevValue = fromValue, _currValue = fromValue } = this;
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
//# sourceMappingURL=cpu-spring-transition.js.map