import {lerp} from 'math.gl';
import {normalizeTransitionSettings} from './attribute-transition-utils';
import Transition from '../transitions/transition';

function getCurrentValue(transition) {
  const {fromValue, toValue, time} = transition;
  return lerp(fromValue, toValue, time);
}

export default class UniformTransitionManager {
  constructor(timeline) {
    this.transitions = new Map();
    this.timeline = timeline;
  }

  get active() {
    return this.transitions.size > 0;
  }

  add(key, fromValue, toValue, settings) {
    const {transitions} = this;
    if (transitions.has(key)) {
      const transition = transitions.get(key);
      // start from interrupted position
      fromValue = getCurrentValue(transition);
      this.remove(key);
    }

    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }
    const transition = new Transition({
      timeline: this.timeline
    });
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
      propsInTransition[key] = getCurrentValue(transition);
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
