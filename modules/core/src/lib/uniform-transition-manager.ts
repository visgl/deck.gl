// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {normalizeTransitionSettings} from './attribute/transition-settings';
import CPUInterpolationTransition from '../transitions/cpu-interpolation-transition';
import CPUSpringTransition from '../transitions/cpu-spring-transition';
import log from '../utils/log';

const TRANSITION_TYPES = {
  interpolation: CPUInterpolationTransition,
  spring: CPUSpringTransition
};

export default class UniformTransitionManager {
  transitions = new Map();
  timeline;

  constructor(timeline) {
    this.timeline = timeline;
  }

  get active() {
    return this.transitions.size > 0;
  }

  add(key, fromValue, toValue, settings) {
    const {transitions} = this;
    if (transitions.has(key)) {
      const transition = transitions.get(key);
      // value may not be available if `update()` has not been called. Fallback to `fromValue`
      const {value = transition.settings.fromValue} = transition;
      // start from interrupted position
      fromValue = value;
      this.remove(key);
    }

    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }

    const TransitionType = TRANSITION_TYPES[settings.type];
    if (!TransitionType) {
      log.error(`unsupported transition type '${settings.type}'`)();
      return;
    }
    const transition = new TransitionType(this.timeline);
    transition.start({
      ...settings,
      fromValue,
      toValue
    });
    transitions.set(key, transition);
  }

  remove(key) {
    const {transitions} = this;
    if (transitions.has(key)) {
      transitions.get(key).cancel();
      transitions.delete(key);
    }
  }

  update() {
    const propsInTransition = {};

    for (const [key, transition] of this.transitions) {
      transition.update();
      propsInTransition[key] = transition.value;
      if (!transition.inProgress) {
        // transition ended
        this.remove(key);
      }
    }

    return propsInTransition;
  }

  clear() {
    for (const key of this.transitions.keys()) {
      this.remove(key);
    }
  }
}
