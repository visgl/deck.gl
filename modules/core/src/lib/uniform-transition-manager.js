import {lerp} from 'math.gl';
import {normalizeTransitionSettings} from './attribute-transition-utils';
import Transition from '../transitions/transition';
import log from '../utils/log';

function interpolate(transition) {
  const {fromValue, toValue, time} = transition;
  return lerp(fromValue, toValue, time);
}

function updateSpringElement(prev, cur, dest, damping, stiffness) {
  const velocity = cur - prev;
  const delta = dest - cur;
  const spring = delta * stiffness;
  const damper = -velocity * damping;
  return spring + damper + velocity + cur;
}

function updateSpring(transition) {
  const {prevValue, currValue, toValue, damping, stiffness} = transition;
  let nextValue;
  let delta;

  if (Array.isArray(toValue)) {
    let deltaSquare = 0;
    nextValue = [];
    for (let i = 0; i < toValue.length; i++) {
      nextValue[i] = updateSpringElement(
        prevValue[i],
        currValue[i],
        toValue[i],
        damping,
        stiffness
      );
      const d = toValue[i] - nextValue[i];
      deltaSquare += d * d;
    }
    delta = Math.sqrt(deltaSquare);
  } else {
    nextValue = updateSpringElement(prevValue, currValue, toValue, damping, stiffness);
    delta = Math.abs(toValue - nextValue);
  }

  transition.prevValue = currValue;
  transition.currValue = nextValue;
  transition.inProgress = delta > 1e-5;
  return nextValue;
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
      fromValue = transition.evaluate(transition);
      this.remove(key);
    }

    settings = normalizeTransitionSettings(settings);
    if (!settings) {
      return;
    }

    let transition;
    if (settings.type === 'interpolation') {
      transition = new Transition({
        timeline: this.timeline
      });
      transition.start({
        ...settings,
        evaluate: interpolate,
        fromValue,
        toValue
      });
    } else if (settings.type === 'spring') {
      transition = {
        ...settings,
        evaluate: updateSpring,
        currValue: fromValue,
        prevValue: fromValue,
        toValue
      };
    } else {
      log.error(`unsupported transition type '${settings.type}'`)();
      return;
    }
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
      propsInTransition[key] = transition.evaluate(transition);
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
