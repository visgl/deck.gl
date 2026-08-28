// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { lerp } from '@math.gl/core';
import Transition from "./transition.js";
export default class CPUInterpolationTransition extends Transition {
    get value() {
        return this._value;
    }
    _onUpdate() {
        const { time, settings: { fromValue, toValue, duration, easing } } = this;
        const t = easing(time / duration);
        this._value = lerp(fromValue, toValue, t);
    }
}
//# sourceMappingURL=cpu-interpolation-transition.js.map